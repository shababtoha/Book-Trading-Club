var email;
$(document).ready(function(){
	
	email = localStorage.getItem("email");
	if(email==null){
		window.location.replace("/login");
		return;
	}

	var path = window.location.href.split('=');
	if(path.length != 2){
		window.location.replace("/login");
		return;
	}
	path =path[1];
	$.ajax({
		type : 'POST',
		url : '/getmyprofile?id='+path,
		success : function(data){
			//console.log(JSON.stringify(data));
			if(data!=="ERROR"){
				$("#name").html(data.name);
				$("#email").html(data.email);
				if(data.hasOwnProperty('age')){
					$("#age").html(data.age);
				}

				if(data.hasOwnProperty('state')){
					$("#address").html(data.state);
				}
				if(data.hasOwnProperty('city')){
					$("#city").html(data.city);
				}
			}
		}
	})
});