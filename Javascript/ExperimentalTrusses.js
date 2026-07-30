import { TrussNode } from './Nodes/TrussNode.js';
import { Node } from './Nodes/Node.js';
import { Tensor } from './Tensors.js';
import { Selector } from './Nodes/Sensors.js';
import { Position } from './Primitives.js';

/**
 *
 */
const EARTH_CENTER = new Position(0, -6371e3);
const EARTH_MASS = 5.97219e24;
const GRAVITY_CONSTANT = 6.67e-11;

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

	trussNode.protagonist = new ProtagonistNode(trussNode.world, trussNode, 'moveable node color', {
		'name': 'Protagonist',
		'localPosition': new Position(4, 3),
		'mass': 70,
		'color': 'yellow',
	});

	const nodeA = new Node(trussNode.world, trussNode, 'moveable node', {
		'name': 'Node A',
		'localPosition': new Position(3, 5),
		'mass': 20,
	});
	const nodeB = new Node(trussNode.world, trussNode, 'moveable node', {
		'name': 'Node B',
		'localPosition': new Position(6, 5),
		'mass': 20,
	});
	const anchorLeft = new Node(trussNode.world, trussNode, 'node', {
		'name': 'Anchor Left',
		'localPosition': new Position(2, 8),
		'mass': NaN,
	});
	const anchorRight = new Node(trussNode.world, trussNode, 'node', {
		'name': 'Anchor Right',
		'localPosition': new Position(7, 8),
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
		'constant': GRAVITY_CONSTANT,
		'visible': 0,
	});
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

export { createDefaultPerformanceScene, WalkTruss, GovenorTruss, ScrollerTruss, PerformanceTrussNode, ProtagonistNode };
