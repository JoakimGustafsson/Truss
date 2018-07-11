/**
 * @class
 */
class Labels {
	/**
	 */
	constructor() {
		this.list = [];

		let massProperty = new Property(undefined,
			'mass', 'mass', 'Mass', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The mass of the node in Kilograms.');
		let nameProperty = new Property(undefined,
			'name', 'name', 'Name', ParameteType.STRING, ParameterCategory.CONTENT,
			'The name of the node.');
		let constantProperty = new Property(undefined,
			'constant', 'constant', 'Constant', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The tensor constant.');
		let absorberProperty = new Property(undefined,
			'dampeningConstant', 'dampeningConstant', 'Dampening Constant', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The absorb constant.');
		let positionProperty = new Property(undefined,
			'localPosition', 'localPosition', 'Position', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The position counted from the upper left corner.');
		let angleProperty = new Property(undefined,
			'degree', 'degree', 'Angle', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The angle of the node.');
		let torqueConstantProperty = new Property(undefined,
			'torqueConstant', 'torqueConstant', 'Torque constant', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'How stiff the node is with respect to attempts angle differences.');
		let nodeFrictionProperty = new Property(undefined,
			'velocityLoss', 'velocityLoss', 'Node friction', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'How much velocity bleeds of the node (0-1, where 1 is no bleed of).');
		let colorProperty = new Property(undefined,
			'color', 'color', 'Colour', ParameteType.STRING, ParameterCategory.CONTENT,
			'The colour of the node.');
		let pictureProperty = new Property(undefined,
			'pictureReference', 'pictureReference', 'Picture filename', ParameteType.STRING, ParameterCategory.CONTENT,
			'The picture filename.');
		let sizeProperty = new Property(undefined,
			'size', 'size', 'Size (1=normal)', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The picture size');
		let equilibriumLength = new Property(undefined,
			'equilibriumLength', 'equilibriumLength', 'Length', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'How long should the relaxed spring be.');
		let degree1 = new Property(undefined,
			'degree1', 'degree1', 'Angle 1', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The angle the node connects to the start node.');
		let degree2 = new Property(undefined,
			'degree2', 'degree2', 'Angle 2', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The angle the node connects to the end node.');


		let screenSize = new Property(undefined,
			'screenSize', 'screenSize', 'Screen size', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The size of the displayed screen in pixels.');

		let worldSize = new Property(undefined,
			'worldSize', 'worldSize', 'World display size', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The size of the displayed worldview in that worlds measurement.');

		let setWorldOffset = new Property(undefined,
			'setWorldOffset', 'setWorldOffset', 'View position', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The world coordinates of the upper left corner.');

		let fpsTarget = new Property(undefined, 'fpsTarget', 'fpsTarget', 'Updates per second', ParameteType.NUMBER,
			ParameterCategory.CONTENT, 'Graphical update frequency aim.');

		let fps = new Property(undefined, 'fps', 'fps', 'Frames per Second', ParameteType.NUMBER,
			ParameterCategory.CONTENT, 'Graphical update frequency aim.');


		let nodeLabel = this.addLabel('node', [], [nameProperty, positionProperty]);
		let tensorLabel = this.addLabel('tensor', [], []);
		let pullLabel = this.addLabel('pullspring', [tensorLabel], [constantProperty, equilibriumLength]);
		let pushLabel = this.addLabel('pushspring', [tensorLabel], [constantProperty, equilibriumLength]);
		let springLabel = this.addLabel('spring', [tensorLabel], [constantProperty, equilibriumLength]);
		let fieldLabel = this.addLabel('fieldspring', [tensorLabel], [constantProperty]);
		let absorbLabel = this.addLabel('absorber', [tensorLabel], [absorberProperty]);
		let movabelLabel = this.addLabel('moveable', [nodeLabel], [massProperty, nodeFrictionProperty]);
		let angleLabel = this.addLabel('angle', [nodeLabel], [angleProperty, torqueConstantProperty]);
		let debugtensor = this.addLabel('debugtensor', [], [degree1, degree2]);
		let colorLabel = this.addLabel('color', [], [colorProperty]);
		let pictureLabel = this.addLabel('picture', [nodeLabel], [pictureProperty, sizeProperty]);
		let dampLabel = this.addLabel('dampenedspring', [springLabel, absorbLabel], []);
		let trussLabel = this.addLabel('truss', [], [screenSize, worldSize, setWorldOffset, fpsTarget, fps]);
	}

	/**
	 * @param  {Property} name
	 * @param  {List} dependencies
	 * @param  {List} properties
	 * @return {Label}
	 */
	addLabel(name, dependencies, properties) {
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
			labelName='EmptyName';
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
		if (startList && startList.length==0) {
			return resultList;
		}
		for (let label of startList) {
			if (resultList.indexOf(label)==-1) {
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
			if (name!='') {
				let label = this.addReference(name, reference);
				if (startList.indexOf(label)==-1) {
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
			displayDiv.innerHTML='';
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
		this.dependencies=dependencies;
		this.properties=properties;
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
		return this.nodes.length+this.tensors.length;
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
