
/**
 * @param  {Truss} truss
 * @param  {Element} element
 * @param  {Position} ar
 * @param  {Position} br
 * @param  {Position} cr
 * @param  {Position} dr
 */
function warpMatrix(truss, element, ar, br, cr, dr) {
	let a = truss.view.screenPosition(ar);
	let b = truss.view.screenPosition(br);
	let c = truss.view.screenPosition(cr);
	let d = truss.view.screenPosition(dr);

	let h = element.offsetHeight;
	let w = element.offsetWidth;

	let m = [];

	let bcv= (((b.y-d.y)*(a.x-d.x)) - ((b.x-d.x)*(a.y-d.y))) / (((c.x-b.x)*(a.y-d.y)) - ((c.y-b.y)*(a.x-d.x)));
	let dav= (bcv*(c.x-b.x)+(b.x-d.x))/(a.x-d.x);

	if (bcv<0) {
		b.x= b.x+bcv*(c.x- b.x);
		b.y= b.y+bcv*(c.y- b.y);
	} else if (bcv>1) {
		c.x= b.x+bcv*(c.x- b.x);
		c.y= b.y+bcv*(c.y- b.y);
	} else if (dav<0) {
		d.x=d.x+dav*(a.x- d.x);
		d.y=d.y+dav*(a.y- d.y);
	} else if (dav>1) {
		a.x=d.x+dav*(a.x- d.x);
		a.y=d.y+dav*(a.y- d.y);
	}

	m[41] = a.x;
	m[42] = a.y;

	let xdiff = a.x + d.x - c.x - b.x;
	let ydiff = a.y + d.y - c.y - b.y;

	let p = w * (b.x - d.x);
	let q = h * (d.x - c.x);
	let r = h * (d.y - c.y);
	let s = w * (b.y - d.y);



	m[24] = (s * xdiff - p * ydiff) / (p * r - s * q);
	if (p) {
		m[14] = (m[24] * q + xdiff) / p;
	} else {
		m[14] = 0;
	}

	m[11] = m[14] * b.x + (b.x - a.x) / w;
	m[12] = m[14] * b.y + (b.y - a.y) / w;

	m[21] = m[24] * c.x + (c.x - a.x) / h;
	m[22] = m[24] * c.y + (c.y - a.y) / h;

	let text = 'matrix3d(' +
        m[11] + ',' + m[12] + ',0,' + m[14] + ', ' +
        m[21] + ',' + m[22] + ',0,' + m[24] + ', ' +
        '0,0,1,0, ' +
        m[41] + ',' + m[42] + ',0,1)';


	element.style['transform-origin'] = 'left top 0px';
	element.style.transform = text;

	element.style['-webkit-transform-origin'] = 'left top 0px';
	element.style.webkitTransform = text;
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
