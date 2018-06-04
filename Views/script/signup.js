
$(document).ready(function(){
	$('#reqname').hide();
	$('#reqemail').hide();
	$('#reqpass').hide();
	$('#reqconpass').hide();
});

function loginpage(){
	window.location.replace("/login");
}
function submit(){
	//console.log('here');
	var name = document.getElementById('name').value;
	var email  = document.getElementById('email').value;
	var pass = document.getElementById('password').value;
	var conpass = document.getElementById('con-password').value;
	var flag = false;
	if(name == ""){
		$('#reqname').show();
		flag = true;
	}
	if(email==""){
		$('#reqemail').show();
		flag = true;
	}
	if(pass.length < 3){
		$('#reqpass').show();
		flag = true;
	}
	if(conpass==""){
		$('#reqconpass').show();
		flag = true;
	}
	if(pass!==conpass){
		alert('password does not match');
		flag = true;
	}
	if(flag) return;

	$.ajax({
		type : 'POST',
		url : '/signup',
		data : {
			'name' : name,
			'email' : email,
			'pass' : pass
		},
		success : function(data){
			//localStorage.setItem("email",email);
			//window.location.replace("/home");
			//console.log(data);
			if(data=="User already Exist"){
				alert(data);
				return;
			}
			if(data=="ERROR"){
				alert('Something Went Wrong');
				return;
			}
			localStorage.setItem("email",email);
			localStorage.setItem("name",name);
			window.location.replace("/");
			
		}
	});
}