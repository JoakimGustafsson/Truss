import { Node } from '../Nodes/Node.js';
import { Tensor } from '../Tensors.js';
import { Position, Velocity } from '../Primitives.js';

/**
 * Planetary data: semi-major axis (AU), eccentricity, mass (relative to Sun),
 * current orbital position (true anomaly in degrees, Aug 4 2026),
 * and realistic colors.
 */
const PLANETS_DATA = [
	{
		name: 'Mercury',
		color: '#8C7853',           // Gray-brown
		semiMajorAxis: 0.387,
		eccentricity: 0.206,
		massRelativeToSun: 1.66e-7,
		diameter: 0.383,            // relative to Earth
		trueAnomaly: 120,           // degrees from perihelion
	},
	{
		name: 'Venus',
		color: '#FFC649',           // Golden yellow
		semiMajorAxis: 0.723,
		eccentricity: 0.007,
		massRelativeToSun: 2.45e-6,
		diameter: 0.949,
		trueAnomaly: 280,
	},
	{
		name: 'Earth',
		color: '#4A90E2',           // Blue
		semiMajorAxis: 1.000,
		eccentricity: 0.017,
		massRelativeToSun: 3.00e-6,
		diameter: 1.000,
		trueAnomaly: 200,
	},
	{
		name: 'Mars',
		color: '#E27B58',           // Rust-red
		semiMajorAxis: 1.524,
		eccentricity: 0.093,
		massRelativeToSun: 3.23e-7,
		diameter: 0.532,
		trueAnomaly: 45,
	},
	{
		name: 'Jupiter',
		color: '#C88B3A',           // Tan/brown
		semiMajorAxis: 5.203,
		eccentricity: 0.049,
		massRelativeToSun: 9.55e-4,
		diameter: 11.21,
		trueAnomaly: 150,
	},
	{
		name: 'Saturn',
		color: '#FAD5A5',           // Pale yellow
		semiMajorAxis: 9.537,
		eccentricity: 0.056,
		massRelativeToSun: 2.86e-4,
		diameter: 9.45,
		trueAnomaly: 310,
	},
	{
		name: 'Uranus',
		color: '#4FD0E7',           // Cyan-blue
		semiMajorAxis: 19.191,
		eccentricity: 0.047,
		massRelativeToSun: 4.36e-5,
		diameter: 4.01,
		trueAnomaly: 90,
	},
	{
		name: 'Neptune',
		color: '#4166F5',           // Deep blue
		semiMajorAxis: 30.069,
		eccentricity: 0.009,
		massRelativeToSun: 5.15e-5,
		diameter: 3.88,
		trueAnomaly: 270,
	},
];

/**
 * Calculate scaled parameters for solar system simulation.
 *
 * Constraints:
 *   - Neptune (outermost) has 30m diameter
 *   - Earth orbits in earthOrbitPeriod seconds
 *   - All masses scaled proportionally to reality
 *
 * @param {number} earthOrbitPeriod - Desired Earth orbital period in seconds
 * @return {Object} Configuration object with scaling factors
 */
function calculateSolarSystemScaling(earthOrbitPeriod) {
	// Neptune is the outermost planet with 30m diameter max
	const neptuneData = PLANETS_DATA[7];
	const earthData = PLANETS_DATA[2];

	// Planet diameter scaling: Neptune max 30m
	const neptunePlanetDiameter = 30;  // meters
	const diameterScale = neptunePlanetDiameter / neptuneData.diameter;

	// Distance scaling: Calculate based on Earth's orbit period
	// For circular orbit: T = 2π√(r³/(GM))
	// Rearranged: GM = 4π²r³/T²
	// We want Earth's orbital radius and period to match earthOrbitPeriod
	const earthDistanceAU = earthData.semiMajorAxis;
	const earthDistanceMeters = earthDistanceAU * 15;  // 1 AU ≈ 15 meters in sim
	const earthPeriod = earthOrbitPeriod;

	// Calculate GM needed for Earth's orbit
	// GM = 4π²r³/T²
	const GM = (4 * Math.PI * Math.PI * earthDistanceMeters * earthDistanceMeters * earthDistanceMeters) /
		(earthPeriod * earthPeriod);

	// Sun mass in simulation (arbitrary units, using base mass 1e24)
	const sunMass = 1e24;

	// Gravity constant in simulation
	const gravityConstant = GM / sunMass;

	// Mass scaling: scale all planet masses to reasonable simulation units
	// Base: Earth-like mass
	const earthMassInSim = 1e20;  // kg-equivalent units
	const sunMassInSim = sunMass;

	console.log('🌍 Solar System Scaling:');
	console.log(`  Earth distance: ${earthDistanceMeters.toExponential(2)} m`);
	console.log(`  Earth period: ${earthPeriod.toExponential(2)} s`);
	console.log(`  GM product: ${GM.toExponential(2)}`);
	console.log(`  Sun mass: ${sunMassInSim.toExponential(2)}`);
	console.log(`  Gravity constant: ${gravityConstant.toExponential(2)}`);
	console.log(`  Planet mass scale factor: ${(earthMassInSim / earthData.massRelativeToSun).toExponential(2)}`);

	return {
		diameterScale,           // multiply planet diameters by this
		distanceScale: 15,       // 1 AU = 15 meters
		massScale: earthMassInSim / earthData.massRelativeToSun,  // scale factor for planet masses
		gravityConstant,         // gravity field constant
		sunMass: sunMassInSim,   // sun mass in simulation
		earthOrbitPeriod,
	};
}

/**
 * Create solar system demo with Sun and 8 orbiting planets.
 *
 * Orbits emerge naturally from physics:
 *   - Gravity field pulls planets toward Sun
 *   - Initial velocity is tangential, magnitude = √(GM/r)
 *   - Orbital shape (circle/ellipse) follows from gravitational dynamics
 *
 * @param {TrussNode} trussNode - The TrussNode to add structures to
 * @param {number} earthOrbitPeriod - Earth's desired orbital period in seconds (default 60)
 * @return {Object} { sun, planets: [...], fieldTensors: [...] }
 */
function createSolarSystemDemo(trussNode, earthOrbitPeriod = 60) {
	const scaling = calculateSolarSystemScaling(earthOrbitPeriod);

	// Create Sun at center with mass that responds to gravitational forces from planets
	// The Sun moves as a consequence of the planets' gravitational pull (two-body physics)
	// Positioned far right to allow full orbital range (Neptune orbits ~450m from Sun)
	const sun = new Node(trussNode.world, trussNode, 'moveable angle color', {
		'name': 'Sun',
		'localPosition': new Position(500, 25),
		'velocity': new Velocity(0, 0),  // starts at rest
		'mass': scaling.sunMass,
		'degree': 0,
		'angleVelocityLoss': 1,
		'color': 'yellow',
		'visible': 1,
		'velocityLoss': 1,  // no damping for pure orbital mechanics
	});

	const planets = [];
	const fieldTensors = [];

	// Create each planet
	PLANETS_DATA.forEach((planetData) => {
		// Get Sun position (with fallback in case it's not yet initialized)
		const sunPos = sun.localPosition || new Position(500, 25);
		
		// Scale planet diameter
		const planetDiameter = planetData.diameter * scaling.diameterScale;
		const planetRadius = planetDiameter / 2;

		// Calculate orbital period using Kepler's 3rd law (scaled to sim time)
		const orbitalPeriodCorrected = Math.sqrt(
			Math.pow(planetData.semiMajorAxis, 3) /
			Math.pow(1.0, 3)
		) * earthOrbitPeriod;

		// Calculate orbital distance at current true anomaly
		// For elliptical orbit: r = a(1-e²) / (1 + e*cos(ν))
		// where a=semi-major axis, e=eccentricity, ν=true anomaly
		const a = planetData.semiMajorAxis * scaling.distanceScale;
		const e = planetData.eccentricity;
		const nu = (planetData.trueAnomaly || 0) * Math.PI / 180;  // convert to radians
		const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));

		// Validate r is not NaN or invalid
		if (isNaN(r) || r <= 0) {
			console.error(`❌ ${planetData.name}: orbital distance r is invalid (${r}). Check eccentricity and true anomaly.`);
			return; // skip this planet
		}

		// Position on ellipse relative to Sun
		// Perihelion is at 0°, so we rotate from there
		const planetX = sunPos.x + r * Math.cos(nu);
		const planetY = sunPos.y + r * Math.sin(nu);

		// Orbital velocity at this position
		// For elliptical orbit: v = sqrt(GM(2/r - 1/a))
		const GM = scaling.gravityConstant * scaling.sunMass;
		
		if (isNaN(GM) || GM === undefined || GM <= 0) {
			console.error(`❌ ${planetData.name}: GM is invalid! gravityConstant=${scaling.gravityConstant}, sunMass=${scaling.sunMass}`);
			return; // skip this planet
		}
		
		const vrMagnitude = 2/r - 1/a;
		if (vrMagnitude < 0) {
			console.warn(`⚠️ ${planetData.name}: (2/r - 1/a) = ${vrMagnitude.toExponential(2)} is negative (planet beyond aphelion escape?). Using circular approximation.`);
		}
		const velocityMagnitude = Math.sqrt(Math.abs(vrMagnitude) * GM);

		// Validate velocity is not NaN
		if (isNaN(velocityMagnitude)) {
			console.error(`❌ ${planetData.name}: velocity magnitude is NaN`);
			return; // skip this planet
		}

		// Velocity direction is perpendicular to position vector (tangent to orbit)
		// For stable orbits, velocity should be opposite to the direction we calculated
		const velocityAngle = nu - Math.PI / 2;
		const velocityX = velocityMagnitude * Math.cos(velocityAngle);
		const velocityY = velocityMagnitude * Math.sin(velocityAngle);

		// Planet mass scaled to simulation
		const planetMass = planetData.massRelativeToSun * scaling.massScale;

		if (isNaN(planetX) || isNaN(planetY) || isNaN(velocityX) || isNaN(velocityY) || isNaN(planetMass)) {
			console.error(`❌ ${planetData.name}: invalid position or velocity. pos=(${planetX}, ${planetY}), vel=(${velocityX}, ${velocityY}), mass=${planetMass}`);
			return; // skip this planet
		}

		if (planetData.name === 'Earth') {
			console.log(`🌎 ${planetData.name}: r=${r.toFixed(1)}m, v=${velocityMagnitude.toFixed(2)}m/s, F_gravity=${(scaling.gravityConstant * scaling.sunMass * planetMass / (r*r)).toExponential(2)}N`);
		}

		// Create planet node
		const planet = new Node(trussNode.world, trussNode, 'node moveable velocityloss color', {
			'name': planetData.name,
			'localPosition': new Position(planetX, planetY),
			'velocity': new Velocity(velocityX, velocityY),
			'mass': planetMass,
			'velocityLoss': 1,  // no damping for pure orbital mechanics
			'color': planetData.color,
			'visible': 1,
		});

		// Store planet reference
		planets.push({
			node: planet,
			name: planetData.name,
			semiMajorAxis: planetData.semiMajorAxis,
			eccentricity: planetData.eccentricity,
			mass: planetMass,
		});

		// Create gravitational field tensor from Sun to planet
		// The field constant sign: positive = attractive, negative = repulsive
		// (The field calculator applies one negation internally)
		const fieldTensor = new Tensor(sun, planet, 'field', {
			'name': `gravity-${planetData.name.toLowerCase()}`,
			'constant': scaling.gravityConstant,
			'visible': 0,  // gravity fields typically invisible
		});

		fieldTensors.push(fieldTensor);
	});

	return {
		sun,
		planets,
		fieldTensors,
		scaling,
	};
}

export { createSolarSystemDemo, PLANETS_DATA, calculateSolarSystemScaling };
