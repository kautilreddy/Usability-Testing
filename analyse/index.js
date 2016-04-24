var cheerio = require('cheerio');
var request = require('request');
module.exports = function(url){
	request(url,function(error,response,html){
		var $ = cheerio.load(html);
		
	});
}