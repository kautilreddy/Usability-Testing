
var mongoose = require('mongoose'),
 Schema = mongoose.Schema;

module.exports = mongoose.model('User',{
	id: String,
	username: String,
	password: String,
	email: String,
	projects: [{name:String, pro_id:{type: Schema.Types.ObjectId,ref:'Project'}}],
	project_names:[],
	project_count: Number
});