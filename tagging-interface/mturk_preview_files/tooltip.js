OnLoadHandler.functions.push(init_tooltips);

function init_tooltips() {
    var tagNames = ['A', 'TH', 'TD'];

	// this is a terrible hack to work around Moz reflow brokenness
	var reflower = null;

    for (var i in tagNames) {
        var elements = document.getElementsByTagName(tagNames[i]);

        // iterate over all elements in page
        for (var j in elements) {
            var e = elements[j];
            var id = e.id;

            // if curr_id ends in --<some integer>, trim this integer off,
            // as this is an indication that there as multiple elements
            // that need to match this tag
            if (id) {
                var pos = id.indexOf('--');
                if (pos != -1) { id = id.substring(0, pos) }
                var tt = null;
                
                // if there's a tooltip associated with this id, create a Tooltip object
                // attached to this anchor
                if (tooltips[id]) {
                    tt = new Tooltip(e, tooltips[id]);
                }
                if ((reflower == null) && (e.tagName == 'A')) {
                    reflower = tt;
                }
            }
        }
    }

    var allDivs = document.getElementsByTagName('DIV');

    for (var i in allDivs) {
        var div = allDivs[i];
        if (div.className == 'tooltip') {
            var id = div.id.substring(0, div.id.length - '.tooltip'.length);
            var target = document.getElementById(id);
            if (target) { new Tooltip(target, div); }
        }
    }

	// mozilla doesn't correctly reflow the tooltips out of the bottom of 
	// the page unless we force a reflow of a TABLE-ized element. (!?!?!?)
	// What's more, we can't do that from within the onload handler,
	// or too soon afterward (!!!???!!!???!!!), 
	// so we pick a tooltip anchor and flicker it "shortly" after load.
	if (reflower != null)
	  setTimeout(
	    function() {
	        reflower.target.style.display = 'none';
    	    reflower.target.style.display = '';
	    },
    	100);
}

//============ Tooltip ==============//

Tooltip.offset = { 'x': 10, 'y': 10 };
Tooltip.margin = 5;

function Tooltip(target, content, doc) {
    this.target = target;
    this.content = content;
    this.doc = doc || document;
    this.mouseOver = false;

    this.createHoverElement(this.content);
    this.initialize();
    this.reposition();
    this.show(false);
}

Tooltip.prototype.show = function(visible) {
    // reposition to gracefully handle window resizing
	if (visible == true) {
	    this.reposition();
	} else {
		this.deposition();
    }

    this.hoverElement.style.visibility = visible
        ? 'visible' : 'hidden';
}

Tooltip.prototype.triggerMouseOver = function() {
    // show tooltip after a delay of delay ms
    var delay = 500;
    var _this = this;
    setTimeout(function() {
      if (_this.mouseOver || _this.mouseOverHover) { _this.show(true) }
    }, delay);
}

Tooltip.prototype.triggerMouseOut = function() {
    // hit tooltip after a delay of delay ms
    var delay = 500;
    var _this = this;
    setTimeout(function() {
      if (!_this.mouseOver && !_this.mouseOverHover) {
        _this.show(false);
      }
    }, delay);
}

Tooltip.prototype.initialize = function() {
    this.mouseOver = false;
    this.mouseOverHover = false;
    this.doc.getElementsByTagName('body')[0].appendChild(this.hoverElement);

    var _this = this;
    _this.target.onmouseover = function() { _this.mouseOver = true; _this.triggerMouseOver(); };
    _this.target.onmouseout = function()  { _this.mouseOver = false; _this.triggerMouseOut(); };
    if (_this.target.tagName == 'A') {
      if (_this.target.dataset.placement) {
      // Skip the delay if it's clicked (only for A elements with data-placement attributes)
      _this.target.onclick = function() { _this.mouseOver = true; _this.show(true); return false; };
      }
    }
    // also keep showing if mouse is on the tooltip
    _this.hoverElement.onmouseover = function() {
      if (_this.hoverElement.style.visibility == 'visible') {
        _this.mouseOverHover = true;
        _this.triggerMouseOver();
      }
    };
    this.hoverElement.onmouseout = function() {
      _this.mouseOverHover = false;
      _this.triggerMouseOut();
    };
}
Tooltip.prototype.reposition = function() {
    var off = this.getPixelOffsets(this.target, this.hoverElement);
    this.hoverElement.style.left = off.x + 'px';
    this.hoverElement.style.top = off.y + 'px';
}

Tooltip.prototype.deposition = function() {
    this.hoverElement.style.left = '-999px';
    this.hoverElement.style.top = '0px';
}

Tooltip.prototype.getPixelOffsets = function(element, hover) {
    var offsets = {'x': 0, 'y': 0};
    switch (element.dataset.placement) {
      case 'left':
        offsets.x = 0 - (hover.offsetWidth + Tooltip.margin);
        offsets.y = (element.offsetHeight * 0.5) - (hover.offsetHeight * 0.5);
        break;

      case 'right':
        offsets.x = element.offsetWidth + Tooltip.margin;
        offsets.y = (element.offsetHeight * 0.5) - (hover.offsetHeight * 0.5);
        break;

      case 'top':
        offsets.x = (element.offsetWidth * 0.5) - (hover.offsetWidth * 0.5);
        offsets.y = 0 - (hover.offsetHeight + Tooltip.margin)
        break;

      case 'bottom':
        offsets.x = (element.offsetWidth * 0.5) - (hover.offsetWidth * 0.5);
        offsets.y = element.offsetHeight + Tooltip.margin;
        break;

      default:
        // Legacy values
        offsets.x = Tooltip.offset.x;
        offsets.y = Tooltip.offset.y;
        break;
    }

    // Recurse, building absolute position via parent elements
    while (element) {
        offsets.x += element.offsetLeft;
        offsets.y += element.offsetTop;
        element = element.offsetParent;
    }
    return offsets;
}

Tooltip.prototype.createHoverElement = function(content) {
    this.hoverElement = this.doc.createElement('div');
    
    // pseudo dataset support if necessary
    
    if (this.target.dataset == undefined) {
        this.target.dataset = {
            'placement': this.target.getAttribute('data-placement'),
            'tooltip': this.target.getAttribute('data-tooltip')
        }
    }
 
    if (typeof content == 'string') {
        this.hoverElement = this.doc.createElement('div');
        this.hoverElement.className = this.target.dataset.tooltip || 'tooltip';
        this.hoverElement.style.position = 'absolute';
        this.hoverElement.style.visibility = 'hidden';
        this.hoverElement.innerHTML = content;
    } else {
        this.hoverElement = content;
    }
}
