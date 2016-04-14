$('form').submit(function (evt) {
   evt.preventDefault(); //prevents the default action
});
function sendSUS(pid,totalQues,qtype){
	if(!isFormFilled()){
		alert('fill all fields');
		return ;
	}
	var SUS={
		_id:pid,
		sus:0
	}
	var total = 0;
	var ansArray = $('#queryForm').serializeArray();
	var temp;
	if(qtype==='default'){
		$.each(ansArray,function(index,value){
			temp = parseInt(value.value);
			total = total + toSUSVal(temp);
		});
		SUS.sus=parseInt(total) * 2.5;
	}
	else{
		$.each(ansArray,function(index,value){
			temp = parseInt(value.value);
			total = total + temp;
		});
		if(ansArray.length === 0){
			SUS.sus= 0;
		}
		else{
			SUS.sus=(100/(ansArray.length*5))*parseInt(total);
		}
	}
	$.post("/saveQueryResponse",SUS,function(){
		console.log('successfully sent data');
		$('#queryForm').hide();
		$('#heading').text(function(){
			return "your answers have been noted you can now close this window";
		});
	},'text').always(function(){ 
	$('#queryForm').hide();
		$('#heading').text(function(){
			return "your answers have been noted you can now close this window";
		});
	});
	return false;
}
function isFormFilled(){
	var $questions = $(".question");
	if($questions.find("input:radio:checked").length === $questions.length) {
    	return true;
	}
	return false;
}
function toSUSVal(value){
	if(value%2===0){
		return 5-value;
	}
	else{
		return value-1;
	}
}	