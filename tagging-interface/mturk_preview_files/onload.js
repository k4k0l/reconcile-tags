function OnLoadHandler() {}

OnLoadHandler.functions = [];

OnLoadHandler.onload = function() {
	for (var i in OnLoadHandler.functions) {
		OnLoadHandler.functions[i]();
	}
}









