/* レジェンドテーブル作成 */





function showRockType(rockType){
	var checkBox=d3.select("form.legend")
				.select("input#check-"+rockType);
	var flag=checkBox[0][0].checked;
	console.log(flag);
	
	
	if (flag == false){
		d3.selectAll("circle.Binary."+rockType)
			.attr("visibility","hidden");
		d3.selectAll("path.abundance."+rockType)
		.attr("visibility","hidden");
	}else{
		d3.selectAll("circle.Binary."+rockType)
			.attr("visibility","visible");
		d3.selectAll("path.abundance."+rockType)
		.attr("visibility","visible");
	}
};

function replotGraphs(){
	var formBinary=$("div.formHarker form");
	for (var i=0; i < formBinary.length; i++){
		//console.log(formBinary[0]);
		plotHarker(csvMainObj,csvRefObj,"div.Binary"+i,formBinary[i]);
	};
	
	var formAbundance=$("div.formAbundance form");
	for (var i=0; i < formAbundance.length; i++){
		//console.log(formAbundance);
		plotAbundance(csvMainObj,csvRefObj,"div.Abundance"+i,formAbundance[i]);
	};
	
	toggleVisibility();
	
}





	