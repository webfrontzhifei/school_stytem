/*******************************************************************************
*
* @author tevinyin
* 
*******************************************************************************/

KindEditor.plugin('media', function(K) {
	var e = this, name = 'media';
	//这边重写掉插入视频的操作
	e.clickToolbar(name,function(){
		try{
			window.external.OnInsertVideo();
		}
		catch(err){
			console.log('call external error!');
		}
		finally{
		}
	});
});

KindEditor.plugin('image', function(K) {
	var e = this, name = 'image';
	//这边重写掉插入图片的操作
	e.clickToolbar(name,function(){
		try{
			window.external.OnInsertImage();
		}
		catch(err){
			console.log('call external error!');
		}
		finally{
		}
	});
});

KindEditor.plugin('fullscreen', function(K) {
	var e = this, name = 'fullscreen';
	//这边重写掉全屏的操作
	e.clickToolbar(name,function(){
		//注释掉KindEditor-all.js原有的全屏，这边自己实现

		//先通知外面全屏变化，再处理编辑器本身的全屏，否则可能会导致编辑器部分size不适应而出现滚动条
		try{
			window.external.OnFullScreen(!this.fullscreenMode);
		}
		catch(err){
			console.log('call external error!');
		}
		finally{
		}
		
		this.fullscreen();
	});
});

KindEditor.plugin('copyall', function(K) {
	var e = this, name = 'copyall';
	//这边增加复制全文的操作
	e.clickToolbar(name,function(){
		this.exec('selectall');
		this.exec('copy');
		try{
			window.external.OnShowPromptMsg('PicTxtMsgEditCtrlCopyAllPromptMsg');
		}
		catch(err){
			console.log('call external error!');
		}
		finally{
		}
	});
});

KindEditor.plugin('pattern', function(K) {
	var e = this, name = 'pattern';
	//这边增加复制全文的操作
	e.clickToolbar(name,function(){
		try{
			window.external.OnInsertPattern();
		}
		catch(err){
			console.log('call external error!');
		}
		finally{
		}
	});
});

var editor;
KindEditor.ready(function(K) {
	editor = K.create('textarea[name=HtmlEditor]', {
		allowFileManager : true,
		langType : 'zh-CN',
		autoHeightMode : false,
		resizeType: 0,
		width: '457px',
		height: '475px',
		minHeight: '100px',
		minWidth: '200px',
		filterMode: false,
		readonlyMode: false,
		items: [
			'undo', 'redo', 'cut', 'copy', 'paste','|', 'justifyleft', 'justifycenter', 'justifyright',
			'justifyfull', 'lineheight', 'insertorderedlist', 'insertunorderedlist', 'fullscreen', '/',
			'formatblock', 'fontsize', 'forecolor', 'hilitecolor', 'bold',
			'italic', 'underline', 'strikethrough', 'removeformat', '|', 'image', 'media', 'pattern', 'copyall'
		],
		afterChange: function(){
			var doc = this.edit.doc;
			DoFilterLoaclImage(doc);
			
			OnContentChange();
		},
		afterCreate: function(){
			OnCreateComplete();
		},
	});
	
	function DoFilterLoaclImage(doc){
		var content = K.query('.ke-content', doc);
		var imgArray = K.queryAll('img', content);
		var bfilter = false;
		if(imgArray.length > 0)
		{
			for(var i = imgArray.length - 1; i >= 0; --i)
			{
				var node = K(imgArray[i]);
				var src = node.attr('src');
				var data_src = node.attr('data-src');
				if(src.indexOf('http:') < 0 && src.indexOf('https:') < 0 && src.indexOf('HTTP:') < 0 && src.indexOf('HTTPS:') < 0){
					node.remove();
					bfilter = true;
					console.log('过滤掉一张本地图片...');
				}
			}
		}
		if(true == bfilter)
		{
			try{
				window.external.OnShowPromptMsg('PicTxtMsgEditCtrlCopyLocalImageError');
			}
			catch(err){
				console.log('call external error!');
			}
			finally{
			}
		}
	}
	
});

function GetHtml() {
	var content = editor.html();
	return content;
}

function SetHtml(content) {
	editor.html(content);
}

function InsertHtml(html) {
	editor.insertHtml(html);
}

function AppendHtml(html){
	editor.appendHtml(html);
}

function GetFullHtml(){
	var fullHtml = editor.fullHtml();
	return fullHtml;
}

function SetEnable(enable){
	if('false' == enable){
		editor.readonly();
	}
	else{
		editor.readonly(false);
	}
}

function SetErrorMode(){
	$('.ke-container').each(function(){
		$(this).css('border', '1px solid #ED5668');
	});
}

function ClearErrorMode(){
	$('.ke-container').each(function(){
		$(this).css('border', '1px solid #E7E7EC');
	});
}

function CalHTMLBodyTextLength(html){
	var text = html.replace(/<(?!img|embed).*?>/ig, '').replace(/&nbsp;/ig, ' ').replace(/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
	return text.replace(/<(?:img|embed).*?>/ig, 'K').replace(/\r\n|\n|\r/g, '').length;
}

function GetDeaultAbstract(html)
{
	var text = html.replace(/<(?!img|embed).*?>/ig, '').replace(/&nbsp;/ig, ' ').replace(/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '').replace(/<(?:img|embed).*?>/ig, '').replace(/\r\n|\n|\r/g, '');
	text = text.replace(/(^\s*)|(\s*$)/g, '');
	var result = text.slice(0,30);
	
	return result;
}

function SetFocus(){
	editor.focus();
}

function OnContentChange(){
	var html = editor.html();
	try{
		window.external.OnAfterChange(html);
	}
	catch(err){
		console.log('call external error!');
	}
	finally{
	}
}

function OnCreateComplete(){
	try{
		window.external.OnCreateComplete();
	}
	catch(err){
		console.log('call external error!');
	}
	finally{
	}
}

function InsertVideo(vUrl){
	if (vUrl.indexOf("www.weishi.com") >= 0 || vUrl.indexOf("weishi.qq.com") >= 0) {
		InsertWeiShiVideo(vUrl);
	}else if(vUrl.indexOf("v.qq.com") >= 0){
		InsertTXVideo(vUrl);
	}else{
		console.log('url is not from weishi.com or v.qq.com');
	}
}

function InsertWeiShiVideo(vUrl){
	var videoSrc = vUrl;
	//判断是否包含/t
	if(videoSrc.indexOf("/t/") > 0){
		vedioId = videoSrc.split("/t/")[1];
		var return_url = 'http://z.weishi.com/weixin/player.html?msgid='+vedioId+'&width=300&height=200&auto=0';
		editor.insertHtml('<p><iframe style="background-color: #000;" height=200 width=300 frameborder=0 src="' + return_url + '" allowfullscreen="0"></iframe></p><br />');
		editor.focus();
	}else{
		console.log('not valid weishi video!');
	}
}

function InsertTXVideo(vUrl)
{
	var videoSrc = vUrl;
	var return_url = '', vid = '';
	if ( r = videoSrc.match(new RegExp("(^|&|\\\\?)vid=([^&]*)(&|$|#)"))) {
		vid = encodeURIComponent(r[2]);
		return_url = 'http://v.qq.com/iframe/player.html?vid=' + vid + '&width=300&height=200&auto=0';
		editor.insertHtml('<p><iframe style="background-color: #000;" height=200 width=300 frameborder=0 src="' + return_url + '" allowfullscreen="0"></iframe></p><br />');
		editor.focus();
	} else if ( r = videoSrc.match(new RegExp("(http://)?v\\.qq\\.com/cover[^/]*/\\w+/([^/]*)\\.html"))) {
		var cid = encodeURIComponent(r[2]), path = 'http://sns.video.qq.com/fcgi-bin/dlib/dataout_ex?auto_id=137&cid=' + cid + '&otype=json';
		path = '/mp/commonProxy/Proxy?url=' + encodeURIComponent(path);
		REST.ajax({
			url:path,
			success: function() {
				return_url = 'http://v.qq.com/iframe/player.html?vid=' + QZOutputJson['videos'][0]['vid'] + '&width=300&height=200&auto=0';
				editor.insertHtml('<p><iframe style="background-color: #000;" height=200 width=300 frameborder=0 src="' + return_url + '" allowfullscreen="0"></iframe></p><br />');
				editor.focus();
			}	
		});
	} else if ( r = videoSrc.match(new RegExp("(http://)?v\\.qq\\.com/(.*)/(.*)\\.html"))) {
		vid = encodeURIComponent(r[3]);
		return_url = 'http://v.qq.com/iframe/player.html?vid=' + vid + '&width=300&height=200&auto=0';
		editor.insertHtml('<p><iframe style="background-color: #000;" height=200 width=300 frameborder=0 src="' + return_url + '" allowfullscreen="0"></iframe></p><br />');
		editor.focus();
	} else {
		console.log('not valid tencent video!');
	}
}