/**
 * 
 */

var TensorType = {
		UNDEFINED 	: 0,
		SPRING 		: 1,
		ABSORBER 	: 2,
		FIELD 		: 3,
};

function Tensor(node1,node2,constant=1, type=TensorType.UNDEFINED){
	this.node1 = node1;
	this.node2 = node2;
	this.constant = constant;
	this.type=type;
	this.collideDistanceMapping={};
	this.force=0;
	this.ghost=false;

	// 
	Tensor.prototype.getName = function(){
		var name="";
		if (this.node1)
			name+=this.node1.name;
		name+="-";
		if (this.node2)
			name+=this.node2.name;
		return name;
	}
		// 
	Tensor.prototype.addNode1 = function(node){	
		if (this.node1) 
			this.node1.removeTensor(this);
		this.node1=node;
		if (node)
			node.addTensor(this);
	}

	// 
	Tensor.prototype.addNode2 = function(node){	
		if (this.node2)
			this.node2.removeTensor(this);
		this.node2=node;
		if (node)
			node.addTensor(this);
	}

	//Makes sure the actual nodes will take this tensor into consideration
	Tensor.prototype.addToTruss = function(){	
		this.addNode1(this.node1);
		this.addNode2(this.node2);
	}

	//
	Tensor.prototype.isGhost = function(){	
		return this.ghost;
	}
	//
	Tensor.prototype.ghostify = function(){	
		this.ghost=true;
	}
	//
	Tensor.prototype.deghostify = function(){	
		this.ghost=false;
	}
	
	//Makes sure the nodes will NOT take this tensor into consideration
	Tensor.prototype.removeFromTruss = function(){	
		if (this.node2)
			this.node2.removeTensor(this);
		if (this.node1)
			this.node1.removeTensor(this);
		this.force=0;
	}

	Tensor.prototype.rightNode = function(){	
		return (this.node1.getPosition().x >= this.node2.getPosition().x)
	}

	Tensor.prototype.getRightNode = function(){	
		if (this.rightNode())
			return this.node1;
		return this.node2;
	}

	Tensor.prototype.setRightNode = function(node){	
		if (this.rightNode())
			this.addNode1(node);
		this.addNode2(node);
	}

	Tensor.prototype.getTopNode = function(){	
		if (this.node1.getPosition().y <= this.node2.getPosition().y)
			return this.node1;
		return this.node2;
	}

	Tensor.prototype.getOppositeNode = function(node){	
		if (this.node1==node)
			return this.node2;
		return this.node1;
	}
	Tensor.prototype.exchangeNode = function(me,node){	
		if (this.node1!=me)
			return this.addNode2(node);
		return this.addNode1(node);
	}
	

	// 
	Tensor.prototype.getXLength = function(){	
		return (this.node1.getPosition().x-this.node2.getPosition().x);
	}

	// 
	Tensor.prototype.getYLength = function(){	
		return (this.node1.getPosition().y-this.node2.getPosition().y);
	}
	// 
	Tensor.prototype.getLength = function(){	
		return Math.sqrt(this.getLengthSquare());
	}

	Tensor.prototype.getActual = function(){	
		return  new Vector(this.getXLength(),this.getYLength());;
	}

	// 
	Tensor.prototype.getLengthSquare = function(){	
		return Math.pow(this.getXLength(),2)+Math.pow(this.getYLength(),2);
	}
	

	Tensor.prototype.getForce = function(node){	
		var directedforce = this.force;
		if (node==this.node2) return directedforce;
		else return directedforce.opposite();
	}

	Tensor.prototype.getColour = function(){	
		return "grey";
	}

	Tensor.prototype.resetCollision = function(node){	
		this.collideDistanceMapping[node.name]=0;
	}
	
	Tensor.prototype.checkCollision = function(node){	
		if (this.isGhost())
			return;
		var oldDistance = this.collideDistanceMapping[node.name];
		var newDistance = getS(this.node1.getPosition(),this.node2.getPosition(),node.getPosition());
		var where = getT(this.node1.getPosition(),this.node2.getPosition(),node.getPosition());
		if ((where<0)||(1<where))
			newDistance=0;
		this.collideDistanceMapping[node.name] = newDistance;
		if (oldDistance*newDistance<0){
			if ((where>=0) && (where<=1)){
				var event = new CustomEvent("collisionEvent", {
					detail: {
						'where': where,
						'from': oldDistance,
						'collider': node,
						'tensor': this
					},
					bubbles: true,
					cancelable: true
				});
				document.dispatchEvent(event);
			}
		}
	}
		
		
	
	
	Tensor.prototype.show = function(v,graphicDebugLevel=0){	
		var ctx = v.context;
		node1= this.node1;
		node2= this.node2;
		
		if (!(this.isGhost()) && (!(this instanceof Field) || (graphicDebugLevel>7)))
		{
			ctx.strokeStyle = this.getColour();
			ctx.lineWidth = 3;
			ctx.beginPath();
			v.drawLine(node1.getPosition(), node2.getPosition());
			ctx.stroke();	
		
			if(graphicDebugLevel>7){
				ctx.beginPath();
				ctx.fillStyle = "black";
				ctx.font = "20px Arial";	
				ctx.textAlign = "left";
				var textPos= subtractVectors(node1, divideVector(this.getActual(),2));
				v.drawText(textPos, Math.trunc(10*this.getLength())/10);
				}
		}
	}
}

// this is a spring that can be both pushed together and stretched. A typical ideal spring
function Spring(node1,node2,constant=1,equilibriumLength=0, type=TensorType.SPRING){
	Tensor.call(this, node1, node2, constant, type);

	this.equilibriumLength = equilibriumLength;
	if (this.equilibriumLength<=0 && node1 && node2)
		this.equilibriumLength = this.getLength();
	
	//
	Spring.prototype.calculateForce = function(){	
		//if (!this.node1 || !this.node2)
		//	return this.force=new Force(0,0);
		var actualVector = this.getActual();
		var normalized = normalizeVector(this.equilibriumLength,actualVector);
		var diffVector=subtractVectors(actualVector,normalized);
		this.force=multiplyVector(this.constant,diffVector);
	}
}
inheritPrototype(Spring, Tensor);

// This is a spring that only pulls things together. think of a long, thin spring that would bend if you press the ends together
function PullSpring(node1,node2,constant=1,equilibriumLength=0, type=TensorType.SPRING){
	Spring.call(this, node1, node2, constant, equilibriumLength, type);

	PullSpring.prototype.calculateForce = function(){	
		var actualVector = this.getActual();
		if ((this.equilibriumLength>0) && (length2(actualVector)<this.equilibriumLength*this.equilibriumLength)){
			this.force = new Force(0,0);
		}
		else 
			Spring.prototype.calculateForce.call(this)
	}
}
inheritPrototype(PullSpring, Spring);

// A normal field based on the square of the length between the nodes
function Field(node1,node2,constant=1, type=TensorType.FIELD){
	Tensor.call(this, node1, node2, constant, type);

	//
	Field.prototype.calculateForce = function(){	
		var actualVector = this.getActual();
		var normalized = normalizeVector(1,actualVector);
		var forceSize=this.constant*this.node1.mass*this.node2.mass/this.getLengthSquare();
		this.force=multiplyVector(forceSize,normalized);
	}
	
	Spring.prototype.getColour = function(){	
		return "blue";
	}

	
}
inheritPrototype(Field, Tensor);

// An absorber work against the velocity between the nodes. The higher the "parallell" velocity is, the higher the force counteracting it will be
function Absorber(node1,node2,constant=1, type=TensorType.ABSORBER){
	Tensor.call(this, node1, node2, constant, type);

	//
	Absorber.prototype.calculateForce = function(){	
		var actualVector = this.getActual();
		var internalSpeed = subtractVectors(this.node1.velocity,this.node2.velocity);
		var parallellVelocity=multiplyVector(	
				dotProduct(actualVector,internalSpeed),
				divideVector(actualVector, this.getLengthSquare()));
		this.force=multiplyVector(this.constant,parallellVelocity);
	}
	
	Spring.prototype.getColour = function(){	
		return "green";
	}
}
inheritPrototype(Absorber, Tensor);


