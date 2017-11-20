/**
 * 
 */

function Node(startPosition,mass = 1,name = "node", positionFunction, showFunction, velocityLoss=1){
	this.localPosition = startPosition;
	this.velocity = new Velocity(0,0);
//	this.acceleration = new Vector(0,0);
	this.mass=mass;
	this.massRadius=Math.sqrt(mass);
	//this.massVector = multiplyVector(this.mass,gravity)
	this.angle=0;
	this.velocityBasedTensors=[];
	this.positionBasedTensors=[];
	this.name=name;
	this.velocityLoss=velocityLoss;
	this.positionFunction=positionFunction;
	this.showFunction=positionFunction;


	// 
	Node.prototype.setPosition = function(position){	
		this.localPosition=position;
	}

	// 
	Node.prototype.getPosition = function(position){	
		return this.localPosition;
	}

	// 
	Node.prototype.addTensor = function(t){	
		if (t.type==TensorType.ABSORBER) {
			this.velocityBasedTensors.push(t);
		}
		else {
			this.positionBasedTensors.push(t);
		}
		return t;
	}

	// 
	Node.prototype.removeTensor = function(t){	
		if (t.type==TensorType.ABSORBER) {
			removeIfPresent(t,this.velocityBasedTensors);
		}
		else {
			removeIfPresent(t,this.positionBasedTensors);
		}
	}

	Node.prototype.findTopSpring = function(direction, ignoreList){
		function ignoreThis(t){
			return (ignoreList.indexOf(t)+1);
		}
		var steepestTensorSoFar=0;
		var steepestRatioSoFar=NaN;
		for(var i=0;i<this.positionBasedTensors.length;i++){
			var tensor=this.positionBasedTensors[i];
			var temp =!ignoreThis(tensor);
			if (temp){					// avoid finding for example the spring you are on or your own spring
				if (tensor.type==TensorType.SPRING){
					if (tensor.getXLength()==0){
						if (tensor.getTopNode!=this)
							return tensor;				//we have found a vertical spring;
					}
					else {
						var rightNode = tensor.getRightNode();
						var leftNode = tensor.getOppositeNode(rightNode);
						var thisRatio = (rightNode.getPosition().y-leftNode.getPosition().y)/
										(rightNode.getPosition().x-leftNode.getPosition().x);
						if (rightNode==this && 			// Moving left
								direction<0 &&
								(isNaN(steepestRatioSoFar) || (thisRatio>steepestRatioSoFar))){
							steepestTensorSoFar = tensor;
							steepestRatioSoFar = thisRatio;
						} 
						else if (rightNode!=this && 	// Moving right
								direction>0 &&
								(isNaN(steepestRatioSoFar) || (thisRatio<steepestRatioSoFar))){
							steepestTensorSoFar = tensor;
							steepestRatioSoFar = thisRatio;
						}
					}
				}
			}
		}
		return steepestTensorSoFar;
	}
	
	Node.prototype.updatePosition = function(time){			
		var oldPosition = new Position(this.getPosition().x,this.getPosition().y);
		this.localPosition.add(this.velocity);
		if (this.positionFunction) 
			{
			this.setPosition(this.positionFunction(this, time));
			this.velocity=subtractVectors(this.getPosition(),oldPosition);
			}
	}
/*
	Node.prototype.collided = function(tensor,collision){	
		console.log("Node "+this.name +" collided with tensor ("+tensor.getName()+")");
	}
	*/
	
	Node.prototype.updatePositionBasedVelocity = function(timeFactor){	
		this.updateVelocity(this.positionBasedTensors, timeFactor);
	}
	Node.prototype.updateFinalVelocity = function(timeFactor){	
		this.updateVelocity(this.velocityBasedTensors, timeFactor);
	}
	
	Node.prototype.updateVelocity = function(forceAppliers,timeFactor){	
		if (isNaN(this.mass)) return;
		var acceleration;
		if (forceAppliers.length>0)
			acceleration=this.getAcceleration(forceAppliers);
		else 
			acceleration=new Vector(0,0);
		this.velocity=addVectors(multiplyVector(this.velocityLoss,this.velocity), 
								 multiplyVector(timeFactor,acceleration));
	}
	// 
	Node.prototype.getAcceleration = function(forceAppliers){	
//		this.acceleration=this.sumAllForces(forceAppliers).divide(this.mass)
		return divideVector(this.sumAllForces(forceAppliers),this.mass);
	}
	
	Node.prototype.sumAllForces = function(forceAppliers){
		var result = new Force(0, 0);
		var applier;
		var tempForce;
		for(i=0; i< forceAppliers.length; i++){
			var applier =forceAppliers[i];
			var tempForce=applier.getForce(this);
			result.add(tempForce)
		}
		return result;
	}


	Node.prototype.show = function(v, time, graphicDebugLevel=0){

		if (v.inside(this.getPosition())) {
			v.context.strokeStyle = "lightgrey"; 
			v.context.beginPath();
			v.drawCircle(this.getPosition(),0.03*this.massRadius);
			v.context.stroke();
		
			if(graphicDebugLevel>5){
				v.context.strokeStyle = "lightblue"; 
				v.context.beginPath();
				v.drawLine(this.getPosition(), addVectors(this.getPosition(), divideVector(this.velocity,0.1)));
				v.context.stroke();	

				v.context.strokeStyle = "red"; 
				v.context.beginPath();
				v.drawLine(this.getPosition(), addVectors(this.getPosition(), divideVector(this.acceleration,50)));
				v.context.stroke();		
			}
			
			if (this.showFunction) this.showFunction(this,time);
	   }
	}	
	return this;
}



function TrussNode(startPosition,view,  updateFrequency=0.01, mass=1,name="TrussNode", positionFunction, showFunction, velocityLoss=1){
	Node.call(this, startPosition,mass,name, positionFunction, showFunction, velocityLoss);

	this.view	= view;
	this.canvas = document.createElement("canvas");
	this.canvas.name = name;
	this.canvas.style.top=startPosition.y+"px";
	this.canvas.style.left=startPosition.x+"px";
	this.canvas.width=this.view.screenSize.x;
	this.canvas.height=this.view.screenSize.y;
	this.canvas.style.width=this.view.screenSize.x+"px";
	this.canvas.style.height=this.view.screenSize.y+"px";
	this.canvas.style.position="absolute";
	this.canvas.style.border="1px solid red";

	var bg = document.getElementById("TrussBackground");
	bg.appendChild(this.canvas);
	
	this.view.context=this.canvas.getContext("2d")
	
	this.truss= new Truss(this.view ,updateFrequency);
	
	TrussNode.prototype.updatePosition = function(time){	
		this.truss.tick(time);	
		Node.prototype.updatePosition.call(this,time);	//Call parent in order to update this nodes position
	}

	TrussNode.prototype.show = function(v, time, graphicDebugLevel=0){
		this.canvas.style.left	= v.x(this.localPosition)+"px";
		this.canvas.style.top	= v.y(this.localPosition)+"px";
	}
	
	TrussNode.prototype.tick = function(time){			//used by main loop
		this.truss.tick(time);
	}
}
inheritPrototype(TrussNode, Node);
