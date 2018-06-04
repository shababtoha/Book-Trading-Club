$(document).ready(function(){
	$("#nav").html(make_nav());
	var email = localStorage.getItem("email");
  $("#mySidenav").html(make_side_nav());
	if(email==null){
		notloggedin();
	}
	else{
		loggedin();
	}
});
function make_side_nav(){
  return  '<a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>\
  <a href="/">Home</a>\
  <a href="/allbooks">All Books</a>\
  <a href="/mybooks">My Books</a>\
  <a href="/myrequests">My Requests</a>\
  <a href="/requested"> Requests for me</a>\
  <a href="/history">Trade History</a>';
}

function make_nav(){
	return '<nav class="navbar navbar-inverse">\
  <div class="container-fluid">\
    <div class="navbar-header">'+ coll()+
    '</div>\
    <div class="collapse navbar-collapse" id="myNavbar">\
      <ul class="nav navbar-nav">\
        <li><a style="cursor:pointer" onclick="openNav()">&#9776; </a></li>\
        <li><a href="/">Home</a></li>\
      </ul>\
    </div>\
  </div>\
</nav>';
}

function notloggedin(){
	var val = '<ul class="nav navbar-nav navbar-right">\
        <li><a href="/signup"><span class="glyphicon glyphicon-user"></span> Sign Up</a></li>\
        <li><a href="/login"><span class="glyphicon glyphicon-log-in"></span> Login</a></li>\
      </ul>';
	$('#myNavbar').append( val );
}
function loggedin(){
	var val = '<ul class="nav navbar-nav navbar-right">\
      	<li> <a href="/mybooks">My Books</a></li>\
      	<li> <a href="/allbooks"> All Books </a></li>\
      	<li> <a href="/settings" class="fa fa-cog"></a></li>\
      	<li><a href="#" onclick="logout()" ><span class="glyphicon glyphicon-log-out"></span> Log Out</a></li>\
      </ul>';
     $('#myNavbar').append( val );
}
function coll(){
	return '<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">'+
        '<span class="icon-bar"></span>'+
        '<span class="icon-bar"></span>'+
        '<span class="icon-bar"></span> '+                       
     '</button>';
}
function logout(){
  localStorage.clear();
  window.location.replace("/login");
}


function removerequest(i){
  //console.log('remove');
}


function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}