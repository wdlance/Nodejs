var express = require('express');
var router = express.Router();
var formidable = require('formidable'); //
var fs = require('fs'); //文件操作API
//path模块，可以生产相对和绝对路径
var path = require("path");
/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('face');
});
/* GET home page. */
router.post('/', function(req, res, next) {
	var originalUrl = req.originalUrl;
	if (originalUrl.indexOf("getAll") != -1) {
		var files = getImage('public\\images', [], 'images\\');
		if (files.length != 0) {
			var url = 'public\\info\\face\\原始所有图片文件.txt';
			writeFile(res, url, files)
			res.send({
				ret: 0,
				msg: '',
				data: files
			}).end();
		} else {
			res.send({
				ret: -1,
				data: "",
				msg: 'images目录下暂无图片'
			}).end();
		}
	} else if (originalUrl.indexOf("displayImage") != -1) {
		var src = req.body.src;
		var newArr = [];
		var files = getImage('public\\images', [], 'images\\');
		var flag = false;
		for (var i = 0; i < files.length; i++) {
			var index = 0;
			if (files[i] == src) {
				index = i;
				flag = true;
			}
			if (flag) {
				if (i >= index) {
					newArr.push(files[i])
				}
			}

		}
		if (files.length != 0) {
			var url = 'public\\info\\face\\原始所有图片文件.txt';
			writeFile(res, url, files)
			res.send({
				ret: 0,
				msg: '',
				data: newArr
			}).end();
		} else {
			res.send({
				ret: -1,
				data: "",
				msg: 'images目录下暂无图片'
			}).end();
		}
	} else if (originalUrl.indexOf("insulate") != -1) {
		var src = req.body.src;
		var url = 'public\\info\\face\\_negative.txt'
		var face_url = "public\\info\\face\\_face.txt"
		fs.readFile(face_url, { encoding: 'utf8' }, function(err, data) {
			if (err) {
				console.log(err)
			}
			if (data.indexOf(src) != -1) {
				data = JSON.parse(data);
				var newArr = [];
				for (var i = 0; i < data.length; i++) {
					if (JSON.stringify(data[i]).indexOf(src) == -1) {
						newArr.push(data[i])
					}
				}
				writeFile(res, face_url, JSON.stringify(newArr))
			}
		})
		fs.exists(url, function(exists) {
			if (exists) {
				fs.readFile(url, { encoding: 'utf8' }, function(err, data) {
					if (err) {
						console.log(err)
					}
					if (data != "") {
						if (data == '""') {
							writeFile(res, url, src)
						} else {
							if (data.indexOf(src) == -1) {
								var str = data + "\r\n" + src;
								writeFile(res, url, str)
							}
						}

					} else {
						writeFile(res, url, src)
					}

					res.send({
						ret: 0,
						msg: '',
						data: ''
					}).end();
				})
			} else {
				writeFile(res, url, [src])
				res.send({
					ret: 0,
					msg: '',
					data: ''
				}).end();
			}
		});

	} else if (originalUrl.indexOf("mask") != -1) {
    //解析表单数据
    var formData = [];
    fs.exists("./tmp", function(exists) {
    	if (exists) {
    		console.log("文件存在")
    	}
    	if (!exists) {
    		fs.mkdir("./tmp")
    	}
    })
    var form = new formidable.IncomingForm({
    	encoding: "utf-8",
    	uploadDir: "./tmp",
        keepExtensions: true //保留后缀
    });
    form.parse(req)
        .on('field', function(name, value) { // 字段
        	formData[name] = value;
        })
        .on('file', function(name, file) { //文件
        	formData[name] = file;
        })
        .on('error', function(error) { //结束
        	console.log("解析表单数据失败" + error)
        })
        .on('end', function() {
        	var path = 'public\\info\\face\\_masked';
        	var url = 'public\\info\\face\\_mask.txt';
        	var src = formData.src;
        	var masks = formData.masks;
        	var imgPath = src.split("/")
        	var file = formData["image"]
        	var flag=false;
        	fs.exists(url, function(exists) {
        		if (exists) {
        			fs.readFile(url, 'utf-8', function(err, data) {
        				if (err) {
        					console.log(err)
        				}
        				if (data) {
        					if (data.indexOf(src) == -1) {
        						data = JSON.parse(data);
        						data.push({
        							src: src,
        							masks: JSON.parse(masks)
        						})
        						fs.writeFile(url, JSON.stringify(data), function(err) {
        							if (err) {
        								console.log(err)
        							}
        							saveMaskInfo(path,file,res,imgPath,masks,src)
        						})

        					} else {
        						data = JSON.parse(data);
        						var newArr = []
        						for (var i = 0; i < data.length; i++) {
        							if (JSON.parse(masks).length > 0) {
        								if (data[i].src == src) {
        									data[i].masks = JSON.parse(masks);
        								}
        								newArr.push(data[i])
        							} else {
        								if (data[i].src != src) {
        									newArr.push(data[i])
        								}
        							}
        						}
        						fs.writeFile(url, JSON.stringify(newArr), function(err) {
        							if (err) {
        								console.log(err)
        							}
        							saveMaskInfo(path,file,res,imgPath,masks,src)
        						})

        					}

        				} else {
        					if (JSON.parse(masks).length > 0) {
        						var data = JSON.stringify([{
        							src: src,
        							masks: JSON.parse(masks)
        						}])
        						fs.writeFile(url, data, function(err) {
        							if (err) {
        								console.log(err)
        							}
        							saveMaskInfo(path,file,res,imgPath,masks,src)
        						})
        					}else{
        						res.send({
        							ret:0,
        							msg:'ok',
        							data:null
        						}).end()
        					}
        				}

        			})
        		} else {
        			if (JSON.parse(masks).length > 0) {
        				var data = JSON.stringify([{
        					src: src,
        					masks: JSON.parse(masks)
        				}])
        				fs.writeFile(url, data, function(err) {
        					if (err) {
        						console.log(err)
        					}
        					saveMaskInfo(path,file,res,imgPath,masks,src)
        				})
        			}else{
        				res.send({
        					ret:0,
        					msg:'ok',
        					data:null
        				}).end()
        			}
        		}
        	});
        })

    } else if (originalUrl.indexOf("store_face_info") != -1) {
    	var src = req.body.src;
    	var rects = req.body.rects;
    	var points = req.body.points;
    	var url = 'public\\info\\face\\_face.txt';
    	var info = {
    		src: src,
    		rects: rects,
    		points: points,
    	};
    	var negative_url = "public\\info\\face\\_negative.txt"
    	if (JSON.parse(rects).length > 0) {
    		fs.readFile(negative_url, { encoding: 'utf8' }, function(err, data) {
    			if (err) {
    				console.log(err)
    			}
    			if (data) {
    				if (data.indexOf(src) != -1) {
    					data = data.split('\r\n')
    					var newArr = '';
    					for (var i = 0; i < data.length; i++) {
    						if (data[i].indexOf(src) == -1) {
    							newArr += data[i] + "\r\n"
    						}
    					}
    					writeFile(res, negative_url, JSON.stringify(newArr))
    				}
    			}

    		})
    	}

    	fs.exists(url, function(exists) {
    		if (exists) {
    			fs.readFile(url, { encoding: 'utf8' }, function(err, data) {
    				if (err) {
    					console.log(err)
    				}
    				var str = []
    				if (data != "") {
    					str = JSON.parse(data);
    					var flag = false;
                    for (var i = 0; i < str.length; i++) { //检验是否已经存储该图片信息
                    	if (str[i].src == src) {
                    		flag = true;
                    		if (JSON.parse(rects).length > 0) {
                    			str[i] = info;
                    		} else {
                    			str[i] = "";
                    		}
                    		break;
                    	}
                    }
                    if (flag) {
                    	flag = false;
                    	var newStr = [];
                        for (var i = 0; i < str.length; i++) { //检验是否已经存储该图片信息
                        	if (str[i] != "") {
                        		newStr.push(str[i]);
                        	}
                        }
                        writeFile(res, url, JSON.stringify(newStr), "")
                    } else {
                    	if (JSON.parse(rects).length > 0) {
                    		str.push(info)
                    		writeFile(res, url, JSON.stringify(str), "")
                    	}
                    }
                } else {
                	if (JSON.parse(rects).length > 0) {
                		str.push(info)
                		writeFile(res, url, JSON.stringify(str), "")
                	}
                }
                res.send({
                	ret: 0,
                	msg: '',
                	data: ''
                }).end();
            })
    		} else {
    			var str = []
    			if (JSON.parse(rects).length > 0) {
    				str.push(info);
    				writeFile(res, url, JSON.stringify(str), "")
    			}
    			res.send({
    				ret: 0,
    				msg: '',
    				data: ''
    			}).end();

    		}
    	});

    } else if (originalUrl.indexOf("get_face_info") != -1) {
    	var src = req.body.src;
    	var url = 'public\\info\\face\\_face.txt';
    	var mask_url = "public\\info\\face\\_mask.txt";
    	var content = fs.readFileSync(mask_url, 'utf-8');
    	var maskInfo = "";
    	if (content) {
    		content = JSON.parse(content);
    		for (var i = 0; i < content.length; i++) {
    			if (content[i].src == src) {
    				maskInfo = content[i];
    			}
    		}
    	}
    	fs.exists(url, function(exists) {
    		if (exists) {
    			fs.readFile(url, { encoding: 'utf8' }, function(err, data) {
    				if (err) {
    					console.log(err)
    				}
    				var info = "";
    				if (data != "") {
    					data = JSON.parse(data);
    					var flag = false;
    					for (var i = 0; i < data.length; i++) {
    						if (data[i].src == src) {
    							info = data[i];
    							break;
    						}
    					}
    				}
    				res.send({
    					ret: 0,
    					msg: 'ok',
    					data: JSON.stringify({
    						faceInfo: info,
    						maskInfo: maskInfo
    					})
    				}).end();
    			})

    		} else {
    			res.send({
    				ret: 0,
    				msg: 'ok',
    				data: JSON.stringify({
    					faceInfo: info,
    					maskInfo: maskInfo
    				})
    			});

    		}
    	})
    } else if (originalUrl.indexOf("getInsulate") != -1) {
    	var url = 'public\\info\\face\\_negative.txt'
    	fs.exists(url, function(exists) {
    		if (exists) {
    			fs.readFile(url, 'utf-8', function(err, data) {
    				if (err) {
    					console.log(err)
    				}

    				res.send({
    					ret: 0,
    					msg: '',
    					data: data
    				}).end();
    			})
    		} else {
    			res.send({
    				ret: 1,
    				msg: '没有被隔离的图片',
    				data: null
    			}).end();
    		}
    	});
    } else if (originalUrl.indexOf("getPersons") != -1) {
    	var url = 'public\\info\\face\\_face.txt'
    	fs.exists(url, function(exists) {
    		if (exists) {
    			fs.readFile(url, 'utf-8', function(err, data) {
    				if (err) {
    					console.log(err)
    				}
    				res.send({
    					ret: 0,
    					msg: '',
    					data: data
    				}).end();

    			})
    		} else {
    			res.send({
    				ret: 1,
    				msg: '没有被处理的图片',
    				data: null
    			}).end();
    		}
    	});
    }
})

function writeFile(res, url, str) {
	fs.writeFile(url, str, function(err) {
		if (err) {
			console.log(err)
		}

	})
}

function getImage(path, files, img_url) {
	var fileArr = files;
	var files = fs.readdirSync(path);
	for (var i = 0; i < files.length; i++) {
		var ext = files[i].split('.')[files[i].split(".").length - 1];
		if (ext == 'jpg') {
			fileArr.push((img_url + "\\" + files[i]).replace(/\\\\/g, '/').replace(/\\/g, '/'));
        /*  //获取目录下文件相关信息
    fs.lstat(path + "\\" + files[i], function(err, stats) {
        console.log('stats=' + JSON.stringify(stats))
    })*/
} else {
	var newPath = path + "\\" + files[i];
	var url = img_url + "\\" + files[i]
	getImage(newPath, fileArr, url)
}
}
return fileArr;
}

function setMask(path, file, flag, res, filename) {
	var exists=fs.existsSync(path);
	if (exists) {
		if (flag) {
			fs.renameSync(file.path, path + "\\" + filename);
		}

	} else {
		fs.mkdir(path, function(err) {
			if (err) {
				console.log(err)
			}
			if (flag) {
				fs.renameSync(file.path, path + "\\" + filename);
			}
		});
	}
	if (flag) {
		res.send({
			ret: 0,
			msg: 'ok',
			data: null
		}).end();
	}
}
function saveMaskInfo(path,file,res,imgPath,masks,src){
	var flag = false;
	if (JSON.parse(masks).length > 0) {
		if (imgPath.length > 2) {
			for (var i = 1; i <= imgPath.length - 1; i++) {
				if (i == imgPath.length - 1) {
					flag = true;
				}
				setMask(path, file, flag, res, imgPath[imgPath.length - 1]);	
				path += "\\" + imgPath[i];
			}
		} else {
			flag = true;
			setMask(path, file, flag, res, imgPath[imgPath.length - 1]);
		}
	} else {
		var newArr = ""
		for (var i = 1; i < src.split("/").length; i++) {
			if (i > 0 && i < src.split("/").length - 1) {
				newArr += src.split("/")[i] + "\\"
			} else if (i == src.split("/").length - 1) {
				newArr += src.split("/")[i]
			}
		}
		var del_path = 'public\\info\\face\\_masked\\' + newArr
		fs.unlink(del_path, function(err) {
			if(err){
				console.log(err)
			}
			res.send({
				ret: 0,
				msg: 'ok',
				data: null
			}).end();
		})
	}
}
module.exports = router;
