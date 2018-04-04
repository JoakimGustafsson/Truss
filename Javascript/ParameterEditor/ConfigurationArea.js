/**
 * @param {string} id
 * @return {Element}
 */
function createConfigurationArea(id) {
	// The area that will be influenced by the Matrix warping
	let configArea = document.createElement('div');
	configArea.id = id;
	configArea.style.display = 'none';
	configArea.classList.add('configareaouter');

	// The actual whole configuration area
	let configAreaInner = document.createElement('div');
	configAreaInner.classList.add('configareainner');
	configArea.appendChild(configAreaInner);

	{
		// The tab area at the top
		let tabArea = document.createElement('div');
		tabArea.classList.add('tab');
		configAreaInner.appendChild(tabArea);


		let propertiesButton = document.createElement('button');
		propertiesButton.id = 'propertiesButton';
		propertiesButton.classList.add('tabsectionbuttons');
		propertiesButton.innerHTML = 'PROPERTIES';
		propertiesButton.addEventListener('click', function() {
			movePropertyEdit('propertyConfigArea');
			openBottomPanel(event, 'propertiesDiv');
		}, false);
		tabArea.appendChild(propertiesButton);

		let trussButton = document.createElement('button');
		trussButton.classList.add('tabsectionbuttons');
		trussButton.classList.add('active');
		trussButton.innerHTML = 'TRUSS';
		trussButton.addEventListener('click', function() {
			movePropertyEdit('trussConfigArea');
			openBottomPanel(event, 'trussDiv');
		}, false);
		tabArea.appendChild(trussButton);

		let fileButton = document.createElement('button');
		fileButton.classList.add('tabsectionbuttons');
		fileButton.classList.add('active');
		fileButton.innerHTML = 'FILE';
		fileButton.addEventListener('click', function() {
			openBottomPanel(event, 'fileDiv');
			directory('Saves');
		}, false);
		tabArea.appendChild(fileButton);

		// The tab area at the top
		let propertyArea = document.createElement('div');
		propertyArea.id = 'propertiesDiv';
		propertyArea.classList.add('footerbackgroundarea');
		propertyArea.classList.add('tabcontent');
		configAreaInner.appendChild(propertyArea);

		{
			let propertyContainer = document.createElement('div');
			propertyContainer.classList.add('sectionbase');
			propertyArea.appendChild(propertyContainer);

			{
				let propertyConfigArea = document.createElement('div');
				propertyConfigArea.id = 'propertyConfigArea';
				propertyContainer.appendChild(propertyConfigArea);

				{
					let configView = document.createElement('div');
					configView.id = 'configview';
					configView.classList.add('sectionmiddle');
					propertyConfigArea.appendChild(configView);
				}

				let connectionTempDiv = document.createElement('div');
				connectionTempDiv.id = 'connectionDiv';
				connectionTempDiv.classList.add('sectionmiddle');
				connectionTempDiv.align = 'right';
				propertyContainer.appendChild(connectionTempDiv);

				let addDiv = document.createElement('div');
				addDiv.id = 'addDiv';
				addDiv.classList.add('sectionlast');
				addDiv.align = 'right';
				propertyContainer.appendChild(addDiv);

				{
					let nodeAdder = document.createElement('div');
					addDiv.appendChild(nodeAdder);

					createNodeDropdown(nodeAdder);


					let nodeButton = document.createElement('button');
					nodeButton.classList.add('simpleButton');
					nodeButton.innerHTML = 'create';
					nodeAdder.appendChild(nodeButton);

					nodeButton.addEventListener('click', function() {
						makeNode();
					}, false);
				}

				{
					let tensorAdder = document.createElement('div');
					tensorAdder.id = 'tensorAdder';
					addDiv.appendChild(tensorAdder);

					// TODO: tensorDropdown;
					createTensorDropdown(tensorAdder);

					let tensorButton = document.createElement('button');
					tensorButton.classList.add('simpleButton');
					tensorButton.innerHTML = 'create';
					tensorAdder.appendChild(tensorButton);
					tensorButton.addEventListener('click', function() {
						makeTensor();
					}, false);
				}
			}

			let propertyButtons = document.createElement('div');
			propertyButtons.classList.add('sectionlast');
			propertyArea.appendChild(propertyButtons);

			{
				let pauseButton = document.createElement('button');
				pauseButton.classList.add('simpleButton');
				pauseButton.innerHTML = 'Pause';
				pauseButton.addEventListener('click', function() {
					mainNode.togglePause();
				}, false);
				propertyButtons.appendChild(pauseButton);

				let gravityButton = document.createElement('button');
				gravityButton.id = 'gravityButton';
				gravityButton.classList.add('simpleButton');
				gravityButton.innerHTML = 'Gravity';
				gravityButton.addEventListener('click', function() {
					addGravityCheat();
				}, false);
				propertyButtons.appendChild(gravityButton);

				let deleteButton = document.createElement('button');
				deleteButton.classList.add('simpleButton');
				deleteButton.innerHTML = 'Delete';
				deleteButton.addEventListener('click', function() {
					deleteSelected();
				}, false);
				propertyButtons.appendChild(deleteButton);

				createDebugDropdown(propertyButtons);
			}
		}

		// The tab area at the top
		let trussArea = document.createElement('div');
		trussArea.classList.add('footerbackgroundarea');
		trussArea.classList.add('tabcontent');
		trussArea.id = 'trussDiv';
		configAreaInner.appendChild(trussArea);

		{
			let trussPropertyArea = document.createElement('div');
			trussPropertyArea.classList.add('sectionbase');
			trussArea.appendChild(trussPropertyArea);

			{
				let trussConfigArea = document.createElement('div');
				trussConfigArea.id = 'trussConfigArea';
				trussPropertyArea.appendChild(trussConfigArea);
			}

			let trussPropertyLast = document.createElement('div');
			trussPropertyLast.classList.add('sectionlast');
			trussArea.appendChild(trussPropertyLast);

			{
				let newTruss = document.createElement('button');
				newTruss.classList.add('simpleButton');
				newTruss.innerHTML = 'TrussNode';
				trussPropertyLast.appendChild(newTruss);
				let newGravity = document.createElement('button');
				newGravity.classList.add('simpleButton');
				newGravity.innerHTML = 'GravityNode';
				trussPropertyLast.appendChild(newGravity);
				let newSelector = document.createElement('button');
				newSelector.classList.add('simpleButton');
				newSelector.innerHTML = 'SelectorNode';
				trussPropertyLast.appendChild(newSelector);
			}
		}


		// The tab area at the top
		let fileArea = document.createElement('div');
		fileArea.classList.add('footerbackgroundarea');
		fileArea.classList.add('tabcontent');
		fileArea.id = 'fileDiv';
		configAreaInner.appendChild(fileArea);

		let fileDiv = document.createElement('div');
		fileDiv.classList.add('sectionbase');
		fileDiv.align = 'right';
		fileArea.appendChild(fileDiv);

		let fileList = document.createElement('div');
		fileList.id = 'fileList';
		fileList.classList.add('fileList');
		fileList.align = 'left';
		fileDiv.appendChild(fileList);

		let fileNameInput = document.createElement('input');
		fileNameInput.id = 'fileNameInput';
		fileNameInput.classList.add('fileNameInput');
		fileNameInput.classList.add('inputcss');
		fileNameInput.value = 'myFile';
		fileDiv.appendChild(fileNameInput);

		let saveButton = document.createElement('button');
		saveButton.id = 'saveButton';
		saveButton.classList.add('simpleButton');
		saveButton.innerHTML = 'Save';
		saveButton.addEventListener('click', function() {
			saveFile(document.getElementById('fileNameInput').value);
		}, false);
		fileDiv.appendChild(saveButton);
	}

	return configArea;

	/**
     * @param  {Element} propertyButtons
     */
	function createDebugDropdown(propertyButtons) {
		let debugLevelSelect = document.createElement('select');
		debugLevelSelect.id = 'debugLevel';
		debugLevelSelect.classList.add('inputcss');
		debugLevelSelect.addEventListener('change', function() {
			changeDebugLevel();
		}, false);
		propertyButtons.appendChild(debugLevelSelect);
		let optionDebug1 = document.createElement('option');
		optionDebug1.value = '1';
		optionDebug1.innerHTML = 'Debug level';
		debugLevelSelect.appendChild(optionDebug1);
		let optionDebug2 = document.createElement('option');
		optionDebug2.value = '0';
		optionDebug2.innerHTML = 'Nothing';
		debugLevelSelect.appendChild(optionDebug2);
		let optionDebug3 = document.createElement('option');
		optionDebug3.value = '1';
		optionDebug3.innerHTML = 'Only web parts';
		debugLevelSelect.appendChild(optionDebug3);
		let optionDebug4 = document.createElement('option');
		optionDebug4.value = '2';
		optionDebug4.innerHTML = 'Only lines';
		debugLevelSelect.appendChild(optionDebug4);
		let optionDebug5 = document.createElement('option');
		optionDebug5.value = '3';
		optionDebug5.innerHTML = 'Only nodes';
		debugLevelSelect.appendChild(optionDebug5);
		let optionDebug6 = document.createElement('option');
		optionDebug6.value = '5';
		optionDebug6.innerHTML = 'Lines and Nodess';
		debugLevelSelect.appendChild(optionDebug6);
		let optionDebug7 = document.createElement('option');
		optionDebug7.value = '6';
		optionDebug7.innerHTML = 'Add speeds';
		debugLevelSelect.appendChild(optionDebug7);
		let optionDebug8 = document.createElement('option');
		optionDebug8.value = '7';
		optionDebug8.innerHTML = 'Add acceleration';
		debugLevelSelect.appendChild(optionDebug8);
		let optionDebug9 = document.createElement('option');
		optionDebug9.value = '10';
		optionDebug9.innerHTML = 'Add numbers';
		debugLevelSelect.appendChild(optionDebug9);
	}

	/**
     * @param  {Element} surroundingDiv
     */
	function createNodeDropdown(surroundingDiv) {
		let nodeSelect = document.createElement('select');
		nodeSelect.id = 'nodeType';
		nodeSelect.classList.add('inputcss');
		surroundingDiv.appendChild(nodeSelect);
		let optionDebug1 = document.createElement('option');
		optionDebug1.value = 'Node';
		optionDebug1.innerHTML = 'Node';
		nodeSelect.appendChild(optionDebug1);
		let optionDebug2 = document.createElement('option');
		optionDebug2.value = '';
		optionDebug2.innerHTML = '--Sensors--';
		nodeSelect.appendChild(optionDebug2);
		let optionDebug3 = document.createElement('option');
		optionDebug3.value = 'KeySensorNode';
		optionDebug3.innerHTML = 'KeySensorNode';
		nodeSelect.appendChild(optionDebug3);
		let optionDebug4 = document.createElement('option');
		optionDebug4.value = 'ProximitySensorNode';
		optionDebug4.innerHTML = 'ProximitySensor';
		nodeSelect.appendChild(optionDebug4);
		let optionDebug5 = document.createElement('option');
		optionDebug5.value = '';
		optionDebug5.innerHTML = '--Actuators--';
		nodeSelect.appendChild(optionDebug5);
		let optionDebug6 = document.createElement('option');
		optionDebug6.value = 'jumpNode';
		optionDebug6.innerHTML = 'JumpNodeActuator';
		nodeSelect.appendChild(optionDebug6);
		let optionDebug7 = document.createElement('option');
		optionDebug7.value = 'LeftRightNode';
		optionDebug7.innerHTML = 'LeftRightActuator';
		nodeSelect.appendChild(optionDebug7);
		let optionDebug8 = document.createElement('option');
		optionDebug8.value = 'LinebreakerNode';
		optionDebug8.innerHTML = 'LinebreakerActuator';
		nodeSelect.appendChild(optionDebug8);
	}

	/**
     * @param  {Element} surroundingDiv
     */
	function createTensorDropdown(surroundingDiv) {
		let nodeSelect = document.createElement('select');
		nodeSelect.id = 'tensorType';
		nodeSelect.classList.add('inputcss');
		surroundingDiv.appendChild(nodeSelect);
		let optionDebug1 = document.createElement('option');
		optionDebug1.value = 'Spring';
		optionDebug1.innerHTML = 'Spring';
		nodeSelect.appendChild(optionDebug1);
		let optionDebug2 = document.createElement('option');
		optionDebug2.value = 'PullSpring';
		optionDebug2.innerHTML = 'PullSpring';
		nodeSelect.appendChild(optionDebug2);
		let optionDebug3 = document.createElement('option');
		optionDebug3.value = 'Absorber';
		optionDebug3.innerHTML = 'Absorber';
		nodeSelect.appendChild(optionDebug3);
		let optionDebug4 = document.createElement('option');
		optionDebug4.value = 'Field';
		optionDebug4.innerHTML = 'Field';
		nodeSelect.appendChild(optionDebug4);
		let optionDebug5 = document.createElement('option');
		optionDebug5.value = 'PictureSpring';
		optionDebug5.innerHTML = 'PictureSpring';
		nodeSelect.appendChild(optionDebug5);
	}
}
