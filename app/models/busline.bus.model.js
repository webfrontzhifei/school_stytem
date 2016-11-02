var mongoose = require('../lib/db.js'),
	Schema = mongoose.Schema;

var BuslineSchema = new Schema( {
	lineid: Schema.Types.ObjectId,
	linenumber: String,
	departuretime: Date,
	bussets: [Schema.Types.ObjectId],
	driver: Schema.Types.ObjectId,
	stops: [Schema.Types.ObjectId]
});

var BuslineModel = mongoose.model('Busline', BuslineSchema);

module.exports = BuslineModel;