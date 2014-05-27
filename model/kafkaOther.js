var Q = require('q'),
    setting = require("../setting"),
    kafkaesque = require('kafkaesque')({
    brokers:setting.kafkaConfig.brokers,
    clientId:'HyKafka',
    maxBytes:2000000
}),consistentHashing = require("consistent-hashing"),
    nodes= new consistentHashing(setting.kafkaConfig.partition);
var def = Q.defer(),promise = def.promise;
kafkaesque.tearUp(function(){
     def.resolve();
});
module.exports = {
    send : function(topic,token,csv){
        var defer = Q.defer(),node= nodes.getNode(token)
        promise.then(function(){
            kafkaesque.produce({topic:topic,partition:node},[csv],function(err,res){
                 if(err){
                     defer.reject(err.message);
                 }else{
                     defer.resolve(res);
                 }
            });
        });
        return defer.promise;
    }

};
