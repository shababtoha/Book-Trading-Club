function login(){
	var name = document.getElementById('name').value;
	var pass = document.getElementById('password').value;
	if(name =="" || pass==""){
		alert("Email/Password required");
		return;
	}

	$.ajax({
		type : 'POST',
		url : 'login',
		data : {
			'email' : name,
			'password' : pass
		},
		success : function(data){
			//console.log(data);
			if(data=="ERROR"){
				alert('Incorret Email/Password');
				return;
			}
			else{

				localStorage.setItem("email",data.email);
				localStorage.setItem("name",data.name);
				window.location.replace("/");
			}
		}

	});

}