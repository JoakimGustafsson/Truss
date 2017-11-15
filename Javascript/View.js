/**
 * 
 */


function View(screenSize, worldViewSize){
	this.screenSize=screenSize;
	this.worldViewSize=worldViewSize;
	this.xScale=worldViewSize.x/screenSize.x;
	this.yScale=worldViewSize.y/screenSize.y;
	this.offset= new Vector(0,0);
	this.context=undefined;

	View.prototype.inside = function(position){
		return (
				this.x(position)>0 &&
				this.x(position)<this.context.canvas.width &&
				this.y(position)>0 &&
				this.y(position)<this.context.canvas.height);
	}

	View.prototype.x = function(p){		// Screen X
		return (p.x+this.offset.x)/this.xScale;
	}
	View.prototype.y = function(p){		// Screen Y
		return (p.y+this.offset.y)/this.yScale;
	}

	View.prototype.worldPosition = function(x,y){
		return new Position(x*this.xScale-this.offset.x, y*this.yScale-this.offset.y);
	}
	
	View.prototype.drawLine = function(position1,position2){
		this.context.moveTo(this.x(position1), this.y(position1));
		this.context.lineTo(this.x(position2), this.y(position2));
	}

	View.prototype.drawCircle = function(position,radius){
		this.context.arc(this.x(position), this.y(position), radius/this.yScale, 0, 2*Math.PI);
	}

	View.prototype.drawText = function(position,text){
		this.context.fillText(text,this.x(position), this.y(position));
	}

	View.prototype.recalculate = function(){
		this.xScale=worldViewSize.x/screenSize.x;
		this.yScale=worldViewSize.y/screenSize.y;
	}

	View.prototype.setScreenSize = function(screenSize){
		this.screenSize=screenSize;
		this.recalculate();
	}

	View.prototype.setWorldViewSize = function(worldViewSize){
		this.worldViewSize=worldViewSize;
		this.recalculate();
	}

	View.prototype.setOffset = function(offset){
		this.offset=offset;
	}
	
}
