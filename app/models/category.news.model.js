var mongoose = require('../lib/db.js'),
	Schema = mongoose.Schema;

var categorySchema = new Schema( {
	categoryid: Schema.Types.ObjectId,
	title: String
});

var categoryModel = mongoose.model('Category', categorySchema);

module.exports = categoryModel;