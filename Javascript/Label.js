/**
 * @class
 */
class Labels {
	/**
     */
	constructor() {
		this.list = [];
	}

	/**
     * @param  {Property} name
     * @return {Label}
     */
	addLabel(name) {
		let label = new Label(name);
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
		for (let l of this.list) {
			if (l.name==labelName) {
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
     * @param {string} labelString
     * @param {object} reference
     * @return {Label}
     */
	parse(labelString, reference) {
		this.clearOldReferences(reference);
		let stringList = labelString.toLowerCase().split(/[\s,]+/);
		let returnList=[];
		for (let name of stringList) {
			returnList.push(this.addReference(name, reference));
		}
		return returnList;
	}
}

/**
 * @class
 */
class Label {
	/**
     * @param {string} name
     */
	constructor(name) {
		this.name = name;
		this.nodes = [];
		this.tensors = [];
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
     */
	clearOldReference(reference) {
		if (reference.isNode) {
			removeIfPresent(reference, this.nodes);
		} else {
			removeIfPresent(reference, this.tensors);
		}
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




Behaviours replaces sensors and actuators.

Given a list of special labels, new functionality, properties and labels are added
