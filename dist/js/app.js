var scrollDist;
var myTop;
var myLeft;

function centerHandler(formID){
    scrollDist=$(window).scrollTop();
    myTop=($(window).height()-$(formID).height())/2+scrollDist;
    myLeft=($(window).width()-$(formID).width())/2;
}
function cancel(formID){
    $('body').css('overflow','scroll')
    $(formID).animate({
        opacity: '0',
    })
    $('#hide').css('display','none') 
    $(formID).css('display','none') 		
}	

function popForm(formID){
    centerHandler(formID)
    $('body').css('overflow','hidden')
    $('#hide').css('display','block')
    $(formID).css('display', 'block')
    $(formID).offset({top: myTop,left:myLeft})
    $(formID).animate({
        opacity: '1',
    })	        
}

function clearOform(){
    $('input').val('')
    $('select').val('')
    $('#product_list').empty()
    $('input').prop('disabled', false)
    $('select').prop('disabled', false)
    $('.cart').prop('disabled', false)
    $('button').prop('disabled', false)    
}

