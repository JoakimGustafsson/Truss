/**
 * 
 */

//function Node(startPosition,mass=1,name="node", positionFunction, showFunction, velocityLoss=1)
var EarthCenter = new Position(0,6371e3);
var Earth = new Node(EarthCenter, 5.97219e24, "Earth",undefined,undefined,0);

var f2;

function gravityField(node){
	return new Field(Earth,node,6.67e-11);
} 

function WalkTruss(view, updatefrequency){
	Truss.call(this, view, updatefrequency);
	

	WalkTruss.prototype.addGravityNode = function(a1,a2,a3,a4,a5,a6){
		var temp = this.addNode(a1,a2,a3,a4,a5,a6);
		this.addTensor(new gravityField(temp));
		return temp;
	}
	

	var ego1 = new ProtagonistNode(new Position(3,2.5), 70,"Ego1");
	this.addNode(ego1);
	var egoGravityField = this.addTensor(new gravityField(ego1)); //Needed to create a jumpactuator
	
	var ego2 = this.addGravityNode(new ProtagonistNode(new Position(4,1.2), 70,"Ego2"));
	
	var f1 = this.addGravityNode(new Node(new Position(1, 3), 100, "floor1")); 
	f2 = this.addGravityNode(new Node(new Position(5, 3), 100, "floor2")); 
	var f3 = this.addGravityNode(new Node(new Position(9, 3), 100, "floor3")); 
	var f4 = this.addGravityNode(new Node(new Position(10, 3), 100, "floor4")); 
	var f5 = this.addGravityNode(new Node(new Position(14, 3), 100, "floor5")); 

	var b1 = this.addNode(new Node(new Position(1, 6), NaN, "base1")); 
	var b2 = this.addNode(new Node(new Position(5, 6), NaN, "base2")); 
	var b3 = this.addNode(new Node(new Position(9, 6), NaN, "base3")); 
	var b4 = this.addNode(new Node(new Position(10, 6), NaN, "base4")); 
	var b5 = this.addNode(new Node(new Position(14, 6), NaN, "base5")); 


	springconstant = 50000;
	absorbconstant = 5000;
	
	var startTensor = this.addTensor(new Spring(f1, f2, 90000));
	nextt = this.addTensor(new Spring(f2, f3, springconstant));
	this.addTensor(new Spring(f4, f5, springconstant));

	this.addTensor(new Spring(b1, f2, springconstant));
	this.addTensor(new Absorber(b1, f2, absorbconstant));

	this.addTensor(new Spring(b2, f1, springconstant));
	this.addTensor(new Absorber(b2, f1, absorbconstant));

	this.addTensor(new Spring(f2, b3, springconstant));
	this.addTensor(new Absorber(f2, b3, absorbconstant));
	
	this.addTensor(new Spring(f3, b2, springconstant));
	this.addTensor(new Absorber(f3, b2, absorbconstant));
	
	this.addTensor(new Spring(b4, f5, springconstant));
	this.addTensor(new Absorber(b4, f5, absorbconstant));



	this.addTensor(new Spring(f1, b1, springconstant/100));
	this.addTensor(new Spring(f2, b2, springconstant/100));
	this.addTensor(new Spring(f3, b3, springconstant/100));
	this.addTensor(new Spring(f4, b4, springconstant));
	this.addTensor(new Spring(f5, b5, springconstant));

	this.addTensor(new Absorber(f1, b1, absorbconstant));
	this.addTensor(new Absorber(f2, b2, absorbconstant));
	this.addTensor(new Absorber(f3, b3, absorbconstant));
	this.addTensor(new Absorber(f4, b4, absorbconstant));
	this.addTensor(new Absorber(f5, b5, absorbconstant));

	//ego.trussConnect(this);

	//this.addCollider(ego);
	
//	this.initConnect();
	
	//ego.attachToTensor(startTensor,0.2);
	

	var sensorNode = this.addNode(new KeySensorNode(new Position(2,1),0.01,"myKeySensorNode"));
	sensorNode.registerKey(37, new Vector(-1,0));
	sensorNode.registerKey(65, new Vector(-1,0));
	sensorNode.registerKey(39, new Vector(1,0));
	sensorNode.registerKey(68, new Vector(1,0));
	sensorNode.registerKey(32, new Vector(0,1));


	var leftEarth = new Node(new Position(-6371e3,-6371e1), 5.97219e24, "leftEarth",undefined,undefined,0);
	var rightEarth = new Node(new Position(6371e3,-6371e1), 5.97219e24, "rightEarth",undefined,undefined,0);
	var leftField1 = this.addTensor(new Field(leftEarth,ego1,6.67e-11));
	var rightField1 = this.addTensor(new Field(rightEarth,ego1,6.67e-11));

	var actuatorNode1 = this.addNode(
			new SpringDanglerNode(ego1, new Position(1,0.5), new Position(3,0.5),
					leftField1, rightField1,0.05,"mySpringDanglerNode",0,0,0.99));

	var actuatorNode2 = this.addNode(
			new SpringDanglerNode(ego2, new Position(1,0.25), new Position(3,0.25),
					leftField1, rightField1,0.05,"mySpringDanglerNode2",0,0,0.99));

	var KeyDangleSpring = this.addTensor(new Spring(sensorNode, actuatorNode1, 50,0.1));
	
	
	var jumpActuator = this.addNode(
			new JumpNode(ego1, new Position(0.5,1), new Position(0.5,2),
					egoGravityField,0.05,"myJumpNode"));

	var KeyJumpSpring = this.addTensor(new Spring(sensorNode, jumpActuator, 50,0.1));

	var collissionsensor1 = new CollisionSensorNode(new Position(4,1),0.01,"CollissionSensor1");
	collissionsensor1.registerTrussObjectAndActuator(this,ego1, actuatorNode1);
	
	var collissionsensor2 = new CollisionSensorNode(new Position(8,1),0.01,"CollissionSensor2");
	collissionsensor2.registerTrussObjectAndActuator(this,ego2, actuatorNode2);
	
	
	
}
inheritPrototype(WalkTruss, Truss);


/*function gameLoop() {
    if (keyState[37] || keyState[65]){
        x -= 1;
    }    
    if (keyState[39] || keyState[68]){
        x += 1;
    }

    // redraw/reposition your object here
    // also redraw/animate any objects not controlled by the user

    setTimeout(gameLoop, 10);
}    
gameLoop();*/

function ProtagonistNode(startPosition, mass=70, name="ProtagonistNode", positionFunction, showFunction, velocityLoss=1){
	Node.call(this, startPosition,mass,name, positionFunction, showFunction, 1);

	this.actuators=0;
	this.sensors=0;
	
/*	this.currentTensor=0;
	this.currentTensorOriginalLength=0;
	this.speed=0.05;
	this.mySpring = new Spring(new Node(new Position(),name="Initial Spring Node"),this);
	this.mySpring.equilibriumLength=3;
	
	
	ProtagonistNode.prototype.attachToTensor = function(tensor,distanceFraction=0.5){
		this.currentTensor=tensor;
		this.mySpring.constant=tensor.constant;
		this.currentTensorOriginalLength = tensor.equilibriumLength;
		
		this.rightNode = this.currentTensor.getRightNode();
		this.mySpring.addNode1(this.rightNode);
		this.currentTensor.setRightNode(this);
		
		this.mySpring.equilibriumLength = this.currentTensorOriginalLength*(1-distanceFraction);
		this.currentTensor.equilibriumLength = this.currentTensorOriginalLength*(distanceFraction);
			
	}

	// Add myself and my spring to this truss
	ProtagonistNode.prototype.trussConnect = function(truss){
		truss.addTensor(this.mySpring);
		truss.addGravityNode(this);
	}
	
	ProtagonistNode.prototype.updatePosition = function(time){
		var shorten;
		var lengthen;
		var direction;
	
		//***************************************************************
		
		function modifyTensors(speed,length){
			if (lengthen.equilibriumLength<0){
				lengthen.equilibriumLength+=speed;
				return;
			}
			shorten.equilibriumLength -= speed;
			lengthen.equilibriumLength = Math.min(length, length-shorten.equilibriumLength);
		}
		function getOtherNode(tensor, node){
			if (node==tensor.node1) 
				return tensor.node2;
			else
				return tensor.node1;
		}
		function close(pos1,pos2, velocity){
			//if ((pos1.x==pos2.x) && (pos1.y==pos2.y))
			var d=boxLength(velocity);
			if (Math.abs(pos1.x-pos2.x)<d && Math.abs(pos1.y-pos2.y)<d) 
				return true;
			return false;
		}
		
		//***************************************************************
		
		Node.prototype.updatePosition.call(this,time);	//Call parent in order to update this nodes position

		if (keyState[39] || keyState[68]){
			shorten=this.mySpring;	
			lengthen=this.currentTensor;	
			direction=this.speed;
		} 
		else if (keyState[37] || keyState[65]){
			shorten=this.currentTensor;
			lengthen=this.mySpring;
			direction=-this.speed;
		}		
		else
			return;
		
		modifyTensors(this.speed,this.currentTensorOriginalLength);

		var p1 = this.currentTensor.getOppositeNode(this).getPosition();
		var p2 = this.rightNode.getPosition();
		var p3 = this.getPosition();
		
		if (getS(p1, p2, p3)<0)
			this.disconnect(getOtherNode(shorten,this));
		
		
		
		var zeroNode=getOtherNode(shorten,this);
		if (zeroNode && close(this.getPosition(),zeroNode.getPosition(), this.velocity))
		{
			this.exit(zeroNode,direction);
		}
	}

	ProtagonistNode.prototype.disconnect = function(lastNode){
		this.mySpring.constant=0; 
		// restore the old tensor
		this.currentTensor.exchangeNode(this,this.rightNode);
		this.currentTensor.equilibriumLength=this.currentTensorOriginalLength;
	}
	
	ProtagonistNode.prototype.exit = function(zeroNode, direction){
		var newTensor = zeroNode.findTopSpring(direction,[this.currentTensor,this.mySpring]);
		
		this.disconnect();
		
		if (!newTensor)							// No new spring anywhere forward
			return;

		// Attach to new tensor
		if (direction>0)
			this.attachToTensor(newTensor,0.02);
		else
			this.attachToTensor(newTensor,0.98);
	}
*/
	ProtagonistNode.prototype.show = function(v, time, graphicDebugLevel=0){
		if (v.inside(this.getPosition())) {
				v.context.strokeStyle = "yellow"; 
				v.context.beginPath();
				v.drawCircle(this.getPosition(),1);
				v.context.stroke();
		}
	}
}
inheritPrototype(ProtagonistNode, Node);








function MyTruss(view, updatefrequency){
	Truss.call(this, view, updatefrequency);
	
	var myX=3;
	var myY=3;
	var mouseSet=false;

	function myMove(e) {
		myX=e.pageX;
		myY=e.pageY;
	}

	function downMouse(e) {
		mouseSet=true;
	}

	function upMouse(e) {
		mouseSet=false;
	}

	var thisTrussView=this.view;
	thisTrussView.context.canvas.onmousemove = myMove;
	thisTrussView.context.canvas.onmousedown = downMouse;
	thisTrussView.context.canvas.onmouseup = upMouse;


	var n1 = this.addNode(new Node(new Position(1, 0.3), 5, "fulcrum", function(node, tick){
		return new Position(1+0.5*Math.sin(tick),0.3)
		})); 
	var n2 = this.addNode(new Node(new Position(1.3, 0.6), 10, "right")); 
	var n3 = this.addNode(new Node(new Position(1, 0.9), 100, "down", function(node, n){
		if (mouseSet)
			return thisTrussView.worldPosition(myX, myY);
		return node.getPosition();
		})); 
	var n4 = this.addNode(new Node(new Position(0.7, 0.6), 10, "left")); 

	this.addTensor(new Spring(n1, n2, 100));
	this.addTensor(new Spring(n2, n3, 500));
	this.addTensor(new Spring(n3, n4, 500));
	this.addTensor(new Spring(n4, n1, 100));
	this.addTensor(new Spring(n2, n4, 100));


	this.addTensor(new Absorber(n1, n2, 100));
	this.addTensor(new Absorber(n2, n3, 249));
	this.addTensor(new Absorber(n3, n4, 500));
	this.addTensor(new Absorber(n4, n1, 500));
	this.addTensor(new Absorber(n2, n4, 100));

	this.addTensor(new gravityField(n2));
	this.addTensor(new gravityField(n3));
	this.addTensor(new gravityField(n4));

	this.initConnect();
}
inheritPrototype(MyTruss, Truss);






/*
function MyTruss(ctx, updatefrequency){
	Truss.call(this, ctx, updatefrequency);
	
	var myX=3;
	var myY=3;
	var mouseSet=false;

	function myMove(e) {
		myX=e.pageX;
		myY=e.pageY;
	}

	function downMouse(e) {
		mouseSet=true;
	}

	function upMouse(e) {
		mouseSet=false;
	}

	ctx.canvas.onmousemove = myMove;
	ctx.canvas.onmousedown = downMouse;
	ctx.canvas.onmouseup = upMouse;

	var thisTrussView=this.view;

var n1 = this.addNode(new Node(new Position(1, 0.3), 5, "fulcrum", function(node, tick){
	return new Position(1+0.5*Math.sin(tick),0.3)
	})); 
var n2 = this.addNode(new Node(new Position(1.3, 0.6), 10, "right")); 
var n3 = this.addNode(new Node(new Position(1, 0.9), 100, "down", function(node, n){
	if (mouseSet)
		return thisTrussView.worldPosition(myX, myY);
	return node.getPosition();
	})); 
var n4 = this.addNode(new Node(new Position(0.7, 0.6), 10, "left")); 

this.addTensor(new Spring(n1, n2, 100));
this.addTensor(new Spring(n2, n3, 500));
this.addTensor(new Spring(n3, n4, 500));
this.addTensor(new Spring(n4, n1, 100));
this.addTensor(new Spring(n2, n4, 100));


this.addTensor(new Absorber(n1, n2, 100));
this.addTensor(new Absorber(n2, n3, 249));
this.addTensor(new Absorber(n3, n4, 500));
this.addTensor(new Absorber(n4, n1, 500));
this.addTensor(new Absorber(n2, n4, 100));

this.addTensor(new gravityField(n2));
this.addTensor(new gravityField(n3));
this.addTensor(new gravityField(n4));

this.initConnect();
}

inheritPrototype(MyTruss, Truss);
*/

/*
Construction
1.	Homebase
2.	Lab
2.	Springgenerator
3.	Absorber
4.	Killer
5.	Searchtool
5.	Fieldgenerator
5.	Identityconstruct with pictures
6.	RewardGenerator
7.	Mob
6.	Cannon	
7.	Text
8.	Web reference
9.	Picture applier
10.	Picture uploader
11.	Store
12.	Market

Actuators
1.	Springrunner
2.	Jumper
3.	Winethrower
4.	Thruster (Interplanetary)
5.	Thruster (Planetary)
6.	Scroller/offsetter
7.	Zoomer/scaler
6.	Settings

Sensors
1.	Keysensor
2.	Mousesensor
3.	Eventlistner












 
 */








