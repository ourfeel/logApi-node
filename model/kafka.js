var kafka = require("kafka-node"),
    Producer = kafka.Producer,
    consistentHashing = require("consistent-hashing"),
    Q = require("q"),
    setting = require("../setting"),
    nodes = new consistentHashing(setting.kafkaConfig.partition),
    client = new kafka.Client(setting.kafkaConfig.connectionString),
    producer = new Producer(client);
var p = (function(){
    var df= Q.defer();
    producer.on("ready",function(){
       df.resolve();
    });
    return df.promise;
}());
module.exports = {
    sendMessages: function (topic, token, csv) {
        var node = nodes.getNode(token),
            defer = Q.defer();
        p.then(function(){
            producer.send([
                { topic: topic, messages: csv, partition: node }
            ], function (err, data) {
                if (err || !data) {
                    defer.reject(new Error(err ? err.messages : "kafka Error"));
                } else {
                    defer.resolve(data);
                }
            });
        });
        return defer.promise;
    }
};