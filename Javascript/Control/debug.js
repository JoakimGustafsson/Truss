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
function smallnodezoom(node, halt=1) {
	let minX = -Infinity;
	let maxX = Infinity;
	let minY = -Infinity;
	let maxY = Infinity;
	let minLength = Infinity;
	let index=0;

	for(let i=0; i<node.connectedTensors.length; i++) {
		let tensor=node.connectedTensors[i];
		console.log(i);
		if (tensor.getLength()<minLength) {
			minLength=tensor.getLength();
			index=i;
		}
	}
	console.log(index);
	if (minLength==Infinity) { return; }
	let shortTensor =node.connectedTensors[index];
	minX =Math.min(shortTensor.node1.localPosition.x, shortTensor.node2.localPosition.x);
	maxX =Math.max(shortTensor.node1.localPosition.x, shortTensor.node2.localPosition.x);
	minY =Math.min(shortTensor.node1.localPosition.y, shortTensor.node2.localPosition.y);
	maxY =Math.max(shortTensor.node1.localPosition.y, shortTensor.node2.localPosition.y);
	let xlength = maxX-minX;
	let ylength= maxY-minY;
	let length = Math.max(xlength, ylength);
	minX -= length/10;
	maxX += length/10;
	minY -= length/10;
	maxY += length/10;
		
	console.log(minX);
		
	console.log(maxX);
		
	console.log(minY);
		
	console.log(maxY);
	
	universe.currentNode.worldOffset = new Vector(minX, minY) ;
	universe.currentNode.worldSize = new Vector(length*1.3, length*1.3);
	//universe.currentNode.view.resize();
	universe.show();
	universe.currentNode.resize();
	if (halt) {
		togglepause();
	}
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
