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
     */
	addLabel(name) {
		this.list.push(new Label(name));
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
		this.addLabel(labelName);
	}

	/**
     * @param {string} labelName
     * @param {object} reference
     * @return {Label}
     */
	addReference(labelName, reference) {
		let label = findLabel(labelName);
		if (reference.isNode) {
			label.addNode(reference);
		} else {
			label.addTensor(reference);
		}
		return label;
	}

	/**
     * @param {string} labelString
     * @param {object} reference
     * @return {Label}
     */
	parse(labelString, reference) {
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
     * @param  {Property} node
     */
	addNode(node) {
		this.nodes.push(node);
	}

	/**
     * @return {Array}
     */
	getNodes() {
		return this.nodes;
	}
	/**
     * @param  {Property} tensor
     */
	addTensor(tensor) {
		this.tensors.push(tensor);
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
