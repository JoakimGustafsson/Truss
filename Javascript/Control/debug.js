/*jshint esversion:6*/

/*global createSimpleButton debugEntity */

/* This file includes scripts that are designed to simplify debugging debug */


/** This class handles displaying of debug information
 * @class
 */
class Debug {

	constructor(element) {
		if (element) {
			this.debugWindow = new DebugWindow(element, this);
		}
		this.debugCounter=0;
	}

	/**
 * Zoom in on a node such that all the smallest tensor connected to it are shown
 * @param  {node} node
 */
	smallnodezoom(node, halt=1, counter=-1) {
		function mapply(func, dim, ...list) {
			let l =[];
			for(let e of list) {
				l.push(+e[dim]);
			}
			return func(...l);
		}
		let minX = -Infinity;
		let maxX = Infinity;
		let minY = -Infinity;
		let maxY = Infinity;
		let minLength = Infinity;
		let index=0;
		let length=0;
		let defaultTicks=0;

		if (counter>0) {
			console.log('counter: '+counter);
		}

		for(let i=0; i<node.connectedTensors.length; i++) {
			let tensor=node.connectedTensors[i];
			//console.log(i);
			if (tensor.getLength()<minLength) {
				minLength=tensor.getLength();
				index=i;
			}
		}
		console.log('Index: '+index);
		console.log('node x: '+node.localPosition.x+ ' node y: '+node.localPosition.y);
		if (minLength==Infinity) { 
			return 'ERROR: No connectors to that node.'; 
		} else {
			let shortTensor =node.connectedTensors[index];
			let ts=universe.currentNode.timestep;

			minX = mapply(Math.min, 'x',
				shortTensor.node1.localPosition, 
				shortTensor.node2.localPosition, 
				Vector.addVectors(shortTensor.node1.localPosition, 
					Vector.multiplyVector(ts, shortTensor.node1.velocity)),
				Vector.addVectors(shortTensor.node2.localPosition, 
					Vector.multiplyVector(ts, shortTensor.node2.velocity)),
			);
			maxX =mapply(Math.max, 'x',
				shortTensor.node1.localPosition, 
				shortTensor.node2.localPosition, 
				Vector.addVectors(shortTensor.node1.localPosition, 
					Vector.multiplyVector(ts, shortTensor.node1.velocity)),
				Vector.addVectors(shortTensor.node2.localPosition, 
					Vector.multiplyVector(ts, shortTensor.node2.velocity)),
			);
			minY = mapply(Math.min, 'y',
				shortTensor.node1.localPosition, 
				shortTensor.node2.localPosition, 
				Vector.addVectors(shortTensor.node1.localPosition, 
					Vector.multiplyVector(ts, shortTensor.node1.velocity)),
				Vector.addVectors(shortTensor.node2.localPosition, 
					Vector.multiplyVector(ts, shortTensor.node2.velocity)),
			);
			maxY =mapply(Math.max, 'y',
				shortTensor.node1.localPosition, 
				shortTensor.node2.localPosition, 
				Vector.addVectors(shortTensor.node1.localPosition, 
					Vector.multiplyVector(ts, shortTensor.node1.velocity)),
				Vector.addVectors(shortTensor.node2.localPosition, 
					Vector.multiplyVector(ts, shortTensor.node2.velocity)),
			);
			let xlength = maxX-minX;
			let ylength= maxY-minY;
			length = Math.max(xlength, ylength);
			console.log('Length: '+length);
			minX = node.localPosition.x-length*1.1;
			maxX = node.localPosition.x+length*1.1;
			minY = node.localPosition.y-length*1.1;
			maxY = node.localPosition.y+length*1.1;
		
			console.log(minX);
		
			console.log(maxX);
		
			console.log(minY);
		
			console.log(maxY);
		}
		universe.currentNode.view.setOffset( new Vector(minX, minY)) ;
		universe.currentNode.view.setWorldViewSize( new Vector(length*4.2, length*4.2));
		if (halt && !universe.currentNode.isPaused()) {
			this.togglepause();
		}
		universe.select(node);
	}

	/**
 * Zoom in on a node cluster using all tensors tagged by the label 
 * @param  {node} node
 * @param  {label} label
 */
	//function smallnodezoom(node, label) {
	//}

	/**
 * toggles if the force driven movements should halt (toggle)
 * @param  {TrussNode} node
 */
	togglepause(node) {
		if (!node) {
			node=universe.currentNode;
		}
		node.togglePause();
	}



	getnamednode(name) {
		for(let node of universe.currentWorld.labels.findLabel('node').nodes) {
		//console.log(node.name);
			if (name==node.name) {
				return node;
			}
		}
	}

	// This function runs a number of ticks and does not clear the screen completely
	// The intention is to see what happens over very small time intervals
	// Use clearLevel() to (re)set the screen clearing 
	// Use tick(-1) to restart normal movement
	tick(number=this.defaultTicks, clearLevel=-1) {
		if (number==-1) {
			universe.currentNode.view.clearLevel=1;
			universe.currentNode.togglePause();
			return;
		}
		universe.currentNode.togglePause();
		if (clearLevel>0){
			universe.currentNode.view.clearLevel=clearLevel;
		}
		//universe.debugHaltTicks=number;
		universe.debugHaltFunction = (counter) => {
			if (counter==number) {
				universe.currentNode.view.clearLevel=0;
				universe.currentNode.togglePause();
				return 0;
			}
			return counter+1;
		};
	}

	// decides how much to wipe the screen each tick
	// 1 -> full clear (normal, default behaviour)
	// 0 -> no clear 
	clearLevel(cl=1) {
		universe.currentNode.view.clearLevel=cl;
	}


	breakAt(node, property, value, iteration) {
		if (node[property]==value ) {
			this.debugCounter++;
			if (this.debugCounter==iteration){
				this.smallnodezoom(node,1,this.debugCounter);
			}
		}
	}


}



/** This class handles displaying of debug information
 * @class
 */
class DebugWindow {
	/**
	 */
	constructor(element, controller) {
		let debugDiv = document.createElement('div');
		element.appendChild(debugDiv);
		this.debugDiv = debugDiv;
		debugDiv.id='debug';
		debugDiv.position='absolute';
		debugDiv.left='10px';
		debugDiv.top='10px';
		debugDiv.classList.add('configareainner');
		debugDiv.style.width='100px';
		debugDiv.style.fontSize='xx-small';

		let tabArea = document.createElement('div');
		tabArea.classList.add('tab');
		debugDiv.appendChild(tabArea);

		let stepButton = document.createElement('button');
		stepButton.id = 'stepButton';
		stepButton.classList.add('tabsectionbuttons');
		stepButton.innerHTML = 'Debug';
		stepButton.addEventListener('click', function() {}, false);
		tabArea.appendChild(stepButton);



		let propertyArea = document.createElement('div');
		propertyArea.id = 'propertiesDiv';
		//propertyArea.classList.add('footerbackgroundarea');
		//propertyArea.classList.add('tabcontent');
		propertyArea.display = 'block';
		debugDiv.appendChild(propertyArea);

		{

			let propertyContainer = document.createElement('div');
			propertyContainer.classList.add('sectionbase');
			propertyContainer.display = 'block';
			propertyArea.appendChild(propertyContainer);

			//this.timeField = this.makeViewOfInputField(this.createNameValuePair(propertyContainer,'Time'));
	
			this.timeField = new EditValueAssociation(propertyContainer, 'Time', 
				() => {return universe.timeStamp;},
				() => {});
			//this.makeViewOfInputField(this.createNameValuePair(propertyContainer,'Selected'));

			this.debugCounter= new EditValueAssociation(propertyContainer, 'Counter', 
				() => {return debugEntity.debugCounter;},
				(x) => {debugEntity.debugCounter = x;});
			//this.makeViewOfInputField(this.createNameValuePair(propertyContainer,'Counter'));

			createSimpleButton(propertyContainer, 'Toggle', () => controller.togglepause());

			
			this.ticks= new EditValueAssociation(propertyContainer, 'Ticks', 
				() => {return debugEntity.defaultTicks;},
				(x) => {debugEntity.defaultTicks = x;});
			createSimpleButton(propertyContainer, 'Tick', () => controller.tick());
			createSimpleButton(propertyContainer, 'Center', () => {
				if (universe.selectedObject) {
					debugEntity.smallnodezoom(universe.selectedObject);
				}});

			this.shade= new EditValueAssociation(propertyContainer, 'Shade', 
				() => {return universe.currentNode.view.clearLevel;},
				(x) => {universe.currentNode.view.clearLevel = x;});
			//this.shadeLevel = this.makeViewOfInputField(this.createNameValuePair(propertyContainer,'Shade level'));
			createSimpleButton(propertyContainer, 'Shade', () => {if (universe.currentNode.view.clearLevel==1)
			{universe.currentNode.view.clearLevel=0.1;} else
			{universe.currentNode.view.clearLevel=1;}});

		}

	}

	toggleDisplay() {
		if (this.debugDiv.style.display == 'none') {
			this.debugDiv.style.display = 'block';} else {
			this.debugDiv.style.display = 'none';} 
	}

}

class EditValueAssociation {
	constructor(parentElement, text, getter, setter) {
		let valuePlace = this.createNameValuePair(parentElement,text);
		this.inputField = this.makeViewOfInputField(valuePlace);
		this.getter=getter;
		this.setter=setter;

		let storeFunction = (e) => {
			e = e || window.event;
			var elem = e.srcElement || e.target;
			this.setter(elem.value);
			if(e.keyCode == 13) {
				elem.blur();
			}
		};

		let onBlurFunction = () => {
			this.setter(this.inputField.value);
		};

		//this.inputField.onkeydown = storeFunction;
		this.inputField.onkeydown = storeFunction;
		this.inputField.onblur = onBlurFunction;


		Object.defineProperty(this, 'value', {
			get: function() {
				return this.getter();
			},
		});
	}

	refresh() {
		if (document.activeElement!=this.inputField) {
			this.inputField.value = this.value;
		}
	}
	
	createNameValuePair(element, title) {
		let outerDiv = document.createElement('div');
		//outerDiv.id = this.identity + 'Container';
		// outerDiv.style.position='absolute';
		outerDiv.classList.add('parameterEditArea');
		element.appendChild(outerDiv);
		let valuePair = document.createElement('div');
		valuePair.classList.add('valuepair');
		outerDiv.appendChild(valuePair);
		let parameterName = document.createElement('div');
		parameterName.classList.add('lname');
		parameterName.classList.add('noselect');
		//parameterName.title = this.help;
		parameterName.innerHTML = title;
		valuePair.appendChild(parameterName);
		let parameterValue = document.createElement('div');
		parameterValue.classList.add('rvalue');
		valuePair.appendChild(parameterValue);
		return parameterValue;
	}

	/** Creates the default value editing area. This does not handle any input (see makeinputField)
	 * @param  {String} id
	 * @param  {Element} parameterValue
	 * @return {Element}
	 */
	makeViewOfInputField(parameterValue) {
		let inputField = document.createElement('input');
		inputField.type = 'text';
		inputField.value = 'Default';
		inputField.classList.add('text');
		inputField.classList.add('inputcss');
		inputField.classList.add('lname');
		inputField.style.width = '58px';
		inputField.style.fontSize = 'xx-small';
		parameterValue.appendChild(inputField);
		return inputField;
	}
}