var mongoose = require('../lib/db.js'),
	Schema = mongoose.Schema;

var newsSchema = new Schema( {
	newsid:Schema.Types.ObjectId,
	title: String,
	content: String,
	category: Schema.Types.ObjectId,
	comments: [Schema.Types.ObjectId]
});

var newsModel = mongoose.model('News', newsSchema);

module.exports = newsModel;