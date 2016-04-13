function sendSUS(pid,totalQues,qtype){
	var SUS={
		sus:0
	}
	var total = 0;
	var ansArray = $('#queryForm').serializeArray();
	if(qtype==='default'){
		$.each(ansArray,function(index,value){
			if(index%2===0{
				console.log('value to add '+value.value -1);
				total = total+value.value -1;
			}
			else{
				console.log('value to add '+(5 - value.value);
				total= total+(5 - value.value); 
			}
			console.log('value = '+value.value+' total = '+total);
		});
				console.log(total);
	}
	else{

	}
}