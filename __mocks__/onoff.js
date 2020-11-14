module.exports.Gpio = jest.fn(function () {
	this.read = jest.fn((cb) => cb(null, 1));
	this.writeSync = jest.fn();
	this.watch = jest.fn();
	this.unexport = jest.fn();
});
