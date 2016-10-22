/***************************************************************************************
* @author zealotpeng, tevinyin
* @comment 底层调用web后台现有接口的公用function都在这里
***************************************************************************************/
/*
 * $Id: base64.js,v 2.15 2014/04/05 12:58:57 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *    http://opensource.org/licenses/mit-license
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */

var Base64 = {
    // 转码表
    table : [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
            'I', 'J', 'K', 'L', 'M', 'N', 'O' ,'P',
            'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
            'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
            'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
            'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
            'w', 'x', 'y', 'z', '0', '1', '2', '3',
            '4', '5', '6', '7', '8', '9', '+', '/'
    ],
    UTF16ToUTF8 : function(str) {
        var res = [], len = str.length;
        for (var i = 0; i < len; i++) {
            var code = str.charCodeAt(i);
            if (code > 0x0000 && code <= 0x007F) {
                // 单字节，这里并不考虑0x0000，因为它是空字节
                // U+00000000 – U+0000007F  0xxxxxxx
                res.push(str.charAt(i));
            } else if (code >= 0x0080 && code <= 0x07FF) {
                // 双字节
                // U+00000080 – U+000007FF  110xxxxx 10xxxxxx
                // 110xxxxx
                var byte1 = 0xC0 | ((code >> 6) & 0x1F);
                // 10xxxxxx
                var byte2 = 0x80 | (code & 0x3F);
                res.push(
                    String.fromCharCode(byte1), 
                    String.fromCharCode(byte2)
                );
            } else if (code >= 0x0800 && code <= 0xFFFF) {
                // 三字节
                // U+00000800 – U+0000FFFF  1110xxxx 10xxxxxx 10xxxxxx
                // 1110xxxx
                var byte1 = 0xE0 | ((code >> 12) & 0x0F);
                // 10xxxxxx
                var byte2 = 0x80 | ((code >> 6) & 0x3F);
                // 10xxxxxx
                var byte3 = 0x80 | (code & 0x3F);
                res.push(
                    String.fromCharCode(byte1), 
                    String.fromCharCode(byte2), 
                    String.fromCharCode(byte3)
                );
            } else if (code >= 0x00010000 && code <= 0x001FFFFF) {
                // 四字节
                // U+00010000 – U+001FFFFF  11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
            } else if (code >= 0x00200000 && code <= 0x03FFFFFF) {
                // 五字节
                // U+00200000 – U+03FFFFFF  111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
            } else /** if (code >= 0x04000000 && code <= 0x7FFFFFFF)*/ {
                // 六字节
                // U+04000000 – U+7FFFFFFF  1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
            }
        }
 
        return res.join('');
    },
    UTF8ToUTF16 : function(str) {
        var res = [], len = str.length;
        var i = 0;
        for (var i = 0; i < len; i++) {
            var code = str.charCodeAt(i);
            // 对第一个字节进行判断
            if (((code >> 7) & 0xFF) == 0x0) {
                // 单字节
                // 0xxxxxxx
                res.push(str.charAt(i));
            } else if (((code >> 5) & 0xFF) == 0x6) {
                // 双字节
                // 110xxxxx 10xxxxxx
                var code2 = str.charCodeAt(++i);
                var byte1 = (code & 0x1F) << 6;
                var byte2 = code2 & 0x3F;
                var utf16 = byte1 | byte2;
                res.push(Sting.fromCharCode(utf16));
            } else if (((code >> 4) & 0xFF) == 0xE) {
                // 三字节
                // 1110xxxx 10xxxxxx 10xxxxxx
                var code2 = str.charCodeAt(++i);
                var code3 = str.charCodeAt(++i);
                var byte1 = (code << 4) | ((code2 >> 2) & 0x0F);
                var byte2 = ((code2 & 0x03) << 6) | (code3 & 0x3F);
                var utf16 = ((byte1 & 0x00FF) << 8) | byte2
                res.push(String.fromCharCode(utf16));
            } else if (((code >> 3) & 0xFF) == 0x1E) {
                // 四字节
                // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
            } else if (((code >> 2) & 0xFF) == 0x3E) {
                // 五字节
                // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
            } else /** if (((code >> 1) & 0xFF) == 0x7E)*/ {
                // 六字节
                // 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
            }
        }
 
        return res.join('');
    },
    encode : function(str) {
        if (!str) {
            return '';
        }
        var utf8    = this.UTF16ToUTF8(str); // 转成UTF8
        var i = 0; // 遍历索引
        var len = utf8.length;
        var res = [];
        while (i < len) {
            var c1 = utf8.charCodeAt(i++) & 0xFF;
            res.push(this.table[c1 >> 2]);
            // 需要补2个=
            if (i == len) {
                res.push(this.table[(c1 & 0x3) << 4]);
                res.push('==');
                break;
            }
            var c2 = utf8.charCodeAt(i++);
            // 需要补1个=
            if (i == len) {
                res.push(this.table[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)]);
                res.push(this.table[(c2 & 0x0F) << 2]);
                res.push('=');
                break;
            }
            var c3 = utf8.charCodeAt(i++);
            res.push(this.table[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)]);
            res.push(this.table[((c2 & 0x0F) << 2) | ((c3 & 0xC0) >> 6)]);
            res.push(this.table[c3 & 0x3F]);
        }
 
        return res.join('');
    },
    decode : function(str) {
        if (!str) {
            return '';
        }
 
        var len = str.length;
        var i   = 0;
        var res = [];
 
        while (i < len) {
            code1 = this.table.indexOf(str.charAt(i++));
            code2 = this.table.indexOf(str.charAt(i++));
            code3 = this.table.indexOf(str.charAt(i++));
            code4 = this.table.indexOf(str.charAt(i++));
 
            c1 = (code1 << 2) | (code2 >> 4);
            c2 = ((code2 & 0xF) << 4) | (code3 >> 2);
            c3 = ((code3 & 0x3) << 6) | code4;
 
            res.push(String.fromCharCode(c1));
 
            if (code3 != 64) {
                res.push(String.fromCharCode(c2));
            }
            if (code4 != 64) {
                res.push(String.fromCharCode(c3));
            }
 
        }
 
        return res.join('');
    }
};

/*** 调试函数 ***/
function Debug_Output2Client(strPre,info){
	strInfo = strPre + ":\n";
	for(i = 1; i < arguments.length; i++)
	{
		var infoType = typeof(arguments[i]);
		if(infoType == "object")
		{
			strInfo += JSON.stringify(arguments[i]);
		}else
		{
			strInfo += arguments[i].toString();
		}
		strInfo += "\t";
	}

	window.external.OnTransferData(strInfo);
}

/*** 请求特殊化处理函数（URL加ID、contentType设置等） ***/
function RequestObjProcess(reqObj){
	switch(reqObj.funcid)
	{
		// URL+id，并且参数为JSON
		case "101":
		case "103":
		case "205":
		{
			if(reqObj.funcdata.id != undefined)
			{
				reqObj.funcconfig.url += reqObj.funcdata.id;
			}
			reqObj.ajax_dataType = "json";
			reqObj.ajax_contentType = "application/json";
			reqObj.ajax_params = JSON.stringify(reqObj.ajax_params);
		}
		break;
		// URL+ids，并且参数为JSON
		case "104":
		{
			if(reqObj.funcdata.ids != undefined)
			{
				reqObj.funcconfig.url += reqObj.funcdata.ids;
			}
			reqObj.ajax_dataType = "json";
			reqObj.ajax_contentType = "application/json";
			reqObj.ajax_params = JSON.stringify(reqObj.ajax_params);
		}
		break;
		// URL+id
		case "201":
		{
			if(reqObj.funcdata.id != undefined)
			{
				reqObj.funcconfig.url += reqObj.funcdata.id;
			}
		}
		break;
		// 参数设为JSON
		case "202":
		case "203":
		case "206":
		case "207":
		case "301":
		case "302":
		case "500":
		case "501":
		case "502":
		{
			reqObj.ajax_dataType = "json";
			reqObj.ajax_contentType = "application/json";
			reqObj.ajax_params = JSON.stringify(reqObj.ajax_params);
		}
		break;
		default:
		break;
	}
}

/*** 协议配置参数 ***/
var webAPIConfig = {
	// 图片 - 按页拉取图片
	"100":{
		name:"JS_GetImgListByPage",
		url:"/mp/rest/imgMaterial/",
		type:"GET",
	},
	// 图片 - 按ID拉取图片
	"101":{
		name:"JS_GetImgByID",
		url:"/mp/rest/imgMaterial/",
		type:"GET",
	},
	// 图片 - 上传单张图片
	"102":{
		name:"JS_UploadImg",
		url:"/mp/imgTmp/create",
		type:"POST",
	},
	// 图片 - 修改图片名称
	"103":{
		name:"JS_ModifyImgName",
		url:"/mp/rest/imgMaterial/",
		type:"PUT",
	},
	// 图片 - 删除多张图片
	"104":{
		name:"JS_DeleteImg",
		url:"/mp/rest/imgMaterial/",
		type:"DELETE",
	},
	// 图片 - 上传单个文件
	"106":{
		name:"JS_UploadFile",
		url:"http://10.213.163.180/process.php",
		type:"POST",
	},		
	// 图文 - 按页拉取图文
	"200":{
		name:"JS_GetImgTxtList",
		url:"/mp/rest/imgTxtMaterial/",
		type:"GET",
	},
	// 图文 - 按ID拉取图文
	"201":{
		name:"JS_GetImgTxtByID",
		url:"/mp/rest/imgTxtMaterial/",
		type:"GET",
	},
	// 图文 - 上传单个图文
	"202":{
		name:"JS_UploadImgTxt",
		url:"/mp/rest/imgTxtMaterial/",
		type:"POST",
	},
	// 图文 - 修改单个图文
	"203":{
		name:"JS_ModifyImgTxt",
		url:"/mp/rest/imgTxtMaterial/",
		type:"PUT",
	},
	// 图文 - 批量修改图文分组（遗留）
	"204":{
		name:"JS_BatchModifyImgTxtCategory",
		url:"/mp/rest/imgTxtMaterial/",
		type:"DELETE",
	},
	// 图文 - 删除多个图文
	"205":{
		name:"JS_DeleteImgTxt",
		url:"/mp/rest/imgTxtMaterial/",
		type:"DELETE",
	},
	// 图文 - 预览单个图文
	"206":{
		name:"JS_PreviewImgTxt",
		url:"/mp/imgTxtMaterial/preview",
		type:"POST",
	},
	// 图文 - 添加图文草稿
	"207":{
		name:"JS_AddImgTxtDraft",
		url:"/mp/imgTxtMaterial/saveDraft/",
		type:"POST",
	},
	// 图文 - 拉取图文草稿
	"208":{
		name:"JS_GetImgTxtDraft",
		url:"/mp/imgTxtMaterial/getDraft/",
		type:"GET",
	},
	// 图文 - 删除图文草稿
	"209":{
		name:"JS_DeleteImgTxtDraft",
		url:"/mp/imgTxtMaterial/deleteDraft/",
		type:"DELETE",
	},
	// 图文分组 - 拉取所有图文分组
	"300":{
		name:"JS_GetImgTxtCategory",
		url:"/mp/rest/imgMaterialCate/",
		type:"GET",
	},
	// 图文分组 - 添加一个图文分组
	"301":{
		name:"JS_AddImgTxtCategory",
		url:"/mp/rest/imgMaterialCate/",
		type:"POST",
	},
	// 图文分组 - 修改一个图文分组
	"302":{
		name:"JS_ModifyImgTxtCategory",
		url:"/mp/rest/imgMaterialCate/",
		type:"PUT",
	},
	// 图文分组 - 删除多个图文分组（遗留）
	"303":{
		name:"JS_DeleteImgTxtCategory",
		url:"/mp/rest/imgMaterialCate/",
		type:"DELETE",
	},
	// 公众号 - 按取拉取公众号列表
	"400":{
		name:"JS_GetPublicAccList",
		url:"/mp/accountInfo/getAccountInfo/",
		type:"GET",
	},
	//群发 - 查询剩余的群发次数
	"500":{
		name:"JS_QueryLeftSendAllCount",
		url:"/mp/qf/count",
		type:"POST",
	},
	//群发 - 创建群发
	"501":{
		name:"JS_SendAll",
		url:"/mp/rest/qf",
		type:"POST",
	},
	//群发 - 群发预览
	"502":{
		name:"JS_SendPreview",
		url:"/mp/qf/preview",
		type:"POST",
	},
};

/*** 通用CGI协议请求对象 ***/
var webAPIHelper = {
	// 发起CGI请求函数 - （输入）字符串 funcid、JSON对象 funcdata
	callAPI:function(funcid, funcdata){
		//Debug_Output2Client("进入了callAPI",funcid);
		// 根据输入的funcid，从webAPIConfig中获得相应的配置参数funcconfig
		var funcconfig = webAPIConfig[funcid];
		//Debug_Output2Client("拿到了东西",funcid);
		if(funcconfig == undefined)
		{
			Debug_Output2Client("操作ID没有定义",funcid);
			return;
		}
		Debug_Output2Client("从配置表中获取到的配置参数",funcconfig);
		
		// 根据获取的配置对象funcconfig和传入的参数对象funcdata发起CGI请求
		if(funcconfig != null){
			// 从funcdata中分离出extradata
			var extradata = {};
			$.extend(extradata, funcdata.extraData);
			//Debug_Output2Client("extradata类型",typeof(extradata));
			// 从extraData中拿到超时时间
			var numTimeout;
			if(typeof(extradata) == "string")
			{
				extradata = $.parseJSON(extradata);
			}
			if(null != extradata.TimeoutConfig)
			{
				numTimeout = extradata.TimeoutConfig;
				//Debug_Output2Client("String ExtraData中设置了超时时间",numTimeout);
			}else
			{
				numTimeout = 15000;
			}
			Debug_Output2Client("从String ExtraData中获取的超时时间",numTimeout);

			// object转换为string
			extradata = JSON.stringify(extradata);
			delete funcdata.extraData;

			// 获取Cookie，得到完整的参数对象funcdata
			funcdata._bqq_csrf = this.getCookie("_bqq_csrf");
			//Debug_Output2Client("完整的请求参数对象",funcdata);
			Debug_Output2Client("ExtraData",extradata);
			// 根据funcid（字符串）、funcdata（对象）、funcconfig（对象）设置请求对象reqObj
			var reqObj = new Object();
			reqObj.funcid = funcid;
			reqObj.funcdata = funcdata;
			reqObj.funcconfig = {};
			$.extend(reqObj.funcconfig,funcconfig);
			reqObj.ajax_dataType = "text";
			reqObj.ajax_contentType = "text/plain";
			reqObj.ajax_params = funcdata;
			RequestObjProcess(reqObj);
			Debug_Output2Client("根据命令号的不同改变了的dataType、contentType、params",reqObj.ajax_dataType,reqObj.ajax_contentType,reqObj.ajax_params);
			// 根据reqObj发起ajax请求
			$.ajax({
				url: reqObj.funcconfig.url,
				type: reqObj.funcconfig.type,
				contentType: reqObj.ajax_contentType,
				dataType: reqObj.ajax_dataType,
				data: reqObj.ajax_params,
				timeout: numTimeout,
				error: function(errdata){
					Debug_Output2Client("请求失败，失败的操作为"+reqObj.funcconfig.name+",返回的错误数据为",errdata);
					errdata = JSON.stringify(errdata);
					try{
						window.external.OnCallJavaScriptCallbackError(reqObj.funcid,reqObj.funcconfig.name,errdata,extradata);
					}
					catch(err){
						console.log(err);
					}
					finally{
					}
				},
				success: function(data) {
					console.log(data);
					try{
						if(typeof(data) == "string")
						{
							data = $.parseJSON(data);
						}

						if(undefined == data.r)
						{
							if("400" == reqObj.funcid)
							{
								//Debug_Output2Client("reqObj.funcid为",reqObj.funcid);
								//Debug_Output2Client("data长度",data.length);
								//Debug_Output2Client("data before",data);

								for(var i=0; i<data.length; i++)
								{
									if(data[i].accountType == 1 && data[i].verifyType == 0)
									{
										data[i].accountType = "1";
									}else if(data[i].accountType == 2 && data[i].verifyType == 0)
									{
										data[i].accountType = "3";
									}else if(data[i].accountType == 1 && data[i].verifyType == 1)
									{
										data[i].accountType = "2";
									}else if(data[i].accountType == 2 && data[i].verifyType == 1)
									{
										data[i].accountType = "4";
									}
									Debug_Output2Client("获取的公众号类型为",data[i].accountType);
								}
							}
							
							data = JSON.stringify(data);
							Debug_Output2Client("请求成功，返回的成功数据为",data);
							window.external.OnCallJavaScriptCallbackSuccess(reqObj.funcid,reqObj.funcconfig.name,data,extradata);
						}else
						{
							data = JSON.stringify(data);
							Debug_Output2Client("请求失败，返回的失败数据为",data);
							window.external.OnCallJavaScriptCallbackError(reqObj.funcid,reqObj.funcconfig.name,data,extradata);
						}	
					}
					catch(err){
						console.log(err);
					}
					finally{
					}
				},
				complete: function(XMLHttpRequest,status){
					Debug_Output2Client("可能是超时，进入了超时逻辑，操作为"+reqObj.funcconfig.name);
					if(status == "timeout")
					{
						Debug_Output2Client("请求超时，超时操作为"+reqObj.funcconfig.name);
						window.external.OnCallJavaScriptCallbackTimeout(reqObj.funcid,reqObj.funcconfig.name,extradata);
					}
				}
			});
		}
	},
	uploadImage:function(funcid,filepost,extradataObj){
		// 根据输入的funcid，从webAPIConfig中获得相应的配置参数funcconfig
		var funcconfig = {};
		$.extend(funcconfig,webAPIConfig[funcid]);
		if(funcconfig == undefined)
		{
			Debug_Output2Client("操作ID没有定义",funcid);
			return;
		}
		Debug_Output2Client("从配置表中获取到的配置参数",funcconfig);
		
		// 根据获取的配置对象funcconfig和传入的参数对象funcdata发起CGI请求
		if(funcconfig != null){
			// 从extraData中拿到超时时间
			var numTimeout;
			if(typeof(extradataObj) == "string")
			{
				extradataObj = $.parseJSON(extradataObj);
			}
			if(null != extradataObj.TimeoutConfig)
			{
				numTimeout = extradataObj.TimeoutConfig;
				//Debug_Output2Client("String ExtraData中设置了超时时间",numTimeout);
			}else
			{
				numTimeout = 15000;
			}
			Debug_Output2Client("从String ExtraData中获取的超时时间",numTimeout);

			// extradataObj改变为string
			extradataObj = JSON.stringify(extradataObj);
			// 获取Cookie，设置到URL
			funcconfig.url += "?type=upload";
			funcconfig.url += "&_bqq_csrf=";
			funcconfig.url += this.getCookie("_bqq_csrf");
			//Debug_Output2Client("完整的请求参数对象",filepost);
			Debug_Output2Client("ExtraData",extradataObj);
			// 根据funcid（字符串）、filepost（字符串）、funcconfig（对象）设置请求对象reqObj
			var reqObj = new Object();
			reqObj.funcid = funcid;
			reqObj.filepost = filepost;
			reqObj.funcconfig = funcconfig;
			reqObj.ajax_dataType = "*";
			reqObj.ajax_contentType = "multipart/form-data; boundary=----boundary_billpeng_imageupload";
			reqObj.ajax_params = filepost;
			
			var arrParams = new Uint8Array(reqObj.ajax_params.length);
			for(i=0;i<reqObj.ajax_params.length;i++)
			{
				arrParams[i] = reqObj.ajax_params.charCodeAt(i);
			}
			var blob = new Blob([arrParams]);
			var form = document.createElement("form");
			var fd = new FormData(form);
			fd.append("test", blob);
			
			//Debug_Output2Client("dataType、contentType、params",reqObj.ajax_dataType,reqObj.ajax_contentType,reqObj.ajax_params.length,reqObj.ajax_params);
			// 根据reqObj发起ajax请求
			$.ajax({
				url: reqObj.funcconfig.url,
				type: reqObj.funcconfig.type,
				contentType: reqObj.ajax_contentType,
				dataType: reqObj.ajax_dataType,
				processData: false,
				timeout: numTimeout,
				//data: reqObj.ajax_params,
				data: arrParams,
				error: function(errdata){
					Debug_Output2Client("请求失败，失败的操作为"+reqObj.funcconfig.name+",返回的错误数据为",errdata);
					errdata = JSON.stringify(errdata);
					try{
						window.external.OnCallJavaScriptCallbackError(reqObj.funcid,reqObj.funcconfig.name,errdata,extradataObj);
					}
					catch(err){
						console.log(err);
					}
					finally{
					}
				},
				success: function(data) {
					console.log(data);
					try{
						if(typeof(data) == "string")
						{
							data = $.parseJSON(data);
						}

						if(0 == data.r)
						{
							data = JSON.stringify(data);
							Debug_Output2Client("请求成功，上传图片获取的数据为",data);
							window.external.OnCallJavaScriptCallbackSuccess(reqObj.funcid,reqObj.funcconfig.name,data,extradataObj);
						}else
						{
							data = JSON.stringify(data);
							Debug_Output2Client("请求失败，上传图片返回的失败数据为",data);
							window.external.OnCallJavaScriptCallbackError(reqObj.funcid,reqObj.funcconfig.name,data,extradataObj);
						}
					}
					catch(err){
						console.log(err);
					}
					finally{
					}
				},
				complete: function(XMLHttpRequest,status){
					Debug_Output2Client("可能是超时，进入了超时逻辑，操作为"+reqObj.funcconfig.name);
					if(status == "timeout")
					{
						Debug_Output2Client("请求超时，超时操作为"+reqObj.funcconfig.name);
						window.external.OnCallJavaScriptCallbackTimeout(reqObj.funcid,reqObj.funcconfig.name,extradataObj);
					}
				}
			});
		}
	},
	uploadFile:function(funcid,filepost,extradataObj){
		// 根据输入的funcid，从webAPIConfig中获得相应的配置参数funcconfig
		var funcconfig = {};
		$.extend(funcconfig,webAPIConfig[funcid]);
		if(funcconfig == undefined)
		{
			Debug_Output2Client("操作ID没有定义",funcid);
			return;
		}
		Debug_Output2Client("从配置表中获取到的配置参数",funcconfig);
		
		// 根据获取的配置对象funcconfig和传入的参数对象funcdata发起CGI请求
		if(funcconfig != null){
			// 从extraData中拿到超时时间
			var numTimeout;
			if(typeof(extradataObj) == "string")
			{
				extradataObj = $.parseJSON(extradataObj);
			}
			if(null != extradataObj.TimeoutConfig)
			{
				numTimeout = extradataObj.TimeoutConfig;
				//Debug_Output2Client("String ExtraData中设置了超时时间",numTimeout);
			}else
			{
				numTimeout = 15000;
			}
			Debug_Output2Client("从String ExtraData中获取的超时时间",numTimeout);

			// extradataObj改变为string
			extradataObj = JSON.stringify(extradataObj);
			//Debug_Output2Client("完整的请求参数对象",filepost);
			Debug_Output2Client("ExtraData",extradataObj);
			// 根据funcid（字符串）、filepost（字符串）、funcconfig（对象）设置请求对象reqObj
			var reqObj = new Object();
			reqObj.funcid = funcid;
			reqObj.filepost = filepost;
			reqObj.funcconfig = funcconfig;
			reqObj.ajax_dataType = "*";
			reqObj.ajax_contentType = "multipart/form-data; boundary=----WebKitFormBoundarywPA5Cr8LnwG2vlG8";
			reqObj.ajax_params = filepost;
			
			var arrParams = new Uint8Array(reqObj.ajax_params.length);
			for(i=0;i<reqObj.ajax_params.length;i++)
			{
				arrParams[i] = reqObj.ajax_params.charCodeAt(i);
			}
			var blob = new Blob([arrParams]);
			var form = document.createElement("form");
			var fd = new FormData(form);
			fd.append("test", blob);
			
			//Debug_Output2Client("dataType、contentType、params",reqObj.ajax_dataType,reqObj.ajax_contentType,reqObj.ajax_params.length,reqObj.ajax_params);
			// 根据reqObj发起ajax请求
			$.ajax({
				url: reqObj.funcconfig.url,
				type: reqObj.funcconfig.type,
				contentType: reqObj.ajax_contentType,
				dataType: reqObj.ajax_dataType,
				processData: false,
				timeout: numTimeout,
				//data: reqObj.ajax_params,
				data: arrParams,
				error: function(errdata){
					Debug_Output2Client("请求失败，失败的操作为"+reqObj.funcconfig.name+",返回的错误数据为",errdata);
					errdata = JSON.stringify(errdata);
					try{
						window.external.OnCallJavaScriptCallbackError(reqObj.funcid,reqObj.funcconfig.name,errdata,extradataObj);
					}
					catch(err){
						console.log(err);
					}
					finally{
					}
				},
				success: function(data) {
					console.log(data);
					try{
						Debug_Output2Client("请求成功，上传文件获取的数据为",data);
						window.external.OnCallJavaScriptCallbackSuccess(reqObj.funcid,reqObj.funcconfig.name,data,extradataObj);
					}
					catch(err){
						console.log(err);
					}
					finally{
					}
				},
				complete: function(XMLHttpRequest,status){
					Debug_Output2Client("可能是超时，进入了超时逻辑，操作为"+reqObj.funcconfig.name);
					if(status == "timeout")
					{
						Debug_Output2Client("请求超时，超时操作为"+reqObj.funcconfig.name);
						window.external.OnCallJavaScriptCallbackTimeout(reqObj.funcid,reqObj.funcconfig.name,extradataObj);
					}
				}
			});
		}
	},
	getCookie:function(e){
		var t=document.cookie.match(new RegExp("(^| )"+e+"=([^;]*)(;|$)"));
		return null!=t?unescape(t[2]):"";
	},
};

/*** 通用CGI协议请求函数 ***/
// 输入为字符串funcid，字符串dataJson
function CallWebAPI(funcid,dataJson){
	//Debug_Output2Client("从客户端传入的JSON参数",dataJson);
	var data;
	if(typeof(dataJson) == "string")
	{
		Debug_Output2Client("传入的是JSON字符串",dataJson);
		data = $.parseJSON(dataJson);
	}else
	{
		Debug_Output2Client("传入的不是JSON字符串",dataJson);
		data = dataJson;
	}
	if(data == null)
	{
		data = new Object();
	}
	webAPIHelper.callAPI(funcid,data);
}

/*** 通用CGI协议请求函数 ***/
////////// 图片素材管理
// 按页拉取图片列表
function JS_GetImgListByPage(funcid,params){
	CallWebAPI(funcid,params);
}
// 按ID拉取图片
function JS_GetImgByID(funcid,params){
	CallWebAPI(funcid,params);
}
// 上传图片
function JS_UploadImg(funcid,filepost,extradata){
	//Debug_Output2Client("传入的POST长度", filepost.length);
	filepost = Base64.decode(filepost);
	//Debug_Output2Client("解码后的POST长度", filepost.length);
	var extradataObj = $.parseJSON(extradata);
	if(extradataObj == null)
	{
		extradataObj = new Object();
	}
	//Debug_Output2Client("解析extradata成功", extradataObj);
	//Debug_Output2Client("filepost的类型", typeof(filepost));
	webAPIHelper.uploadImage(funcid,filepost,extradataObj);
}
// 修改图片名称
function JS_ModifyImgName(funcid,params){
	CallWebAPI(funcid,params);
}
// 删除图片
function JS_DeleteImg(funcid,params){
	CallWebAPI(funcid,params);
}
// 上传文件
function JS_UploadFile(funcid,filepost,extradata){
	Debug_Output2Client("上传文件，传入的POST长度", filepost.length);
	filepost = Base64.decode(filepost);
	Debug_Output2Client("上传文件，解码后的POST长度", filepost.length);
	var extradataObj = $.parseJSON(extradata);
	if(extradataObj == null)
	{
		extradataObj = new Object();
	}
	Debug_Output2Client("上传文件，解析extradata成功", extradataObj);
	Debug_Output2Client("上传文件，filepost的类型", typeof(filepost));
	webAPIHelper.uploadFile(funcid,filepost,extradataObj);
}
////////// 图文素材管理
// 按页拉取图文列表
function JS_GetImgTxtList(funcid,params){
	CallWebAPI(funcid,params);
}
// 按ID拉取图文
function JS_GetImgTxtByID(funcid,params){
	CallWebAPI(funcid,params);
}
// 上传图文
function JS_UploadImgTxt(funcid,params){
	CallWebAPI(funcid,params);
}
// 修改图文
function JS_ModifyImgTxt(funcid,params){
	CallWebAPI(funcid,params);
}
// 删除图文
function JS_DeleteImgTxt(funcid,params){
	CallWebAPI(funcid,params);
}
// 预览图文
function JS_PreviewImgTxt(funcid,params){
	CallWebAPI(funcid,params);
}
// 预览图文
function JS_AddImgTxtDraft(funcid,params){
	CallWebAPI(funcid,params);
}
// 预览图文
function JS_GetImgTxtDraft(funcid,params){
	CallWebAPI(funcid,params);
}
// 预览图文
function JS_DeleteImgTxtDraft(funcid,params){
	CallWebAPI(funcid,params);
}
////////// 图文分组管理
// 拉取图文分组
function JS_GetImgTxtCategory(funcid,params){
	CallWebAPI(funcid,params);
}
// 添加图文分组
function JS_AddImgTxtCategory(funcid,params){
	CallWebAPI(funcid,params);
}
// 修改图文分组
function JS_ModifyImgTxtCategory(funcid,params){
	CallWebAPI(funcid,params);
}
// 批量修改图文分组
function JS_ModifyMultiImgTxtCategory(funcid,params){
	CallWebAPI(funcid,params);
}
// 删除图文分组
function JS_DeleteImgTxtCategory(funcid,params){
	CallWebAPI(funcid,params);
}
// 按页拉取公众号列表
function JS_GetPublicAccList(funcid,params){
	CallWebAPI(funcid,params);
}
// 查询公众号剩余群发条数
function JS_QueryLeftSendAllCount(funcid,params)
{
	CallWebAPI(funcid,params);
}
// 创建群发
function JS_SendAll(funcid,params)
{
	CallWebAPI(funcid,params);
}
// 群发预览
function JS_SendPreview(funcid,params)
{
	CallWebAPI(funcid,params);
}