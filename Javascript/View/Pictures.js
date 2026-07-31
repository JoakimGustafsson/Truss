import { timelog } from '../Primitives.js';

/**
 * Position the HTML banner element by transforming it to match four corner nodes.
 * @param  {TrussNode} truss
 * @param  {Object} obj - The BannerNode with element property
 * @param  {Node} nodeA - Upper left corner node
 * @param  {Node} nodeB - Upper right corner node
 * @param  {Node} nodeC - Lower left corner node (top in display coords)
 * @param  {Node} nodeD - Lower right corner node (top in display coords)
 * @param  {number} width The elements original width
 * @param  {number} height The elements original height
 * 
 * CRITICAL: Uses each node's coordinate system to convert to screen pixels.
 * - Display nodes: positions converted directly (no zoom/pan applied)
 * - World nodes: positions converted with zoom/pan applied
 */
function warpMatrix(truss, obj, nodeA, nodeB, nodeC, nodeD, width, height) {
	// restoreMatrix(element);
	// return;
	let element = obj.element;
	timelog('inside warpMatrix', 1);
	
	// Convert each node's position to screen pixels using its coordinate system
	// This ensures display nodes stay fixed on screen, world nodes move with zoom/pan
	const getScreenPos = (node) => {
		if (node.coordinateSystem) {
			return node.coordinateSystem.convertToScreenPixels(node);
		} else {
			// Fallback for nodes without coordinate system (shouldn't happen)
			return truss.view.screenPosition(node.getPosition());
		}
	};
	
	let a = getScreenPos(nodeA);
	let b = getScreenPos(nodeB);
	let c = getScreenPos(nodeC);
	let d = getScreenPos(nodeD);

	// Always use the live DOM size of the warped element.
	// The property panel content can change its effective size after creation.
	width = element.offsetWidth;
	height = element.offsetHeight;

	timelog('warpMatrix AB');
	let m = [];
	// Handle when some angle > 180
	let bcv= (((b.y-d.y)*(a.x-d.x)) - ((b.x-d.x)*(a.y-d.y))) / (((c.x-b.x)*(a.y-d.y)) - ((c.y-b.y)*(a.x-d.x)));
	let dav= (bcv*(c.x-b.x)+(b.x-d.x))/(a.x-d.x);

	if (((bcv<0) ||(bcv>1)) && ((dav<0) ||(dav>1))) {
		obj.setVisible(false);
	} else {
		obj.setVisible(true);
	}

	timelog('warpMatrix AC');
	if (bcv<0) {
		bcv-=0.01;
		b.x= b.x+bcv*(c.x- b.x);
		b.y= b.y+bcv*(c.y- b.y);
	} else if (bcv>1) {
		bcv+=0.01;
		c.x= b.x+bcv*(c.x- b.x);
		c.y= b.y+bcv*(c.y- b.y);
	} if (dav<0) {
		dav-=0.01;
		d.x=d.x+dav*(a.x- d.x);
		d.y=d.y+dav*(a.y- d.y);
	} else if (dav>1) {
		dav+=0.01;
		a.x=d.x+dav*(a.x- d.x);
		a.y=d.y+dav*(a.y- d.y);
	}
	// End of 180 handling

	timelog('warpMatrix A');
	m[41] = a.x;
	m[42] = a.y;

	let xdiff = a.x + d.x - c.x - b.x;
	let ydiff = a.y + d.y - c.y - b.y;

	let p = width * (b.x - d.x);
	let q = height * (d.x - c.x);
	let r = height * (d.y - c.y);
	let s = width * (b.y - d.y);

	m[24] = (s * xdiff - p * ydiff) / (p * r - s * q);
	if (p) {
		m[14] = (m[24] * q + xdiff) / p;
	} else {
		m[14] = 0;
	}

	m[11] = m[14] * b.x + (b.x - a.x) / width;
	m[12] = m[14] * b.y + (b.y - a.y) / width;

	m[21] = m[24] * c.x + (c.x - a.x) / height;
	m[22] = m[24] * c.y + (c.y - a.y) / height;

	timelog('warpMatrix B');
	let text = 'matrix3d(' +
        m[11] + ',' + m[12] + ',0,' + m[14] + ', ' +
        m[21] + ',' + m[22] + ',0,' + m[24] + ', ' +
        '0,0,1,0, ' +
        m[41] + ',' + m[42] + ',0,1)';

	timelog('warpMatrix C');
	element.style['transform-origin'] = 'left top 0px';
	element.style.transform = text;
	timelog('warpMatrix D');

	// element.style['-webkit-transform-origin'] = 'left top 0px';
	// element.style.webkitTransform = text;
}

/**
 * @param  {HTMLElement} element
 */
function restoreMatrix(element) {
	let text = 'matrix3d(' +
	'1,0,0,0, ' +
	'0,1,0,0, ' +
	'0,0,1,0, ' +
	'0,0,0,1)';
	element.style['transform-origin'] = 'left top 0px';
	element.style.transform = text;
	element.style['-webkit-transform-origin'] = 'left top 0px';
	element.style.webkitTransform = text;
}

export { warpMatrix };
