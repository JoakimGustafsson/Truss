import { Position, Velocity, removeIfPresent } from '../Model/Primitives.js';
import { Behaviours } from '../Behaviours/Behaviour.js';
import { AngleNode, AngleTensor } from '../Behaviours/Angles.js';
import {
	SpringCalculator,
	PullCalculator,
	PushCalculator,
	FieldCalculator,
	AbsorbCalculator,
} from '../Behaviours/TensorForces.js';
import { KeyToTorqueBehaviour, KeyToLengthBehaviour, ForceSensorBehaviour } from '../Behaviours/Sensors.js';
import {
	NumberProperty, StringProperty, PositionProperty, SwitchProperty,
	NodeProperty, TensorListProperty, LabelListProperty, PropertyListProperty,
	ParameterCategory,
} from '../UI/ParameterEditor/Property.js';
import { universe } from '../Utils/globals.js';

/**
 * @class
 */
class Labels {
	/**
	 */
	constructor() {
		this.list = [];

		this.behaviours = new Behaviours();

		this.massProperty = new NumberProperty(
			'mass', 'mass', 'Mass', ParameterCategory.CONTENT, 'The mass of the node in Kilograms.');
		this.nameProperty = new StringProperty(
			'name', 'name', 'Name', ParameterCategory.CONTENT,
			'The name of the node.');
		this.constantProperty = new NumberProperty(
			'constant', 'constant', 'Constant', ParameterCategory.CONTENT,
			'The tensor constant.');
		this.absorberProperty = new NumberProperty(
			'dampeningConstant', 'dampeningConstant', 'Dampening Constant', ParameterCategory.CONTENT,
			'The absorb constant.');
		this.positionProperty = new PositionProperty(
			'localPosition', 'localPosition', 'Position', ParameterCategory.CONTENT,
			'The position counted from the upper left corner.');
		this.velocityProperty = new PositionProperty(
			'velocity', 'velocity', 'Velocity', ParameterCategory.CONTENT,
			'The velocity.');
		this.angleProperty = new NumberProperty(
			'degree', 'degree', 'Angle', ParameterCategory.CONTENT,
			'The angle of the node.');
		this.angularVelocityProperty = new NumberProperty(
			'angularVelocity', 'angularVelocity', 'Angular velocity', ParameterCategory.CONTENT,
			'The angular velocity of the node in degrees per second.');
		this.angleVelocityLossProperty = new NumberProperty(
			'angleVelocityLoss', 'angleVelocityLoss', 'Angle velocity loss', ParameterCategory.CONTENT,
			'How much angular velocity is retained per frame (0-1, where 1 is no loss).');
		this.torqueConstant1Property = new NumberProperty(
			'torqueConstant1', 'torqueConstant1', 'Start torque constant', ParameterCategory.CONTENT,
			'How strongly this tensor resists angle differences at the start node.');
		this.torqueConstant2Property = new NumberProperty(
			'torqueConstant2', 'torqueConstant2', 'End torque constant', ParameterCategory.CONTENT,
			'How strongly this tensor resists angle differences at the end node.');
		this.velocityLossProperty = new NumberProperty(
			'velocityLoss', 'velocityLoss', 'Velocity loss', ParameterCategory.CONTENT,
			'How much velocity is lost per frame (0-1, where 1 is no loss).');
		this.colorProperty = new StringProperty(
			'color', 'color', 'Colour', ParameterCategory.CONTENT,
			'The colour of the node.');
		this.pictureProperty = new StringProperty(
			'pictureReference', 'pictureReference', 'Picture filename', ParameterCategory.CONTENT,
			'The picture filename.');
		this.sizeProperty = new NumberProperty(
			'size', 'size', 'Size (1=normal)', ParameterCategory.CONTENT,
			'The picture size');
		this.equilibriumLengthProperty = new NumberProperty(
			'equilibriumLength', 'equilibriumLength', 'Length', ParameterCategory.CONTENT,
			'How long should the relaxed spring be.');
		this.degree1Property = new NumberProperty(
			'degree1', 'degree1', 'Angle 1', ParameterCategory.CONTENT,
			'The angle the node connects to the start node.');
		this.degree2Property = new NumberProperty(
			'degree2', 'degree2', 'Angle 2', ParameterCategory.CONTENT,
			'The angle the node connects to the end node.');


		this.screenSizeProperty = new PositionProperty(
			'screenSize', 'screenSize', 'Screen size', ParameterCategory.CONTENT,
			'The size of the displayed screen in pixels.');
		this.worldSizeProperty = new PositionProperty(
			'worldSize', 'worldSize', 'World display size', ParameterCategory.CONTENT,
			'The size of the displayed worldview in that worlds measurement.');
		this.worldOffsetProperty = new PositionProperty(
			'worldOffset', 'worldOffset', 'View position', ParameterCategory.CONTENT,
			'The world coordinates of the upper left corner.');
		this.fpsTargetProperty = new NumberProperty('fpsTarget', 'fpsTarget', 'Updates per second',
			ParameterCategory.CONTENT, 'Graphical update frequency aim.');
		this.fpsProperty = new NumberProperty('fps', 'fps', 'Frames per Second',
			ParameterCategory.CONTENT, 'Graphical update frequency aim.');

		this.visibilityProperty = new SwitchProperty(
			'visible', 'visible', 'Visible', ParameterCategory.CONTENT,
			'Should this be visible on the screen.');

		this.snapGridProperty = new NumberProperty(
			'gridSize', 'gridSize', 'Align to grid', ParameterCategory.CONTENT,
			'Aligning all new positions to this grid. (0 for no alignment)');

		this.enforcedProperty = new NumberProperty(
			'enforced', 'enforced', 'Enforced', ParameterCategory.CONTENT,
			'Special parameter that only is used in labels to enforce all parameter values are enforced.');

		this.planeProperty = new StringProperty(
			'plane', 'plane', 'Plane', ParameterCategory.CONTENT,
			'The plane this node belongs to: "world", "display", or "admin".');

		this.startNodeProperty = new NodeProperty(
			'node1', 'node1', 'Start node', ParameterCategory.CONTENT,
			'Start node.');

		this.endNodeProperty = new NodeProperty(
			'node2', 'node2', 'End node', ParameterCategory.CONTENT,
			'End node.');

		this.parentTrussNodeProperty = new NodeProperty(
			'parentTrussNode', 'parentTrussNode', 'Parent node', ParameterCategory.CONTENT,
			'Owning truss node.');

		this.connectedTensorsProperty = new TensorListProperty(
			'connectedTensors', 'connectedTensors', 'Tensors', ParameterCategory.CONTENT,
			'All tensors based on node positions.');

		this.keyProperty = new PropertyListProperty(
			'keyVectors', 'keyVectors', 'KeyVectorList', ParameterCategory.CONTENT,
			'All tensors based on node positions.', [
				() => new StringProperty(
					'key', 'key', 'Trigger key', ParameterCategory.CONTENT,
					'The number of the key that triggers the move.'),
				() => new PositionProperty(
					'vector', 'vector', 'Position change', ParameterCategory.CONTENT,
					'The position node moves when the key is pressed.')]);

		this.restPositionProperty = new PositionProperty(
			'restPosition', 'restPosition', 'Rest position', ParameterCategory.CONTENT,
			'The position when no key is pressed.');

		this.key1Property = new StringProperty(
			'key1', 'key1', 'Key 1', ParameterCategory.CONTENT,
			'Key name for the first input (e.g. "ArrowLeft", "a"). Check https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key for names.');
		this.key2Property = new StringProperty(
			'key2', 'key2', 'Key 2', ParameterCategory.CONTENT,
			'Key name for the second input (e.g. "ArrowRight", "d").');
		this.torque1Property = new NumberProperty(
			'torque1', 'torque1', 'Torque 1', ParameterCategory.CONTENT,
			'Torque added per frame while Key 1 is held (same unit as angle tensor torque constants).');
		this.torque2Property = new NumberProperty(
			'torque2', 'torque2', 'Torque 2', ParameterCategory.CONTENT,
			'Torque added per frame while Key 2 is held.');
		this.lengthRate1Property = new NumberProperty(
			'lengthRate1', 'lengthRate1', 'Length rate 1', ParameterCategory.CONTENT,
			'Change in equilibrium length per second while Key 1 is held.');
		this.lengthRate2Property = new NumberProperty(
			'lengthRate2', 'lengthRate2', 'Length rate 2', ParameterCategory.CONTENT,
			'Change in equilibrium length per second while Key 2 is held.');
		this.minLengthProperty = new NumberProperty(
			'minLength', 'minLength', 'Min length', ParameterCategory.CONTENT,
			'Minimum allowed equilibrium length (optional clamp).');
		this.forceLimitProperty = new NumberProperty(
			'forceLimit', 'forceLimit', 'Force Limit', ParameterCategory.CONTENT,
			'Magnitude of force (N) above which tensor color transitions toward red.');

		let nodeLabel = this.addLabel('node', [], {
			'nameProperty': '',
			'positionProperty': new Position(1, 1),
			'visibilityProperty': 1,
			'parentTrussNodeProperty': undefined,
			'connectedTensorsProperty': undefined,
		});
		let tensorLabel = this.addLabel('tensor', [], {
			'nameProperty': '',
			'visibilityProperty': 1,
			'startNodeProperty': undefined,
			'endNodeProperty': undefined,
			'parentTrussNodeProperty': undefined,
		});
		let positionTensorLabel = this.addLabel('positiontensor', [tensorLabel], {
			'constantProperty': 1,
		});
		let pullLabel = this.addLabel('pullspring', [positionTensorLabel], {
			'equilibriumLengthProperty': 1,
		});
		let pushLabel = this.addLabel('pushspring', [positionTensorLabel], {
			'equilibriumLengthProperty': 1,
		});
		let springLabel = this.addLabel('spring', [positionTensorLabel], {
			'equilibriumLengthProperty': 1,
		});
		let fieldLabel = this.addLabel('field', [positionTensorLabel], {});
		let absorbLabel = this.addLabel('absorber', [tensorLabel], {
			'absorberProperty': 1,
			'visibilityProperty': 1,
		});
		let moveabelLabel = this.addLabel('moveable', [nodeLabel], {
			'massProperty': 1,
			'velocityProperty': new Velocity(0, 0),
		});
		let angleLabel = this.addLabel('angle', [nodeLabel], {
			'angleProperty': 1,
			'angularVelocityProperty': 0,
			'angleVelocityLossProperty': 0.9999,
		});
		let angleTensorLabel = this.addLabel('angletensor', [tensorLabel], {
			'degree1Property': 0,
			'degree2Property': 0,
			'torqueConstant1Property': 1,
			'torqueConstant2Property': 1,
		});
		let debugtensorLabel = this.addLabel('debugtensor', [], {
			'degree1Property': 1,
			'degree2Property': 1,
		});
		let debugnodeLabel = this.addLabel('debugnode', [], {
			'velocityProperty': undefined,
		});
		let colorLabel = this.addLabel('color', [], {
			'colorProperty': 'red',
			'visibilityProperty': 1,
		});
		let pictureLabel = this.addLabel('picture', [nodeLabel], {
			'pictureProperty': '/Resources/default.jpg',
			'sizeProperty': 1,
			'visibilityProperty': 1,
		});
		let dampLabel = this.addLabel('dampenedspring', [springLabel, absorbLabel], {});
		let gravityLabel = this.addLabel('gravitywell', [nodeLabel], {
			'massProperty': 5.97219e24,
			'nameProperty': 'Earth',
			'positionProperty': new Position(0, -6371000),
			'enforcedProperty': true,
		});
		let trussLabel = this.addLabel('truss', [nodeLabel], {
			'screenSizeProperty': new Position(200, 200),
			'worldSizeProperty': new Position(20, 20),
			'worldOffsetProperty': new Position(0, 0),
			'fpsTargetProperty': 60,
			'fpsProperty': 60,
			'snapGridProperty': 0,
		});
		let sensorLabel = this.addLabel('sensor', [nodeLabel], {
		});
		let selectorLabel = this.addLabel('selector', [sensorLabel, moveabelLabel], {
		});
		let keytotorqueLabel = this.addLabel('keytotorque', [sensorLabel, angleLabel, moveabelLabel], {
			'key1Property': '',
			'key2Property': '',
			'torque1Property': 0,
			'torque2Property': 0,
		});
		let keytolengthLabel = this.addLabel('keytolength', [tensorLabel], {
			'key1Property': '',
			'key2Property': '',
			'lengthRate1Property': 0,
			'lengthRate2Property': 0,
			'minLengthProperty': 0,
		});
		let forcesensorLabel = this.addLabel('forcesensor', [tensorLabel], {
			'forceLimitProperty': 1000,
		});
		let nogravityLabel = this.addLabel('nogravity', [nodeLabel], {
			// Nodes with this label should not be affected by gravity fields
			// Used for UI elements like banner top nodes that are anchored or controlled by springs
		});
		let anchorLabel = this.addLabel('anchor', [nodeLabel], {
			'velocityLossProperty': 0.0,
			// Nodes with this label are pinned/anchored in place
			// Velocity is zeroed each frame (velocityLoss = 0.0 means velocity becomes 0)
			// Still draggable in editor but won't move from physics forces
		});
		let planeLabel = this.addLabel('plane', [], {
			'planeProperty': 'world',
			// Plane for node or tensor: 'world', 'display', or 'admin'
			// 'world': standard world coordinates, affected by zoom/pan, interactive via display plane hover/select
			// 'display': screen-fixed coordinates, used for UI elements, independent of zoom/pan
			// 'admin': system/backend plane
			// Defaults to 'world' if not specified
		});
		let bannerLabel = this.addLabel('banner', [], {
			// Objects with this label are part of the banner UI system
			// No automatic inheritance - nodes need to add 'node plane', tensors use their own labels
		});
		let velocityLossLabel = this.addLabel('velocityloss', [nodeLabel], {
			'velocityLossProperty': 0.9999,
			// Nodes with this label have tunable velocity loss applied per physics frame
			// velocityLoss value (0-1): fraction of velocity retained per frame
			// 0.9999 = 0.01% loss (default, minimal damping - natural falling)
			// 0.99 = 1% loss (light damping)
			// 0.95 = 5% loss (moderate damping)
			// 0.9 = 10% loss (heavy damping)
			// Lower values = more damping = slower falling
		});
		let displayCoordinatesLabel = this.addLabel('displaycoordinates', [nodeLabel], {
			// Nodes with this label operate in display coordinates (screen-relative)
			// Their positions are NOT affected by zoom/pan transformations
			// Used for UI elements like banner that should maintain fixed screen size
			// Display coordinates operate independently: no physics connections to world nodes
		});

		this.registerDefaultBehaviours();
	}

	/**
	 */
	registerDefaultBehaviours() {
		this.behaviours.register('spring', SpringCalculator);
		this.behaviours.register('pullspring', PullCalculator);
		this.behaviours.register('pushspring', PushCalculator);
		this.behaviours.register('field', FieldCalculator);
		this.behaviours.register('absorber', AbsorbCalculator);
		this.behaviours.register('angle', AngleNode);
		this.behaviours.register('angletensor', AngleTensor);
		this.behaviours.register('keytotorque', KeyToTorqueBehaviour);
		this.behaviours.register('keytolength', KeyToLengthBehaviour);
		this.behaviours.register('forcesensor', ForceSensorBehaviour);
	}

	/**
	 * @param  {Property} name
	 * @param  {List} dependencies
	 * @param  {List} properties
	 * @return {Label}
	 */
	addLabel(name, dependencies, properties) {
		if (properties) {
			let enforced = properties.enforcedProperty;
			for (const [key, value] of Object.entries(properties)) {
				properties[key] = {
					'propertyObject': this[key],
					'defaultValue': value,
					'enforced': enforced,
				};
			}
		}
		let label = new Label(name, dependencies, properties);
		this.list.push(label);
		return label;
	}

	/**
	 * @return {Array}
	 */
	getLabels() {
		return this.list;
	}

	/**
	 * @param {string} labelName
	 * @return {Array}
	 */
	findLabel(labelName) {
		if (!labelName) {
			labelName = 'EmptyName';
		}
		for (let l of this.list) {
			if (l.name == labelName) {
				return l;
			}
		}
		return this.addLabel(labelName);
	}

	/**
	 * @param {Object} reference
	 */
	clearOldReferences(reference) {
		if (reference.labels) {
			for (let l of reference.labels) {
				l.clearOldReference(reference);
			}
		}
	}

	/**
	 * @param {string} labelName
	 * @param {object} reference
	 * @return {Label}
	 */
	addReference(labelName, reference) {
		let label = this.findLabel(labelName);
		label.addReference(reference);
		return label;
	}

	/**
	 * @param {List} startList
	 * @param {object} reference
	 * @param {List} resultList
	 * @return {List}
	 */
	recursiveDependencies(startList, reference, resultList) {
		if (startList && startList.length == 0) {
			return resultList;
		}
		for (let label of startList) {
			if (resultList.indexOf(label) == -1) {
				label.addReference(reference);
				// resultList = [label, ...this.recursiveDependencies(label.dependencies, reference, resultList)];
				resultList = this.recursiveDependencies(label.dependencies, reference, [...resultList, label]);
			} else {
				resultList = this.recursiveDependencies(label.dependencies, reference, resultList);
			}
		}
		return resultList;
	}

	/**
	 * @param {string} labelString
	 * @param {object} reference
	 * @return {Label}
	 */
	parse(labelString, reference) {
		this.clearOldReferences(reference);
		if (!labelString) {
			return [];
		}
		let stringList = labelString.toLowerCase().split(/[\s,]+/);
		let startList = [];
		for (let name of stringList) {
			if (name != '') {
				let label = this.findLabel(name);
				if (startList.indexOf(label) == -1) {
					startList.push(label);
				}
			}
		}
		let returnList = this.recursiveDependencies(startList, reference, []);
		return returnList;
	}

	/**
	 * @param {string} divName
	 * @param {string} filter
	 */
	show(divName, filter) {
		let area = universe.currentNode.getElement('#' + divName);
		let displayDiv = universe.currentNode.getElement('#labelContentArea');
		area.innerHTML = '';
		if (this.list) {
			for (let label of this.list) {
				if (label.used()) {
					let leftButton = document.createElement('button');
					leftButton.classList.add('trussButton');
					leftButton.classList.add('nodeButton');
					leftButton.innerHTML = label.name;
					this.registerOnClick(leftButton, label, displayDiv);
					area.appendChild(leftButton);
				}
			}
		}
	}

	/**
	 * @param  {buttonObject} but
	 * @param  {Node} label
	 * @param  {Node} displayDiv
	 */
	registerOnClick(but, label, displayDiv) {
		but.addEventListener('click', function() {
			displayDiv.innerHTML = '';
			for (let item of label.getReferences()) {
				displayDiv.appendChild(item.generateHTML());
			}
		});
	}
}

/**
 * @class
 */
class Label {
	/**
	 * @param {string} name
	 * @param {string} dependencies
	 * @param {string} properties
	 */
	constructor(name, dependencies = [], properties = []) {
		this.name = name;
		this.nodes = [];
		this.tensors = [];
		this.dependencies = dependencies;
		this.properties = properties;
	}

	/**
	 * @param  {Property} reference
	 * @return  {Object}
	 */
	addReference(reference) {
		if (reference.isNode) {
			return this.nodes.push(reference);
		} else {
			return this.tensors.push(reference);
		}
	}
	/**
	 * @param  {Property} reference
	 * @return  {number} Nr of uses
	 */
	clearOldReference(reference) {
		if (reference.isNode) {
			removeIfPresent(reference, this.nodes);
			return this.used();
		} else {
			removeIfPresent(reference, this.tensors);
			return this.used();
		}
	}

	/**
	 * @return {number}
	 */
	used() {
		return this.nodes.length + this.tensors.length;
	}

	/**
	 * @return {Array}
	 */
	getNodes() {
		return this.nodes;
	}

	/**
	 * @return {Array}
	 */
	getTensors() {
		return this.tensors;
	}

	/**
	 * @return {Array}
	 */
	getReferences() {
		return [...this.tensors, ...this.nodes];
	}
}

export { Labels, Label };
