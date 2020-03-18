/*jshint esversion:6 */
/* global control Tensor smallnodezoom debugEntity Behaviour BehaviourOverride*/

/** This calculates force as if it was a linear spring
 * @class
 * @extends Node
 */
class SpringCalculator extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.CALCULATE, SpringCalculator.prototype.calculate);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.CALCULATE, SpringCalculator.prototype.calculate);
	}

	/**
	 * Calculate spring force
	 * @return {number}
	 */
	calculate() {
		let actualVector = this.getActual();
		let normalized = actualVector.normalizeVector(this.equilibriumLength);
		let diffVector = Vector.subtractVectors(actualVector, normalized);
		if (isNaN(diffVector.x)) {
			console.log('ERROR: Illegal Spring Force: '+this.name);
		}
		return Vector.multiplyVector(-this.constant, diffVector);
	}
}

/** This calculates force as if it was a linear spring that bends when short
 * @class
 * @extends Node
 */

/*eslint no-class-assign: 2*/
/*eslint-env es6*/
class PullCalculator extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.CALCULATE, PullCalculator.prototype.calculate);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.CALCULATE, PullCalculator.prototype.calculate);
	}

	/**
	 * Calculate pull force
	 * @return {number}
	 */
	calculate() {
		let actualVector = this.getActual();
		if ((this.equilibriumLength > 0) && (Vector.length2(actualVector) < this.equilibriumLength * this.equilibriumLength)) {
			return;
		} else {
			let actualVector = this.getActual();
			let normalized = actualVector.normalizeVector(this.equilibriumLength);
			let diffVector = Vector.subtractVectors(actualVector, normalized);
			if (isNaN(diffVector.x)) {
				console.log('ERROR: Illegal Spring Force: '+this.name);
			}
			return Vector.multiplyVector(-this.constant, diffVector);
		}
	}
}

/** This calculates force as if it was a linear spring that only pushes
 * @class
 * @extends Node
 */
class PushCalculator extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.CALCULATE, PushCalculator.prototype.calculate);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.CALCULATE, PushCalculator.prototype.calculate);
	}

	/**
	 * Calculate push force
	 * @return {number}
	 */
	calculate() {
		let actualVector = this.getActual();
		if ((this.equilibriumLength > 0) && (Vector.length2(actualVector) > this.equilibriumLength * this.equilibriumLength)) {
			return;
		} else {
			let actualVector = this.getActual();
			let normalized = actualVector.normalizeVector(this.equilibriumLength);
			let diffVector = Vector.subtractVectors(actualVector, normalized);
			return Vector.multiplyVector(-this.constant, diffVector);
		}
	}

}

/** This calculates force as if it was a linear spring that only pushes
 * @class
 * @extends Node
 */
class ImpulseCalculator extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.CALCULATE, ImpulseCalculator.prototype.calculate);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.CALCULATE, ImpulseCalculator.prototype.calculate);
	}

	/**
	 * Calculate impulse force when the distance between two nodes is less than their size1/2+size2/2
	 * @return {number}
	 */
	calculate() {
		let snugDistance = this.node1.size+this.node2.size;
		let actualVector = this.getActual();
		let actualVectorLength = Vector.length(actualVector);
		if (snugDistance < actualVectorLength) {
			return;
		} else {
			let elasticModulus1 = this.node1.elasticModulus || 1;
			let elasticModulus2 = this.node2.elasticModulus || 1;
			let elasticModulus = 1/(1/elasticModulus1+1/elasticModulus2);
			if (snugDistance==0) {
				return;
			}
			let normalized = actualVector.normalizeVector(snugDistance);
			let diffVector = Vector.subtractVectors(actualVector, normalized);
			
			if (isNaN(diffVector.x)) {
				console.log('ERROR: Illegal Spring Force: '+this.name);
			}
			debugEntity.breakAt(this.node1, undefined, undefined, 10);

			return Vector.multiplyVector(-elasticModulus, diffVector);
		}
	}
} 


//ok, we need to let each calculator generate its own force, return it and then add them together
//in for example the calculateForce function
//rewrite the caller function to have another verson that adds together the results

/** This calculates force as if it was a field
 * @class
 * @extends Node
 */
class FieldCalculator extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.CALCULATE, FieldCalculator.prototype.calculate);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.CALCULATE, FieldCalculator.prototype.calculate);
	}

	/**
	 * Calculate field strength
	 * @return {number}
	 */
	calculate() {
		let actualVector = this.getActual();
		let normalized = actualVector.normalizeVector(1);
		let forceSize = this.constant * this.node1.mass * this.node2.mass / this.getLengthSquare();
		return Vector.multiplyVector(-forceSize, normalized);
	}

}


/** This calculates displacement prevention force based on relative velocity.
 * Acts as a dampener that absorbs quick changes in tensor length
 * @class
 * @extends Node
 */
class AbsorbCalculator extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.POSTCALCULATE, AbsorbCalculator.prototype.calculate);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.POSTCALCULATE, AbsorbCalculator.prototype.calculate);
	}

	/**
	 * Calculate the displacement force based on relative velocitychange a tensor executes

	 * @return {number}
	 */
	calculate() {
		let actualVector = this.getActual();
		let internalSpeed = Vector.subtractVectors(this.node1.velocity, this.node2.velocity);
		let parallellVelocity = Vector.multiplyVector(
			Vector.dotProduct(actualVector, internalSpeed),
			Vector.divideVector(actualVector, this.getLengthSquare()));
		return Vector.multiplyVector(this.dampeningConstant, parallellVelocity);
	}

}
