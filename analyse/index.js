var cheerio = require('cheerio');
var request = require('request');
var w3c = require('w3c-validate').createValidator();
var Project = require('../models/project');

module.exports = function(url,id){
	var report = {};
	console.log('id = '+id);
	request(url,function(error,response,html){
		var $ = cheerio.load(html);
		var relative_url = url.slice();
		relative_url = relative_url.replace(/^(?:\/\/|[^\/]+)*\//,'');
		report.maintainability = checkMaintainability($,url);
		report.consistency = checkConsistency($);
		report.contextualNavigation = checkContextualNavigation($,relative_url,url);
		report.labling = checkLabling($);
		report.others = checkOthers($);
		report.flexibility = checkFlexibility($);
		Project.update({'_id':id},{$set:{'autoAnalyse':'','autoAnalysisResults':report}},function(err){
			console.log('result data inserted into mongo');
			if(err){
				console.log('some error occurred ' + err);
				throw err;
			}
		});
		//Robustness
		w3c.validate(html, function (err) {
			if (err) {
			    report.robustness = 'Validate HTML'; // error includes [{message, context}] to help understand validation errors 
			} else {
				report.robustness = 'GOOD';
			}
			Project.update({'_id':id},{$set:{'autoAnalyse':'','autoAnalysisResults':report}},function(err){
				if(err){
					console.log('some error occurred ' + err);
					throw err;
				}
				console.log('saved data with robustness evaluation');
			});
		});
		console.log('without robust evaluation done');
	});
}
function checkConsistency($){
	var result=10;
	console.log('url in checkConsistency');
	var links = {};
	$('a').each(function(i,ele){
		if(typeof ($(this).attr('href')) === "undefined"){
			
		}
		else if($(this).attr('href') in links){
			if($(this).text().localeCompare(links[$(this).attr('href')])!=0){
							result=0;
			}
		}
		else{
			links[$(this).attr('href')] = $(this).text();
		}
	});
	if(result==0){
		return 'Links pointing to same resource have different labels';
	}
	return 'GOOD';
}
function checkContextualNavigation($,relative_url,url){
	var result=10;
	console.log('url in checkContextualNavigation');
	$('a').each(function(i,ele){
		if(typeof ($(this).attr('href')) === "undefined"){

		}
		else if(($(this).attr('href').localeCompare(relative_url)==0)||($(this).attr('href').localeCompare(url)==0)){
			result=0;
		}
	});
	if(result==0){
		return 'Page references itself';
	}
	return 'GOOD';
}
function checkLabling($){
	console.log('url in checkLabling');
	var title = $("title").text();
	if(title.localeCompare("")==0){
		return 'No title'
	}
	return 'GOOD';
}
function checkFlexibility($){
	console.log('url in checkFlexibility ');
	var score = 10;
	$('img').each(function(i,ele){
		if(typeof ($(this).attr('alt')) === "undefined"){
			
		}
		else if($(this).attr('alt').localeCompare("")==0){
			score = 0;
		}
	});
	if(score==0){
		return "No Alternative Text for images and media";
	}
	return 'GOOD';
}
function checkMaintainability($,url){
	var arrayOfLinks = [];
	var score =10;
	console.log('url in checkM '+url);
	var domainName = extractDomain(url);
	$('[href]').each(function(i,ele){
		//console.log('from href  '+$(this).attr('href'));
		arrayOfLinks.push($(this).attr('href'));
	});
	$('[src]').each(function(i,ele){
		//console.log('++++from src  '+$(this));
		arrayOfLinks.push($(this).attr('src'));
	});
	arrayOfLinks.forEach(function(item,index){
		if(!isRelativeAddress(item,domainName)){
			score = 0;
		}
	});
	if(score==0){
		return "Absolute Addresses Used";
	}
	return 'GOOD';
}
function checkOthers($){
	console.log('url in checkOthers ');
	var score =10;
	$('form').each(function(i,ele){
		if($(this).children('button[type="submit"],input[type="submit"]').length == 0){
			console.log($(this).children('button[type="submit"],input[type="submit"]').length);
			score = 0;
		}
	});
	if(score==0){
		return "Forms do not have submit";
	}
	return 'GOOD';
}
function isRelativeAddress(url,domainName){
	if(extractDomain(url).localeCompare(domainName)==0){
		return false;
	}
	return true;
}
function extractDomain(url) {
	//console.log('in extract Domain '+url);
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}