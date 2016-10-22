var mongoose = require('../lib/db.js');

var userSchema = new mongoose.Schema( {
	name: String,
	password: String,
	age: Number
});

var userModel = mongoose.model('User', userSchema);

module.exports = userModel;