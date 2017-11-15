var NodeColor = [ "red", "black", "blue"];

function Truss(view, updateFrequency=0.01){
	this.time=0;
	this.view= view; 
	this.collisiontrackingNodes = [];
	this.nodes=[];
	this.tensors=[];
	this.updateFrequency=updateFrequency;
	this.positionBasedTensors=[];
	this.velocityBasedTensors=[];		// Should be appliad after all other
										// forces has caused a potential velocity in order
										// to reduce oscillation

	Truss.prototype.addNode = function(node){
		this.nodes.push(node);
		return node;
	}

	Truss.prototype.ghostifyTensor = function(tensor){
		tensor.ghostify();
	}

	Truss.prototype.deghostifyTensor = function(tensor){
		tensor.deghostify();
	}
	
	Truss.prototype.addTensor = function(tensor){
		this.tensors.push(tensor);
		if (tensor.type==TensorType.ABSORBER)
			this.velocityBasedTensors.push(tensor);
		else 
			this.positionBasedTensors.push(tensor);
		tensor.addToTruss();
		return tensor;
	}

	Truss.prototype.removeTensor = function(tensor){
		removeIfPresent(tensor,this.tensors);
		if (tensor.type==TensorType.ABSORBER)
			removeIfPresent(tensor,this.velocityBasedTensors);
		else
			removeIfPresent(tensor,this.positionBasedTensors);
		tensor.removeFromTruss();
		return tensor;
	}
	
	Truss.prototype.calculatePositionBasedForces = function(){
		for(var i=0; i < this.positionBasedTensors.length ; i++){
			this.positionBasedTensors[i].calculateForce();
		} 
	}

	Truss.prototype.calculateVelocityBasedForces = function(){
		for(var i=0; i < this.velocityBasedTensors.length ; i++){
			this.velocityBasedTensors[i].calculateForce();
		}
	}
	
	Truss.prototype.calculatePositionBasedVelocities = function(){	
		for(var i=0; i < this.nodes.length ; i++){
			this.nodes[i].updatePositionBasedVelocity(this.updateFrequency/100);
		}
	}

	Truss.prototype.calculateFinalVelocities = function(){	
		for(var i=0; i < this.nodes.length ; i++){
			this.nodes[i].updateFinalVelocity(this.updateFrequency/100);
		}
	}

	Truss.prototype.updatePositions = function(){
		for(var i=0; i < this.nodes.length ; i++){
			this.nodes[i].updatePosition(this.time);
		} 
	}

	Truss.prototype.addCollider = function(node){
		this.collisiontrackingNodes.push(node);
	}

	Truss.prototype.removeCollider = function(){
		
	}
	
	Truss.prototype.checkCollisions = function(){
		for(var i=0; i < this.collisiontrackingNodes.length ; i++){
			var collider = this.collisiontrackingNodes[i];
			for(var j=0; j < this.positionBasedTensors.length ; j++){
				if (this.positionBasedTensors[j].type==TensorType.SPRING){
					this.positionBasedTensors[j].checkCollision(collider); 
				}
			} 
			
		} 
	}

	Truss.prototype.calculate = function(){
		this.calculatePositionBasedForces();
		this.calculatePositionBasedVelocities();
		this.calculateVelocityBasedForces();
		this.calculateFinalVelocities();
		this.updatePositions();
		this.checkCollisions();
		this.time+=this.updateFrequency;
	}

	Truss.prototype.clear = function(){
		this.view.context.clearRect(0,0,WIDTH,HEIGHT)
		//this.view.context.fillStyle = "#FAF7F8";
		//this.view.context.rect(0,0,WIDTH,HEIGHT);
		//this.view.context.fill();
	}
	
	Truss.prototype.show = function(time, graphicDebugLevel){	
		for(var i=0; i < this.tensors.length ; i++){
			  this.tensors[i].show(this.view, graphicDebugLevel);
		}

		if(graphicDebugLevel>3){
			for(var i=0; i < this.nodes.length ; i++){
				  this.nodes[i].show(this.view, this.time, graphicDebugLevel);
			}
		}
	}

	var lastTime=0;
	var lastTicks=0;
	
	Truss.prototype.tick = function(){
		this.calculate();
		this.clear();
		this.show(this.time, 4);

		// Time
		var nowSeconds=(new Date()).getSeconds();
		if (lastTime!=nowSeconds){
			var gameTime=this.time-lastTicks;
			var realTime=nowSeconds-lastTime;
			if (realTime-gameTime>0.02)
			  console.log("Game time: "+ gameTime+" Real time: "+realTime+" Diff: "+(realTime-gameTime))
			lastTicks=this.time;
			lastTime=nowSeconds;
		}

		
		
	}
}




