function setcolor(themecolor){
	$('.ch-background').css('background-color', themecolor);
	$('.ch-border').css('border-color', themecolor);
	$('.ch-color').css('color', themecolor);
	$('.ch-border-top').css('border-top-color',themecolor);
	$('.ch-border-bottom').css('border-bottom-color',themecolor);
	$('.ch-border-left').css('border-left-color',themecolor);
	$('.ch-border-right').css('border-right-color',themecolor);
}

$('.board').click(function()
{
	$('.board-active').removeClass('board-active');
	$(this).addClass('board-active');
})

$('.tpl-item').click(function()
{
    //$('.select-item').attr('class', 'tpl-item template clearfix ng-scope');
	$('.select-item').removeClass('select-item');
	//$('.select-item').removeClass('active-item');
	$(this).addClass('select-item');


})

$('.tpl-item').mouseover(function()
{
	$(this).addClass('active-item');
})

$('.tpl-item').mouseout(function()
{
	$(this).removeClass('active-item');
})

function onBtnInsert()
{
	$('.select-item .tn-page-editable').css('font-family', "'Lucida Grande', 'Lucida Grande', 'Helvetica Neue', Helvetica, 'Microsoft YaHei', Arial, sans-serif");
	external.SelectItem($('.select-item').html()+'<br>');
	external.CloseWnd();
}

function onBtnCancel()
{
	external.CloseWnd();
}



