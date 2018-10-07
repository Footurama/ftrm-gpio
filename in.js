const Gpio = require('onoff').Gpio;

function check (opts) {
	if (opts.input.length !== 0) throw new Error('No inputs can be specified');
	if (opts.output.length !== 1) throw new Error('One output must be specified');
	if (typeof opts.gpio !== 'number') throw new Error('gpio must be specified');
	if (opts.watch === undefined) opts.watch = true;
}

function factory (opts, input, output) {
	const gpio = new Gpio(opts.gpio, 'in', 'both');

	// Helper for reading the value
	const read = () => gpio.read((err, value) => {
		if (err) return;
		output[0].value = value !== 0;
	});

	// Publish by interval
	let intervalHandler;
	if (opts.interval) {
		intervalHandler = setInterval(read, opts.interval);
		read();
	}

	// Publish on changes
	if (opts.watch) gpio.watch(read);

	return () => {
		if (intervalHandler) clearInterval(intervalHandler);
		gpio.unexport();
	};
}

module.exports = {check, factory};
