/**
 * Banner Position Zoom Independence Test Suite
 * 
 * Verifies that banner physics and positioning work correctly
 * across extreme zoom levels (10^-14 to 10^14).
 * 
 * After 3 second stabilization at each zoom level, banner nodes
 * should be positioned within specified screen bounds.
 * 
 * Success Criteria (±10% tolerance added to each range):
 * - Upper right node: X near right edge, Y between -10% to 30% (0-20% ±10%)
 * - Upper left node: X at (right edge - 30% width), Y same as upper right
 * - Bottom left node: X same as upper left, Y between -10% to 50% (0-40% ±10%)
 * - Bottom right node: X same as upper right, Y between -10% to 50% (0-40% ±10%)
 */

import { Node } from '../Nodes/Node.js';
import { Tensor } from '../Tensors.js';
import { Position, Vector } from '../Primitives.js';

class BannerPositionTest {
	constructor() {
		this.zoomLevels = this._generateZoomLevels();
		this.testResults = [];
		this.stabilizationTime = 3000; // milliseconds
		this.frameTimeMs = 16; // ~60fps
	}

	/**
	 * Generate zoom levels from 10^-14 to 10^14
	 * @return {Array<number>} Zoom scale factors
	 */
	_generateZoomLevels() {
		const levels = [];
		for (let exp = -14; exp <= 14; exp += 1) {
			levels.push(Math.pow(10, exp));
		}
		return levels;
	}

	/**
	 * Find the closest gravity well node in the world, or create one if none exist
	 * 
	 * @param {Object} world - World object containing nodes
	 * @param {Vector} referencePosition - Position to measure distance from (in world coordinates)
	 * @return {Node} Gravity well node
	 */
	_findOrCreateGravityWell(world, referencePosition) {
		// Find all gravity well nodes (nodes with 'gravitywell' label)
		const gravityWells = world.nodes.filter(node => {
			return node.connectedTensors && node.connectedTensors.some(tensor => 
				tensor.labels && tensor.labels.includes('gravitywell')
			);
		});

		// If gravity wells exist, return the closest one
		if (gravityWells.length > 0) {
			let closestWell = gravityWells[0];
			let minDistance = Number.MAX_VALUE;

			gravityWells.forEach(well => {
				const wellPos = well.getPosition ? well.getPosition() : well.localPosition;
				const dx = wellPos.x - referencePosition.x;
				const dy = wellPos.y - referencePosition.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < minDistance) {
					minDistance = distance;
					closestWell = well;
				}
			});

			return closestWell;
		}

		// No gravity well exists, create one far DOWN (negative Y in world coordinates)
		// World coordinates: origin at lower-left, positive Y is UP, negative Y is DOWN
		// To pull banner downward toward "earth", place gravity well at large negative Y
		const gravityWellNode = new Node(
			world,
			null,
			'gravitywell',
			{
				localPosition: new Position(
					referencePosition.x,
					referencePosition.y - 50000  // NEGATIVE Y = down in world coordinates
				),
				mass: Number.POSITIVE_INFINITY,  // Immovable
				name: 'gravityWell',
			}
		);

		world.nodes.push(gravityWellNode);
		return gravityWellNode;
	}

	/**
	 * Create a test world with banner nodes and tensors
	 * @param {View} view - View to test
	 * @param {number} zoomFactor - Zoom level to test
	 * @return {Object} { world, bannerNodes, bannerTensors }
	 */
	createTestBanner(view, zoomFactor) {
		// Mock world object
		const mockWorld = {
			nodes: [],
			tensors: [],
			labels: {
				findLabel: (name) => ({
					getReferences: () => [],
				}),
			},
		};

		// Set zoom level in view
		const baseViewSize = 100;
		const scaledViewSize = baseViewSize / zoomFactor;
		view.setWorldViewSize({ x: scaledViewSize, y: scaledViewSize });

		// Banner screen dimensions (as percentage of canvas)
		const canvas = view.element || { offsetWidth: 800, offsetHeight: 600 };
		const screenWidth = canvas.offsetWidth;
		const screenHeight = canvas.offsetHeight;

		// Convert screen positions to world positions
		const topScreenPos = { x: screenWidth * 0.7, y: screenHeight * 0.05 };
		const screenBannerWidth = screenWidth * 0.6;
		const screenBannerHeight = screenHeight * 0.8;

		// Create banner nodes in world space
		const nail = new Node(
			mockWorld,
			null,
			'banner nail',
			{
				localPosition: view.worldPosition(
					topScreenPos.x + screenBannerWidth / 2,
					topScreenPos.y
				),
				mass: NaN,
				name: 'nail',
			}
		);

		const leftTopNode = new Node(
			mockWorld,
			null,
			'banner moveable',
			{
				localPosition: view.worldPosition(
					topScreenPos.x,
					topScreenPos.y
				),
				mass: 1,
				velocityLoss: 0.9,
				name: 'leftTopNode',
			}
		);

		const rightTopNode = new Node(
			mockWorld,
			null,
			'banner moveable',
			{
				localPosition: view.worldPosition(
					topScreenPos.x + screenBannerWidth,
					topScreenPos.y
				),
				mass: 1,
				velocityLoss: 0.9,
				name: 'rightTopNode',
			}
		);

		const leftBottomNode = new Node(
			mockWorld,
			null,
			'banner moveable',
			{
				localPosition: view.worldPosition(
					topScreenPos.x,
					topScreenPos.y + screenBannerHeight
				),
				mass: 3,
				velocityLoss: 0.9,
				name: 'leftBottomNode',
			}
		);

		const rightBottomNode = new Node(
			mockWorld,
			null,
			'banner moveable',
			{
				localPosition: view.worldPosition(
					topScreenPos.x + screenBannerWidth,
					topScreenPos.y + screenBannerHeight
				),
				mass: 3,
				velocityLoss: 0.9,
				name: 'rightBottomNode',
			}
		);

		// Create connecting tensors
		const topBand = new Tensor(leftTopNode, rightTopNode, 'spring banner', {
			equilibriumLength: screenBannerWidth / 100,
			dampeningConstant: 10,
			constant: 3000,
		});

		const leftBand = new Tensor(leftTopNode, nail, 'absorber pullspring banner', {
			equilibriumLength: 6,
			dampeningConstant: 10,
			constant: 5000,
		});

		const rightBand = new Tensor(rightTopNode, nail, 'absorber pullspring banner', {
			equilibriumLength: 6,
			dampeningConstant: 10,
			constant: 5000,
		});

		const leftSpring = new Tensor(leftTopNode, leftBottomNode, 'spring banner', {
			equilibriumLength: screenBannerHeight / 100,
			dampeningConstant: 10,
			constant: 600,
		});

		const rightSpring = new Tensor(rightTopNode, rightBottomNode, 'spring banner', {
			equilibriumLength: screenBannerHeight / 100,
			dampeningConstant: 10,
			constant: 600,
		});

		// Find or create gravity well
		const centerPos = new Position(
			topScreenPos.x + screenBannerWidth / 2,
			topScreenPos.y + screenBannerHeight / 2
		);
		const gravityWell = this._findOrCreateGravityWell(mockWorld, centerPos);

		// Connect banner nodes to gravity well via field tensors
		// This provides real gravitational attraction toward the gravity well
		const GRAVITY_CONSTANT = 6.67e-11; // Real gravitational constant
		
		// Connect bottom nodes to gravity well (they pull downward)
		const leftBottomGravity = new Tensor(gravityWell, leftBottomNode, 'field', {
			constant: GRAVITY_CONSTANT * 1e15, // Scale up for reasonable forces in world units
			name: 'leftBottomGravity',
		});

		const rightBottomGravity = new Tensor(gravityWell, rightBottomNode, 'field', {
			constant: GRAVITY_CONSTANT * 1e15,
			name: 'rightBottomGravity',
		});

		// Connect top nodes to gravity well (weaker pull, mostly held by springs)
		const leftTopGravity = new Tensor(gravityWell, leftTopNode, 'field', {
			constant: GRAVITY_CONSTANT * 1e14, // Weaker for top nodes
			name: 'leftTopGravity',
		});

		const rightTopGravity = new Tensor(gravityWell, rightTopNode, 'field', {
			constant: GRAVITY_CONSTANT * 1e14,
			name: 'rightTopGravity',
		});

		mockWorld.nodes = [nail, leftTopNode, rightTopNode, leftBottomNode, rightBottomNode, gravityWell];
		mockWorld.tensors = [
			topBand, leftBand, rightBand, leftSpring, rightSpring,
			leftBottomGravity, rightBottomGravity, leftTopGravity, rightTopGravity
		];

		return {
			world: mockWorld,
			bannerNodes: {
				nail,
				leftTop: leftTopNode,
				rightTop: rightTopNode,
				leftBottom: leftBottomNode,
				rightBottom: rightBottomNode,
				gravityWell,
			},
			bannerTensors: [
				topBand, leftBand, rightBand, leftSpring, rightSpring,
				leftBottomGravity, rightBottomGravity, leftTopGravity, rightTopGravity
			],
		};
	}

	/**
	 * Simulate banner physics for a given time period
	 * @param {Object} bannerNodes - Banner nodes
	 * @param {Array<Tensor>} bannerTensors - Banner tensors
	 * @param {number} durationMs - Simulation duration
	 * @return {Promise}
	 */
	async simulateBannerPhysics(bannerNodes, bannerTensors, durationMs) {
		const startTime = Date.now();
		const frameTime = this.frameTimeMs / 1000; // Convert to seconds

		return new Promise(resolve => {
			const simulateFrame = () => {
				const elapsed = Date.now() - startTime;

				if (elapsed < durationMs) {
					// Apply forces and update positions
					bannerTensors.forEach(tensor => {
						try {
							const force = tensor.calculate && tensor.calculate();
							if (force && tensor.node1 && tensor.node2) {
								// Simple Euler integration
								if (tensor.node1.mass && isFinite(tensor.node1.mass)) {
									const ax = force.x / tensor.node1.mass;
									const ay = force.y / tensor.node1.mass;
									if (tensor.node1.velocity) {
										tensor.node1.velocity.x += ax * frameTime;
										tensor.node1.velocity.y += ay * frameTime;
									}
								}
							}
						} catch (e) {
							// Ignore force calculation errors
						}
					});

					// Update positions from velocities
					Object.values(bannerNodes).forEach(node => {
						if (node.velocity && node.mass && isFinite(node.mass)) {
							if (!node.localPosition) node.localPosition = { x: 0, y: 0 };
							node.localPosition.x += node.velocity.x * frameTime;
							node.localPosition.y += node.velocity.y * frameTime;

							// Apply damping
							if (node.velocityLoss) {
								node.velocity.x *= node.velocityLoss;
								node.velocity.y *= node.velocityLoss;
							}
						}
					});

					requestAnimationFrame(simulateFrame);
				} else {
					resolve();
				}
			};

			simulateFrame();
		});
	}

	/**
	 * Check if banner node positions meet success criteria
	 * 
	 * Success Criteria (±10% tolerance added to each range):
	 * - Upper right: X at 98-100% ±10%, Y at 5-20% ±10% (hanger must hang)
	 * - Upper left: X at 70% ±10%, Y at 5-20% ±10% (hanger must hang)
	 * - Bottom left: X at 70% ±10%, Y at 60-100% ±10%
	 * - Bottom right: X at 98-100% ±10%, Y at 60-100% ±10%
	 */
	checkBannerPositions(bannerNodes, view, zoomFactor) {
		const canvas = view.element || { offsetWidth: 800, offsetHeight: 600 };
		const screenWidth = canvas.offsetWidth;
		const screenHeight = canvas.offsetHeight;

		// Convert node world positions to screen positions
		const getScreenPos = (node) => {
			const worldPos = node.localPosition || { x: 0, y: 0 };
			return {
				x: view.x(worldPos),
				y: view.y(worldPos),
			};
		};

		const rightTopScreen = getScreenPos(bannerNodes.rightTop);
		const leftTopScreen = getScreenPos(bannerNodes.leftTop);
		const rightBottomScreen = getScreenPos(bannerNodes.rightBottom);
		const leftBottomScreen = getScreenPos(bannerNodes.leftBottom);

		// Define success criteria (with ±10% additive tolerance)
		// Example: target 0-20% with ±10% = -10% to 30% in screen coords
		const tolerance = screenWidth * 0.1; // 10% of width
		const toleranceH = screenHeight * 0.1; // 10% of height

		const criteria = {
			rightTopX: {
				min: screenWidth * 0.98 - tolerance,  // 98% - 10%
				max: screenWidth * 1.00 + tolerance,  // 100% + 10%
				actual: rightTopScreen.x,
				name: 'Right Top X (right edge ±10%)',
				percent: (rightTopScreen.x / screenWidth * 100).toFixed(1),
			},
			rightTopY: {
				min: screenHeight * 0.05,  // 5% - FIXED floor (hanger must hang)
				max: screenHeight * 0.20 + toleranceH,  // 20% + 10%
				actual: rightTopScreen.y,
				name: 'Right Top Y (5-20% ±10%, hanger MUST hang)',
				percent: (rightTopScreen.y / screenHeight * 100).toFixed(1),
			},
			leftTopX: {
				min: screenWidth * 0.70 - tolerance,  // 70% - 10%
				max: screenWidth * 0.70 + tolerance,  // 70% + 10%
				actual: leftTopScreen.x,
				name: 'Left Top X (70% ±10%)',
				percent: (leftTopScreen.x / screenWidth * 100).toFixed(1),
			},
			leftTopY: {
				min: screenHeight * 0.05,  // 5% - FIXED floor (hanger must hang)
				max: screenHeight * 0.20 + toleranceH,  // 20% + 10%
				actual: leftTopScreen.y,
				name: 'Left Top Y (5-20% ±10%, hanger MUST hang)',
				percent: (leftTopScreen.y / screenHeight * 100).toFixed(1),
			},
			rightBottomX: {
				min: screenWidth * 0.98 - tolerance,  // Same as right top
				max: screenWidth * 1.00 + tolerance,
				actual: rightBottomScreen.x,
				name: 'Right Bottom X (right edge ±10%)',
				percent: (rightBottomScreen.x / screenWidth * 100).toFixed(1),
			},
			rightBottomY: {
				min: screenHeight * 0.60 - toleranceH,  // 60% - 10% (0-40% up from bottom)
				max: screenHeight * 1.00 + toleranceH,  // 100% + 10%
				actual: rightBottomScreen.y,
				name: 'Right Bottom Y (60-100% ±10%)',
				percent: (rightBottomScreen.y / screenHeight * 100).toFixed(1),
			},
			leftBottomX: {
				min: screenWidth * 0.70 - tolerance,  // Same as left top
				max: screenWidth * 0.70 + tolerance,
				actual: leftBottomScreen.x,
				name: 'Left Bottom X (70% ±10%)',
				percent: (leftBottomScreen.x / screenWidth * 100).toFixed(1),
			},
			leftBottomY: {
				min: screenHeight * 0.60 - toleranceH,  // Same as right bottom
				max: screenHeight * 1.00 + toleranceH,
				actual: leftBottomScreen.y,
				name: 'Left Bottom Y (60-100% ±10%)',
				percent: (leftBottomScreen.y / screenHeight * 100).toFixed(1),
			},
		};

		// Check which criteria pass/fail
		const checks = {};
		let allPass = true;

		Object.entries(criteria).forEach(([key, criterion]) => {
			const passed = criterion.actual >= criterion.min && criterion.actual <= criterion.max;
			checks[key] = {
				name: criterion.name,
				passed,
				actual: criterion.actual,
				actualPercent: criterion.percent,
				min: criterion.min,
				max: criterion.max,
				minPercent: (criterion.min / screenWidth * 100).toFixed(1),
				maxPercent: (criterion.max / screenWidth * 100).toFixed(1),
				range: criterion.max - criterion.min,
			};
			if (!passed) allPass = false;
		});

		return {
			passed: allPass,
			zoomFactor,
			zoomExponent: Math.log10(zoomFactor),
			screenPositions: {
				rightTop: rightTopScreen,
				leftTop: leftTopScreen,
				rightBottom: rightBottomScreen,
				leftBottom: leftBottomScreen,
			},
			checks,
			summary: {
				passedCriteria: Object.values(checks).filter(c => c.passed).length,
				totalCriteria: Object.values(checks).length,
			},
		};
	}

	/**
	 * Run full banner position test at a specific zoom level
	 * @param {View} view - View to test
	 * @param {number} zoomFactor - Zoom level to test
	 * @return {Promise<Object>} Test result
	 */
	async testBannerAtZoom(view, zoomFactor) {
		try {
			// Create banner
			const { bannerNodes, bannerTensors } = this.createTestBanner(view, zoomFactor);

			// Simulate physics for 3 seconds
			await this.simulateBannerPhysics(bannerNodes, bannerTensors, this.stabilizationTime);

			// Check positions
			const result = this.checkBannerPositions(bannerNodes, view, zoomFactor);

			return result;
		} catch (error) {
			return {
				passed: false,
				zoomFactor,
				error: error.message,
			};
		}
	}

	/**
	 * Run full test suite across all zoom levels
	 * @param {View} view - View to test
	 * @return {Promise<Object>} Complete test results
	 */
	async runFullSuite(view) {
		const results = {
			banner: [],
			summary: {},
		};

		console.log(`\n${'='.repeat(80)}`);
		console.log('BANNER POSITION ZOOM INDEPENDENCE TEST SUITE');
		console.log(`Testing ${this.zoomLevels.length} zoom levels from 10^-14 to 10^14`);
		console.log(`Stabilization time: ${this.stabilizationTime}ms per level`);
		console.log(`${'='.repeat(80)}\n`);

		let passedCount = 0;
		let startTime = Date.now();

		for (let i = 0; i < this.zoomLevels.length; i++) {
			const zoom = this.zoomLevels[i];
			const exp = Math.log10(zoom);

			process.stdout.write(`[${i + 1}/${this.zoomLevels.length}] Testing 10^${exp.toFixed(0)}... `);

			const result = await this.testBannerAtZoom(view, zoom);
			results.banner.push(result);

			if (result.passed) {
				passedCount++;
				console.log(`✓ PASS (${result.summary.passedCriteria}/${result.summary.totalCriteria})`);
			} else if (result.error) {
				console.log(`✗ ERROR: ${result.error}`);
			} else {
				console.log(`✗ FAIL (${result.summary.passedCriteria}/${result.summary.totalCriteria})`);
				// Show which criteria failed
				Object.entries(result.checks).forEach(([key, check]) => {
					if (!check.passed) {
						console.log(
							`      ${check.name}: ${check.actual.toFixed(0)} ` +
							`(expected ${check.min.toFixed(0)}-${check.max.toFixed(0)})`
						);
					}
				});
			}
		}

		const totalTime = (Date.now() - startTime) / 1000;
		results.summary = {
			passedLevels: passedCount,
			totalLevels: this.zoomLevels.length,
			passRate: `${(passedCount / this.zoomLevels.length * 100).toFixed(1)}%`,
			totalTimeSeconds: totalTime.toFixed(1),
			averageTimePerLevel: (totalTime / this.zoomLevels.length).toFixed(2),
		};

		console.log(`\n${'='.repeat(80)}`);
		console.log('TEST SUMMARY');
		console.log(`${'='.repeat(80)}`);
		console.log(`Passed: ${results.summary.passedLevels}/${results.summary.totalLevels} zoom levels`);
		console.log(`Pass Rate: ${results.summary.passRate}`);
		console.log(`Total Time: ${results.summary.totalTimeSeconds}s`);
		console.log(`Avg Time/Level: ${results.summary.averageTimePerLevel}s`);
		console.log(passedCount === this.zoomLevels.length ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED');
		console.log(`${'='.repeat(80)}\n`);

		return results;
	}
}

export { BannerPositionTest };
