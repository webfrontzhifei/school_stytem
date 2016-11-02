var mongoose = require('../lib/db.js'),
	Schema = mongoose.Schema;

var StopSchema = new Schema( {
	stopid: Schema.Types.ObjectId,
	stopname: String
});

var StopModel = mongoose.model('Busline', StopSchema);

module.exports = StopModel;