/* Binary object constructor */
Binary=function(svgDivName,formDOM,parentArray){
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
	
	this.molarValue={
		SiO2:60.06,
		TiO2:79.90,
		Al2O3:101.94,
		FeO:71.84,
		MgO:40.32,
		Fe2O3:159.69,
		CaO:56.08,
		Na2O:61.99,
		K2O:94.20,
		P2O5:141.94,
	};
	
	this.initialize();
};

/* formObj updator */
Binary.prototype.catchFormUpdate=function(formDOM){
	this.formObj=this.readForm(formDOM);
};

/* initializer */
Binary.prototype.initialize=function(){
	// svg 領域のサイズ, オフセット, パディングを設定
	svgDivName=this.svg.divName;
	formObj=this.formObj;

	var offset= this.boxPropaty.getOffset();
	var padding= this.boxPropaty.getPadding();
	var svg=this.svg;
	svg.DOM.append("svg")
					.attr("width",svg.size.width)
					.attr("height",svg.size.height);
	svg.DOM=svg.DOM.select("svg");
	
	// 軸の長さを設定
	var axis=this.axis;
	axis.width = svg.size.width - offset.x -padding.left - padding.right;
	axis.height = svg.size.height - offset.y -padding.top -padding.buttom ;
		
	
		
	// 軸を登録(svg要素内での位置と仮のラベルを指定)
	// y軸を登録
	svg.DOM.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + (offset.x + padding.left) + "," + (svg.size.height - axis.height - offset.y - padding.buttom) + ")");
	// y軸ラベルを登録
	svg.DOM.select(".y.axis")
		.append("text")
		.attr("class","ylabel")
		.attr("transform","rotate (-90,"+ -offset.x + "," + axis.height*0.6 + ")")
		.attr("x",-offset.x)
		.attr("y",axis.height*0.6)
		.text(" ");
	
	// x軸を登録
	svg.DOM.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + (offset.x + padding.left) + "," + (svg.size.height - offset.y - padding.buttom) + ")");
	// x軸ラベルを登録
	svg.DOM.select(".x.axis")
		.append("text")
		.attr("class","xlabel")
		.attr("x",axis.width*0.4)
		.attr("y",offset.y*0.75)
		.text(" ");
};

/* Form reader */
Binary.prototype.readForm=function(formDOM){
	var formObj=new Object();
	formObj={
		styleClass:formDOM.style.value,
		aspectRatio:formDOM.aspect.value,
		imageSize:parseInt(document.getElementById("graph_area").clientWidth*formDOM.imageSize.value),
		x:{},
		y:{}
	};

	var x=formObj.x;
	var y=formObj.y;

	x.name=formDOM.xName.value;
	y.name=formDOM.yName.value;
	
	if (x.name == "") x.name="dummy"
	if (y.name == "") y.name="dummy"
	
	// logプロットフラグをチェックボックスから取得
	x.logFlag=formDOM.checkLogX.checked;
	y.logFlag=formDOM.checkLogY.checked;
	
	x.max=formDOM.x_max.value;
	x.min=formDOM.x_min.value;
	y.max=formDOM.y_max.value;
	y.min=formDOM.y_min.value;
	
	// 組成式の数字を下付きにするため, xNameSupとyNameSupをアルファベットと数字に分割
	x.char=new Array(x.name.match(/[A-Z]+/gi));
	x.num=new Array(x.name.match(/[0-9]+/g));
	y.char=new Array(y.name.match(/[A-Z]+/gi));
	y.num=new Array(y.name.match(/[0-9]+/g));

	// 同位体比かどうか,元素比かどうかを判定
	
	if (x.name.match(/^[0-9]+/)){
		x.type="isotope";
		x.element=x.name.match(/[a-z]+/i)[0];
		x.sup=x.name;
		x.sub="dummy";
	}else{
		if (x.name.match(/\//)){
			x.type="ratio";
			x.element=x.name.split("/")[0];
			x.sup=x.name.split("/")[0];
			x.sub=x.name.split("/")[1];
		}else{
			x.type="abundance";
			x.element="dummy";
			x.sup=x.name;
			x.sub="dummy";
		}
	}
	
	if (y.name.match(/^[0-9]+/)){
		y.type="isotope";
		y.element=y.name.match(/[a-z]+/i)[0];
		y.sup=y.name;
		y.sub="dummy";
	}else{
		if (y.name.match(/\//)){
			y.type="ratio";
			y.element=y.name.split("/")[0];
			y.sup=y.name.split("/")[0];
			y.sub=y.name.split("/")[1];
		}else{
			y.type="abundance";
			y.element="dummy";
			y.sup=y.name;
			y.sub="dummy";
		}
	}
	return formObj;
};

/* Filtering data */
Binary.prototype.removeInvalidData=function(csvObj){
	var x=this.formObj.x;
	var y=this.formObj.y;
	var newList=new Array();
	for (attrKey in csvObj){
		if (! isNaN(csvObj[attrKey].value[x.sup]) && ! isNaN(csvObj[attrKey].value[y.sup]) && ! isNaN(csvObj[attrKey].value[x.sub]) && ! isNaN(csvObj[attrKey].value[y.sub]) && ! isNaN(csvObj[attrKey].value[x.element])  && ! isNaN(csvObj[attrKey].value[y.element]) ){
			if (csvObj[attrKey].value[x.sup] != "" && csvObj[attrKey].value[y.sup] != "" && csvObj[attrKey].value[x.sub] != "" && csvObj[attrKey].value[y.sub] != "" && csvObj[attrKey].value[x.element] != "" && csvObj[attrKey].value[y.element] != "" && csvObj[attrKey].value[x.sub] != "0" && csvObj[attrKey].value[y.sub] != "0" && csvObj[attrKey].value[x.element] != "0" && csvObj[attrKey].value[y.element] != "0" ){
				newList.push({"key": attrKey, "value":csvObj[attrKey].value});
			}
		}
	}
	
	return newList;
}

/* get extent of data */
Binary.prototype.getDataExtent=function(dataList){
	var x=this.formObj.x;
	var y=this.formObj.y
	var extent=new Object();
	extent.x=new Array();
	extent.y=new Array();
	
	if (x.max != ""){
			extent.x[1]=parseFloat(x.max);
	}else{
			extent.x[1]=d3.max(dataList, function(d){ return +d.value[x.sup]/+d.value[x.sub]; });
	}
	if (x.min != ""){
			extent.x[0]=parseFloat(x.min);
	}else{
			extent.x[0]=d3.min(dataList, function(d){ return +d.value[x.sup]/+d.value[x.sub]; });
	}
	
	// y軸の最大最小値
	if (y.max != ""){
			extent.y[1]=parseFloat(y.max);
	}else{
			extent.y[1]=d3.max(dataList, function(d){ return +d.value[y.sup]/+d.value[y.sub]; });
	}
	if (y.min != ""){
			extent.y[0]=parseFloat(y.min);
	}else{
			extent.y[0]=d3.min(dataList, function(d){ return +d.value[y.sup]/+d.value[y.sub]; });
	}
	
	return extent;
}

/* Framework updator */
Binary.prototype.updateFramework=function(extent){
	var svg=this.svg;
	var formObj=this.formObj;
	
	// グラフタイトル	
	var head1=svg.DOM.select("h1")
			head1.text(formObj.x.name+" vs. "+formObj.y.name);
	
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
	
	//console.log(xAxisWidth)
	//console.log(yAxisHight)


	// スケールと軸の設定
			// log指定ならlogスケール, そうでなければ線形スケール
		if (formObj.x.logFlag == true){
			axis.xScale=d3.scale.log()
				.domain(extent.x)
				.range([0,axis.width]);
			
			axis.x=d3.svg.axis()
				.scale(axis.xScale)
				.ticks(0,"e")
				.orient("bottom")
				.tickSize(6, -svg.size.height);
		}else{
			axis.xScale=d3.scale.linear()
				.domain(extent.x)
				.range([0,axis.width]);
			
			axis.x=d3.svg.axis()
				.scale(axis.xScale)
				.ticks(5)
				.orient("bottom")
				.tickSize(6, -svg.size.height);
		}
		
		if (formObj.y.logFlag == true){
			axis.yScale=d3.scale.log()
				.domain(extent.y)
				.range([axis.height,0]);
			
			axis.y=d3.svg.axis()
				.ticks(0,"e")
				.scale(axis.yScale)
				.orient("left")
				.tickSize(6, -svg.size.width);
		}else{
			axis.yScale=d3.scale.linear()
				.domain(extent.y)
				.range([axis.height,0]);
			
			axis.y=d3.svg.axis()
				.ticks(5)
				.scale(axis.yScale)
				.orient("left")
				.tickSize(6, -svg.size.width);
		}
		
	// 軸の作成
		// 軸の書き換え
		svg.DOM.select(".y.axis").call(axis.y);
		svg.DOM.select(".x.axis").call(axis.x);
		
				
		svg.DOM.select(".y.axis").select("path")
			.attr("d","M"+axis.width+",0H0V"+axis.height+"H"+axis.width)
			
			
		svg.DOM.select(".x.axis").select("path")
			.attr("d","M0,-"+axis.height+"V0H"+axis.width+"V-"+axis.height)
			

		
		// 軸ラベルの書き換え
		svg.DOM.select("text.ylabel")
			.attr("transform","rotate (-90,"+ -offset.x + "," + axis.height*0.6 + ")")
			.attr("x",-offset.x)
			.attr("y",axis.height*0.6)
			.text(formObj.y.name);
		svg.DOM.select("text.xlabel")
			.attr("x",axis.width*0.4)
			.attr("y",offset.y*0.75)
			.text(formObj.x.name);
			
		//var fontSize=parseInt(svg.size.width/25);
		
		//svg.DOM.selectAll("text").attr("style","font:"+fontSize+"px 'Arial'");
		svg.DOM.selectAll("path.domain").attr("fill","none");
}

/* Replot flow */
Binary.prototype.replot=function(csvObj,csvRefObj,formDOM){
	this.catchFormUpdate(formDOM);
	var dataObj=this.removeInvalidData(csvObj);
	var extent=this.getDataExtent(dataObj);
	this.updateFramework(extent);
	this.plotPoint(dataObj,extent);
}

/* Main data plot */
Binary.prototype.plotPoint=function(dataObj,extent){
	/* インスタンスの変数 */
	var parentHarker=this;
	var svg=this.svg;
	var formObj=this.formObj;
	var x=formObj.x;
	var y=formObj.y;
	var axis=this.axis;
	var offset=this.boxPropaty.getOffset();
	var padding=this.boxPropaty.getPadding();

	//console.log(csvObj);
	var styleClass=document.getElementById("legendKey").value;

	// ツールチップのDOMを登録
	var tooltipHarker = d3.select("body").select("#tooltip");
	
	/* Plot mode Selection */
	var mixModeFlag=false;
	var	syncModeFlag = false;
	var simulateModeFlag=false;
	
	var plotSelection=document.form_simulate.radioSimulateMode.value;
	if (plotSelection == "mixing"){
	// Mixing mode かどうかをチェックボックスから取得
		mixModeFlag=true;
	}else if (plotSelection == "none"){
		;
	}else{
	// Melting mode 
		simulateModeFlag=true;
	};

	//>> シンボルに関する変数をcommon formから定義
		var baseOpacity=document.symbolForm.baseOpacity.value,
			onOpacity=document.symbolForm.onOpacity.value,
			outOpacity=document.symbolForm.outOpacity.value;
			
		var baseRadius=document.symbolForm.baseRadius.value,
			onRadius=document.symbolForm.onRadius.value,
			outRadius=document.symbolForm.outRadius.value,
			strongRadius=10;
				
		var baseWidth=document.symbolForm.baseWidth.value,
			onWidth=document.symbolForm.onWidth.value,
			outWidth=document.symbolForm.outWidth.value,
			strongWidth=4;
	
	//>> プロット点の作成と書き換え(マウスオーバー時の挙動も定義)
		// d3のメソッドにより, シンボルは▲や■も用いられるらしい
	
	// シミュレートによるシンボルを消去
	svg.DOM.selectAll("path.mix").remove();
	svg.DOM.selectAll("path.melting").remove();
		
	/* d3によるcircle要素の定義と登録 */
	var circle=svg.DOM.selectAll("circle").data(dataObj);
	circle.enter().append("circle");
	circle.exit().remove();
	circle.attr("r",baseRadius)
				.attr("fill", "none")
				.attr("name", function(d){ return d.value["name"];})
				.attr("class", function(d){ return ("Binary D"+d.value["ID"]+" "+d.value[styleClass]+" "+d.value["study"])})
				.attr("opacity",baseOpacity)
				.attr("cx", function(d){ return axis.xScale(+d.value[x.sup]/+d.value[x.sub])+offset.x+padding.left; })
				.attr("cy", function(d){ return axis.yScale(+d.value[y.sup]/+d.value[y.sub])+padding.buttom; });
	
		// class が mine の要素に枠線をつける
	d3.selectAll("circle.mine")
				.attr("r",baseRadius*1.5)
				.attr("stroke","black")
				.attr("stroke-width","4px");
				
	//>> マウスイベントリスナを登録
	/* マウスオーバーによってツールチップを表示 & 強調表示 */
	circle.on("mouseover", function(d){	
		d3.selectAll("circle.Binary")
			.transition()
			.each(function(d){
				if (d3.select(this).attr("r") != strongRadius){
					d3.select(this)
						.attr("opacity",outOpacity)
				}
			})
			
		// 他グラフへの強調表示の波及
		var selectedClass=d3.select(this).attr("class");
		var selectedClassArray=selectedClass.split(" ");
		
		if (d3.select(this).attr("r") != strongRadius){
			d3.selectAll("circle.Binary."+selectedClassArray[1])
				.attr("r",onRadius)
				.attr("opacity",onOpacity);
		}

		var abundance=d3.selectAll("path.abundance")
		if (abundance[0].length > 0){
			abundance.transition()
				.each(function(d){
					if (d3.select(this).attr("stroke-width") != strongWidth){
						d3.select(this)
							.attr("stroke-width",outWidth);
					}
				})
			
			var abundanceThis=d3.selectAll("path.abundance."+selectedClassArray[1]);
			if (abundanceThis[0].length > 0){
				if (abundanceThis.attr("stroke-width") != strongWidth){
					abundanceThis.attr("stroke-width",onWidth);
				}
			}
		}
		
		/* for map
		var mapPoint=d3.selectAll("circle.Map");
		if (mapPoint[0].length > 0){
			mapPoint.transition()
				.attr("opacity",0.1);
		}
		var mapPointThis=d3.selectAll("circle.Map."+selectedClassArray[1]);
		if (mapPoint[0].length > 0){
			mapPointThis.attr("opacity",1);
		}
		*/	
		
		// ツールチップの内容を定義
		return tooltipHarker.style("visibility", "visible")
									.text(d.value["name"]+"   "+d.value["location"]+" ,[ "+d.value[x.sup]+"/"+d.value[x.sub]+" : "+d.value[y.sup]+"/"+d.value[y.sub]+" ]");
		
	});
				
	/* マウスの移動にツールチップを追従させる */
  circle.on("mousemove", function(d){
 		return tooltipHarker.style("top", (event.pageY-20)+"px").style("left",(event.pageX+10)+"px");
	});
   					
  /* マウスアウトでツールチップ非表示 & 強調表示解除 */
	circle.on("mouseout", function(d){ 
		d3.selectAll("circle.Binary")
			.transition()
			.each(function(d){
				if (d3.select(this).attr("r") != strongRadius){
					d3.select(this)
						.attr("opacity",baseOpacity)
						.attr("r",function(d){ if(d.value["study"] == "mine"){
							return baseRadius*1.5;
						}else{
							return baseRadius;
						}});
				}
			})
		
		d3.selectAll("path.abundance")
			.transition()
			.each(function(d){
				if (d3.select(this).attr("stroke-width") != strongWidth){
					d3.select(this)
						.attr("stroke-width",baseWidth);
				}
			})
	
		/* for map
		d3.selectAll("circle.Map")
			.transition()
			.attr("opacity",0.3);
		*/
	
		return tooltipHarker.style("visibility","hidden");
	});
	
	/* クリックにより特に強調 or 各種シミュレーション */
	circle.on("click",function(d){
 		var selectedClass=d3.select(this).attr("class");
		var selectedClassArray=selectedClass.split(" ");
		if (d3.select(this).attr("r") != strongRadius){
			d3.selectAll("circle."+selectedClassArray[1])
				.transition()
				.attr("r",strongRadius);
		}else{
			d3.selectAll("circle."+selectedClassArray[1])
				.transition()
				.attr("r",onRadius);
		}

		var abundance=d3.selectAll("path.abundance")
		if (abundance[0].length > 0){
			var abundanceThis=d3.selectAll("path.abundance."+selectedClassArray[1]);
			if (abundanceThis[0].length > 0){
				if (abundanceThis.attr("stroke-width") != strongWidth){
					abundanceThis.transition()
						.attr("stroke-width",strongWidth);
				}else{
					abundanceThis.transition()
						.attr("stroke-width",onWidth);
				}
			}
		}
	});

		/* シミュレーション */
	if (mixModeFlag == true){
		//>> Mixing simulation
		var endMember=new Array();  		
		circle.on("click", function(d){
			if (endMember.length > 2) endMember.shift();
			parentHarker.drawMix_curve(endMember,parentHarker.parent);
			return endMember.push(d);
		});
	}else if (simulateModeFlag == true){
		//>> Melting simulation
		var endMember=new Array();
		circle.on("click", function(d){
			endMember.shift();
			endMember.push(d);
			parentHarker.drawSimulatedMelt(endMember,parentHarker.parent);
		});
	}
}

/* _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ */
//
//
/* それぞれのグラフにミキシングカーブを描くための関数 drawMix_curve */
//
//
// _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ 

Binary.prototype.drawMix_curve=function(endMember,parentArray){
	var parent=parentArray; // 自身を格納している配列を参照
	// 2点選ばれたなら, ミキシングカーブを計算する
	if (endMember.length == 2){
		var iterateNum=parent.length;		
		for (var j=0; j < iterateNum; j++){
			console.log(parent[j])
			parent[j].plotMixture(endMember);
		};
	};
};

/* 実際にmixingカーブを描くメソッド */
Binary.prototype.plotMixture=function(endMember){
	var tooltipHarker = d3.select("body").select("#tooltipHarker");
	var svg=d3.select(this.svg.divName).select("svg");
	var px,py;
	var mixArray=new Array();
	var mixPoint=new Array();
	mixPoint[0]=new Array();
	var formObj=this.formObj;
	var x=formObj.x;
	var y=formObj.y;
	var axis=this.axis;
	var padding=this.boxPropaty.getPadding();
	var offset=this.boxPropaty.getOffset();
	
	var mixingRatioValues=document.form_simulate.fraction.value;
	var mixingRatio=mixingRatioValues.split(" ");
	
	/* Mixed value calculator */
	function getMixValue(endMember,name,ratio){
		var val=(endMember[0].value[name.sup]*endMember[0].value[name.element]*(1-ratio) + endMember[1].value[name.sup]*endMember[1].value[name.element]*ratio)/(endMember[0].value[name.sub]*endMember[0].value[name.element]*(1-ratio)+endMember[1].value[name.sub]*endMember[1].value[name.element]*ratio)
				
		return val;
	};

	for (var i=0; i<mixingRatio.length; i++){
		px=getMixValue(endMember,x,mixingRatio[i]);
		py=getMixValue(endMember,y,mixingRatio[i]);
		mixArray.push({"x": px, "y": py, "label": mixingRatio[i]});
		mixPoint[0][i]={x:px,y:py};
	};
	
	var line=d3.svg.line()
				.x(function(d){
						return axis.xScale(d.x)+offset.x + padding.left;
				})
				.y(function(d){
						return axis.yScale(d.y)+padding.top ;
				});
	
				
				
	console.log(mixPoint)
	
	/* 溶融曲線をプロット */
	var mixPath=svg.selectAll("path.mix").data(mixPoint);
			mixPath.exit().remove();
			mixPath.enter().append("path");
			mixPath.transition().attr("fill","none")
				.attr("class","mix")
				.attr("d",function(d){ console.log(line(d)); return line(d)})
				.attr("stroke-width", 1);
	
	/* ミキシング結果を示す点をプロット */
	var mixCircle=svg.selectAll("circle.mix").data(mixArray);
	mixCircle.enter().append("circle");
	mixCircle.exit().remove();
	mixCircle.attr("class","mix")
		.attr("r",2)
		.attr("opacity",1)
		.transition()
		.attr("cx",function(d){ if (isNaN(d.x) == false && isNaN(d.y) == false)
			{return axis.xScale(d.x)+offset.x+padding.left;
			}
		})
		.attr("cy",function(d){ if (isNaN(d.y) == false && isNaN(d.x) == false)
			{return axis.yScale(d.y)+padding.buttom;
			}
		});
		
	mixCircle.on("mouseover",function(d){
		return tooltipHarker.style("visibility", "visible")
									.text(d.label);
	});
	
	mixCircle.on("mousemove", function(d){
 		return tooltipHarker.style("top", (event.pageY-20)+"px").style("left",(event.pageX+10)+"px");
	});
   					
	mixCircle.on("mouseout", function(d){
		return tooltipHarker.style("visibility","hidden");
	});
};

/* それぞれのグラフに溶融曲線を描くための関数 */
Binary.prototype.drawSimulatedMelt=function(endMember,parentArray){
	var parent=parentArray;
	var iterateNum=parent.length;
	
	for (var j=0; j<iterateNum; j++){
		//console.log(parent[j])
		parent[j].plotSimulatedMelt(endMember,csvPartitioningObj);
	};
};

/* _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ */
//
//
/* melt simulator */
//
//
// _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ 

Binary.prototype.plotSimulatedMelt=function(endMember,csvDObj){
	/* 組成シミュレート関数 */
		/* SimulateObj */
	function SimulatedObj(){
		var func=Object.create(SimulatedObj.prototype);
		func.plotObj=new Object();
		func.plotObj.points=new Array();
		func.plotObj.paths=new Array();
		func.plotObj.paths[0]=new Array();
		return func;
	}
			/* prototype */
	SimulatedObj.prototype={
		getPlotObj(){
			return this.plotObj;
		},
		getPlotPoints(){
			return this.plotObj.points;
		},
		getPlotPaths(i){
			if (i){
				return this.plotObj.paths[i];
			}else{
				return this.plotObj.paths;
			}
		},
		
				/* phaseObj
	 		phaseObj:{
	 			olivine:{
	 				name:"olivine",
	 				init:(initial abundance/modal abundance),
	 				react:(reaction stoichiometry)
	 				D:{
	 					Nb:"",
	 					Fe_Mg:"",
					}
				},
				orthopyroxene:{
				
				},
			}
	 			*/
		getPhaseObj(){
			var phase=new Object();
			var csvObj=this.csvDObj;
			
			for (var attrKey in csvObj){
				var phaseName=csvObj[attrKey].value["phase"];
				phase[phaseName]=new Object();
				phase[phaseName].name=csvObj[attrKey].value["phase"];
				phase[phaseName].init=parseFloat(document.getElementById("initial_"+phase[phaseName].name).value);
				phase[phaseName].react=parseFloat(document.getElementById("reaction_"+phase[phaseName].name).value);
				phase[phaseName].D=new Object();
				
				for (var key in csvObj[attrKey].value){
					if (key != "phase") phase[phaseName].D[key]=csvObj[attrKey].value[key];
				};
				
			};
			return phase;
		},
		
				/* D obj
			D={
				solidInit:{
					($x.sup)Fe_Mg:,
					($x.sub)Nb:,
					($y.sup)Y:,
					($y.sub)Zr:,
				},
				solidReact:{
					(x.sup)Fe_Mg:,
					(x.sub)Nb:,
					(y.sup)Y:,
					(y.sub)Zr:,
				},
				olivine:{
					$phaseObj.olivine.D
					(Fe_Mg:,
					Nb:,)
				},
				orthopyroxene:{
					$phaseObj.orthopyroxene.D
					(Fe_Mg:,
					Nb:,)
				},
			}
				*/
		
		getDObj(){
			var phaseObj=this.phaseObj;
		
			var dObj=new Object();
			
			dObj.solidInit=new Object();
			dObj.solidReact=new Object();
		
			for (var elem in this.csvDObj[0].value){
				if (elem == "phase") continue
				// initialize
				dObj.solidInit[elem]=0;
				dObj.solidReact[elem]=0;
				dObj.solidInit[elem]=0;
				dObj.solidReact[elem]=0;
			
				for (var phasekey in phaseObj){
					var phase=phaseObj[phasekey];
					
					/* phase ex.
					olivine:{
	 					name:"olivine",
	 					init:(initial abundance/modal abundance),
	 					react:(reaction stoichiometry)
	 					D:{
	 						Nb:"",
	 						Fe_Mg:"",
						}
					},
					*/
					
					dObj[phase.name]=phase.D;
					
					dObj.solidInit[elem] += phase.D[elem]*phase.init;
				
					dObj.solidReact[elem] += phase.D[elem]*phase.react;

				};
			};
			return dObj;
		},
	};
	
	
		/* FixedDegreeFunc */
		
	function FixedDegreeFunc(endMember,x,y,ratios,csvDObj,calcfunc){
		var func=Object.create(FixedDegreeFunc.prototype);
		Object.assign(func,SimulatedObj());
	
		func.endMember=endMember;
		func.x=x;
		func.y=y;
		func.ratios=ratios;
		func.csvDObj=csvDObj;
		func.calcFunc=calcfunc;
		
		func.phaseObj=func.getPhaseObj();
		func.D=func.getDObj();
		func.setPlotValue();
		return func;
	};
			/* prototype */
	FixedDegreeFunc.prototype={
	
		setPlotValue(){
			var l=this.ratios.length;
			for (var i=0; i<l; i++){
				var ratio=this.ratios[i];
				if (ratio <= 0) continue;
				var x=this.calcFunc(this.endMember,this.x,ratio,this.D);
				var y=this.calcFunc(this.endMember,this.y,ratio,this.D);
				this.plotObj.paths[0][i]={"x":x,"y":y};
				this.plotObj.points.push({"x":x,"y":y,"label":ratio});
			}
			
		},
	};
	Object.setPrototypeOf(FixedDegreeFunc.prototype,SimulatedObj.prototype);	
	
		// _/_/_/_/_/_/_/_/_/_/
		//
		/* VariableDegreeFunc */
		//
		// _/_/_/_/_/_/_/_/_/_/
	
	function VariableDegreeFunc(endMember,x,y,ratios,csvDObj,calcFunc){
		var func=Object.create(VariableDegreeFunc.prototype);
		Object.assign(func,SimulatedObj());
		
		func.endMember=endMember;
		func.x=x;
		func.y=y;
		func.csvDObj=csvDObj;
		func.calcFunc=calcFunc;
		
		func.phaseObj=func.getPhaseObj();
		func.D=func.getDObj();
		func.setPlotValue();
		return func;
	};
	
			/* prototype */
			
	VariableDegreeFunc.prototype={
	
		setPlotValue(){
			this.plotObj=calcFunc(this.endMember,this.x,this.y,this.phaseObj,this.D);
		},
		
	};
	Object.setPrototypeOf(VariableDegreeFunc.prototype,SimulatedObj.prototype);
	
	/* _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ */
	//
	//
	/* 個別のシミュレート関数 */
	//
	//
	// _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ 

		/* Batch */
	function getBatchMeltValue(endMember,name,ratio,D){
		var supVal=endMember[0].value[name.sup]/(D.solidInit[name.sup]+ratio*(1-D.solidReact[name.sup]));

		if (name.sub != "dummy"){
			var subVal=endMember[0].value[name.sub]/(D.solidInit[name.sub]+ratio*(1-D.solidReact[name.sub]));
		}else{
			subVal=1.;
		};
		return supVal/subVal;
	};
	
	function getBatchCrystalValue(endMember,name,ratio,D){
		var supVal=endMember[0].value[name.sup]/(D.solidInit[name.sup]+(1-ratio)*(1-D.solidInit[name.sup]));
		
		if (name.sub != "dummy"){
			var subVal=endMember[0].value[name.sub]/(D.solidInit[name.sub]+(1-ratio)*(1-D.solidInit[name.sub]));
		}else{
			subVal=1.;
		};
		return supVal/subVal;
	};
	
		/* aggregate */
	function getAggregationMeltValue(endMember,name,ratio,D){
		var supVal=(1-D.solidReact[name.sup]/D.solidInit[name.sup]*ratio);
		supVal=Math.pow(supVal,(1/D.solidReact[name.sup]));
		supVal=(1-supVal)*endMember[0].value[name.sup]/ratio;
		
		if (name.sub != "dummy"){
			var subVal=(1-D.solidReact[name.sub]/D.solidInit[name.sub]*ratio);
			subVal=Math.pow(subVal,(1/D.solidReact[name.sub]));
			subVal=(1-subVal)*endMember[0].value[name.sub]/ratio;
		}else{
			subVal=1.;
		};
		return supVal/subVal;
	};
	
		/* Rayleigh */
	function getRayleighMeltValue(endMember,name,ratio,D){
		var supVal=(1-D.solidReact[name.sup]/D.solidInit[name.sup]*ratio);
		supVal=Math.pow(supVal,(1/D.solidReact[name.sup]-1));
		supVal=supVal*endMember[0].value[name.sup]/D.solidInit[name.sup];
		
		if (name.sub != "dummy"){
			var subVal=(1-D.solidReact[name.sub]/D.solidInit[name.sub]*ratio);
			subVal=Math.pow(subVal,(1/D.solidReact[name.sub]-1));
			subVal=subVal*endMember[0].value[name.sub]/D.solidInit[name.sub];
		}else{
			subVal=1.;
		};
		return supVal/subVal;
	};
	
	function getRayleighCrystalValue(endMember,name,ratio,D){
		var supVal=Math.pow((1-ratio),(D.solidInit[name.sup]-1));
		supVal=supVal*endMember[0].value[name.sup];
		
		if (name.sub != "dummy"){
			var subVal=Math.pow((1-ratio),(D.solidInit[name.sub]-1));
			subVal=subVal*endMember[0].value[name.sub];
		}else{
			subVal=1.;
		};
		return supVal/subVal;
	};
	
	function getRayleighRemeltingValue(endMember,name,ratio,D){
		var supVal=endMember[0].value[name.sup]*(Math.pow((1+ratio),(D.solidInit[name.sup]-1)));
		
		if (name.sub != "dummy"){
			var subVal=endMember[0].value[name.sub]*(Math.pow((1+ratio),(D.solidInit[name.sub]-1)));
		}else{
			subVal=1.;
		};
		return supVal/subVal;
	};
	
		/* with major element */
	function getRayleighCrystallizationMajor(endMember,x,y,phaseObj,D){
			/* set constructor operand */
			// initial melt composition
		var initialMelt= new Object();
		initialMelt.H2O=parseFloat(document.form_simulate.water.value);
		initialMelt.compo= endMember[0].value;
		
			// solid phase information
		var phaseObj=phaseObj;
	
			// simulate element
		var x=x;
		var y=y;
		var elements=new Array();
		elements.push(x.sup);
		if (x.sub != "dummy") elements.push(x.sub);
		elements.push(y.sup);
		if (y.sub != "dummy") elements.push(y.sub);
	
			// construct Crystal object
		var crystal=new Crystal(initialMelt,phaseObj,elements);
		
		
			/* set target operand */
		var finalMgN=document.form_simulate.targetMgN.value;
		var targetPhase=document.form_simulate.targetPhase.value;
		var pressure=document.form_simulate.pressure.value;
		var initialMgN=crystal.getEquiMgnumber(targetPhase);
		var coolTime=0; // dummy
		
			// 出発メルトから結晶化初期のメルト組成を求める
		if(finalMgN > initialMgN){
			crystal.remelting(finalMgN,targetPhase,true);
			path="ascend";
		}else{
			crystal.fractionate(finalMgN,targetPhase,true);
			path="descend";
		};
		
			// プロファイルを返す
			/* create section object 
			return::
			section
			\-Fe_Mg
				\-name:"Fe_Mg"
				\-temperature:[2]
				\-time:~
				\-x:[]
				\-c:[~]
				\-f:[~]
			\-Cr2O3
				\-name:"Cr2O3"
				\-temperature:[2]
				\-time:~
				\-x:[]
				\-c:[~]
				\-f:[~]
			*/
		var profile=crystal.getSection("melt",elements,coolTime,pressure,path);
		
			/* プロファイルを整形してplotObj形式にする */
		var l=profile[x.sup].c.length;
		var plotObj=new Object();
		plotObj.points=new Array();
		plotObj.paths=new Array();
		plotObj.paths[0]=new Array();
		for (var i=0; i<l; i++){
			//plotObj.points[i]=new Object();
			if (x.sub != "dummy"){
				var px=profile[x.sup].c[i]/profile[x.sub].c[i];
			}else{
				px=profile[x.sup].c[i];
			};
			
			if (y.sub != "dummy"){
				var py=profile[y.sup].c[i]/profile[y.sub].c[i];
			}else{
				py=profile[y.sup].c[i];
			};
			
			ratio=profile[x.sup].f[i];
		
			plotObj.points.push({"x":px, "y":py, "label": ratio});
			plotObj.paths[0][i]={"x":px, "y":py};
		};
		
		return plotObj;
	};
	
	/* _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ */
	//
	//
	/* インスタンス変数 */
	//
	//
	// _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ 

	var tooltipHarker = d3.select("body").select("#tooltipHarker");
	var svg=d3.select(this.svg.divName).select("svg");
	var formObj=this.formObj;
	var x=formObj.x;
	var y=formObj.y;
	var axis=this.axis;
	var padding=this.boxPropaty.getPadding();
	var offset=this.boxPropaty.getOffset();
	
	// Read melting mode
	var simulateMode=document.form_simulate.radioSimulateMode.value;
	
	// Read melting degrees
	var ratioValues=document.form_simulate.fraction.value;
	var ratioArray=ratioValues.split(" ");
	for (key in ratioArray){
		ratioArray[key]=parseFloat(ratioArray[key]);
	}
	
	
	/* Select melting function */
	
	if (simulateMode == "BatchMelt"){
		var Constructor=FixedDegreeFunc;
		var calcFunc=getBatchMeltValue;
	}else if(simulateMode == "RayleighMelt"){
		Constructor=FixedDegreeFunc;
		calcFunc=getRayleighMeltValue;
	}else if(simulateMode == "AggregateMelt"){
		Constructor=FixedDegreeFunc;
		calcFunc=getAggregationMeltValue;
	}else if(simulateMode == "BatchCrystal"){
		Constructor=FixedDegreeFunc;
		calcFunc=getBatchCrystalValue;
	}else if(simulateMode == "RayleighCrystal"){
		Constructor=FixedDegreeFunc;
		calcFunc=getRayleighCrystalValue;
	}else if(simulateMode == "RayleighRemelting"){
		Constructor=FixedDegreeFunc;
		calcFunc=getRayleighRemeltingValue;
	}else if(simulateMode == "FracRemeltWithMajor"){
		Constructor=VariableDegreeFunc;
		calcFunc=getRayleighCrystallizationMajor;
	}else{
		alert("Bad melting mode parameter");
		return;
	};
	
	var plotObjFunc=Constructor(endMember,x,y,ratioArray,csvDObj,calcFunc);
	
	
	/* パス用配列を作る補助関数 */
	var line=d3.svg.line()
				.x(function(d){
					if(! isNaN(d.x) && ! isNaN(d.y)){
						return axis.xScale(d.x)+offset.x + padding.left;
					}
				})
				.y(function(d){
					if(! isNaN(d.x) && ! isNaN(d.y)){
						return axis.yScale(d.y)+padding.top ;
					}
				});
	
	/* 溶融曲線をプロット */
	var simulatePath=svg.selectAll("path.melting").data(plotObjFunc.getPlotPaths());
			simulatePath.exit().remove();
			simulatePath.enter().append("path");
			simulatePath.transition().attr("fill","none")
				.attr("class","melting")
				.attr("d",function(d){return line(d)})
				.attr("stroke-width", 1);
	
	/* 溶融結果を示す点をプロット */
	var simulateCircle=svg.selectAll("circle.melting").data(plotObjFunc.getPlotPoints());
	simulateCircle.enter().append("circle");
	simulateCircle.exit().remove();
	simulateCircle.attr("class","melting")
		.attr("r",2)
		.attr("opacity",1)
		.transition()
		.attr("cx",function(d){ if (isNaN(d.x) == false && isNaN(d.y) == false)
			{return axis.xScale(d.x)+offset.x+padding.left;}
		})
		.attr("cy",function(d){ if (isNaN(d.y) == false && isNaN(d.x) == false)
			{return axis.yScale(d.y)+padding.buttom;}
		});
	
	simulateCircle.on("mouseover",function(d){
		return tooltipHarker.style("visibility", "visible")
									.text(d.label);
	});
	
	simulateCircle.on("mousemove", function(d){
 		return tooltipHarker.style("top", (event.pageY-20)+"px").style("left",(event.pageX+10)+"px");
	});
   					
	simulateCircle.on("mouseout", function(d){
		return tooltipHarker.style("visibility","hidden");
	});
};
