const EventEmitter = require('events');

jest.mock('onoff');
const mockOnoff = require('onoff');

const OUT = require('../out.js');

describe('check', () => {
	test('expect zero outputs', () => {
		try {
			OUT.check({
				input: [ {} ],
				output: [ {} ],
				gpio: 1
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('No outputs can be specified');
		}
	});

	test('expect one input', () => {
		try {
			OUT.check({
				input: [],
				output: [],
				gpio: 1
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('One input must be specified');
		}
	});

	test('expect gpio', () => {
		try {
			OUT.check({
				input: [{}],
				output: []
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('gpio must be specified');
		}
	});

	test('set default output to false', () => {
		const opts = {
			input: [{}],
			output: [],
			gpio: 1
		};
		OUT.check(opts);
		expect(opts.default).toBe(false);
	});
});

describe('factory', () => {
	test('create Gpio instance', () => {
		const gpio = 34;
		OUT.factory({gpio}, [new EventEmitter()]);
		expect(mockOnoff.Gpio.mock.calls[0][0]).toBe(gpio);
		expect(mockOnoff.Gpio.mock.calls[0][1]).toEqual('out');
	});

	test('write default on start', () => {
		OUT.factory({default: true}, [new EventEmitter()]);
		expect(mockOnoff.Gpio.prototype.write.mock.calls[0][0]).toBe(1);
	});

	test('invert high and low level', () => {
		OUT.factory({default: true, invert: true}, [new EventEmitter()]);
		expect(mockOnoff.Gpio.prototype.write.mock.calls[0][0]).toBe(0);
	});

	test('write output on update event', () => {
		const input = new EventEmitter();
		OUT.factory({}, [input]);
		input.emit('update', true);
		expect(mockOnoff.Gpio.prototype.write.mock.calls[1][0]).toBe(1);
	});

	test('write default on expire event', () => {
		const input = new EventEmitter();
		OUT.factory({}, [input]);
		input.emit('update', true);
		expect(mockOnoff.Gpio.prototype.write.mock.calls[1][0]).toBe(1);
	});

	test('unexport on exit', () => {
		const exit = OUT.factory({}, [new EventEmitter()]);
		exit();
		expect(mockOnoff.Gpio.prototype.unexport.mock.calls.length).toBe(1);
	});
});
