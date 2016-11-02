var mongoose = require('../lib/db.js'),
	Schema = mongoose.Schema;

var BusSchema = new Schema( {
	busid: Schema.Types.ObjectId,
	busnumber: String,
	buscategory: String
});

var BusModel = mongoose.model('Bus', BusSchema);

module.exports = BusModel;