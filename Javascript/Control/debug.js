/*jshint esversion:6*/

/* This file includes scripts that are designed to simplify debugging debug */

/**
 * Zoom in on a node such that all the tensors connected to it are shown
 * @param  {node} node
 */
//function smallnodezoom(node) {
	
//}

/**
 * Zoom in on a node such that all the smallest tensor connected to it are shown
 * @param  {node} node
 */
function smallnodezoom(node, halt=1, counter=-1) {
	function mapply(func, dim, ...list) {
		let l =[];
		for(let e of list) {
			l.push(+e[dim]);
		}
		return func(...l);
	}
	let minX = -Infinity;
	let maxX = Infinity;
	let minY = -Infinity;
	let maxY = Infinity;
	let minLength = Infinity;
	let index=0;
	let length=0;

	if (counter>0) {
		console.log('counter: '+counter);
	}

	for(let i=0; i<node.connectedTensors.length; i++) {
		let tensor=node.connectedTensors[i];
		//console.log(i);
		if (tensor.getLength()<minLength) {
			minLength=tensor.getLength();
			index=i;
		}
	}
	console.log('Index: '+index);
	console.log('node x: '+node.localPosition.x+ ' node y: '+node.localPosition.y);
	if (minLength==Infinity) { 
		return 'ERROR: No connectors to that node.'; 
	} else {
		let shortTensor =node.connectedTensors[index];
		let ts=universe.currentNode.timestep;

		minX = mapply(Math.min, 'x',
			shortTensor.node1.localPosition, 
			shortTensor.node2.localPosition, 
			Vector.addVectors(shortTensor.node1.localPosition, 
				Vector.multiplyVector(ts, shortTensor.node1.velocity)),
			Vector.addVectors(shortTensor.node2.localPosition, 
				Vector.multiplyVector(ts, shortTensor.node2.velocity)),
		);
		maxX =mapply(Math.max, 'x',
			shortTensor.node1.localPosition, 
			shortTensor.node2.localPosition, 
			Vector.addVectors(shortTensor.node1.localPosition, 
				Vector.multiplyVector(ts, shortTensor.node1.velocity)),
			Vector.addVectors(shortTensor.node2.localPosition, 
				Vector.multiplyVector(ts, shortTensor.node2.velocity)),
		);
		minY = mapply(Math.min, 'y',
			shortTensor.node1.localPosition, 
			shortTensor.node2.localPosition, 
			Vector.addVectors(shortTensor.node1.localPosition, 
				Vector.multiplyVector(ts, shortTensor.node1.velocity)),
			Vector.addVectors(shortTensor.node2.localPosition, 
				Vector.multiplyVector(ts, shortTensor.node2.velocity)),
		);
		maxY =mapply(Math.max, 'y',
			shortTensor.node1.localPosition, 
			shortTensor.node2.localPosition, 
			Vector.addVectors(shortTensor.node1.localPosition, 
				Vector.multiplyVector(ts, shortTensor.node1.velocity)),
			Vector.addVectors(shortTensor.node2.localPosition, 
				Vector.multiplyVector(ts, shortTensor.node2.velocity)),
		);
		let xlength = maxX-minX;
		let ylength= maxY-minY;
		length = Math.max(xlength, ylength);
		console.log('Length: '+length);
		minX = node.localPosition.x-length*1.1;
		maxX = node.localPosition.x+length*1.1;
		minY = node.localPosition.y-length*1.1;
		maxY = node.localPosition.y+length*1.1;
		
		console.log(minX);
		
		console.log(maxX);
		
		console.log(minY);
		
		console.log(maxY);
	}
	universe.currentNode.view.setOffset( new Vector(minX, minY)) ;
	universe.currentNode.view.setWorldViewSize( new Vector(length*4.2, length*4.2));
	//universe.currentNode.view.resize();
	//universe.show();
	//universe.currentNode.resize();
	if (halt && !universe.currentNode.isPaused()) {
		togglepause();
	}
	universe.select(node);
}

/**
 * Zoom in on a node cluster using all tensors tagged by the label 
 * @param  {node} node
 * @param  {label} label
 */
//function smallnodezoom(node, label) {
//}

/**
 * toggles if the force driven movements should halt (toggle)
 * @param  {TrussNode} node
 */
function togglepause(node) {
	if (!node) {
		node=universe.currentNode;
	}
	node.togglePause();
}



function getnamednode(name) {
	for(let node of universe.currentWorld.labels.findLabel('node').nodes) {
		//console.log(node.name);
		if (name==node.name) {
			return node;
		}
	}
}

//zoomonnode

// This function runs a number of ticks and does not clear the screen completely
// The intention is to see what happens over very small time intervals
// Use clearLevel() to (re)set the screen clearing 
// Use tick(-1) to restart normal movement
function tick(number=1) {
	if (number==-1) {
		universe.currentNode.view.clearLevel=1;
		universe.currentNode.togglePause();
		return;
	}
	universe.currentNode.togglePause();
	universe.currentNode.view.clearLevel=0.1;
	//universe.debugHaltTicks=number;
	universe.debugHaltFunction = (counter) => {
		if (counter==number) {
			universe.currentNode.view.clearLevel=0;
			universe.currentNode.togglePause();
			return 0;
		}
		return counter+1;
	};
}

// decides how much to wipe the screen each tick
// 1 -> full clear (normal, default behaviour)
// 0 -> no clear 
function clearLevel(cl=1) {
	universe.currentNode.view.clearLevel=cl;
}
