/**
* PipelineTimer
* Keeps track of the time left for a HIT and updates the page as necessary.
* onExpiration will be de-thunked when the timer expires.
*/
PipelineTimer.create = function(serverTimestamp, counterId, totalSeconds, endTime, onExpiration) {
    var offset = new ClientOffset(serverTimestamp);

    OnLoadHandler.functions.push(function() {
        var counter = document.getElementById(counterId);

        var timer = new PipelineTimer(offset, counter, totalSeconds, endTime, onExpiration);
        timer.start();
    });
}

function PipelineTimer(offset, counterElement, totalSeconds, endTime, onExpiration) {
    this.offset = offset;
    this.counterElement = counterElement;
    this.totalSeconds = totalSeconds;
    this.endTime = endTime;
    this.onExpiration = onExpiration;
}

PipelineTimer.prototype.start = function() {
    this.looping = true;
    this.loop();
}

PipelineTimer.prototype.stop = function() {
    this.looping = false;
}

PipelineTimer.prototype.loop = function() {
    this.count();

    if (this.looping) {
        var _this = this;
        setTimeout(function() { _this.loop() }, 1000);
    }
}

PipelineTimer.prototype.count = function() {
    var now = new Date();
    var millisecondsRemaining = this.endTime.getTime() - now.getTime() + this.offset.getMilliseconds();
    var secondsRemaining = Math.floor(millisecondsRemaining / 1000);

    if (secondsRemaining > 0) {
        var secondsElapsed = Math.max(totalSeconds - secondsRemaining, 0);
        this.setCounter(secondsElapsed);
    } else {
        this.onExpiration && this.onExpiration();
        this.setCounter(this.totalSeconds);
        this.stop();
    }
}

PipelineTimer.prototype.setCounter = function(seconds) {
    var counterValue = this.formatTime(seconds);
    this.counterElement.innerHTML = counterValue;
    this.counterElement.size = counterValue.length - 1;
}

PipelineTimer.prototype.formatTime = function(totalSeconds) {
    var seconds = totalSeconds % 60;
    var minutes = Math.floor(totalSeconds / 60) % 60;
    var hours = Math.floor(totalSeconds / (60 * 60)) % 24;
    var days = Math.floor(totalSeconds / (60 * 60 * 24));
    var disp = " ";

    if (days > 0) {
        disp += days + (days == 1 ? ' day ' : ' days ')
    }

    disp += this.formatNumber(hours) + ':' + this.formatNumber(minutes) + ':' + this.formatNumber(seconds);

    return disp;
}

PipelineTimer.prototype.formatNumber = function(value) {
    var string = value + '';

    if (string.length < 2) { string = '0' + string }

    return string;
}


/**
 * ClientOffset
 * Calculates the client's offset from the server's time
 */
ClientOffset.cookieName = 'clientOffset';
ClientOffset.loadDelayMilliseconds = 500;

function ClientOffset(serverTimestamp) {
    var cookie = Cookie.get(ClientOffset.cookieName);
    if (cookie && cookie.value) {
        this.milliseconds = parseInt(cookie.value);
        if (!this.milliseconds) { cookie.remove() }
    } else {
        if (!serverTimestamp) { alert('No server timestamp was set!') }

        var serverGmtMilliseconds = parseInt(serverTimestamp);
        var clientGmtMilliseconds = (new Date()).getTime();
        this.milliseconds = clientGmtMilliseconds - serverGmtMilliseconds - ClientOffset.loadDelayMilliseconds;
        Cookie.create(ClientOffset.cookieName, this.milliseconds);
    }
}

ClientOffset.prototype.getMilliseconds = function() {
    return this.milliseconds
}


/**
 * Cookie
 * Wrapper class for cookies
 */
Cookie.get = function(name, path, domain) {
    var prefix = name + "=";

    var begin = document.cookie.indexOf("; " + prefix);
    if (begin == -1) {
        begin = document.cookie.indexOf(prefix);
        if (begin != 0) return null;
    } else {
        begin += 2;
    }

    var end = document.cookie.indexOf(";", begin);
    if (end == -1) {
        end = document.cookie.length;
    }

    var value = unescape(document.cookie.substring(begin + prefix.length, end));

    return new Cookie(name, value, path, domain);
}

/**
* Sets a Cookie with the given name and value.
*
* name       Name of the cookie
* value      Value of the cookie
* [expires]  Expiration date of the cookie (default: end of current session)
* [path]     Path where the cookie is valid (default: path of calling document)
* [domain]   Domain where the cookie is valid
*              (default: domain of calling document)
* [secure]   Boolean value indicating if the cookie transmission requires a
*              secure transmission
*/
Cookie.create = function(name, value, expires, path, domain, secure) {
    document.cookie = name + '=' + escape(value) +
        (expires ? '; expires=' + expires.toGMTString() : '') +
        (path ? '; path=' + path : '') +
        (domain ? '; domain=' + domain : '') +
        (secure ? '; secure' : '');
    return new Cookie(name, value, path, domain);
}

function Cookie(name, value, path, domain) {
    this.name = name;
    this.value = value;
    this.path = path;
    this.domain = domain;
}

Cookie.prototype.remove = function() {
    document.cookie = this.name + '=' +
        (this.path ? '; path=' + this.path : '') +
        (this.domain ? '; domain=' + this.domain : '') +
        '; expires=Thu, 01-Jan-70 00:00:01 GMT';
}
