var csv = require('csv');
var redisClient =require("./redis");
var tools =require('./tool')
var Q = require("q");
module.exports = {
    toCSV :function(arr){
        var defer = Q.defer();
        csv().from.array(arr).to(function(data){
            defer.resolve(data);
        }).on("error",function(err){
            defer.reject(new Error(err.message));
        });
        return defer.promise;
    },
    fromCSV:function(str){
        var defer = Q.defer();
        csv().from.string(str.replace(/(\\n)/g,"\n")).to.array(function(data){
            defer.resolve(data);
        }).on("error",function(err){
            defer.reject(new Error(err.message));
        });
        return defer.promise;
    },
    mergeData:function(body,topic){
        var defer = Q.defer(),
            promises =[redisClient.getIndex(topic)],
            that =this;
        if("multiData" in body){
            promises[1] = this.fromCSV(body.multiData);
        } else{
            var arr = [[],[]];
            for (var k in body) {
                if (k == "accessToken") {
                    continue;
                }
                arr[0].push(k);
                arr[1].push(body[k]);
            }
            promises[1]= Q.fcall(function(){
                return arr;
            });
        }
        Q.all(promises).then(function(result) {
            var str = (result[0]||"writeDate,appId,logDate").split(',');
            var arr = result[1].length ? result[1] : [[]];
            arr[0].forEach(function (d) {
                ~str.indexOf(d) || str.push(d);
            });
            if (result[0] !== str.toString() && str.length >3) {
                redisClient.setIndex(topic,str.toString()).fail(function (err) {
                    console.error(err.message);
                });
            }
            defer.resolve({ keys:str, values:arr });
        },function(err){
             defer.reject(new Error(err.message));
        });
        return defer.promise;
    },
    regroupData:function(token,body,topic){
        var defer = Q.defer();
        var promises = [redisClient.getAppId(token),this.mergeData(body,topic)],result =[],
            head=[]; writeDate = tools.formartDate(Date.now(),"yyyy-MM-dd HH:mm:ss")
            ,that= this;
        Q.all(promises).then(function(data){
            var newKeys = data[1].keys; oldKeys = data[1].values.shift(),
                values = data[1].values,appId =data[0];
            for(var i= 0,len = values.length; i< len; i++){
                var temp =[];
                newKeys.forEach(function(v,idx){
                   var oi = oldKeys.indexOf(v);
                   switch (v){
                       case "writeDate":
                           temp[idx]=writeDate;
                           break;
                       case "appId":
                           temp[idx] = appId;
                           break;
                       case "logDate":
                           temp[idx] = tools.formartDate(+values[i][oi] || Date.now(), "yyyy-MM-dd HH:mm:ss");
                           break;
                       default :
                           temp[idx] = ~oi ? decodeURI(values[i][oi]) :"";
                           break;
                   }
                });
                result[i]=temp;
            }
            newKeys.forEach(function(d,i){
                head[i] = d;
            });
            result.splice(0,0,head);
            that.toCSV(result).then(function(data){
                defer.resolve(data);
            },function(err){
                defer.reject(new Error(err.message));
            });
        },function(err){
            defer.reject(new Error(err.message));
        });
        return defer.promise;
    }
};