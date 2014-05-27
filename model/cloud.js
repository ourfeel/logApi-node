var request = require("request");
var Q = require("q")
var setting = require("../setting");
module.exports = {
    valid :function(token){
        var defer = Q.defer();
        request.get(setting.cloud +"?access_token="+token,function(err,response,body){
            if(!err && response.statusCode == 200){
                var json = JSON.parse(body);
                defer.resolve(json);
            }else{
                defer.reject(new Error(err.message));
            }
        });
        return defer.promise;
    }

};