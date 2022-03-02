/*jshint esversion:6 */
/* global control Tensor smallnodezoom debugEntity Behaviour BehaviourOverride*/

/** This assumes a CollisionSensor behaviour already has been added to the node and that
 * this CollisionSensor calls the collide() function. This behaviour is attached to tensors
 * 
 *  The actual behavior is that the tensor behaves like a rubber band.
 * 
 * @class
 * @extends Behaviour
 */
class CollisionBounce extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) { 
		storeableObject.registerOverride(BehaviourOverride.COLLIDE, CollisionBounce.prototype.collide);
		storeableObject.recalcStretch=this.recalcStretch;


	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.COLLIDE, CollisionBounce.prototype.collide);
		storeableObject.recalcStretch=undefined;
	}

	recalcStretch(originalTensor) {
	
		let startTensor = originalTensor.brokendata.startTensor;
	
		let counter=1;
		for (let i = startTensor ; i && i.brokendata ; i=i.brokendata.nextTensor) {
			i.name=originalTensor.name+' '+(counter++);
		}
	
		let totalStretchedLength = 0;
		let numberOfTensors=0;
		for (let i = startTensor ; i!=undefined ; i=i.brokendata.nextTensor) {
			totalStretchedLength+=i.getLength();
			numberOfTensors++;
		} 
	
		//let originalStretch = originalTensor.getLength()-originalTensor.equilibriumLength;
	
		let elongationPerTensor = (totalStretchedLength-originalTensor.equilibriumLength)/numberOfTensors;
		
		for (let i = startTensor ; i!=undefined ; i=i.brokendata.nextTensor) {
			i.equilibriumLength = i.getLength() - elongationPerTensor;
		}
	}


	/**
	 * @param {Object} details
	 */
	collide(details) {

		let firstBroken = (tensor, endTensor) => {
			tensor.broken = true;
			endTensor.broken = true;
			let startTensor = tensor.clone(); 
			//let bounceTensorManagementLabel = this.bounceTensorManagementLabel || this.world.labels.findLabel('bouncetensormanagement');
	
			startTensor.broken = true;
			tensor.ghostify();
			tensor.brokendata = {
				'startTensor': startTensor,
				'parentTensor': tensor
			};
			return startTensor;
		};


		let newTensors = [];
		
		let tensorToBreak = details[0].tensor;
		for (let detail of details) {

			let startTensor;
			let endTensor = tensorToBreak.clone(); 
			newTensors.push(endTensor);
			let tempDummy=0;

			if (!tensorToBreak.broken) { // The first break of a tensor
				startTensor = firstBroken(tensorToBreak, endTensor);
				
				endTensor.brokendata = tensorToBreak.brokendata;
				startTensor.brokendata = {
					'parentTensor':tensorToBreak
				};
				newTensors.push(startTensor);
				tensorToBreak.registerOverride(BehaviourOverride.POSTUPDATEPOSITION, CollisionBounce.prototype.handleBrokenTensors);

			} else { 
				
				if (debugCycle(tensorToBreak, detail.collider)) {

					//if there is a second hit from the same side. remove the old hit.angle

					console.log('*******************BEFORE Collition node: '+detail.collider.name);
					console.log('*******************BEFORE Collition tensor: '+tensorToBreak.name);
					debugBounce(tensorToBreak);
					debugEntity.smallnodezoom(detail.collider);
				}

				endTensor.brokendata = tensorToBreak.brokendata;
				startTensor = tensorToBreak;
				startTensor.brokendata = {
					'parentTensor':tensorToBreak.brokendata.parentTensor
				};
				endTensor.broken=true;
				tempDummy=1;
				
			}


			startTensor.brokendata.nextTensor=endTensor;
			startTensor.brokendata.from=detail.from;

		
			startTensor.node2=detail.collider;
			endTensor.node1=detail.collider;
			tensorToBreak=startTensor;
			if (tempDummy){ 
				console.log('*******************AFTER Collition:'+detail.collider.name);
				debugBounce(endTensor);
			}
		}

		this.recalcStretch(tensorToBreak.brokendata.parentTensor);
		return newTensors;
	}

	/*
	preUpdate(trussTime, deltaTime){
		function swap(previous, tensor, next) {
			let node1=tensor.node1;
			let node2=tensor.node2;
			let velocity1=node1.velocity;
			let velocity2=node2.velocity;
			let newPosition1=
			Vector.addVectors(node1.localPosition, Vector.multiplyVector(deltaTime, velocity1));
			let newPosition2=
			Vector.addVectors(node2.localPosition, Vector.multiplyVector(deltaTime, velocity2));
	
			let howFar1=getT(node1.localPosition, node2.localPosition,newPosition1);
			let howFar2=getT(node1.localPosition, node2.localPosition,newPosition2);

			if (howFar1>howFar2) {
				previous.node2=tensor.node2;
				let tempfrom = previous.brokendata.from;
				previous.brokendata.from=tensor.brokendata.from;
				next.node1=tensor.node1;
				tensor.brokendata.from=tempfrom;
				let temp=tensor.node1;
				tensor.node1=tensor.node2;
				tensor.node2=temp;
			}
		}

		//Calcualte the new places of both ends
		//look along the tensor and see if they have changed places
		//then reconnect the end tensors

		
		//debugEntity.breakAt(this.node1, undefined, 'newball_3', -5);	

		//debugEntity.breakWhen(5.39);

		let previous = this.brokendata.startTensor;
		for (let i = previous.brokendata.nextTensor ; i && i.brokendata && i.brokendata.nextTensor!=undefined ; i=i.brokendata.nextTensor) {
			swap(previous, i, i.brokendata.nextTensor);
			previous=i;
		}
	} */

		
	/**
	 * If the angle between the tensors is more than 180 degrees, cut the node free.
	 * @return {number}
	 */
	handleBrokenTensors() {
		function loosen(originalTensor, thisTensor) {
			let node = thisTensor.node2;
			let from =  thisTensor.brokendata.from;

			let startangle = thisTensor.getTensorAngle(node);
			let endangle = thisTensor.brokendata.nextTensor.getTensorAngle(node);
			if (isNaN(startangle) || isNaN(endangle)) {
				return;
			}
			let angle=anglify(startangle-endangle); 
			// "from" is positive if comming from right
			let dir=angle*from;
			
			if (isNaN(dir)) {
				alert('dir isNaN');
			}

			if (dir<0.000000000) {
				if (originalTensor.brokendata.startTensor == thisTensor &&
					thisTensor.brokendata.nextTensor.node2 == originalTensor.node2) // Last break
				{
					originalTensor.deGhostify();

					originalTensor.broken=false;
					thisTensor.brokendata.nextTensor.destroy();
					thisTensor.destroy();
					originalTensor.unregisterOverride(BehaviourOverride.POSTUPDATEPOSITION, CollisionBounce.prototype.handleBrokenTensors);

				} else {
					let nextTensor=thisTensor.brokendata.nextTensor;
					if (thisTensor.node1==nextTensor.node2) {
						console.log('Null tensor');
						debugBounce(nextTensor);
					}
					thisTensor.brokendata = nextTensor.brokendata;
					thisTensor.node2=nextTensor.node2;

					nextTensor.destroy();

				}
			
			}
		}

		let originalTensor = this;
		if (!originalTensor.brokendata) {
			return;
		}

		let startTensor = originalTensor.brokendata.startTensor;

		for (let i = startTensor ; i && i.brokendata && i.brokendata.nextTensor!=undefined ; i=i.brokendata.nextTensor) {
			loosen(originalTensor, i);
		}

		this.recalcStretch(originalTensor);
		
	}

}

/** This assumes a CollisionSensor behaviour already has been added to the node and that
 * this CollisionSensor calls the collide() function. This behaviour is attached to tensors
 * 
 *  The actual behavior is that the tensor behaves like a stiff bounce
 * 
 * @class
 * @extends Behaviour
 */
class ImpactBounce extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) { 
		storeableObject.registerOverride(BehaviourOverride.COLLIDE, CollisionBounce.prototype.collide);

	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.COLLIDE, CollisionBounce.prototype.collide);
	}


	/**
	 * @param {Object} details
	 */
	collide(details) {

		let firstBroken = (tensor, endTensor) => {
			tensor.broken = true;
			endTensor.broken = true;
			let startTensor = tensor.clone();
			let bounceTensorManagementLabel = this.bounceTensorManagementLabel || this.world.labels.findLabel('bouncetensormanagement');
			if (!this.hasLabel(bounceTensorManagementLabel)) {
				tensor.addLabel(bounceTensorManagementLabel);
				tensor.bounceTensorManagementLabel = bounceTensorManagementLabel;
			}
			startTensor.broken = true;
			tensor.ghostify();
			tensor.brokendata = {
				'startTensor': startTensor,
				'parentTensor': tensor
			};
			return startTensor;
		};


		let newTensors = [];
		
		let tensorToBreak = details[0].tensor;
		for (let detail of details) {

			let startTensor;
			let endTensor = tensorToBreak.clone();
			newTensors.push(endTensor);

			if (!tensorToBreak.broken) { // The first break of a tensor
				startTensor = firstBroken(tensorToBreak, endTensor);
				
				endTensor.brokendata = tensorToBreak.brokendata;
				startTensor.brokendata = {
					'parentTensor':tensorToBreak
				};
				newTensors.push(startTensor);
			} else { 
				endTensor.brokendata = tensorToBreak.brokendata;
				startTensor = tensorToBreak;
				startTensor.brokendata = {
					'parentTensor':tensorToBreak.brokendata.parentTensor
				};
				endTensor.broken=true;
			}


			startTensor.brokendata.nextTensor=endTensor;
			startTensor.brokendata.from=detail.from;

		
			startTensor.node2=detail.collider;
			endTensor.node1=detail.collider;
			tensorToBreak=startTensor;

		}

		//recalcStretch(tensorToBreak.brokendata.parentTensor);
		return newTensors;
	}

}


/** 
 * @class
 * @extends Behaviour
 */
class CollisionSensor extends Behaviour {
	/**
	 */
	constructor() {
		super();
		/*let _this = this;
		document.addEventListener('collisionEvent',
			function(e) {
				_this.collisionFunction.call(_this, e);
			}, false); */
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.PREUPDATEPOSITION, CollisionSensor.prototype.preupdate);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.PREUPDATEPOSITION, CollisionSensor.prototype.preupdate);
	}

	/**
	 * Has the node collided with any Tensor.
	 * If so, that will casue a call of the collide function.
	 * @param {number} deltaTime
	 * @param {Truss} truss
	 */
	preupdate(deltaTime, truss) {
		let depth=0;
		function split (tensor){
			depth++;
			if (depth>3) {
				return;
			}
			if (tensor.isGhost()) {
				return;
			}
			let detail;
			let colliders = [];

			//debugEntity.breakWhen(4.78);
			for(let node of nodes) {
				detail = tensor.checkCollision2(node, truss);
				if (detail) {
					colliders.push(detail);
				}
			}
			if (colliders.length==0) {
				return;
			}
			// Sort according to where
			let line = tensor.line;
			colliders.sort((a,b)=>{
				return -line.closest(a.collider.futureLocalPosition)+line.closest(b.collider.futureLocalPosition);
			});
	
			//let newTensors = 
			tensor.collide(colliders);
	
			//for (let subTensor of newTensors) {
			//split(subTensor);  // the spanned area should only be smaller, right?
			//}
		}

		let nodes = this.collisionLabel_Label.getNodes();
		split(this);
	}
}


function debugBounce(tensor) {
	
	let originalTensor= tensor.brokendata.parentTensor;
	if (originalTensor==tensor) {
		console.log('This is the original tensor');
	}

	console.group();
	console.log('ORIGINAL: Name: ' + originalTensor.name);
	console.log('ORIGINAL: EquilibriumLength: '+ originalTensor.equilibriumLength);
	console.log('ORIGINAL: Length: '+ originalTensor.getLength());
	console.log('ORIGINAL: startTensor: '+ originalTensor.brokendata.startTensor.name);
	console.groupEnd();

	let i =0;
	let currentTensor=originalTensor.brokendata.startTensor;
	let sumLength = 0;
	let sumEq = 0;

	while (currentTensor && i<20) {

		console.group();
		console.log(i+' Name: '+ currentTensor.name);
		//console.log(i+' EquilibriumLength: '+ currentTensor.equilibriumLength);
		//console.log(i+' Length: '+ currentTensor.getLength());
		//console.log(i+' Tension: '+ (currentTensor.equilibriumLength-currentTensor.getLength()));
		console.log(i+' StartNode: '+ currentTensor.node1.name);
		console.log(i+' EndNode: '+ currentTensor.node2.name);
		//console.log(i+' Parent: '+ currentTensor.brokendata.parentTensor.name);
		console.log(i+' Broken from: '+ (currentTensor.brokendata.from<0? 'left':'right'));
		console.groupEnd();

		i++;
		sumEq+=currentTensor.equilibriumLength;
		sumLength+=currentTensor.getLength();
		currentTensor=currentTensor.brokendata.nextTensor;
	}
	console.log('SUM EquilibriumLength: '+ sumEq);
	console.log('SUM Length: '+ sumLength);
}


function debugCycle(tensor, newNode) {
	let originalTensor= tensor.brokendata.parentTensor;
	let currentTensor=originalTensor.brokendata.startTensor;
	let nodes=[currentTensor.node1];
	if (newNode) {
		if (newNode==nodes[0]) {
			return newNode;
		}
		nodes.push(newNode);
	}
	let i=0;
	while (currentTensor && i<20) {
		let index = nodes.indexOf(currentTensor.node2);
		if (index >= 0) {
			return currentTensor;
		}
		nodes.push(currentTensor.node2);
		i++;
		currentTensor=currentTensor.brokendata.nextTensor;
	}
	return 0;
}







/**
 *
class CollisionSensorOLD extends Behaviour {
	/**
	 *
	constructor() {
		super();
		/*let _this = this;
		document.addEventListener('collisionEvent',
			function(e) {
				_this.collisionFunction.call(_this, e);
			}, false); *
	}

	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.SENSE, CollisionSensor.prototype.sense);
	}

	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.SENSE, CollisionSensor.prototype.sense);
	}

	 *
	sense(deltaTime, truss) {
		let label = this.collisionLabel_Label;
		let detail;
		for (let tensor of label.getTensors()) {
			if (!tensor.isGhost()) {
				detail = tensor.checkCollision(this, truss);
				if (detail) {
					tensor.collide(detail);
				}
			}
		}
	}
}



/** Supports the CollisionBounce behaviour
 * This behaviour is added to a tensor while a node is attached to it. Its purpose is to 
 *  maintain the stretch in the different parts of the 'divided' tensor and check if the node 
 * should become attached.
 * This assumes a CollisionSensor behaviour already has been added to the node and that
 * this CollisionSensor calls the collide() function. This behaviour is attached to tensors
 * @class
 * @extends Behaviour
 *
class BounceTensorManagent extends Behaviour {
	/**
	 *
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 *
	attachTo(storeableObject) { 
		storeableObject.registerOverride(BehaviourOverride.POSTUPDATEPOSITION, BounceTensorManagent.prototype.handleBrokenTensors);
		storeableObject.registerOverride(BehaviourOverride.PREUPDATEPOSITION, BounceTensorManagent.prototype.preUpdate);

	}

	/**
	 * @param {StoreableObject} storeableObject
	 *
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.POSTUPDATEPOSITION, BounceTensorManagent.prototype.handleBrokenTensors);
		storeableObject.unregisterOverride(BehaviourOverride.PREUPDATEPOSITION, BounceTensorManagent.prototype.preUpdate);
	}


	this preupdate should be removed
	also remove the whole handleBrokenTensors into the other Behaviour
	then extract the removeNode and make it available to the hit scan function 

}

function recalcStretch(originalTensor) {
	
	let startTensor = originalTensor.brokendata.startTensor;

	let counter=1;
	for (let i = startTensor ; i && i.brokendata ; i=i.brokendata.nextTensor) {
		i.name=originalTensor.name+' '+(counter++);
	}

	let totalStretchedLength = 0;
	let numberOfTensors=0;
	for (let i = startTensor ; i!=undefined ; i=i.brokendata.nextTensor) {
		totalStretchedLength+=i.getLength();
		numberOfTensors++;
	} 

	//let originalStretch = originalTensor.getLength()-originalTensor.equilibriumLength;

	let elongationPerTensor = (totalStretchedLength-originalTensor.equilibriumLength)/numberOfTensors;
recalc
	
	for (let i = startTensor ; i!=undefined ; i=i.brokendata.nextTensor) {
		i.equilibriumLength = i.getLength() - elongationPerTensor;
	} 
} */
