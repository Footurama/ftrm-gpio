const pkgInfo = require('./package.json');
const fileName = __filename.slice(__dirname.length + 1, -3);
const name = `${pkgInfo.name}/${fileName}`;
const url = pkgInfo.homepage;

const Gpio = require('onoff').Gpio;

function check (opts) {
	if (opts.input.length !== 1) throw new Error('One input must be specified');
	if (opts.output.length !== 0) throw new Error('No outputs can be specified');
	if (typeof opts.gpio !== 'number') throw new Error('gpio must be specified');
	if (opts.default === undefined) opts.default = false;
}

function factory (opts, input, output) {
	const gpio = new Gpio(opts.gpio, 'out');

	// Helper for writing to GPIO
	const write = (value) => {
		if (opts.invert) value = !value;
		gpio.writeSync(value ? 1 : 0);
	};

	// Write default on start
	write(opts.default);

	// Listen to input events
	input[0].on('update', (value) => write(value));
	input[0].on('expire', () => write(opts.default));

	return () => {
		write(opts.default);
		gpio.unexport();
	};
}

module.exports = {name, url, check, factory};
