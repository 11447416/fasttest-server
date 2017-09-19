var express = require('express');
var dateFormat = require('dateformat');
var router = express.Router();
var fs = require('fs');
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: '乐育安卓测试分发系统'});
});

router.get('/down', function (req, res, next) {
    var datafile = './public/data/uploadData.json';
    fs.readFile(datafile, function (err, data) {
        if (err) {
            //发生错误
            res.render('down', {title: '发生错误', msg: "发生错误：" + err});
        } else {
            var jsonData = JSON.parse(data);
            var list = [];
            for (var i = jsonData.data.length - 1; i >= 0; i--) {
                var item = jsonData.data[i];
                item.time = dateFormat(new Date(item.time), "yyyy-mm-dd HH:MM:ss");
                list.push(item)
            }
            console.log(list)
            res.render('down', {
                title: '下载apk安装包',
                msg: jsonData.msg + ",共计上传 " + jsonData.count + "个安装包！",
                list: list
            })
        }
        jsonData
    });
});

module.exports = router;
