var scrollDist;
var myTop;
var myLeft;

function centerHandler(){
    scrollDist=$(window).scrollTop();
    myTop=($(window).height()-$("form").height())/2+scrollDist;
    myLeft=($(window).width()-$("form").width())/2;
}
function cancel(){
    $('body').css('overflow','scroll')
    $("form").animate({
        opacity: '0',
    })
    $('#hide').css('display','none') 
    $('form').css('display','none') 		
}	

function popForm(){
    centerHandler()
    $('body').css('overflow','hidden')
    $('#hide').css('display','block')
    $('form').css('display', 'block')
    $('form').offset({top: myTop,left:myLeft})
    $('form').animate({
        opacity: '1',
    })	        
}