var cheerio = require('cheerio');
var request = require('request');
var w3c = require('w3c-validate').createValidator();

module.exports = function(url){
	var report = {};
	request(url,function(error,response,html){
		var $ = cheerio.load(html);
		var relative_url = url.slice();
		relative_url = relative_url.replace(/^(?:\/\/|[^\/]+)*\//,'');
		report.consistency = checkConsistency($);
		report.contextualNavigation = checkContextualNavigation($);
		report.labling = checkLabling($);
		report.maintainability = checkMaintainability($,url);
		report.others = checkOthers($);
		report.flexibility = checkFlexibility($);
		//Robustness
		w3c.validate(html, function (err) {
			if (err) {
    			report.robustness = 'HTML Not Valid'; // error includes [{message, context}] to help understand validation errors 
			} else {
				report.robustness = 'GOOD';
			}
		});
		return report;
	});
}
function checkConsistency($,relative_url,url){
	var result=10;
	var links = {};
	$('a').each(function(i,ele){
		if(ele.attr('href') in links){
			if(ele.text().localeCompare(links[ele.attr('href')])!=0){
							result=0;
			}
		}
		else{
			links[ele.attr('href')] = ele.text();
		}
	});
	if(result==0){
		return 'Links pointing to same resource have different labels';
	}
	return 'GOOD';
}
function checkContextualNavigation($){
	var result=10;
	$('a').each(function(i,ele){
		if((ele.attr('href').localeCompare(relative_url)==0)||(ele.attr('href').localeCompare(url)==0)){
			result=0;
		}
	});
	if(result==0){
		return 'Page references itself';
	}
	return 'GOOD';
}
function checkLabling($){
	var title = $("title").text();
	if(title.localeCompare("")==0){
		return 'No title'
	}
	return 'GOOD';
}
function checkFlexibility($){
	var score = 10;
	$('img').each(function(i,ele){
		if(ele.attr('alt').localeCompare("")==0){
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
	var domainName = extractDomain(url);
	$('[href]').each(function(i,ele){
		arrayOfLinks.push($(this).attr('href'));
	});
	$('[src]').each(function(i,ele){
		arrayOfLinks.push($(this).attr('href'));
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
	var score =10;
	$('form').each(function(i,ele){
		if(form.children('input[type="submit"],input[type="reset"]').length == 0){
			score = 0;
		}
	});
	if(score==0){
		return "Forms do not have submit or reset";
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