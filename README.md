# Footurama Package: GPIO

With this package you can access your GPIOs using the Linux gpio sysfs driver.

# ftrm-gpio/in

Read from a GPIO.

Configuration:

 * ```input```: **0**.
 * ```output```: **1**. Target pipe for read values.
 * ```gpio```: The GPIO's pin number.
 * ```invert```: If set to true HIGH will get false and LOW will get true. Default: ```false```.
 * ```interval```: If set, the input will be read in an interval of the given number of milliseconds.
 * ```watch```: Emit values if an edge is detected on the input. Default: ```true```

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

 * ```input```: **0**.
 * ```output```: **1**. Target pipe for read values.
 * ```gpio```: The GPIO's pin number.
 * ```invert```: If set to true the GPIO will be put into active LOW mode. Default: ```false```.
 * ```default```: If set, the input will be read in an interval of the given number of milliseconds.

Example:

```js
// Set the output of GPIO 23 to the values according to the input pipe.
// If no values are received within 5 minutes, the default will be set.
module.exports = [require('ftrm-gpio/out'), {
	input: [{pipe: 'input-pipe-with-booleans', expire: 5 * 60 * 1000}],
	default: true
	gpio: 23
}];
```
