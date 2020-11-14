jest.mock('onoff');
const mockOnoff = require('onoff');

jest.useFakeTimers();
afterEach(() => jest.clearAllTimers());

const IN = require('../in.js');

describe('check', () => {
	test('expect zero inputs', () => {
		try {
			IN.check({
				input: [ {} ],
				output: [ {} ],
				gpio: 123
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('No inputs can be specified');
		}
	});

	test('expect one output', () => {
		try {
			IN.check({
				input: [],
				output: [],
				gpio: 123
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('One output must be specified');
		}
	});

	test('expect gpio', () => {
		try {
			IN.check({
				input: [],
				output: [ {} ]
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('gpio must be specified');
		}
	});

	test('default watch to true', () => {
		const opts = {
			input: [],
			output: [ {} ],
			gpio: 1
		};
		IN.check(opts);
		expect(opts.watch).toBe(true);
	});
});

describe('factory', () => {
	test('create Gpio instance', () => {
		const gpio = 34;
		IN.factory({gpio});
		expect(mockOnoff.Gpio.mock.calls[0][0]).toBe(gpio);
		expect(mockOnoff.Gpio.mock.calls[0][1]).toEqual('in');
		expect(mockOnoff.Gpio.mock.calls[0][2]).toEqual('both');
	});

	test('read value on change', () => {
		const value = true;
		const output = {};
		IN.factory({gpio: 2, watch: true}, [], [output]);
		const gpio = mockOnoff.Gpio.mock.instances[0];
		gpio.read.mockImplementationOnce((cb) => cb(null, value ? 1 : 0));
		gpio.watch.mock.calls[0][0]();
		expect(output.value).toBe(value);
	});

	test('invert values', () => {
		const invert = true;
		const value = true;
		const output = {};
		IN.factory({gpio: 2, watch: true, invert}, [], [output]);
		const gpio = mockOnoff.Gpio.mock.instances[0];
		gpio.read.mockImplementationOnce((cb) => cb(null, value ? 0 : 1));
		gpio.watch.mock.calls[0][0]();
		expect(output.value).toBe(value);
	});

	test('ignore errors', () => {
		const output = {};
		IN.factory({gpio: 2, watch: true}, [], [output]);
		const gpio = mockOnoff.Gpio.mock.instances[0];
		gpio.read.mockImplementationOnce((cb) => cb(new Error()));
		gpio.watch.mock.calls[0][0]();
		expect(output.value).toBe(undefined);
	});

	test('read value by time interval', () => {
		const value = true;
		const interval = 123;
		const output = {};
		IN.factory({gpio: 2, interval}, [], [output]);
		const gpio = mockOnoff.Gpio.mock.instances[0];
		gpio.read.mockImplementationOnce((cb) => cb(null, value ? 1 : 0));
		expect(gpio.read.mock.calls.length).toBe(1);
		expect(output.value).toBe(value);
		jest.advanceTimersByTime(interval);
		expect(gpio.read.mock.calls.length).toBe(2);
	});

	test('unexport on exit', () => {
		const interval = 123;
		const exit = IN.factory({gpio: 2, interval}, [], [{}]);
		const gpio = mockOnoff.Gpio.mock.instances[0];
		expect(gpio.read.mock.calls.length).toBe(1);
		jest.advanceTimersByTime(interval);
		expect(gpio.read.mock.calls.length).toBe(2);
		exit();
		jest.advanceTimersByTime(interval);
		expect(gpio.read.mock.calls.length).toBe(2);
		expect(gpio.unexport.mock.calls.length).toBe(1);
	});
});
