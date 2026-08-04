import { Node } from '../Nodes/Node.js';
import { Tensor } from '../Tensors.js';
import { Position } from '../Primitives.js';

/**
 * Key-input demo — positioned 10 m below the AngleTensorDemo (y = 20).
 *
 * Structure:
 *   [fixedPivot] ——spring+angletensor——> [rotatingHub] ——spring+angletensor+keytolength——> [armTip]
 *
 * Controls:
 *   a / d  →  add counter-clockwise / clockwise torque to rotatingHub (keytotorque)
 *   w / s  →  extend / retract the arm's equilibrium length (keytolength)
 *
 * The strong pivot spring keeps rotatingHub near (18, 20) while its angle changes
 * freely.  The arm angletensor (torqueConstant1 only) creates torsional feedback on
 * the hub when the arm is not aligned with hub's current angle — letting you feel the
 * arm "pull back" after rotating the hub.
 *
 * @param {TrussNode} trussNode
 * @return {Object}
 */
function createKeyInputDemo(trussNode) {
	const fixedPivot = new Node(trussNode.world, trussNode, 'node angle color', {
		'name': 'Key Demo Fixed Pivot',
		'localPosition': new Position(14, 20),
		'mass': NaN,
		'degree': 0,
		'angleVelocityLoss': 1,
		'color': 'lightblue',
	});

	const rotatingHub = new Node(trussNode.world, trussNode, 'node moveable angle velocityloss keytotorque color', {
		'name': 'Key Demo Rotating Hub  [a/d]',
		'localPosition': new Position(18, 20),
		'mass': 20,
		'degree': 0,
		'angleVelocityLoss': 0.85,
		'velocityLoss': 0.95,
		'key1': 'a',
		'torque1': 300,
		'key2': 'd',
		'torque2': -300,
		'color': 'orange',
	});

	const armTip = new Node(trussNode.world, trussNode, 'node moveable velocityloss color', {
		'name': 'Key Demo Arm Tip  [w/s]',
		'localPosition': new Position(22, 20),
		'mass': 3,
		'velocityLoss': 0.999,
		'color': 'lime',
	});

	// Strong spring keeps hub near pivot; angletensor also provides torsional resistance.
	const pivotSpring = new Tensor(fixedPivot, rotatingHub, 'spring angletensor', {
		'name': 'key-demo-pivot-spring',
		'constant': 1200,
		'equilibriumLength': 4,
		'degree1': 0,
		'degree2': 180,
		'torqueConstant1': 60,
		'torqueConstant2': 60,
	});

	// Arm: angletensor gives the hub angle-feedback; keytolength lets w/s extend/retract
	const hubArm = new Tensor(rotatingHub, armTip, 'spring angletensor keytolength', {
		'name': 'key-demo-arm  [w/s length]',
		'constant': 200,
		'equilibriumLength': 4,
		// Hub (node1) is driven toward arm direction; arm tip (node2) has no angle
		'degree1': 0,
		'degree2': 0,
		'torqueConstant1': 40,
		'torqueConstant2': 0,
		// w extends, s retracts (5 m/s), clamped to 1 m minimum
		'key1': 'w',
		'lengthRate1': 5,
		'key2': 's',
		'lengthRate2': -5,
		'minLength': 1,
	});

	return {
		fixedPivot,
		rotatingHub,
		armTip,
		pivotSpring,
		hubArm,
	};
}

export { createKeyInputDemo };
