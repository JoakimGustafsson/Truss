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
}
