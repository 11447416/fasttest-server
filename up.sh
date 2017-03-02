#!/bin/sh
#使用说明：直接在工程根目录，运行本文件，就可以自动上传默认的打包文件eg: ./sh
#如果要上传指定的打包文件，就用：./up.sh 文件路径


basepath=$(cd `dirname $0`; pwd)
ff=app/build/outputs/apk/app-debug.apk
if
[  $# -ne 1 ]
[ ! -f $ff  ]
then
	echo "输入1个上传文件地址"
	exit
else
    filepath="$basepath/$1"
    if
    [ $# -ne 1 ]
    then
    filepath=$ff
    fi
	if [ ! -f $filepath ]; then
   		echo "文件不存在！"
	else
		branch=`git symbolic-ref --short -q HEAD`
		user=`git config user.name`
		echo "当前分支："$branch",当前作者："$user
		echo "请输入升级或者修复bug描述: "
		read descripe # request host
    	curl  --form "file=@$filepath" --form "des=$branch#$user:$descripe"  http://fasttest.dingliqc.com:3000/upload/api
    fi
fi