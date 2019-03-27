/* global control */
function getlabel(label) {
	return universe.currentWorld.labels.findLabel(label);
}

/**
 * @param  {Element} backgroundDiv
 * @param  {String} text
 * @param  {String} value
 */
function createOption(backgroundDiv, text, value) {
	let optionDebug = document.createElement('option');
	if (value) {
		optionDebug.value = value;
	} else {
		optionDebug.value = text;
	}
	optionDebug.innerHTML = text;
	backgroundDiv.appendChild(optionDebug);
}

/**
 * @param  {Element} parentElement
 */
function createDebugDropdown(parentElement) {
	let debugLevelSelect = document.createElement('select');
	debugLevelSelect.id = 'debugLevel';
	debugLevelSelect.classList.add('inputcss');
	debugLevelSelect.addEventListener('change', function () {
		control.changeDebugLevel();
	}, false);
	parentElement.appendChild(debugLevelSelect);

	createOption(debugLevelSelect, 'Debug level', '1');
	createOption(debugLevelSelect, 'Nothing', '0');
	createOption(debugLevelSelect, 'Only web parts', '1');
	createOption(debugLevelSelect, 'Only lines', '2');
	createOption(debugLevelSelect, 'Only nodes', '3');
	createOption(debugLevelSelect, 'Lines and Nodes', '5');
	createOption(debugLevelSelect, 'Add speeds', '6');
	createOption(debugLevelSelect, 'Add acceleration', '7');
	createOption(debugLevelSelect, 'Add numbers', '10');
}

/**
 * @param {Element} parentElement
 */
function setupFooter(parentElement) {
	createDebugDropdown(parentElement);
	createSimpleButton(parentElement, 'FastEdit',
		function () {
			universe.currentWorld.fastEdit = !universe.currentWorld.fastEdit;
			if (universe.currentWorld.fastEdit) {
				this.classList.add('activebutton');
			} else {
				this.classList.remove('activebutton');
			}
		});
}


/**
 * @param  {Element} backgroundDiv
 * @param  {String} text
 * @param  {Function} f
 * @param  {String} id
 * @return {Button}
 */
function createSimpleButton(backgroundDiv, text, f, id) {
	let newButton = document.createElement('button');
	newButton.classList.add('simpleButton');
	newButton.classList.add('noselect');
	if (id) {
		newButton.id = id;
	}
	newButton.innerHTML = text;
	backgroundDiv.appendChild(newButton);
	newButton.addEventListener('click', f, false);
	return newButton;
}