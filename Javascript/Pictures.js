
/**
 * @param  {Truss} truss
 * @param  {Object} obj
 * @param  {Position} ar Upper left
 * @param  {Position} br Upper right
 * @param  {Position} cr Lower left
 * @param  {Position} dr Lower right
 * @param  {Position} width The elements original width
 * @param  {Position} height The elements original height
 */
function warpMatrix(truss, obj, ar, br, cr, dr, width, height) {
	// restoreMatrix(element);
	// return;
	let element = obj.element;
	timelog('inside warpMatrix', 1);
	let a = truss.view.screenPosition(ar);
	let b = truss.view.screenPosition(br);
	let c = truss.view.screenPosition(cr);
	let d = truss.view.screenPosition(dr);

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
