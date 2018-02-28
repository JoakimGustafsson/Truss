/* function setupFileSelectionPanel(type,callback){
    openBottomPanel(0, 'resourceDiv', callback);
    openBottomSubPanel(0, type);
    //selectFileFunction(callback);
}*/

let ParameterCategory = {
	APPEARANCE: 1,
	TRIGGER: 2,
	EFFECT: 3,
	CONTENT: 4,
};

let ParameteType = {
	STRING: 1,
	NUMBER: 2,
	SELECTION: 3,
	PICTURE: 4,
	POSITION: 5,
};


/**
 * @class
 */
class PropertyList {
	/**
	 */
	constructor() {
		this.list = [];
	}

	/**
	 * @param  {Property} prop
	 */
	addProperty(prop) {
		this.list.push(prop);
	}

	/**
	 * @return {Array}
	 */
	getProperties() {
		return this.list;
	}

	/**
	 * @param  {element} element
	 */
	populateProperties(element) {
		for (let i = 0; i < this.list.length; i++) {
			this.list[i].populateProperty(element);
		}
	}


	/**
	 */
	XXcleanUpEmpty() {
		/**
		 * @param  {Element} element
		 * @return {Number}
		 */
		function isVisible(element) {
			let display;
			for (let j = 0; j < element.children.length; j++) {
				display = element.children[j].style.display;
				if (display != 'none') {
					return true;
				}
			}
			return false;
		}

		for (let i = 0; i < parameterDivs.length; i++) {
			if (isVisible(parameterDivs[i])) {
				parameterDivs[i].parentElement.style.display = 'block';
			} else {
				parameterDivs[i].parentElement.style.display = 'none';
			}
		}
	}

	/** Loop through all properties and display the values from the inputObject
	 * @param  {Object} inputObject
	 */
	showPropertyValues(inputObject) {
		for (let i = 0; i < this.list.length; i++) {
			this.list[i].showPropertyValue(inputObject);
		}
	}
}

/*
// This handles the large text editing window used for script editing or large texts
var globalTextEditorSource;
showTextEditWindow = function(textIdentity) {
	globalTextEditorSource = textIdentity;
	let textEditDiv = document.getElementById('textEditDiv');
	let textEditArea = document.getElementById('textEditArea');
	let backgroundFilter = document.getElementById('backgroundFilter');
	backgroundFilter.style.display = 'block';
	textEditDiv.style.display = 'block';
	textEditArea.value = textIdentity.value;
};

editComplete = function() {
	let textEditDiv = document.getElementById('textEditDiv');
	let textEditArea = document.getElementById('textEditArea');
	let backgroundFilter = document.getElementById('backgroundFilter');
	globalTextEditorSource.value = textEditArea.value;
	globalTextEditorSource.oninput();
	backgroundFilter.style.display = 'none';
	textEditDiv.style.display = 'none';
};
*/


/**
 * @class Property
 */
class Property {
	/**
	 * @param  {Object} worldObject
	 * @param  {string} propertyName
	 * @param  {string} idHTML
	 * @param  {string} displayTitle
	 * @param  {ParameteType} parameterType
	 * @param  {parameterCategory} parameterCategory
	 * @param  {string} helpText
	 */
	constructor(worldObject, propertyName, idHTML, displayTitle, parameterType, parameterCategory, helpText) {
		this.worldObject = worldObject;
		this.propertyName = propertyName;
		this.identity = 'editWindowTruss' + idHTML;
		this.title = displayTitle;
		this.type = parameterType;
		this.help = helpText;
		this.HTMLElement = undefined;

		// this.selections = '';
		/* if (displayOrder == ParameterCategory.APPEARANCE) this.element = appearanceDiv;
		else if (displayOrder == ParameterCategory.TRIGGER) this.element = triggerDiv;
		else if (displayOrder == ParameterCategory.EFFECT) this.element = effectDiv;
		else if (displayOrder == ParameterCategory.CONTENT) this.element = contentDiv;
		else if (displayOrder == ParameterCategory.CODE) this.element = codeDiv;
		else this.element = otherDiv;*/
	}


	/**
	 * @param {HTMLElement} element
	 */
	populateProperty(element) {
		let display = '';
		/* if ((hideDetails) && (this.getImportance() < 6)) {
			display = ' style="display:none" ';

		if (this.type == ParameteType.LONGSTRING) {
			element.innerHTML = element.innerHTML +
                '<div  class="parameterEditArea"' + display + ' id="' + this.identity + 'Container">' +
                '<div class="valuepair">' +
                '<div title="' + this.help + '" class="lname">' + this.title + '</div>' +
                '<div class="rvalue">' +
                '<textarea class="text" id="' + this.identity + '" cols=20 rows=1' +
                ' onclick="showTextEditWindow(' + this.identity + ')"' +
                ' onblur=""' +
                ' style="width: 140px; text-align: left;"' +
                ' oninput="(function (e,x){selectedObject['+this.propertyName+']=x.value;})(event,this)">' +
                '</textarea>' +
                '</div>' +
                '</div>' +
                '</div>';
		}}*/
		if (this.type == ParameteType.NUMBER) {
			element.innerHTML = element.innerHTML +
				'<div class="parameterEditArea"' + display + ' id="' + this.identity + 'Container">' +
				'<div class="valuepair">' +
				'<div title="' + this.help + '"  class="lname">' + this.title + '</div>' +
				'<div class="rvalue">' +
				'<input class="text" type="text" id="' + this.identity + '" value="30"' +
				' onblur=""' +
				' style="width: 140px"' +
				' oninput="(function (e,x){selectedObject[\'' + this.propertyName + '\']=x.value;})(event,this)">' +
				'</div>' +
				'</div>' +
				'</div>';
		}
		if (this.type == ParameteType.STRING) {
			element.myDummy = this;
			element.innerHTML = element.innerHTML +
				'<div class="parameterEditArea"' + display + ' id="' + this.identity + 'Container">' +
				'<div class="valuepair">' +
				'<div title="' + this.help + '"  class="lname">' + this.title + '</div>' +
				'<div class="rvalue">' +
				'<input class="text" type="text" id="' + this.identity + '"' +
				' onblur="" style="width: 140px"' +
				' oninput="(function (e,x){selectedObject[\'' + this.propertyName + '\']=x.value;})(event,this)">' +
				'</div>' +
				'</div>' +
				'</div>';
		}
		/* if (this.type == ParameteType.SELECTION) {
			let makeSmall = '';
			if (this.selections.length > 5) makeSmall = ' style="font-size: 16px;" ';
			element.innerHTML = element.innerHTML +
                '<div class="parameterEditArea"' + display + ' id="' + this.identity + 'Container">' +
                '<div class="valuepair">' +
                '<div title="' + this.help + '"  class="lname">' + this.title + '</div>' +
                '<div class="rvalue">' +
                '<select id="' + this.identity + '" oninput="' + this.getOnChange() + '"' +
                ' onblur="' + this.getOnChange() + '" ' + makeSmall + '>' +
                this.generateOptions(this.selections) +
                '</select>' +
                '</div>' +
                '</div>' +
                '</div>';
		}*/
		if (this.type == ParameteType.POSITION) {
			element.innerHTML = element.innerHTML +
				'<div class="parameterEditArea"' + display +
				'style="overflow: auto;" id="' + this.identity + 'Container">' +
				'<div class="valuepair" style="float:left; width:33%">' +
				'<div class="lname">X</div>' +
				'<div class="rvalue" >' +
				'<input class="text" type="text" id="' + this.identity + 'X" value="30"' +
				' onblur="" style="width: 60px"' +
				' oninput="(function (e,z){selectedObject[\'' + this.propertyName + '\'].x=parseInt(z.value,0);})(event,this)">' +
				'</div>' +
				'</div>' +
				'<div class="valuepair" style="float:right;width:33%">' +
				'<div class="lname">Y</div>' +
				'<div class="rvalue">' +
				'<input class="text" type="text" id="' + this.identity + 'Y" value="30"' +
				' onblur="" style="width: 60px"' +
				' oninput="(function (e,z){selectedObject[\'' + this.propertyName + '\'].y=parseInt(z.value,0);})(event,this)">' +
				'</div>' +
				'</div>' +
				'</div>';
		}

		// this.HTMLElement=document.getElementById(this.identity);

		/*
		if (this.type == 'Audio' || this.type == 'Video') {
			let selectionType;
			if (this.type == 'Video') {
				selectionType = 'videoselect';
			} else {
				selectionType = 'audioselect';
			}
			elem.innerHTML = elem.innerHTML +
                '<divclass="parameterEditArea"' + display + ' id="' + this.getIdentity() + 'Container">' +
                '<div class="valuepair">' +
                '<div title="' + this.help + '" class="lname">' + this.title + '</div>' +
                '<div class="rvalue">' +
                '<input class="text" type="text" id="' + this.getIdentity() + '" value=""' +
                ' style="text-align: right; width:140px;"' +
                ' onclick="setupFileSelectionPanel(\'' + selectionType + '\',' +
                'function(type, filename ){ ' +
                'var x=document.getElementById(\'' + this.getIdentity() + '\'); ' +
                'x.value=simplifyPath(filename);' +
                'x.oninput();})"' +
                ' oninput="' + this.getOnChange() + '">' +
                '</div>' +
                '</div>' +
                '</div>';
		}*/
	};

	/**
	 * @param {Array} list
	 * @return {string}
	 */
	generateOptions(list) {
		let res = '';
		for (let i = 0; i < list.length; i++) {
			if (!list[i][2] || userLevel != 'basic') {
				res += ' <option value="' + list[i][0] + '">' + list[i][1] + '</option>';
			}
		}
		return res;
	}

	// This is called when the screen should be updated by a value change in an object
	/**
	 * @param  {Object} selectedObject
	 */
	showPropertyValue(selectedObject) {
		if (this.type == ParameteType.POSITION) {
			let elementX = document.getElementById(this.identity + 'X');
			let elementY = document.getElementById(this.identity + 'Y');
			if ((elementX == undefined) || (elementX == null)) {
				alert('ShowPropertyValue cannot find HTML element ' + this.identity + 'X & Y. (Title:' + this.title + ')');
				return;
			} else {
				elementX.value = Math.round(100 * selectedObject[this.propertyName].x) / 100;
				elementY.value = Math.round(100 * selectedObject[this.propertyName].y) / 100;
			}
		} else {
			let element = document.getElementById(this.identity);
			if ((element == undefined) || (element == null)) {
				alert('ShowPropertyValue cannot find HTML element ' + this.identity + '. (Title:' + this.title + ')');
				return;
			}
			element.value = selectedObject[this.propertyName];
		}
	};
}

/**
 *
 *
 * @class
 * @augments SensorNode
 */
class HTMLEditNode extends SensorNode {
	/** This node is used to ensure that the property editing window 'element' is updated with the selected
	 * objects real time property values.
	 * @constructor
	 * @param {Node} obj - The node that this node should influence, often the protagonist node
	 * @param {Element} element - The HTML element that should display the edit area
	 * @param {string} name - The name of the node.
	 */
	constructor(obj, element, name = 'HTMLEditNode') {
		super(new Position(0, 0), NaN, name);
		this.element=element;
		let _this = this;

		document.addEventListener('selectionEvent',
			function(e) {
				_this.select.call(_this, e);
			}, false);
	}

	/**
	 * @param  {Event} selectionEvent
	 */
	select(selectionEvent) {
		this.iO = selectionEvent.detail.selectedObject;
		let previousSelectedObject = selectionEvent.detail.previousSelectedObject;

		this.element.innerHTML='';
		if (this.iO) {
			this.iO.properties.populateProperties(this.element);
		}
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname='HTMLEditNode';
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {HTMLEditNode}
	 */
	deserialize(restoreObject, nodeList, tensorList) {
		super.deserialize(restoreObject, nodeList, tensorList);
		return this;
	}

	/**
	 * Use sense in order to make pause work
	 * @param {number} deltaTime
	 * @param {Truss} truss
	 */
	sense(deltaTime, truss) {
		// super.updatePosition(time, deltaTime);
		if (this.iO) {
			this.iO.properties.showPropertyValues(this.iO);
		}
	}
}

/**
 * @class
 */
class EditPropertyWindow {
	/**
	 * @param  {TrussNode} trussNode
	 * @param  {Position} topScreenPos
	 * @param  {number} screenWidth
	 * @param  {number} screenHeight
	 */
	constructor(trussNode, topScreenPos, screenWidth, screenHeight) {
		// let truss = trussNode.truss;
		let elem = document.getElementById('configarea');
		let editarea = document.getElementById('configview');
		// this.truss=truss;
		this.banner = new BannerNode(elem);
		this.valueToGUI = new HTMLEditNode(undefined, editarea);
		let _this = this;

		document.addEventListener('selectionEvent',
			function(e) {
				_this.select.call(_this, e);
			}, false);
	}

	/**
	 * @param  {Event} selectionEvent
	 */
	select(selectionEvent) {
		let selectedObject = selectionEvent.detail.selectedObject;
		let previousSelectedObject = selectionEvent.detail.previousSelectedObject;
		let truss = selectionEvent.detail.truss;
		if (!previousSelectedObject && selectedObject) {
			this.createBanner(truss);
		} else if (previousSelectedObject && !selectedObject) {
			this.removeBanner(truss);
		}
	}

	/**
	 * @param  {Truss} truss
	 */
	createBanner(truss) {
		this.banner.create(truss, new Position(600, 100));
		truss.addNode(this.banner);
		truss.addNode(this.valueToGUI);
	}

	/**
	 * @param  {Truss} truss
	 */
	removeBanner(truss) {
		this.banner.hide();
		// this.hammer.hide(truss);
		truss.removeNode(this.banner);
		truss.removeNode(this.valueToGUI);
	}
}

