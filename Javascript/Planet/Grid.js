/*jshint esversion:6 */
/* globals SimpleNode */


/**
 * Inspired by https://www.redblobgames.com/x/1722-b-rep-triangle-meshes/
 * @class
 */
class Grid {
	/**
	 */
	constructor(seeds=[]) {
		this.seeds=seeds;
		this.edgeNodes=[];
	}

}



var node1 = new SimpleNode(undefined, undefined, 'node', {
	'name': 'node1',
	'localPosition': new Position(1, 1),
});

var node2 = new SimpleNode(undefined, undefined, 'node', {
	'name': 'node2',
	'localPosition': new Position(2, 22),
});

var test = new Grid([node1, node2]);