'use strict';

const Store = require('store-prototype');
const xhr = require('xhr');
const constants = require('../../constants');
const stepSocket = new WebSocket("ws://localhost:3000/step");
const StepStore = new Store();

let _currentStep = 0;
let _availableSteps = 1;
let _totalSteps = constants.TOTAL_STEPS;
let _direction = 'next';

StepStore.extend({
	getState () {
		return {
			currentStep: _currentStep,
			availableSteps: _availableSteps,
			totalSteps: _totalSteps,
      direction: _direction,
		};
	},
	next () {
		_currentStep = Math.min(_currentStep + 1, _availableSteps);
    _direction = 'next';
		this.notifyChange();
	},
	prev () {
		_currentStep = Math.max(_currentStep - 1, 0);
    _direction = 'prev';
		this.notifyChange();
	},
	update () {
		stepSocket.onmessage = function (event) {
			var data = event.data;
		  try {
				data = JSON.parse(data);
				console.log(data);
				const newStep = data.availableSteps || 1;
				this.setCurrentStep(newStep);
			} catch(e) {
				console.error('Error: unable to load status data from the API', err, response);
			}
		}
	},
	setCurrentStep (step) {
		let changed = false;
		if (step !== _availableSteps) {
			_availableSteps = step;
			changed = true;
		}
		if (_currentStep > _availableSteps) {
			_currentStep = _availableSteps;
      _direction = 'prev';
			changed = true;
		}
		if (changed) {
			this.notifyChange();
		}
	},
});

StepStore.update();

module.exports = StepStore;
