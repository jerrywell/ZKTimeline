<%--
	Here you could do any styling job you want , all CSS stuff.
--%>
<%@ taglib uri="http://www.zkoss.org/dsp/web/core" prefix="c" %>

.z-timeline{
	border: 1px #E5E5E5 solid;
}

.z-timeline .z-timeline-content{
	position: relative;
	overflow: hidden;
}

.z-timeline .z-timeline-content-inside{
	cursor: move;
}

.z-timeline .z-timeline-content-cave{
	height: 150px;
	width: 100%;
}

.z-timeline .z-timeline-small-facet{
	height: 5px;
	width: 100%;
	background-image: url(${c:encodeThemeURL('~./zul/img/timeline/small-facet.png')});
	background-repeat: repeat;
}

.z-timeline .z-timeline-main-facet{
	width: 100%;
	height: 30px;
}

.z-timeline .z-timeline-main-facet .z-timeline-facet{
	padding-left: 5px;
	border-left: 1px solid gray;
}

.z-timeline .z-timeline-large-facet{
	width: 100%;
	height: 30px;
	font-size: 20px;
}

.z-timeline .z-timeline-facet{
	position: absolute;
}

.z-timeline .z-timeline-main-facet .z-timeline-fbg{
	background-image: url(${c:encodeThemeURL('~./zul/img/timeline/small-facet.png')});
	background-repeat:repeat-y;
	height: 10px;
}


.z-timeline .z-timeline-item{
	height: 40px;
	width: 140px;
	background-color: #EFEFEF;
	border: 1px #E7E7E7 solid;
	position: absolute;
	-webkit-border-radius: 5px;
	-moz-border-radius: 5px;
	border-radius: 5px;
	font-family: "Helvetica Neue",Helvetica,Arial,sans-serif !important;
	cursor: pointer;
	font-weight: bold;
	font-size: 11px;
	line-height: 11px;
	color: #999;
	margin-bottom: 2px;
	
	padding: 5px;
}

.z-timeline .z-timeline-item:hover{
	border-color: #999999;
	background-color: white;
	color: black;
	z-index: 100;
}

/*
.z-timeline .z-timeline-item:hover{
	border-color: #B6B6B6;
	background-color: white;
	color: #0088CC;
}

.z-timeline .z-timeline-text{
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

/*
.z-timeline .z-timeline-facet{
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
*/

.z-timeline .z-timeline-facet-inner{
	background: url("small-facet.png") repeat-y ;
	height: 10px;
	width: 100%;
}

.z-timeline .z-timeline-background{
	position: absolute;
	top: 0px;
	width: 1800px;
	height: 200px;
	cursor: move;
}

.z-timeline .z-timeline-line{
	left:898px;
	height: 150px;
	width: 4px;
	background-color: #08c; 
	position: absolute;
}

.z-timeline .z-timeline-indicator{
	position: absolute;
	left: 888px;
	width: 24px;
	height: 24px;
	background-image: url(timeline.png?v4.4);
	background-repeat: no-repeat;
	background-position: -160px -48px;
}
*/