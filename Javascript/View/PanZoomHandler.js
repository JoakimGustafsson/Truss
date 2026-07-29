/*jshint esversion:6*/
import { universe } from '../globals.js';

/**
 * Handles pan and pinch-zoom input from mouse, touchpad, and touchscreen.
 * 
 * Single pointer → pan.
 * Two pointers   → pan (midpoint) + pinch zoom (finger distance ratio).
 * Wheel          → zoom around cursor (mouse wheel and touchpad pinch).
 * 
 * setPointerCapture is used so touchscreen events keep arriving even
 * when a finger slides outside the element boundary.
 */
class PanZoomHandler {
	/** @param {Node} currentNode */
	constructor(currentNode) {
		this.sensorElement = currentNode.canvas;
		this.view = currentNode.view;

		// Active pointers: Map<pointerId, {x, y}> in element-local coords
		this.activePointers = new Map();

		// Previous gesture state for delta calculations
		this.lastMidpoint = null;
		this.lastDistance = null;
		
		// Batch pointer moves into a single frame update
		this.pendingUpdate = false;
		this.lastFrameStartMid = null;
		this.lastFrameStartDist = null;
		
		// Finger visualization: store world positions of both fingers for debug drawing
		this.fingerWorldPositions = [];

		this._bindEvents();
	}

	_bindEvents() {
		const el = this.sensorElement;
		
		// Prevent browser from handling touch zoom; we'll handle it ourselves
		el.style.touchAction = 'none';
		
		// Use passive: false so preventDefault() actually works
		el.addEventListener('pointerdown', (ev) => this._onPointerDown(ev), { passive: false });
		el.addEventListener('pointermove', (ev) => this._onPointerMove(ev), { passive: false });
		el.addEventListener('pointerup', (ev) => this._onPointerUp(ev), { passive: false });
		el.addEventListener('pointercancel', (ev) => this._onPointerUp(ev), { passive: false });
		el.addEventListener('pointerleave', (ev) => this._onPointerUp(ev), { passive: false });
		
		// Backup: block touchmove to prevent default browser behavior
		el.addEventListener('touchmove', (ev) => {
			if (this.activePointers.size >= 2) {
				ev.preventDefault();
			}
		}, { passive: false });
		
		// Wheel events (mouse wheel and touchpad pinch)
		el.addEventListener('wheel', (ev) => this._onWheel(ev), { passive: false });
		el.classList.add('selectorScreen');
	}

	/** Convert a clientX/Y coord to element-local pixel coords. */
	_clientToLocal(clientX, clientY) {
		const rect = this.sensorElement.getBoundingClientRect();
		return { x: clientX - rect.left, y: clientY - rect.top };
	}

	/** Midpoint of all active pointers (in local coords). */
	_midpoint() {
		const pts = [...this.activePointers.values()];
		return {
			x: (pts[0].x + pts[1].x) / 2,
			y: (pts[0].y + pts[1].y) / 2,
		};
	}

	/** Euclidean distance between the two active pointers. */
	_distance() {
		const pts = [...this.activePointers.values()];
		const dx = pts[1].x - pts[0].x;
		const dy = pts[1].y - pts[0].y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	_onPointerDown(ev) {
		// Capture the pointer so move/up events keep arriving even if the
		// finger slides outside the element (essential for touchscreen).
		this.sensorElement.setPointerCapture(ev.pointerId);

		this.activePointers.set(ev.pointerId, this._clientToLocal(ev.clientX, ev.clientY));

		// If we already have a pointer down, this is multi-touch: block browser zoom/pan
		if (this.activePointers.size >= 2) {
			ev.preventDefault();
		}

		// Reset gesture deltas whenever pointer count changes to avoid jumps.
		this.lastMidpoint = null;
		this.lastDistance = null;
	}

	_onPointerMove(ev) {
		if (!this.activePointers.has(ev.pointerId)) return;

		const localPos = this._clientToLocal(ev.clientX, ev.clientY);
		this.activePointers.set(ev.pointerId, localPos);

		const count = this.activePointers.size;

		if (count === 1) {
			// Single pointer: let selection system handle dragging nodes
			// Don't pan or preventDefault

		} else if (count === 2) {
			// Two pointers: pan + pinch zoom
			// Block browser default to prevent webpage zoom/pan
			ev.preventDefault();
			
			// Schedule processing for this animation frame if not already scheduled
			if (!this.pendingUpdate) {
				this.pendingUpdate = true;
				// Capture the midpoint at the START of this frame's move events
				this.lastFrameStartMid = this._midpoint();
				this.lastFrameStartDist = this._distance();
				requestAnimationFrame(() => this._processTwoPointerGesture());
			}
		}
	}
	
	_processTwoPointerGesture() {
		this.pendingUpdate = false;
		
		// Only process if we still have 2 active pointers
		if (this.activePointers.size !== 2) {
			this.lastFrameStartMid = null;
			this.lastFrameStartDist = null;
			this.fingerWorldPositions = [];
			return;
		}
		
		if (this.lastFrameStartMid === null || this.lastFrameStartDist === null) return;
		
		// Calculate final positions now that all move events for this frame are done
		const mid = this._midpoint();
		const dist = this._distance();
		
		// Track finger world positions for visualization
		const pointers = Array.from(this.activePointers.values());
		if (pointers.length === 2) {
			this.fingerWorldPositions = pointers.map(p => 
				this.view.worldPosition(p.x, p.y)
			);
		}
		
		// Keep fingers stationary in world space by tracking their world positions
		// Convert screen positions to world coordinates BEFORE panning
		const startWorldMid = this.view.worldPosition(this.lastFrameStartMid.x, this.lastFrameStartMid.y);
		const endWorldMid = this.view.worldPosition(mid.x, mid.y);
		
		// The world offset delta needed to make fingers stay in the same world position
		const worldOffsetDelta = {
			x: startWorldMid.x - endWorldMid.x,
			y: startWorldMid.y - endWorldMid.y,
		};

		// Apply the world offset delta directly (not through updateOffset which also scales)
		if (!universe.selectedObject) {
			this.view.offset.x += worldOffsetDelta.x;
			this.view.offset.y += worldOffsetDelta.y;
		}

		// Zoom: always compare against previous processed frame
		if (this.lastDistance > 0 && dist > 0) {
			const scaleDelta = (dist - this.lastDistance) / this.lastDistance;
			this.view.updateScale({ x: scaleDelta, y: scaleDelta }, mid);
		}

		this.lastMidpoint = mid;
		this.lastDistance = dist;
		this.lastFrameStartMid = null;
		this.lastFrameStartDist = null;
	}

	_onPointerUp(ev) {
		this.activePointers.delete(ev.pointerId);
		try {
			this.sensorElement.releasePointerCapture(ev.pointerId);
		} catch (_) { /* pointer may already be released */ }

		// Reset gesture state when pointer count changes
		this.lastMidpoint = null;
		this.lastDistance = null;
		this.lastFrameStartMid = null;
		this.lastFrameStartDist = null;
		this.pendingUpdate = false;
	}

	/** Handles mouse wheel and touchpad pinch (both fire 'wheel' events). */
	_onWheel(ev) {
		ev.preventDefault();

		const local = this._clientToLocal(ev.clientX, ev.clientY);

		// Normalize deltaY across the three possible deltaMode values
		let delta;
		if (ev.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
			delta = -ev.deltaY / 300;
		} else if (ev.deltaMode === WheelEvent.DOM_DELTA_LINE) {
			delta = -ev.deltaY / 3;
		} else {
			// DOM_DELTA_PAGE
			delta = -ev.deltaY;
		}
		// Clamp to prevent jarring jumps from fast scrolling
		delta = Math.max(-0.3, Math.min(0.3, delta));

		this.view.updateScale({ x: delta, y: delta }, local);
	}
}

export { PanZoomHandler };
