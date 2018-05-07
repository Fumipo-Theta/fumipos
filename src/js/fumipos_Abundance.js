/* Abundanceオブジェクトのコンストラクタ */
Abundance=function(svgDivName,formDOM,parentArray){
	this.parent=parentArray;
	this.svg={};
	this.svg.divName=svgDivName;
	this.boxPropaty = {
		padding: {left: 15, right: 15, top: 15, buttom: 15},
		offset: {x: 60, y: 60},
		getPadding: function(){ return this.padding; },
		getOffset: function(){ return this.offset; }
	};
	this.formObj=this.readForm(formDOM);
	this.svg.DOM=d3.select("body").select(svgDivName);
	this.svg.size={width:parseInt(this.formObj.imageSize) ,height:parseInt(this.formObj.imageSize*this.formObj.aspectRatio)};
	this.axis={};
	this.initialize();
	this.normList=[];
}

/* formObj updator */
Abundance.prototype.catchFormUpdate=function(formDOM){
	this.formObj=this.readForm(formDOM);
};

/* Initializer */
Abundance.prototype.initialize=function(){
	// svg 領域のサイズ, オフセット, パディングを設定
	svgDivName=this.svg.divName;
	formObj=this.formObj;

	var offset= this.boxPropaty.getOffset();
	var padding= this.boxPropaty.getPadding();
	var svg=this.svg;
	
	// Set title
	svg.DOM.append("h1")
		.attr("class","abundance")
		.text("Abundance graph");
	
	svg.DOM.append("svg")
					.attr("width",svg.size.width)
					.attr("height",svg.size.height);
	svg.DOM=svg.DOM.select("svg");
	
	// 軸の長さを設定
	var axis=this.axis;
	axis.width = svg.size.width - offset.x -padding.left - padding.right;
	axis.height = svg.size.height - offset.y -padding.top -padding.buttom ;
	
	//	y軸を登録
	svg.DOM.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + (offset.x + padding.left) + "," + (svg.size.height - axis.height - offset.y - padding.buttom) + ")");
	// y軸ラベルを登録
	svg.DOM.select(".y.axis")
		.append("text")
		.attr("class","ylabel")
		.attr("transform","rotate (-90,"+ -offset.x + "," + axis.height*0.5 + ")")
		.attr("x",-offset.x)
		.attr("y",axis.height*0.5)
			
	// x軸を登録
	svg.DOM.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + (offset.x + padding.left) + "," + (svg.size.height - offset.y - padding.left) + ")");
	// x軸ラベルを登録
	svg.DOM.select(".x.axis")
		.append("text")
		.attr("class","xlabel")
		.attr("x",axis.width*0.5)
		.attr("y",offset.y)
};

/* Form reader */
Abundance.prototype.readForm=function(formDOM){
	var formObj=new Object();
	formObj={
		aspectRatio:formDOM.aspect.value,
		imageSize:parseInt(document.getElementById("graph_area").clientWidth*formDOM.imageSize.value),
		elementList:formDOM.eleName.value.split(" "),
		normInfo:formDOM.reserver.value.split(","),
		extent:{
			y:[parseFloat(formDOM.y_min.value),parseFloat(formDOM.y_max.value)]
		}
	};
	return formObj;
};

/* set Normalizing refference List */
Abundance.prototype.setNormList=function(csvRefObj){
	var normList=new Array();
	var normInfo=this.formObj.normInfo;
	for (attrKey in csvRefObj){
		if (csvRefObj[attrKey].value["name"] == normInfo[0] && csvRefObj[attrKey].value["study"] == normInfo[1]){
			normList.push({"key": 0, "value":csvRefObj[attrKey].value});
		}
	};
	this.normList=normList;
};

/* get normalized dataset */
Abundance.prototype.getNormalizedList=function(csvObj){
	var newList= new Array();
	var norm=new Array();
	var elementList=this.formObj.elementList;
	var normList=this.normList;
	
	for (attrKey in csvObj){
		norm.push({"key": attrKey, "value": Object()})
		// ノーマライズした値を追加
		for (var element in elementList){
			norm[attrKey].value[elementList[element]]=+csvObj[attrKey].value[elementList[element]]/+normList[0].value[elementList[element]];
		}
		
		if (csvObj[attrKey].value["name"] != ""){
			newList.push({"key": attrKey, "value": csvObj[attrKey].value, "norm": norm[attrKey].value});
		}
	}
	return newList;
};

/* Update framework */
Abundance.prototype.updateFramework=function(){
	var svg=this.svg;
	var formObj=this.formObj;
	var extent=formObj.extent;

	// グラフタイトル	
	var head1=d3.select(svg.divName).select("h1")
			head1.text("Normalized by "+ formObj.normInfo[0] +" of "+ formObj.normInfo[1]);
			
	// イメージサイズの変換
	svg.size={width:parseInt(formObj.imageSize) ,height:parseInt(formObj.imageSize*formObj.aspectRatio)};
	
	var offset= this.boxPropaty.getOffset();
	var padding= this.boxPropaty.getPadding();

	svg.DOM.attr("width",svg.size.width )
		.attr("height", svg.size.height);
	
	var axis=this.axis;
	axis.width = svg.size.width - offset.x -padding.left - padding.right;
	axis.height = svg.size.height - offset.y -padding.top -padding.buttom ;
	
	svg.DOM.select("g.y.axis")
	.attr("transform", "translate(" + (offset.x + padding.left) + "," + (svg.size.height - axis.height - offset.y - padding.buttom) + ")");
	
	svg.DOM.select("g.x.axis")
	.attr("transform", "translate(" + (offset.x + padding.left) + "," + (svg.size.height - offset.y - padding.buttom) + ")");
	
	//>> 軸の設定
	// y軸はlogスケール
	axis.xScale=d3.scale.ordinal()
						.domain(formObj.elementList)
						.rangePoints([0,axis.width],1.0);

	axis.yScale=d3.scale.log()
						.domain(extent.y)
						.range([axis.height,0]);
	
	axis.x=d3.svg.axis()
						.scale(axis.xScale)
						.ticks(5)
						.orient("bottom")
						.tickSize(6, -svg.size.height);
						
	axis.y=d3.svg.axis()
						.ticks(10,0)
						.scale(axis.yScale)
						.orient("left")
						.tickSize(6, -svg.size.width);
	
	// 軸の書き換え
	svg.DOM.select(".y.axis").call(axis.y);
	svg.DOM.select(".x.axis").call(axis.x);
	
	svg.DOM.select(".y.axis").select("path")
		.attr("d","M"+axis.width+",0H0V"+axis.height+"H"+axis.width);
		
	svg.DOM.select(".x.axis").select("path")
		.attr("d","M0,-"+axis.height+"V0H"+axis.width+"V-"+axis.height);
};

/* Replot flow */
Abundance.prototype.replot=function(csvObj,csvRefObj,formDOM){
	this.catchFormUpdate(formDOM);
	this.setNormList(csvRefObj);
	var dataList=this.getNormalizedList(csvObj);
	this.updateFramework();
	this.plotLine(dataList);
};

/* plot main data */
Abundance.prototype.plotLine=function(dataList){
	var parentAbundance=this;
	var svg=this.svg;

	//ツールチップのDOMを登録
	var tooltipAbundance = d3.select("body").select("#tooltip");

	var formObj=this.formObj;
	var elementList=formObj.elementList;
	var axis=this.axis;
	var offset=this.boxPropaty.getOffset();
	var padding=this.boxPropaty.getPadding();
	
	var normList=this.normList;

	var styleClass=document.getElementById("legendKey").value;

	
	//>> シンボルに関する変数
		var baseOpacity=document.symbolForm.baseOpacity.value,
			onOpacity=document.symbolForm.onOpacity.value,
			outOpacity=document.symbolForm.outOpacity.value;
			
		var baseRadius=document.symbolForm.baseRadius.value,
			onRadius=document.symbolForm.onRadius.value,
			outRadius=document.symbolForm.outRadius.value,
			strongRadius=8;
				
		var baseWidth=document.symbolForm.baseWidth.value,
			onWidth=document.symbolForm.onWidth.value,
			outWidth=document.symbolForm.outWidth.value,
			strongWidth=4;

	//>> プロット点の作成と書き換え(マウスオーバー時の挙動も定義)
	var line=d3.svg.line()
							.x(function(d,i){
									return axis.xScale(d.x)+offset.x + padding.left;
							})
							.y(function(d,j){
									return axis.yScale(d.y)+padding.top ;
							});

	function getLineObj(d){
		var tmpArray=new Array();
		var k=0;
		var n=elementList.length;
			for (var j=0; j < n; j++){
				if (isNaN(d[elementList[j]]) == false){
					tmpArray[k]= new Object();
					tmpArray[k]["x"]=elementList[j];
					tmpArray[k]["y"]=d[elementList[j]];
					k++;
				}
			}
			//console.log(tmpArray)
		if (tmpArray.length > 0) return line(tmpArray);
	};
		
	/**/
		path=svg.DOM.selectAll("path.abundance").data(dataList);
			path.exit().remove();
			path.enter().append("path");
			path.attr("name",function(d){ return d.value["name"] ;})
			.attr("fill","none")
			.attr("class",function(d){ return "abundance D"+d.value["ID"]+" "+d.value[styleClass]+" "+d.value["study"]})
			.attr("d",function(d){ return getLineObj(d.norm); })
			.attr("stroke-width", baseWidth);
	

	//>> マウスイベントリスナを登録
		path.on("mouseover", function(d){	
		d3.selectAll('path.abundance')
			.each(function(d){
				if (d3.select(this).attr("stroke-width") != strongWidth){
					d3.select(this)
						.attr("stroke-width",outWidth);
				}
			})
			
		var selectedClass=d3.select(this).attr("class");
		var selectedClassArray=selectedClass.split(" ");
		
		if (d3.select(this).attr("stroke-width") != strongWidth){
			d3.selectAll("path.abundance."+selectedClassArray[1])
				.attr("stroke-width",onWidth);
		}

		var harker=d3.selectAll("circle.Binary")
		if (harker[0].length > 0){
			harker.transition()
				.each(function(d){
					if (d3.select(this).attr("r") != strongRadius){
						d3.select(this)
							.attr("opacity",outOpacity);
					}
				})
			
			var harkerThis=d3.selectAll("circle.Binary."+selectedClassArray[1]);
			if (harkerThis[0].length > 0){
				if (harkerThis.attr("r") != strongRadius){
					d3.selectAll("circle.Binary."+selectedClassArray[1])
						.attr("opacity",onOpacity)
						.attr("r",onRadius);
				}
			}
		}
		
		return tooltipAbundance.style("visibility", "visible")
									.text(d.value["name"]+"   "+d.value["location"]);
	})
	
		.on("mousemove", function(d){
			return tooltipAbundance.style("top", (event.pageY-20)+"px").style("left",(event.pageX+10)+"px");
		})
			
 	 .on("mouseout", function(d){ 
  		d3.selectAll('path.abundance')
  			.transition()
  			.each(function(d){
  				if (d3.select(this).attr("stroke-width") != strongWidth){
  					d3.select(this).attr("stroke-width",baseWidth);
  				}
  			})
  		
  		d3.selectAll("circle.Binary")
  			.transition()
  			.each(function(d){
  				if (d3.select(this).attr("r") != strongRadius){
  					d3.select(this)
  						.attr("r",baseRadius)
  						.attr("opacity",baseOpacity);
  				}
  			})

  		return tooltipAbundance.style("visibility","hidden");
  	})
  
  	.on("click", function(d){

  		if (d3.select(this).attr("stroke-width") != strongWidth){
  			d3.select(this)
  				.transition()
  				.attr("stroke-width",strongWidth);
  		}else{
  			d3.select(this)
  				.transition()
  				.attr("stroke-width",onWidth);
  		}
  		var selectClass=d3.select(this).attr("class");
  		var selectClassArray=selectClass.split(" ");
  		var harker=d3.selectAll("circle.Binary")
  		if (harker[0].length > 0){
  			var harkerThis=d3.selectAll("circle.Binary."+selectClassArray[1]);
  			if (harkerThis[0].length > 0){
	  			if (harkerThis.attr("r") != strongRadius){
  					harkerThis.transition()
  						.attr("r",strongRadius);
  				}else{
  					harkerThis.transition()
  						.attr("r",onRadius);
  				}
  			}
  		}
  	})

};

Abundance.prototype.plotMixture=function(endMember){
	
};

Abundance.prototype.plotSimulatedMelt=function(endMember,csvObj){
	
};