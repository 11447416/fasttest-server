var express = require('express');
var process = require('child_process');
var router = express.Router();
var config=require('./config');

//调用shell文件，完成服务器打包
router.get('/', function(req, res, next) {
    console.log(JSON.stringify(req.query))
    var branch = req.query['branch'];//分支
    var commit = req.query['commit'];//节点
    var des = req.query['des'];//描述
    var user = req.query['user'];//作者
    var type = req.query['type'];//打包 环境和类型
    if(!branch){
        res.send("branch 不能为空");
    }else if(!des){
        res.send("des 不能为空");
    }else if(!type){
        res.send("type 不能为空");
    }else if(!user){
        res.send("user 不能为空");
    }else{
        res.writeHead(200, {'Content-Type': 'text/stream; charset=utf-8'});
        res.write("1、打包程序启动\n");
        res.write("2、拉取远程分支"+branch+"\n");
        exeCmd("git",["pull","origin",branch],res,function (res) {
            var node=branch;
            if(commit)node=commit;
            res.write("3、检出代码"+node+"\n");
            exeCmd("git",["checkout",node],res,function (res) {
                res.write("4、清理环境\n");
                exeCmd("sh",["gradlew","clean"],res,function (res) {
                    res.write("5、开始编译\n");
                    exeCmd("sh",["gradlew",type],res,function (res) {
                        res.write("6、编译完成，重命名文件\n");
                        process.exec("cp app/build/outputs/apk/*.apk app/build/outputs/apk/test.apk",{cwd:config.buildPath},function (err,stdout,stderr) {
                            if(err){
                                res.write(stderr+"\n");
                                end(res);
                            }else {
                                res.write("7、开始上传\n");
                                exeCmd("sh",["package.sh","-u","app/build/outputs/apk/test.apk","-n","测试打包，请忽略","-w",user],res,function (res) {
                                    res.write("打包任务完成");
                                    end(res)
                                    process.exec("rm app/build/outputs/apk/test.apk",{cwd:config.buildPath});
                                })
                            }
                        });
                    })
                })

            })
        });
    }
});

/**
 * 执行命令，并且监听结果
 * @param cmd
 * @param argv
 * @param res
 * @param next
 */
function exeCmd(cmd, argv, res, next) {
    res.write("开始执行任务："+cmd+" "+argv+"\n")
    var exe=process.spawn(cmd,argv,{cwd:config.buildPath});
    //收到数据
    exe.stdout.on('data', function(data) {
        res.write(data)
    });
    // 添加一个end监听器来关闭文件流
    exe.stdout.on('end', function() {
        res.write("任务结束："+cmd+" "+argv+"\n")

    });
    // 当子进程退出时，检查是否有错误，同时关闭文件流
    exe.on('exit', function(code) {
        if(0!=code){
            //执行出错
            res.write("任务遇到错误，已经退出!\n");
            end(res);
        }else{
            //执行下一个任务
            if(next){
                next(res);
            }else{
                end(res)
            }
        }
    });
    exe.stderr.on('data',function (data) {
        res.write(data)
    })
}

//统一结束返回，方便修改结束标记
function end(res) {
    res.end();
}
module.exports = router;