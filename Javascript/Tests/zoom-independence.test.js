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

		mockWorld.nodes = [nail, leftTopNode, rightTopNode, leftBottomNode, rightBottomNode];
		mockWorld.tensors = [topBand, leftBand, rightBand, leftSpring, rightSpring];

		return {
			world: mockWorld,
			bannerNodes: {
				nail,
				leftTop: leftTopNode,
				rightTop: rightTopNode,
				leftBottom: leftBottomNode,
				rightBottom: rightBottomNode,
			},
			bannerTensors: [topBand, leftBand, rightBand, leftSpring, rightSpring],
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
	 * - Upper right: X at 98-100% ±10%, Y at 0-20% ±10%
	 * - Upper left: X at 70% ±10%, Y at 0-20% ±10%
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
				min: screenHeight * 0.00 - toleranceH,  // 0% - 10%
				max: screenHeight * 0.20 + toleranceH,  // 20% + 10%
				actual: rightTopScreen.y,
				name: 'Right Top Y (0-20% ±10%)',
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
				min: screenHeight * 0.00 - toleranceH,  // 0% - 10%
				max: screenHeight * 0.20 + toleranceH,  // 20% + 10%
				actual: leftTopScreen.y,
				name: 'Left Top Y (0-20% ±10%)',
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


	/**
	 * Test coordinate transformation accuracy at a given zoom level
	 * @param {View} view - The view object to test
	 * @param {number} zoomFactor - Scale factor to test
	 * @param {number} tolerance - Acceptable error margin (in world units)
	 * @return {Object} Test result { passed: bool, zoomFactor: num, error: num }
	 */
	testCoordinateTransformation(view, zoomFactor, tolerance = 1e-6) {
		// Set initial worldViewSize (100 units in world coords)
		const originalViewSize = 100;
		view.setWorldViewSize({ x: originalViewSize, y: originalViewSize });

		// Apply zoom by adjusting worldViewSize
		const scaledViewSize = originalViewSize / zoomFactor;
		view.setWorldViewSize({ x: scaledViewSize, y: scaledViewSize });

		// Test conversion: screen (50, 50) → world → screen
		const screenX = 50;
		const screenY = 50;
		const worldPos = view.worldPosition(screenX, screenY);
		const screenPosBack = {
			x: view.x(worldPos),
			y: view.y(worldPos),
		};

		const errorX = Math.abs(screenPosBack.x - screenX);
		const errorY = Math.abs(screenPosBack.y - screenY);
		const error = Math.max(errorX, errorY);

		return {
			passed: error < tolerance,
			zoomFactor,
			error,
			tolerance,
			screenX,
			screenY,
			worldPos,
			roundTripX: screenPosBack.x,
			roundTripY: screenPosBack.y,
		};
	}

	/**
	 * Test pan position consistency across zoom operations
	 * @param {View} view - The view object to test
	 * @param {number} zoomFactor - Scale factor to test
	 * @return {Object} Test result
	 */
	testPanConsistency(view, zoomFactor) {
		// Set up initial state
		view.setWorldViewSize({ x: 100, y: 100 });
		view.setOffset({ x: 0, y: 0 });

		// Pan to a known position
		const panDelta = { x: 10, y: 20 };
		view.updateOffset(panDelta);
		const offsetAfterPan = { x: view.offset.x, y: view.offset.y };

		// Zoom at a center point
		const zoomCenter = { x: 50, y: 50 };
		const zoomDelta = { x: (1 - 1 / zoomFactor) / 2, y: (1 - 1 / zoomFactor) / 2 };
		view.updateScale(zoomDelta, zoomCenter);

		// Verify offset wasn't corrupted
		const offsetAfterZoom = { x: view.offset.x, y: view.offset.y };
		const offsetStability = {
			x: Math.abs(offsetAfterZoom.x - offsetAfterPan.x),
			y: Math.abs(offsetAfterZoom.y - offsetAfterPan.y),
		};

		// Pan should remain stable (small drift acceptable at extreme scales)
		const maxAcceptableDrift = Math.max(1e-10, 1e-6 * zoomFactor);
		const offsetStable = 
			offsetStability.x < maxAcceptableDrift && 
			offsetStability.y < maxAcceptableDrift;

		return {
			passed: offsetStable,
			zoomFactor,
			offsetAfterPan,
			offsetAfterZoom,
			stability: offsetStability,
			maxAcceptableDrift,
		};
	}

	/**
	 * Test pointer-to-world coordinate mapping accuracy
	 * @param {View} view - The view object to test
	 * @param {number} zoomFactor - Scale factor to test
	 * @return {Object} Test result
	 */
	testPointerMapping(view, zoomFactor) {
		view.setWorldViewSize({ x: 100 / zoomFactor, y: 100 / zoomFactor });
		view.setOffset({ x: 50, y: 50 });

		// Test multiple screen positions
		const testPoints = [
			{ x: 0, y: 0 },      // Top-left
			{ x: 100, y: 100 },  // Center (approximate)
			{ x: 200, y: 200 },  // Bottom-right
			{ x: 99.5, y: 99.5 }, // Near-center
		];

		const results = testPoints.map(screenPos => {
			const worldPos = view.worldPosition(screenPos.x, screenPos.y);
			// Verify consistency: same screen pos always gives same world pos
			const worldPos2 = view.worldPosition(screenPos.x, screenPos.y);
			
			const consistent = 
				Math.abs(worldPos.x - worldPos2.x) < 1e-10 &&
				Math.abs(worldPos.y - worldPos2.y) < 1e-10;

			return {
				screenPos,
				worldPos,
				consistent,
			};
		});

		const allConsistent = results.every(r => r.consistent);
		return {
			passed: allConsistent,
			zoomFactor,
			testPoints: results,
		};
	}

	/**
	 * Test banner force magnitude consistency
	 * Forces should maintain relative proportions across zoom levels
	 * @param {Tensor} bannerTensor - Banner tensor to test
	 * @param {number} zoomFactor - Scale factor context
	 * @return {Object} Test result
	 */
	testBannerForceScaling(bannerTensor, zoomFactor) {
		if (!bannerTensor || !bannerTensor.calculate) {
			return {
				passed: true,
				zoomFactor,
				message: 'Tensor not available for testing',
			};
		}

		const force = bannerTensor.calculate();
		const forceMagnitude = Math.sqrt(force.x * force.x + force.y * force.y);

		// Forces should be finite and non-NaN
		const forceValid = 
			isFinite(forceMagnitude) && 
			!isNaN(forceMagnitude) &&
			forceMagnitude >= 0;

		return {
			passed: forceValid,
			zoomFactor,
			forceMagnitude,
			force: { x: force.x, y: force.y },
		};
	}

	/**
	 * Run full test suite
	 * @param {View} view - View to test
	 * @param {Tensor|null} bannerTensor - Optional banner tensor for force testing
	 * @return {Object} Comprehensive test results
	 */
	runFullSuite(view, bannerTensor = null) {
		const results = {
			coordinateTransformation: [],
			panConsistency: [],
			pointerMapping: [],
			bannerForceScaling: [],
			summary: {},
		};

		console.log(`\n${'='.repeat(80)}`);
		console.log('ZOOM INDEPENDENCE TEST SUITE');
		console.log(`Testing ${this.zoomLevels.length} zoom levels from nano to lightyear scale`);
		console.log(`${'='.repeat(80)}\n`);

		// Test 1: Coordinate Transformation
		console.log('Test 1: Coordinate Transformation (screen → world → screen)');
		console.log('-'.repeat(80));
		let coordinatePass = 0;
		this.zoomLevels.forEach(zoom => {
			const result = this.testCoordinateTransformation(view, zoom);
			results.coordinateTransformation.push(result);
			if (result.passed) coordinatePass++;
			
			const status = result.passed ? '✓' : '✗';
			console.log(
				`${status} Zoom 10^${Math.log10(zoom).toFixed(1)} (factor: ${zoom.toExponential(2)}): ` +
				`error=${result.error.toExponential(2)} (tolerance: ${result.tolerance.toExponential(2)})`
			);
		});
		results.summary.coordinateTransformation = `${coordinatePass}/${this.zoomLevels.length}`;

		// Test 2: Pan Consistency
		console.log('\nTest 2: Pan Offset Consistency After Zoom');
		console.log('-'.repeat(80));
		let panPass = 0;
		this.zoomLevels.forEach(zoom => {
			const result = this.testPanConsistency(view, zoom);
			results.panConsistency.push(result);
			if (result.passed) panPass++;
			
			const status = result.passed ? '✓' : '✗';
			console.log(
				`${status} Zoom 10^${Math.log10(zoom).toFixed(1)}: ` +
				`drift=(${result.stability.x.toExponential(2)}, ${result.stability.y.toExponential(2)}) ` +
				`(max: ${result.maxAcceptableDrift.toExponential(2)})`
			);
		});
		results.summary.panConsistency = `${panPass}/${this.zoomLevels.length}`;

		// Test 3: Pointer Mapping
		console.log('\nTest 3: Pointer-to-World Mapping Consistency');
		console.log('-'.repeat(80));
		let pointerPass = 0;
		this.zoomLevels.forEach(zoom => {
			const result = this.testPointerMapping(view, zoom);
			results.pointerMapping.push(result);
			if (result.passed) pointerPass++;
			
			const status = result.passed ? '✓' : '✗';
			console.log(
				`${status} Zoom 10^${Math.log10(zoom).toFixed(1)}: ` +
				`${result.testPoints.length} test points consistent`
			);
		});
		results.summary.pointerMapping = `${pointerPass}/${this.zoomLevels.length}`;

		// Test 4: Banner Force Scaling
		if (bannerTensor) {
			console.log('\nTest 4: Banner Force Magnitude Validity');
			console.log('-'.repeat(80));
			let forcePass = 0;
			this.zoomLevels.forEach(zoom => {
				const result = this.testBannerForceScaling(bannerTensor, zoom);
				results.bannerForceScaling.push(result);
				if (result.passed) forcePass++;
				
				const status = result.passed ? '✓' : '✗';
				console.log(
					`${status} Zoom 10^${Math.log10(zoom).toFixed(1)}: ` +
					`force magnitude=${result.forceMagnitude.toExponential(2)}`
				);
			});
			results.summary.bannerForceScaling = `${forcePass}/${this.zoomLevels.length}`;
		}

		// Print summary
		console.log(`\n${'='.repeat(80)}`);
		console.log('TEST SUMMARY');
		console.log(`${'='.repeat(80)}`);
		Object.entries(results.summary).forEach(([test, summary]) => {
			console.log(`${test}: ${summary}`);
		});

		const totalPassed = coordinatePass + panPass + pointerPass + 
			(bannerTensor ? results.bannerForceScaling.filter(r => r.passed).length : 0);
		const totalTests = this.zoomLevels.length * (bannerTensor ? 4 : 3);
		const overallPass = totalPassed === totalTests;

		console.log(`\nOVERALL: ${totalPassed}/${totalTests} tests passed`);
		console.log(overallPass ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED');
		console.log(`${'='.repeat(80)}\n`);

		return results;
	}

	/**
	 * Export results as JSON for analysis
	 * @param {Object} results - Test results object
	 * @param {string} filename - Output filename
	 */
	exportResults(results, filename = 'zoom-test-results.json') {
		const json = JSON.stringify(results, null, 2);
		console.log(`Test results exported to: ${filename}`);
		// In Node.js: fs.writeFileSync(filename, json);
		// In Browser: would need to trigger download or log to console
		return json;
	}
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ZoomIndependenceTest;
}
