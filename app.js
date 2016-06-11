var http    = require("http");
var express = require("express");
var expressSession = require('express-session');
var cookieParser = require('cookie-parser'); 

var bodyParser = require('body-parser');


// create our app
var app = express();

app.use(cookieParser());

app.use(expressSession({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 15 * 60 * 1000,
}));

app.use(bodyParser());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

// var mysql      = require('mysql');
// var pool = mysql.createPool({
//  	connectionLimit : 100, //important
//     host     : 'localhost',
//     user     : 'EComm',
//     password : 'EComm',
//     database : 'EComm',
//     port     : '3306',
//     debug    :  false
// });


var mysql      = require('mysql');
var pool = mysql.createPool({
 	connectionLimit : 100, //important
    host     : 'ecomm.clumahyxe987.us-east-1.rds.amazonaws.com',
    user     : 'EComm',
    password : '12345678',
    database : 'EComm',
    port     : '3306',
    debug    :  true
});


//Store all HTML files in view folder.
//app.use(express.static(__dirname + '/Script'));
//Store all JS and CSS in Scripts folder.

app.get('/',function(req,res){
  res.sendFile('Ecomm.html', { root: __dirname });
  //It will find and locate index.html from View or Scripts
});

/*app.get('/about',function(req,res){
  res.sendFile('/about.html');
});

app.get('/sitemap',function(req,res){
  res.sendFile('/sitemap.html');
});*/
/*
app.get('/login',function(req,res){
	res.sendFile('login.html',{root: __dirname});
});
*/ 

app.post('/login',function(req,res){

	Authenticate(req.body.username,req.body.password,function(err,fname,user){
		if(!err) {
				req.session.regenerate(function(){
				req.session.user=user.username;
				req.session.role=user.role;
			    res.send("Welcome " + fname);
				})
      		}
		else{
				res.send("That username and password combination was not correct"); 		
			}
	});
});


function Authenticate(username,password,fn){
	pool.getConnection(function(err,connection) {
    if (err) {
          //connection.release();
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }
        var query = connection.query('SELECT * from users where username = ' + 
		connection.escape(username) +' and password =' + connection.escape(password), 
		function(err, rows, fields) {
				connection.release();
				//console.log(query.sql);
				////console.log(rows[0]);
				if(!rows.length) {
	 				//console.log("No user found");
	 				return fn(new Error('cannot find user'));
	 			}
	 			else{
	 				//console.log('user found'+rows[0]);
	 				return fn(null,rows[0].fname,rows[0]);
	 			}
		    });
    });
}


app.post('/registerUser',function(req,res){
	RegisterUser(req.body,function(err,data){
		if(!err){
			res.send("Your account has been registered");
		}
		else{
			res.send(err.message);
		}
	});
})

function RegisterUser(user,fn){
	pool.getConnection(function(err,connection) {
    if (err) {
          connection.release();
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }
	   var query1=connection.query("insert into users values ("+connection.escape(user.fname)+","+connection.escape(user.lname)+","+connection.escape(user.username)+","
						+connection.escape(user.password)+","+connection.escape(user.address)+","+connection.escape(user.city)+","+connection.escape(user.state)+","
						+connection.escape(user.zip)+",DEFAULT,"+connection.escape(user.email)+");",function(err,results){
							connection.release();
						if(err){
							return fn(new Error('There was a problem with your registration'));
						}
						else{
							return fn(null,true);
						}
						});
	
					});
}

app.post('/updateInfo',function(req,res){
	if(req.session.user){
		updateUser(req.session.user,req.body,req,function(err,data){
			if(!err){
				res.send("Your information has been updated");
			}
			else{
				res.send("There was a problem with this action");
			}
		});
	}
	else{
			res.send("You must be logged in to perform this action");
		}
});

function updateUser(name,user,req,fn){
	pool.getConnection(function(err,connection) {
    if (err) {
          connection.release();
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }
        var query1=connection.query("update users set fname= ifnull("+connection.escape(user.fname)+",fname" 
        										  +"), lname= ifnull("+connection.escape(user.lname)+",lname"
        										  +"), address= ifnull("+connection.escape(user.address)+",address"	
        										  +"), city= ifnull("+connection.escape(user.city)+",city"
        										  +"), state= ifnull("+connection.escape(user.state)+",state"
        										  +"), zip= ifnull("+connection.escape(user.zip)+",zip"
        										  +"), email= ifnull("+connection.escape(user.email)+",email"
        										  +"), username= ifnull("+connection.escape(user.username)+",username"
        										  +"), password= ifnull("+connection.escape(user.password)+",password"
        										  +") where username="+connection.escape(name),
        			function(err,results){
							//console.log(query1.sql);
							connection.release();
						if(err){
							return fn(new Error('Cannot update'));
							//console.log("update cannot be done");
						}
						else{
							//console.log("User updated");
							return fn(null,true);
						}
					});
	 			});
}

app.post('/addProducts',function(req,res){
	if(req.session.user){
		AddProducts(req.session,req.body,function(err,data){
			if(!err){
				res.send("The product has been added to the system");
			}
			else{
				res.send(err.message);
			}
		})
   	}
   	else{
   		res.send("You must be logged in to perform this action")
   	}
})

function AddProducts(session,product,fn){
	pool.getConnection(function(err,connection) {
    if (err) {
          connection.release();
          return;
        }
			if(session.role) {
					var query1=connection.query("insert into products values ("+connection.escape(product.productId)
						+","+connection.escape(product.name)+","+connection.escape(product.productDescription)
						+","+connection.escape(product.group)+");",function(err,results){
							//console.log(query1.sql);
							connection.release();
						if(err){
							//console.log("Product cannot be added - duplicate entry");
							return fn(new Error("There was a problem with this action"));
						}
						else{
							//console.log("Products added");
							return fn(null,true);
						}
					});
	 			}
	 			else{
	 				//console.log("Not admin");
	 				return fn(new Error('Only admin can perform this action'));
	 			}
	});
}

app.post('/modifyProduct',function(req,res){
	if(req.session.user){
		updateProduct(req.session,req.body,function(err,data){
			if(!err){
				res.send("The product information has been updated");
			}
			else{
				res.send(err.message);
			}
		})
   	}
   	else{
   		res.send("You must be logged in to perform this action")
   	}
})

function updateProduct(session,product,fn){
	pool.getConnection(function(err,connection) {
    if (err) {
          connection.release();
          return;
        }
		if(session.role) {
				var query1=("update products set name="+connection.escape(product.name)
											+"productDescription="+connection.escape(product.productDescription)
											+" where productId="+connection.escape(product.productId), function (err,results){
					connection.release();
					if(err){
							//console.log("Product cannot be updated - duplicate entry");
							return fn(new Error("There was a problem with this action"));
						}
						else{
						 	//console.log("Products updated");
							return fn(null,true);
						}
					});
			}
			else{
	 				//console.log("Not admin");
	 				return fn(new Error('Only admin can perform this action'));
	 			}
		});
}

app.post('/viewUsers',function(req,res){
	if(req.session.user){
		viewUsers(req.session,req.body,function(err,data){
			if(!err){
				res.send(data);
			}
			else{
				res.send(err.message);
			}
		})
   	}
   	else{
   		res.send("You must be logged in to perform this action")
   	}

});

function viewUsers(session,user,fn){
	pool.getConnection(function(err,connection) {
    if (err) {
          connection.release();
          return;
        }
        var fname=(connection.escape(user.fname)==="NULL")?'%%':'%'+user.fname+'%';
        //console.log(fname);
        var lname=(connection.escape(user.lname)==="NULL")?'%%':'%'+user.lname+'%';
        //console.log(lname);
        if(session.role) {
				var query1=connection.query("select fname,lname from users where fname like ? and lname like ?",[fname,lname], 
					function(err,results,fields){
						connection.release();
						//console.log(query1.sql);
						if(err){
							//console.log("Cannot list users");
							return;
						}
						else{
							//console.log("User list :",results);
							return fn(null,results);
						}
					})
			}
			else{
				//console.log("Not admin");
				return fn(new Error("Only admin can perform this action"));
			}
		});
}



app.post('/viewProducts',function(req,res){
		viewProducts(req.body,function(err,data){
			if(!err){
				res.send(data);
			}
			else{
				res.send(err.message);
			}
		})
});

function viewProducts(product,fn){
	pool.getConnection(function(err,connection) {
    if (err) {
          connection.release();
          return;
        }
        //console.log(connection.escape(product.productId));
        var group=(connection.escape(product.group)==="NULL")?'%%':'%'+product.group+'%';
        //console.log(group);
        var keyword=(connection.escape(product.keyword)==="NULL")?'%%':'%'+product.keyword+'%';
        //console.log(keyword);
        var query1=connection.query("select name from products where productId like ifnull("
        	+connection.escape(product.productId)+",'%%') and `group` like ? and name like ? or productDescription like ?",[group,keyword,keyword],
					function(err,results,fields){
						connection.release();
						//console.log(query1.sql);
						if(err){
							//console.log("Cannot list products");
							return;
						}
						else{
							if(results.length){
								//console.log("Product list :",results);
								return fn(null,results);	
							}
							else{
								return fn(new Error("There were no products in the system that met that criteria"));
							}
							
						}
					})
		});
}


app.get('/Home',function(req,res){
	if(req.session.user){
		res.sendFile('Home.html',{root:__dirname});
	}
	else{
		res.send("No Valid user");
	}
});

app.post('/logout',function(req,res){
	if(req.session.user){
		req.session.destroy();
		res.send("You have been logged out");
		}
	else{
		res.send("You are not currently logged in");
	}
});




app.listen(3001);




