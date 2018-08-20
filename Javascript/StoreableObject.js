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
		this.updatePositionList=[];
		this.showList=[];

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
			this.refreshPropertiesAfterLabelChange(this.valueObject);
		}
		/*
		if (this.valueObject) {
			for (let [key, value] of Object.entries(this.valueObject)) {
				this[key]=value;
				we need to use something like this:
				Or send the valuelist to refresh and load there
				propertyObject.assignValue(value.defaultValue, this);	
			} 
		} */
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
	 * @param {Object} valueObject
     *
     */
	refreshPropertiesAfterLabelChange(valueObject = {}) {
		this.labels = this.world.labels.parse(this.labelString, this);
		this.properties.clearProperties(this.labelProperty);

		for (let [key, value] of Object.entries(this.getPropertyObject())) {
			let propertyObject = value.propertyObject;
			let propertyName = propertyObject.propertyName;
			this.properties.addProperty(propertyObject, value.defaultValue);
			if (valueObject[propertyName]) {
				propertyObject.assignValue(valueObject[propertyName], this);
			} else if (this[propertyName]==undefined ||
                this[propertyName]==NaN ||
                value.enforced) {
				propertyObject.assignValue(value.defaultValue, this);	
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

		return this;
	}



	/**
	 * @param  {number} type
	 * @param  {Function} newFunction
	 */
	registerOverride(type, newFunction) {
		switch(type) {
			case BehaviourOverride.UPDATEPOSITION:
				this.updatePositionList.push(newFunction);
				break;
			case BehaviourOverride.SHOW:
				this.showList.push(newFunction);
				break;
		}
	}

	/**
	 * @param  {number} type
	 * @param  {Function} newFunction
	 */
	unregisterOverride(type, newFunction) {
		switch(type) {
			case BehaviourOverride.UPDATEPOSITION:
				removeIfPresent(newFunction, this.updatePositionList);
				break;
			case BehaviourOverride.SHOW:
				removeIfPresent(newFunction, this.showList);
				break;
		}
	}

	
	/**
	 * Update the position based on velocity, then let
	 * the this.positionFunction (if present) tell where it should actually be
	 * @param  {List} args
	 * @return {number} If the call return value is nonzero, prevent all other registered
	 * calls to this function. A final answer has been found;
	 */
	updatePosition(...args) {
		for (let f of this.updatePositionList) {
			let result = f.call(this, ...args);
			if (result) {
				return result;
			}
		}
		return 0;
	}

	/**
	 * Update the position based on velocity, then let
	 * the this.positionFunction (if present) tell where it should actually be
	 * @param  {List} args
	 * @return {number} If the call return value is nonzero, prevent all other registered
	 * calls to this function. A final answer has been found;
	 */
	show(...args) {
		for (let f of this.showList) {
			let result = f.call(this, ...args);
			if (result) {
				return result;
			}
		}
		return 0;
	}

}
