/*jshint esversion:6 */
/*global movePropertyEdit openBottomPanel directory createSimpleButton makeNode makeTensor saveFile createOption */
/*global addGravityCheat deleteSelected */

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

		let labelButton = document.createElement('button');
		labelButton.classList.add('tabsectionbuttons');
		labelButton.classList.add('active');
		labelButton.innerHTML = 'LABELS';
		labelButton.addEventListener('click', function() {
			openBottomPanel(event, 'labelDiv');
			universe.currentWorld.labels.show('labelConfigArea');
		}, false);
		tabArea.appendChild(labelButton);

		let fileButton = document.createElement('button');
		fileButton.classList.add('tabsectionbuttons');
		fileButton.classList.add('active');
		fileButton.innerHTML = 'FILE';
		fileButton.addEventListener('click', function() {
			openBottomPanel(event, 'fileDiv');
			directory('Saves');
			universe.currentNode.getElement('.fileNameInput').value=universe.currentNode.name;
		}, false);
		tabArea.appendChild(fileButton);

		let settingsButton = document.createElement('button');
		settingsButton.classList.add('tabsectionbuttons');
		settingsButton.classList.add('active');
		settingsButton.innerHTML = 'GLOBAL';
		settingsButton.addEventListener('click', function() {
			openBottomPanel(event, 'globalDiv');
		}, false);
		tabArea.appendChild(settingsButton);

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
				connectionTempDiv.align = 'left';
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

					createSimpleButton(nodeAdder, 'Create', () => makeNode());
				}

				{
					let tensorAdder = document.createElement('div');
					tensorAdder.id = 'tensorAdder';
					addDiv.appendChild(tensorAdder);

					// TODO: tensorDropdown;
					createTensorDropdown(tensorAdder);

					createSimpleButton(tensorAdder, 'Create', () => makeTensor());
				}
			}

			let propertyButtons = document.createElement('div');
			propertyButtons.classList.add('sectionlast');
			propertyArea.appendChild(propertyButtons);

			{
				createSimpleButton(propertyButtons, 'Pause', () => universe.currentNode.togglePause());
				createSimpleButton(propertyButtons, 'Gravity', () => addGravityCheat(), 'gravityButton');
				createSimpleButton(propertyButtons, 'Delete', () => deleteSelected());
				/*let fastEditButton = createSimpleButton(propertyButtons, 'FastEdit',
					function() {
						universe.currentWorld.fastEdit=!universe.currentWorld.fastEdit;
						if (universe.currentWorld.fastEdit) {
							this.classList.add('activebutton');
						} else {
							this.classList.remove('activebutton');
						}
					});
				if (universe && universe.currentWorld && universe.currentWorld.fastEdit) { // set up correctly when added
					fastEditButton.classList.add('activebutton');
				} else {
					fastEditButton.classList.remove('activebutton');
				}*/

				// createDebugDropdown(propertyButtons);
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
				createSimpleButton(trussPropertyLast, 'TrussNode');
				/* let fastEditButton = createSimpleButton(trussPropertyLast, 'FastEdit',
					function() {
						universe.currentWorld.fastEdit=!universe.currentWorld.fastEdit;
						if (universe.currentWorld.fastEdit) {
							this.classList.add('activebutton');
						} else {
							this.classList.remove('activebutton');
						}
					});
				if (universe && universe.currentWorld && universe.currentWorld.fastEdit) { // set up correctly when added
					fastEditButton.classList.add('activebutton');
				} else {
					fastEditButton.classList.remove('activebutton');
				} */
				createSimpleButton(trussPropertyLast, 'SelectorNode');
			}
		}

		// The tab area at the top
		let labelArea = document.createElement('div');
		labelArea.classList.add('footerbackgroundarea');
		labelArea.classList.add('tabcontent');
		labelArea.id = 'labelDiv';
		configAreaInner.appendChild(labelArea);

		{
			let labelPropertyArea = document.createElement('div');
			labelPropertyArea.classList.add('sectionbase');
			labelArea.appendChild(labelPropertyArea);

			{
				let labelConfigArea = document.createElement('div');
				labelConfigArea.id = 'labelConfigArea';
				labelPropertyArea.appendChild(labelConfigArea);

				let labelContentArea = document.createElement('div');
				labelContentArea.classList.add('labelList');
				labelContentArea.id = 'labelContentArea';
				labelPropertyArea.appendChild(labelContentArea);
			}
			/*
			let labelPropertyLast = document.createElement('div');
			labelPropertyLast.classList.add('sectionlast');
			labelArea.appendChild(labelPropertyLast);

			{
				createSimpleButton(labelPropertyLast, 'All');
				createSimpleButton(labelPropertyLast, 'World');
				createSimpleButton(labelPropertyLast, 'Node');
				createSimpleButton(labelPropertyLast, 'Tensor');
			} */
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

		// The tab area at the top
		let globalArea = document.createElement('div');
		globalArea.classList.add('footerbackgroundarea');
		globalArea.classList.add('tabcontent');
		globalArea.id = 'globalDiv';
		configAreaInner.appendChild(globalArea);

		let globalDiv = document.createElement('div');
		globalDiv.classList.add('sectionbase');
		globalDiv.align = 'right';
		globalArea.appendChild(globalDiv);

		globalDiv.innerHTML='time, debug, gravity, ';
		

		createSimpleButton(fileDiv, 'Save',
			() => saveFile(universe.currentNode.getElement('.fileNameInput').value), 'saveButton,');
	}

	return configArea;

	/**
     * @param  {Element} surroundingDiv
     */
	function createNodeDropdown(surroundingDiv) {
		let nodeSelect = document.createElement('select');
		nodeSelect.id = 'nodeType';
		nodeSelect.classList.add('inputcss');
		surroundingDiv.appendChild(nodeSelect);


		createOption(nodeSelect, 'Node');
		createOption(nodeSelect, 'Truss node');
	}

	/**
     * @param  {Element} surroundingDiv
     */
	function createTensorDropdown(surroundingDiv) {
		let nodeSelect = document.createElement('select');
		nodeSelect.id = 'tensorType';
		nodeSelect.classList.add('inputcss');
		surroundingDiv.appendChild(nodeSelect);

		createOption(nodeSelect, 'DampenedSpring');
		createOption(nodeSelect, 'Spring');
		createOption(nodeSelect, 'PullSpring');
		createOption(nodeSelect, 'Absorber');
		createOption(nodeSelect, 'Field');
	}
}
