var express = require('express');
var router = express.Router();
var csvClient = require('../model/csv');
var kafkaClient = require('../model/kafka');
var tools = require('../model/tool');
var kafka2 = require('../model/kafkaOther');

router.get('/', function (req, res, next) {
    res.end("welcome to Nodejs");
});

router.all('/log/:topic', function (req, res, next) {
    var args = {};
    if (req.method == "POST") {
        args = req.body;
    } else {
        args = req.query;
    }
    if (tools.isEmptyObject(args) || !args.accessToken) {
        next(new Error("参数无效"));
    }
    var token = args.accessToken,topic =req.params.topic
    csvClient.regroupData(token, args, topic ).then(function (data) {
        kafkaClient.sendMessages(req.params.topic, args.accessToken, data).fail(function (err) {
            console.error(err.message)
        });
         kafka2.send(topic,token,data).then(function(data){
             console.log(data);
         },function(err){
             console.error(err.message);
         });
        //console.log(data);
    }, function (err) {
        console.error(err.message);
    });
    res.end();

});

router.get('/test', function (req, res) {
    request.post("http://192.168.205.3:3000/log/nodejs", {form: {
        accessToken: "dccab1fa2f734482bffecc66573f37e9",
        logDate: 1400207140128,
        a: Math.random(),
        clientId: 1,
        userId: 123
    }}, function (err) {
        if (err) {
            console.error("no");
        } else {
            console.log("ok");
        }
    });
    res.end();
});

module.exports = router;
