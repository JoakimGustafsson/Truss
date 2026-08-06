/*jshint esversion:6 */
/* global control Tensor smallnodezoom debugEntity Behaviour BehaviourOverride*/

/** This sensor updates the debug window
 * @class
 * @extends Behaviour
 */
class DebugWindowSensor extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		//storeableObject.debugEntity=debugEntity;
		storeableObject.registerOverride(BehaviourOverride.SENSE, DebugWindowSensor.prototype.sense);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.SENSE, DebugWindowSensor.prototype.sense);

	}

	/**
	 * If the position of the controlled object bounces or leaves on the right or
	 * left side, disconnect it and restore the tensor to its original.
	 * @param {number} time
	 * @param {number} deltaTime
	 * @param {Trussnode} trussNode
	 */
	sense() {

		debugEntity.debugWindow.timeField.refresh();
		debugEntity.debugWindow.localTimeField.refresh();
		debugEntity.debugWindow.energyField.refresh();

		//debugEntity.debugWindow.shadeLevel.value=universe.currentNode.view.clearLevel;
		
		debugEntity.debugWindow.debugCounter.refresh();
		debugEntity.debugWindow.shade.refresh();
		debugEntity.debugWindow.ticks.refresh();

	}
}
