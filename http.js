var connect = require("connect");
var connectRoute = require('connect-route');
var http =require("http");
var bodyParser = require('body-parser');
var cluster =require('cluster');
var csvClient = require('./model/csv');
var tools = require('./model/tool');

var app = connect()
    .use(bodyParser())
    .use(connect.query())
    .use(connectRoute(function (route) {
        route.get("/",function(req,res){
            res.end("welcome")
        });
        route.get("/log/:topic",function(req,res){
            var args = {};
            if (req.method == "POST") {
                args = req.body;
            } else {
                args = qs.parse(req._parsedUrl.query);
            }
            if (tools.isEmptyObject(args) || !args.accessToken) {
                //next(new Error("参数无效"));
            }
            var token = args.accessToken,topic =req.params.topic
            csvClient.regroupData(token, args, topic ).then(function (data) {
//        kafkaClient.sendMessages(req.params.topic, args.accessToken, data).fail(function (err) {
//            console.error(err.message)
//        });
//         kafka2.send(topic,token,data).then(function(data){
//             console.log(data);
//         },function(err){
//             console.error(err.message);
//         });
                console.log(data);
            }, function (err) {
                console.error(err.message);
            });
            res.end();
        });

    }));


if(cluster.isMaster){
    var cpus = require('os').cpus().length;
    for(var i=0;i<cpus;i++){
        cluster.fork();
    }
    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
        cluster.fork();
    });

}else {
    http.createServer(app).listen(8080);
}
//http.createServer(app).listen(8080,function(){
//    console.log("ok")
//});