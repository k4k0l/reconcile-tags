 /* Since the buttons and checkbox appear at the top and bottom of the pipeline,
  * this script ensures that the checkboxes are always in sync 
  */

OnLoadHandler.functions.push(init_checkboxes);  

function init_checkboxes () {
  var boxes = document.getElementsByName('autoAcceptCheckboxWrapper');
  for (var i = 0; i < boxes.length; i++) {
    boxes[i].style.display='block';
  }
  return true;
}

function toggleAllCheckboxes(clickedBox) {
  var boxes = document.getElementsByName('autoAcceptEnabled');
  for (var i = 0; i < boxes.length; i++) {
    var box = boxes[i];
    if (box != clickedBox) {
      box.checked = !box.checked;	
    }
  }
  return true;
}

OnLoadHandler.functions.push(displayJavascriptConditionals);

function setDisplayByName(name,disp) {
  var items = document.getElementsByName(name);
  for (var i = 0; i < items.length; i++) {
   items[i].style.display = disp;
  }
  return true;
}

function checkCookies(){
  var cookieEnabled=(navigator.cookieEnabled)? true : false
  //if not IE4+ nor NS6+
  if (typeof navigator.cookieEnabled=='undefined' && !cookieEnabled){ 
    document.cookie='testcookie'
    cookieEnabled=(document.cookie.indexOf('testcookie')!=-1)? true : false
  }
  return cookieEnabled;
}
  
function displayJavascriptConditionals() {
  setDisplayByName('javascriptDependentFunctionality','block');
  if ( !checkCookies() ) {
    setDisplayByName('cookieFreeFunctionality','block');
    setDisplayByName('cookieDependentFunctionality','none');
  }

  return true;
}
