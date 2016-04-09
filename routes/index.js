var express = require('express');
var router = express.Router();
var request = require('request');
var User = require('../models/user');
var Project = require('../models/project');

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
					res.status(404);
					res.send("no such pid");
				}
				res.render('project',{project:projectDetails});
			});
	});

	router.get('/interact/:pid', function(req, res){
		var pid = req.params.pid;
			Project.findById(pid,function(err,projectDetails){
				console.log(typeof projectDetails);
				if(err||isNotRealValue(projectDetails)){
					res.status(404);
					res.send("page not found");
				}
				else if(projectDetails.interactionsLeft>0){
					res.render('interact',{project:projectDetails});
				}
				else{
					res.render('noInteractionsLeft');
			}
		});
	});
	router.post('/postLTime/:pid',function(req,res){
		var pid = req.params.pid;
		console.log('in post time'+JSON.stringify(req.body));
			Project.findById(pid,function(err,projectDetails){
				if(err||isNotRealValue(projectDetails)){
					res.status(404);
					res.send("no such pid");
				}
				var totalInteractions = (projectDetails.maxcount-projectDetails.interactionsLeft);
				var totalLoadTime = projectDetails.averageLoadTime*totalInteractions;
				var totalPlusCurrent = totalLoadTime + parseInt(req.body.time);
				var timetoput = (totalPlusCurrent)/(totalInteractions+1);
				console.log(timetoput);
       			Project.update({'_id':projectDetails._id},{$inc:{'interactionsLeft':-1},$set:{'averageLoadTime':timetoput}},function(err){
       				if(err){
       					console.log('some error occurred ' + err);
       				throw err;
       				}
       			});
			res.status(200);
			res.send('time added');
		});
	});
	router.post('/regproject', isAuthenticated, function(req, res){
		console.log('req object = '+req.user.username+'\n');
		User.findById(req.user._id,function(err,user){
			if(err||isNotRealValue(user)){
					res.status(404);
					res.send("no such user");
			}
			var newProject = new Project();
        	// set the user's local credentials
        	console.log(req.param('ctrack')+' comparing with ='+ (req.param('ctrack')=='') + ' no string existing'+(req.param('performance')));
       	 	newProject.pname = req.param('pname');
       		newProject.maxcount = req.param('maxcount');
       		newProject.ctrack = (req.param('ctrack')=='');
       		newProject.performance = (req.param('performance')=='');
       		newProject.semantics = (req.param('semantics')=='');
       		newProject.interactionsLeft= newProject.maxcount;
       		newProject.query = (req.param('query')=='');
       		newProject.url = (req.param('url'));
       		newProject.task = (req.param('task'));
       		newProject.averageLoadTime = 0;
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
       			});
        	});
    	});
    	res.redirect('/home');
	});
	router.post('/urlgiven',function(req,res){
		console.log('in urlgiven post');
		console.log(req.param('url'));
		var date = new Date();
		var start = date.getTime();
		console.log(start);
		request("http://"+req.param('url'), function(error, response, body) {
		 	console.log("server side time taken = "+((new Date().getTime()) - start));
		});
		res.redirect('http://'+req.param('url'));
	});
	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;
}





