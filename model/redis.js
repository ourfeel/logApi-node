var setting = require("../setting");
var redis = require("redis");
var Q = require("q");
var cloud = require("./cloud");
var client = redis.createClient(setting.redis.port, setting.redis.host);
client.on("error",function(err){
    console.error(err.message);
});
module.exports = {
    getToken: function (token) {
        var hash = 'log:token:'+ token,defer = Q.defer();
        client.hmget(hash,"client_id", function (err, data) {
            if (err) {
                defer.reject(new Error(err.message));
            } else {
                defer.resolve(data.shift());
            }
        });
        return defer.promise;
    },
    setToken: function (token, obj) {
        var hash = "log:token:" + token,defer =Q.defer();
        client.hmset(hash, obj, function (err, data) {
            if (err) {
                defer.reject(new Error(err.message));
            } else {
                defer.resolve(data);
                client.expire(hash, 86400);
            }
        });
        return defer.promise;
    },
    getIndex: function (topic) {
        var defer = Q.defer(),key = "log:topic:" + topic;
        client.get(key, function (err, data) {
            if (err) {
                defer.reject(new Error(err.message));
            } else {
                defer.resolve(data);
            }
        });
        return defer.promise;
    },
    setIndex: function (topic, index) {
        var defer = Q.defer(),key = "log:topic:" + topic;
        client.set(key, index, function (err, data) {
            if (err) {
                defer.reject(new Error(err.message));
            } else {
                defer.resolve(data);
            }
        });
        return defer.promise;
    },
    getAppId: function (token) {
        var defer = Q.defer(), that = this;
        this.getToken(token).then(function (data) {
            if (!data) {
                cloud.valid(token).then(function (data) {
                    if (!data.code && data.Data) {
                        that.setToken(data.Data.access_token, data.Data).fail(function (err) {
                            console.error(err.message);
                        });
                        defer.resolve(data.Data.client_id);
                    } else {
                        defer.reject(new Error("token验证失败"));
                    }
                }, function (err) {
                    defer.reject(new Error(err.message));
                });
            } else {
                defer.resolve(data);
            }
        }, function (err) {
            defer.reject(new Error(err.message));
        });
        return defer.promise;
    }
};