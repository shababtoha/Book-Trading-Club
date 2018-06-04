var email;
var obj;
$(document).ready(function(){

	$('#request').hide();
	$('#requested').hide();
	email = localStorage.getItem("email");
	//console.log(email);
	if(email==null){
		window.location.replace("/login");
		return;
	}
	//console.log(email);
	$.ajax({
		type : 'POST',
		url : '/allmybooks',
		data : { 'user' : email },
		success : function(data){
			//console.log(data);
			 obj = data.second;
			if(obj){
				if(obj.hasOwnProperty('requested') ){
					$("#baki").html(obj.requested.length);
					for(var i = 0 ; i<obj.requested.length;i++){
						$('#requested').append( make_requested( obj.requested[i].photo,obj.requested[i].name,i ));
					}
				}
				if(obj.hasOwnProperty('request')){
					$("#pending").html( obj.request.length);
					for(var i = 0 ; i<obj.request.length;i++){
						$('#request').append( make_req( obj.request[i].photo,obj.request[i].name,i));
					}

				}	
			}
			data = data.first;
			for(var i = 0 ; i<data.length;i++){
				$('#ul').append(make_div(data[i].photo,data[i]._id));
			}
			$("#loader").hide();
		} 
	});

});
function checkforenter(val) {
	if(event.key=='Enter'){
		addnewbook();
	}
}
function addnewbook(){
	var val = document.getElementById('bookinput').value;
	if(val.length == 0){
		alert('Enter Book Name');
		return;
	}
	$.ajax({
		type : 'POST',
		url : '/books',
		data : { 'book' : val ,'user' :email,'name' : localStorage.getItem('name') },
		success : function(data){
			if(data==='NO BOOK FOUND'){
				alert('Sorry No Books FOUND by this name');
			}
			else{
				//console.log(data);
				$('#ul').append(make_div(data.photo,data._id));
				document.getElementById('bookinput').value ="";
				
			}
		} 
	});
}
function make_div(photo,id){
	return '<div class="cover" id="'+id+'">\
		<img class="img-responsive thumbnail" src="'+photo+'">\
		<i class="fa fa-trash fa-2x" onclick=\'call("'+id+ '")\'></i>\
	</div>';
}
function call(id){
	$("#"+id).find('i').removeClass('fa-trash');
	$("#"+id).find('i').addClass('fa-spinner fa-spin');
	$.ajax({
		type : 'POST',
		url : '/deletebook',
		data : { 'id' : id ,'user' : email },
		success : function(data){
		//	console.log(data);
			if(data=="OK"){
				$('#'+id).remove();
			}
		}
	})

}
function make_req(photo,name,i){
	return '<div class="covers" id="request'+i+'">\
      <img class="img-responsive thumbnail" src="'+photo+'"">\
      <i class="fa fa-trash fa-2x" onclick="removerequest('+i+')"></i>\
      <p style="text-align : center"> To : '+name+' </p>\
    </div>';
}

function make_requested(photo,name,i){
	return '<div class="covers" id="requested'+i+'">\
      <img class="img-responsive thumbnail" src="'+photo+'">\
      <i class="fa fa-times fa-2x" onclick="approve('+i+')"></i>\
      <i class="fa fa-check fa-2x" style="margin-left: -2em; color: green" onclick="approve('+i+')"></i>\
      <p style="text-align: center;"> By : '+name+' </p>\
    </div>'; 
}

function showreq(){
	$('#requested').hide();
	$('#request').show();
}
function showreqted(){
	$('#request').hide();
	$('#requested').show();
}
function removerequest(i){
	$.ajax({
  		type : 'POST',
  		url : '/deleterequest',
  		data :{
  			'id' : obj.request[ Number(i) ].id,
  			'email' : email,
  			'requestto' : 	obj.request[ Number(i) ].requestto
  		},
  		success : function(data){
  			//console.log(data);
  			if(data=="OK"){
  				$("#request"+i).remove();
  				var num = $('#pending').html();
  				$( '#pending').html( Number(num)-1);
  			}
  		} 
  	})
}


function approve(i){
	//console.log(i);
	$.ajax({
		type : 'POST',
		url : '/approve',
		data : {
			'id' : obj.requested[i].id,
			'user' : email,
			'requestedby' : obj.requested[i].requestedby
		},
		success : function(data){
			//console.log(data);
			if(data=="OK"){
				$("#requested"+i).remove();
				var num = $("#baki").html();
				$("#baki").html(Number(num)-1);
			}
		}
	})
}