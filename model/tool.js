module.exports = {
    object_lower: function (obj) {
        var result = {};
        if (this.isObject(obj)) {
            for (var o in obj) {
                result[o.toLowerCase()] = obj[o];
            }
        }
        return result;
    },
    isTypt: function (type, obj) {
        return Object.prototype.toString.call(obj) == "[object " + type + "]";
    },
    isObject: function (obj) {
        return this.isTypt("Object", obj);
    },
    formartDate: function (unixTime, fmt) {
        var dateTime = new Date(unixTime)
        if (isNaN(dateTime)) {
            dateTime = new Date();
        }
        var o = {
            "M+": dateTime.getMonth() + 1,                 //月份
            "d+": dateTime.getDate(),                    //日
            "H+": dateTime.getHours(),                   //小时
            "m+": dateTime.getMinutes(),                 //分
            "s+": dateTime.getSeconds(),                 //秒
            "q+": Math.floor((dateTime.getMonth() + 3) / 3), //季度
            "S": dateTime.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (dateTime.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    },

    isEmptyObject: function (obj) {
        if (this.isObject(obj)) {
            for (var i in obj) {
                return false;
            }
            return true;
        }
        return false;
    }

};
