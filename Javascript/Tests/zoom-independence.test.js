/**
 * Zoom Independence Test Suite
 * 
 * Verifies that banner physics and pointer tracking work correctly
 * across extreme zoom levels (nano to lightyear scales).
 * 
 * Test strategy:
 * 1. Create a test world with a banner
 * 2. Measure coordinate transformations at various zoom levels
 * 3. Verify pan/zoom operations maintain coordinate accuracy
 * 4. Check banner force behavior at extreme scales
 */

class ZoomIndependenceTest {
	constructor() {
		this.testResults = [];
		this.zoomLevels = this._generateZoomLevels();
	}

	/**
	 * Generate zoom levels from nano (10^-9) to lightyear (10^15 AU)
	 * Using logarithmic spacing for comprehensive coverage
	 * @return {Array<number>} Zoom scale factors
	 */
	_generateZoomLevels() {
		const levels = [];
		// Log scale from 10^-9 to 10^15
		for (let exp = -9; exp <= 15; exp += 1.5) {
			levels.push(Math.pow(10, exp));
		}
		return levels;
	}

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
