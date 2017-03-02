var express = require('express');
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');

var router = express.Router();

/* 上传页面 */
router.get('/', function (req, res, next) {
    res.render('upload', {title: '测试包上传'});
});

/* 网页上传*/
router.post('/', function (req, res, next) {
    upload(req,res,'web');
});
/* 网页上传*/
router.post('/api', function (req, res, next) {
    upload(req,res,null);
});

/**
 * 处理和返回
 * @param req
 * @param res
 */
function upload(req,res,api) {
    //生成multiparty对象，并配置上传目标路径
    var form = new multiparty.Form({uploadDir: process.cwd()+'/public/apk/'});
    form.encoding = 'utf-8';
    //上传完成后处理
    form.parse(req, function (err, fields, files) {
        if(err)throw err;
        if(!files){
            response(res,'请选择上传文件',api);
            return;
        }
        var inputFile = files.file[0];
        if(inputFile.size<=0){
            response(res,'请选择上传文件.',api);
            return;
        }
        var filesTmp = JSON.stringify(files, null, 2);
        if(!fields||!fields['des']||!fields['des'][0]){
            response(res,'升级包必须要有描述',api)
        }else if (err) {
            response(res,err.message,api)
        } else {

            var uploadedPath = inputFile.path;
            var dstPath = '/apk/' + new Date().getTime()+'.apk';
            //重命名为真实文件名
            fs.rename(uploadedPath, './public'+dstPath, function (err) {
                if (err) {
                    response(res,err.message,api)
                } else {
                    //跟新本地的记录文件
                    saveRecord(dstPath,fields['des'][0],function (err) {
                        if (err){
                            response(res,err.message,api)
                        }else{
                            response(res,'上传成功',api)
                        }
                    })
                }
            });
        }
    });
}
/**
 * 返回结果
 * @param res
 * @param result
 * @param api
 */
function response(res, result, api) {
    if(null==api){
        res.send(result)
    }else{
        res.render('upload', {title: '上传结果', content: result+"\n"});
    }
}
/**
 * 保存上传的文件
 * @param path
 * @param des
 */
function saveRecord(path, des, fun) {
    var datafile = './public/data/uploadData.json';
    fs.readFile(datafile, {flag: 'r'}, function (err, data) {
        if (err) {
            //发生错误，就重新创建文件
            fs.openSync(datafile, "w+");
        }
        fs.readFile(datafile, function (err, data) {
            var jsonData;
            if (err) {
                fun(err);
                jsonData = {data: [], count: 0};
            } else {
                if (data && data.length > 0) {
                    jsonData = JSON.parse(data);
                } else {
                    jsonData = {data: [], count: 0,ret:1,msg:"获取成功"};
                }

                var record = {path: path, des: des,time:new Date().getTime(),id:jsonData.data.length+1};
                jsonData.data.push(record);
                jsonData.count++;
                fs.writeFile(datafile, JSON.stringify(jsonData), function (err) {
                    if (err) {
                        fun(err);
                    } else {
                        fun();
                    }
                });
            }
        });
    });
}
module.exports = router;
