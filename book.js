var express= require('express');
var app = express();
var books = require('google-books-search-2');


var ObjectId = require('mongodb').ObjectID;

var mongo = require('mongodb').MongoClient;
var mongourl =  'mongodb://shabab:shabab@ds155577.mlab.com:55577/toogle';

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.static('Views'));

app.post('/getallbooks',function(req,res){
	var books = req.body['books[]'];
	if(!books){
		res.send('ERROR');
	}
	if(books.constructor !== Array) books = [books];
	console.log(books);
	for(var i = 0 ; i<books.length;i++) books[i] = ObjectId(books[i]);
	mongo.connect(mongourl,function(err,db){
		var collection = db.collection('books');
		collection.find( {_id : { $in : books} },{user : false,username :false,photo:false}).toArray(function(err,documents){
			res.send(documents);
			return;
		});
	});
});


app.post('/gettrades',function(req,res){
	var email  = req.body.email;
	console.log(email);
	mongo.connect(mongourl,function(err,db){
		var collection = db.collection('trades');
		collection.find( { user : email } ).toArray(function(err,documents){
			res.send(documents[0]);
			return;
		});
	})
});



app.post('/getalluser',function(req,res){
	var data = req.body['user[]'];
	//console.log(req.body);
	console.log(data);
	if(!data){
		res.send('ERROR');
		return;
	}
	if(data.constructor !== Array) data = [data];
	//console.log(data);
	//res.send('ok');
	var ans =  [];
	mongo.connect(mongourl,function(err,db){
		var collection = db.collection('auth');
		collection.find( { email : {$in :data} } ).toArray(function(err,documents){
			for(var i = 0 ; i<documents.length;i++){
				ans.push({ email : documents[i].email  ,name : documents[i].name , id : documents[i]._id});
			}
			res.send(ans);
		})
	})
});


app.post('/updatepass',function(req,res){
	if(!req.body){
		res.send("ERROR");
			return;
	}
	mongo.connect(mongourl,function(err,db){
		var collection = db.collection('auth');
		collection.find( {email : req.body.email , pass : req.body.curpass} ).toArray(function(err,documents){
			if(documents.length==0){
				res.send("ERROR");
				return;
			}
			else{
				collection.update( {email : req.body.email , pass : req.body.curpass} , { $set : { pass : req.body.newpass} },function(){
					res.send("OK");
				});
			}
		});
	})
});


app.post('/updatesettings',function(req,res){
	//console.log(req.body);
	if(!req.body){
		res.send('ERROR');
		return;
	}
	//res.send('OK');
	mongo.connect(mongourl,function(err,db){
		var collection = db.collection('auth');
		collection.update({email : req.body.email},{ $set : req.body },function(documents){
			//console.log(documents);
			res.send('DONE');
		});
	});
});


app.post('/settings',function(req,res){
	if(!req.body.email){
		res.send("ERROR");
		return;
	}
	mongo.connect(mongourl,function(err,db){
		var collection = db.collection('auth');
		collection.find({email : req.body.email}).toArray(function(err,data){
			res.send(data[0]);
			return;
		});
	})

});

app.post('/unavailable',function(req,res){
	mongo.connect(mongourl,function(err,db){
		var collection = db.collection('unavailable');
		collection.find({},{_id : false}).toArray(function(err,documents){
			//console.log(documents);
			//res.send(documents);
			var arr = [];
			for(var i = 0 ; i<documents.length;i++) arr.push(documents[i]);
				res.send(arr);
			return;
		});
	});
});

app.post('/approve',function(req,res){
	//console.log(req.body);
	//res.send('ha');
	if(!req.body.id || !req.body.user || !req.body.requestedby){
		res.send("ERROR");
		return;
	}
	console.log(req.body);

	mongo.connect( mongourl, function(err,db){
		var collection = db.collection('request');
		collection.find(  {user : req.body.user} ).toArray(function(err,documents){
			var obj = documents[0];
			console.log(obj,"hahaha");
			for(var i = 0 ; i< obj.requested.length;i++){
				//console.log( obj.requested[i].id ,req.body.id);
				//console.log( obj.requested[i].requestedby ,req.body.requestedby);
				if(obj.requested[i].id == req.body.id && obj.requested[i].requestedby == req.body.requestedby  ){
					obj.requested.splice(i,1);
					console.log(i);
					collection.update( {user : req.body.user},obj,function(){

					});
					//break;
				}
			}
		});

		collection.find( {user : req.body.requestedby} ).toArray(function(err,documents){
			var obj = documents[0];
			for(var i = 0 ;i< obj.request.length;i++){
				if(obj.request[i].id == req.body.id && obj.request[i].requestto==req.body.user ){
					obj.request.splice(i,1);
					console.log(i,"haha");
					collection.update( {user : req.body.requestedby} ,obj,function(){
						res.send("OK");
					});
				}
			}
		})

		var coll = db.collection('trades');
		coll.update( { user : req.body.requestedby} , { $push : { trades : { 'status' : req.body.status , 'who' : 'nm' , id : req.body.id , email : req.body.user} } },{ upsert :true },function(){

		});
		coll.update( {user : req.body.user} , { $push : {trades : {status :req.body.status , 'who' : 'me', id : req.body.id, email : req.body.requestedby } } },{upsert : true},function(){

		});
		if(Number(req.body.status)==1){
			var  database = db.collection('unavailable');
			database.update( {'id' : req.body.id},{'id' : req.body.id},{upsert : true},function(){

			});
		}

	});

});


app.post('/allmybooks',function(req,res){
	var user  = req.body.user;
	if(!user){
		res.send("ERROR");
		return;
	}
	console.log(user);
	mongo.connect( mongourl,function(err,db){
		var collection = db.collection('books');
		collection.find( { 'user' : user} ).toArray(function(err,documents){
			var obj ={
				'first' : documents,
				'second' : null
			}
			//res.send(documents);
			var col = db.collection('request');
			col.find( {'user' : user},{user : false , _id : false, username: false }).toArray(function(err,data){
				obj.second = data[0];
				res.send(obj);
				return;
			});
		});
	});

});

//////////////delete re
app.post('/deleterequest',function(req,res){
	//console.log('aise');
	//console.log(req.body);
	//console.log(req.body);
	if(!req.body.id || !req.body.requestto || !req.body.email){
		res.send("ERROR");
		return;
	}
	var request ={
		'id' : req.body.id,
		'requestto' : req.body.requestto
	}
	var requested ={
		'id' : req.body.id,
		'requestedby' : req.body.email
	}
	//console.log(request);
	//console.log(requested);
	mongo.connect(mongourl,function(err,db){
		var collection = db.collection('request');
		collection.find( { user : req.body.email}).toArray(function(err,documents){
			//console.log(documents);
			//console.log('aise');
			var obj = documents[0];
			for(var i = 0 ; i<obj.request.length ;i++){
				//console.log(obj.request[i]);
				if(obj.request[i].id==req.body.id && obj.request[i].requestto==req.body.requestto){
					//console.log(obj.request[i]);
					obj.request.splice(i,1);
					collection.update( { user : req.body.email}, obj ,function(data){

					});

					break;
				}
			}
		});

		collection.find( {user : req.body.requestto} ).toArray(function(err,documents) {
			var obj = documents[0];
			//console.log(obj);
			for(var i = 0 ; i<obj.requested.length;i++){
				if(obj.requested[i].id ==req.body.id && obj.requested[i].requestedby == req.body.email){
					//console.log(obj.requested[i]);
					obj.requested.splice(i,1);
					collection.update( {user : req.body.requestto} ,obj,function(){
						res.send("OK");
					});
				}
			}

		});
	})

	//res.send('Ok');
});




app.post('/deletebook',function(req,res){
	var user = req.body.user;
	var id  = req.body.id;
	if(!user || !id){
		res.send('ERROR');
		return;
	}
	mongo.connect( mongourl,function(err,db){
		var collection = db.collection('books');
		collection.remove( {  _id : ObjectId(id) , 'user' : user },function(data){
			res.send('OK');
			return;
		} );

	});

});

app.post('/signup',function(req,res){
	var name  =  req.body.name;
	var email = req.body.email;
	var pass = req.body.pass;
	console.log(name,email,pass);
	if(!(name && email && pass)){
		res.send('ERROR');
		return;
	}
	mongo.connect(mongourl,function(err,db){
		var collection = db.collection('auth');
		collection.find( { 'email' : email } ).toArray(function(err,documents){
			if(documents.length!=0){
				
				res.send("User already Exist");
				return;
			}
			else{
				collection.insert( { 'name' : name , 'email' : email , 'pass' : pass},function(err,documents){
					res.send('OK');
					return;
				});
			}
		});
	});

});

app.post('/allbooks',function(req,res){
	var user  = req.body.user;
	console.log(user);
	if(!user){
		res.send('ERROR');
		return;
	}
	mongo.connect(mongourl,function(err,db){
		var collection = db.collection('books');
		collection.find( {} ).toArray(function(err,documents){
			var obj ={
				'first' : documents,
				'second' : null
			}
			//res.send(documents);
			var col = db.collection('request');
			col.find( {'user' : user},{user : false , _id : false, username: false }).toArray(function(err,data){
				obj.second = data[0];
				res.send(obj);
			});
		});
	});
});

////
app.post('/books',function(req,res){
	var username = req.body.name;
	if(!req.body.book || !req.body.user || !username){
		res.send('NO BOOK FOUND');
		return;
	}
	books.search(req.body.book)
		.then(function(results) {
			if(results.length==0){
				res.send('NO BOOK FOUND');
			}
			else{
				//console.log(results);
				mongo.connect(mongourl,function(err,db){
					var collection = db.collection('books');
					//console.log(documents);
					collection.insert( { 'user' : req.body.user, 'photo' : results[0].thumbnail ,'username' : username,'title' : results[0].title },function(err,data){
						res.send( data.ops[0]);
						console.log(data);
						return;
					});
				});

				//res.json(  { 'photo' : results[0].thumbnail , 'info' : results[0].infoLink } );

			}
		})
		.catch(function(error) {
			console.log(error);
			res.send('NO BOOK FOUND');
	});
});
/////

app.post('/login',function(req,res){
	var email =  req.body.email;
	var pass = req.body.password;
	if( !email || !pass ){
		res.send('ERROR');
		return;
	}

	mongo.connect(mongourl,function(err,db){
		var collection = db.collection('auth');
		collection.find( { 'email' : email , 'pass' : pass }  ).toArray(function(err,documents){
			if(documents.length == 0){
				res.send('ERROR');
				return;
			}
			else{
				res.json(  { 'name' : documents[0].name , 'email' : documents[0].email }  );
				return;
			}
		});
	});

});

//// trade request for book
app.post('/request',function(req,res){
	var requesteduser = req.body.requesteduser;
	var requestedname = req.body.requestedname;
	var id  =  req.body.id;
	var photo =  req.body.photo;
	var requestto =  req.body.requestto;  
	var requesttoname = req.body.requesttoname;
	console.log(requesteduser,requestedname);
	console.log(requesttoname,requestto);
	//res.send('OK');
	mongo.connect(mongourl,function(err,db){
		var collection = db.collection('request');
		collection.update( { 'user' : requesteduser},{ $push : { request : { 'id' : id , 'photo' : photo , 'requestto' : requestto,'name' :requesttoname   }  } },{upsert : true},function(err,documents){
			//res.send('ok');
			//console.log('ok');

		});

		collection.update(  { 'user' : requestto} ,{$push: {requested :{'id' : id ,'photo' : photo , 'requestedby' : requesteduser ,'name': requestedname} }  },{upsert : true},function(err,documents){
			res.send('ok');
		});

	});

});


app.get('/allbooks',function(req,res){
	res.sendFile( process.cwd() + '/Views/allbooks.html' );
});

app.get('/mybooks',function(req,res){
	res.sendFile( process.cwd() + '/Views/mybooks.html' );
});


app.get('/login',function(req,res){
	res.sendFile( process.cwd() + '/Views/login.html' );
});

app.get('/signup',function(req,res){
	res.sendFile( process.cwd() + '/Views/signup.html' );
});
app.get('/',function(req,res){
	res.sendFile( process.cwd() + '/Views/home.html' );
});

app.get('/settings',function(req,res){
	res.sendFile(process.cwd()+ '/Views/settings.html');
});
app.get('/myrequests',function(req,res){
	res.sendFile(process.cwd()+ '/Views/myrequests.html');
});

app.get('/requested',function(req,res){
	res.sendFile(process.cwd()+ '/Views/requested.html');
});
app.get('/history',function(req,res){
	res.sendFile(process.cwd()+ '/Views/history.html');
});

app.get('/profile',function(req,res){
	res.sendFile(process.cwd()+'/Views/profile.html');
})

app.listen(8080, '127.0.0.1', function(){
	console.log('Port is listening');
});




app.post('/getmyprofile',function(req,res){
		var id = req.query.id;
		if(!id){
			res.send("ERROR");
			return;
		}
		console.log(id);
		mongo.connect(mongourl,function(err,db){
			var collection = db.collection('auth');
			collection.find({_id : ObjectId(id)},{pass : false}).toArray(function(err,documents){
				console.log(documents);
				res.send(documents[0]);
				//return;
			})
		})
})