function validateAndPost(){
	var first_password = $("#inputPassword1").val();
	var reentered_password = $("#inputPassword2").val();
	if(first_password!=reentered_password){
		alert("Entered passwords dont match");
		return false;
	}
	return true;
}