import { Position } from '../Primitives.js';
import { displayMousePercentX, displayMousePercentY } from '../globals.js';

function getDisplayPosition(trussNode, object) {
	if (!object || !object.getPosition) {
		return undefined;
	}

	const position = object.getPosition();
	if (!position) {
		return undefined;
	}

	if (object.coordinateSystem && object.coordinateSystem.isDisplay()) {
		return new Position(position.x, position.y);
	}

	const screenWidth = trussNode.view.screenSize.x;
	const screenHeight = trussNode.view.screenSize.y;
	if (!screenWidth || !screenHeight) {
		return undefined;
	}

	return new Position(
		(trussNode.view.x(position) / screenWidth) * 100,
		(1 - (trussNode.view.y(position) / screenHeight)) * 100
	);
}

function getClosestObject(trussNode, maxDisplayDistance = 3, avoid) {
	let lowestDistance = 1000000000;
	let closest;

	const distanceToMouse = (object) => {
		const displayPosition = getDisplayPosition(trussNode, object);
		if (!displayPosition) {
			return Infinity;
		}
		const dx = displayMousePercentX - displayPosition.x;
		const dy = displayMousePercentY - displayPosition.y;
		return Math.sqrt(dx * dx + dy * dy);
	};

	for (let node of trussNode.nodes) {
		if (node == avoid || node == trussNode.selector) {
			continue;
		}
		const distance = distanceToMouse(node);

		if (distance < lowestDistance && distance < maxDisplayDistance) {
			lowestDistance = distance;
			closest = node;
		}
	}

	for (let tensor of trussNode.tensors) {
		if (tensor == avoid) {
			continue;
		}
		const distance = distanceToMouse(tensor);

		if (distance < lowestDistance && distance < maxDisplayDistance) {
			lowestDistance = distance;
			closest = tensor;
		}
	}

	return closest;
}

export { getDisplayPosition, getClosestObject };
