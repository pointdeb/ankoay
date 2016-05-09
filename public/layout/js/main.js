
$(document).ready(function(){
	var eTime=500;
	$('.btn-end-call,.btn-restore,#form-singup,.my-btn-success,.my-btn-error,#post-msg,.glyphicon-log-out').hide();
	$(".profil-detail tr:odd").addClass('zebra_odd');
	$(".profil-detail tr:even").addClass('zebra_even');
	$('.profil-pic-icon').on('click',function(){
		var element=$('.glyphicon-log-out');
		if (element.is(':hidden')) {
			element.fadeIn(eTime);
		}
		else{
			element.fadeOut(eTime);

		}
	});
	$('#btn-singup').on('click',function(){
		$('#form-singin-form').hide(500);
		$('#form-singup').show(500);
	});

	$('.btn-like').on('click',function(){
		$(this).addClass('hightlight');
	});

	$('.btn-like').on('dblclick',function(){
		$(this).removeClass('hightlight');
	});

	$('#btn-singup-back').on('click',function(){
		$('#form-singup').hide(500);
		$('#form-singin-form').show(500);
	});

	$('.btn-comment').on('click',function(){
		$(this).hide(500);
		$('.btn-restore').show(eTime);
		$('.list-comment').show(eTime);
		$('#comment-container').toggle(eTime);
	});

	$('.btn-msg').on('click',function(){
		$(this).hide(500);
		$('.btn-restore').fadeIn(eTime);
		$('.list-msg-p').fadeIn(eTime);
		$('.list-msg').fadeIn(eTime);
		$('#form-post-msg').fadeIn(eTime);
	});
	$('.btn-restore').on('click',function(){
		$(this).hide(500);
		$('.btn-comment').show();
		$('.btn-msg').show();
		$('.list-msg-p').fadeOut();
		$('.list-comment').fadeOut();
		$('#comment-container').fadeOut();
		$('#form-post-msg').fadeOut();
	});

	$('.btn-new-msg').on('click',function(event){
		$('#post-msg .destination').removeClass('hidden');
		$("#post-msg").removeClass('hidden');
		$('#post-msg #form-post-msg').fadeIn(eTime);
		$("#post-msg" ).fadeIn(eTime);
	});

});