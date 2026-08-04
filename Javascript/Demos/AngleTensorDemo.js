import { Node } from '../Nodes/Node.js';
import { Tensor } from '../Tensors.js';
import { Position } from '../Primitives.js';

/**
 * Create a small angle/angletensor demo:
 * fixed left support -- angle node -- moveable right handle.
 *
 * With both angle tensors connected, the left support resists rotation. If the
 * left tensor is deleted and the right handle is moved, the central angle node
 * rotates toward the remaining tensor target according to mass and angular
 * velocity loss.
 * @param {TrussNode} trussNode
 * @return {Object}
 */
function createAngleTensorDemo(trussNode) {
	const leftSupport = new Node(trussNode.world, trussNode, 'node angle color', {
		'name': 'Angle Demo Fixed Support',
		'localPosition': new Position(14, 30),
		'mass': NaN,
		'degree': 0,
		'angleVelocityLoss': 1,
		'color': 'lightblue',
	});
	const angleNode = new Node(trussNode.world, trussNode, 'node moveable angle velocityloss color', {
		'name': 'Angle Demo Center',
		'localPosition': new Position(18, 30),
		'mass': 30,
		'degree': 0,
		'angleVelocityLoss': 0.95,
		'velocityLoss': 0.999,
		'color': 'orange',
	});
	const moveableHandle = new Node(trussNode.world, trussNode, 'node moveable velocityloss color', {
		'name': 'Angle Demo Moveable Handle',
		'localPosition': new Position(22, 30),
		'mass': 8,
		'velocityLoss': 0.98,
		'color': 'lime',
	});

	const leftAngleTensor = new Tensor(leftSupport, angleNode, 'spring angletensor', {
		'name': 'angle-demo-left-lock',
		'constant': 700,
		'equilibriumLength': 4,
		'degree1': 0,
		'degree2': 180,
		'torqueConstant1': 90,
		'torqueConstant2': 90,
		'color': 'lightblue',
	});
	const rightAngleTensor = new Tensor(angleNode, moveableHandle, 'spring angletensor', {
		'name': 'angle-demo-right-drive',
		'constant': 450,
		'equilibriumLength': 4,
		'degree1': 0,
		'degree2': 0,
		'torqueConstant1': 90,
		'torqueConstant2': 0,
		'color': 'lime',
	});

	return {
		leftSupport,
		angleNode,
		moveableHandle,
		leftAngleTensor,
		rightAngleTensor,
	};
}

export { createAngleTensorDemo };
