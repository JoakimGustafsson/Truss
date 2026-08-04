import { Node } from '../Nodes/Node.js';
import { Tensor } from '../Tensors.js';
import { Position } from '../Primitives.js';
import { GRAVITY_FIELD_CONSTANT } from '../Gravity.js';

/**
 * Create a protagonist-controlled structure with swaying limbs:
 * protagonist (center) connected to two nodes (A, B) with springs,
 * both anchored above with damped springs.
 *
 * Includes gravity field connections to the earth node.
 * @param {TrussNode} trussNode
 * @param {Node} gravityWellNode - The central gravity node (e.g., Earth)
 * @return {Object}
 */
function createProtagonistDemo(trussNode, gravityWellNode) {
	const protagonist = new Node(trussNode.world, trussNode, 'moveable velocityloss node color', {
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

	new Tensor(protagonist, nodeA, 'spring', {
		'name': 'spring-pa',
		'constant': 200,
		'equilibriumLength': 2,
		'color': 'white',
	});
	new Tensor(protagonist, nodeB, 'spring', {
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
	new Tensor(gravityWellNode, protagonist, 'field', {
		'name': 'gravity',
		'constant': GRAVITY_FIELD_CONSTANT,
		'visible': 0,
	});

	// Field tensor connections to bottom nodes for proper hanging behavior
	// Bottom nodes experience stronger gravity pull to create the draping effect
	new Tensor(gravityWellNode, nodeA, 'field', {
		'name': 'gravity-nodeA',
		'constant': GRAVITY_FIELD_CONSTANT,
		'visible': 0,
	});
	new Tensor(gravityWellNode, nodeB, 'field', {
		'name': 'gravity-nodeB',
		'constant': GRAVITY_FIELD_CONSTANT,
		'visible': 0,
	});

	return {
		protagonist,
		nodeA,
		nodeB,
		anchorLeft,
		anchorRight,
	};
}

export { createProtagonistDemo };
