<%--
	Here you could do any styling job you want , all CSS stuff.
--%>
<%@ taglib uri="http://www.zkoss.org/dsp/web/core" prefix="c" %>

.z-timeline{
	width: 1800px;
	height: 200px;
	border: 1px #E5E5E5 solid;
	position: relative;
	overflow: hidden;
}

.z-timeline .content{
	left: 0px;
	position: relative;
}

.z-timeline .content-cave{
	height: 150px;
}

.z-timeline .small-facet{
	height: 5px;
	background-image: url("small-facet.png");
	background-repeat: repeat;
}

.z-timeline .event{
	height: 150px;
	width: 150px;
	border-left: 1px #E5E5E5 solid;
	position: absolute;
}

.z-timeline .event:hover{
	border-left-color: #999999;
}


.z-timeline .text:hover{
	/*border-color: #B6B6B6;*/
	/*background-color: white;*/
	background-image: url(timeline.png?v4.4);
	background-repeat: no-repeat;
	background-position: 0 -53px;
	color: #0088CC;
}

.z-timeline .text{
	height: 50px;
	width: 153px;
	/*border: 1px #D8D8D8 solid;*/
	margin: 0px;
	background-image: url(timeline.png?v4.4);
	background-repeat: no-repeat;
	background-position: 0 0;
	/*background-color: #EFEFEF;*/
	color: #9999A3;
	text-align: center;
	-webkit-border-radius: 2px;  
	-moz-border-radius: 2px;  
	border-radius: 2px;  
}

.z-timeline .facet{
	margin-top: 5px;
	position: absolute;
	text-indent: -10px;
	font-weight: normal;
	font-size: 10px;
	color: #666;
	font-size: 11px;
	line-height: 11px;
	font-weight: bold;
}

.z-timeline .facet-inner{
	background: url("small-facet.png") repeat-y ;
	height: 10px;
	width: 100%;
}

.z-timeline .background{
	position: absolute;
	top: 0px;
	width: 1800px;
	height: 200px;
	cursor: move;
}

.z-timeline .line{
	left:898px;
	height: 150px;
	width: 4px;
	background-color: #08c; 
	position: absolute;
	z-index: 10;
}

.z-timeline .indicator{
	z-index: 20;
	position: absolute;
	left: 888px;
	width: 24px;
	height: 24px;
	background-image: url(timeline.png?v4.4);
	background-repeat: no-repeat;
	background-position: -160px -48px;
}