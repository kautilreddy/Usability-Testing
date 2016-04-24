var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Project = require('../models/project');
var AutoAnalyse = require('../analyse/index.js');
var DefaultList = require('../default_list');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}
function isNotRealValue(obj){
	return !(obj && obj !== "null" && obj!== "undefined");
}
module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
    	res.render('index');
    });

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/loginerror',
		failureFlash : false  
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signuperror',
		failureFlash : false  
	}));
	router.get('/signuperror', function(req, res) {
    	// Display the Login page with any flash message, if any
    	res.render('signuperror');
    });	
	router.get('/loginerror', function(req, res) {
    	// Display the Login page with any flash message, if any
    	res.render('loginerror');
    });
	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
		res.render('home',{user:req.user});
	});
	router.get('/createpj', isAuthenticated, function(req, res){
		res.render('createpj',{user:req.user});
	});
	router.get('/project/:pid', isAuthenticated, function(req, res){
		var pid = req.params.pid;
		Project.findById(pid,function(err,projectDetails){
			if(err||isNotRealValue(projectDetails)){
				return res.send(400,"no such pid");
			}
			res.render('project',{project:projectDetails});
		});
	});

	router.get('/interact/:pid', function(req, res){
		var pid = req.params.pid;
		Project.findById(pid,function(err,projectDetails){
			console.log(typeof projectDetails);
			if(err||isNotRealValue(projectDetails)){
				return res.send(400,"no such pid");
			}
			else if(projectDetails.interactionsLeft>0){
				res.render('interact',{project:projectDetails});
			}
			else{
				res.render('noInteractionsLeft');
			}
		});
	});
	router.post('/query/:pid', function(req, res){
		var pid = req.params.pid;
		Project.findById(pid,function(err,projectDetails){
			if(err||isNotRealValue(projectDetails)){
				return res.send(400,"no such pid");
			}
			else{
				res.render('query',{project:projectDetails});
			}
		});
	});
	router.post('/postLTime/:pid',function(req,res){
		var pid = req.params.pid;
		Project.findById(pid,function(err,projectDetails){
			if(err||isNotRealValue(projectDetails)){
				return res.send(400,"no such pid");
			}
			var totalInteractions = (projectDetails.maxcount-projectDetails.interactionsLeft);
			var totalLoadTimeAvg = (projectDetails.averageLoadTime/(totalInteractions+1))*(totalInteractions);
			var totalPlusCurrent = totalLoadTimeAvg + (parseInt(req.body.time)/(totalInteractions+1));
			var timetoput = (totalPlusCurrent);
			if(isNaN(timetoput)){
				return res.send(400,"no such pid");
			}
			Project.update({'_id':projectDetails._id},{$set:{'averageLoadTime':timetoput}},function(err){
				if(err){
					console.log('some error occurred ' + err);
					return res.send(500,"mongo error");
					throw err;
				}
			});
			res.status(202);
			res.send('time added');
		});
	});
	router.post('/regproject', isAuthenticated, function(req, res){
		//console.log(JSON.stringify(DefaultList));
		User.findById(req.user._id,function(err,user){
			if(err||isNotRealValue(user)){
				return res.send(400,"no such user");
			}
			var newProject = new Project();
        	// set the user's local credentials
        	//console.log(req.param('ctrack')+' comparing with ='+ (req.param('ctrack')=='') + ' no string existing'+(req.param('performance')));
        	console.log(' req body = '+JSON.stringify(req.body));
        	AutoAnalyse(req.param('url'));
        	newProject.pname = req.param('pname');
        	newProject.maxcount = req.param('maxcount');
        	newProject.ctrack = (req.param('ctrack')=='');
        	newProject.performance = (req.param('performance')=='');
        	newProject.semantics = (req.param('semantics')=='');
        	newProject.interactionsLeft= newProject.maxcount;
        	newProject.query = (req.param('query')=='');
        	newProject.url = (req.param('url'));
        	newProject.task = (req.param('task'));
        	newProject.queryType = (req.param('queryType'));
        	newProject.averageLoadTime = 0;
        	newProject.avgSUS = 0;
        	if(req.param('queryType')==="custom"){
        		newProject.questions = req.body.q;
        	}
        	else{
        		newProject.questions = DefaultList;
        	}
       		// save the user
       		newProject.save(function(err,proj) {
       			if (err){
       				console.log('Error in Saving user: '+err);  
       				throw err;  
       			}
       			console.log('User Registration succesful');
       			User.update({'username':req.user.username},{$inc:{'project_count':1},$push:{'projects':{'name':proj.pname,'pro_id':proj._id}}},function(err){
       				if(err){
       					console.log('some error occurred ' + err);
       					throw err;
       				}
					res.redirect('/home');
       			});
       		});
       	});
	});
	router.post('/saveQueryResponse',function(req,res){
		console.log('in save query response');
		console.log('req content = '+JSON.stringify(req.body));
		Project.findById(req.body._id,function(err,projectDetails){
			if(err||isNotRealValue(projectDetails)){
				return res.send(400,"no such project");
			}
			res.send(202,"response is saved");
			var totalInteractions = (projectDetails.maxcount-projectDetails.interactionsLeft);
			var totalSUSAvg = (projectDetails.avgSUS/(totalInteractions+1))*(totalInteractions);
			var totalPlusCurrent = totalSUSAvg + (parseInt(req.body.sus)/(totalInteractions+1));
			var sustoput = (totalPlusCurrent);
			Project.update({'_id':projectDetails._id},{$inc:{'interactionsLeft':-1},$set:{'avgSUS':sustoput}},function(err){
				if(err){
					console.log('some error occurred ' + err);
					throw err;
				}
			});
		});
	});
	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;
}





