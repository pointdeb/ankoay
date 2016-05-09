var database    = require('./database.js');
var UserModel   = database.UserModel;
var MessageModel= database.MessageModel;
var PostModel   = database.PostModel;
var CommentModel= database.CommentModel;
var FriendModel = database.FriendModel;
var mong=database.mong;


var Event = {
    result:'',
    addUser: function (pseudo, name, lname, email, password, city, sexe, profil_pic, cover, taf) {
        new UserModel({
            pseudo: pseudo,
            name: name,
            lname: lname,
            email: email,
            password: password,
            city: city,
            sexe: sexe,
            profil_pic: profil_pic,
            cover: cover,
            taf: taf
        }).save(function (err, users) { });
    },
    delUser: function () {
        CommentModel.remove(function (err, me) { });
        MessageModel.remove(function (err, me) { });
        PostModel.remove(function (err, me) { });
        FriendModel.remove(function (err, me) { });
        console.log('app initialised');
    }, //end delUser
    addLike: function (id,like) {
        PostModel.update({'_id':id},{'like':like},{'w':1},function(err,update){ });
    },
    addFriend: function (user, friends,stat) {
        UserModel.find({'_id':friends},function(err,friend){
            FriendModel.find({$or:[{'user_sender.email':friend[0].email,'user_asked.email':user.email},{'user_asked.email':friend[0].email,'user_sender.email':user.email}]},function (err,f){
                if (f.length==0) {
                    new FriendModel({
                                user_sender:user,
                                user_asked:friend[0],
                                stat:stat
                            }).save(function (err, friend) {
                                if (err) {
                                    console.log('Warning: ' + err);
                                }
                        });
                }
            });
        });
    },
    acceptFriend: function (user,friends,stat) {
        UserModel.find({'_id':friends},function(err,friends){
            FriendModel.update({'user_sender.email':friends[0].email,'user_asked.email':user},{'stat':stat},{'w':1},function (err,friends) {});
        });
    },
    removeFriend: function (user, friend) {
        UserModel.find({'_id':friend},function(err,friends){
            FriendModel.remove({$or:[{'user_sender.email':friends[0].email,'user_asked.email':user},{'user_asked.email':friends[0].email,'user_sender.email':user}]},function (err,f){

            });
        });
    },
    insertMessage: function (sender, destination,object, etat, date, time) {
        new MessageModel({
            sender: sender,
            destination: destination,
            object: object,
            etat: etat,
            date: date,
            time: time
        }).save(function (err, msg) {
            if (err) {
                console.log('Warning: ' + err);
            }
        });
    },
    insertPost: function (user,content_post, like, comment, date, time) {
        new PostModel({
            user:user,
            object: content_post,
            like: like,
            comment: comment,
            date: date,
            time: time
        }).save(function (err, post) {
            if (err) {
                console.log('Warning: ' + err);
            }
        });
    },

    insertComment: function (post, user, object, date, time) {
        new CommentModel({
            post: post,
            user: user,
            object: object,
            date: date,
            time: time
        }).save(function (err, comment) {
            if (err) {
                console.log('Warning: ' + err);
            }
        });
    },

    emailExist: function (email, database) {
        var exist = false;
        for (var i = 0; i <= (database.length - 1); i++) {
            if ((database[i].email === email)) {
                exist = true;
            }
        }
        if (exist) {
            return true;
        }
        else {
            return false;
        }
    },
    pseudoExist: function (pseudo, database) {
        var exist = false;
        for (var i = 0; i <= (database.length - 1); i++) {
            if ((database[i].pseudo === pseudo)) {
                exist = true;
            }
        }
        if (exist) {
            return true;
        }
        else {
            return false;
        }
    },
    changeProfilPic: function(user,data){
        UserModel.update({'_id':user},{'profil_pic':data},{'w':1},function(err,update){ });
        PostModel.find({'user._id':user},function(err,update){
            if(!err){ 
                for(var i=0;i<update.length;i++){
                    PostModel.update({'_id':update[i]._id},{'user.profil_pic':data},{'w':1},function(err,update){ });
                }
            }
        });
        CommentModel.find({'user._id':user},function(err,update){
            if(!err){ 
                for(var i=0;i<update.length;i++){
                    CommentModel.update({'_id':update[i]._id},{'user.profil_pic':data},{'w':1},function(err,update){ });
                }
            }
        });
        CommentModel.find({'user._id':user},function(err,update){
            if(!err){ 
                for(var i=0;i<update.length;i++){
                    CommentModel.update({'_id':update[i]._id},{'user.profil_pic':data},{'w':1},function(err,update){ });
                }
            }
        });
        FriendModel.find({$or:[{'user_sender._id':user},{'user_asked._id':user}]},function(err,update){
            if(!err){ 
                for(var i=0;i<update.length;i++){
                    if (update[i].user_sender._id==user) {
                        FriendModel.update({'_id':update[i]._id},{'user_sender.profil_pic':data},{'w':1},function(err,update){ });
                    }
                }
            }
        });
    },
    changeCover: function(user,data){
        UserModel.update({'_id':user},{'cover':data},{'w':1},function(err,update){
            if(err){ console.log(err);}
        });
    }
}//end Class Event


exports.Event = Event;