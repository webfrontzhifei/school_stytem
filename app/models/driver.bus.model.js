var mongoose = require('../lib/db.js'),
	Schema = mongoose.Schema;

var DriverSchema = new Schema( {
	driverid: Schema.Types.ObjectId,
	cardnumber: String,
	name: String,
	age: Number,
	sex: Number,
	shortinfo: String
});

var DriverModel = mongoose.model('Driver', DriverSchema);

module.exports = DriverModel;