import { PropertyList, LabelListProperty, ParameterCategory } from '../UI/ParameterEditor/Property.js';

/**
 * Infer a reasonable label string when loading older save objects that do not
 * explicitly store labelString.
 * @param {Object} restoreObject
 * @param {boolean} isNode
 * @return {string}
 */
function inferLegacyLabelString(restoreObject, isNode) {
	if (!restoreObject) {
		return isNode ? 'node' : 'tensor';
	}
	switch (restoreObject.classname) {
		case 'TrussNode':
		case 'PerformanceTrussNode':
		case 'WalkTruss':
		case 'GovenorTruss':
		case 'ScrollerTruss':
			return 'truss';
		case 'Selector':
			return 'selector';
		case 'KeySensorNode':
			return 'keysensor';
		case 'ProximitySensorNode':
		case 'CollisionSensorNode':
		case 'BounceSensorNode':
		case 'PositionNode':
		case 'HTMLEditNode':
		case 'PropertyUpdateNode':
			return 'sensor';
		case 'ProtagonistNode':
			return 'moveable node color';
		case 'PictureNode':
			return 'picture node';
		case 'CollectionNode':
			return 'moveable node';
		case 'JumpNode':
		case 'LeftRightNode':
		case 'LineBreakerNode':
		case 'ScrollNode':
			return 'moveable node';
		case 'Field':
			return 'field';
		case 'Spring':
			return 'spring';
		case 'PullSpring':
			return 'pullspring';
		case 'Absorber':
			return 'absorber';
		case 'DampenedSpring':
			return 'spring absorber';
		case 'Tensor':
		case 'PictureSpring':
			return 'tensor';
		case 'Node':
		default:
			if (restoreObject.name == 'Earth') {
				return 'gravitywell node';
			}
			return isNode ? 'moveable node' : 'tensor';
	}
}

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
		this.overrides = new Map();
		this.behaviourAttachments = new Map();
		this.labelString=initialLabels;
		this.valueObject=valueObject;
		this.world=world;
		this.isNode = false;


		Object.defineProperty(this, 'labels', {
			get: function() {
				return this._labels;
			},
			set: function(value) {
				let previousLabels = this._labels || [];
				this._labels=value;
				if (this.world && this.world.labels && this.world.labels.behaviours) {
					this.world.labels.behaviours.sync(this, previousLabels, value);
				}
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
		if (this.valueObject) {
			for (let [key, value] of Object.entries(this.valueObject)) {
				this[key]=value;
			}
		}
		if (this.world) {
			this.refreshPropertiesAfterLabelChange();
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
					propObject[k]=Object.assign({
						sourceLabelName: label.name,
						propertyKey: k,
					}, label.properties[k]);
				}
			}
			// Object.assign(propObject, label.properties);
		}
		return propObject;
	}

	/**
	 * @param {string|Label} label
	 * @return {boolean}
	 */
	hasLabel(label) {
		if (!this.labels) {
			return false;
		}
		let labelName = typeof label == 'string' ? label : label.name;
		return this.labels.some((currentLabel) => currentLabel.name == labelName);
	}

	/**
	 * @param {number} overrideType
	 * @param {Function} override
	 */
	registerOverride(overrideType, override) {
		if (!this.overrides.has(overrideType)) {
			this.overrides.set(overrideType, new Set());
		}
		this.overrides.get(overrideType).add(override);
	}

	/**
	 * @param {number} overrideType
	 * @param {Function} override
	 */
	unregisterOverride(overrideType, override) {
		let overrides = this.overrides.get(overrideType);
		if (!overrides) {
			return;
		}
		overrides.delete(override);
		if (overrides.size == 0) {
			this.overrides.delete(overrideType);
		}
	}

	/**
	 * @param {number} overrideType
	 * @param {...*} args
	 * @return {Array}
	 */
	runOverrides(overrideType, ...args) {
		let overrides = this.overrides.get(overrideType);
		if (!overrides) {
			return [];
		}
		return Array.from(overrides).map((override) => override.call(this, ...args));
	}

	/**
	 * @param {number} overrideType
	 * @return {number}
	 */
	getOverrideCount(overrideType) {
		let overrides = this.overrides.get(overrideType);
		return overrides ? overrides.size : 0;
	}

	/**
     *
     */
	refreshPropertiesAfterLabelChange() {
		this.labels = this.world.labels.parse(this.labelString, this);
		this.properties.clearProperties(this.labelProperty);

		for (let [key, value] of Object.entries(this.getPropertyObject())) {
			this.properties.addProperty(value.propertyObject, value.defaultValue, value);
			if (this[value.propertyObject.propertyName]==undefined ||
                Number.isNaN(this[value.propertyObject.propertyName]) ||
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
		const explicitLabels = typeof restoreObject.labelString == 'string' ? restoreObject.labelString.trim() : '';
		if (explicitLabels) {
			this.labelString = restoreObject.labelString;
		} else if (!this.labelString || this.labelString.trim() == '') {
			this.labelString = inferLegacyLabelString(restoreObject, this.isNode);
		}
		
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

export { StoreableObject };
