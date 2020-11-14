const pkgInfo = require('./package.json');
const fileName = __filename.slice(__dirname.length + 1, -3);
const name = `${pkgInfo.name}/${fileName}`;
const url = pkgInfo.homepage;

const {EventEmitter} = require('events');
const Gpio = require('onoff').Gpio;

function check (opts) {
	if (opts.output.length !== 1) throw new Error('One output must be specified');
	if (opts.toggleEdge === undefined) opts.toggleEdge = 'falling';
	if (opts.onEdge === undefined) opts.onEdge = 'falling';
	if (opts.offEdge === undefined) opts.offEdge = 'falling';
	if (opts.toggleDebounce === undefined) opts.toggleDebounce = 10;
	if (opts.onDebounce === undefined) opts.onDebounce = 10;
	if (opts.offDebounce === undefined) opts.offDebounce = 10;
	if (opts.default === undefined) opts.default = false;
}

class Bool extends EventEmitter {
	set (newBool) {
		if (typeof newBool !== 'boolean') return;
		const oldBool = this._value;
		this._value = newBool;
		if (newBool !== oldBool) this.emit('change', newBool);
	}
	get () {
		return this._value;
	}
}

function factory (opts, input, output) {
	const onState = new Bool();
	const exportedGpios = [];

	// Wire up soruces:
	// - input pipe
	if (input[0]) input[0].on('update', (value) => {
		 onState.set(value);
	});
	// - toggle button
	if (opts.toggleGpio !== undefined) {
		const toggleGpio = new Gpio(
			opts.toggleGpio,
			'in',
			opts.toggleEdge,
			{debounceTimeout: opts.toggleDebounce}
		);
		toggleGpio.watch(() => onState.set(!onState.get()));
		exportedGpios.push(toggleGpio);
	}
	// - on button
	if (opts.onGpio !== undefined) {
		const onGpio = new Gpio(
			opts.onGpio,
			'in',
			opts.onEdge,
			{debounceTimeout: opts.onDebounce}
		);
		onGpio.watch(() => onState.set(true));
		exportedGpios.push(onGpio);
	}
	// - off button
	if (opts.offGpio !== undefined) {
		const offGpio = new Gpio(
			opts.offGpio,
			'in',
			opts.offEdge,
			{debounceTimeout: opts.offDebounce}
		);
		offGpio.watch(() => onState.set(false));
		exportedGpios.push(offGpio);
	}

	// Wire up sinks:
	// - output pipe
	onState.on('change', (on) => {
		output[0].value = on;
	});
	// - LED
	if (opts.ledGpio) {
		const ledGpio = new Gpio(opts.ledGpio, 'out');
		onState.on('change', (on) => {
			if (opts.ledInvert) on = !on;
			ledGpio.writeSync(on ? 1 : 0);
		});
		exportedGpios.push(ledGpio);
	}

	// Set default
	onState.set(opts.default);

	return () => exportedGpios.forEach((gpio) => gpio.unexport());
}

module.exports = {name, url, check, factory};
