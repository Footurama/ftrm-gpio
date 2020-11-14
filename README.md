# Footurama Package: GPIO

With this package you can access your GPIOs using the Linux gpio sysfs driver.

# ftrm-gpio/in

Read from a GPIO.

Configuration:

 * `input`: **0**.
 * `output`: **1**. Target pipe for read values.
 * `gpio`: The GPIO's pin number.
 * `invert`: If set to true HIGH will get false and LOW will get true. Default: `false`
 * `interval`: If set, the input will be read in an interval of the given number of milliseconds.
 * `watch`: Emit values if an edge is detected on the input. Default: `true`

Example:

```js
// Read from GPIO 23 every second
module.exports = [require('ftrm-gpio/in'), {
	output: 'output-pipe-with-booleans',
	gpio: 23,
	interval: 1000
}];
```

# ftrm-gpio/out

Read from a GPIO.

Configuration:

 * `input`: **1**. Source pipe for GPIO state.
 * `output`: **0**.
 * `gpio`: The GPIO's pin number.
 * `invert`: If set to true the GPIO will be put into active LOW mode. Default: `false`.
 * `default`: If set, the input will be read in an interval of the given number of milliseconds.

Example:

```js
// Set the output of GPIO 23 to the values according to the input pipe.
// If no values are received within 5 minutes, the default will be set.
module.exports = [require('ftrm-gpio/out'), {
	input: [{pipe: 'input-pipe-with-booleans', expire: 5 * 60 * 1000}],
	default: true,
	gpio: 23
}];
```


# ftrm-gpio/out

Implements a switch.

Configuration:

 * `input`: Optional. Set the on state of the switch.
 * `output`: The current on state of the switch.
 * `toggleGpio`: Optional. Toggle button GPIO number.
 * `toggleEdge`: Toggle button edge. Default: `'falling'`
 * `toggleDebounce`: Toggle button debounce timeout in ms. Default: `10`
 * `onGpio`: Optional. On button GPIO number.
 * `onEdge`: On button edge. Default: `'falling'`
 * `onDebounce`: On button debounce timeout in ms. Default: `10`
 * `offGpio`: Optional. Off button GPIO number.
 * `offEdge`: Off button edge. Default: `'falling'`
 * `offDebounce`: Off button debounce timeout in ms. Default: `10`
 * `ledGpio`: Optional. On state LED GPIO number.
 * `ledInvert`: Invert on state LED. Default: `false`

Example:

```js
// Connect a push button and a pull-up resistor to GPIO 23. Pressing the button
// must pull the GPIO to GND. Connect a LED to GPIO 24. Have fun pressing the button!
module.exports = [require('ftrm-gpio/switch'), {
	input: 'on-state-desired',
	output: 'on-state-actual',
	toggleGpio: 23,
	ledGpio: 24
}];
```
