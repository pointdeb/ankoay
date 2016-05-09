var server=require('./server.js');
server.http.listen(8080,function(){
	console.log('server runing on http://localhost:8080 ...');
});