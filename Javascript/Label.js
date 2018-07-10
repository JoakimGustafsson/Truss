/**
 * @class
 */
class Labels {
	/**
	 */
	constructor() {
		this.list = [];

		let massProperty = new Property(this,
			'mass', 'mass', 'Mass', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The mass of the node in Kilograms.');
		let nameProperty = new Property(this,
			'name', 'name', 'Name', ParameteType.STRING, ParameterCategory.CONTENT,
			'The name of the node.');
		let constantProperty = new Property(this,
			'constant', 'constant', 'Constant', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The tensor constant.');
		let absorberProperty = new Property(this,
			'dampeningConstant', 'dampeningConstant', 'Dampening Constant', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The absorb constant.');
		let positionProperty = new Property(this,
			'localPosition', 'localPosition', 'Position', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The position counted from the upper left corner.');
		let angleProperty = new Property(this,
			'degree', 'degree', 'Angle', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The angle of the node.');
		let torqueConstantProperty = new Property(this,
			'torqueConstant', 'torqueConstant', 'Torque constant', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'How stiff the node is with respect to attempts angle differences.');
		let nodeFrictionProperty = new Property(this,
			'velocityLoss', 'velocityLoss', 'Node friction', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'How much velocity bleeds of the node (0-1, where 1 is no bleed of).');
		let colorProperty = new Property(this,
			'color', 'color', 'Colour', ParameteType.STRING, ParameterCategory.CONTENT,
			'The colour of the node.');
		let pictureProperty = new Property(this,
			'pictureReference', 'pictureReference', 'Picture filename', ParameteType.STRING, ParameterCategory.CONTENT,
			'The picture filename.');
		let sizeProperty = new Property(this,
			'size', 'size', 'Size (1=normal)', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The picture size');


		let nodeLabel = this.addLabel('node', [], [nameProperty, positionProperty]);
		let tensorLabel = this.addLabel('tensor', [], []);
		let pullLabel = this.addLabel('pullspring', [tensorLabel], [constantProperty]);
		let pushLabel = this.addLabel('pushspring', [tensorLabel], [constantProperty]);
		let springLabel = this.addLabel('spring', [tensorLabel], [constantProperty]);
		let fieldLabel = this.addLabel('fieldspring', [tensorLabel], [constantProperty]);
		let absorbLabel = this.addLabel('absorber', [tensorLabel], [absorberProperty]);
		let movabelLabel = this.addLabel('moveable', [nodeLabel], [massProperty, nodeFrictionProperty]);
		let angleLabel = this.addLabel('angle', [nodeLabel], [angleProperty, torqueConstantProperty]);
		let colorLabel = this.addLabel('color', [nodeLabel], [colorProperty]);
		let pictureLabel = this.addLabel('picture', [nodeLabel], [pictureProperty, sizeProperty]);
		let dampLabel = this.addLabel('dampenedspring', [springLabel, absorbLabel], []);
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
			return;
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
		if (!label) {
			return;
		}
		label.addReference(reference);
		return label;
	}

	/**
	 * @param {List} startList
	 * @return {List}
	 */
	recursiveDependencies(startList) {
		if (startList && startList.length==0) {
			return [];
		}
		let returnList=[];
		for (let label of startList) {
			returnList = [...returnList, label, ...this.recursiveDependencies(label.dependencies)];
		}
		return returnList;
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
				startList.push(this.addReference(name, reference));
			}
		}
		let returnList = this.recursiveDependencies(startList);
		Ensure that these are also added references to
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
	 */
	addReference(reference) {
		if (reference.isNode) {
			this.nodes.push(reference);
		} else {
			this.tensors.push(reference);
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
