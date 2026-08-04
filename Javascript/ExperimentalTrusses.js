import { TrussNode } from './Nodes/TrussNode.js';
import { Node } from './Nodes/Node.js';
import { Tensor } from './Tensors.js';
import { Selector } from './Nodes/Sensors.js';
import { Position } from './Primitives.js';
import { createAngleTensorDemo } from './Demos/AngleTensorDemo.js';
import { createKeyInputDemo } from './Demos/KeyInputDemo.js';
import { createProtagonistDemo } from './Demos/ProtagonistDemo.js';
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

	// Create protagonist structure, passing the gravity well
	createProtagonistDemo(trussNode, trussNode.earth);

	createAngleTensorDemo(trussNode);
	createKeyInputDemo(trussNode);
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
	createKeyInputDemo,
	createProtagonistDemo,
	createDefaultPerformanceScene,
	WalkTruss,
	GovenorTruss,
	ScrollerTruss,
	PerformanceTrussNode,
	ProtagonistNode,
};
