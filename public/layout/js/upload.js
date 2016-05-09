window.addEventListener("load", Ready);
 
function Ready(){
    if(window.File && window.FileReader){ //These are the relevant HTML5 objects that we are going to use
        document.getElementById('btn-upload').addEventListener('click', StartUpload); 
        document.getElementById('profil_pic').addEventListener('change', FileChosen);
    }
    else
    {
        document.getElementById('file_name').value = "Your Browser Doesn't Support The File API Please Update Your Browser";
    }
}
var SelectedFile;
function FileChosen(evnt) {
    SelectedFile = evnt.target.files[0];
    document.getElementById('file_name').value = SelectedFile.name;
}

var socket = io.connect('http://localhost:8080');
var FReader;
var Name;
function StartUpload(){
    if(document.getElementById('profil_pic').value != "")
    {
        FReader = new FileReader();
        Name = document.getElementById('file_name').value;
        FReader.onload = function(evnt){
            socket.emit('Upload', { 'Name' : Name, Data : evnt.target.result });
        }
    }
    else
    {
        alert("Please Select A File");
    }
}