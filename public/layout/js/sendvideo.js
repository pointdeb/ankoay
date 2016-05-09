var canvas=document.getElementById('preview');
var context =canvas.getContext("2d");
var vendorUrl =window.URL || window.webkitURL;
navigator.getMedia= navigator.getUserMedia || 
				navigator.webkitGetUserMedia||
				navigator.mozGetUserMedia||
				navigator.msGetUserMedia;
	canvas.width =300; 
	canvas.height =300;
	context.width =canvas.width;
	context.height =canvas.height;
var video =document.getElementById("video-p");
var roomName='/'+document.getElementById("roomName").value;
var socket =io(roomName);
function logger(msg){
	$('#logger').text(msg);
	}
function loadCam(stream){
		video.src= window.URL.createObjectURL(stream);
		logger("Camera Connecter!");
	}
function loadFail(){
		logger("Camera non connecter!");
	}
function viewVideo(video,context){
		context.drawImage(video,0,0,context.width,context.height);
		socket.emit('starcall',canvas.toDataURL('image/webp'));
	}
function startCall(){
		if (navigator.getMedia) {
				navigator.getMedia({video: true},loadCam,loadFail);
			}
		setInterval(function startCall(){
			viewVideo(video,context);
		},0);
}
socket.on('stream',function(data){
	var video_p=document.getElementById('video-getcall');
		video_p.src=data;
		console.log(data);
});