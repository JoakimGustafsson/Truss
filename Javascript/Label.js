/**
 * @class
 */
class Labels {
	/**
	 */
	constructor() {
		this.list = [];

		this.massProperty = new Property(undefined,
			'mass', 'mass', 'Mass', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The mass of the node in Kilograms.');
		this.nameProperty = new Property(undefined,
			'name', 'name', 'Name', ParameteType.STRING, ParameterCategory.CONTENT,
			'The name of the node.');
		this.constantProperty = new Property(undefined,
			'constant', 'constant', 'Constant', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The tensor constant.');
		this.absorberProperty = new Property(undefined,
			'dampeningConstant', 'dampeningConstant', 'Dampening Constant', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The absorb constant.');
		this.positionProperty = new Property(undefined,
			'localPosition', 'localPosition', 'Position', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The position counted from the upper left corner.');
		this.velocityProperty = new Property(undefined,
			'velocity', 'velocity', 'velocityelocity', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The velocity.');
		this.angleProperty = new Property(undefined,
			'degree', 'degree', 'Angle', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The angle of the node.');
		this.torqueConstantProperty = new Property(undefined,
			'torqueConstant', 'torqueConstant', 'Torque constant', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'How stiff the node is with respect to attempts angle differences.');
		this.nodeFrictionProperty = new Property(undefined,
			'velocityLoss', 'velocityLoss', 'Node friction', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'How much velocity bleeds of the node (0-1, where 1 is no bleed of).');
		this.colorProperty = new Property(undefined,
			'color', 'color', 'Colour', ParameteType.STRING, ParameterCategory.CONTENT,
			'The colour of the node.');
		this.pictureProperty = new Property(undefined,
			'pictureReference', 'pictureReference', 'Picture filename', ParameteType.STRING, ParameterCategory.CONTENT,
			'The picture filename.');
		this.sizeProperty = new Property(undefined,
			'size', 'size', 'Size (1=normal)', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The picture size');
		this.equilibriumLengthProperty = new Property(undefined,
			'equilibriumLength', 'equilibriumLength', 'Length', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'How long should the relaxed spring be.');
		this.degree1Property = new Property(undefined,
			'degree1', 'degree1', 'Angle 1', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The angle the node connects to the start node.');
		this.degree2Property = new Property(undefined,
			'degree2', 'degree2', 'Angle 2', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The angle the node connects to the end node.');


		this.screenSizeProperty = new Property(undefined,
			'screenSize', 'screenSize', 'Screen size', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The size of the displayed screen in pixels.');

		this.worldSizeProperty = new Property(undefined,
			'worldSize', 'worldSize', 'World display size', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The size of the displayed worldview in that worlds measurement.');

		this.setWorldOffsetProperty = new Property(undefined,
			'setWorldOffset', 'setWorldOffset', 'View position', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The world coordinates of the upper left corner.');

		this.fpsTargetProperty = new Property(undefined, 'fpsTarget', 'fpsTarget', 'Updates per second', ParameteType.NUMBER,
			ParameterCategory.CONTENT, 'Graphical update frequency aim.');

		this.fpsProperty = new Property(undefined, 'fps', 'fps', 'Frames per Second', ParameteType.NUMBER,
			ParameterCategory.CONTENT, 'Graphical update frequency aim.');

		this.visibilityProperty = new Property(undefined,
			'visible', 'visible', 'Visible', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'Should this be visible on the screen.');

		this.snapGridProperty = new Property(undefined,
			'gridSize', 'gridSize', 'Align to grid', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'Aligning all new positions to this grid. (0 for no alignment)');

		this.enforcedProperty = new Property(undefined,
			'enforced', 'enforced', 'Enforced', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'Special parameter that only is used in labels to enforce all parameter values are enforced.');

		this.startNodeProperty = new Property(undefined,
			'node1', 'node1', 'Start node', ParameteType.NODE, ParameterCategory.CONTENT,
			'Start node.');

		this.endNodeProperty = new Property(undefined,
			'node2', 'node2', 'End node', ParameteType.NODE, ParameterCategory.CONTENT,
			'End node.');

		let nodeLabel = this.addLabel('node', [], {
			'nameProperty': '',
			'positionProperty': new Position(1, 1),
			'visibilityProperty': 1,
		});
		let tensorLabel = this.addLabel('tensor', [], {
			'visibilityProperty': 1,
			'startNodeProperty': undefined,
			'endNodeProperty': undefined,
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
			'visibilityProperty': 0,
		});
		let moveabelLabel = this.addLabel('moveable', [nodeLabel], {
			'massProperty': 1,
			'nodeFrictionProperty': 0.99,
		});
		let angleLabel = this.addLabel('angle', [nodeLabel], {
			'angleProperty': 1,
			'torqueConstantProperty': 1,
		});
		let debugtensor = this.addLabel('debugtensor', [], {
			'degree1Property': 1,
			'degree2Property': 1,
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
			'positionProperty': new Position(0, 6371e3),
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
	}

	/**
	 * @param  {Property} name
	 * @param  {List} dependencies
	 * @param  {List} properties
	 * @return {Label}
	 */
	addLabel(name, dependencies, properties) {
		if (properties) {
			for (const [key, value] of Object.entries(properties)) {
				let enforced = properties.enforcedProperty;
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
				resultList = [label, ...this.recursiveDependencies(label.dependencies, reference, resultList)];
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
				let label = this.addReference(name, reference);
				if (startList.indexOf(label) == -1) {
					startList.push(label);
				}
			}
		}
		let returnList = this.recursiveDependencies(startList, reference, startList);
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
