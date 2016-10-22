/*******************************************************************************
*
* @author tevinyin
* 
*******************************************************************************/
$(function(){
	$(".select-item").each(function(){
		$(this).click(function(){
			var curElement = this;
			//先移除所有的选中样式以及选中的图片
			$(".select-item").each(function(){
				var element = this;
				if(element != curElement)
				{
					$(this).removeClass('selected-item');
					$(this).find('.editable-item').each(function(){
						$(this).removeClass('selected-img');
					});					
				}
			});
			$(this).addClass('selected-item');
			//通知客户端已经有某一项被选中
			try{
				window.external.OnItemSelected();
			}
			catch(err){
				console.log('call external error!');
			}
			finally{
			}
		});
	});
	
	$(".editable-item").each(function(){
		$(this).click(function(){
			//先移除所有的选中样式
			$(this).parents(".select-item").find('.editable-item').each(function(){
				$(this).removeClass('selected-img');
			});
			$(this).addClass('selected-img');
		});
	});
});

$(document).ready(function(){
	//通知客户端启用插入按钮
	try{
		window.external.OnItemSelected();
	}
	catch(err){
		console.log('call external error!');
	}
	finally{
	}
});

function replaceCurImageUrl(imgUrl){
	$(".selected-img").each(function(){
		if($(this).is('img')){
			$(this).attr('src', imgUrl);
		}else if($(this).is('section')){
			$(this).css('background-image', 'url(' + imgUrl + ')');
		}
	});
}

function getCurItemHtml(){
	var html='';
	$(".selected-item").each(function(){
		html = html + $(this).html() + '<br/>';
	});
	return html;
}
