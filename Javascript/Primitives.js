/*jshint esversion:6*/
/* exported removeIfPresent Vector Force Velocity getS getT anglify objectFactory */
/* exported getTInside getTInside2 boxClose */

/**
 * Support function that removes an element from an array the way I expect it to
 * @param  {object} element
 * @param  {Array} list
 */
function removeIfPresent(element, list) {
	let index = list.indexOf(element);
	if (index >= 0) {
		list.splice(index, 1);
	}
}

/* TODO: Not used. remove this:
 * Support function that cleans a list using the cb function that I always seem to mess up
 * @param  {list} list
 * @param  {Function} cb
 *
function cleanup(list, cb) {
	for (let r of t.slice()) {
		cb(r);
	}
} */

/**
 * The base vector class used to represent a point on a two dimensional plane
 * @class
 */
class Vector {
	/**
	 * Create a vector consisting of an x and a y position
	 * @param  {number} x=0
	 * @param  {number} y=0
	 */
	constructor(x = 0, y = 0) {
		this._x = x;
		this._y = y;


		Object.defineProperty(this, 'x', {
			get: function () {
				return this._x;
			},
			set: function (value) {
				this._x = value;
			},
		});


		Object.defineProperty(this, 'y', {
			get: function () {
				return this._y;
			},
			set: function (value) {
				this._y = value;
			},
		});


	}





	/**
	 * Returns the vector pointing in exactly the opposite direction
	 * @return {Vector} The vector pointing in exactly the oposite direction
	 */
	opposite() {
		return new Vector(-this.x, -this.y);
	}

	/**
	 * Returns the vector pointing in exactly the opposite direction
	 * @return {Vector} The vector pointing in exactly the oposite direction
	 */
	serialize() {
		return {
			'x': this.x,
			'y': this.y,
		};
	}

	/**
	 * @return {string} Returns a simple textual representation of the vector
	 */
	toString() {
		return '[x' + this.x + ' y:' + this.y + ']';
	}

	/**
	 * @param  {Object} restoreObject
	 * @return {Vector}
	 */
	deSerialize(restoreObject) {
		this.x += restoreObject.x;
		this.y += restoreObject.y;
		return this;
	}

	/** scale this vector so that the length becomes l
	 * @param  {number} l The length of the resulting vector
	 * @return {Vector}
	 */
	normalizeVector(l) {
		let length = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
		if (length != 0) {
			return Vector.multiplyVector(l / length, this);
		}
		return new Vector(0, 0);
	}

	/**
	 * @param  {Vector} v1
	 * @param  {Vector} v2
	 * @return {number}
	 */
	static dotProduct(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y;
	}
	/**
	 * @param  {number} updown 1 for up -1 for down
	 * @return {Vector}
	 */
	perpendicular(updown = 1) {
		return new Vector(updown * this.y, updown * -this.x);
	}
	/**
	 * Add a vector v to this vector
	 * @param  {Vector} v
	 * @return {Vector}
	 */
	add(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	}

	/**
	 * Modify the length of this vector by dividing it by c
	 * @param  {number} c
	 * @return {Vector}
	 */
	divide(c) {
		this.x /= c;
		this.y /= c;
		return this;
	}

	/** return the vectors angle in the range -PI to PI
	 * @return {number}
	 */
	getAngle() {
		function getAngleSupport(x, y) {
			if (x == 0) {
				if (y > 0) {
					return Math.PI / 2;
				} else {
					return -Math.PI / 2;
				}
			}

			let ratio = y / x;
			let returnAngle = Math.atan(ratio);
			if (x < 0) {
				returnAngle = Math.PI + returnAngle;
			}
			return returnAngle;
		}
		return getAngleSupport(this.x, this.y);
	}

	/** Class method that Returns a new vector that is the sum of two vectors
	 * @param  {Vector} v1
	 * @param  {Vector} v2
	 * @return {Vector}
	 */
	static addVectors(v1, v2) {
		return new Vector(v1.x + v2.x, v1.y + v2.y);
	}

	/** Class method that clones a vector
	 * @param  {Vector} v
	 * @return {Vector}
	 */
	static clone(v) {
		return new Vector(v.x, v.y);
	}

	/**
	 * @param  {Vector} v1
	 * @param  {Vector} v2
	 * @return {number}
	 */
	static subtractVectors(v1, v2) {
		return new Vector(v1.x - v2.x, v1.y - v2.y);
	}
	/**
	 * @param  {number} m
	 * @param  {Vector} v1
	 * @return {Vector}
	 */
	static multiplyVector(m, v1) {
		return new Vector(m * v1.x, m * v1.y);
	}
	/**
	 * @param  {Vector} v1
	 * @param  {number} m
	 * @return {Vector}
	 */
	static divideVector(v1, m) {
		return new Vector(v1.x / m, v1.y / m);
	}

	/**
	 * @param  {Vector} v
	 * @return {number}
	 */
	static length2(v) {
		return v.x * v.x + v.y * v.y;
	}
	/**
	 * @param  {Vector} v
	 * @return {number}
	 */
	static length(v) {
		return Math.sqrt(Vector.length2(v));
	}

	/** returns the distance between two positions
	 * @param  {Node} p1
	 * @param  {Node} p2
	 * @return {number}
	 */
	static distance(p1, p2) {
		return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
	}
}

/**
 * @class
 * @extends Vector
 */
class Position extends Vector {
	/** Create a two dimensional position
	 * @param  {number} x The horizontal position
	 * @param  {number} y The vertical position
	 */
	constructor(x, y) {
		super(x, y);
	}
}

/**
 * @class
 * @extends Vector
 */
class Force extends Vector {
	/**
	 * @param  {number} x The horizontal position
	 * @param  {number} y The vertical position
	 */
	constructor(x, y) {
		super(x, y);
	}
}

/**
 * @class
 * @extends Vector
 */
class Velocity extends Vector {
	/**
	 * @param  {number} x The horizontal position
	 * @param  {number} y The vertical position
	 */
	constructor(x, y) {
		super(x, y);
	}

	/**
	 * Add a vector v to this vector
	 * @param  {Vector} v
	 * @return {Velocity}
	 */
	add(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	}
}

/**
 * @class
 */
class Line {
	/**
	 * @param  {Vector} start The start position
	 * @param  {Vector} end The end position
	 */
	constructor(start, end) {
		this.start = start;
		this.end = end;
	}

	// This returns true if the closest point from p3 on the line crossing p1 and p2 lies between p1 and p2
	/**
	 * @param  {Tensor} otherline The line second crosses this line
	 * @return {Object} where two value tells how far into each line the intersection is
	 */
	intersect(otherline) {
		let p1 = this.start;
		let p2 = this.end;
		let p3 = otherline.start;
		let p4 = otherline.end;
		let xdifference = p4.x - p3.x;
		let ydifference = p4.y - p3.y;
		let res;
		if ((ydifference == 0) && (xdifference == 0)) {
			return false;
		} else if (ydifference == 0) {
			if (p2.y - p1.y == 0) {
				return false;
			}
			res = -(p1.y - p3.y) / (p2.y - p1.y);
		} else if (xdifference == 0) {
			if (p2.x - p1.x == 0) {
				return false;
			}
			res = -(p1.x - p3.x) / (p2.x - p1.x);
		} else {
			try {
				res = ((p1.x - p3.x) / xdifference - (p1.y - p3.y) / ydifference) / ((p2.y - p1.y) / ydifference - (p2.x - p1.x) / xdifference);
			} catch (error) {
				return false;
			}
		}
		let otherRes = (p1.x - p3.x + (p2.x - p1.x) * res) / xdifference;
		return {
			'thisDistance': res,
			'otherDistance': otherRes
		};
	}

	reverse() {
		return new Line(this.end, this.start);
	}

	// Is position to the left of this line?
	/**
	 * @param  {Position} p3 
	 * @return {number} returns a positive number if p3 is on the left of this line
	 */
	left(p3) {
		let a = Vector.subtractVectors(this.end, this.start);
		let b = Vector.subtractVectors(p3, this.start);
		if (!Vector.length2(a)) {
			return NaN;
		}
		let s = Vector.dotProduct(a, b.perpendicular(1)) / Vector.length2(a);
		return s;
	}


	// return the fraction of the closest position on this line to p3
	/**
	 * @param  {Position} p3 
	 * @return {number} returns a fraction of the distance on this line that is closest to p3
	 */
	closest(p3) {
		let a = Vector.subtractVectors(this.end, this.start);
		let b = Vector.subtractVectors(p3, this.start);
		let t = Vector.dotProduct(a, b) / Vector.length2(a);
		return t;
	}

}


var p1 = new Vector(0, 0);
var p2 = new Vector(1, 1);
var f1 = new Vector(1, 0);
var f2 = new Vector(1, 1);

var past = new Line(p1, p2);
var future = new Line(f1, f2);
var startc = new Line(p1, f1);
var endc = new Line(p2, f2);

console.log(inside(new Position(0.5, 0.5), past, future, startc, endc));

/**
 * is the position inside the four lines
 * @param  {Position} position
 * @param  {Line} tensorPast
 * @param  {Line} tensorFuture
 * @param  {Line} startChange
 * @param  {Line} endChange
 * @return {Object} {inside: Boolean, twisted: boolean}
 */
function inside(position, tensorPast, tensorFuture, startChange, endChange) {
	function close(a,b) {
		if (Math.abs(a-b)<0.000001) {
			return true; 
		}
		return false;
	}
	// First part checks if the 4 sides contains a twist
	let twistedChangeTemp = startChange.intersect(endChange);
	let twistedChange;
	if (twistedChangeTemp) {
		twistedChange = (0 <= twistedChangeTemp.thisDistance) && (twistedChangeTemp.thisDistance <= 1);
	} else  {
		twistedChange = false;
	}
	let twistedTensorTemp = tensorPast.intersect(tensorFuture);
	let twistedTensor;
	if (twistedTensorTemp) {
		twistedTensor = (0 <= twistedTensorTemp.thisDistance) && (twistedTensorTemp.thisDistance <= 1);
	} else  {
		twistedTensor = false;
	}
	//let twistedTensor = (0 <= twistedTensorTemp.thisDistance) && (twistedTensorTemp.thisDistance <= 1);
	let cycles = [];
	if (twistedChangeTemp && close(twistedChangeTemp.thisDistance, 1)) { // a tensor becomes 0 length
		cycles.push([startChange.reverse(), tensorPast, endChange]);
	} else if (twistedChangeTemp && close(twistedChangeTemp.thisDistance, 0)) { // a tensor comes from 0 length
		cycles.push([endChange, tensorFuture.reverse(), startChange.reverse()]);
	} else if (twistedTensorTemp && close(twistedTensorTemp.thisDistance, 0)) { // the tensors start is stationary
		cycles.push([tensorPast, endChange, tensorFuture.reverse()]);
	} else if (twistedTensorTemp && close(twistedTensorTemp.thisDistance, 1)) { // the tensors end is stationary
		cycles.push([startChange.reverse(), tensorPast, tensorFuture.reverse()]);
	} else if (twistedTensor) { // the tensors rotates around itself
		cycles.push([tensorPast, tensorFuture.reverse(), endChange]);
		cycles.push([tensorPast, tensorFuture.reverse(), startChange.reverse()]);
	} else if (twistedChange) { // the tensors switches direction (so the end change vectors cross)
		cycles.push([tensorPast, endChange, startChange.reverse()]);
		cycles.push([tensorFuture.reverse(), endChange, startChange.reverse()]);
	} else {
		cycles.push([tensorPast, endChange, tensorFuture.reverse(), startChange.reverse()]);
	}
	// Second part checks if the position is all inside
	for (let cycle of cycles) {
		let soFarInside = true;
		let side = 0;
		for (let i = 0; i < cycle.length; i++) {
			let currentSide = cycle[i].left(position);
			if (!side) {
				side = currentSide;
			}

			if (isNaN(currentSide)) {
				console.log('here');
			}

			if (!isNaN(currentSide)) { // If one of the nodes is completely still, for example
				if (side * currentSide < 0) {
					soFarInside = false;
				}
			}
		}
		if (soFarInside) {
			return true;
		}
	}
	return false;
}
/*
let pos11 = new Position(1,1);
let pos12 = new Position(9,1);
let pos21= new Position(1,9);
let pos22= new Position(9,9);


let past= new Line(pos11, pos12);
let future= new Line(pos21, pos22);
let startChange= new Line(pos11, pos21);
let endChange= new Line(pos12, pos22);


console.log('INSIDE:'+inside(new Position(2,2), past, future, startChange, endChange));



function tst() {
	//var rng = new RNG(20);
	for(let i=-2; i<12; i+=0.2) {
		for (let j =-2; j<12; j+= 0.2 ) {
			let newPos = new Position(i,j); //rng.nextRange(-1, 12), rng.nextRange(-1, 12));
			let color ='red';
			if (inside(newPos, past, future, startChange, endChange)) {
				color='green';
			}
			new Node(universe.currentWorld, universe.currentNode, 'node', {
				'name': 'aaball_'+i,
				'mass': 1,
				'size': 0.04,
				'color': color,
				'localPosition': newPos,
				'velocityLoss': 1,
			});
		}}
}*/

/** Ensure that an Rad angle is inside the -PI to  PI span
 * @param  {number} angle
 * @return {number}
 */
function anglify(angle) {
	while (angle > Math.PI) {
		angle -= 2 * Math.PI;
	}
	while (angle < -Math.PI) {
		angle += 2 * Math.PI;
	}
	return angle;
}

/**
 * Find multiplier s in L = p3 + perp(p2-p1)s = c where c crosses p1p2
 * The sign of s will tell if p3 is on the right side of the p1p2 line. S<0 means right side
 * @param  {Position} p1
 * @param  {Position} p2
 * @param  {Position} p3
 * @return {number} This number tells the minimum distance between the P1 P2 line and p3. The sign tells if on right or left side
 */
function getS(p1, p2, p3) {
	let a = Vector.subtractVectors(p2, p1);
	let b = Vector.subtractVectors(p3, p1);
	let s = Vector.dotProduct(a, b.perpendicular(1)) / Vector.length2(a);
	return s;
}

/**
 * Find multiplier t in L = p1 + perp(p2-p1)t = c where c is the closest point to p3 on p1p2
 * if 0<=t<=1 it lies between p1 and p2.
 * t can also be used to determina at what fraction of p1p2 it should "break"
 * @param  {Position} p1 The line first crosses p1
 * @param  {Position} p2 The line then crosses p2
 * @param  {Position} p3 The Position we want to check
 * @return {number} This represent where on the p1p2 line P3 is closest
 */
function getT(p1, p2, p3) {
	let a = Vector.subtractVectors(p2, p1);
	let b = Vector.subtractVectors(p3, p1);
	let t = Vector.dotProduct(a, b) / Vector.length2(a);
	return t;
}

// This returns true if the closest point from p3 on the line crossing p1 and p2 lies between p1 and p2
/**
 * @param  {Position} p1 The line first crosses p1
 * @param  {Position} p2 The line then crosses p2
 * @param  {Position} p3 The Position we want to check
 * @return {number} This represent where on the p1p2 line P3 is closest
 */
function getTInside(p1, p2, p3) {
	let t = getT(p1, p2, p3);
	return ((0 <= t) && (t <= 1));
}

// This returns true if the closest point from p3 on the line crossing p1 and p2 lies between p1 and p2
/**
 * @param  {Position} p1 The line first crosses p1
 * @param  {Position} p2 The line second crosses p2
 * @param  {Position} p3 The Position we want to check
 * @return {number} This represent where on the p1p2 line P3 is closest
 */
function getTInside2(p1, p2, p3) {
	let t = getT(p1, p2, p3);
	return ((0.05 <= t) && (t <= 0.95));
}


/**
 * Check if p1 and p2 are within horizontal or vertical distance from each other
 * Used as a sloppy fast distance check without squareroot operations
 * @param  {Position} p1
 * @param  {Position} p2
 * @param  {number} distance
 * @return {number}
 */
function boxClose(p1, p2, distance) {
	return Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y)) < distance;
}

/**
 * @param  {World} world
 * @param  {Object} representationObject
 * @param  {Object} nodeList
 * @param  {Object} tensorList
 * @return {Object}
 */
function objectFactory(world, representationObject) {
	let newObject = (Function('return new ' + representationObject.classname))();
	newObject.world = world;
	return newObject;
}


/**
 * @param  {number} text
 * @param  {number} hidden
 */
function timelog() { // text, hidden) {
	return;
	/* if (!this.lastTimeTemp) {
		this.lastTimeTemp=Date.now();
	}
	let t = Date.now()-this.lastTimeTemp;
	if (!hidden && t>1) {
		console.log(text+' '+t);
	}
	this.lastTimeTemp=Date.now(); */
}