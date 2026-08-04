/*jshint esversion:6 */
/* global control Tensor smallnodezoom debugEntity Behaviour BehaviourOverride*/
import { Vector } from '../Primitives.js';
import { Behaviour, BehaviourOverride } from './Behaviour.js';

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
		if (!this.constant || this.equilibriumLength === undefined || this.equilibriumLength === null || this.equilibriumLength <= 0) {
			console.warn(`Spring calculator invalid properties: constant=${this.constant}, equilibriumLength=${this.equilibriumLength} on ${this.name}`);
			return new Vector(0, 0);
		}
		let actualVector = this.getActual();
		if (isNaN(actualVector.x) || isNaN(actualVector.y)) {
			console.warn(`Spring calculator NaN vector detected on tensor "${this.name}" between nodes "${this.node1?.name || 'Unknown'}" and "${this.node2?.name || 'Unknown'}". Vector: (${actualVector.x}, ${actualVector.y})`);
			return new Vector(0, 0);
		}
		let normalized = actualVector.normalizeVector(this.equilibriumLength);
		let diffVector = Vector.subtractVectors(actualVector, normalized);
		if (isNaN(diffVector.x) || isNaN(diffVector.y)) {
			console.error(`ERROR: Illegal Spring Force on tensor "${this.name}" between nodes "${this.node1?.name || 'Unknown'}" and "${this.node2?.name || 'Unknown'}". DiffVector: (${diffVector.x}, ${diffVector.y})`);
			return new Vector(0, 0);
		}
		if (isNaN(this.constant)) {
			console.warn(`⚠️ Spring calculator: constant is NaN on tensor "${this.name}"`);
			return new Vector(0, 0);
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
		if (!this.constant || this.equilibriumLength === undefined || this.equilibriumLength === null || this.equilibriumLength <= 0) {
			console.warn(`Pull calculator invalid properties: constant=${this.constant}, equilibriumLength=${this.equilibriumLength} on ${this.name}`);
			return new Vector(0, 0);
		}
		let actualVector = this.getActual();
		if (isNaN(actualVector.x) || isNaN(actualVector.y)) {
			console.warn(`Pull calculator NaN vector detected on tensor "${this.name}" between nodes "${this.node1?.name || 'Unknown'}" and "${this.node2?.name || 'Unknown'}". Vector: (${actualVector.x}, ${actualVector.y})`);
			return new Vector(0, 0);
		}
		if ((this.equilibriumLength > 0) && (Vector.length2(actualVector) < this.equilibriumLength * this.equilibriumLength)) {
			return new Vector(0, 0);
		} else {
			let normalized = actualVector.normalizeVector(this.equilibriumLength);
			let diffVector = Vector.subtractVectors(actualVector, normalized);
			if (isNaN(diffVector.x) || isNaN(diffVector.y)) {
				console.error(`ERROR: Illegal Spring Force on tensor "${this.name}" between nodes "${this.node1?.name || 'Unknown'}" and "${this.node2?.name || 'Unknown'}". DiffVector: (${diffVector.x}, ${diffVector.y})`);
				return new Vector(0, 0);
			}
			if (isNaN(this.constant)) {
				console.warn(`⚠️ Pull calculator: constant is NaN on tensor "${this.name}"`);
				return new Vector(0, 0);
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
		if (!this.constant || this.equilibriumLength === undefined || this.equilibriumLength === null || this.equilibriumLength <= 0) {
			console.warn(`Push calculator invalid properties: constant=${this.constant}, equilibriumLength=${this.equilibriumLength} on ${this.name}`);
			return new Vector(0, 0);
		}
		let actualVector = this.getActual();
		if (isNaN(actualVector.x) || isNaN(actualVector.y)) {
			console.warn(`Push calculator NaN vector detected on tensor "${this.name}" between nodes "${this.node1?.name || 'Unknown'}" and "${this.node2?.name || 'Unknown'}". Vector: (${actualVector.x}, ${actualVector.y})`);
			return new Vector(0, 0);
		}
		if ((this.equilibriumLength > 0) && (Vector.length2(actualVector) > this.equilibriumLength * this.equilibriumLength)) {
			return new Vector(0, 0);
		} else {
			let normalized = actualVector.normalizeVector(this.equilibriumLength);
			let diffVector = Vector.subtractVectors(actualVector, normalized);
			if (isNaN(diffVector.x) || isNaN(diffVector.y)) {
				console.error(`ERROR: Illegal Spring Force on tensor "${this.name}" between nodes "${this.node1?.name || 'Unknown'}" and "${this.node2?.name || 'Unknown'}". DiffVector: (${diffVector.x}, ${diffVector.y})`);
				return new Vector(0, 0);
			}
			if (isNaN(this.constant)) {
				console.warn(`⚠️ Push calculator: constant is NaN on tensor "${this.name}"`);
				return new Vector(0, 0);
			}
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
		if (isNaN(actualVector.x) || isNaN(actualVector.y)) {
			console.warn(`Impulse calculator NaN vector detected on tensor "${this.name}" between nodes "${this.node1?.name || 'Unknown'}" and "${this.node2?.name || 'Unknown'}". Vector: (${actualVector.x}, ${actualVector.y})`);
			return new Vector(0, 0);
		}
		let actualVectorLength = Vector.length(actualVector);
		if (snugDistance < actualVectorLength) {
			return new Vector(0, 0);
		} else {
			let elasticModulus1 = this.node1.elasticModulus || 1;
			let elasticModulus2 = this.node2.elasticModulus || 1;
			let elasticModulus = 1/(1/elasticModulus1+1/elasticModulus2);
			if (snugDistance==0) {
				return new Vector(0, 0);
			}
			let normalized = actualVector.normalizeVector(snugDistance);
			let diffVector = Vector.subtractVectors(actualVector, normalized);
			
			if (isNaN(diffVector.x) || isNaN(diffVector.y)) {
				console.error(`ERROR: Illegal Spring Force on tensor "${this.name}" between nodes "${this.node1?.name || 'Unknown'}" and "${this.node2?.name || 'Unknown'}". DiffVector: (${diffVector.x}, ${diffVector.y})`);
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
		if (!this.constant) {
			console.warn(`⚠️ Field calculator missing constant property on ${this.name}`);
			return new Vector(0, 0);
		}
		
		// Skip field calculations for UI nodes (no mass)
		if (!this.node1 || !this.node2) {
			return new Vector(0, 0);
		}
		
		// Skip field calculations for nodes marked with 'nogravity' label
		// The 'nogravity' label is used for nodes that should not be affected by gravity fields
		// (typically UI elements like banner top nodes that are anchored or controlled by springs)
		const hasNoGravity1 = this.node1.labels && this.node1.labels.some(label => label.name === 'nogravity');
		const hasNoGravity2 = this.node2.labels && this.node2.labels.some(label => label.name === 'nogravity');
		
		if (hasNoGravity1 || hasNoGravity2) {
			return new Vector(0, 0);
		}
		
		let actualVector = this.getActual();
		if (isNaN(actualVector.x) || isNaN(actualVector.y)) {
			console.warn(`⚠️ Field calculator NaN vector detected on tensor "${this.name}" between nodes "${this.node1?.name || 'Unknown'}" and "${this.node2?.name || 'Unknown'}". Vector: (${actualVector.x}, ${actualVector.y})`);
			return new Vector(0, 0);
		}
		let normalized = actualVector.normalizeVector(1);
		
		// Check for NaN/undefined in mass properties - skip if either node is a UI node
		let mass1 = this.node1?.mass;
		let mass2 = this.node2?.mass;
		
		// If nodes have no mass (UI nodes), skip field calculation
		if (mass1 === undefined || mass1 === null || isNaN(mass1)) {
			if (this.node1) {
				console.log(`ℹ️ Field calculator skipping: node1 "${this.node1.name}" is a UI node (no mass)`);
			}
			return new Vector(0, 0);
		}
		if (mass2 === undefined || mass2 === null || isNaN(mass2)) {
			if (this.node2) {
				console.log(`ℹ️ Field calculator skipping: node2 "${this.node2.name}" is a UI node (no mass)`);
			}
			return new Vector(0, 0);
		}
		
		let lengthSquare = this.getLengthSquare();
		if (lengthSquare === 0) {
			console.warn(`⚠️ Field calculator: nodes "${this.node1?.name}" and "${this.node2?.name}" are at the same position, distance is 0`);
			return new Vector(0, 0);
		}
		
		let forceSize = this.constant * mass1 * mass2 / lengthSquare;
		if (isNaN(forceSize)) {
			console.warn(`⚠️ Field calculator: forceSize is NaN. constant=${this.constant}, mass1=${mass1}, mass2=${mass2}, lengthSquare=${lengthSquare}`);
			return new Vector(0, 0);
		}
		
		let force = Vector.multiplyVector(-forceSize, normalized);
		
		// Y-axis negation is ONLY for display coordinate systems where Y is inverted for rendering
		// For world coordinate systems (like solar system), skip the negation to maintain correct gravity direction
		const node2HasDisplayCoordSys = this.node2.coordinateSystem && this.node2.coordinateSystem.isDisplay && this.node2.coordinateSystem.isDisplay();
		if (node2HasDisplayCoordSys) {
			// With Y-axis flipped in display coords (up = positive), negate Y component to maintain correct direction
			force.y = -force.y;
		}
		
		return force;
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
		storeableObject.registerOverride(BehaviourOverride.CALCULATE, AbsorbCalculator.prototype.calculate);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.CALCULATE, AbsorbCalculator.prototype.calculate);
	}

	/**
	 * Calculate the displacement force based on relative velocitychange a tensor executes

	 * @return {number}
	 */
	calculate() {
		// Guard against missing dampening constant
		if (!this.dampeningConstant || this.dampeningConstant === undefined || this.dampeningConstant === null) {
			console.log(`ℹ️ Absorber calculator: no dampeningConstant on tensor "${this.name}"`);
			return new Vector(0, 0);
		}
		
		let actualVector = this.getActual();
		if (isNaN(actualVector.x) || isNaN(actualVector.y)) {
			console.warn(`⚠️ Absorber calculator NaN vector detected on tensor "${this.name}"`);
			return new Vector(0, 0);
		}
		
		if (!this.node1 || !this.node2) {
			return new Vector(0, 0);
		}
		
		let internalSpeed = Vector.subtractVectors(this.node1.velocity, this.node2.velocity);
		
		// Guard against NaN velocities (e.g., when node has mass: NaN)
		if (!this.node1.velocity || !this.node2.velocity ||
			isNaN(internalSpeed.x) || isNaN(internalSpeed.y)) {
			return new Vector(0, 0);
		}
		
		let lengthSquare = this.getLengthSquare();
		
		// Safety check: if length is too small (near zero), skip calculation to avoid division issues
		if (lengthSquare === 0 || lengthSquare < 0.0001) {
			return new Vector(0, 0);
		}
		
		let parallellVelocity = Vector.multiplyVector(
			Vector.dotProduct(actualVector, internalSpeed),
			Vector.divideVector(actualVector, lengthSquare));
		
		if (isNaN(this.dampeningConstant)) {
			console.warn(`⚠️ Absorber calculator: dampeningConstant is NaN on tensor "${this.name}"`);
			return new Vector(0, 0);
		}
		
		// Final safety check for NaN result
		if (isNaN(parallellVelocity.x) || isNaN(parallellVelocity.y)) {
			console.warn(`⚠️ Absorber calculator: parallellVelocity is NaN on tensor "${this.name}"`);
			return new Vector(0, 0);
		}
		
		return Vector.multiplyVector(this.dampeningConstant, parallellVelocity);
	}

}

function calculateSpringForce(tensor) {
	return SpringCalculator.prototype.calculate.call(tensor);
}

function calculatePullForce(tensor) {
	return PullCalculator.prototype.calculate.call(tensor);
}

function calculatePushForce(tensor) {
	return PushCalculator.prototype.calculate.call(tensor);
}

function calculateFieldForce(tensor) {
	return FieldCalculator.prototype.calculate.call(tensor);
}

function calculateAbsorberForce(tensor) {
	return AbsorbCalculator.prototype.calculate.call(tensor);
}

export {
	SpringCalculator,
	PullCalculator,
	PushCalculator,
	ImpulseCalculator,
	FieldCalculator,
	AbsorbCalculator,
	calculateSpringForce,
	calculatePullForce,
	calculatePushForce,
	calculateFieldForce,
	calculateAbsorberForce,
};
