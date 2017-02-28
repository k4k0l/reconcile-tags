/* This  opens  a window  in which height and width are customizable
   To be nice to browsers that do not have  
   js  enabled, call this  function this  way:

   <%--  <a href ="pageHere.html" target="turkPopUp"
   onClick="returns!openTurkPopUp(his.href,this.target,optional_width,
   optional_height)">  </a>  --%>

   In the case of a state tag:
   <%-- <state:link action="/findhits" name="niceName"
   onclick="returns!openTurkPopUp(this.href, this.target)"
   target="turkPopUp">
   text here </state:link> --%>

   This  window is  dependent , thus  it closes when the parent does.

*/

function openTurkPopUp (url,target, width,height) {
 
var DEFAULT_WIDTH  = 500;
var DEFAULT_HEIGTH = 500;

if (!width)  {width=DEFAULT_WIDTH}
if (!height) {height=DEFAULT_HEIGTH};
  
  var
  turkPopUp=window.open(url,target,"width="+width+",height="+height+",dependable=yes,resizable=yes,location=no,menubar=no,scrollbars=yes,left=100,top=100");
  turkPopUp.focus();
 
  return true;

}

function customPopup(element, width, height) {
    var url = element.href;
    var target = element.target;
    var options = 'width=' + width + ',height=' + height +
        ',dependable=yes,resizable=yes,location=no,menubar=no,scrollbars=yes,left=100,top=100';

    var win = window.open(url, target, options);
    if (win) { win.focus() }

    return false;
}

function popup(element) {
    var width = 300;
    var height = 300;
    return customPopup(element, width, height);
}

function popback(element) {
	var url = element.href;
	var target = window.opener;
	if (target) {
		target.location.href = url;
	    target.focus();
	}
	return false;
}

