var express = require('express');
var router = express.Router();
var formidable = require('formidable'); //
var fs = require('fs'); //文件操作API
var xml2js = require('xml2js');
//path模块，可以生产相对和绝对路径
var path = require("path");
//get请求
router.get('/', function(req, res, next) {
	res.render('object');
});
//post请求
router.post('/', function(req, res, next) {
	var originalUrl = req.originalUrl;
	if (originalUrl.indexOf("getAllImage") != -1) {
		var img=req.body.img;
		var files = getAllImage('public\\images',[],'images\\');
		if (files.length != 0) {
			var url = 'public\\info\\object\\原始所有图片文件.txt';
			//writeFile(res, url, files)
			res.send({
				ret: 0,
				msg: '',
				data:{
					images:files,
					dir:__dirname
				}
			}).end();
		} else {
			res.send({
				ret: -1,
				data: "",
				msg: 'images目录下暂无图片'
			}).end();
		}
	}else if (originalUrl.indexOf("getClassify") != -1) {
		fs.readFile('public\\info\\object\\classify.txt', { encoding: 'utf8' }, function(err, data) {
			if(err){
				console.log("获取分类信息失败:"+err);
				return
			}
			console.log(data);
			var arr=data.split("\n");
			res.send({
				ret: 0,
				data: data,
				msg: 'ok'
			}).end();
	    })
	}else if (originalUrl.indexOf("getDirectory") != -1) {
	    var path='public\\info\\saveAs'
	    var files = fs.readdirSync(path);
	    res.send({
	    	ret:0,
	    	msg:'ok',
	    	data:files
	    })
	}
	else if (originalUrl.indexOf("saveInfo") != -1) {
		var storeType=req.body.storeType
		var info=JSON.parse(req.body.info);
		var url=req.body.url;
		var dir=req.body.dir;
		var width=req.body.width;
		var height=req.body.height;
		var path="";
		if(dir==""){
			if(storeType==1){
				path='public\\'+url;
			}else{
				path="public\\"+url.split(".")[0]+".xml"
			}
			
		}else{
			if(storeType==1){
				path='public\\info\\saveAs\\'+dir+"\\"+url;
			}else{
				path="public\\info\\saveAs\\"+dir+"\\"+url.split(".")[0]+".xml"
			}
			
		}
			var data=""
			for(var i=0;i<info.length;i++){
				data+=info[i]+"\n";
			}
			if(url){
				if(data!=""){
					if(dir!=""){
						if(storeType==1){
							saveInfos(path,res,data,1);
						}else{
							saveInfosXml(path,res,info,1,width,height,url);
						}
						
					}else{
						if(storeType==1){
							saveInfos(path,res,data,0);
						}else{
							saveInfosXml(path,res,info,0,width,height,url);
						}
					
					}
				}else{
					if(dir!=""){
						fs.exists(path, function(exists){
								if(exists){
									fs.unlinkSync(path);
								}else{
									console.log("文件不存在");
	
								}
								res.send({
								ret: 0,
								data: null,
								msg: 'ok'
								}).end();
							})  
					}else{
							fs.exists(path, function(exists){
								if(exists){
									fs.unlinkSync(path);
								}else{
									console.log("文件不存在");
	
								}
								res.send({
								ret: 0,
								data: null,
								msg: 'ok'
								}).end();
							})  
						}
					
					}
			
			}else{
				res.send({
					ret: -2,
					data: null,
					msg: '保存信息失败'
					}).end();
			}

	}else if (originalUrl.indexOf("saveMask") != -1) {
		var storeType=req.body.storeType
		var mask=JSON.parse(req.body.mask);
		var url=req.body.url;
		var dir=req.body.dir;
		var width=req.body.width;
		var height=req.body.height;
		var path="";
		if(dir==""){
			if(storeType==1){
				path='public\\'+url;
			}else{
				path="public\\"+url.split(".")[0]+".xml"
			}
		
		}else{
			if(storeType==1){
				path='public\\info\\saveAs\\'+dir+"\\"+url;
			}else{
				path="public\\info\\saveAs\\"+dir+"\\"+url.split(".")[0]+".xml"
			}
		}
		var data=""
			for(var i=0;i<mask.length;i++){
			data+=mask[i]+"\n";
		}
		if(url){
			if(data!=""){
				if(dir!=""){
					if(storeType==1){
						saveMasks(path,res,data,1);
					}else{
						saveMasksXml(path,res,mask,1,width,height,url);
					}
					
				}else{
					if(storeType==1){
						saveMasks(path,res,data,0);
					}else{
						saveMasksXml(path,res,mask,0,width,height,url);
					}
					
				}
		
			}else{
				if(dir!=""){
					fs.exists(path, function(exists){
							if(exists){
								fs.unlinkSync(path);
							}else{
								console.log("文件不存在");

							}
							res.send({
							ret: 0,
							data: null,
							msg: 'ok'
							}).end();
						})  
				}else{
						fs.exists(path, function(exists){
							if(exists){
								fs.unlinkSync(path);
							}else{
								console.log("文件不存在");

							}
							res.send({
							ret: 0,
							data: null,
							msg: 'ok'
							}).end();
						})  
				}
				
			}
		
		}else{
			res.send({
				ret: -2,
				data: null,
				msg: '保存信息失败'
				}).end();
		}	

	}else if (originalUrl.indexOf("saveAsImage") != -1) {
		var storeType=req.body.storeType;
		var img=req.body.img
		var dir=req.body.dir;
		var path="";
		if(dir==""){
			path='public\\'+img;
		}else{
			path='public\\info\\saveAs\\'+dir+"\\"+img;
		}
		saveImage(storeType,path,res,'public\\'+img)

	}else if (originalUrl.indexOf("negativeImage") != -1) {
		var img=req.body.img
		path="public\\info\\object\\_negative.txt";
		var text="http://localhost:3000/"+img
		fs.exists(path,function(exists){
			if(exists){
				fs.readFile(path, { encoding: 'utf8' }, function(err, data) {
					if (err) {
        				console.log(err)
        				res.send({
						ret: -1,
						data: null,
						msg: '读取信息失败'
						}).end();
						return;
        			}
        			if(data.indexOf(img)==-1){
        				data+="\n"+text;
        				fs.writeFile(path,data, function(err) {
        			if (err) {
        				console.log(err)
        				res.send({
						ret: -1,
						data: null,
						msg: '保存信息失败'
						}).end();
						return;
        			}
            		res.send({
						ret: 0,
						data: null,
						msg: 'ok'
					}).end();
       			})
        			}else{
        				res.send({
						ret: 0,
						data: null,
						msg: 'ok'
						}).end();
        			}
        		

				})
			}else{
				fs.writeFile(path,data, function(err) {
        			if (err) {
        				console.log(err)
        				res.send({
						ret: -1,
						data: null,
						msg: '保存信息失败'
						}).end();
						return;
        			}
            		res.send({
						ret: 0,
						data: null,
						msg: 'ok'
					}).end();
       			})
			}
		})
		

	}else if(originalUrl.indexOf("delImage") != -1){
		var src=req.body.img;
		var storeType=req.body.storeType;
		fs.exists("public\\"+src, function(exists){
		if(exists){
			fs.unlinkSync("public\\"+src)
			delInfoAndMask(storeType,"public\\"+src,res);
		}else{
			console.log("文件不存在");
		}					
	    })  	
	}else if (originalUrl.indexOf("getInfos") != -1) {
		var url=req.body.url;
		if(url){
			fs.readFile('public\\'+url, { encoding: 'utf8' }, function(err, data) {
        	if (err) {
        		console.log(err)
        		res.send({
				ret: -1,
				data: null,
				msg: '读取信息失败'
				}).end();
				return;
        	}
            res.send({
				ret: 0,
				data: data,
				msg: 'ok'
			}).end();
        })
			
		}

	}
	else if (originalUrl.indexOf("getMasks") != -1) {
		var url=req.body.url;
		if(url){
			fs.readFile('public\\'+url, { encoding: 'utf8' }, function(err, data) {
        	if (err) {
        		console.log(err)
        		res.send({
				ret: -1,
				data: null,
				msg: '读取信息失败'
				}).end();
				return;
        	}
            res.send({
				ret: 0,
				data: data,
				msg: 'ok'
			}).end();
        })
			
		}

	}
});
//获取images目录下所有图片
function getAllImage(path,files,img_url){
	var fileArr = files;
	var files = fs.readdirSync(path);
	for (var i = 0; i < files.length; i++) {
		if(files[i].split(".").length<=1){
			var newPath = path + "\\" + files[i];
			var url = img_url + "\\" + files[i]
			getAllImage(newPath, fileArr, url)
		}else{
			var ext = files[i].split('.')[files[i].split(".").length - 1];
			if (ext == 'jpg') {
				fileArr.push((img_url + "\\" + files[i]).replace(/\\\\/g, '/').replace(/\\/g, '/'));
			}
		}
		/*if(ext!="txt"){
			if (ext == 'jpg') {
				fileArr.push((img_url + "\\" + files[i]).replace(/\\\\/g, '/').replace(/\\/g, '/'));
			} else {
				var newPath = path + "\\" + files[i];
				var url = img_url + "\\" + files[i]
				getAllImage(newPath, fileArr, url)
			}
		}*/
		
	}
	return fileArr;
}
//获取分类信息
function getClassify(){
	var text=	fs.readFile('/info/classify.txt', { encoding: 'utf8' }, function(err, data) {
		console.log(data)
	})
}
//保存标注信息
function saveMasks(path,res,data,type){
	if(type==1){
		var arr=path.split("/")
		var dir=""
		for(var i=0;i<arr.length-1;i++){
			if(i<arr.length-2){
					dir+=arr[i]+"\\"
				}else{
					dir+=arr[i]
			}
		
		}
		mkdirsSync(dir)
	}
		
		fs.writeFile(path,data, function(err) {
        	if (err) {
        		console.log(err)
        		res.send({
				ret: -1,
				data: null,
				msg: '保存信息失败'
				}).end();
				return;
        	}
            res.send({
				ret: 0,
				data: null,
				msg: 'ok'
			}).end();
        })
}
function saveMasksXml(path,res,mask,type,width,height,url){
	if(type==1){
		var arr=path.split("/")
		var dir=""
		for(var i=0;i<arr.length-1;i++){
			if(i<arr.length-2){
					dir+=arr[i]+"\\"
				}else{
					dir+=arr[i]
			}
		
		}
		mkdirsSync(dir)
	}
		var xmlParser = new xml2js.Parser({explicitArray : false, ignoreAttrs : true})
			//json --> xml
  			var builder = new xml2js.Builder();
  			//测试用例
  			var size={width:width,height:height}
  			var bndbox="",obj=[]
  			for(var i=0;i<mask.length;i++){
  				var name=mask[i].split(" ")[0]
  				var difficult=mask[i].split(" ")[2];
  				var xmin=mask[i].split(" ")[4]
  				var ymin=mask[i].split(" ")[5];
  				var xmax=mask[i].split(" ")[6]
  				var ymax=mask[i].split(" ")[7];
  				bndbox={xmin:xmin,ymin:ymin,xmax:xmax,ymax:ymax};
  				obj.push({name:name,difficult: difficult, bndbox: bndbox}) ;
  			}
  			var filename=url.split(".")[0].split("/")[url.split(".")[0].split("/").length-1]+".jpg"
 			var annotation={filename:filename,size:size,object:obj}
 			var xml={annotation:annotation}
  			var jsonxml = builder.buildObject(xml);

  			fs.writeFile(path,jsonxml,function(err){
  				if(err){
  					console.log(err);
  					res.send({
				ret: -1,
				data: null,
				msg: '存储xml文件失败'
			}).end();
  					return;
  				}
  				res.send({
				ret: 0,
				data: null,
				msg: 'ok'
			}).end();
  			})		
}
//保存蒙版信息
function saveInfos(path,res,data,type){
	   if(type==1){
		var arr=path.split("/")
		var dir=""
		for(var i=0;i<arr.length-1;i++){
			if(i<arr.length-2){
					dir+=arr[i]+"\\"
				}else{
						dir+=arr[i]
				}
		
		}
		mkdirsSync(dir)
	}
		
		fs.writeFile(path,data, function(err) {
        	if (err) {
        		console.log(err)
        		res.send({
				ret: -1,
				data: null,
				msg: '保存信息失败'
				}).end();
				return;
        	}
            res.send({
				ret: 0,
				data: null,
				msg: 'ok'
			}).end();
        })
}
function saveInfosXml(path,res,info,type,width,height,url){
	 if(type==1){
		var arr=path.split("/")
		var dir=""
		for(var i=0;i<arr.length-1;i++){
			if(i<arr.length-2){
					dir+=arr[i]+"\\"
				}else{
						dir+=arr[i]
				}
		
		}
		mkdirsSync(dir)
	}
			var xmlParser = new xml2js.Parser({explicitArray : false, ignoreAttrs : true})
			//json --> xml
  			var builder = new xml2js.Builder();
  			//测试用例
  			var size={width:width,height:height}
  			var bndbox="",obj=[]
  			for(var i=0;i<info.length;i++){
  				var name=info[i].split(" ")[0]
  				var difficult=info[i].split(" ")[2];
  				var xmin=info[i].split(" ")[4]
  				var ymin=info[i].split(" ")[5];
  				var xmax=info[i].split(" ")[6]
  				var ymax=info[i].split(" ")[7];
  				bndbox={xmin:xmin,ymin:ymin,xmax:xmax,ymax:ymax};
  				obj.push({name:name,difficult: difficult, bndbox: bndbox}) ;
  			}
  			var filename=url.split(".")[0].split("/")[url.split(".")[0].split("/").length-1]+".jpg"
 			var annotation={filename:filename,size:size,object:obj}
 			var xml={annotation:annotation}
  			var jsonxml = builder.buildObject(xml);

  			fs.writeFile(path,jsonxml,function(err){
  				if(err){
  					console.log(err);
  					res.send({
				ret: -1,
				data: null,
				msg: '存储xml文件失败'
			}).end();
  					return;
  				}
  				res.send({
				ret: 0,
				data: null,
				msg: 'ok'
			}).end();
  			})
}
//保存tup
function saveImage(storeType,path,res,data){
	var arr=path.split("/")
		var dir=""
		for(var i=0;i<arr.length-1;i++){
			if(i<arr.length-2){
					dir+=arr[i]+"\\"
				}else{
						dir+=arr[i]
				}
		}
		mkdirsSync(dir)
        var sourceFile = data;
		var destPath = path;
		fs.rename(sourceFile, destPath, function (err) {
  			if (err) throw err;
  			fs.stat(destPath, function (err, stats) {
    			if (err) {
    				console.log(err)
        		 	res.send({
						ret: -1,
						data: null,
						msg: '保存信息失败'
					}).end();
					return;
    			}
    		delInfoAndMask(storeType,data,res)
  		});
});
}
function delInfoAndMask(storeType,data,res){
	var info_file="",mask_file="";
	if(storeType==1){
	info_file=data.split(".")[0]+".txt";
	mask_file=data.split(".")[0]+"_mask.txt";
	}else if(storeType==2){
	info_file=data.split(".")[0]+".xml";
	mask_file=data.split(".")[0]+"_mask.xml";
	}
	
	fs.exists(info_file, function(exists){
		if(exists){
			fs.unlinkSync(info_file);
		}else{
			console.log("文件不存在");
		}
		fs.exists(mask_file, function(exists){
			if(exists){
				fs.unlinkSync(mask_file);
			}else{
				console.log("文件不存在");
			}
			res.send({
				ret: 0,
				data: null,
				msg: 'ok'
				}).end();
		})  
							
	})  

}
//创建新目录
//递归创建目录 同步方法
function mkdirsSync(dirname){
    if(fs.existsSync(dirname)){
        return true;
    }else{
        if(mkdirsSync(path.dirname(dirname))){
            fs.mkdirSync(dirname);
            return true;
        }
    }
}
module.exports = router;
