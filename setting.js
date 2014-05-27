module.exports ={
    redis:{
        host:"127.0.0.1",
        port:6379,
        oauth:""
    },
    kafkaConfig:{
         connectionString:'192.168.206.41:2181,192.168.205.9:2181,192.168.205.3:2181',
         partition: [0, 1, 2, 3],
         brokers:[{host:'192.168.205.3',port:9090},{host:'192.168.205.9',port:9090},{host:'192.168.206.41',port:9090}]
    },
    cloud:"http://cloud.91open.com/v1/oauth/valid"
};