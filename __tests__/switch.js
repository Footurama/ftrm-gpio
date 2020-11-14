const {EventEmitter} = require('events');

jest.mock('onoff');
const mockOnoff = require('onoff');

const {check, factory} = require('../switch.js');

describe('check', () => {
	test('expect one output pipe', () => {
		expect(() => check({
			input: [],
			output: []
		})).toThrow('One output must be specified');
	});
	test('set defaults', () => {
		const opts = {
			input: [],
			output: ['foo']
		};
		check(opts);
		expect(opts).toMatchObject({
			toggleEdge: 'falling',
			toggleDebounce: 10,
			onEdge: 'falling',
			onDebounce: 10,
			offEdge: 'falling',
			offDebounce: 10
		});
	});
});

describe('factory', () => {
	test('set default', () => {
		const opts = {default: true};
		const o = {};
		factory(opts, [], [o]);
		expect(o.value).toBe(opts.default);
	});

	test('source: input pipe', () => {
		const i = new EventEmitter();
		const o = {};
		factory({}, [i], [o]);
		i.emit('update', 123);
		expect(o.value).toBeUndefined();
		i.emit('update', true);
		expect(o.value).toBe(true);
		i.emit('update', false);
		expect(o.value).toBe(false);
	});

	test('source: toggle button', () => {
		const opts = {
			toggleGpio: 123,
			toggleEdge: 'rising',
			toggleDebounce: 321,
			default: true
		};
		const o = {};
		const exit = factory(opts, [], [o]);
		expect(mockOnoff.Gpio.mock.calls[0][0]).toBe(opts.toggleGpio);
		expect(mockOnoff.Gpio.mock.calls[0][1]).toEqual('in');
		expect(mockOnoff.Gpio.mock.calls[0][2]).toBe(opts.toggleEdge);
		expect(mockOnoff.Gpio.mock.calls[0][3].debounceTimeout).toBe(opts.toggleDebounce);
		const gpio = mockOnoff.Gpio.mock.instances[0];
		expect(o.value).toBe(true);
		gpio.watch.mock.calls[0][0]();
		expect(o.value).toBe(false);
		gpio.watch.mock.calls[0][0]();
		expect(o.value).toBe(true);
		exit();
		expect(gpio.unexport.mock.calls.length).toBe(1);
	});

	test('source: on button', () => {
		const opts = {
			onGpio: 123,
			onEdge: 'rising',
			onDebounce: 321,
			default: false
		};
		const o = {};
		const exit = factory(opts, [], [o]);
		expect(mockOnoff.Gpio.mock.calls[0][0]).toBe(opts.onGpio);
		expect(mockOnoff.Gpio.mock.calls[0][1]).toEqual('in');
		expect(mockOnoff.Gpio.mock.calls[0][2]).toBe(opts.onEdge);
		expect(mockOnoff.Gpio.mock.calls[0][3].debounceTimeout).toBe(opts.onDebounce);
		const gpio = mockOnoff.Gpio.mock.instances[0];
		expect(o.value).toBe(false);
		gpio.watch.mock.calls[0][0]();
		expect(o.value).toBe(true);
		gpio.watch.mock.calls[0][0]();
		expect(o.value).toBe(true);
		exit();
		expect(gpio.unexport.mock.calls.length).toBe(1);
	});

	test('source: off button', () => {
		const opts = {
			offGpio: 123,
			offEdge: 'rising',
			offDebounce: 321,
			default: true
		};
		const o = {};
		const exit = factory(opts, [], [o]);
		expect(mockOnoff.Gpio.mock.calls[0][0]).toBe(opts.offGpio);
		expect(mockOnoff.Gpio.mock.calls[0][1]).toEqual('in');
		expect(mockOnoff.Gpio.mock.calls[0][2]).toBe(opts.offEdge);
		expect(mockOnoff.Gpio.mock.calls[0][3].debounceTimeout).toBe(opts.offDebounce);
		const gpio = mockOnoff.Gpio.mock.instances[0];
		expect(o.value).toBe(true);
		gpio.watch.mock.calls[0][0]();
		expect(o.value).toBe(false);
		gpio.watch.mock.calls[0][0]();
		expect(o.value).toBe(false);
		exit();
		expect(gpio.unexport.mock.calls.length).toBe(1);
	});

	test('LED', () => {
		const i = new EventEmitter();
		const opts = {
			ledGpio: 123,
			ledInvert: false
		};
		const exit = factory(opts, [i], [{}]);
		expect(mockOnoff.Gpio.mock.calls[0][0]).toBe(opts.ledGpio);
		expect(mockOnoff.Gpio.mock.calls[0][1]).toEqual('out');
		const gpio = mockOnoff.Gpio.mock.instances[0];
		i.emit('update', true);
		expect(gpio.writeSync.mock.calls[0][0]).toBe(1);
		i.emit('update', false);
		expect(gpio.writeSync.mock.calls[1][0]).toBe(0);
		exit();
		expect(gpio.unexport.mock.calls.length).toBe(1);
	});

	test('LED inverted', () => {
		const i = new EventEmitter();
		const opts = {
			ledGpio: 123,
			ledInvert: true
		};
		const exit = factory(opts, [i], [{}]);
		expect(mockOnoff.Gpio.mock.calls[0][0]).toBe(opts.ledGpio);
		expect(mockOnoff.Gpio.mock.calls[0][1]).toEqual('out');
		const gpio = mockOnoff.Gpio.mock.instances[0];
		i.emit('update', true);
		expect(gpio.writeSync.mock.calls[0][0]).toBe(0);
		i.emit('update', false);
		expect(gpio.writeSync.mock.calls[1][0]).toBe(1);
		exit();
		expect(gpio.unexport.mock.calls.length).toBe(1);
	});
});
