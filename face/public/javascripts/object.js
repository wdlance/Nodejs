/*常量定义*/
var AllImage=[];
var lastImage="";
var firstImage=""
var absolute_path="";
var img_index=0;
var rects=[];
var masks=[];
var width=0,height=0;//图片原始大小
var rect_left=0,rect_top=0,rect_width=0,rect_height=0;//记录每个框的最原始数据
var hasClick=false;
var hasDom=""
var r_num=0;
var storeType=1;
//JS解析XML字符串
loadXML = function(xmlString){
        var xmlDoc=null;
        //判断浏览器的类型
        //支持IE浏览器 
        if(!window.DOMParser && window.ActiveXObject){   //window.DOMParser 判断是否是非ie浏览器
            var xmlDomVersions = ['MSXML.2.DOMDocument.6.0','MSXML.2.DOMDocument.3.0','Microsoft.XMLDOM'];
            for(var i=0;i<xmlDomVersions.length;i++){
                try{
                    xmlDoc = new ActiveXObject(xmlDomVersions[i]);
                    xmlDoc.async = false;
                    xmlDoc.loadXML(xmlString); //loadXML方法载入xml字符串
                    break;
                }catch(e){
                }
            }
        }
        //支持Mozilla浏览器
        else if(window.DOMParser && document.implementation && document.implementation.createDocument){
            try{
                /* DOMParser 对象解析 XML 文本并返回一个 XML Document 对象。
                 * 要使用 DOMParser，使用不带参数的构造函数来实例化它，然后调用其 parseFromString() 方法
                 * parseFromString(text, contentType) 参数text:要解析的 XML 标记 参数contentType文本的内容类型
                 * 可能是 "text/xml" 、"application/xml" 或 "application/xhtml+xml" 中的一个。注意，不支持 "text/html"。
                 */
                domParser = new  DOMParser();
                xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
            }catch(e){
            }
        }
        else{
            return null;
        }

        return xmlDoc;
    }
$(".footer").on("click",function(){
        var type=$(".storeType").find("input[name='type']:checked").val();
        storeType=type;
        $(".dialog").css("display","none")
        getAllImage(1);
})
//获取所有图片
function getAllImage(type,callback){
	var allImage=[];
    var src= $('.img_area .img').attr("src")
	$.ajax({
        url: 'http://localhost:3000/object?act=getAllImage',
        method: 'post',
        data: {
        },
        async: false,
        success: function(jsonObj) {
            if (jsonObj.ret == 0) {
                AllImage=jsonObj.data.images;
                absolute_path=jsonObj.data.dir;
                if(type==1){
                    if(AllImage.length>0){
                    $(".img_area img").attr("src",AllImage[0])
                    }
                }
                if(callback){
                    callback();
                }
                
            } else {
                console.log(jsonObj.msg)
            }
        }
    })
}

//获取图片url
function getImageUrl(name){
	//AllImage=getAllImage();
	for(var i=0;i<AllImage.length;i++){
		var image=AllImage[i];
		var img_name=image.split("/")[image.split("/").length-1]
		if(img_name==name){
			return image;
		}
	}
}
//获取当前图片url
function getCurrentImage(){
	return $('.img_area .img').attr("src");
}
$("body").on("click",function(e){
    e.stopPropagation();
    $(".directory").css("display",'none')
})
//加载图片
$('input[type="file"]').on('change',function(e){
	var val=e.target.value;
	var name=val.split("\\")[val.split("\\").length-1]
    getAllImage(2,function(){
        var src=getImageUrl(name);
    $('.img_area .img').attr('src',src);
   $('input[type="file"]').val("");
    });
	
})
function loadImage() {
    clear();
    var img_url=getCurrentImage();
    var index=0;
    for(var i=0;i<AllImage.length;i++){
        var img=AllImage[i];
        if(img_url==img){
            img_index=i;
            break;
        }
    }
    var arr=absolute_path.split("\\");
    var temp=[];
    for(var i=0;i<arr.length-1;i++){
        temp.push(arr[i])
    }
    var str=temp.join("/");
    var src=AllImage[img_index];
    $(".filename").html("图片路径:<br/>"+str+"/public/"+src).attr("title",str+"/"+src)
    //保存图片原始大小
    $('.img_area .img').data("width",$('.img_area .img').width())
    $('.img_area .img').data("height",$('.img_area .img').height())
    width=$('.img_area .img').width();
    height=$('.img_area .img').height();
    /*getAllImage();*/
    //获取图片信息
    getInfos();
    getMasks();
    var selected_rect=$(".img_area").find(".rect_wrap.selected");
    if(selected_rect.length>0){
        var r_class=selected_rect.attr("class");
        if(selected_rect.find(".rect").hasClass("masking")){
            var rect=getMask(r_class);
            $(".classify").val(rect.classify);
        }else{
            var rect=getRect(r_class);
            $(".classify").val(rect.classify);
        }
        if(rect.difficult==0){
            $(".difficult").prop("checked",false)
        }else{
            $(".difficult").prop("checked",true)
        }

    }
    getAllImage();
}
//图片加载出来后要处理的事情
//上一张图片
$('.wrap').on("click",'.pre',function(){
	if(img_index<=0){
       
        if($('.img_area .img').attr("src")!=""){
         alert("已经是第一张了")
          $('.img_area .img').attr("src","")
        clear();
        img_index=-1;
    }
       
	}else{
		$('.img_area .img').attr("src",AllImage[img_index-1])
	}
})
//下一张图片
$('.wrap').on("click",'.next',function(){
	nextImage(1);
})
function nextImage(type,dir){
    if(dir){
        if(img_index>=AllImage.length){
            if(type==1){
            
                 if($('.img_area .img').attr("src")!=""){
                    alert("已经是最后一张了")  
                 }
                     $('.img_area .img').attr("src","") 
                clear();
                img_index=AllImage.length
                
            }else{
               
                     if($('.img_area .img').attr("src")!=""){
                          alert("最后一张图片保存成功")
                     }
                      $('.img_area .img').attr("src","") 
                 clear();
                   img_index=AllImage.length
              
            }
        }else{
            $('.img_area .img').attr("src",AllImage[img_index]) 
        }
    }else{
        if(img_index>=AllImage.length-1){
            lastImage=AllImage[AllImage.length-1]
            if(type==1){
               
                 if($('.img_area .img').attr("src")!=""){
                    alert("已经是最后一张了")  
                 }
                   $('.img_area .img').attr("src","") 
                  clear();
                    img_index=AllImage.length
                
            }else{
               
                if($('.img_area .img').attr("src")!=""){
                          alert("最后一张图片保存成功")
                     }
                       $('.img_area .img').attr("src","") 
                  clear();
                    img_index=AllImage.length
            }
        }else{
            $('.img_area .img').attr("src",AllImage[img_index+1]) 
        }
    }
    
}
//移动键盘方向键，图片移动50px
document.onkeydown = function(event) {
        if (event.keyCode == 37) {
            var left = $('.img_area').find('img').position().left;
            left = left - 50;
            $('.img_area').find('img').css('left', left + 'px');
            $('.img_area').find('canvas').css('left', left + 'px');
        } else if (event.keyCode == 39) {
            var left = $('.img_area').find('img').position().left;
            left = 50 + left;
            $('.img_area').find('img').css('left', left + 'px');
            $('.img_area').find('canvas').css('left', left + 'px');
        } else if (event.keyCode == 38) {
            var top = $('.img_area').find('img').position().top;
            top = top - 50;
            $('.img_area').find('img').css('top', top + 'px')
            $('.img_area').find('canvas').css('top', top + 'px')
        } else if (event.keyCode == 40) {
            var top = $('.img_area').find('img').position().top;
            top = top + 50;
            $('.img_area').find('img').css('top', top + 'px')
            $('.img_area').find('canvas').css('top', top + 'px')
        }
}
//放大或缩小图片
var scroll_num = 0; //鼠标滚动放大缩小图片
$('.wrap').hover(function(e) {}, function() {}).mousewheel(function(event, delta, deltaX, deltaY) {
    event.preventDefault();
    if ($('.img_area').find('img').attr('src') == "") {
        return;
    }
    var img = $('.img_area').find('img')
    scroll_num++;
    var height = img.height(); //获取图片宽度 
    var width = img.width(); // 获取图片高度 
    var stepex = height / width; //获取退片宽高比
    var minHeight = 100; //获取图片初始高度
    var tempStep = 50; // 每次滚动增减幅度
    //img.removeAttr('style');
    if (delta == 1) { //鼠标向上滚动
        img.width(width + scroll_num * tempStep / stepex)
        img.height(height + scroll_num * tempStep)
    } else if (delta == -1) { //鼠标向下滚动
        if (height > minHeight) {
            img.width(width - scroll_num * tempStep / stepex)
            img.height(height - scroll_num * tempStep)
        } else {
            img.width(minHeight / stepex)
            img.height(minHeight)
        }

    }
    changeRect(img.width(),img.height());
    scroll_num = 0;
});
//随着图片放大或缩小，标注框也随之变化
function changeRect(width1,height1) {
    var rect_wrap = $('.img_area').find('.rect_wrap');
    if (rect_wrap.length > 0) {
        for (var i = 0; i < rect_wrap.length; i++) {
            var r_class=rect_wrap.eq(i).attr('class');
            var rect=rect_wrap.eq(i).find(".rect");
            var rect_dom=""
            if(rect.attr("class").indexOf("masking")!=-1){
                rect_dom=getMask(r_class);
            }else{
                rect_dom=getRect(r_class);
            }
            rect_left=rect_dom.x0;
            rect_top=rect_dom.y0;
            rect_width=rect_dom.x1-rect_dom.x0;
            rect_height=rect_dom.y1-rect_dom.y0;
            var p_w=width1/width;
            var p_h=height1/height;
            var r_w=(rect_width)*p_w;
            var r_h=(rect_height)*p_h
            var r_l=rect_left*p_w;
            var r_t=rect_top*p_h;
            var selected_rect=findBorder(rect_wrap.eq(i));
            if(r_l<0){
                r_l=0
            }
            if(r_t<0){
                r_t=0
            }
            if(r_l+r_w>$(".img_area img").width()-4){
                r_w=$(".img_area img").width()-r_l-4
            }
            if(r_t+r_h>$(".img_area img").height()-4){
                r_h=$(".img_area img").height()-r_t-4
            }
            selected_rect.l_b.css({
                left:r_l,
                top:r_t,
                width:4,
                height:r_h
            })
            selected_rect.t_b.css({
                left:r_l,
                top:r_t,
                width: r_w,
                height:4
            })
            selected_rect.r_b.css({
                left:r_l+r_w,
                top:r_t,
                width:4,
                height:r_h+4
            })
            selected_rect.b_b.css({
                left:r_l,
                top:r_t+r_h,
                height:4,
                width:r_w
            })
            selected_rect.rect.css({
                left:r_l,
                top:r_t+4,
                height:r_h,
                width:r_w
            })
        }
    }
}
//根据选中框查找边
function findBorder(rect_wrap){
    var l_b=rect_wrap.find(".l_b")
    var t_b=rect_wrap.find(".t_b")
    var r_b=rect_wrap.find(".r_b")
    var b_b=rect_wrap.find(".b_b")
    var rect=rect_wrap.find(".rect")
    return{
        l_b:l_b,
        t_b:t_b,
        r_b:r_b,
        b_b:b_b,
        rect:rect,
    }
}
//判断图片是否缩小或者放大
function changePx(){
    var current_width= $('.img_area').find('img').width();
    var px=current_width/width;
    var current_height= $('.img_area').find('img').height();
    var py=current_height/height;
    return {
        px:px,
        py:py
    };
}
//获取分类
$('.classify').on('keyup focus',function(){
    var selected_rect=$(".img_area").find(".rect_wrap.selected");
    if(selected_rect.find(".rect").hasClass("masking")){
        return
    }
    var val=$(this).val();
    $.ajax({
        url: 'http://localhost:3000/object?act=getClassify',
        method: 'post',
        data: {},
        async: false,
        success: function(jsonObj) {
            if (jsonObj.ret == 0) {
                var arr=jsonObj.data.split("\n");
                var str="";
                if(arr){
                    for (var i = 0; i <arr.length; i++) {
                    if(arr[i].trim().indexOf(val)!=-1){
                        str+="<li>"+arr[i]+"</li>"
                    }
                };
                $('.list').html(str).show();
                }
              
            } else {
                console.log(jsonObj.msg)
            }
        }
    })
})
//选择分类
$('body').on("click",'.list li',function(){
    $('.list').hide();
    var text=$(this).text().trim();
    $('.classify').val(text);
    if($('.img_area').find('.rect_wrap.selected').length>0){
        var selected_rect=$('.img_area').find('.rect_wrap.selected');
        var r_class=getSelectedClass(selected_rect);
        var rect_wrap=findBorder(selected_rect);
        var rect=rect_wrap.rect;
        if(rect.attr('class').indexOf("masking")!=-1){
        var index=getMaskIndex(r_class);
        masks[index].classify=text;
        }else{
        var index=getRectIndex(r_class);
        rects[index].classify=text;
        }

    }else{
        alert("请选中标注框")
    }
})
//勾选或不勾选困难
$(".difficult").on("click",function(e){
    var selected_rect=$('.img_area').find('.rect_wrap.selected');
    if(selected_rect.find(".rect").hasClass("masking")){
            e.preventDefault()
    }
    var checked=$(this).is(':checked');
    if($('.img_area').find('.rect_wrap.selected').length>0){
        var selected_rect=$('.img_area').find('.rect_wrap.selected');
        var r_class=getSelectedClass(selected_rect);
        var rect_wrap=findBorder(selected_rect);
        var rect=rect_wrap.rect;
        var rect_dom="";
        if(rect.attr("class").indexOf("masking")!=-1){
            rect_dom=getMask(r_class)
        }else{
            rect_dom=getRect(r_class)
        }
        if(checked){
            rect_dom.difficult=1;
        }else{
            rect_dom.difficult=0;
        }
    }else{
        alert("请选中标注框")
    }
})
//标注画框
var x0=0,y0=0;
var hasMove=false;
$('.display').on('mousedown', function(e) {
    e.stopPropagation()
    e.preventDefault && e.preventDefault(); //禁止浏览器默认的图片拖动效果
    if ($('.img_area').find('img').attr('src') == "") {
        return;
    }
     //获取滚动
    var scrollX=window.scrollX;
    var scrollY=window.scrollY;
    var width0 = $(this).data('width'); //获取图片原始宽度
    var height0 = $(this).data('height'); //获取图片原始高度
    var width = $(this).width(); //获取图片当前宽度
    var height = $(this).height(); //获取图片当前高度
    //获取鼠标点击位置
    var x = e.clientX+scrollX;
    var y = e.clientY+scrollY;
    //获取图片相对位置
    var left = $('.img_area img').offset().left;
    var top = $('.img_area img').offset().top;
    //计算得到点击点相对图片位置
    x0 = x - left;
    y0 = y - top;

})
$('.display').on('mouseup',function(e) {
    if(e.button==2){
        hasClick=false
        return
    }
    var target_class=$(e.target).attr('class')
    if(target_class.indexOf("l_b")!=-1||target_class.indexOf("t_b")!=-1||target_class.indexOf("r_b")!=-1||target_class.indexOf("b_b")!=-1){
        return
    }
    if ($('.img_area').find('img').attr('src') == "") {
        return;
    }
    //获取滚动
    var scrollX=window.scrollX;
    var scrollY=window.scrollY;
    //获取鼠标离开时的坐标
    var x = e.clientX+scrollX;
    var y = e.clientY+scrollY;
    //获取图片相对位置
    var left = $('.img_area img').offset().left;
    var top = $('.img_area img').offset().top;
    //计算得到点击点相对图片位置
    var x1=x-left;
    var y1=y-top;
    if (hasMove) {       
        hasMove = false;
        if(!hasClick){//绘制
            //计算拖动宽度、高度   
            var w = x1 - x0;
            var h = y1 - y0;
            var r_class = "rect_wrap" + r_num;
            if(x0<0){
                x0=0
            }
            if(x1<0){
                x1=0
            }
            if(x1>$(".img_area img").width()-4){
                if(x1==x0){
                    return
                }
                x1=$(".img_area img").width()-4
                w=$(".img_area img").width()-x0-4
            }
            if(y0<0){
                y0=0
            }
            if(y1<0){
                y1=0
            }
            if(y1>$(".img_area img").height()-4){
               /*  if(y1==y0){
                    return
                }*/
                y1=$(".img_area img").height()-4
                h=$(".img_area img").height()-y0-4
            }
            if(x0&&y0&&Math.abs(w)&&Math.abs(h)&&Math.abs(w)>10&&Math.abs(h)>10){
                if(x1>x0&&y1>y0){
                    drawRect(r_num,x0,y0,w,h,1)
                    var ratio=changePx();
                    rects.push({
                        r_class:r_class,
                        x0:x0/ratio.px,
                        y0:y0/ratio.py,
                        width: w/ratio.px,
                        height: h/ratio.py,
                        x1:(x1+4)/ratio.px,
                        y1:(y1+4)/ratio.py
                    })
                }else if(x1<x0&&y1<y0){
                    drawRect(r_num,x1,y1,Math.abs(w),Math.abs(h),1)
                    var ratio=changePx();
                    rects.push({
                        r_class:r_class,
                        x0:x1/ratio.px,
                        y0:y1/ratio.py,
                        width: Math.abs(w)/ratio.px,
                        height: Math.abs(h)/ratio.py,
                        x1:(x0+4)/ratio.px,
                        y1:(y0+4)/ratio.py
                    })
                }else if(x1>x0&&y1<y0){
                    drawRect(r_num,x0,y1,Math.abs(w),Math.abs(h),1)
                    var ratio=changePx();
                    rects.push({
                        r_class:r_class,
                        x0:x0/ratio.px,
                        y0:y1/ratio.py,
                        width: Math.abs(w)/ratio.px,
                        height: Math.abs(h)/ratio.py,
                        x1:(x1+4)/ratio.px,
                        y1:(y0+4)/ratio.py
                    })
                }
                else if(x1<x0&&y1>y0){
                    drawRect(r_num,x1,y0,Math.abs(w),Math.abs(h),1)
                    var ratio=changePx();
                    rects.push({
                        r_class:r_class,
                        x0:x1/ratio.px,
                        y0:y0/ratio.py,
                        width: Math.abs(w)/ratio.px,
                        height: Math.abs(h)/ratio.py,
                        x1:(x0+4)/ratio.px,
                        y1:(y1+4)/ratio.py
                    })
                }
                r_num++;
                x0="";
                y0=""
                $(".difficult").prop("checked",false);
                $(".classify").val("")
            }
        }else{//改变框的大小
                var selected_rect=$('.img_area').find('.rect_wrap.selected');
                var r_class=getSelectedClass(selected_rect);
                var rect=getRect(r_class);
                var r_index=getRectIndex(r_class);
                var mask=getMask(r_class);
                var m_index=getMaskIndex(r_class);
                var r_left=parseInt(selected_rect.offset().left-left);
                var r_top=parseInt(selected_rect.offset().top-top);
                var w = parseInt(x1 - r_left);
                var h = parseInt(y1 - r_top);
                var ratio=changePx();
                var rect_wrap=findBorder(selected_rect);
                if(hasDrag){
                    if(r_left+w<0){
                        r_left=-w
                    }
                    if(r_top+h<0){
                        r_top=-h  
                    }
                    if(r_top+h>$(".img_area img").height()-4){
                        r_top=$(".img_area img").height()-h-4
                       
                    }
                    if(r_left+w>$(".img_area img").width()-4){
                        r_left=$(".img_area img").width()-w-4
                    }
                    if(dir=="right"){
                        if(r_left+w>rect_wrap.l_b.position().left){
                            rect_wrap.r_b.css({
                                left:r_left+w,
                            }).removeClass("blue")
                            rect_wrap.t_b.css({
                                width:r_left+w-rect_wrap.l_b.position().left
                            })
                            rect_wrap.b_b.css({
                                width:r_left+w-rect_wrap.l_b.position().left
                            })
                            rect_wrap.rect.css({
                                width:r_left+w-rect_wrap.l_b.position().left-4
                            })
                            if(rect_wrap.rect.attr("class").indexOf("masking")!=-1){
                                masks[m_index].x1=(rect_wrap.l_b.position().left+r_left+w-rect_wrap.l_b.position().left+4)/ratio.px;
                            }else{
                                rects[r_index].x1=(rect_wrap.l_b.position().left+r_left+w-rect_wrap.l_b.position().left+4)/ratio.px;
                            }
                        }else{
                            rect_wrap.r_b.css({
                               left:rect_wrap.l_b.position().left,
                            }).removeClass("blue")
                            rect_wrap.l_b.css({
                                left:r_left+w,
                            })
                            rect_wrap.t_b.css({
                                left:r_left+w,
                                width:rect_wrap.r_b.position().left-rect_wrap.l_b.position().left
                            })
                            rect_wrap.b_b.css({
                                left:r_left+w,
                                width:rect_wrap.r_b.position().left-rect_wrap.l_b.position().left
                            })
                            rect_wrap.rect.css({
                                left:r_left+w+4,
                                width:rect_wrap.r_b.position().left-rect_wrap.l_b.position().left-4
                            })
                            if(rect_wrap.rect.attr("class").indexOf("masking")!=-1){
                                masks[m_index].x0=(rect_wrap.l_b.position().left+4)/ratio.px;
                                masks[m_index].x1=(rect_wrap.r_b.position().left+4)/ratio.px;
                            }else{
                                rects[r_index].x0=(rect_wrap.l_b.position().left+4)/ratio.px;
                                rects[r_index].x1=(rect_wrap.r_b.position().left+4)/ratio.px;
                            }
                        }
                        
                    }else if(dir=="left"){
                        if(r_left+w<rect_wrap.r_b.position().left){
                                rect_wrap.l_b.css({
                                    left:r_left+w,
                                }).removeClass("blue")
                                rect_wrap.t_b.css({
                                    left:r_left+w,
                                    width:rect_wrap.r_b.position().left-r_left-w
                                })
                                rect_wrap.b_b.css({
                                    left:r_left+w,
                                    width:rect_wrap.r_b.position().left-r_left-w
                                })
                                rect_wrap.rect.css({
                                    left:r_left+w+4,
                                    width:rect_wrap.r_b.position().left-r_left-w-4
                                })
                                if(rect_wrap.rect.attr("class").indexOf("masking")!=-1){
                                    masks[m_index].x0=(r_left+w)/ratio.px;
                                    masks[m_index].x1=(rect_wrap.l_b.position().left+rect_wrap.r_b.position().left-r_left-w+4)/ratio.px;
                                }else{
                                    rects[r_index].x0=(r_left+w)/ratio.px;
                                    rects[r_index].x1=(rect_wrap.l_b.position().left+rect_wrap.r_b.position().left-r_left-w+4)/ratio.px;
                                }
                        }else{
                                rect_wrap.l_b.css({
                                    left:rect_wrap.r_b.position().left,
                                }).removeClass("blue")
                                rect_wrap.r_b.css({
                                    left:r_left+w,
                                })
                                rect_wrap.t_b.css({
                                    left:rect_wrap.l_b.position().left,
                                    width:rect_wrap.r_b.position().left-rect_wrap.l_b.position().left
                                })
                                rect_wrap.b_b.css({
                                    left:rect_wrap.l_b.position().left,
                                    width:rect_wrap.r_b.position().left-rect_wrap.l_b.position().left
                                })
                                rect_wrap.rect.css({
                                    left:rect_wrap.l_b.position().left+4,
                                    width:rect_wrap.r_b.position().left-rect_wrap.l_b.position().left-4
                                })
                                if(rect_wrap.rect.attr("class").indexOf("masking")!=-1){
                                        masks[m_index].x0=(rect_wrap.l_b.position().left)/ratio.px;
                                        masks[m_index].x1=(rect_wrap.r_b.position().left+4)/ratio.px;
                                }else{
                                        rects[r_index].x0=(rect_wrap.l_b.position().left)/ratio.px;
                                        rects[r_index].x1=(rect_wrap.r_b.position().left+4)/ratio.px
                                }
                            }
                    }else if(dir=="up"){
                        if(r_top+h< rect_wrap.b_b.position().top){
                            rect_wrap.t_b.css({
                                 top:r_top+h,
                            }).removeClass("blue")
                            rect_wrap.l_b.css({
                                top:r_top+h,
                                height:rect_wrap.b_b.position().top-r_top-h
                            })
                            rect_wrap.r_b.css({
                                top:r_top+h,
                                height:rect_wrap.b_b.position().top-r_top-h+4
                            })
                            rect_wrap.rect.css({
                                top:r_top+h+4,
                                height:rect_wrap.b_b.position().top-r_top-h-4
                            })
                            if(rect_wrap.rect.attr("class").indexOf("masking")!=-1){
                                    masks[m_index].y0=(r_top+h)/ratio.py;
                                    masks[m_index].y1=(rect_wrap.t_b.position().top+rect_wrap.b_b.position().top-r_top-h+4)/ratio.py;
                            }else{
                                    rects[r_index].y0=(r_top+h)/ratio.py;
                                    rects[r_index].y1=(rect_wrap.t_b.position().top+rect_wrap.b_b.position().top-r_top-h+4)/ratio.py;
                            }
                        }else{
                            rect_wrap.t_b.css({
                                 top:rect_wrap.b_b.position().top,
                            }).removeClass("blue")
                             rect_wrap.b_b.css({
                                 top:r_top+h
                            })
                            rect_wrap.l_b.css({
                                top:rect_wrap.t_b.position().top,
                                height:rect_wrap.b_b.position().top-rect_wrap.t_b.position().top
                            })
                            rect_wrap.r_b.css({
                                top:rect_wrap.t_b.position().top,
                                height:rect_wrap.b_b.position().top-rect_wrap.t_b.position().top+4
                            })
                            rect_wrap.rect.css({
                                top:rect_wrap.t_b.position().top+4,
                                height:rect_wrap.b_b.position().top-rect_wrap.t_b.position().top-4
                            })
                            if(rect_wrap.rect.attr("class").indexOf("masking")!=-1){
                                    masks[m_index].y0=rect_wrap.t_b.position().top/ratio.py;
                                    masks[m_index].y1=(rect_wrap.b_b.position().top+4)/ratio.py;
                            }else{
                                    rects[r_index].y0=rect_wrap.t_b.position().top/ratio.py;
                                    rects[r_index].y1=(rect_wrap.b_b.position().top+4)/ratio.py;
                            }
                        }
                          
                    }else if(dir=="down"){
                        if(r_top+h>rect_wrap.t_b.position().top){
                            rect_wrap.b_b.css({
                            top:r_top+h,
                            }).removeClass("blue")
                            rect_wrap.l_b.css({
                            height:r_top+h-rect_wrap.t_b.position().top
                            })
                            rect_wrap.r_b.css({
                            height:r_top+h-rect_wrap.t_b.position().top+4
                            })
                            rect_wrap.rect.css({
                            height:r_top+h-rect_wrap.t_b.position().top-4
                            })
                            if(rect_wrap.rect.attr("class").indexOf("masking")!=-1){
                                masks[m_index].y1=(rect_wrap.t_b.position().top+r_top+h-rect_wrap.t_b.position().top+4)/ratio.py;
                            }else{
                                rects[r_index].y1=(rect_wrap.t_b.position().top+r_top+h-rect_wrap.t_b.position().top+4)/ratio.py;
                            }
                        }else{
                            rect_wrap.b_b.css({
                                top:rect_wrap.t_b.position().top,
                            }).removeClass("blue")
                            rect_wrap.t_b.css({
                                top:r_top+h,
                            })
                            rect_wrap.l_b.css({
                                top:rect_wrap.t_b.position().top,
                                height:rect_wrap.b_b.position().top-rect_wrap.t_b.position().top
                            })
                            rect_wrap.r_b.css({
                                top:rect_wrap.t_b.position().top,
                                height:rect_wrap.b_b.position().top-rect_wrap.t_b.position().top+4
                            })
                            rect_wrap.rect.css({
                                top:rect_wrap.t_b.position().top+4,
                                height:rect_wrap.b_b.position().top-rect_wrap.t_b.position().top-4
                            })
                            if(rect_wrap.rect.attr("class").indexOf("masking")!=-1){
                                masks[m_index].y0=(rect_wrap.t_b.position().top)/ratio.py;
                                masks[m_index].y1=(rect_wrap.b_b.position().top+4)/ratio.py;
                            }else{
                                rects[r_index].y0=(rect_wrap.t_b.position().top)/ratio.py;
                                rects[r_index].y1=(rect_wrap.b_b.position().top+4)/ratio.py;
                            }
                        }
                    }else if(dir=="left_up"){
                        if(r_top+h>=rect_wrap.b_b.position().top||r_left+w>=rect_wrap.r_b.position().left){
                            dir="";
                            hasDrag=false;
                            hasClick=false;
                            rect_wrap.t_b.removeClass("blue")
                            rect_wrap.l_b.removeClass("blue")
                            return
                        }
                        rect_wrap.t_b.css({
                            top:r_top+h,
                            left:r_left+w,
                            width:rect_wrap.r_b.position().left-r_left-w
                         }).removeClass("blue")
                        rect_wrap.l_b.css({
                            left:r_left+w,
                            top:r_top+h,
                            height:rect_wrap.b_b.position().top-r_top-h
                        }).removeClass("blue")
                        rect_wrap.r_b.css({
                            top:r_top+h,
                            height:rect_wrap.b_b.position().top-r_top-h+4
                        })
                        rect_wrap.b_b.css({
                            left:r_left+w,
                            width:rect_wrap.r_b.position().left-r_left-w
                        })
                        rect_wrap.rect.css({
                            left:r_left+w+4,
                            width:rect_wrap.r_b.position().left-r_left-w-4,
                            top:r_top+h+4,
                            height:rect_wrap.b_b.position().top-r_top-h-4
                         })
                        if(rect_wrap.rect.attr("class").indexOf("masking")!=-1){
                                    masks[m_index].x0=(rect_wrap.l_b.position().left)/ratio.px;
                                    masks[m_index].x1=(rect_wrap.r_b.position().left+4)/ratio.px;
                                    masks[m_index].y0=(rect_wrap.t_b.position().top)/ratio.py;
                                    masks[m_index].y1=(rect_wrap.b_b.position().top+4)/ratio.py;
                        }else{
                                    rects[r_index].x0=(rect_wrap.l_b.position().left)/ratio.px;
                                    rects[r_index].x1=(rect_wrap.r_b.position().left+4)/ratio.px;
                                    rects[r_index].y0=(rect_wrap.t_b.position().top)/ratio.py;
                                    rects[r_index].y1=(rect_wrap.b_b.position().top+4)/ratio.py;
                        }
                    }else if(dir=="left_down"){
                        if(r_top+h<=rect_wrap.t_b.position().top||r_left+w>rect_wrap.r_b.position().left){
                            dir="";
                            hasDrag=false;
                            hasClick=false;
                            rect_wrap.l_b.removeClass("blue")
                            rect_wrap.b_b.removeClass("blue")
                            return
                        }
                    rect_wrap.l_b.css({
                        left:r_left+w,
                        height:r_top+h-rect_wrap.t_b.position().top,
                    }).removeClass("blue")
                    rect_wrap.t_b.css({
                        left:r_left+w,
                        width:rect_wrap.r_b.position().left-r_left-w
                    })
                    rect_wrap.r_b.css({
                        height:r_top+h-rect_wrap.t_b.position().top+4
                    })
                    rect_wrap.b_b.css({
                        left:r_left+w,
                          top:r_top+h,
                        width:rect_wrap.r_b.position().left-r_left-w
                    }).removeClass("blue")
                    rect_wrap.rect.css({
                        left:r_left+w+4,
                        width:rect_wrap.r_b.position().left-r_left-w-4
                    })
                    if(rect_wrap.rect.attr("class").indexOf("masking")!=-1){
                        masks[m_index].x0=(r_left+w)/ratio.px;
                        masks[m_index].x1=(rect_wrap.l_b.position().left+rect_wrap.r_b.position().left-r_left-w+4)/ratio.px;
                        masks[m_index].y1=(rect_wrap.t_b.position().top+r_top+h-rect_wrap.t_b.position().top+4)/ratio.py;
                    }else{
                        rects[r_index].x0=(r_left+w)/ratio.px;
                        rects[r_index].x1=(rect_wrap.l_b.position().left+rect_wrap.r_b.position().left-r_left-w+4)/ratio.px;
                        rects[r_index].y1=(rect_wrap.t_b.position().top+r_top+h-rect_wrap.t_b.position().top+4)/ratio.py;
                    }
                    }else if(dir=="right_up"){
                        if(r_top+h>=rect_wrap.b_b.position().top||r_left+w<=rect_wrap.l_b.position().left){
                            dir="";
                            hasDrag=false;
                            hasClick=false;
                               rect_wrap.t_b.removeClass("blue")
                            rect_wrap.r_b.removeClass("blue")
                            return
                        }
                    rect_wrap.t_b.css({
                        top:r_top+h,
                        width:r_left+w-rect_wrap.l_b.position().left
                    }).removeClass("blue")
                    rect_wrap.l_b.css({
                        top:r_top+h,
                        height:rect_wrap.b_b.position().top-r_top-h
                    })
                    rect_wrap.r_b.css({
                        left:r_left+w,
                        top:r_top+h,
                        height:rect_wrap.b_b.position().top-r_top-h+4
                    }).removeClass("blue")
                     rect_wrap.b_b.css({
                        width:r_left+w-rect_wrap.l_b.position().left
                    })
                    rect_wrap.rect.css({
                        width:r_left+w-rect_wrap.l_b.position().left-4,
                        top:r_top+h+4,
                        height:rect_wrap.b_b.position().top-r_top-h-4
                    })
                    if(rect_wrap.rect.attr("class").indexOf("masking")!=-1){
                        masks[m_index].x1=(rect_wrap.l_b.position().left+r_left+w-rect_wrap.l_b.position().left+4)/ratio.px;
                        masks[m_index].y0=(r_top+h)/ratio.py;
                        masks[m_index].y1=(rect_wrap.t_b.position().top+rect_wrap.b_b.position().top-r_top-h+4)/ratio.py;
                    }else{
                        rects[r_index].x1=(rect_wrap.l_b.position().left+r_left+w-rect_wrap.l_b.position().left+4)/ratio.px;
                        rects[r_index].y0=(r_top+h)/ratio.py;
                        rects[r_index].y1=(rect_wrap.t_b.position().top+rect_wrap.b_b.position().top-r_top-h+4)/ratio.py;
                    }
                    }else if(dir=="right_down"){
                        if(r_top+h<=rect_wrap.t_b.position().top||r_left+w<=rect_wrap.l_b.position().left){
                            dir="";
                            hasDrag=false;
                            hasClick=false;
                             rect_wrap.b_b.removeClass("blue")
                            rect_wrap.r_b.removeClass("blue")
                            return
                        }
                    rect_wrap.l_b.css({
                        height:r_top+h-rect_wrap.t_b.position().top
                    })
                    rect_wrap.r_b.css({
                        left:r_left+w,
                        height:r_top+h-rect_wrap.t_b.position().top+4
                    }).removeClass("blue")
                    rect_wrap.t_b.css({
                        width:r_left+w-rect_wrap.l_b.position().left
                    })
                    rect_wrap.b_b.css({
                        top:r_top+h,
                        width:r_left+w-rect_wrap.l_b.position().left
                    }).removeClass("blue")
                    rect_wrap.rect.css({
                        width:r_left+w-rect_wrap.l_b.position().left-4,
                        height:r_top+h-rect_wrap.t_b.position().top-4
                    })
                    if(rect_wrap.rect.attr("class").indexOf("masking")!=-1){
                        masks[m_index].x1=(rect_wrap.l_b.position().left+r_left+w-rect_wrap.l_b.position().left+4)/ratio.px;
                        masks[m_index].y1=(rect_wrap.t_b.position().top+r_top+h-rect_wrap.t_b.position().top+4)/ratio.py;
                    }else{
                        rects[r_index].x1=(rect_wrap.l_b.position().left+r_left+w-rect_wrap.l_b.position().left+4)/ratio.px;
                        rects[r_index].y1=(rect_wrap.t_b.position().top+r_top+h-rect_wrap.t_b.position().top+4)/ratio.py;
                    }
                    }
                    dir="";
                    hasDrag=false;
                    hasClick=false;
           /*       selected_rect.removeClass("selected")*/
                }
               
            }
    }
})
$('.wrap').on('mousemove', 'img,.rect', function(e) {
    e.stopPropagation()
    hasMove = true;
    hasDrag=true;
})

//获取选中框的类属性
function getSelectedClass(dom){
    var r_class=dom.attr("class");
    return r_class;
}
//从框数组中找到指定框
function getRect(r_class){
    var rect="";
    for(var i=0;i<rects.length;i++){
        if(r_class.indexOf(rects[i].r_class)!=-1){
            rect=rects[i]
        }
    }
    return rect;
}
//从框数组中找到指定框下表
function getRectIndex(r_class){
    var index=0;
    for(var i=0;i<rects.length;i++){
        if(r_class.indexOf(rects[i].r_class)!=-1){
            index=i
        }
    }
    return index;
}
//从框数组中找到指定框
function getMask(r_class){
    var mask="";
    for(var i=0;i<masks.length;i++){
        if(r_class.indexOf(masks[i].r_class)!=-1){
            mask=masks[i]
        }
    }
    return mask;
}
//从框数组中找到指定框下表
function getMaskIndex(r_class){
    var index=0;
    for(var i=0;i<masks.length;i++){
        if(r_class.indexOf(masks[i].r_class)){
            index=i
        }
    }
    return index;
}
//保存
$('.save').on("click",function(){
    if($('.img_area img').attr("src")==""){
        return;
    }
    save();
})
function save(dir){
 var width= $('.img_area .img').data("width")
    var height= $('.img_area .img').data("height")

    if(!dir){
        dir=""
    }else{
        saveAsImage(dir)
    }
    var data=[];
        for(var i=0;i<rects.length;i++){//存储标注信息
        var rect=rects[i];
        if(rect.classify){
           if(!rect.difficult){
            rect.difficult=0
        }
        if(!rect.x0&&rect.x0!=0){
            rect.x0=""
        }
        if(!rect.y0&&rect.y0!=0){
            rect.y0=""
        }
        if(!rect.x1){
            rect.x1=""
        }
        if(!rect.y1){
            rect.y1=""
        }
        var str=rect.classify+" 0.0 "+rect.difficult+" 0.0 "+parseInt(rect.x0)+" "+parseInt(rect.y0)+" "+parseInt(rect.x1)+" "+parseInt(rect.y1)+" 0.0 0.0 0.0 0.0 0.0 0.0 0.0";
        data.push(str)
        }
        
        }
        var url=$('.img_area img').attr("src").replace(/jpg/, "txt")
        $.ajax({
        url: 'http://localhost:3000/object?act=saveInfo',
        method: 'post',
        data:{
            storeType:storeType,
            info:JSON.stringify(data),
            url:url,
            dir:dir,
            width:width,
            height:height
        },
        async: false,
        success: function(jsonObj) {
            if (jsonObj.ret == 0) {
               
            } else {
                console.log(jsonObj.msg)
            }
        }
    })
     var data=[];//存储蒙版信息
        for(var i=0;i<masks.length;i++){
        var mask=masks[i];
        if(!mask.difficult){
            mask.difficult=0
        }
        if(!mask.x0&&mask.x0!=0){
            mask.x0=""
        }
        if(!mask.y0&&mask.y0!=0){
            mask.y0=""
        }
        if(!mask.x1){
            mask.x1=""
        }
        if(!mask.y1){
            mask.y1=""
        }
        var str="mask"+" 0.0 "+mask.difficult+" 0.0 "+parseInt(mask.x0)+" "+parseInt(mask.y0)+" "+parseInt(mask.x1)+" "+parseInt(mask.y1)+" 0.0 0.0 0.0 0.0 0.0 0.0 0.0";
        data.push(str)
    }
    var url=$('.img_area img').attr("src").split(".")[0]+"_mask"+".txt"
    $.ajax({
        url: 'http://localhost:3000/object?act=saveMask',
        method: 'post',
        data:{
            storeType:storeType,
            mask:JSON.stringify(data),
            url:url,
            dir:dir,
            width:width,
            height:height
        },
        success: function(jsonObj) {
            if (jsonObj.ret == 0) {
                nextImage(2,dir)
            } else {
                console.log(jsonObj.msg)
                nextImage(2,dir)
            }
        }
    })
}
//获取保存的标注信息
function getInfos(){
    var url=""
    if(storeType==1){
    url=$('.img_area img').attr("src").replace(/jpg/, "txt")
    }else{
    url=$('.img_area img').attr("src").replace(/jpg/, "xml")  
    }

    $.ajax({
        url: 'http://localhost:3000/object?act=getInfos',
        method: 'post',
        data:{
            url:url
        },
        async:false,
        success: function(jsonObj) {
            if (jsonObj.ret == 0) {
                var data=jsonObj.data;
                if(storeType==1){
                    var arr=data.split("\n");
                    for(var i=0;i<arr.length;i++){
                        if(arr[i]!=""){
                            var infos=arr[i].split(" ");
                            var classify=infos[0]
                            if(infos[4]==""){
                                var left=0
                            }else{
                                 var left=parseInt(infos[4]);
                            }
                            if(infos[5]==""){
                                var top=0;
                            }else{
                                 var top=parseInt(infos[5]);
                            }
                            var width=parseInt(infos[6])-left-4;
                            var height=parseInt(infos[7])-top-4;
                            var difficult=infos[2];
                            var r_class="rect_wrap"+r_num;
                            drawRect(r_num,left,top,width,height,1)
                            rects.push({
                            r_class:r_class,
                            classify:classify,
                            x0:left,
                            y0:top,
                            x1:left+width+4,
                            y1:top+height+4,
                            difficult:difficult
                            })
                            r_num++;
                        }
                    }
                } 
                else{
                    var xmldoc=loadXML(data)
                    var arr = xmldoc.getElementsByTagName("object");
                    for (var i = 0; i < arr.length; i++) {
                        var classify = arr[i].getElementsByTagName("name")[0].firstChild.nodeValue;
                        var difficult = arr[i].getElementsByTagName("difficult")[0].firstChild.nodeValue;
                        var left=parseInt(arr[i].getElementsByTagName("bndbox")[0].getElementsByTagName("xmin")[0].firstChild.nodeValue)
                        var top=parseInt(arr[i].getElementsByTagName("bndbox")[0].getElementsByTagName("ymin")[0].firstChild.nodeValue)
                        var x1=parseInt(arr[i].getElementsByTagName("bndbox")[0].getElementsByTagName("xmax")[0].firstChild.nodeValue)
                        var y1=parseInt(arr[i].getElementsByTagName("bndbox")[0].getElementsByTagName("ymax")[0].firstChild.nodeValue)
                        var width=x1-left-4;
                        var height=y1-top-4;
                        var r_class="rect_wrap"+r_num;
                        drawRect(r_num,left,top,width,height,1)
                        rects.push({
                        r_class:r_class,
                        classify:classify,
                        x0:left,
                        y0:top,
                        x1:left+width+4,
                        y1:top+height+4,
                        difficult:difficult
                        })
                        r_num++;              
                    }
                }
            }else {
                console.log(jsonObj.msg)
            }
        }
    })

}
//获取保存的蒙版信息
function getMasks(){
    var url=""
    if(storeType==1){
    url=$('.img_area img').attr("src").split(".")[0]+"_mask"+".txt"
    }else{
    url=$('.img_area img').attr("src").split(".")[0]+"_mask"+".xml"
    }
    $.ajax({
        url: 'http://localhost:3000/object?act=getMasks',
        method: 'post',
        data:{
            url:url
        },
        async:false,
        success: function(jsonObj) {
            if (jsonObj.ret == 0) {
                var data=jsonObj.data;
                if(storeType==1){
                    var arr=data.split("\n");
                    for(var i=0;i<arr.length;i++){
                    if(arr[i]!=""){
                        var mask=arr[i].split(" ");
                        var classify=mask[0]
                        if(mask[4]==""){
                                var left=0
                            }else{
                                 var left=parseInt(mask[4]);
                            }
                            if(mask[5]==""){
                                var top=0;
                            }else{
                                 var top=parseInt(mask[5]);
                            }
                            var width=parseInt(mask[6])-left-4;
                            var height=parseInt(mask[7])-top-4;
                            var difficult=mask[2];
                            var r_class="rect_wrap"+r_num;
                            drawRect(r_num,left,top,width,height,2)
                            masks.push({
                            r_class:r_class,
                            classify:classify,
                            x0:left,
                            y0:top,
                            x1:left+width,
                            y1:top+height,
                            difficult:difficult
                            })
                            r_num++;
                        }
                   
                    }
                }else{
                    var xmldoc=loadXML(data)
                    var arr = xmldoc.getElementsByTagName("object");
                    for (var i = 0; i < arr.length; i++) {
                        var classify = arr[i].getElementsByTagName("name")[0].firstChild.nodeValue;
                        var difficult = arr[i].getElementsByTagName("difficult")[0].firstChild.nodeValue;
                        var left=parseInt(arr[i].getElementsByTagName("bndbox")[0].getElementsByTagName("xmin")[0].firstChild.nodeValue)
                        var top=parseInt(arr[i].getElementsByTagName("bndbox")[0].getElementsByTagName("ymin")[0].firstChild.nodeValue)
                        var x1=parseInt(arr[i].getElementsByTagName("bndbox")[0].getElementsByTagName("xmax")[0].firstChild.nodeValue)
                        var y1=parseInt(arr[i].getElementsByTagName("bndbox")[0].getElementsByTagName("ymax")[0].firstChild.nodeValue)
                        var width=x1-left-4;
                        var height=y1-top-4;
                        var r_class="rect_wrap"+r_num;
                        drawRect(r_num,left,top,width,height,2)
                        masks.push({
                        r_class:r_class,
                        classify:classify,
                        x0:left,
                        y0:top,
                        x1:left+width+4,
                        y1:top+height+4,
                        difficult:difficult
                        })
                        r_num++;              
                    }
                }
                
               
            } else {
                console.log(jsonObj.msg)
            }
        }
    })

}
//删除图片
$('.del_img').on("click",function(){
    $('.delModal').css('display','block');
})
$('.delModal').on("click",'.yes',function(){
    $.ajax({
        url: 'http://localhost:3000/object?act=delImage',
        method: 'post',
        data:{
            img:getCurrentImage(),
            storeType:storeType
        },
        async:false,
        success: function(jsonObj) {
            if (jsonObj.ret == 0) {
                $('.delModal').css('display','none');
                nextImage(1);
            } else {
                console.log(jsonObj.msg)
            }
        }
    })
})
$('.delModal').on("click",'.no',function(){
    $('.delModal').css('display','none');
})
//删除标注框
$('.del').on("click",function(){
    var selected_rect=$('.img_area').find('.rect_wrap.selected');
    var r_class=getSelectedClass(selected_rect);
    var rect_wrap=findBorder(selected_rect);
    var rect=rect_wrap.rect;
    var tmp=[];
    if(rect.attr("class").indexOf("masking")!=-1){
        for(var i=0;i<masks.length;i++){
            if(r_class.indexOf(masks[i].r_class)==-1){
            tmp.push(masks[i])
            }
        }
        masks=tmp;
    }else{
         for(var i=0;i<rects.length;i++){
            if(r_class.indexOf(rects[i].r_class)==-1){
            tmp.push(rects[i])
            }
        }
        rects=tmp;
    }
    r_num--;
    $('.difficult').prop("checked",false);
    $(".classify").val("")
    hasClick=false;
    selected_rect.remove();
})
$('.insulate').on('click', function() {
    var src= $('.img_area img').attr('src');
    $.ajax({
        url: 'http://localhost:3000/object?act=negativeImage',
        method: 'post',
        data:{
            img:src,
        },
        async:false,
        success: function(jsonObj) {
            if (jsonObj.ret == 0) {
                nextImage(2);
            } else {
                console.log(jsonObj.msg)
            }
        }
    })
})
//给图片加蒙版
$('.mask').on('click', function() {
    var selected_rect=$('.img_area').find('.rect_wrap.selected')
    var rect_wrap = findBorder(selected_rect)
    if (selected_rect.length > 0) {
        var r_left = selected_rect.position().left;
        var r_top = selected_rect.position().top;
        var r_w = selected_rect.width();
        var r_h = selected_rect.height();
        rect_wrap.rect.addClass('masking')
        var newArr = [];
        var tmp=[];
        for (var i = 0; i < rects.length; i++) {
            if (selected_rect.attr('class').indexOf(rects[i].r_class)!=-1 ) {
                masks.push(rects[i])
            }else{
                newArr.push(rects[i])
            }
        }
        rects=newArr;
    } 

})
//清除上一次图片信息
function clear() {
    $('.img_area').find('.rect_wrap').remove();
    $('.img_area').find('.rect').remove();
    $('.img_area').find('.l_b').remove();
    $('.img_area').find('.t_b').remove();
    $('.img_area').find('.r_b').remove();
    $('.img_area').find('.b_b').remove();
    $('.img_area').find('img').css({
        width: 'auto',
        height: 'auto',
    });
    $('.img_area').find('img').css('left', '0px');
    $('.img_area').find('img').css('top', '0px');
    $("input[name='classify']").val("");
    $("input[name='difficult']").attr("checked", false);
    r_num = 0;
    hasDrag = false;
    hasMove=false;
    hasClick=false;
    dir = "";
    rects = [];
    masks=[];
}
//另存为
$('.save_as').on('click',function(){
    if($('.img_area').find('img').attr("src")==""){
        return;
    }
    $.ajax({
        url: 'http://localhost:3000/object?act=getDirectory',
        method: 'post',
        data:{
        },
        success: function(jsonObj) {
            if (jsonObj.ret == 0) {
               var data=jsonObj.data;
               if(data.length>0){
                var str=""
                for(var i=0;i<data.length;i++){
                    str+="<li>"+data[i]+"</li>"
                }
                $(".directory").html(str).css("display","block")
               }else{
                alert("请在项目目录中saveAs目录新建另存为目录")
               }
            } else {
                console.log(jsonObj.msg)
            }
        }
    })
    

})
$('.operate').on('click','.directory li',function(){
    save($(this).text());
    $(".directory").css("display","none")
})
//图片另存为
function saveAsImage(dir){
    var img_url=getCurrentImage();
    var index=0;
    for(var i=0;i<AllImage.length;i++){
        var img=AllImage[i];
        if(img_url==img){
            img_index=i;
            break;
        }
    }
    $.ajax({
        url: 'http://localhost:3000/object?act=saveAsImage',
        method: 'post',
        data:{
            storeType:storeType,
            img:$('.img_area').find('img').attr("src"),
            dir:dir
        },
        async:false,
        success: function(jsonObj) {
            if (jsonObj.ret == 0) {
            //重新获取图片数组
                getAllImage(2);   
            } else {
                console.log(jsonObj.msg)
            }
        }
    })
}
document.oncontextmenu = function(){
　　return false;
}
$('.img_area').on("mousedown",function(e){
    if(e.button ==2){
　　　　$(this).find(".rect_wrap").removeClass("selected")
　　}
})
//选中标注框，并查看标注框信息
$('.img_area').on("mousedown",".l_b,.t_b,.r_b,.b_b,.rect",function(e){
    if(e.button ==2){
      e.stopPropagation();
　　　$(".img_area").find(".rect_wrap").removeClass("selected")
      return;
　　}
    var target=$(e.target);
    var cursor=target.css("cursor");
    if(target.attr("class")=="rect"){
                //获取鼠标点击位置
    var x = e.clientX+scrollX;
    var y = e.clientY+scrollY;
    //获取图片相对位置
    var left = $('.img_area img').offset().left;
    var top = $('.img_area img').offset().top;
    //计算得到点击点相对图片位置
    x0 = parseInt(x - left);
    y0 = parseInt( y - top);
        if(cursor!="w-resize"&&cursor!=="e-resize"&&cursor!="n-resize"&&cursor!="s-resize"){
            return
        }
    }
    if(!$(e.target).hasClass("rect")){
            $(this).parent().siblings().removeClass("selected")
    $(this).parent().addClass("selected")
    }

    $(".classify").val("");
    $(".difficult").prop("checked",false)
    hasClick=true;
    dragDom=$(e.target);
    var selected_rect=$(this).parent();
    var r_class=selected_rect.attr('class');
    var rect_wrap=findBorder(selected_rect);
    var rect=rect_wrap.rect;
    var rect_dom=""
    if(rect.attr('class').indexOf("masking")!=-1){
        rect_dom=getMask(r_class);
    }else{
        rect_dom=getRect(r_class);
    }
    var classify=rect_dom.classify;
    $(".classify").val(classify);
    var difficult=rect_dom.difficult;
    if(difficult=="0"||!difficult){
        $(".difficult").prop("checked",false)
    }else{
        $(".difficult").prop("checked",true)
    }
    var b_class=$(e.target).attr("class");
    $(".img_area").find(".l_b").removeClass("blue")
    $(".img_area").find(".t_b").removeClass("blue")
    $(".img_area").find(".r_b").removeClass("blue")
    $(".img_area").find(".b_b").removeClass("blue")
    if(b_class.indexOf("l_b")!=-1){
        if(cursor=="nw-resize"){
              dir="left_up";
              rect_wrap.t_b.addClass("blue");
              target.addClass("blue")
        }else{
              dir="left";
              target.addClass("blue")
        }
      
    }else if(b_class.indexOf("t_b")!=-1){
        if(cursor=="nw-resize"){
              dir="left_up";
              rect_wrap.l_b.addClass("blue");
              target.addClass("blue")
        }else{
             dir="up";
             target.addClass("blue")
        }
    }
    else if(b_class.indexOf("r_b")!=-1){
        if(cursor=="se-resize"){
              dir="right_down";
              rect_wrap.b_b.addClass("blue");
              target.addClass("blue")
        }else if(cursor=="ne-resize"){
              dir="right_up";
              rect_wrap.t_b.addClass("blue");
              target.addClass("blue")
        }else{
             dir="right";
              target.addClass("blue")
        }
       
    }
    else if(b_class.indexOf("b_b")!=-1){
        if(cursor=="sw-resize"){
            dir="left_down";
             rect_wrap.l_b.addClass("blue");
              target.addClass("blue")
        }else{
            dir="down";
             target.addClass("blue")
        }
    }
})
//拖动边框时样式
$('.img_area').on("mousemove",".l_b,.t_b,.r_b,.b_b",function(e){
    var target=$(e.target);
    var b_class=target.attr("class");
    var x = e.clientX+scrollX;
    var y = e.clientY+scrollY;
    var left=$(".img_area img").offset().left;
    var top=$(".img_area img").offset().top;
    var e_x=x-left;
    var e_y=y-top;
    var parent=target.parent();
    var l_b=parent.find(".l_b");
    var t_b=parent.find(".t_b");
    var r_b=parent.find(".r_b");
    var b_b=parent.find(".b_b");
    if(b_class.indexOf("l_b")!=-1){
        if(e_x<=l_b.position().left+8&&e_y<=l_b.position().top+8){
            target.css("cursor","nw-resize")
        }else if(e_x>=l_b.position().left&&e_y>=b_b.position().top-8){
            target.css("cursor","sw-resize")
        }else{
            target.css("cursor","w-resize");
        }
    }else if(b_class.indexOf("t_b")!=-1){
        if(e_x<=t_b.position().left+8&&e_y<=t_b.position().top+8){
            target.css("cursor","nw-resize")
        }else if(e_x>=r_b.position().left-8&&e_y>=r_b.position().top){
            target.css("cursor","ne-resize")
        }else{
            target.css("cursor","n-resize");
        }
       
    }
    else if(b_class.indexOf("r_b")!=-1){
        if(e_x>=r_b.position().left&&e_y>=b_b.position().top-8){
            target.css("cursor","se-resize")
        }else if(e_x>=r_b.position().left&&e_y<=r_b.position().top+8){
            target.css("cursor","ne-resize")
        }else{
           target.css("cursor","e-resize"); 
        }
    }
    else if(b_class.indexOf("b_b")!=-1){
        if(e_x<=b_b.position().left+8&&e_y>=t_b.position().top){
            target.css("cursor","sw-resize")
        }else if(e_x>=r_b.position().left-4&&e_y>=b_b.position().top){
            target.css("cursor","se-resize")
        }else{
             target.css("cursor","s-resize");
        }
       
    }else{
        target.css("cursor","default");
    }
})
//绘制框
function drawRect(num,left,top,width,height,type) {
    var rect_wrap=$("<div class='rect_wrap'></div>");
    rect_wrap.addClass("rect_wrap"+num)
    $(".img_area").find(".rect_wrap").removeClass("selected")
  rect_wrap.addClass("selected")
  
    var l_b=$("<div class='l_b'></div>")
    l_b.css({
        left:left,
        top:top,
        width:4,
        height:height
    })
    var t_b=$("<div class='t_b'></div>")
    t_b.css({
        left:left,
        top:top,
        width:width,
        height:4
    })
    var r_b=$("<div class='r_b'></div>")
    r_b.css({
        left:left+width,
        top:top,
        width:4,
        height:height+4
    })
    var b_b=$("<div class='b_b'></div>")
    b_b.css({
        left:left,
        top:top+height,
        width:width,
        height:4
    })
    var rect=$("<div class='rect'></div>")
    rect.css({
        left:left+4,
        top:top+4,
        width:width-4,
        height:height-4
    })
    if(type==2){
        rect.addClass("masking");
    }
    rect_wrap.append(l_b).append(t_b).append(r_b).append(b_b).append(rect);
    $('.img_area').append(rect_wrap);
}