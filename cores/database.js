var mongoose = require('mongoose');
 	mongoose.connect('mongodb://127.0.0.1/testchat');
 var db = mongoose.connection;
 var postSchema= new mongoose.Schema({
     user:Object,
     object: String,
     like:Number,
     date:String,
     time:String
 });
 var PostModel=mongoose.model('Posts',postSchema);
 var userSchema = new mongoose.Schema({
                 pseudo: String,
                 name: String,
                 lname: String,
                 email: String,
                 password: String,
                 city: String,
                 sexe: String,
                 profil_pic: String,
                 cover: String,
                 taf: String
 });
 var UserModel=mongoose.model('Users',userSchema);

 var messageSchema = new mongoose.Schema({
     sender: String,
     destination:String,
     object: String,
     etat: Number,
     date: String,
     time: String
 });
 var MessageModel=mongoose.model('Messages',messageSchema);

 var commentSchema = new mongoose.Schema({
     post: String,
     user: Object,
     object: String,
     date: String,
     time: String
 });
 var CommentModel=mongoose.model('Comments',commentSchema);

 var friendSchema = new mongoose.Schema({
                user_sender:Object,
		        user_asked:Object,
                stat:Number
 });
 var FriendModel=mongoose.model('Friends',friendSchema);

 db.on('open', function () {
     console.log('server mongodb runinig ...');
 });



 exports.UserModel = UserModel;
 exports.PostModel = PostModel;
 exports.MessageModel = MessageModel;
 exports.FriendModel = FriendModel;
 exports.CommentModel = CommentModel;