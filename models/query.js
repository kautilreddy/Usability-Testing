var mongoose = require('mongoose');

module.exports = mongoose.model('Query',{
	id: String,
	questions:[{question:String,options:[]}]
});