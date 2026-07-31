/**
 * Test: Verify coordinate systems are correctly set up and used by banner nodes
 */

// Check if coordinate systems exist on the view
function testCoordinateSystems() {
	console.log('=== Testing Coordinate Systems ===');
	
	// Get the current truss node from the universe
	const trussNode = universe.currentNode;
	if (!trussNode || !trussNode.view) {
		console.error('❌ No truss node or view available');
		return;
	}
	
	const view = trussNode.view;
	console.log(`✓ Found view: ${view.constructor.name}`);
	
	// Check coordinate systems
	if (!view.worldCoordinateSystem) {
		console.error('❌ worldCoordinateSystem is NOT defined on view');
	} else {
		console.log(`✓ worldCoordinateSystem exists: name="${view.worldCoordinateSystem.name}"`);
	}
	
	if (!view.displayCoordinateSystem) {
		console.error('❌ displayCoordinateSystem is NOT defined on view');
	} else {
		console.log(`✓ displayCoordinateSystem exists: name="${view.displayCoordinateSystem.name}"`);
	}
	
	// Check if they're different objects
	if (view.worldCoordinateSystem && view.displayCoordinateSystem) {
		if (view.worldCoordinateSystem === view.displayCoordinateSystem) {
			console.error('❌ worldCoordinateSystem and displayCoordinateSystem are the SAME object!');
		} else {
			console.log('✓ worldCoordinateSystem and displayCoordinateSystem are different objects');
		}
	}
	
	// Now check the banner nodes if they exist
	testBannerNodes(trussNode);
}

function testBannerNodes(trussNode) {
	console.log('\n=== Testing Banner Nodes ===');
	
	// Find the banner nodes by label
	const world = trussNode.world;
	const bannerLabel = world.labels && world.labels.findLabel('banner');
	
	if (!bannerLabel) {
		console.log('ℹ️  No banner nodes found yet (create a banner first)');
		return;
	}
	
	const bannerReferences = bannerLabel.getReferences();
	console.log(`Found ${bannerReferences.length} banner-related nodes/tensors`);
	
	// Find the nail specifically
	let nailNode = null;
	for (const ref of bannerReferences) {
		if (ref.isNode && ref.name === 'nail') {
			nailNode = ref;
			break;
		}
	}
	
	if (!nailNode) {
		console.log('ℹ️  Nail node not found');
		return;
	}
	
	console.log(`\n✓ Found nail node: "${nailNode.name}"`);
	
	// Check the nail's coordinate system
	const coordSys = nailNode.coordinateSystem;
	console.log(`  coordinateSystem object: ${coordSys ? coordSys.constructor.name : 'null'}`);
	console.log(`  coordinateSystem.name: "${coordSys ? coordSys.name : 'null'}"`);
	console.log(`  _coordinateSystem (internal): ${nailNode._coordinateSystem ? 'SET' : 'NOT SET'}`);
	
	if (coordSys && coordSys.name === 'display') {
		console.log('✓ ✓ ✓ NAIL HAS DISPLAY COORDINATE SYSTEM ✓ ✓ ✓');
	} else if (coordSys && coordSys.name === 'world') {
		console.error('❌ NAIL HAS WORLD COORDINATE SYSTEM (should be display)');
	} else {
		console.error('❌ NAIL COORDINATE SYSTEM IS INVALID');
	}
	
	// Check other banner nodes
	console.log('\n--- Other banner nodes ---');
	for (const ref of bannerReferences) {
		if (ref.isNode && ref.name !== 'nail') {
			const cs = ref.coordinateSystem;
			console.log(`  ${ref.name}: ${cs ? cs.name : 'unknown'}`);
		}
	}
}

// Run the test
testCoordinateSystems();

// Print instructions
console.log('\n=== Instructions ===');
console.log('1. Open the browser console (F12)');
console.log('2. Run this test: copy and paste the above code into the console');
console.log('3. Create a banner (select a truss node and open property editor)');
console.log('4. Run the test again to check the nail coordinate system');
