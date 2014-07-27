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
	
	width: 100%;
}

.z-timeline .z-timeline-small-facet{
	height: 2px;
	width: 100%;
	background-color: rgb(223, 223, 223);
}

.z-timeline .z-timeline-main-facet{
	width: 100%;
	height: 30px;
	font-family: "Segoe UI","Helvetica Neue",Helvetica,sans-serif;
	font-size: 11pt;
}

.z-timeline .z-timeline-facet{
	position: absolute;
	z-index: 100px;
}

.z-timeline .z-timeline-main-facet .z-timeline-facet{
	padding-left: 5px;
	color: rgb(161, 161, 161);
}

.z-timeline .z-timeline-main-facet .z-timeline-facet::before{
	content: " ";
	height: 5px;
	padding-right: 3px;
	margin-right: 5px;
	background-color: rgb(223, 223, 223);
}

.z-timeline .z-timeline-large-facet{
	width: 100%;
	height: 30px;
	font-size: 20px;
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
	z-index: 10;
}

.z-timeline .z-timeline-item-up, .z-timeline .z-timeline-item-down{
	height: 20px;
	width: 140px;
	position: absolute;
	cursor: pointer;
	z-index: 5;
	background-color: #EFEFEF;
}

.z-timeline .z-timeline-item-up::before{
	content: "\f0d8";
	box-sizing: border-box;
	display: inline-block;
	speak: none;
	font-family: FontAwesome;
	width: 100%;
	text-align: center;
}

.z-timeline .z-timeline-item-down::before{
	content: "\f0d7";
	box-sizing: border-box;
	display: inline-block;
	speak: none;
	font-family: FontAwesome;
	width: 100%;
	text-align: center;
}

<c:if test="${!c:browser('ios') && !c:browser('android')}">
.z-timeline .z-timeline-item:hover{
	border-color: #999999;
	background-color: white;
	color: black;
	z-index: 100;
}
</c:if>

.z-timeline .z-timeline-selected {
	border-color: #999999 !important;
	background-color: white !important;
	color: rgb(72,151,241) !important;
	z-index: 100 !important;
}