import { universe } from '../../globals.js';

function getSelectedObject() {
	return universe.selectedObject;
}

function getObjectType(selectedObject) {
	if (!selectedObject) {
		return 'None';
	}
	return selectedObject.isNode ? 'Node' : 'Tensor';
}

function getObjectName(selectedObject) {
	if (!selectedObject) {
		return 'No selection';
	}
	return selectedObject.name || getObjectType(selectedObject);
}

function getKnownLabelNames() {
	if (!universe.currentWorld || !universe.currentWorld.labels) {
		return [];
	}
	return universe.currentWorld.labels.getLabels().map((label) => label.name).sort();
}

function getKnownLabel(labelName) {
	if (!universe.currentWorld || !universe.currentWorld.labels) {
		return undefined;
	}
	return universe.currentWorld.labels.getLabels().find((label) => label.name == labelName);
}

function getExplicitLabelNames(selectedObject) {
	if (!selectedObject || !selectedObject.labelString) {
		return [];
	}
	return selectedObject.labelString.toLowerCase().split(/[\s,]+/).filter((labelName, index, labels) =>
		labelName && labels.indexOf(labelName) == index);
}

function getEffectiveLabelNames(selectedObject) {
	if (!selectedObject || !selectedObject.labels) {
		return [];
	}
	return selectedObject.labels.map((label) => label.name).filter((labelName, index, labels) =>
		labelName && labels.indexOf(labelName) == index);
}

function getInheritedLabelNames(selectedObject) {
	let explicitLabels = getExplicitLabelNames(selectedObject);
	return getEffectiveLabelNames(selectedObject).filter((labelName) => explicitLabels.indexOf(labelName) == -1);
}

function getDependencyLabelNames(labelName) {
	let label = getKnownLabel(labelName);
	let result = [];
	let collect = (dependencies) => {
		if (!dependencies) {
			return;
		}
		for (let dependency of dependencies) {
			if (result.indexOf(dependency.name) == -1) {
				result.push(dependency.name);
				collect(dependency.dependencies);
			}
		}
	};
	if (label) {
		collect(label.dependencies);
	}
	return result;
}

function getConnectionSummary(selectedObject) {
	if (!selectedObject) {
		return '';
	}
	if (selectedObject.isNode) {
		let count = selectedObject.connectedTensors ? selectedObject.connectedTensors.length : 0;
		return count + (count == 1 ? ' connection' : ' connections');
	}
	let endpoints = [];
	if (selectedObject.node1 && selectedObject.node1.name) {
		endpoints.push(selectedObject.node1.name);
	}
	if (selectedObject.node2 && selectedObject.node2.name) {
		endpoints.push(selectedObject.node2.name);
	}
	return endpoints.length ? endpoints.join(' -> ') : 'Tensor connection';
}

function updateDatalist(input, matches) {
	let dataList = input.list;
	if (!dataList) {
		return;
	}
	dataList.innerHTML = '';
	for (let match of matches.slice(0, 12)) {
		let option = document.createElement('option');
		option.value = match;
		dataList.appendChild(option);
	}
}

function getMatches(value) {
	let normalizedValue = value.toLowerCase().trim();
	if (!normalizedValue) {
		return getKnownLabelNames();
	}
	return getKnownLabelNames().filter((labelName) => labelName.indexOf(normalizedValue) == 0);
}

function renderPropertyArea(selectedObject) {
	let configView = universe.currentNode ? universe.currentNode.getElement('#configview') : undefined;
	if (!configView || !selectedObject || !selectedObject.properties) {
		return;
	}
	selectedObject.properties.populateProperties(configView, selectedObject, true);
	applyCurrentPropertyFilter();
}

function applyCurrentPropertyFilter() {
	if (!universe.currentNode) {
		return;
	}
	let filterInput = universe.currentNode.getElement('#bannerPropertyFilter');
	let propertyContainer = filterInput ? filterInput.closest('.banner-inspector-content') : undefined;
	if (!filterInput || !propertyContainer) {
		return;
	}
	let filter = filterInput.value.toLowerCase();
	for (let row of propertyContainer.querySelectorAll('.banner-property-row')) {
		let rowMatches = row.textContent.toLowerCase().indexOf(filter) != -1;
		row.classList.toggle('banner-filter-hidden', !rowMatches);
	}
	for (let section of propertyContainer.querySelectorAll('.banner-property-section')) {
		let rows = Array.from(section.querySelectorAll('.banner-property-row'));
		section.classList.toggle('banner-filter-hidden', rows.length > 0 && !rows.some((row) =>
			!row.classList.contains('banner-filter-hidden')));
	}
}

function commitLabels(selectedObject, labels) {
	selectedObject.labelString = labels.join(' ');
	selectedObject.refreshPropertiesAfterLabelChange();
	renderPropertyArea(selectedObject);
	updateBannerInspectorHeader(selectedObject);
}

function createChip(labelName, selectedObject) {
	let chip = document.createElement('span');
	chip.classList.add('banner-tag-chip');
	chip.textContent = labelName;
	let dependencies = getDependencyLabelNames(labelName);
	chip.title = dependencies.length > 0 ?
		labelName + ' includes: ' + dependencies.join(', ') :
		labelName + ' has no inherited labels';

	let removeButton = document.createElement('button');
	removeButton.type = 'button';
	removeButton.classList.add('banner-tag-remove');
	removeButton.title = 'Remove ' + labelName;
	removeButton.textContent = 'x';
	removeButton.addEventListener('click', () => {
		let labels = getExplicitLabelNames(selectedObject).filter((candidate) => candidate != labelName);
		commitLabels(selectedObject, labels);
	});
	chip.appendChild(removeButton);
	return chip;
}

function createInheritedSummary(selectedObject) {
	let inheritedLabels = getInheritedLabelNames(selectedObject);
	if (inheritedLabels.length == 0) {
		return undefined;
	}
	let inherited = document.createElement('span');
	inherited.classList.add('banner-inherited-labels');
	inherited.textContent = '+' + inheritedLabels.length + ' inherited';
	inherited.title = 'Inherited labels: ' + inheritedLabels.join(', ');
	return inherited;
}

function setInputStatus(input, status, value) {
	let statusElement = universe.currentNode ? universe.currentNode.getElement('#bannerTagStatus') : undefined;
	input.classList.remove('banner-tag-input-warning');
	if (!value) {
		if (statusElement) {
			statusElement.textContent = '';
		}
		return;
	}
	if (status == 'known') {
		if (statusElement) {
			statusElement.textContent = '';
		}
		return;
	}
	input.classList.add('banner-tag-input-warning');
	if (statusElement) {
		statusElement.textContent = 'Unknown tag - Enter to create';
	}
}

function refreshTagInputState(input) {
	let value = input.value.trim().toLowerCase();
	let matches = getMatches(value);
	updateDatalist(input, matches);
	setInputStatus(input, matches.indexOf(value) != -1 ? 'known' : 'unknown', value);
}

function commitInputTag(input) {
	return commitTagName(input, input.value.trim().toLowerCase());
}

function commitTagName(input, tagName) {
	let selectedObject = getSelectedObject();
	if (!selectedObject) {
		return false;
	}
	if (!tagName) {
		return false;
	}
	let labels = getExplicitLabelNames(selectedObject);
	if (labels.indexOf(tagName) == -1) {
		labels.push(tagName);
	}
	input.value = '';
	commitLabels(selectedObject, labels);
	return true;
}

function commitKnownInputValue(input) {
	let value = input.value.trim().toLowerCase();
	if (!value) {
		return false;
	}
	if (getKnownLabelNames().indexOf(value) == -1) {
		return false;
	}
	return commitTagName(input, value);
}

function createTagInput() {
	let wrapper = document.createElement('div');
	wrapper.classList.add('banner-tag-input-row');

	let input = document.createElement('input');
	input.id = 'bannerTagInput';
	input.classList.add('banner-tag-input');
	input.type = 'text';
	input.placeholder = '+ tag';
	input.setAttribute('list', 'bannerTagSuggestions');
	wrapper.appendChild(input);

	let dataList = document.createElement('datalist');
	dataList.id = 'bannerTagSuggestions';
	wrapper.appendChild(dataList);

	let status = document.createElement('span');
	status.id = 'bannerTagStatus';
	status.classList.add('banner-tag-status');
	wrapper.appendChild(status);

	input.addEventListener('input', () => {
		refreshTagInputState(input);
		commitKnownInputValue(input);
	});
	input.addEventListener('focus', () => refreshTagInputState(input));
	input.addEventListener('keydown', (event) => {
		if (event.key == 'Tab') {
			let matches = getMatches(input.value);
			if (matches.length == 1) {
				event.preventDefault();
				commitTagName(input, matches[0]);
			}
		} else if (event.key == 'Enter') {
			event.preventDefault();
			commitInputTag(input);
		} else if (event.key == 'Backspace' && input.value == '') {
			let selectedObject = getSelectedObject();
			let labels = getExplicitLabelNames(selectedObject);
			if (labels.length > 0) {
				labels.pop();
				commitLabels(selectedObject, labels);
			}
		}
	});

	return wrapper;
}

function createBannerTagEditor() {
	let tagRow = document.createElement('div');
	tagRow.classList.add('banner-tag-row');
	tagRow.classList.add('banner-inspector-tag-editor');

	let tagLabel = document.createElement('span');
	tagLabel.classList.add('banner-tag-label');
	tagLabel.textContent = 'tags';
	tagRow.appendChild(tagLabel);

	let chips = document.createElement('div');
	chips.id = 'bannerTagChips';
	chips.classList.add('banner-tag-chips');
	tagRow.appendChild(chips);
	tagRow.appendChild(createTagInput());

	return tagRow;
}

function createBannerInspectorHeader() {
	let header = document.createElement('div');
	header.id = 'bannerInspectorHeader';
	header.classList.add('banner-inspector-header');

	let titleRow = document.createElement('div');
	titleRow.classList.add('banner-inspector-title-row');
	header.appendChild(titleRow);

	let badge = document.createElement('span');
	badge.id = 'bannerObjectTypeBadge';
	badge.classList.add('banner-object-badge');
	badge.textContent = 'None';
	titleRow.appendChild(badge);

	let titleBlock = document.createElement('div');
	titleBlock.classList.add('banner-title-block');
	titleRow.appendChild(titleBlock);

	let objectName = document.createElement('div');
	objectName.id = 'bannerObjectName';
	objectName.classList.add('banner-object-name');
	objectName.textContent = 'No selection';
	titleBlock.appendChild(objectName);

	let meta = document.createElement('div');
	meta.id = 'bannerObjectMeta';
	meta.classList.add('banner-object-meta');
	titleBlock.appendChild(meta);

	return header;
}

function updateBannerInspectorHeader(selectedObject) {
	let header = universe.currentNode ? universe.currentNode.getElement('#bannerInspectorHeader') : undefined;
	if (!header) {
		return;
	}

	let objectType = getObjectType(selectedObject);
	let badge = universe.currentNode.getElement('#bannerObjectTypeBadge');
	if (!badge) {
		return;
	}
	badge.textContent = objectType;
	badge.classList.toggle('banner-object-badge-node', objectType == 'Node');
	badge.classList.toggle('banner-object-badge-tensor', objectType == 'Tensor');

	let nameElement = universe.currentNode.getElement('#bannerObjectName');
	let metaElement = universe.currentNode.getElement('#bannerObjectMeta');
	if (nameElement) {
		nameElement.textContent = getObjectName(selectedObject);
	}
	if (metaElement) {
		metaElement.textContent = getConnectionSummary(selectedObject);
	}

	let chips = universe.currentNode.getElement('#bannerTagChips');
	if (!chips) {
		return;
	}
	chips.innerHTML = '';
	let explicitLabels = getExplicitLabelNames(selectedObject);
	if (explicitLabels.length == 0) {
		let empty = document.createElement('span');
		empty.classList.add('banner-tag-empty');
		empty.textContent = 'No explicit tags';
		chips.appendChild(empty);
	} else {
		for (let labelName of explicitLabels) {
			chips.appendChild(createChip(labelName, selectedObject));
		}
	}
	let inheritedSummary = createInheritedSummary(selectedObject);
	if (inheritedSummary) {
		chips.appendChild(inheritedSummary);
	}

	let input = universe.currentNode.getElement('#bannerTagInput');
	if (!input) {
		return;
	}
	input.disabled = !selectedObject;
	input.value = '';
	refreshTagInputState(input);
}

export {
	createBannerInspectorHeader,
	createBannerTagEditor,
	updateBannerInspectorHeader,
};
