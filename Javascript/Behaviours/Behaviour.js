/*jshint esversion:6 */
/* global control Tensor smallnodezoom debugEntity*/

let BehaviourOverride = {
	SHOW: 1,
	UPDATEPOSITION: 2,
	CALCULATE: 3,
	POSTCALCULATE: 4,
	TORQUE: 5,
	SENSE: 6,
	COLLIDE: 7,
	PREUPDATEPOSITION: 8,
	POSTUPDATEPOSITION: 9,
	ROTATE: 10,
};

/**
 * @class
 */
class Behaviour {
	/**
	 *
	 */
	constructor() {
		// Adding parameters here
	}
}

/**
 * Registry that binds labels to behavior implementations.
 */
class Behaviours {
	constructor() {
		this.registry = new Map();
	}

	/**
	 * @param {string} labelName
	 * @param {typeof Behaviour} BehaviourClass
	 */
	register(labelName, BehaviourClass) {
		let normalizedLabelName = labelName.toLowerCase();
		if (!this.registry.has(normalizedLabelName)) {
			this.registry.set(normalizedLabelName, []);
		}
		this.registry.get(normalizedLabelName).push(BehaviourClass);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 * @param {Array} previousLabels
	 * @param {Array} nextLabels
	 */
	sync(storeableObject, previousLabels = [], nextLabels = []) {
		if (!storeableObject) {
			return;
		}

		if (!storeableObject.behaviourAttachments) {
			storeableObject.behaviourAttachments = new Map();
		}

		let previousNames = new Set(previousLabels.map((label) => label.name));
		let nextNames = new Set(nextLabels.map((label) => label.name));

		for (let labelName of previousNames) {
			if (!nextNames.has(labelName)) {
				this.detachLabel(storeableObject, labelName);
			}
		}

		for (let labelName of nextNames) {
			if (!previousNames.has(labelName)) {
				this.attachLabel(storeableObject, labelName);
			}
		}
	}

	/**
	 * @param {StoreableObject} storeableObject
	 * @param {string} labelName
	 */
	attachLabel(storeableObject, labelName) {
		if (storeableObject.behaviourAttachments.has(labelName)) {
			return;
		}

		let BehaviourClasses = this.registry.get(labelName);
		if (!BehaviourClasses) {
			return;
		}

		let behaviours = BehaviourClasses.map((BehaviourClass) => new BehaviourClass());
		for (let behaviour of behaviours) {
			behaviour.attachTo(storeableObject);
		}
		storeableObject.behaviourAttachments.set(labelName, behaviours);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 * @param {string} labelName
	 */
	detachLabel(storeableObject, labelName) {
		let behaviours = storeableObject.behaviourAttachments.get(labelName);
		if (!behaviours) {
			return;
		}

		for (let behaviour of behaviours) {
			behaviour.detachFrom(storeableObject);
		}
		storeableObject.behaviourAttachments.delete(labelName);
	}
}

export { BehaviourOverride, Behaviour, Behaviours };
