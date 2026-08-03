import test from 'node:test';
import assert from 'node:assert/strict';

import { Position } from '../Primitives.js';
import { setDisplayMousePercent } from '../globals.js';
import { getClosestObject, getDisplayPosition } from '../View/DisplayPicking.js';
import { View } from '../View/TrussView.js';
import { Labels } from '../Label.js';
import { Node } from '../Nodes/Node.js';
import { Tensor } from '../Tensors.js';
import { BehaviourOverride } from '../Behaviours/Behaviour.js';
import { updateNodeRotation } from '../Behaviours/Angles.js';
import { createAngleTensorDemo } from '../AngleTensorDemo.js';
import { GRAVITY_FIELD_CONSTANT } from '../Gravity.js';

function makeView() {
	return {
		screenSize: { x: 1000, y: 1000 },
		x(position) {
			return position.x * 10;
		},
		y(position) {
			return 1000 - position.y * 10;
		},
	};
}

function makeWorldNode(name, x, y) {
	return {
		name,
		localPosition: new Position(x, y),
		getPosition() {
			return this.localPosition;
		},
		coordinateSystem: {
			isDisplay() {
				return false;
			},
		},
	};
}

function makeDisplayNode(name, x, y) {
	return {
		name,
		localPosition: new Position(x, y),
		getPosition() {
			return this.localPosition;
		},
		coordinateSystem: {
			isDisplay() {
				return true;
			},
		},
	};
}

function makePicker(nodes, tensors = []) {
	return {
		nodes,
		tensors,
		view: makeView(),
		selector: undefined,
	};
}

test('projects world objects onto display percentages for picking', () => {
	const node = makeWorldNode('world-node', 50, 50);
	const picker = makePicker([node]);

	assert.deepEqual(getDisplayPosition(picker, node), new Position(50, 50));

	setDisplayMousePercent(50.5, 50.5);
	assert.equal(getClosestObject(picker, 3), node);
});

test('uses display node percentages directly for picking', () => {
	const node = makeDisplayNode('display-node', 25, 75);
	const picker = makePicker([node]);

	assert.deepEqual(getDisplayPosition(picker, node), new Position(25, 75));

	setDisplayMousePercent(24, 76);
	assert.equal(getClosestObject(picker, 3), node);
});

test('excludes the active selector from hover and selection picking', () => {
	const selector = makeWorldNode('Selector', 50, 50);
	const realNode = makeWorldNode('real-node', 50.1, 50.1);
	const picker = makePicker([selector, realNode]);
	picker.selector = selector;

	setDisplayMousePercent(50, 50);
	assert.equal(getClosestObject(picker, 3), realNode);
});

function makeZoomView() {
	const view = {
		offset: { x: 0, y: 100 },
		screenSize: { x: 1000, y: 1000 },
		elemRectleft: 100,
		elemRecttop: 50,
		worldPosition: View.prototype.worldPosition,
		worldPositionWithOffset: View.prototype.worldPositionWithOffset,
		updateScale: View.prototype.updateScale,
		recalculate() {
			this.xScale = this.worldViewSize.x / this.screenSize.x;
			this.yScale = this.worldViewSize.y / this.screenSize.y;
		},
	};

	const worldViewSize = {};
	let worldX = 100;
	let worldY = 100;
	Object.defineProperty(worldViewSize, 'x', {
		get() {
			return worldX;
		},
		set(value) {
			worldX = value;
			view.recalculate();
		},
	});
	Object.defineProperty(worldViewSize, 'y', {
		get() {
			return worldY;
		},
		set(value) {
			worldY = value;
			view.recalculate();
		},
	});
	view.worldViewSize = worldViewSize;
	view.recalculate();
	return view;
}

test('zooming around a local screen point keeps the same world point under the cursor', () => {
	const view = makeZoomView();
	const localPoint = { x: 500, y: 500 };
	const before = view.worldPosition(localPoint.x, localPoint.y);

	view.updateScale({ x: 0.1, y: 0.1 }, localPoint);

	const after = view.worldPosition(localPoint.x, localPoint.y);
	assert.ok(Math.abs(after.x - before.x) < 1e-9, `x drifted from ${before.x} to ${after.x}`);
	assert.ok(Math.abs(after.y - before.y) < 1e-9, `y drifted from ${before.y} to ${after.y}`);
});

test('angletensor label exposes editable angle tensor properties', () => {
	const world = { labels: new Labels() };
	const coordinateSystem = { name: 'world' };
	const node1 = new Node(world, undefined, 'node', {
		name: 'node1',
		localPosition: new Position(0, 0),
		coordinateSystem,
	});
	const node2 = new Node(world, undefined, 'node', {
		name: 'node2',
		localPosition: new Position(1, 0),
		coordinateSystem,
	});
	const tensor = new Tensor(node1, node2, 'spring', { name: 'testTensor' });

	let propertyNames = tensor.properties.getProperties().map((property) => property.propertyName);
	assert.equal(tensor.hasLabel('angletensor'), false);
	assert.equal(propertyNames.includes('degree1'), false);
	assert.equal(propertyNames.includes('torqueConstant1'), false);

	tensor.labelString = 'spring angletensor';
	tensor.refreshPropertiesAfterLabelChange();

	propertyNames = tensor.properties.getProperties().map((property) => property.propertyName);
	assert.equal(tensor.hasLabel('angletensor'), true);
	assert.ok(propertyNames.includes('degree1'));
	assert.ok(propertyNames.includes('degree2'));
	assert.ok(propertyNames.includes('torqueConstant1'));
	assert.ok(propertyNames.includes('torqueConstant2'));
	assert.equal(tensor.degree1, 0);
	assert.equal(tensor.degree2, 0);
	assert.equal(tensor.torqueConstant1, 1);
	assert.equal(tensor.torqueConstant2, 1);
});

test('label behaviour registry attaches and detaches overrides on label changes', () => {
	const world = { labels: new Labels() };
	const coordinateSystem = { name: 'world' };
	const node1 = new Node(world, undefined, 'node angle', {
		name: 'node1',
		localPosition: new Position(0, 0),
		coordinateSystem,
	});
	const node2 = new Node(world, undefined, 'node', {
		name: 'node2',
		localPosition: new Position(2, 0),
		coordinateSystem,
	});
	const tensor = new Tensor(node1, node2, 'spring', {
		name: 'testTensor',
		constant: 1,
		equilibriumLength: 1,
	});

	assert.equal(node1.getOverrideCount(BehaviourOverride.TORQUE), 1);
	assert.equal(node1.getOverrideCount(BehaviourOverride.ROTATE), 1);
	assert.equal(tensor.getOverrideCount(BehaviourOverride.CALCULATE), 1);
	assert.equal(tensor.runOverrides(BehaviourOverride.CALCULATE).length, 1);

	tensor.labelString = 'tensor';
	tensor.refreshPropertiesAfterLabelChange();
	node1.labelString = 'node';
	node1.refreshPropertiesAfterLabelChange();

	assert.equal(tensor.getOverrideCount(BehaviourOverride.CALCULATE), 0);
	assert.equal(tensor.runOverrides(BehaviourOverride.CALCULATE).length, 0);
	assert.equal(node1.getOverrideCount(BehaviourOverride.TORQUE), 0);
	assert.equal(node1.getOverrideCount(BehaviourOverride.ROTATE), 0);
});

test('angle label exposes angular damping instead of node torque stiffness', () => {
	const world = { labels: new Labels() };
	const node = new Node(world, undefined, 'node angle', {
		name: 'angleNode',
		localPosition: new Position(0, 0),
		mass: 2,
	});

	const propertyNames = node.properties.getProperties().map((property) => property.propertyName);
	assert.ok(propertyNames.includes('degree'));
	assert.ok(propertyNames.includes('angleVelocityLoss'));
	assert.equal(propertyNames.includes('torqueConstant'), false);
	assert.equal(node.angleVelocityLoss, 0.9999);
});

test('tensor torque rotates angle node by mass and angular velocity loss', () => {
	const world = { labels: new Labels() };
	const node = new Node(world, undefined, 'node angle', {
		name: 'angleNode',
		localPosition: new Position(0, 0),
		mass: 2,
		angleVelocityLoss: 0.5,
	});

	node.sumTorque = 1000;
	node.turnrate = 0;
	node.angle = 0;
	updateNodeRotation(node);

	assert.equal(node.turnrate, 0.25);
	assert.equal(node.angle, 0.25);
});

test('experimental truss angle tensor demo has fixed support, angle center, and moveable handle', () => {
	const worldCoordinateSystem = { name: 'world' };
	const trussNode = {
		world: { labels: new Labels() },
		view: { worldCoordinateSystem },
	};

	const demo = createAngleTensorDemo(trussNode);

	assert.equal(demo.leftSupport.hasLabel('moveable'), false);
	assert.equal(demo.leftSupport.hasLabel('angle'), true);
	assert.equal(Number.isNaN(demo.leftSupport.mass), true);
	assert.equal(demo.angleNode.hasLabel('angle'), true);
	assert.equal(demo.angleNode.hasLabel('moveable'), true);
	assert.equal(demo.angleNode.mass, 30);
	assert.equal(demo.angleNode.velocityLoss, 0.999);
	assert.equal(demo.angleNode.angleVelocityLoss, 0.95);
	assert.equal(demo.moveableHandle.hasLabel('moveable'), true);
	assert.equal(demo.moveableHandle.mass, 8);

	assert.equal(demo.leftAngleTensor.hasLabel('angletensor'), true);
	assert.equal(demo.rightAngleTensor.hasLabel('angletensor'), true);
	assert.equal(demo.leftAngleTensor.node2, demo.angleNode);
	assert.equal(demo.rightAngleTensor.node1, demo.angleNode);
	assert.equal(demo.leftAngleTensor.degree1, 0);
	assert.equal(demo.leftAngleTensor.degree2, 180);
	assert.equal(demo.rightAngleTensor.degree1, 0);
	assert.equal(demo.leftAngleTensor.torqueConstant1, 90);
	assert.equal(demo.leftAngleTensor.torqueConstant2, 90);
	assert.equal(demo.rightAngleTensor.torqueConstant1, 90);
});

test('gravitywell owns mass while gravity field owns attraction constant', () => {
	const coordinateSystem = {
		name: 'world',
		calculateDistance(node1, node2) {
			return Math.sqrt(this.calculateDistanceSquared(node1, node2));
		},
		calculateDistanceSquared(node1, node2) {
			return Math.pow(node2.localPosition.x - node1.localPosition.x, 2) +
				Math.pow(node2.localPosition.y - node1.localPosition.y, 2);
		},
	};
	const world = { labels: new Labels() };
	const earth = new Node(world, undefined, 'gravitywell node', {
		name: 'Earth',
		localPosition: new Position(0, -100),
		mass: 1000000,
		coordinateSystem,
	});
	const handle = new Node(world, undefined, 'node moveable', {
		name: 'Handle',
		localPosition: new Position(0, 10),
		mass: 1,
		coordinateSystem,
	});
	const gravity = new Tensor(earth, handle, 'gravity field', {
		constant: GRAVITY_FIELD_CONSTANT,
	});

	assert.equal(earth.constant, undefined);
	assert.equal(gravity.constant, GRAVITY_FIELD_CONSTANT);

	gravity.calculateForceField();
	const forceOnHandle = gravity.getForce(handle);
	assert.ok(forceOnHandle.y < 0, `expected downward gravity, got y=${forceOnHandle.y}`);
});
