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
		// this.clearProperties();
		for (let i = 0; i < this.list.length; i++) {
			this.list[i].populateProperty(element);
		}
		// this.cleanUpEmpty();
	}
	/**
     */
	clearProperties() {
		for (let i = 0; i < parameterDivs.length; i++) {
			parameterDivs[i].innerHTML = '';
		}
	}

	/**
     */
	cleanUpEmpty() {
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
	/**
     * @param  {Object} selectedObject
     */
	ShowPropertyValues(selectedObject) {
		for (let i = 0; i < this.list.length; i++) {
			this.list[i].showPropertyValue(selectedObject);
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
		this.propertyName = '\''+propertyName+'\'';
		this.identity = idHTML;
		this.title = displayTitle;
		this.type = parameterType;
		this.help = helpText;

		// this.selections = '';
		/* if (displayOrder == ParameterCategory.APPEARANCE) this.element = appearanceDiv;
		else if (displayOrder == ParameterCategory.TRIGGER) this.element = triggerDiv;
		else if (displayOrder == ParameterCategory.EFFECT) this.element = effectDiv;
		else if (displayOrder == ParameterCategory.CONTENT) this.element = contentDiv;
		else if (displayOrder == ParameterCategory.CODE) this.element = codeDiv;
		else this.element = otherDiv;*/
	}

	/**
     * @return {Function}
	 */
	getOnChange() {
		let temp = Object.getOwnPropertyDescriptor(this.worldObject, this.propertyName).set;
		let a = this.worldObject;
		let b = this.propertyName;
		if (!temp) {
			let g = function(x) {
				this.worldObject[this.propertyName]=x;
			};
			return g;
		}
		return temp;
	}

	/* __lookupGetter__ */
	// Object.getOwnPropertyDescriptor(obj, 'MyField').get;

	/* __lookupSetter__ */
	// Object.getOwnPropertyDescriptor(obj, 'MyField').set;

	/**
     * @param {HTMLElement} element
	 */
	populateProperty(element) {
		let display = '';
		/* if ((hideDetails) && (this.getImportance() < 6)) {
			display = ' style="display:none" ';
		}*/
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
		}
		if (this.type == ParameteType.NUMBER) {
			element.innerHTML = element.innerHTML +
                '<div class="parameterEditArea"' + display + ' id="' + this.identity + 'Container">' +
                '<div class="valuepair">' +
                '<div title="' + this.help + '"  class="lname">' + this.title + '</div>' +
                '<div class="rvalue">' +
                '<input class="text" type="text" id="' + this.identity + '" value="30"' +
                ' onblur=""' +
                ' style="width: 140px"' +
                ' oninput="(function (e,x){selectedObject['+this.propertyName+']=x.value;})(event,this)">' +
                '</div>' +
                '</div>' +
                '</div>';
		}
		if (this.type == ParameteType.STRING) {
			element.myDummy=this;
			element.innerHTML = element.innerHTML +
                '<div class="parameterEditArea"' + display + ' id="' + this.identity + 'Container">' +
                '<div class="valuepair">' +
                '<div title="' + this.help + '"  class="lname">' + this.title + '</div>' +
                '<div class="rvalue">' +
                '<input class="text" type="text" id="' + this.identity + '"' +
                ' onblur="" style="width: 140px"'+
                ' oninput="(function (e,x){selectedObject['+this.propertyName+']=x.value;})(event,this)">' +
                '</div>' +
                '</div>' +
                '</div>';
		}
		if (this.type == ParameteType.SELECTION) {
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
		}
		if (this.type == ParameteType.PICTURE) {
			element.innerHTML = element.innerHTML +
                '<div class="parameterEditArea"' + display + ' id="' + this.identity + 'Container">' +
                '<div class="valuepair">' +
                '<div title="' + this.help + '"  class="lname">' + this.title + '</div>' +
                '<div class="rvalue">' +
                '<img id="' + this.identity + '"' +
                ' style="width: 140px; height: 100px; text-align: left;"' +
                ' onclick="setupFileSelectionPanel(\'pictureselect\',' +
                'function(type, filename){ ' +
                //								'alert(type, filename);'+
                'var x=document.getElementById(\'' + this.identity + '\'); ' +
                'x.src=filename;' +
                'x.value=filename;' +
                'x.oninput();})"' +
                ' oninput="' + this.getOnChange() + '">' +
                '</div>' +
                '</div>' +
                '</div>';
		}

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
	ShowPropertyValue(selectedObject) {
		let element = document.getElementById(this.identity);
		if ((element == undefined) || (element == null)) {
			alert('ShowPropertyValue cannot find HTML element ' + this.identity + '. (Title:' + this.title + ')');
		}
		if (this.type == 'Picture') {
			element.src = eval('selectedObject.' + this.getter + '()');
		} else {
			element.value = eval('selectedObject.' + this.getter + '()');
		}

		// UpdateSelectedProperties(selectedObject);
	};
}

// Generic field changes **********************************************
// This is called when the screen has been updated and the selected object should update its internal value
/**
 * @param  {string} elementName
 * @param  {unction} callfunction
 */
function UpdatePropertyValue(elementName, callfunction) {
	if (!selectedObject) {
		alert('No object selected (' + elementName + ')');
		return;
	}
	let element = document.getElementById(elementName);
	let value = element.value;
	// console.log("Value:"+value+".");
	if (!value) {
		// selectedObject=undefined; //This is needed to prevent the entire object from being deleted
		// return 1;
		value = '';
	}
	eval('selectedObject.' + callfunction + '("' + textify(value) + '")');
}

