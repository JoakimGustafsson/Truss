/* global Properties LabelListProperty BehaviourOverride */

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
		this.properties = new Properties();
		this.labelString=initialLabels;
		this.labels =[];
		this.addedLabels =[];
		this.valueObject=valueObject;
		this.world=world;
		this.isNode = this instanceof Node;
		this.senseList=[];
		this.preUpdatePositionList=[];
		this.postUpdatePositionList=[];
		this.updatePositionList=[];
		this.showList=[];
		this.torqueList=[];
		this.calcList=[];
		this.calcList2=[];
		this.ghostCalcList=[];
		this.rotateList=[];
		this.collisionList=[];

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

	/**
	 */
	destroy() {
		this.unreference();
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
		//Attach the labels
		this.parsedLabels = this.world.labels.parse(this.labelString, this);
		this.labels=this.parsedLabels.slice(0);
		this.properties.clearProperties(this.labelProperty);

		//Set the properties by looping over all properties listed by all labels
		for (let [, value] of Object.entries(this.getPropertyObject())) {
			let propertyObject = value.propertyObject;
			let propertyName = propertyObject.propertyName;
			this.properties.addProperty(propertyObject, value.defaultValue);
			if (valueObject[propertyName]!=undefined) {	//setting default value
				propertyObject.assignValue(valueObject[propertyName], this);
			} else if (this[propertyName]==undefined ||
                (typeof this[propertyName]== 'number' && isNaN(this[propertyName])) ||
                value.enforced) { //handle NaN numbers and enforced defaultvalues
				if (value.defaultValue!=undefined) {
					propertyObject.assignValue(value.defaultValue, this);
				}
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
			try {
				representation[property.propertyName] =
					property.serialize(this[property.propertyName], localNodeList, tensorList);
			}
			catch(error) {
				console.log(error);
				console.log('Object name: '+this.name);
				console.log('Property name: '+property.propertyName);
			}
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
	 *
	 */
	clone() {
		let serialized = this.serialize();
		let node = objectFactory(this.world, serialized);
		node.deserialize(serialized);
		node.name+=' clone';
		return node;
	}



	/**
	 * @param  {number} type
	 * @param  {Function} newFunction
	 */
	registerOverride(type, newFunction) {
		switch(type) {
		case BehaviourOverride.SENSE:
			this.senseList.push(newFunction);
			break;
		case BehaviourOverride.UPDATEPOSITION:
			this.updatePositionList.push(newFunction);
			break;
		case BehaviourOverride.PREUPDATEPOSITION:
			this.preUpdatePositionList.push(newFunction);
			break;
		case BehaviourOverride.SHOW:
			this.showList.push(newFunction);
			break;
		case BehaviourOverride.TORQUE:
			this.torqueList.push(newFunction);
			break;
		case BehaviourOverride.CALCULATE:
			this.calcList.push(newFunction);
			break;
		case BehaviourOverride.GHOSTCALCULATE:
			alert('registering ghost');
			this.ghostCalcList.push(newFunction);
			break;
		case BehaviourOverride.POSTCALCULATE:
			this.calcList2.push(newFunction);
			break;
		case BehaviourOverride.POSTUPDATEPOSITION:
			this.postUpdatePositionList.push(newFunction);
			break;
		case BehaviourOverride.ROTATE:
			this.rotateList.push(newFunction);
			break;
		case BehaviourOverride.COLLIDE:
			this.collisionList.push(newFunction);
			break;
		}
	}

	/**
	 * @param  {number} type
	 * @param  {Function} newFunction
	 */
	unregisterOverride(type, newFunction) {
		switch(type) {
		case BehaviourOverride.SENSE:
			removeIfPresent(newFunction, this.senseList);
			break;
		case BehaviourOverride.PREUPDATEPOSITION:
			removeIfPresent(newFunction, this.preUpdatePositionList);
			break;
		case BehaviourOverride.UPDATEPOSITION:
			removeIfPresent(newFunction, this.updatePositionList);
			break;
		case BehaviourOverride.SHOW:
			removeIfPresent(newFunction, this.showList);
			break;
		case BehaviourOverride.TORQUE:
			removeIfPresent(newFunction, this.torqueList);
			break;
		case BehaviourOverride.CALCULATE:
			removeIfPresent(newFunction, this.calcList);
			break;
		case BehaviourOverride.GHOSTCALCULATE:
			removeIfPresent(newFunction, this.ghostCalcList);
			break;
		case BehaviourOverride.POSTCALCULATE:
			removeIfPresent(newFunction, this.calcList2);
			break;
		case BehaviourOverride.ROTATE:
			removeIfPresent(newFunction, this.rotateList);
			break;
		case BehaviourOverride.COLLIDE:
			removeIfPresent(newFunction, this.collisionList);
			break;
		}
	}

	/**
	 * go through the call list and call the right behaviour
	 * @param  {List} callList
	 * @param  {List} args
	 * @return {number} If the call return value is nonzero, prevent all other registered
	 * calls to this function. A final answer has been found;
	 */
	caller(callList, ...args) {
		/*if (this.isGhost && this.isGhost()) {
			if (this.ghostCalcList && callList==this.calcList ) {
				callList = this.ghostCalcList;
			}
			else {
				return;
			}
		}*/

		for (let f of callList) {
			let result = f.call(this, ...args);
			if (result) {
				return result;
			}
		}
		return 0;
	}

	/**
	 * go through the call list and call the right behaviour, but cumulatively add the results together
	 * @param  {List} callList
	 * @param {function} additionFunction
	 * @param  {List} args
	 * @return {Object} An object that is the sum (according to the addFunction) of all calls in the callList
	 */
	cumulativeCaller(callList, additionFunction,...args) {
		/*if (this.isGhost && this.isGhost()) {
			if (this.ghostCalcList && callList==this.calcList ) {
				callList = this.ghostCalcList;
			}
			else {
				return;
			}
		}*/

		let cumulative=undefined;
		for (let f of callList) {
			let result = f.call(this, ...args);
			
			if (result && isNaN(result.x)) {
				console.log('ERROR: Illegal Spring Force: '+this.name);
			}
			cumulative = additionFunction(cumulative,result);
		}
		return cumulative;
	}

	/**
	 * Update the position based on velocity, then let
	 * the this.positionFunction (if present) tell where it should actually be
	 * @param  {List} args
	 * @return {number} If the call return value is nonzero, prevent all other registered
	 * calls to this function. A final answer has been found;
	 */
	updatePosition(...args) {
		return this.caller(this.updatePositionList, ...args);
	}


	preUpdatePosition(...args){
		return this.caller(this.preUpdatePositionList, ...args);
	}

	postUpdatePosition(...args){
		return this.caller(this.postUpdatePositionList, ...args);
	}

	/**
	 * Update the position based on velocity, then let
	 * the this.positionFunction (if present) tell where it should actually be
	 * @param  {List} args
	 * @return {number} If the call return value is nonzero, prevent all other registered
	 * calls to this function. A final answer has been found;
	 */
	show(...args) {
		return this.caller(this.showList, ...args);
	}

	/**
	 * Calculate the forces acting on the object
	 * @param  {number} stage 0 for normal calculations, 1 for absorbers and other calculations that 'calms down' the world
	 * @param  {List} args
	 * @return {Force} returns the resultant force of all the applied force calculations on a tensor
	 */
	calculateForce(stage=0, ...args) {
		let list = this.calcList;
		if (stage==1) {
			list = this.calcList2;
		}

		let addVectorFunction = function (a,b) {
			if (!a) {
				return b;
			}
			if (!b) {
				return a;
			}
			return Vector.addVectors(a,b);
		};

		return this.cumulativeCaller(list, addVectorFunction, ...args);
	}

	/**
	 * Calculate the torques acting on the object (node)
	 * @param  {List} args
	 * @return {number} If the call return value is nonzero, prevent all other registered
	 * calls to this function. A final answer has been found;
	 */
	calculateTorques(...args) {
		return this.caller(this.torqueList, ...args);
	}
	/**
	 * rotate the node according to the node according to angular velocity
	 * @param  {List} args
	 * @return {number} If the call return value is nonzero, prevent all other registered
	 * calls to this function. A final answer has been found;
	 */
	rotate(...args) {
		return this.caller(this.rotateList, ...args);
	}

	/**
	 * Sense something
	 * @param  {List} args
	 * @return {number} If the call return value is nonzero, prevent all other registered
	 * calls to this function. A final answer has been found;
	 */
	sense(...args) {
		return this.caller(this.senseList, ...args);
	}

	/**
	 * This object has just collided with something
	 * @param  {List} args
	 * @return {number} If the call return value is nonzero, prevent all other registered
	 * calls to this function. A final answer has been found;
	 */
	collide(...args) {
		return this.caller(this.collisionList, ...args);
	}

	
	/**
	* Using a space separated list, list the labels that should be added
	* @param  {string} labels
	*/
	addLabelString(labels) {
		this.labelString+=labels+' ';
		this.parsedLabels=this.world.labels.parse(this.labelString, this);
		this.labels=this.parsedLabels.slice(0);
	}

	hasLabel(label){
		return label.hasMember(this);
	}


	/**
	* Adding a label to an item.
	* @param  {Label} label
	*/
	addLabel(label) {
		label.addWithDependencies(this);
	}

	/**
	* removing a label from item.
	* @param  {Label} label
	*/
	removeLabel(label) {
		label.removeWithDependencies(this);
	}

}
