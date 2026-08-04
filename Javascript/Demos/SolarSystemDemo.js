import { Node } from '../Nodes/Node.js';
import { Tensor } from '../Tensors.js';
import { Position, Velocity } from '../Primitives.js';

/**
 * Planetary data: semi-major axis (AU), eccentricity, mass (relative to Sun),
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
	},
	{
		name: 'Venus',
		color: '#FFC649',           // Golden yellow
		semiMajorAxis: 0.723,
		eccentricity: 0.007,
		massRelativeToSun: 2.45e-6,
		diameter: 0.949,
	},
	{
		name: 'Earth',
		color: '#4A90E2',           // Blue
		semiMajorAxis: 1.000,
		eccentricity: 0.017,
		massRelativeToSun: 3.00e-6,
		diameter: 1.000,
	},
	{
		name: 'Mars',
		color: '#E27B58',           // Rust-red
		semiMajorAxis: 1.524,
		eccentricity: 0.093,
		massRelativeToSun: 3.23e-7,
		diameter: 0.532,
	},
	{
		name: 'Jupiter',
		color: '#C88B3A',           // Tan/brown
		semiMajorAxis: 5.203,
		eccentricity: 0.049,
		massRelativeToSun: 9.55e-4,
		diameter: 11.21,
	},
	{
		name: 'Saturn',
		color: '#FAD5A5',           // Pale yellow
		semiMajorAxis: 9.537,
		eccentricity: 0.056,
		massRelativeToSun: 2.86e-4,
		diameter: 9.45,
	},
	{
		name: 'Uranus',
		color: '#4FD0E7',           // Cyan-blue
		semiMajorAxis: 19.191,
		eccentricity: 0.047,
		massRelativeToSun: 4.36e-5,
		diameter: 4.01,
	},
	{
		name: 'Neptune',
		color: '#4166F5',           // Deep blue
		semiMajorAxis: 30.069,
		eccentricity: 0.009,
		massRelativeToSun: 5.15e-5,
		diameter: 3.88,
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

	// Create Sun at center with anchor label (infinite mass, doesn't move)
	// This allows planets to orbit correctly without Sun being accelerated by planets
	const sun = new Node(trussNode.world, trussNode, 'anchor angle color', {
		'name': 'Sun',
		'localPosition': new Position(35, 25),  // positioned to right of other demos
		'degree': 0,
		'angleVelocityLoss': 1,
		'color': 'yellow',
		'visible': 1,
	});

	const planets = [];
	const fieldTensors = [];

	// Create each planet
	PLANETS_DATA.forEach((planetData) => {
		// Scale planet diameter
		const planetDiameter = planetData.diameter * scaling.diameterScale;
		const planetRadius = planetDiameter / 2;

		// Calculate orbital distance from semi-major axis
		const orbitalDistance = planetData.semiMajorAxis * scaling.distanceScale;

		// Calculate orbital period using Kepler's 3rd law (scaled to sim time)
		// T_sim = T_real × (earthOrbitPeriod / 365.25 days in seconds)
		const earthDaysInSeconds = 365.25 * 24 * 3600;
		const scaleFactor = earthOrbitPeriod / earthDaysInSeconds;
		const orbitalPeriod = planetData.semiMajorAxis * Math.sqrt(planetData.semiMajorAxis) * earthOrbitPeriod;
		// More accurate Kepler: T² ∝ a³, so T_sim = √(a_sim³) / √(a_earth³) × T_earth_sim
		const orbitalPeriodCorrected = Math.sqrt(
			Math.pow(planetData.semiMajorAxis, 3) /
			Math.pow(1.0, 3)
		) * earthOrbitPeriod;

		// Calculate orbital velocity magnitude
		// v = 2πr/T (circular motion)
		const orbitalVelocity = (2 * Math.PI * orbitalDistance) / orbitalPeriodCorrected;

		// Initial position: place planet on positive x-axis from Sun
		// Offset by eccentricity (place at aphelion for simplicity)
		const positionOffset = orbitalDistance;
		const planetX = sun.localPosition.x + positionOffset;
		const planetY = sun.localPosition.y;

		// Initial velocity: perpendicular to position vector (tangential)
		// For planet on +x axis: velocity is in +y direction
		const velocityX = 0;
		const velocityY = orbitalVelocity;

		// Planet mass scaled to simulation
		const planetMass = planetData.massRelativeToSun * scaling.massScale;

		if (planetData.name === 'Earth') {
			console.log(`🌎 ${planetData.name} setup:`);
			console.log(`  Orbital distance: ${orbitalDistance.toExponential(2)} m`);
			console.log(`  Orbital period: ${orbitalPeriodCorrected.toExponential(2)} s`);
			console.log(`  Orbital velocity: ${orbitalVelocity.toExponential(2)} m/s`);
			console.log(`  Planet mass: ${planetMass.toExponential(2)}`);
			console.log(`  Expected centripetal force: ${(planetMass * orbitalVelocity * orbitalVelocity / orbitalDistance).toExponential(2)} N`);
			const expectedForce = scaling.gravityConstant * scaling.sunMass * planetMass / (orbitalDistance * orbitalDistance);
			console.log(`  Actual gravity force: ${expectedForce.toExponential(2)} N`);
		}

		// Create planet node
		const planet = new Node(trussNode.world, trussNode, 'node moveable velocityloss color', {
			'name': planetData.name,
			'localPosition': new Position(planetX, planetY),
			'velocity': new Velocity(velocityX, velocityY),
			'mass': planetMass,
			'velocityLoss': 0.9999,  // minimal damping to preserve orbits
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
