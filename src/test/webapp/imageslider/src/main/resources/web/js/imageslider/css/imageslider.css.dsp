<%--
	Here you could do any styling job you want , all CSS stuff.
--%>
<%@ taglib uri="http://www.zkoss.org/dsp/web/core" prefix="c" %>

.z-imageslider{
     height: 200px;
}

.z-imageslider-previous{
	width: 40px;
	height: 100%;
	background-image: url(${c:encodeThemeURL('~./zul/img/imageslider/40_40_left_wb.PNG')});
	background-repeat: no-repeat;
	background-position: center center;
	background-color: black;
	cursor: pointer;
	float: left;
}
.z-imageslider-next{
	width: 40px;
	height: 100%;
	background-image: url(${c:encodeThemeURL('~./zul/img/imageslider/40_40_right_wb.PNG')});
	background-repeat: no-repeat;
	background-position: center center;
	background-color: black;
	cursor: pointer;
	float: left;
}
.z-imageslider-content{
	height: 100%;
	overflow: hidden;
	float: left;
}

.z-imageslider-outer img{
	width: 100%;
	height: 100%;
	float: left !important;
}

.z-imageslider-outer{
    width: 200px;
	height: 200px;
	float: left !important;
	overflow: hidden;
}

.z-imageslider-focus{
	border: 2px yellow solid;
}

.z-imageslider-cave{
	float: left;
	width: 1005px;
}