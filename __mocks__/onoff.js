module.exports.Gpio = jest.fn();
module.exports.Gpio.prototype.read = jest.fn((cb) => cb(null, 1));
module.exports.Gpio.prototype.writeSync = jest.fn();
module.exports.Gpio.prototype.watch = jest.fn();
module.exports.Gpio.prototype.unexport = jest.fn();
