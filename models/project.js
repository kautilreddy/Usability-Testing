var mongoose = require('mongoose'),
 Schema = mongoose.Schema;

module.exports = mongoose.model('Project',{
	id: String,
	pname: String,
	maxcount: Number,
	ctrack:Boolean,
	performance:Boolean,
	semantics:Boolean,
	query:Boolean,
	url:String,
	Task:String,
	query_questions: Schema.Types.ObjectId
});