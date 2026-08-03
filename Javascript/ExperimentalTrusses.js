import { TrussNode } from './Nodes/TrussNode.js';
import { Node } from './Nodes/Node.js';
import { Tensor } from './Tensors.js';
import { Selector } from './Nodes/Sensors.js';
import { Position } from './Primitives.js';
import { createAngleTensorDemo } from './AngleTensorDemo.js';
import { EARTH_CENTER, EARTH_MASS, GRAVITY_FIELD_CONSTANT } from './Gravity.js';

/**
 * Coordinate System Reference:
 * - World coordinates use mathematical convention: origin at lower-left
 * - Positive Y = UP, Negative Y = DOWN
 * - Earth (gravity well) must be at NEGATIVE Y to pull objects downward
 * - See COORDINATE-SYSTEMS.md for detailed explanation
 *
 * Field Tensor Behavior:
 * - Positive constant = REPULSION (pushes objects away)
 * - Negative constant = ATTRACTION (pulls objects toward)
 * - Force calculation: force = -(constant * m1 * m2 / r²) * direction
 * - The negative sign is applied in FieldCalculator.calculate()
 * - For gravity: use NEGATIVE constant so that positive field math gives attraction
 */
/**
 * @param  {TrussNode} trussNode
 */
function createDefaultPerformanceScene(trussNode) {
	if (!trussNode.world) {
		return;
	}

	trussNode.selector = new Selector(trussNode.world, trussNode, 'selector', {
		'name': 'Selector',
		'localPosition': new Position(1, 1),
	});
	trussNode.sensorNodes = [trussNode.selector];

	trussNode.earth = new Node(trussNode.world, trussNode, 'gravitywell node', {
		'name': 'Earth',
		'localPosition': EARTH_CENTER,
		'mass': EARTH_MASS,
	});

	trussNode.protagonist = new ProtagonistNode(trussNode.world, trussNode, 'moveable velocityloss node color', {
		'name': 'Protagonist',
		'localPosition': new Position(4, 10),  // Positive Y = above Earth, will fall down
		'mass': 70,
		'velocityLoss': 0.9999,
		'color': 'yellow',
	});

	const nodeA = new Node(trussNode.world, trussNode, 'moveable velocityloss node', {
		'name': 'Node A',
		'localPosition': new Position(3, 20),  // Positive Y = above Earth
		'mass': 20,
		'velocityLoss': 0.9999,
	});
	const nodeB = new Node(trussNode.world, trussNode, 'moveable velocityloss node', {
		'name': 'Node B',
		'localPosition': new Position(6, 20),  // Positive Y = above Earth
		'mass': 20,
		'velocityLoss': 0.95,
	});
	const anchorLeft = new Node(trussNode.world, trussNode, 'node', {
		'name': 'Anchor Left',
		'localPosition': new Position(2, 40),  // Positive Y = well above
		'mass': NaN,
	});
	const anchorRight = new Node(trussNode.world, trussNode, 'node', {
		'name': 'Anchor Right',
		'localPosition': new Position(7, 40),  // Positive Y = well above
		'mass': NaN,
	});

	new Tensor(trussNode.protagonist, nodeA, 'spring', {
		'name': 'spring-pa',
		'constant': 200,
		'equilibriumLength': 2,
		'color': 'white',
	});
	new Tensor(trussNode.protagonist, nodeB, 'spring', {
		'name': 'spring-pb',
		'constant': 200,
		'equilibriumLength': 2,
		'color': 'white',
	});
	new Tensor(nodeA, nodeB, 'spring', {
		'name': 'spring-ab',
		'constant': 260,
		'equilibriumLength': 3,
		'color': 'white',
	});
	new Tensor(anchorLeft, nodeA, 'spring absorber', {
		'name': 'damped-left',
		'constant': 180,
		'dampeningConstant': 1.2,
		'equilibriumLength': 3,
	});
	new Tensor(anchorRight, nodeB, 'spring absorber', {
		'name': 'damped-right',
		'constant': 180,
		'dampeningConstant': 1.2,
		'equilibriumLength': 3,
	});
	new Tensor(trussNode.earth, trussNode.protagonist, 'field', {
		'name': 'gravity',
		'constant': GRAVITY_FIELD_CONSTANT,
		'visible': 0,
	});

	// Field tensor connections to bottom nodes for proper hanging behavior
	// Bottom nodes experience stronger gravity pull to create the draping effect
	new Tensor(trussNode.earth, nodeA, 'field', {
		'name': 'gravity-nodeA',
		'constant': GRAVITY_FIELD_CONSTANT,
		'visible': 0,
	});
	new Tensor(trussNode.earth, nodeB, 'field', {
		'name': 'gravity-nodeB',
		'constant': GRAVITY_FIELD_CONSTANT,
		'visible': 0,
	});

	createAngleTensorDemo(trussNode);
}

/**
 * @class
 * @extends TrussNode
 */
class WalkTruss extends TrussNode {
	/**
	 * @param  {...any} args
	 */
	constructor(...args) {
		super(...args);
		this.blur = true;
	}

	/**
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		const representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname = 'WalkTruss';
		return representationObject;
	}

	/**
	 *
	 */
	initiate() {
		createDefaultPerformanceScene(this);
	}
}

/**
 * @class
 * @extends TrussNode
 */
class GovenorTruss extends TrussNode {
	/**
	 * @param  {...any} args
	 */
	constructor(...args) {
		super(...args);
		this.blur = true;
	}

	/**
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		const representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname = 'GovenorTruss';
		return representationObject;
	}

	/**
	 *
	 */
	initiate() {}
}

/**
 * @class
 * @extends TrussNode
 */
class ScrollerTruss extends TrussNode {
	/**
	 * @param  {...any} args
	 */
	constructor(...args) {
		super(...args);
		this.blur = true;
	}

	/**
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		const representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname = 'ScrollerTruss';
		return representationObject;
	}

	/**
	 *
	 */
	initiate() {}
}

/**
 * @class
 * @extends TrussNode
 */
class PerformanceTrussNode extends TrussNode {
	/**
	 * @param  {...any} args
	 */
	constructor(...args) {
		super(...args);
		this.blur = true;
	}

	/**
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		const representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname = 'PerformanceTrussNode';
		return representationObject;
	}

	/**
	 *
	 */
	initiate() {
		createDefaultPerformanceScene(this);
	}
}

/**
 * @class
 * @extends Node
 */
class ProtagonistNode extends Node {
	/**
	 * @param  {...any} args
	 */
	constructor(...args) {
		super(...args);
		this.color = 'yellow';
	}

	/**
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		const representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname = 'ProtagonistNode';
		return representationObject;
	}
}

export {
	createAngleTensorDemo,
	createDefaultPerformanceScene,
	WalkTruss,
	GovenorTruss,
	ScrollerTruss,
	PerformanceTrussNode,
	ProtagonistNode,
};
