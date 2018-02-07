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
	 * @param  {Vector} screenSize The size in pixels of the screen
	 * @param  {Vector} worldViewSize The size of the world to fit onto the screenSize
	 */
	constructor(screenSize, worldViewSize) {
		this.screenSize = screenSize;
		this.worldViewSize = worldViewSize;
		this.recalculate();

		this.offset = new Vector(0, 0);
		this.context = undefined;
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
		this.screenSize = new Vector().deserialize(restoreObject.screenSize);
		this.worldViewSize = new Vector().deserialize(restoreObject.worldViewSize);
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
		return (this.x(position) > 0 &&
			this.x(position) < this.context.canvas.width &&
			this.y(position) > 0 &&
			this.y(position) < this.context.canvas.height);
	};

	/** Given a position p in the world, return the position on this views display
	 * @param  {Position} p The inworld position
	 * @return {number} The vertical position on this views display
	 */
	x(p) {
		return (p.x + this.offset.x) / this.xScale;
	};

	/** Given a position p in the world, return the position on this views display
	 * @param  {Position} p The inworld position
	 * @return {number} The horizontal position on this views display
	 */
	y(p) {
		return (p.y + this.offset.y) / this.yScale;
	};

	/**
	 * Given a x and y position on this views display, return the world position
	 * @param  {number} x
	 * @param  {number} y
	 * @return {Position}
	 */
	worldPosition(x, y) {
		return new Position(x * this.xScale - this.offset.x, y * this.yScale - this.offset.y);
	};

	/**
	 * Given a x and y position in the world, return the screen position
	 * @param  {Position} node
	 * @return {Position}
	 */
	screenPosition(node) {
		return new Position(this.x(node)+1, this.y(node)+1);
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
	 * Support function to refresh the ratios so. Should not be manually used
	 */
	recalculate() {
		if (!this.worldViewSize || !this.screenSize) {
			return;
		}
		this.xScale = this.worldViewSize.x / this.screenSize.x;
		this.yScale = this.worldViewSize.y / this.screenSize.y;
	};

	/**
	 * Set the size of the screen display you want to see
	 * @param  {Vector} screenSize
	 */
	setScreenSize(screenSize) {
		this.screenSize = screenSize;
		this.recalculate();
	};

	/**
	 * Set the size of the area in the world you want to see
	 * @param  {Vector} worldViewSize
	 */
	setWorldViewSize(worldViewSize) {
		this.worldViewSize = worldViewSize;
		this.recalculate();
	};

	/**
	 * Set where in the world you want to watch
	 * @param  {Vector} offset
	 */
	setOffset(offset) {
		this.offset = offset;
	};
}
