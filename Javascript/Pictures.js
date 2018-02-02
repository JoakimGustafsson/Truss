
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

	let h = element.height;
	let w = element.width;

	let m = [];

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

	text = 'matrix3d(' +
        m[11] + ',' + m[12] + ',0,' + m[14] + ', ' +
        m[21] + ',' + m[22] + ',0,' + m[24] + ', ' +
        '0,0,1,0, ' +
        m[41] + ',' + m[42] + ',0,1)';


	element.style['transform-origin'] = 'left top 0px';
	element.style.transform = text;

	element.style['-webkit-transform-origin'] = 'left top 0px';
	element.style.webkitTransform = text;
}
