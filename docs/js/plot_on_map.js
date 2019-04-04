function plotOnMap(csvObj,divHarker,mapDOM,formDOM){
	console.log(divHarker)
	console.log(mapDOM)
	
	d3.select(".SvgOverlay").remove();
	
	// Googleマップにオーバーレイされるオブジェクト
		//このオブジェクトの.drawメソッド内にデータプロットアルゴリズムを記述
		

		// Form読み取り
		var formObj=readHarkerForm(formDOM);
		var x=formObj.x;
		var y=formObj.y;
			
		imageSize=formObj.imageSize,
		aspectRatio=formObj.aspectRatio;
		//>> x要素またはy要素がNaNであるオブジェクトを除外した新しい配列を作る(newList)
		var newList= new Array();
		newList=removeInvalidData(csvObj,formObj);
		
		var extent=getDataExtent(formDOM,newList,x,y);
		
		x.min=extent.x[0];
		x.max=extent.x[1];
		y.min=extent.y[0];
		y.max=extent.y[1];
		//シンボルのスケール
		if (x.logFlag == true){
			x.visualScale=d3.scale.log()
							.domain([x.min,x.max])
							.range(["blue","red"]);
					
			x.opacityScale=d3.scale.log()
							.domain([x.min+(x.min-x.max)*0.000001,x.min,x.max,x.max+(x.max-x.min)*0.000001])
							.range([0,0.5,0.5,0]);
			
		}else{
			x.visualScale=d3.scale.linear()
							.domain([x.min,x.max])
							.range(["blue","red"]);
							
			x.opacityScale=d3.scale.linear()
							.domain([x.min+(x.min-x.max)*0.000001,x.min,x.max,x.max+(x.max-x.min)*0.000001])
							.range([0,0.5,0.5,0]);
		}
		
		if(y.logFlag == true){
			y.visualScale=d3.scale.log()
							.domain([y.min+(y.min-y.max)*0.000001,y.min,y.max,y.max+(y.max-y.min)*0.000001])
							.range([0,1,10,0]);
			
		}else{
			y.visualScale=d3.scale.linear()
							.domain([y.min+(y.min-y.max)*0.000001,y.min,y.max,y.max+(y.max-y.min)*0.000001])
							.range([0,1,10,0]);
		}
		
		
	var overlay = new google.maps.OverlayView(); 
	//オーバーレイ設定
	overlay.onAdd = function () {
		console.log("onAdd")
		var layer=d3.select(this.getPanes().overlayLayer).append("div").attr("class","SvgOverlay");
		var svg=layer.append("svg");
		var gunmalayer = svg.append("g").attr("class", "AdminDivisions");


		var markerOverlay = this;
		var overlayProjection = markerOverlay.getProjection();


		//Google Projection作成メソッド
			//経度緯度をピクセル座標(x,y)へ変換
		var googleMapProjection = function (coordinates) {
			var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]);
			var pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates);
			return [pixelCoordinates.x + 4000, pixelCoordinates.y + 4000];
		}

		//>> Map 上にデータを描くメソッド
								
		// Map表示範囲, 倍率が変化すると呼び出される
		overlay.draw = function () {
		
			console.log(newList)
	
			// データの経度緯度をピクセル座標(x,y)へ変換
			newList.forEach(function(d){
				var point=googleMapProjection([d.value['longitude'] ,d.value['latitude']]); 
				d['xpoint']=point[0];
				d['ypoint']=point[1];
			});
			
			// シンボル属性登録
			var circleAttr={
					"class":function(d,i){ return ("Map D"+d.value["ID"]+" "+d.value["region"]+" "+d.value["study"]+" "+d.value["rockType"])},
					"cx":function(d,i){return d['xpoint'];},
					"cy":function(d,i){return d['ypoint'];},
					"fill":function(d){return x.visualScale(d.value[x.sup]/d.value[x.sub]);},
					"opacity":function(d){return x.opacityScale(d.value[x.sup]/d.value[x.sub]);},
					"r": function(d){return y.visualScale(d.value[y.sup]/d.value[y.sub]);},
			};
			
			//シンボル生成
			var circle = gunmalayer.selectAll("circle").data(newList);
				circle.enter().append("circle");
				circle.exit().remove();
				circle.attr(circleAttr);
			
		};

	}
	//作成したSVGを地図にオーバーレイする
	overlay.setMap(mapDOM);
	// Legend
	drawMapLegend(divHarker,formDOM,x,y);
	
};

function getLinearScale(domainArray,rangeArray){
	console.log(domainArray)
	var scale=d3.scale.linear()
							.range(rangeArray)
							.domain(domainArray);
	
	return scale;
};

function getSqrtScale(domainArray,rangeArray){
	var scale=d3.scale.sqrt()
							.range(rangeArray)
							.domain(domainArray);
	
	return scale;
};

function getLogScale(domainArray,rangeArray){
	var scale=d3.scale.log()
							.range(rangeArray)
							.domain(domainArray);
	
	return scale;
};



function drawMapLegend(divClass,formDOM,x,y){
	svgHarker=d3.select(divClass).select("svg");
	
	var imageSize=parseInt(document.getElementById("graph").clientWidth*formDOM.imageSize.value);
	var aspectRatio=formDOM.aspect.value;
	
	var padding=propatyHarker.getPadding();
	var offset=propatyHarker.getOffset();
	var svgSize={width:imageSize,height:imageSize*aspectRatio};
	
	var axis=new Object;
	axis.width = svgSize.width - offset.x -padding.left - padding.right;
	axis.height = svgSize.height - offset.y -padding.top -padding.buttom ;
	
	
	if (x.logFlag == true){
		x.HarkerScale=d3.scale.log()
									.domain([x.min,x.max])
									.range([0,axis.width]);
		
	}else{
		x.HarkerScale=d3.scale.linear()
									.domain([x.min,x.max])
									.range([0,axis.width]);
	}
	
	if (y.logFlag == true){
		y.HarkerScale=d3.scale.log()
									.domain([y.min,y.max])
									.range([axis.height,0]);
		
	}else{
		y.HarkerScale=d3.scale.linear()
									.domain([y.min,y.max])
									.range([axis.height,0]);
	}
				// スケール描画
				var pointRadiusScale=new Array();
				var pointColorScale=new Array();
				
				for (var j=0;j<100;j++){
						pointColorScale[j]=x.min+(x.max-x.min)*0.01*j;
						pointRadiusScale[j]=y.min+(y.max-y.min)*0.01*j;
				}
				
				console.log(pointColorScale)
				
				colorScaleCircle=svgHarker.selectAll("circle.color").data(pointColorScale);
				colorScaleCircle.exit().remove();
				colorScaleCircle.enter().append("circle");
				colorScaleCircle.attr("class","color")
						.attr("cx",function(d,i){ return x.HarkerScale(pointColorScale[i])+offset.x+padding.left; })
						.attr("cy",function(d,i){ return y.HarkerScale(y.min)+padding.buttom; })
						.attr("r",3)
						.attr("fill",function(d,i){ return x.visualScale(d);})
						.attr("opacity",0.7);
				
				radiusScaleCircle=svgHarker.selectAll("circle.radius").data(pointRadiusScale);
				radiusScaleCircle.exit().remove();
				radiusScaleCircle.enter().append("circle");
				radiusScaleCircle.attr("class","radius")
						.attr("cx",function(d,i){ return x.HarkerScale(x.max)+padding.left+offset.x; })
						.attr("cy",function(d,i){ return y.HarkerScale(pointRadiusScale[i])+padding.buttom; })
						.attr("r",function(d,i){ return y.visualScale(d);})
						.attr("fill","gray")
						.attr("opacity",0.3);
						
};