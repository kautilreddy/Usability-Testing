var mongoose = require('mongoose'),
 Schema = mongoose.Schema;

module.exports = mongoose.model('Project',{
	id: String,
	pname: String,
	maxcount: Number,
	interactionsLeft: Number,
	ctrack:Boolean,
	performance:Boolean,
	semantics:Boolean,
	query:Boolean,
	url:String,
	task:String,
	averageLoadTime:Number,
	avgSUS:Number,
	autoAnalyse:String,
	autoAnalysisResults:Schema.Types.Mixed,
	queryType:String,
	problem:[String],
	questions:[String]
});