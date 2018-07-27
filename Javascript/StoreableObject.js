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

		this.labelProperty = this.addProperty(new Property(this,
			'labelString', 'labelString', 'Labels', ParameteType.LABELLIST, ParameterCategory.CONTENT,
			'The comma-separated list of labels'));
	}

	/**
     *
     */
	initialRefresh() {
		this.refreshPropertiesAfterLabelChange();

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
			Object.assign(propObject, label.properties);
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
			if (!this[value.propertyObject.propertyName] ||
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
		let representation={'classname': 'Tensor'};
		representation.node1=localNodeList.indexOf(this.node1);
		representation.node2=localNodeList.indexOf(this.node2);

		representation.labelString=this.labelString;
		let properties = this.getPropertyObject();

		if (this.breakStartTensor) {
			representation.breakStartTensor=tensorList.indexOf(this.breakStartTensor);
		}
		if (this.breakEndTensor) {
			representation.breakEndTensor=tensorList.indexOf(this.breakEndTensor);
		}
		if (this.next) {
			representation.next=tensorList.indexOf(this.next);
		}
		if (this.previous) {
			representation.previous=tensorList.indexOf(this.previous);
		}

		representation.angle1= isNaN(this.angle1) ? 'NaN' : this.angle1;
		representation.angle2= isNaN(this.angle2) ? 'NaN' : this.angle2;
		representation.force=this.force;
		representation.ghost=this.ghost;
		representation.isTensor=this.isTensor;
		representation.color=this.color;
		representation.labelString=this.labelString;

		return representation;
	}
}
