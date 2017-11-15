/**
 * 
 */

//Standard inheritance help function
function inheritPrototype(childObject, parentObject) {
 var copyOfParent = Object.create(parentObject.prototype)
 copyOfParent.constructor = childObject
 childObject.prototype = copyOfParent
}

var tickTime=0;

function tick(){
	truss.tick(tickTime);
	tickTime++;
}

function removeIfPresent(element,list){
	var index=list.indexOf(element);
	if (index>=0)
		list.splice(index,1);
}

function Vector(x=0,y=0){
	this.x = x;
	this.y = y;

	Vector.prototype.opposite = function(){
		return new Vector(-this.x,-this.y);
	}
	Vector.prototype.add = function(v){
		this.x+=v.x;
		this.y+=v.y;
	}
	Vector.prototype.divide = function(c){
		this.x/=c;
		this.y/=c;
	}
}

function Position(x,y){
	Vector.call(this, x,y);

	Position.prototype.add = function(v){
		this.x+=v.x;
		this.y+=v.y;
		}
}
inheritPrototype(Position, Vector);

function Force(x,y){
	Vector.call(this, x,y);
}
inheritPrototype(Force, Vector);

function Velocity(x,y){
	Vector.call(this, x,y);
	
	Velocity.prototype.add = function(v){
		this.x+=v.x;
		this.y+=v.y;
		return this;
		}
}
inheritPrototype(Velocity, Vector);


function addVectors(v1,v2){
	return new Vector(v1.x+v2.x, v1.y+v2.y);
}

function subtractVectors(v1,v2){
	return new Vector(v1.x-v2.x, v1.y-v2.y);
}

function multiplyVector(m, v1){
	return new Vector(m*v1.x, m*v1.y);
}

function divideVector(v1, m){
	return new Vector(v1.x/m, v1.y/m);
}

function dotProduct(v1, v2){
	return v1.x*v2.x + v1.y*v2.y;
}

function perpendicular(v){
	return new Vector(v.y,- v.x);
}

function length2(v){
	return v.x*v.x+v.y*v.y;
}

function normalizeVector(l, v){
	var length = Math.sqrt(Math.pow(v.x,2)+Math.pow(v.y,2))
	return multiplyVector(l/length, v);
}


// Find multiplier s in L = p3 + perp(p2-p1)s = c where c crosses p1p2 
// The sign of s will tell if p3 is on the right sight of the p1p2 line. S<0 means right side
function getS(p1,p2,p3){					
	var a = subtractVectors(p2,p1);		
	var b = subtractVectors(p3,p1);
	var s = dotProduct(a, perpendicular(b)) / length2(a) ;
	return s;
}

//Find multiplier t in L = p1 + perp(p2-p1)t = c where c is the closest point to p3 on p1p2 
// if 0<=t<=1 it lies between p1 and p2.
// t can also be used to determina at what fraction of p1p2 it should "break"
function getT(p1,p2,p3){					
	var a = subtractVectors(p2,p1);		
	var b = subtractVectors(p3,p1);
	var t = dotProduct(a, b) / length2(a) ;
	return t;
}

// This returns true if the closest point from p3 on the line crossing p1 and p2 lies between p1 and p2 
function getTInside(p1, p2, p3){
	t=getT(p1,p2,p3);
	return ((0<=t)&&(t<=1))
}

//Unused?
function distancePoint(p1,p2,p3){		//Find the point where a point p3 projects perpendicular to a line between p1 and p2
	return addVectors(p3, multiplyVector(getS(p1,p2,p3),perpendicular(subtractvectors(p2,p1))));
}



//************************************

function boxLength(v){
	return Math.max(Math.abs(v.x), Math.abs(v.y));
}
function boxClose(p1,p2,distance){
	return Math.max(Math.abs(p1.x-p2.x), Math.abs(p1.y-p2.y))<distance;
}
