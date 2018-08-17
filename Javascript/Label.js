/**
 * @class
 */
class Labels {
	/**
	 */
	constructor() {
		this.list = [];

		this.behaviours = new Behaviours();

		this.createProperties();

		this.createInitialLabels();
	}

	createProperties() {
		this.massProperty = new NumberProperty('mass', 'mass', 'Mass', ParameterCategory.CONTENT, 'The mass of the node in Kilograms.');
		this.nameProperty = new StringProperty('name', 'name', 'Name', ParameterCategory.CONTENT, 'The name of the node.');
		this.constantProperty = new NumberProperty('constant', 'constant', 'Constant', ParameterCategory.CONTENT, 'The tensor constant.');
		this.absorberProperty = new NumberProperty('dampeningConstant', 'dampeningConstant', 'Dampening Constant', ParameterCategory.CONTENT, 'The absorb constant.');
		this.positionProperty = new PositionProperty('localPosition', 'localPosition', 'Position', ParameterCategory.CONTENT, 'The position counted from the upper left corner.');
		this.velocityProperty = new PositionProperty('velocity', 'velocity', 'Velocity', ParameterCategory.CONTENT, 'The velocity.');
		this.angleProperty = new NumberProperty('degree', 'degree', 'Angle', ParameterCategory.CONTENT, 'The angle of the node.');
		this.torqueConstantProperty = new NumberProperty('torqueConstant', 'torqueConstant', 'Torque constant', ParameterCategory.CONTENT, 'How stiff the node is with respect to attempts angle differences.');
		this.nodeFrictionProperty = new NumberProperty('velocityLoss', 'velocityLoss', 'Node friction', ParameterCategory.CONTENT, 'How much velocity bleeds of the node (0-1, where 1 is no bleed of).');
		this.colorProperty = new StringProperty('color', 'color', 'Colour', ParameterCategory.CONTENT, 'The colour of the node.');
		this.pictureProperty = new StringProperty('pictureReference', 'pictureReference', 'Picture filename', ParameterCategory.CONTENT, 'The picture filename.');
		this.sizeProperty = new NumberProperty('size', 'size', 'Size (1=normal)', ParameterCategory.CONTENT, 'The picture size');
		this.equilibriumLengthProperty = new NumberProperty('equilibriumLength', 'equilibriumLength', 'Length', ParameterCategory.CONTENT, 'How long should the relaxed spring be.');
		this.degree1Property = new NumberProperty('degree1', 'degree1', 'Angle 1', ParameterCategory.CONTENT, 'The angle the node connects to the start node.');
		this.degree2Property = new NumberProperty('degree2', 'degree2', 'Angle 2', ParameterCategory.CONTENT, 'The angle the node connects to the end node.');
		this.screenSizeProperty = new PositionProperty('screenSize', 'screenSize', 'Screen size', ParameterCategory.CONTENT, 'The size of the displayed screen in pixels.');
		this.worldSizeProperty = new PositionProperty('worldSize', 'worldSize', 'World display size', ParameterCategory.CONTENT, 'The size of the displayed worldview in that worlds measurement.');
		this.setWorldOffsetProperty = new PositionProperty('setWorldOffset', 'setWorldOffset', 'View position', ParameterCategory.CONTENT, 'The world coordinates of the upper left corner.');
		this.fpsTargetProperty = new NumberProperty('fpsTarget', 'fpsTarget', 'Updates per second', ParameterCategory.CONTENT, 'Graphical update frequency aim.');
		this.fpsProperty = new NumberProperty('fps', 'fps', 'Frames per Second', ParameterCategory.CONTENT, 'Graphical update frequency aim.');
		this.visibilityProperty = new SwitchProperty('visible', 'visible', 'Visible', ParameterCategory.CONTENT, 'Should this be visible on the screen.');
		this.snapGridProperty = new NumberProperty('gridSize', 'gridSize', 'Align to grid', ParameterCategory.CONTENT, 'Aligning all new positions to this grid. (0 for no alignment)');
		this.enforcedProperty = new NumberProperty('enforced', 'enforced', 'Enforced', ParameterCategory.CONTENT, 'Special parameter that only is used in labels to enforce all parameter values are enforced.');
		this.startNodeProperty = new NodeProperty('node1', 'node1', 'Start node', ParameterCategory.CONTENT, 'Start node.');
		this.endNodeProperty = new NodeProperty('node2', 'node2', 'End node', ParameterCategory.CONTENT, 'End node.');
		this.parentTrussNodeProperty = new NodeProperty('parentTrussNode', 'parentTrussNode', 'Parent node', ParameterCategory.CONTENT, 'Owning truss node.');
		this.connectedTensorsProperty = new TensorListProperty('connectedTensors', 'connectedTensors', 'Tensors', ParameterCategory.CONTENT, 'All tensors based on node positions.');
		this.keyProperty = new PropertyListProperty('keyVectors', 'keyVectors', 'KeyVectorList', ParameterCategory.CONTENT, 'All tensors based on node positions.', [
			() => new StringProperty('key', 'key', 'Trigger key', ParameterCategory.CONTENT, 'The number of the key that triggers the move.'),
			() => new PositionProperty('vector', 'vector', 'Position change', ParameterCategory.CONTENT, 'The position node moves when the key is pressed.')
		]);
		this.restPositionProperty = new PositionProperty('restPosition', 'restPosition', 'Rest position', ParameterCategory.CONTENT, 'The position when no key is pressed.');
	}

	createInitialLabels() {
		let nodeLabel = this.addLabel('node', [], {
			'nameProperty': '',
			'positionProperty': new Position(1, 1),
			'visibilityProperty': 1,
			'parentTrussNodeProperty': undefined,
			'connectedTensorsProperty': undefined,
		});
		let tensorLabel = this.addLabel('tensor', [], {
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
			'nodeFrictionProperty': 0.99,
		});
		let angleLabel = this.addLabel('angle', [nodeLabel], {
			'angleProperty': 1,
			'torqueConstantProperty': 1,
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
		let dampLabel = this.addLabel('dampenedspring', [springLabel, absorbLabel], {
			'angleProperty': 1,
			'torqueConstantProperty': 1,
		});
		let gravityLabel = this.addLabel('gravitywell', [nodeLabel], {
			'constantProperty': 6.67e-11,
			'massProperty': 5.97219e24,
			'nameProperty': 'Earth',
			'positionProperty': new Position(0, 6371000),
			'enforcedProperty': true,
		});
		let trussLabel = this.addLabel('truss', [nodeLabel], {
			'screenSizeProperty': new Position(200, 200),
			'worldSizeProperty': new Position(20, 20),
			'setWorldOffsetProperty': new Position(0, 0),
			'fpsTargetProperty': 60,
			'fpsProperty': 60,
			'snapGridProperty': 0,
		});
		let sensorLabel = this.addLabel('sensor', [nodeLabel], {});
		let selectorLabel = this.addLabel('selector', [sensorLabel, moveabelLabel], {});
		let keySensorLabel = this.addLabel('keysensor', [sensorLabel, moveabelLabel], {
			'keyProperty': [],
			'restPositionProperty': new Position(1, 1),
		}, [new KeySensor()]);
	}

	/**
	 * @param  {Property} name
	 * @param  {List} dependencies
	 * @param  {List} properties
	 * @param  {List} behaviours
	 * @return {Label}
	 */
	addLabel(name, dependencies, properties, behaviours) {
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
		let label = new Label(name, dependencies, properties, behaviours);
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
	 * @param {List} behaviours
	 */
	constructor(name, dependencies = [], properties = [], behaviours =[]) {
		this.name = name;
		this.nodes = [];
		this.tensors = [];
		this.dependencies = dependencies;
		this.properties = properties;
		this.behaviours = behaviours;
	}

	/**
	 * @param  {Property} reference
	 * @return  {Object}
	 */
	addReference(reference) {
		for (let behaviour in this.behaviours) {
			behaviour.attachTo(storeableObject);
		}
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
		for (let behaviour in this.behaviours) {
			behaviour.DetachFrom(storeableObject);
		}
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
