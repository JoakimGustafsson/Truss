
import { Vector, AlertVector, Position } from '../Primitives.js';

/**
 * @class
 */
class View {
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
			get: function() {
				return this.parentNode.element;
			},
		});

		this.offset = new Vector(0, 0);
		this.context = undefined;
		if (this.element) {
			this.setupAlertVectors(this.element, worldViewSize);
			this.resize();
		}
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
			x = element.clientWidth || element.offsetWidth;
			y = element.clientHeight || element.offsetHeight;
		}
		this.screenSize = new AlertVector(new Vector(x, y), function(v) {
			element.offsetWidth = v.x;
			element.offsetHeight = v.y;
			_this.recalculate();
		});
		if (worldViewSize) {
			x = worldViewSize.x;
			y = worldViewSize.y;
		}
		this.worldViewSize = new AlertVector(new Vector(x, y), function(x) {
			_this.recalculate();
		});
	}

	/** Multiply this number with a screen distance in pixels to get the world distance
	 * @return {number}
	 */
	getDistanceMultiplier() {
		return this.distanceMultiplier;
	}

	/** When true, xScale is forced to equal yScale (uniform/square scaling).
	 * Driven by the parent TrussNode's lockedRatio property.
	 * @return {boolean}
	 */
	get lockedRatio() {
		return this.parentNode && this.parentNode.lockedRatio;
	}

	/**
	 * @param  {boolean} [scale] When true, recalculate from saved worldViewSize without preserving zoom.
	 *                           Omit (or false) on window resize to preserve the current zoom level.
	 */
	resize(scale) {
		const oldWidth = this.screenSize.x;
		const oldHeight = this.screenSize.y;
		// Write directly to backing vector to defer the recalculate() call
		this.screenSize.v.x = this.element.clientWidth || this.element.offsetWidth;
		this.screenSize.v.y = this.element.clientHeight || this.element.offsetHeight;
		if (!scale) {
			// Window-resize path: keep world/screen ratio so zoom level is preserved
			if (oldWidth && this.screenSize.x) {
				this.worldViewSize.v.x = this.worldViewSize.x * (this.screenSize.x / oldWidth);
			}
			if (oldHeight && this.screenSize.y) {
				this.worldViewSize.v.y = this.worldViewSize.y * (this.screenSize.y / oldHeight);
			}
		}
		this.recalculate();
	}

	/**
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(tensorList) {
		return {
			'screenSize': this.screenSize.serialize(),
			'worldViewSize': this.worldViewSize.serialize(),
			'offset': this.offset.serialize(),
		};
	}

	/**
	 * @param {Object} restoreObject
	 * @return {View}
	 */
	deserialize(restoreObject) {
		let screenSize = new Vector().deserialize(restoreObject.screenSize);
		this.element.style.width = screenSize.x + 'px';
		this.element.style.height = screenSize.y + 'px';
		this.setupAlertVectors(this.element, new Vector().deserialize(restoreObject.worldViewSize));
		this.offset = new Vector().deserialize(restoreObject.offset);
		this.recalculate();
		return this;
	}

	/**
	 * Check if this position is inside the visible screen
	 * @param  {Position} position
	 * @return {number} 0 if it is outside
	 */
	inside(position) {
		// Allow drawing even if outside canvas bounds - zoom can make objects appear far from their world position
		// return (this.x(position) > 0 &&
		// 	this.x(position) < this.context.canvas.width &&
		// 	this.y(position) > 0 &&
		// 	this.y(position) < this.context.canvas.height);
		return true;
	};

	/** Given a position p in the world, return the position on this views display
	 * @param  {Position} p The inworld position
	 * @return {number} The vertical position on this views display
	 */
	x(p) {
		return (p.x - this.offset.x) / this.xScale;
	};

	/** Given a position p in the world, return the position on this views display
	 * @param  {Position} p The inworld position
	 * @return {number} The horizontal position on this views display
	 */
	y(p) {
		return (p.y - this.offset.y) / this.yScale;
	};

	/**
	 * Given a x and y position on this views display, return the world position
	 * @param  {number} x
	 * @param  {number} y
	 * @return {Position}
	 */
	worldPosition(x, y) {
		return new Position(x * this.xScale + this.offset.x, y * this.yScale + this.offset.y);
	};

	/**
	 * Given a x and y position on screen display, return the world position, taking the HTML elements position into account
	 * x/y are viewport coordinates (e.g. MouseEvent.clientX/clientY).
	 * @param  {number} x
	 * @param  {number} y
	 * @return {Position}
	 */
	worldPositionWithOffset(x, y) {
		return new Position((x - this.elemRectleft) * this.xScale + this.offset.x,
			(y - this.elemRecttop) * this.yScale + this.offset.y);
	};

	/**
	 * Given a x and y position in the world, return the screen position
	 * @param  {Position} node
	 * @return {Position}
	 */
	screenPosition(node) {
		return new Position(this.x(node) + 1, this.y(node) + 1);
	};

	/**
	 * Assuming that the context has been set, draw a line between two in-world positions
	 * @param  {Position} position1
	 * @param  {Position} position2
	 */
	drawLine(position1, position2) {
		this.context.moveTo(this.x(position1), this.y(position1));
		this.context.lineTo(this.x(position2), this.y(position2));
	};

	/**
	 * Assuming that the context has been set, draw a circle with 'radius' at 'position'
	 * @param  {Position} position The center
	 * @param  {number} radius The radius
	 */
	drawCircle(position, radius) {
		this.context.arc(this.x(position), this.y(position), radius / this.yScale, 0, 2 * Math.PI);
	};

	/**
	 * @param  {Position} position
	 * @param  {string} text
	 */
	drawText(position, text) {
		this.context.fillText(text, this.x(position), this.y(position));
	};

	/**
	 * Draw debug circles at finger positions in world space
	 * @param  {Array} fingerWorldPositions Array of world positions
	 */
	drawFingerIndicators(fingerWorldPositions) {
		if (!fingerWorldPositions || fingerWorldPositions.length === 0) return;
		
		const savedFillStyle = this.context.fillStyle;
		const savedStrokeStyle = this.context.strokeStyle;
		
		fingerWorldPositions.forEach((pos, i) => {
			this.context.beginPath();
			const radius = 0.5; // World units
			this.drawCircle(pos, radius);
			this.context.fillStyle = i === 0 ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)';
			this.context.fill();
			this.context.strokeStyle = i === 0 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 0, 0.8)';
			this.context.lineWidth = 2;
			this.context.stroke();
		});
		
		this.context.fillStyle = savedFillStyle;
		this.context.strokeStyle = savedStrokeStyle;
	};

	/**
	 * Draw debug circles at finger positions in screen space
	 * @param  {Array} fingerScreenPositions Array of screen {x, y} positions
	 */
	drawFingerScreenIndicators(fingerScreenPositions) {
		if (!fingerScreenPositions || fingerScreenPositions.length === 0) return;
		
		const savedFillStyle = this.context.fillStyle;
		const savedStrokeStyle = this.context.strokeStyle;
		const savedLineWidth = this.context.lineWidth;
		
		fingerScreenPositions.forEach((pos, i) => {
			this.context.beginPath();
			const radius = 20; // Screen pixels
			this.context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
			this.context.fillStyle = i === 0 ? 'rgba(255, 100, 100, 0.2)' : 'rgba(100, 255, 100, 0.2)';
			this.context.fill();
			this.context.strokeStyle = i === 0 ? 'rgba(255, 100, 100, 1)' : 'rgba(100, 255, 100, 1)';
			this.context.lineWidth = 3;
			this.context.stroke();
		});
		
		this.context.fillStyle = savedFillStyle;
		this.context.strokeStyle = savedStrokeStyle;
		this.context.lineWidth = savedLineWidth;
	};

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
		if (this.lockedRatio) {
			// Force uniform (square) scaling; x axis matches y axis
			this.xScale = this.yScale;
			// Adjust worldViewSize.x to reflect the locked scale (bypass callback to avoid recursion)
			this.worldViewSize.v.x = this.xScale * this.screenSize.x;
		}

		// Cache the visible canvas rect for pointer<->world conversion
		let pointerRectTarget = this.context && this.context.canvas ? this.context.canvas : this.element;
		this.elemRect = pointerRectTarget.getBoundingClientRect();
		this.elemRectleft = this.elemRect.left;
		this.elemRecttop = this.elemRect.top;
	};

	/**
	 * Pan the view by the given screen-space delta.
	 * @param  {Object} mouseScreenPanning  {x, y} screen pixel delta
	 */
	updateOffset(mouseScreenPanning) {
		this.offset.x += mouseScreenPanning.x * this.xScale;
		this.offset.y += mouseScreenPanning.y * this.yScale;
	};

	/**
	 * Zoom in/out around the given screen-space center point.
	 * @param  {Object} deltaScaleOnScreen  {x, y} fractional scale delta (e.g. 0.1 = 10%)
	 * @param  {Object} screenCenter        {x, y} viewport zoom origin in pixels
	 */
	updateScale(deltaScaleOnScreen, screenCenter) {
		const center = this.worldPositionWithOffset(screenCenter.x, screenCenter.y);
		this.worldViewSize.x -= deltaScaleOnScreen.x * this.worldViewSize.x;
		this.worldViewSize.y -= deltaScaleOnScreen.y * this.worldViewSize.y;
		// Shift the offset so the point under the cursor stays fixed
		this.offset.x += (center.x - this.offset.x) * deltaScaleOnScreen.x;
		this.offset.y += (center.y - this.offset.y) * deltaScaleOnScreen.y;
	};

	/**
	 * Set the size of the area in the world you want to see
	 * @param  {Vector} worldViewSize
	 */
	setWorldViewSize(worldViewSize) {
		this.worldViewSize.x = worldViewSize.x;
		this.worldViewSize.y = worldViewSize.y;
	};

	/**
	 * Set where in the world you want to watch
	 * @param  {Vector} offset
	 */
	setOffset(offset) {
		this.offset.x = offset.x;
		this.offset.y = offset.y;
	};
}

export { View, View as TrussView };
