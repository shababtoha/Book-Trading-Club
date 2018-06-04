var email;
var name;
var books = {};
var request = [];
var obj;
var alluser = [];
var unavailable = [];


var mapping = {};
$(document).ready(function(){
	name = localStorage.getItem("name");
	email = localStorage.getItem("email");
	//console.log(name);
	//console.log(email);
	if(email==null){
		window.location.replace("/login");
		return;
	}

	$.ajax({
		type : 'POST',
		url : '/allbooks',
		data : {'user' : email},
		success : function(data){
			//console.log(data);
			 obj = data.second;
			if(obj){
				if(obj.hasOwnProperty('requested') ){
					$("#baki").html(obj.requested.length);
					for(var i = 0 ; i<obj.requested.length;i++){
						//$('#requested').append( make_requested( obj.requested[i].photo,obj.requested[i].name,i ));
						alluser.push(obj.requested[i].requestedby);
					}
				}
				if(obj.hasOwnProperty('request')){
				//	$("#pending").html( obj.request.length);
					//console.log(obj.request.length,"haah");
					for(var i = 0 ; i<obj.request.length;i++){
						request.push(obj.request[i].id);
						//$('#request').append( make_req( obj.request[i].photo,obj.request[i].name,i ));
						alluser.push(obj.request[i].requestto);
					}
				}
				//console.log(alluser);
				$.ajax({
					type : 'POST',
					url : '/getalluser',
					data : { 'user' : alluser},
					success : function(data){
						//console.log(data);
						for(var i = 0 ; i< data.length ;i++){
							mapping[ data[i].email +""] = data[i]; 
						}
						//console.log(mapping);
						if(obj.hasOwnProperty('requested') ){
							for(var i = 0 ; i<obj.requested.length;i++){
								$('#requested').append( make_requested( obj.requested[i].photo,mapping[obj.requested[i].requestedby+""].name,i ));
							}
						}
						if(obj.hasOwnProperty('request')){
							for(var i = 0 ; i<obj.request.length;i++){
								$('#request').append( make_req( obj.request[i].photo, mapping[obj.request[i].requestto+""].name,i ));
							}
						}
						$("#loader").hide();	
					}
				});

			}

			data = data.first;
			
			
			$.ajax({
				type : 'POST',
				url : 'unavailable',
				success : function(unv){
					//console.log(unv,"unv");
					//unavailable = unv;
					//console.log(unavailable);
					for(var i = 0 ; i<unv.length;i++) unavailable.push(unv[i].id);
					for(var i = 0 ; i<data.length;i++){
						$('#ul').append(make_div(data[i].photo,data[i]._id,data[i].user));
						books[data[i]._id +""]= { 'user' :  data[i].user, 'photo'  : data[i].photo,'username' : data[i].username };
					}
					$("#loader").hide();
				}
			})

			//$("i").css({ "color":"green"});
		}
	})
});


function make_div(photo,id,user){
	//console.log(user,email);;
	//console.log(unavailable,id);
	if(email === user  || request.indexOf(id)!=-1 || unavailable.indexOf(id)!=-1){
		return '<div class="cover" id="'+id+'">\
		<img class="img-responsive thumbnail" src="'+photo+'">\
		</div>';
		 
	}

	return '<div class="cover" id="'+id+'">\
		<img class="img-responsive thumbnail" src="'+photo+'">\
		<i class="fa fa-plus fa-2x" style="color : green" onclick=\'call("'+id+ '")\'></i>\
	</div>';
}

function call(val){
	//console.log(val);
	//var list = document.getElementById(val);   // Get the <ul> element with id="myList"
	//list.removeChild(list.childNodes[3]); 
	//console.log(books);
	$("#"+val).find('i').removeClass('fa fa-plus');
	$("#"+val).find('i').addClass('fa fa-spinner fa-spin');

	$.ajax({
		type : 'POST',
		url : '/request',
		data :{
			'requesteduser' : email,
			'requestedname' : name,
			'id'   : val,
			'photo' : books[val].photo,
			'requestto' : books[val].user,
			'requesttoname' : books[val].username
		},
		success: function(data){
			if(data=='ok'){
				var list = document.getElementById(val);   // Get the <ul> element with id="myList"
				list.removeChild(list.childNodes[3]); 
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
      <i class="fa fa-times fa-2x" onclick="approve('+i+','+0+')"></i>\
      <i class="fa fa-check fa-2x" style="margin-left: -2em; color: green" onclick="approve('+i+','+1+')"></i>\
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
	//console.log(i);
  	//console.log(obj.request[Number(i)]);
  	$("#request"+i).find('i').removeClass('fa fa-trash');
  	$("#request"+i).find('i').addClass('fa fa-spinner fa-spin');
  	
  	//return;
  	$.ajax({
  		type : 'POST',
  		url : '/deleterequest',
  		data :{
  			'id' : obj.request[ Number(i) ].id,
  			'email' : email,
  			'requestto' : 	obj.request[ Number(i) ].requestto
  		},
  		success : function(data){
  			console.log(data);
  			if(data=="OK"){
  				$("#request"+i).remove();
  				var num = $('#pending').html();
  				$( '#pending').html( Number(num)-1);
  			}
  		} 
  	})
}
function approve(i,status){
	//console.log(i);
	
	//console.log(obj.requested[i]);
	$("#requested"+i).remove;
	var list = document.getElementById("requested"+i);   // Get the <ul> element with id="myList"
	//console.log(list);
	//list.childNodes[5].removeClass('fa fa-times');
  	//list = list.childNodes;
	//	list.forEach(function(item){
    //		console.log(item);
	//	});
	if(status==0){
		//console.log(list.childNodes[3]);
		//list.childNodes[3].removeClass('fa fa-times');
		//list.childNodes[3].addClass("fa fa-spinner fa-spin");
		list.childNodes[5].remove();
		$("#requested"+i).find('i').removeClass('fa fa-times');
		$("#requested"+i).find('i').addClass('fa fa-spinner fa-spin');
	}
	else{
		list.childNodes[5].remove();
		$("#requested"+i).find('i').removeClass('fa fa-times');
		$("#requested"+i).find('i').addClass('fa fa-spinner fa-spin');
		$("#requested"+i).find('i').css({'color':'green'});
			
	}
	//console.log(list.childNodes[5]);
	//return;
	$.ajax({
		type : 'POST',
		url : '/approve',
		data : {
			'id' : obj.requested[i].id,
			'user' : email,
			'requestedby' : obj.requested[i].requestedby,
			'status' : status
		},
		success : function(data){
			//console.log(data);
			if(data=="OK"){
				$("#requested"+i).remove();
				//var num = $("#baki").html();
				//$("#baki").html(Number(num)-1);
			}
		}
	})
}