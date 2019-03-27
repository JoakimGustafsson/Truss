/* global AlertVector */

/**
 * @class
 */
class TrussView {
	/**
	 * This class is used to convert between in world coordinates to
	 * screen display coordinates.
	 *
	 * Currently also used to draw a few simple forms and display text.
	 *
	 * @param  {Vector} worldViewSize The size of the world to fit onto the screenSize
	 * @param  {TrussNode} parentNode The HTML element displaying the world view
	 */
	constructor(worldViewSize, parentNode) {
		// this.element=element;
		this.parentNode = parentNode;
		Object.defineProperty(this, 'element', {
			get: function () {
				return this.parentNode.element;
			},
		});

		this.offset = new Vector(0, 0);
		this.context = undefined;
		if (this.element) {
			this.setupAlertVectors(this.element, worldViewSize);
			this.resize();
		}

		Object.defineProperty(this, 'worldViewSize', {
			get: function () {
				return this._worldViewSize;
			},
			set: function (value) {
				this._worldViewSize.x = value.x;
				this._worldViewSize.y = value.y;
			},
		});
	}
	/**
	 * @param  {Element} element
	 * @param  {Position} worldViewSize
	 */
	setupAlertVectors(element, worldViewSize) {
		let x = 0;
		let y = 0;
		let _this = this;
		if (element) {
			x = element.offsetWidth;
			y = element.offsetHeight;
		}
		this.createAlertScreenSize(x, y, element, _this);
		if (worldViewSize) {
			x = worldViewSize.x;
			y = worldViewSize.y;
		}
		this.createAlertWorldSize(x, y, _this);
	}

	createAlertWorldSize(x, y, _this) {
		let handlers = {
			set(target, key, value, context) {
				let returnValue = Reflect.set(target, key, value, context);
				if (key == 'x' || key == 'y') {
					_this.recalculate();
				}
				return returnValue;
			}
		};
		this._worldViewSize = new Proxy(new Vector(x, y), handlers);
	}

	createAlertScreenSize(x, y, element, _this) {
		let handlers = {
			set(target, key, value) {
				if (key == 'v') {
					target.x = value.x;
					target.y = value.y;
					_this.recalculate();
				}
				return true;
			}
		};
		this.screenSize = new Proxy(new Vector(x, y), handlers);
	}

	/** Multiply this number with a screen distance in pixels to get the world distance
	 * @return {number}
	 */
	getDistanceMultiplier() {
		return this.distanceMultiplier;
	}
	/**
	 */
	resize() {
		this.screenSize.v = new Vector(this.element.offsetWidth, this.element.offsetHeight);
		this.recalculate();
	}

	/**
	 * Check if this position is inside the visible screen
	 * @param  {Position} position
	 * @return {number} 0 if it is outside
	 */
	inside(position) {
		return (this.x(position) > 0 &&
			this.x(position) < this.context.canvas.width &&
			this.y(position) > 0 &&
			this.y(position) < this.context.canvas.height);
	}

	/** Given a position p in the world, return the position on this views display
	 * @param  {Position} p The inworld position
	 * @return {number} The vertical position on this views display
	 */
	x(p) {
		return (p.x - this.offset.x) / this.xScale;
	}

	/** Given a position p in the world, return the position on this views display
	 * @param  {Position} p The inworld position
	 * @return {number} The horizontal position on this views display
	 */
	y(p) {
		return (p.y - this.offset.y) / this.yScale;
	}

	/**
	 * Given a x and y position on this views display, return the world position
	 * @param  {number} x
	 * @param  {number} y
	 * @return {Position}
	 */
	worldPosition(x, y) {
		return new Position(x * this.xScale + this.offset.x, y * this.yScale + this.offset.y);
	}

	/**
	 * Given a x and y position on screen display, return the world position, taking the HTML elements position into account
	 * @param  {number} x
	 * @param  {number} y
	 * @return {Position}
	 */
	worldPositionWithOffset(x, y) {
		return new Position((x - this.elemRectleft + this.bodyRectleft) * this.xScale + this.offset.x,
			(y - this.elemRecttop + this.bodyRecttop) * this.yScale + this.offset.y);
	}

	/**
	 * Given a position in the world, return the screen position
	 * @param  {Position} position
	 * @return {Position}
	 */
	screenPosition(position) {
		return new Position(this.x(position) + 1, this.y(position) + 1);
	}

	/**
	 * Put an HTML element with world position on the screen
	 * @param  {Position} position
	 * @param  {Element} element
	 */
	putElementOnScreen(position, element) {
		element.style.left = this.x(position) + 'px';
		element.style.top = this.y(position) + 'px';
		// return new Position(this.x(position) + 1, this.y(position) + 1);
	}

	/**
	 * Assuming that the context has been set, draw a line between two in-world positions
	 * @param  {Position} position1
	 * @param  {Position} position2
	 */
	drawLine(position1, position2) {
		this.context.moveTo(this.x(position1), this.y(position1));
		this.context.lineTo(this.x(position2), this.y(position2));
	}

	/**
	 * Assuming that the context has been set, draw a circle with 'radius' at 'position'
	 * @param  {Position} position The center
	 * @param  {number} radius The radius
	 */
	drawCircle(position, radius) {
		this.context.arc(this.x(position), this.y(position), radius / this.yScale, 0, 2 * Math.PI);
	}

	/**
	 * @param  {Position} position
	 * @param  {string} text
	 */
	drawText(position, text) {
		this.context.fillText(text, this.x(position), this.y(position));
	}

	/**
	 * Support function to refresh the ratios so. Should not be manually used
	 */
	recalculate() {
		if (!this.worldViewSize || !this.screenSize) {
			return;
		}
		this.xScale = this.worldViewSize.x / this.screenSize.x;
		this.yScale = this.worldViewSize.y / this.screenSize.y;

		this.distanceMultiplier = Math.max(this.xScale, this.yScale);

		// Do the following to avoid reading element properties that slows down rendering
		this.bodyRect = document.body.getBoundingClientRect();
		this.elemRect = this.element.getBoundingClientRect();
		this.bodyRectleft = this.bodyRect.left;
		this.elemRectleft = this.elemRect.left;
		this.bodyRecttop = this.bodyRect.top;
		this.elemRecttop = this.elemRect.top;
	}

	/**
	 * Set the size of the screen display you want to see
	 * @param  {Vector} screenSize
	 */
	setScreenSize(screenSize) {
		this.screenSize = screenSize;
		this.recalculate();
	}

	/**
	 * Set the size of the area in the world you want to see
	 * @param  {Vector} worldViewSize
	 */
	setWorldViewSize(worldViewSize) {
		this.worldViewSize = worldViewSize;
		this.recalculate();
	}

	/**
	 * Set where in the world you want to watch
	 * @param  {Vector} offset
	 */
	setOffset(offset) {
		this.offset = offset;
	}

	/**
	 * Set where in the world you want to watch
	 * TODO rewrite
	 * @param  {Vector} mouseScreenPanning
	 */
	updateOffset(mouseScreenPanning) {
		this.offset.x += mouseScreenPanning.x * this.xScale;
		this.offset.y += mouseScreenPanning.y * this.yScale;
	}

	/**
	 * Set where in the world you want to watch
	 * TODO rewrite
	 * @param  {Vector} deltaScaleOnScreen
	 * @param  {Vector} screenCenter
	 */
	updateScale(deltaScaleOnScreen, screenCenter) {
		let center = this.worldPosition(screenCenter.x, screenCenter.y);

		this.xScale -= deltaScaleOnScreen.x * this.xScale;
		this.yScale -= deltaScaleOnScreen.y * this.yScale;

		this.offset.x += (center.x - this.offset.x) * deltaScaleOnScreen.x;
		this.offset.y += (center.y - this.offset.y) * deltaScaleOnScreen.y;
	}

}