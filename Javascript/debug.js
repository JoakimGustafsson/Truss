/*jshint esversion:6*/

/* This file includes scripts that are designed to simplify debugging debug */

/**
 * Zoom in on a node such that all the tensors connected to it are shown
 * @param  {object} element
 * @param  {Array} list
 */
function a(element, list) {
	let index = list.indexOf(element);
	if (index >= 0) {
		list.splice(index, 1);
	}
}

/**
 * Zoom in on a node such that all the smallest tensor connected to it are shown
 * @param  {object} element
 * @param  {Array} list
 */
function a(element, list) {
	let index = list.indexOf(element);
	if (index >= 0) {
		list.splice(index, 1);
	}
}
