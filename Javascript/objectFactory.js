import { Node } from './Nodes/Node.js';
import { CollectionNode } from './Nodes/CollectionNode.js';
import { PictureNode } from './Nodes/PictureNode.js';
import { TrussNode } from './Nodes/TrussNode.js';
import { Tensor, PictureSpring } from './Tensors.js';
import { ActuatorNode, BinaryActuatorNode, JumpNode, LeftRightNode, LineBreakerNode, ScrollNode } from './Nodes/Actuators.js';
import { KeySensorNode, ProximitySensorNode, CollisionSensorNode, BounceSensorNode, Selector, PositionNode } from './Nodes/Sensors.js';
import { WalkTruss, GovenorTruss, ScrollerTruss, PerformanceTrussNode, ProtagonistNode } from './ExperimentalTrusses.js';

const CLASS_REGISTRY = {
	Node, TrussNode, CollectionNode, PictureNode,
	Tensor, PictureSpring,
	ActuatorNode, BinaryActuatorNode, JumpNode, LeftRightNode, LineBreakerNode, ScrollNode,
	KeySensorNode, ProximitySensorNode, CollisionSensorNode, BounceSensorNode, Selector, PositionNode,
	WalkTruss, GovenorTruss, ScrollerTruss, PerformanceTrussNode, ProtagonistNode,
};

export function objectFactory(world, representationObject) {
	const Ctor = CLASS_REGISTRY[representationObject.classname];
	if (!Ctor) {
		throw new Error(`Unknown class in save file: "${representationObject.classname}"`);
	}
	const newObject = new Ctor();
	newObject.world = world;
	return newObject;
}
