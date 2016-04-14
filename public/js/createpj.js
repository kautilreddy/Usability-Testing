$('#totalQues').change(function(){
	var list = $("#quesList");
	var n = parseInt($(this).val());
	list.html(function(){
		var listHtml='';
		for(i=0;i<n;i++){
			listHtml = listHtml + "<li><input class='olEntry' type='text' name='q["+i+"]' required='true' placeholder=''></li>";
		}
		return listHtml;
	});
});