/*jshint esversion:6 */
/* exported Labels */


/**
 * @class
 */
class System {
	/**
	 */
	constructor(nrPlanet=1) {
		let planets=[];
		for (let i=0; i<nrPlanet ;i++) {
			planets.push(new Planet());
		}
		console.log(planets);
	}
    
}

/**
 * @class
 */
class Planet {
	/**
	 */
	constructor(defaultDiv, size=255) {
		this.matrix=[];
		this.size=size;
		this.defaultDiv=defaultDiv;
		let historyFunctionList=[];

		this.debugColorMap=[
			'blue',
			'blue',
			'#E5E4E2',
			'#E5E4E2',
			'#E5E4E2',
			'#4C787E',
			'#3D3C3A',
			'#837E7C',
			'White',
			'White'];

		for (let i=0; i<this.size ;i++) {
			let row=[];
			for (let j=0; j<this.size ;j++) {
				row.push(Math.random(1));
			}
			this.matrix.push(row);
		}
        
		this.display();

		for (let event in historyFunctionList) {
			event(this.matrix);
		}
		this.display();
        
	}
    
	display(defaultDiv) {
		if (!defaultDiv) {
			defaultDiv=this.defaultDiv;
		}
		let width =defaultDiv.clientWidth/this.size;
		let height =defaultDiv.clientHeight/this.size;
		for (let i=0 ; i<this.size;i++) {
			for (let j=0; j<this.size ;j++) {
				let div = document.createElement('div');
				div.style.position='absolute';
				div.style.top=i*height+'px';
				div.style.left=j*width+'px';
				div.style.position='absolute';
				div.style.width = width+'px';
				div.style.height = height+'px';
				div.style.background = this.debugColorMap[Math.round(Math.random()*9)];
				div.style.color = 'white';
				defaultDiv.appendChild(div);
			}
		}
	}
}

function RNG(seed) {
	// LCG using GCC's constants
	this.m = 0x80000000; // 2**31;
	this.a = 1303515541;
	this.c = 7008;
  
	this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
}
RNG.prototype.nextInt = function() {
	this.state = (this.a * this.state + this.c) % this.m;
	return this.state;
};
RNG.prototype.nextFloat = function() {
	// returns in range [0,1]
	return this.nextInt() / (this.m - 1);
};
RNG.prototype.nextRange = function(start, end) {
	// returns in range [start, end): including start, excluding end
	// can't modulu nextInt because of weak randomness in lower bits
	var rangeSize = end - start;
	var randomUnder1 = this.nextInt() / this.m;
	return start + Math.floor(randomUnder1 * rangeSize);
};
RNG.prototype.choice = function(array) {
	return array[this.nextRange(0, array.length)];
};
  
/*
var rng = new RNG(20);
for (let i = 0; i < 10; i++)
	console.log(rng.nextRange(10, 50));
  
var digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
for (let i = 0; i < 10; i++)
	console.log(rng.choice(digits));*/