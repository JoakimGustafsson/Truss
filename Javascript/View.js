class View {
	constructor(screenSize, worldViewSize) {
		this.screenSize = screenSize;
		this.worldViewSize = worldViewSize;
		this.xScale = worldViewSize.x / screenSize.x;
		this.yScale = worldViewSize.y / screenSize.y;
		this.offset = new Vector(0, 0);
		this.context = undefined;
	}

	inside(position) {
		return (this.x(position) > 0 &&
			this.x(position) < this.context.canvas.width &&
			this.y(position) > 0 &&
			this.y(position) < this.context.canvas.height);
	};
	
	x(p) {
		return (p.x + this.offset.x) / this.xScale;
	};

	y(p) {
		return (p.y + this.offset.y) / this.yScale;
	};

	worldPosition(x, y) {
		return new Position(x * this.xScale - this.offset.x, y * this.yScale - this.offset.y);
	};

	drawLine(position1, position2) {
		this.context.moveTo(this.x(position1), this.y(position1));
		this.context.lineTo(this.x(position2), this.y(position2));
	};

	drawCircle(position, radius) {
		this.context.arc(this.x(position), this.y(position), radius / this.yScale, 0, 2 * Math.PI);
	};

	drawText(position, text) {
		this.context.fillText(text, this.x(position), this.y(position));
	};

	recalculate() {
		this.xScale = worldViewSize.x / screenSize.x;
		this.yScale = worldViewSize.y / screenSize.y;
	};

	setScreenSize(screenSize) {
		this.screenSize = screenSize;
		this.recalculate();
	};

	setWorldViewSize(worldViewSize) {
		this.worldViewSize = worldViewSize;
		this.recalculate();
	};

	setOffset(offset) {
		this.offset = offset;
	};

}