var mongoose = require('mongoose'),
	DB_URL = 'mongodb://localhost:27017/schoolsystem';

mongoose.connect(DB_URL);

mongoose.connection.on('connected', function() {
	console.log('mongoose connection open to '+DB_URL);
});

mongoose.connection.on('error', function(err) {
	console.log('mongoose connection error: '+err);
});

mongoose.connection.on('disconnected', function() {
	console.log('mongoose connection disconnected');
});

module.exports = mongoose;