var mongoose = require('../lib/db.js'),
	Schema = mongoose.Schema;

var commentSchema = new Schema( {
	commentid: Schema.Types.ObjectId,
	content: String,
	owner: Schema.Types.ObjectId
});

var commentModel = mongoose.model('Comment', commentSchema);

module.exports = commentModel;