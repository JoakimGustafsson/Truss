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
		this.x = x;
		this.y = y;
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
		return '[x'+ this.x+' y:'+ this.y+']';
	}

	/**
	 * @param  {Object} restoreObject
	 * @return {Vector}
	 */
	deserialize(restoreObject) {
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
		return Vector.multiplyVector(l / length, this);
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
	perpendicular(updown=1) {
		return new Vector(updown*this.y, updown*-this.x);
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
 * @param  {Position} p2 The line second crosses p2
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
 * @param  {Position} p2 The line second crosses p2
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
	newObject.world=world;
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

/**
	 * @param  {Element} backgroundDiv
	 * @param  {String} text
	 * @param  {Function} f
	 * @param  {String} id
	 * @return {Button}
	 */
function createSimpleButton(backgroundDiv, text, f, id) {
	let newButton = document.createElement('button');
	newButton.classList.add('simpleButton');
	newButton.classList.add('noselect');
	if (id) {
		newButton.id=id;
	}
	newButton.innerHTML = text;
	backgroundDiv.appendChild(newButton);
	newButton.addEventListener('click', f, false);
	return newButton;
}

