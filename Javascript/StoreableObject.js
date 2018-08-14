/**
 * StoreableObject class
 */
class StoreableObject {
	/**
	 * @param  {World} world
	 * @param  {string} initialLabels
	 * @param  {object} valueObject
	 */
	constructor(world, initialLabels='', valueObject={}) {
		this.name='Unnamed';
		this.properties = new PropertyList();
		this.labelString=initialLabels;
		this.valueObject=valueObject;
		this.world=world;
		this.isNode = this instanceof Node;


		Object.defineProperty(this, 'labels', {
			get: function() {
				return this._labels;
			},
			set: function(value) {
				this._labels=value;
				if (this.labelChange) {
					this.labelChange(value);
				}
			},
		});

		this.labelProperty = this.addProperty(new LabelListProperty(
			'labelString', 'labelString', 'Labels', ParameterCategory.CONTENT,
			'The comma-separated list of labels'));
	}

	/** remove all references from labels to this object, thereby basically making it eligible for garbage collection
     *
     */
	unreference() {
		this.world.labels.clearOldReferences(this);
	}

	/**
     *
     */
	initialRefresh() {
		if (this.world) {
			this.refreshPropertiesAfterLabelChange();
		}
		if (this.valueObject) {
			for (let [key, value] of Object.entries(this.valueObject)) {
				this[key]=value;
			}
		}
	}

	/**
     * @return {Object}
     */
	getPropertyObject() {
		let propObject = {};
		for (let label of this.labels) {
			for (let k in label.properties) {
				if (!propObject[k] || !propObject[k].enforced) {
					propObject[k]=label.properties[k];
				}
			}
			// Object.assign(propObject, label.properties);
		}
		return propObject;
	}

	/**
     *
     */
	refreshPropertiesAfterLabelChange() {
		this.labels = this.world.labels.parse(this.labelString, this);
		this.properties.clearProperties(this.labelProperty);

		for (let [key, value] of Object.entries(this.getPropertyObject())) {
			this.properties.addProperty(value.propertyObject, value.defaultValue);
			if (this[value.propertyObject.propertyName]==undefined ||
                this[value.propertyObject.propertyName]==NaN ||
                value.enforced) {
				this[value.propertyObject.propertyName]=value.defaultValue;
			}
		}
	}

	/**
	 * @param  {Array} localNodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(localNodeList, tensorList) {
		let representation={'classname': 'StoreableObject'};
		representation.labelString=this.labelString;
		let properties = this.getPropertyObject();

		for (let propertyContainer of Object.values(properties)) {
			let property = propertyContainer.propertyObject;
			representation[property.propertyName] =
				property.serialize(this[property.propertyName], localNodeList, tensorList);
		}
		return representation;
	}


	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {StoreableObject}
	 */
	deserialize(restoreObject, nodeList, tensorList) {
		this.labelString = restoreObject.labelString;
		this.refreshPropertiesAfterLabelChange();

		let propertyObject = this.getPropertyObject();

		for (let propertyContainer of Object.values(propertyObject)) {
			let property = propertyContainer.propertyObject;
			this[property.propertyName] =
				property.deSerialize(restoreObject[property.propertyName], nodeList, tensorList);
		}

		/* super.deserialize(restoreObject);
		this.node1=nodeList[restoreObject.node1];
		this.node2=nodeList[restoreObject.node2];
		this.angle1=restoreObject.angle1;
		this.angle2=restoreObject.angle2;


		if (restoreObject.next) {
			this.next=tensorList[restoreObject.next];
		}
		if (restoreObject.previous) {
			this.previous=tensorList[restoreObject.previous];
		}
		if (restoreObject.breakStartTensor) {
			this.breakStartTensor=tensorList[restoreObject.breakStartTensor];
		}
		if (restoreObject.breakEndTensor) {
			this.breakEndTensor=tensorList[restoreObject.breakEndTensor];
		}


		this.force=restoreObject.force;
		this.ghost=restoreObject.ghost;
		this.isTensor=restoreObject.isTensor;
		this.color=restoreObject.color;

		this.labelString = restoreObject.labelString;
		this.labels = universe.currentWorld.labels.parse(this.labelString, this); */

		return this;
	}
}
