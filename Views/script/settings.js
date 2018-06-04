var email;
$(document).ready(function() {
	email = localStorage.getItem("email");
	//console.log('hh');
	if(!email){

		window.location.replace("/login");
		return;
	}

	$.ajax({
		type : 'POST',
		url : '/settings',
		data :{
			'email' : email
		},
		success : function(data){
			//console.log(data);
			$('#fullname').val(data.name);
			if(data.hasOwnProperty('city')){
				$('#city').val(data.city);
			}
			if(data.hasOwnProperty('state')){
				$("#state").val(data.state);
			}
			if(data.hasOwnProperty('age')){
				$("#age").val(data.age);
			}
			$('#name').val(data.name);
		}
	})

});

function update(){
	var name = $("#name").val();
	var city = $('#city').val();
	var state =  $("#state").val();
	var age = $("#age").val();
	if(name.length < 2){

		alert('Please Enter Name');
		return;
	}
	//console.log(name,city,state);
	var obj = {
		'email' : email,
		'city' : city,
		'state' : state,
		'name' : name,
		'age' : age
	};
	$.ajax({
		type : 'POST',
		url : '/updatesettings',
		data : obj,
		success :function(data){
			if(data=="DONE"){
				alert("Update successfull");
			}
		}
	})
}

function updatepass(){
	var curpass = $("#curpass").val();
	var newpass = $("#newpass").val();
	if(curpass.length < 4 || newpass.length<4 ){
		alert('Password Must be Atleat 4 character');
		return;
	} 
	$.ajax({
		type : 'POST',
		url : '/updatepass',
		data :{
			'email' : email,
			'curpass' : curpass,
			'newpass' : newpass
		},
		success : function(data){
			if(data=="OK"){
				alert("Password Updated");
				return;
			}
			else{
				alert("Current Password did not match");
				return;
			}
		}
	})
}