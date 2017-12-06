var express = require('express');
var dateFormat = require('dateformat');
var router = express.Router();
var fs = require('fs');
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: '乐云互动安卓测试分发系统'});
});

router.get('/down', function (req, res, next) {
    var datafile = './public/data/uploadData.json';
    fs.readFile(datafile, function (err, data) {
        if (err) {
            //发生错误
            res.render('error', {title: '发生错误', msg: "可能你还没有上传过任何文件,具体错误：" + err});
        } else {
            var jsonData = JSON.parse(data);
            var list = [];
            for (var i = jsonData.data.length - 1; i >= 0; i--) {
                var item = jsonData.data[i];
                item.time = dateFormat(new Date(item.time), "yyyy-mm-dd HH:MM:ss");
                list.push(item)
            }
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
