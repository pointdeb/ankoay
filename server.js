
/*
	var
*/
var date            =new Date();
var dateDayMonthYear=date.getDate()+'/'+date.getMonth()+'/'+date.getYear();
var dateHourMinSec  =date.getHours()+':'+date.getMinutes();
var usr_session     ='';
var express         =require('express');
var app             =new express();
var http            =require('http').Server(app);
var io              =require('socket.io')(http);
var session         =require('express-session');
var clientSession   =require('client-sessions');
var bodyParser      =require('body-parser');
var md5             =require('md5');
var requestIp       =require('request-ip');
var fs              =require('fs');
var exec            =require('child_process').exec;
var formidable      =require('formidable');
var util            =require('util');
var fs              =require('fs-extra');
var action          =require('./cores/event.js');
var event           =action.Event;
var database        =require('./cores/database.js');
var urlencodedParser=bodyParser.urlencoded({ extended: false });
var error           ='';
var all_user        =[];

var menu=({
		notification_nbr:0,
		newcont_nbr:0,
		newmsg_nbr:0
});

var page={
    name:'Home',
    title:'Bienvenue',
    servermsg:''
};
var Connected=[];

function addConnection(request){
    request.session.user.ip=requestIp.getClientIp(request);
    //request.session.user.ip=request.connection.remoteAddress;
    Connected.push(request.session.user);
    request.session.user.connectId=Connected.length -1;
    console.log(Connected);
}
/*
	Routing
*/
app.use(session({secret: 'secret'}));
app.use(clientSession({
    cookieName: 'session',
    secret: 'random_string_goes_here',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));
app.use(bodyParser());
app.use(function(req, res, next) {
    if (req.session && req.session.user) {
        database.UserModel.findOne({ email: req.session.user.email }, function(err, user) {
            if (user) {
                req.user = user;
                delete req.user.password; // delete the password from the session
                req.session.user = user;  //refresh the session value
                res.locals.user = user;
            }
            // finishing processing the middleware and run the route
            next();
        });
    } else {
        //res.redirect('/');
        next();
    }
});
app.use(express.static(__dirname+"/public"));

app.set('views',__dirname+"/views");

app.get('/test',function(req,res){
    res.render('test.jade');
});

function handler (req, res) {
  fs.readFile(__dirname + '/index.jade',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.jade');
    }
    res.writeHead(200);
    res.end(data);
  });
}


app.get('/', function (req, res) {
    page.servermsg='';
    database.UserModel.find(function (err, users) {
        if (err) {
            console.log('Warning: ' + err);
        }
        else {
                all_user=users;
                res.render('index.jade', { error: error, result: users });
        }
    });
});


app.get('/deluser', function (req, res) {
    event.delUser();
    res.redirect('/');
});

app.get('/home',function(req,res){
    if(req.session && (typeof req.session.user!=='undefined')){
        database.PostModel.find(function(err,posts){
            if(!err){
                    page.name="Home";
                    page.title='Acceuil Voromahery';
                    page.servermsg='';
                    res.render('home.jade', {
                        page:page,
                        menu:menu,
                        user:req.session.user,
                        post:posts,
                        comment:0,
                        all_user:all_user
                    });
                }
        });
    }
    else{
        res.redirect('/');
    }
});
app.get('/comment/:id',function(req,res){
    if(req.session && (typeof req.session.user!=='undefined')){
        database.PostModel.findById(req.params.id,function(err,posts){
            database.CommentModel.find({'post':req.params.id},function(err,comments){
                if(!err){
                    page.name="Comments";
                    page.title='Comment';
                    page.servermsg='';
                    res.render('comment.jade', {
                        page:page,
                        menu:menu,
                        user:req.session.user,
                        posts:posts,
                        comment:comments,
                        all_user:all_user
                    });
                }
            });
        });
    }
    else{
        res.redirect('/');
    }
});

app.get('/profil/:id',function(req,res){
    if(req.session && (typeof req.session.user!=='undefined')){
        database.UserModel.findById(req.params.id,function(err,users){
            if(!err){
                if (req.session.user._id!==users._id) {
                    database.FriendModel.find({$or:[{'user_sender._id':req.session.user._id,'user_asked._id':users._id},{'user_asked._id':req.session.user._id,'user_sender._id':users._id}]},function(err,f){
                            var fr=false;
                            console.log(f.length);
                            if(f.length!==0){
                                if(f[0].stat!==0){
                                    fr=true;
                                }
                            }
                            page.name='Profil';
                            page.title=req.session.user.pseudo;
                            page.servermsg='';
                            res.render('profil.jade', {
                                    page:page,
                                    menu:menu,
                                    user:req.session.user,
                                    act_id:req.params.id,
                                    all_user:users,
                                    friend:fr
                                });
                    });   
                }
                else{
                    page.name='Profil';
                    page.title=req.session.user.pseudo;
                    page.servermsg='';
                    res.render('profil.jade', {
                    page:page,
                    menu:menu,
                    user:req.session.user,
                    act_id:req.params.id,
                    all_user:users,
                    friend:true
                });
                }
            }
        });
    }else{
        res.redirect('/');
    }
});

app.get('/message/',function(req,res){
    if(req.session && (typeof req.session.user!=='undefined')){
        page.name='Messages';
        page.title=req.session.user.pseudo+' messages';
        page.servermsg='';
        database.MessageModel.find({$or:[{'destination':req.session.user._id,'etat':0},{'sender':req.session.user._id}]},function(err,messages){
            if((!err)&&(typeof messages[0]!=='undefined')){
                var destination=messages[0].sender;
                if(destination===req.session.user._id){
                    destination=messages[0].destination;
                }
                database.UserModel.findById({'_id':destination},function (err,dest) {
                    res.render('messages.jade',{
                        page:page,
                        menu:menu,
                        user:req.session.user,
                        messages:messages,
                        all_user:all_user,
                        other:dest
                    });
                });
            }
            else{
                page.servermsg='Vous avez aucun message disponible';
                res.render('messages.jade',{
                        page:page,
                        menu:menu,
                        user:req.session.user,
                        messages:messages,
                        all_user:all_user,
                        other:[]
                    });

            }
        }).sort({'_id':-1}).limit(8);
    }
    else{
        res.redirect('/');
    }
});


app.get('/message/:id',function(req,res){
    if(req.session && (typeof req.session.user!=='undefined')){
        page.name='Messages';
        page.title=req.session.user.pseudo+' messages';
        var findCondition="{$or:[{'destination':"+req.session.user._id+",'sender':"+req.params.id+"},{'sender':"+req.session.user._id+",'destination':"+req.params.id+"]}";
        var updateCondition="{'destination':"+req.session.user._id+",'sender':"+req.params.id+",'etat':0}";
        database.MessageModel.find(findCondition,function(err,messages){
            if(!err){
                if(messages[0].destination==req.session.user._id){
                    database.MessageModel.update(updateCondition,{'etat':1},{'w':1},function(error,messagess){
                        if(error){
                            console.log(err);
                        }
                    });
                }
                var destination=messages[0].sender;
                if(destination==req.session.user._id){
                      destination=messages[0].destination;
                  }
                database.UserModel.findById({'_id':destination},function (err,dest) {
                     res.render('message.jade',{
                         page:page,
                         menu:menu,
                         user:req.session.user,
                         messages:messages,
                         all_user:all_user,
                         other:dest
                      });
                  });

            }
        });
    }
    else{
        res.redirect('/');
    }
});

app.get('/contact/',function(req,res){
    if(req.session && (typeof req.session.user!=='undefined')){
        database.FriendModel.find({$or:[{'user_sender._id':req.session.user._id},{'user_asked._id':req.session.user._id}]},function(err,friends){
            if((!err)&&(typeof friends[0]!=='undefined')){
                            page.name='Contact';
                            page.title=req.session.user.pseudo+' contact';
                            page.servermsg='';
                            res.render('contact.jade', {
                                page:page,
                                menu:menu,
                                user:req.session.user,
                                friends:friends
                            });

            }
            else{
                page.servermsg='Aucune contact touver';
                res.redirect('/home');
            }
        });
    }
    else{
        res.redirect('/');
    }
});


app.get('/allusers/',function(req,res){
    if(req.session && (typeof req.session.user!=='undefined')){
        database.UserModel.find({'_id':{$ne:req.session.user._id}},function(err,users){
            if(!err){
                page.name='Tous les utilisateurs';
                page.title=page.name;
                page.servermsg='';
                res.render('allusers.jade', {
                    page:page,
                    menu:menu,
                    user:req.session.user,
                    users:users
                });
            }
            else{
                console.log(err);
                res.redirect('/home');
            }
        });
    }
    else{
        res.redirect('/');
    }
});

app.get('/call/:room',function(req,res){
    if(req.session && (typeof req.session.user!=='undefined')){
        //var room = io.of('/'+req.params.room);
        var room = io.of('/'+req.params.room);
        room.on('connection', function(socket){
            socket.on('starcall',function (data) {
                room.emit('stream',data);
            });
        });
        page.name='Appel video';
                page.title=page.name;
                page.servermsg='';
                res.render('call.jade', {
                    page:page,
                    menu:menu,
                    user:req.session.user,
                    roomName:req.params.room
                });
    }
    else{
        res.redirect('/');
    }
});

app.get('/getcall/:room',function(req,res){
    if(req.session && (typeof req.session.user!=='undefined')){
                page.name='Appel video';
                page.title=page.name;
                page.servermsg='';
                res.render('getcall.jade', {
                    page:page,
                    menu:menu,
                    user:req.session.user,
                    roomName:req.params.room
                });
    }
    else{
        res.redirect('/');
    }
});

app.get('/logout',function(req,res){
	if(req.session && (typeof req.session.user!=='undefined')){
        error='';
        req.session.destroy();
        res.redirect('/');
    }
    else{
        res.redirect('/');
    }
});





/*
    Processing
*/

app.post("/singup",function(req,res){
    if (req.body.user_password===req.body.user_password_confirm){
        database.UserModel.find(function (err, users) {
            if (!err) {
                if ((!event.pseudoExist(req.body.user_pseudo, users)) && (!event.emailExist(req.body.user_email, users))) {
                    event.addUser(
                        req.body.user_pseudo,
                        req.body.user_name,
                        req.body.user_lname,
                        req.body.user_email,
                        md5(req.body.user_password),
                        req.body.user_city,
                        req.body.user_sexe,
                        '/img/user.jpg',
                        '/img/cover.jpg',
                        req.body.user_taf
                    );
                    res.redirect('/');
                }
                else {
                    error = 'Email or Pseudo already used';
                    res.redirect('/');
                }
            }
        });
    }
    else{
        error='Password dont match';
        res.redirect('/');
    }
});

app.post("/identication",function(req,res){
    database.UserModel.find(function (err, users) {
        if (!err) {
            var exist=false;
            for (var i =0; i<=(users.length -1); i++) {
                if((users[i].email===req.body.user_email)&&(users[i].password===md5(req.body.user_password))){
                    req.session.user=users[i];
                    delete req.session.user.password;
                    exist=true;
                    req.session.user.ip=requestIp.getClientIp(req);
                    //request.session.user.ip=request.connection.remoteAddress;
                    Connected.push(req.session.user);
                    req.session.user.connectId=Connected.length -1;
                    console.log('Connected: '+Connected[req.session.user.connectId].pseudo+' to '+Connected[req.session.user.connectId].ip);
                    res.redirect('/home');
                }
            }
            if (!exist) {
                error='eMail or Password  was Wrong';
                res.redirect('/');
            }
        }
    });
        
});
app.post("/processpost",function(req,res){
    if(req.session && (typeof req.session.user!=='undefined')){
        event.insertPost(
            req.session.user,
            req.body.postcontent,
            0,
            0,
            dateDayMonthYear,
            dateHourMinSec

        );
        res.redirect('/home');
    }
    else{
        res.redirect('/');
    }
});


app.post("/processcomment",function(req,res){
    event.insertComment(
        req.body.post_id,
        req.session.user,
        req.body.content_comment,
        dateDayMonthYear,
        dateHourMinSec
    );
    res.redirect('/comment/'+req.body.post_id);
});

app.post("/processmsg",function(req,res){
    if(req.session && (typeof req.session.user!=='undefined')){
        if(req.body.destination!==req.session.user.email){
            database.UserModel.find({'email':req.body.destination},function (err,dest) {
                if((!err)&&(typeof dest[0]!=='undefined')){
                    event.insertMessage(
                        req.session.user._id,
                        dest[0]._id,
                        req.body.msg_content,
                        0,
                        dateDayMonthYear,
                        dateHourMinSec
                    );
                    res.redirect('/message');
                }else{
                    error='Any users have this mail ('+req.body.destination+')';
                    console.log(error);
                    res.redirect('/message');
                }
            });
        }
        else{
            error='You cant send msg to yourself';
            res.redirect('/message');
        }
    }
    else {
        res.redirect('/');
    }
});

app.get("/processaddfriend/:id",function(req,res){
    event.addFriend(req.session.user,req.params.id,0);
    res.redirect('/contact');
});

app.get("/processacceptfriend/:id",function(req,res){
    event.acceptFriend(req.session.user.email,req.params.id,1);
    res.redirect('/contact');
});

app.get("/processremovefriend/:id",function(req,res){
    event.removeFriend(req.session.user.email,req.params.id);
    res.redirect('/contact');
});

app.get("/processlike/:id/:like",function(req,res){
    event.addLike(req.params.id,parseInt(req.params.like)+1);
    res.redirect('/home');
});

app.post("/processchangeprofilpic",function(req,res){
    var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
               util.inspect({fields: fields, files: files});
        });
             
        /*form.on('progress', function(bytesReceived, bytesExpected) {
                 var percent_complete = (bytesReceived / bytesExpected) * 100;
                 console.log(percent_complete.toFixed(2));
         });*/
             
        form.on('error', function(err) {
            console.error(err);
        });
             
        form.on('end', function(fields, files) {
                /* Temporary location of our uploaded file */
            var temp_path = this.openedFiles[0].path;
                   /* The file name of the uploaded file */
            var file_name = this.openedFiles[0].name;
                    /* Location where we want to copy the uploaded file */
            var new_location = './public/img/'+ file_name;
             
            fs.copy(temp_path, new_location, function(err) {  
                    if (err) {
                         console.error(err);
                     } else {
                        event.changeProfilPic(req.session.user._id,'/img/'+ file_name);
                        res.redirect('/profil/'+req.session.user._id);
                      }
                    });
        });

});
app.post("/processchangecover",function(req,res){
    var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
               util.inspect({fields: fields, files: files});
        });
             
        form.on('progress', function(bytesReceived, bytesExpected) {
                 var percent_complete = (bytesReceived / bytesExpected) * 100;
                 console.log(percent_complete.toFixed(2));
         });
             
        form.on('error', function(err) {
            console.error(err);
        });
             
        form.on('end', function(fields, files) {
                /* Temporary location of our uploaded file */
            var temp_path = this.openedFiles[0].path;
                   /* The file name of the uploaded file */
            var file_name = this.openedFiles[0].name;
                    /* Location where we want to copy the uploaded file */
            var new_location = './public/img/'+ file_name;
             
            fs.copy(temp_path, new_location, function(err) {  
                    if (err) {
                         console.error(err);
                     } else {
                        event.changeCover(req.session.user._id,'/img/'+ file_name);
                        res.redirect('/profil/'+req.session.user._id);
                      }
                    });
        });

    
});

app.post("/search",function(req,res){
    var Regex = require("regex");
    var key='/'+req.body.key+'/';
    var regex = new Regex(key);
    database.UserModel.find(function(err,users){
        if(!err){
            for(var i=0 ; i<users.length;i++){
                if(regex.test(users[i].pseudo)){
                    console.log(users);
                    page.name='Tous les utilisateurs';
                    page.title=page.name;
                    page.servermsg='';
                    res.render('allusers.jade', {
                        page:page,
                        menu:menu,
                        user:req.session.user,
                        users:users
                });
            }
        }
        }
    });
});


/*
    export var
*/
exports.http=http;
exports.express=app;



/*io.on('connection',function(socket){
	socket.on('stream',function(data){
		socket.broadcast.emit('stream',data.data);
        console.log('id:'+socket.id+' Room:'+socket.roomID);
	});
    socket.on('Upload', function (data){
        var Name = data['Name'];
        Files[Name]['Downloaded'] += data['Data'].length;
        Files[Name]['Data'] += data['Data'];
        if(Files[Name]['Downloaded'] == Files[Name]['FileSize']) //If File is Fully Uploaded
        {
            fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
                console.log('file');
            });
        }
    });
});
*/


