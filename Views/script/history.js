var email ;
var alluser = [];
var allbooks = [];
var mapping = {};
var booksmap = {};
$(document).ready(function(){
	
	email = localStorage.getItem("email");
	//console.log(email);
	if(!email){
		window.location.replace("/login");
		return;
	}

	$.ajax({
		type : 'POST',
		url : '/gettrades',
		data : {
			'email' : email
		},
		success : function(data){
		//	console.log(data);
			//for()
			if(!data.hasOwnProperty('trades')){
				$("#loader").hide();
				return;
					
			} 
			$('#loader').hide();
			for(var i = 0 ; i<data.trades.length;i++){
				alluser.push(data.trades[i].email);
				allbooks.push(data.trades[i].id);
			}
			//console.log(alluser);
			$.ajax({
					type : 'POST',
					url : '/getalluser',
					async : false,
					data : { 'user' : alluser},
					success : function(data){
						//if(d)
						for(var i = 0 ; i< data.length ;i++){
							mapping[ data[i].email +""] = data[i]; 
						}
						//console.log(mapping);
					}
				});
			$.ajax({
				type : 'POST',
				url : '/getallbooks',
				async : false,
				data : {'books' : allbooks },
				success : function(data){
					//console.log(data);
					for(var i = 0 ;i<data.length ;i++){
						booksmap[data[i]._id+""] = data[i].title;
					}
				}
			})
			//console.log(booksmap);
			for(var i = data.trades.length-1 ; i>=0;i--){
				if(!booksmap[data.trades[i].id+""]) continue;
				if(Number(data.trades[i].status)==1){
					if(data.trades[i].who=="me"){
						$("#notif").append('<li>You Accepted <a href="/profile?id='+mapping[data.trades[i].email+""].id+'">'+mapping[data.trades[i].email+""].name+'</a>\'s Request For book '+ booksmap[data.trades[i].id+""]+'</li>');
					}
					else{
						$("#notif").append('<li><a href="/profile?id='+mapping[data.trades[i].email+""].id+'">' +mapping[data.trades[i].email+""].name +'</a> Accepted your Request For book '+ booksmap[data.trades[i].id+""]+'</li>'  );
					}
				}
				else{
					if(data.trades[i].who=="me"){
						$("#notif").append('<li>You Rejected <a href="/profile?id='+mapping[data.trades[i].email+""].id+'">'+mapping[data.trades[i].email+""].name+'</a>\'s Request For book '+ booksmap[data.trades[i].id+""]+'</li>');
					}
					else{
						$("#notif").append('<li><a href="/profile?id='+mapping[data.trades[i].email+""].id+'">' +mapping[data.trades[i].email+""].name +'</a> Rejected your Request For book '+ booksmap[data.trades[i].id+""]+'</li>'  );
					}
				}
			}
			$("#loader").hide();
		}
	})
	//console.log('aise');
});