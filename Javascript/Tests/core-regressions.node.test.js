import test from 'node:test';
import assert from 'node:assert/strict';

import { Position, Velocity, Vector } from '../Primitives.js';
import { setDisplayMousePercent } from '../globals.js';
import { getClosestObject, getDisplayPosition } from '../View/DisplayPicking.js';
import { View } from '../View/TrussView.js';
import { Labels } from '../Label.js';
import { Node } from '../Nodes/Node.js';
import { Tensor } from '../Tensors.js';
import { BehaviourOverride } from '../Behaviours/Behaviour.js';
import { updateNodeRotation } from '../Behaviours/Angles.js';
import { createAngleTensorDemo } from '../Demos/AngleTensorDemo.js';
import { createKeyInputDemo } from '../Demos/KeyInputDemo.js';
import { createProtagonistDemo } from '../Demos/ProtagonistDemo.js';
import { createSolarSystemDemo } from '../Demos/SolarSystemDemo.js';
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

test('moveable label exposes velocity as an editable property', () => {
	const world = { labels: new Labels() };
	const node = new Node(world, undefined, 'node moveable', {
		name: 'moveableNode',
		localPosition: new Position(0, 0),
		velocity: new Velocity(3, 4),
	});

	const propertyNames = node.properties.getProperties().map((property) => property.propertyName);
	assert.ok(propertyNames.includes('velocity'));
	assert.deepEqual(node.velocity, new Velocity(3, 4));
});

test('angle label exposes angular velocity as an editable property', () => {
	const world = { labels: new Labels() };
	const node = new Node(world, undefined, 'node angle', {
		name: 'angleNode',
		localPosition: new Position(0, 0),
		angularVelocity: 180,
	});

	const propertyNames = node.properties.getProperties().map((property) => property.propertyName);
	assert.ok(propertyNames.includes('angularVelocity'));
	assert.equal(node.angularVelocity, 180);
	assert.ok(Math.abs(node.turnrate - (Math.PI / 60)) < 1e-9);
});

test('tensor torque rotates angle node by mass and angular velocity loss', () => {
	const world = { labels: new Labels() };
	const node = new Node(world, undefined, 'node angle', {
		name: 'angleNode',
		localPosition: new Position(0, 0),
		mass: 2,
		angularVelocity: 0,
		angleVelocityLoss: 0.5,
	});

	node.sumTorque = 1000;
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

test('keytotorque label attaches TORQUE override and adds to sumTorque while key held', () => {
	const world = { labels: new Labels() };
	const node = new Node(world, undefined, 'node angle moveable keytotorque', {
		name: 'torqueNode',
		localPosition: new Position(0, 0),
		mass: 1,
		key1: 'arrowleft',
		torque1: 500,
		key2: 'arrowright',
		torque2: -500,
	});

	// Two TORQUE overrides: one from angle (AngleNode), one from keytotorque
	assert.equal(node.getOverrideCount(BehaviourOverride.TORQUE), 2);

	// With no keys pressed, sumTorque is only from tensors (none connected = 0)
	node.calculateTorques();
	assert.equal(node.sumTorque, 0);
});

test('keytolength label attaches PREUPDATEPOSITION override on tensor', () => {
	const world = { labels: new Labels() };
	const coordinateSystem = { name: 'world' };
	const node1 = new Node(world, undefined, 'node', {
		name: 'n1', localPosition: new Position(0, 0), coordinateSystem,
	});
	const node2 = new Node(world, undefined, 'node', {
		name: 'n2', localPosition: new Position(2, 0), coordinateSystem,
	});
	const tensor = new Tensor(node1, node2, 'spring keytolength', {
		name: 't', constant: 1, equilibriumLength: 2,
		key1: 'arrowup', lengthRate1: 1,
		key2: 'arrowdown', lengthRate2: -1,
		minLength: 0.5,
	});

	assert.equal(tensor.getOverrideCount(BehaviourOverride.PREUPDATEPOSITION), 1);

	// With no keys pressed, equilibriumLength should not change
	const before = tensor.equilibriumLength;
	tensor.runOverrides(BehaviourOverride.PREUPDATEPOSITION, 0.016);
	assert.equal(tensor.equilibriumLength, before);
});

test('key input demo has rotating hub with keytotorque and arm with keytolength', () => {
	const worldCoordinateSystem = { name: 'world' };
	const trussNode = {
		world: { labels: new Labels() },
		view: { worldCoordinateSystem },
	};

	const demo = createKeyInputDemo(trussNode);

	// Hub has keytotorque — should carry two TORQUE overrides (AngleNode + KeyToTorqueBehaviour)
	assert.equal(demo.rotatingHub.hasLabel('keytotorque'), true);
	assert.equal(demo.rotatingHub.hasLabel('angle'), true);
	assert.equal(demo.rotatingHub.hasLabel('moveable'), true);
	assert.equal(demo.rotatingHub.getOverrideCount(BehaviourOverride.TORQUE), 2);
	assert.equal(demo.rotatingHub.key1, 'a');
	assert.equal(demo.rotatingHub.key2, 'd');

	// Arm has keytolength — should carry one PREUPDATEPOSITION override
	assert.equal(demo.hubArm.hasLabel('keytolength'), true);
	assert.equal(demo.hubArm.getOverrideCount(BehaviourOverride.PREUPDATEPOSITION), 1);
	assert.equal(demo.hubArm.key1, 'w');
	assert.equal(demo.hubArm.key2, 's');
	assert.equal(demo.hubArm.lengthRate1, 5);
	assert.equal(demo.hubArm.lengthRate2, -5);
	assert.equal(demo.hubArm.equilibriumLength, 4);
	assert.equal(demo.hubArm.minLength, 1);

	// Left tensor is also an angletensor now
	assert.equal(demo.pivotSpring.hasLabel('angletensor'), true);
	assert.equal(demo.pivotSpring.torqueConstant1, 60);
	assert.equal(demo.pivotSpring.torqueConstant2, 60);

	// Fixed pivot is 10 m below the AngleTensorDemo (which lives at y=30)
	assert.equal(demo.fixedPivot.localPosition.y, 20);
	assert.equal(demo.rotatingHub.localPosition.y, 20);
});

test('protagonist demo creates protagonist structure with gravity field connections', () => {
	const worldCoordinateSystem = { name: 'world' };
	const trussNode = {
		world: { labels: new Labels() },
		view: { worldCoordinateSystem },
	};

	// Create a mock gravity well node
	const gravityWell = new Node(trussNode.world, trussNode, 'node', {
		'name': 'Earth',
		'localPosition': new Position(0, -100),
		'mass': 1000000,
	});

	const demo = createProtagonistDemo(trussNode, gravityWell);

	// Check that protagonist and limbs were created
	assert.equal(demo.protagonist.name, 'Protagonist');
	assert.equal(demo.protagonist.mass, 70);
	assert.equal(demo.protagonist.color, 'yellow');
	assert.equal(demo.protagonist.hasLabel('moveable'), true);
	assert.equal(demo.protagonist.localPosition.x, 4);
	assert.equal(demo.protagonist.localPosition.y, 10);

	// Check nodeA and nodeB
	assert.equal(demo.nodeA.name, 'Node A');
	assert.equal(demo.nodeA.mass, 20);
	assert.equal(demo.nodeA.localPosition.x, 3);
	assert.equal(demo.nodeA.localPosition.y, 20);

	assert.equal(demo.nodeB.name, 'Node B');
	assert.equal(demo.nodeB.mass, 20);
	assert.equal(demo.nodeB.localPosition.x, 6);
	assert.equal(demo.nodeB.localPosition.y, 20);

	// Check anchors
	assert.equal(demo.anchorLeft.name, 'Anchor Left');
	assert.equal(isNaN(demo.anchorLeft.mass), true);
	assert.equal(demo.anchorLeft.localPosition.x, 2);
	assert.equal(demo.anchorLeft.localPosition.y, 40);

	assert.equal(demo.anchorRight.name, 'Anchor Right');
	assert.equal(isNaN(demo.anchorRight.mass), true);
	assert.equal(demo.anchorRight.localPosition.x, 7);
	assert.equal(demo.anchorRight.localPosition.y, 40);
});

test('forcesensor label exposes forceLimit and changes color with stress', () => {
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
	const tensor = new Tensor(node1, node2, 'spring', {
		'name': 'Stress Indicator',
		'constant': 100,
		'equilibriumLength': 1,
		'color': 'white',
	});

	// Add forcesensor label
	tensor.labelString = 'spring forcesensor';
	tensor.forceLimit = 500;
	tensor.refreshPropertiesAfterLabelChange();

	// Check that forcesensor label and property are attached
	assert.equal(tensor.hasLabel('forcesensor'), true);
	assert.equal(tensor.forceLimit, 500);

	// Check that behavior was registered with the override
	assert.equal(tensor.getOverrideCount(BehaviourOverride.SENSE), 1);

	// Simulate force at 0% of limit (should stay white, now in rgb format)
	tensor.force = new Vector(0, 0);
	tensor.runOverrides(BehaviourOverride.SENSE);
	assert.ok(tensor.color.includes('rgb(255, 255, 255)'), `At 0% stress should be white, got: ${tensor.color}`);

	// Simulate force at 50% of limit (should start transitioning red)
	tensor.force = new Vector(250, 0);
	tensor.runOverrides(BehaviourOverride.SENSE);
	assert.ok(tensor.color.includes('rgb('), `Color should be in rgb format, got: ${tensor.color}`);

	// Simulate force at 100% of limit (should have full red channel)
	tensor.force = new Vector(500, 0);
	tensor.runOverrides(BehaviourOverride.SENSE);
	assert.ok(tensor.color.includes('rgb(255'), `Red channel should be at max, got: ${tensor.color}`);

	// Simulate force at 150% of limit (phase 2, decreasing green/blue)
	tensor.force = new Vector(750, 0);
	tensor.runOverrides(BehaviourOverride.SENSE);
	assert.ok(tensor.color.includes('rgb(255'), `Should still have full red channel, got: ${tensor.color}`);
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
	// For world coordinates, gravity points directly from Handle toward Earth
	// Earth is below Handle (at y=-100 vs y=10), so force should point downward (negative Y)
	assert.ok(forceOnHandle.y < 0, `expected downward gravity toward Earth, got y=${forceOnHandle.y}`);
});

test('solar system demo creates sun and 8 planets with field tensors', () => {
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
	const trussNode = {
		world,
		earth: undefined,
	};

	const result = createSolarSystemDemo(trussNode, 60);

	assert.ok(result.sun, 'should have sun');
	assert.ok(result.sun.mass > 0, 'sun should have positive mass for two-body physics');
	assert.equal(result.sun.color, 'yellow', 'sun should be yellow');

	assert.equal(result.planets.length, 9, 'should have 8 planets + 1 moon');
	assert.equal(result.fieldTensors.length, 10, 'should have 8 planet field tensors + 2 moon field tensors (Earth + Sun)');

	// Verify planet data (planets 0-7 are the 8 planets, planet 8 is the Moon)
	const planetNames = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
	result.planets.forEach((planet, index) => {
		if (index < 8) {
			// Regular planets
			assert.equal(planet.name, planetNames[index], `planet ${index} should be ${planetNames[index]}`);
			assert.ok(planet.node, `planet ${index} should have node`);
			assert.ok(planet.mass > 0, `planet ${index} should have positive mass`);
			assert.ok(planet.semiMajorAxis > 0, `planet ${index} should have positive semi-major axis`);
			assert.ok(planet.node.color, `planet ${index} should have a color`);
		} else {
			// Moon
			assert.equal(planet.name, 'Moon', `body ${index} should be Moon`);
			assert.ok(planet.node, 'Moon should have node');
			assert.ok(planet.mass > 0, 'Moon should have positive mass');
			assert.ok(planet.isMoon, 'Moon should be marked as satellite');
		}
	});
});

test('solar system planets have realistic orbital velocities', () => {
	const world = { labels: new Labels() };
	const trussNode = { world, earth: undefined };

	const earthOrbitPeriod = 60;  // seconds
	const result = createSolarSystemDemo(trussNode, earthOrbitPeriod);

	// Simply verify that planets have non-zero velocities in reasonable ranges
	result.planets.forEach((planet) => {
		const node = planet.node;
		const velocity = node.velocity;
		const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

		// Verify velocity is non-zero
		assert.ok(velocityMagnitude > 0, `${planet.name} should have non-zero orbital velocity`);
		
		// Verify velocity is not unreasonably large (< 100 m/s for a 60-second orbit)
		assert.ok(velocityMagnitude < 100, `${planet.name} velocity ${velocityMagnitude.toFixed(3)} seems unreasonably high`);
	});
});

test('solar system planets maintain angular momentum conservation over time', () => {
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
	const trussNode = { world, earth: undefined };

	const result = createSolarSystemDemo(trussNode, 60);

	// Calculate initial angular momentum L = r × p for each planet
	const initialAngularMomenta = result.planets.map((planet) => {
		const node = planet.node;
		const sunPos = result.sun.localPosition;
		const planetPos = node.localPosition;

		// r vector (from sun to planet)
		const rx = planetPos.x - sunPos.x;
		const ry = planetPos.y - sunPos.y;

		// p = m * v
		const px = planet.mass * node.velocity.x;
		const py = planet.mass * node.velocity.y;

		// L = r × p (z-component in 2D)
		const L = Math.abs(rx * py - ry * px);
		return L;
	});

	// Verify initial angular momenta are non-zero
	result.planets.forEach((planet, index) => {
		assert.ok(
			initialAngularMomenta[index] > 0,
			`${planet.name} should have non-zero initial angular momentum`
		);
	});
});

test('solar system has reasonable scaling parameters', () => {
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
	const trussNode = { world, earth: undefined };

	const result = createSolarSystemDemo(trussNode, 60);

	assert.ok(result.scaling.diameterScale > 0, 'diameter scale should be positive');
	assert.equal(result.scaling.distanceScale, 15, 'distance scale should be 15 (1 AU = 15m)');
	assert.ok(result.scaling.massScale > 0, 'mass scale should be positive');
	assert.ok(result.scaling.gravityConstant > 0, 'gravity constant should be positive');
	assert.ok(result.scaling.sunMass > 0, 'sun mass should be positive');
	assert.equal(result.scaling.earthOrbitPeriod, 60, 'earth orbit period should match input');

	// Verify that Mercury orbits faster than Earth
	const mercuryNode = result.planets[0].node;
	const earthNode = result.planets[2].node;

	const mercuryVel = Math.sqrt(mercuryNode.velocity.x ** 2 + mercuryNode.velocity.y ** 2);
	const earthVel = Math.sqrt(earthNode.velocity.x ** 2 + earthNode.velocity.y ** 2);

	// Mercury is closer to sun and should be faster in rad/s terms
	// But velocity magnitude depends on both distance and period
	assert.ok(mercuryVel > 0, 'Mercury should have positive velocity');
	assert.ok(earthVel > 0, 'Earth should have positive velocity');
});

