/*jshint esversion:6*/
/**This class handles how to interpret mouse or touch events in order to pan or zoom in the current view
 * PanZoomHandler class
 * @class
 */
class PanZoomHandler {
	/** This class handles how to interpret mouse or touch events in order to pan or zoom in the current view
     * @param  {Node} currentNode
     */
	constructor(currentNode) {
		let sensorElement = currentNode.element;
		this.sensorElement = sensorElement;
		this.view = currentNode.view;
		// Install event handlers for the pointer target
		sensorElement.onpointerdown = (ev) => {
			this.pointerdown_handler(ev);
		};
		sensorElement.onpointermove = (ev) => {
			this.pointermove_handler(ev);
		};
		// Use same handler for pointer{up,cancel,out,leave} events since
		// the semantics for these events - in this app - are the same.
		sensorElement.onpointerup = (ev) => {
			this.pointerup_handler(ev);
		};
		sensorElement.onpointercancel = (ev) => {
			this.pointerup_handler(ev);
		};
		sensorElement.onpointerout = (ev) => {
			this.pointerup_handler(ev);
		};
		sensorElement.onpointerleave = (ev) => {
			this.pointerup_handler(ev);
		};
		sensorElement.onmousewheel = (ev) => {
			this.mousewheel_handler(ev);
		};
		sensorElement.mousewheel = (ev) => {
			this.mousewheel_handler(ev);
		};
		sensorElement.dommousewheel = (ev) => {
			this.mousewheel_handler(ev);
		};

		sensorElement.classList.add('selectorScreen');
		//sensorElement.classList.add('noselect');

		// Global vars to cache event state
		this.evCache = new Array();
		this.prevDiff = -1;
		this.keepRatio = true;

		this.lastScreenPosition = undefined;

		this.mouseDown = false;
	}



	/** Defines how zoom and panning works when the mouse button is pressed or touching the screen work
     * @param  {Event} ev
     */
	pointerdown_handler(ev) {
		// The pointerdown event signals the start of a touch interaction.
		// This event is cached to support 2-finger gestures
		this.evCache.push(ev);

		this.mouseDown = true;
		this.lastScreenPosition = undefined;
		this.lastScreenScale = undefined;
	}


	/** Defines how zoom and panning works when moving the mouse or draging the finger the screen work
     * @param  {Event} ev
     */
	pointermove_handler(ev) {
		// This function implements a 2-pointer horizontal pinch/zoom gesture. 
		//
		// If the distance between the two pointers has increased (zoom in), 
		// the taget element's background is changed to "pink" and if the 
		// distance is decreasing (zoom out), the color is changed to "lightblue".
		//
		// This function sets the target element's border to "dashed" to visually
		// indicate the pointer's target received a move event.

		// Find this event in the cache and update its record with this event
		for (var i = 0; i < this.evCache.length; i++) {
			if (ev.pointerId == this.evCache[i].pointerId) {
				this.evCache[i] = ev;
				break;
			}
		}
		let top;
		let left;
		let widthPosition;
		let heightPosition;
		// If two pointers are down, check for pinch gestures
		if (this.evCache.length == 2) {
			// Calculate the distance between the two pointers
			var curDiff = Math.abs(this.evCache[0].clientX - this.evCache[1].clientX);
			// Cache the distance for the next move event 
			this.prevDiff = curDiff;
			top = Math.min(this.evCache[1].pageY, this.evCache[0].pageY);
			let bottom = Math.max(this.evCache[1].pageY, this.evCache[0].pageY);
			left = Math.min(this.evCache[1].pageX, this.evCache[0].pageX);
			let right = Math.max(this.evCache[1].pageX, this.evCache[0].pageX);

			widthPosition = right - left;
			heightPosition = bottom - top;
			this.screenPointerPositionX = (left + widthPosition / 2) - this.elementOffset(this.sensorElement).x;
			this.screenPointerPositionY = (top + heightPosition / 2) - this.elementOffset(this.sensorElement).y;
		} else {
			top = ev.pageY;
			left = ev.pageX;
			this.screenPointerPositionX = left - this.elementOffset(this.sensorElement).x;
			this.screenPointerPositionY = top - this.elementOffset(this.sensorElement).y;
		}

		//console.log(this.screenPointerPositionX+' '+this.screenPointerPositionY);


		if (this.mouseDown && !universe.selectedObject) {
			if (this.lastScreenPosition) {
				this.view.updateOffset({
					x: this.lastScreenPosition.x - this.screenPointerPositionX,
					y: -this.lastScreenPosition.y + this.screenPointerPositionY
				});
			}
			this.lastScreenPosition = {
				x: this.screenPointerPositionX,
				y: this.screenPointerPositionY,
			};

			// If two pointers are down, check for pinch gestures
			if (this.evCache.length == 2) {
				if (this.mouseDown) {
					if (this.lastScreenScale) {
						let xValue = (this.lastScreenScale.width - widthPosition) / this.lastScreenScale.width;
						let yValue = (this.lastScreenScale.height - heightPosition) / this.lastScreenScale.height;
						if (this.keepRatio) {
							if (widthPosition > heightPosition) {
								yValue = xValue;
							} else {
								xValue = yValue;
							}
						}
						this.view.updateScale({
							x: -xValue,
							y: -yValue,
						}, {
							x: this.screenPointerPositionX,
							y: this.screenPointerPositionY
						});
					}
					this.lastScreenScale = {
						width: widthPosition,
						height: heightPosition
					};
				}
			}
		}
		//this.view.HandleView();
	}


	/** Defines how zoom works when moving the mousewheel is used
     * @param  {Event} ev
     */
	mousewheel_handler(ev) {
		let e = window.event || ev; // old IE support
		e.preventDefault();
		let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		this.view.updateScale({
			x: delta * 0.1,
			y: delta * 0.1,
		}, {
			x: this.screenPointerPositionX,
			y: this.screenPointerPositionY
		});
		//this.view.HandleView();
	}

	/** Defines how zoom and panning works when the mouse button is released or stop touching the screen work
     * @param  {Event} ev
     */
	pointerup_handler(ev) {
		// Remove this pointer from the cache and reset the target's
		// background and border
		this.remove_event(ev);

		// If the number of pointers down is less than two then reset diff tracker
		if (this.evCache.length < 2) this.prevDiff = -1;
		if (this.evCache.length == 0) {
			this.mouseDown = false;
		}

		this.screenPointerPositionX = 0;
		this.screenPointerPositionY = 0;

		this.lastScreenPosition = undefined;
		//console.log('up offset: ' + view.offset.x + ', ' + view.offset.y);
	}

	/** Support function handling the list of events
     * @param  {Event} ev
     */
	remove_event(ev) {
		// Remove this event from the target's cache
		for (var i = 0; i < this.evCache.length; i++) {
			if (this.evCache[i].pointerId == ev.pointerId) {
				this.evCache.splice(i, 1);
				break;
			}
		}
	}

	/** Support function to compensate for the position of the element on the whole screen
     * TODO: Cache this value instead to avoid repeated calculations
     * @param  {Element} el
     */
	elementOffset(el) {
		// yay readability
		for (var lx = 0, ly = 0; el != null; lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
		return {
			x: lx,
			y: ly
		};
	}
}