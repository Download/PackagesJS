/**
 * dom.event - Cross-browser event handling in Javascript  by Stijn de Witt
 *
 * The well known cross-browser event routines addEvent and removeEvent, with
 * a small enhancement that enables cross-browser support for the
 * DOMContentLoaded pseudo-event introduced by Mozilla. This event is now being
 * standardized by the W3C in HTML5, but is not yet supported by all browsers.
 * This cross-browser implementation does support IE through some trickery.
 *
 * exports       addEvent, removeEvent
 * copyright     2011 by Stijn de Witt, some rights reserved.
 * license       http://creativecommons.org/licenses/by/3.0/
 */
Package("dom.event", [], function() {

  /**
   * addEvent
   *
   * Attaches an event handler to an object in a cross-browser way.
   * This version intercepts handlers for the DOMContentLoaded
   * event and queues them, firing once it's own central handler
   * which is implemented cross browser has fired.
   */
  function addEvent(obj, evt, fn) {
    if (obj == document && evt == "DOMContentLoaded") {
      // Support adding listeners for DOMContentLoaded event
      if (document.ready) fn.apply(obj, []);
      else addEvent.listeners.push(fn);
    }
    else if (obj.addEventListener) obj.addEventListener(evt, fn, false);
    else if (obj.attachEvent)
    	obj.attachEvent('on' + evt, obj["e" + evt + fn] = function() {
        return fn.apply(obj, [addEvent.fix(window.event)]);
    	});
  }

  /**
   * removeEvent
   *
   * Removes an event from an object in a cross-browser way.
   */
  function removeEvent(obj, evt, fn ) {
  	if (obj == document && evt == "DOMContentLoaded") {
  		for (var i=addEvent.listeners.length-1; i>=0; i--)
  			if (addEvent.listeners[i] == fn)
  				addEvent.listeners.splice(i, 1);
  	}
  	else if (obj.removeEventListener) obj.removeEventListener(evt, fn, false);
    else if (obj.detachEvent) {
      obj.detachEvent("on" + evt, obj["e" + evt + fn]);
      obj["e" + evt + fn] = null;
    }
  }

	// listeners for DOMContentLoaded
  addEvent.listeners = [];

  // fixes an IE event for some basic W3C support
  addEvent.fix = function(evt) {
    evt.preventDefault = function() {this.returnValue = false;};
    evt.stopPropagation = function() {this.cancelBubble = true;};
    return evt;
  }

  // called when central handler receives DOMContentLoaded event
  addEvent.fire = function() {
    for (var i=0, len=this.listeners.length; i<len; i++)
      this.listeners[i].apply(document, []);
    this.listeners = [];
  };

  /* Support for DOMContentLoaded is based on work by Dean Edwards,
     Tanny O'Haley, Matthias Miller, Diego Perini, John Resig and Dan Webb. */
  var timer;

  function fire() {
    if (document.ready) return;
    if (timer) window.clearTimeout(timer);
    document.ready = true;
    addEvent.fire();
  }

  if (document.addEventListener) { // W3C compliant browser?
    document.addEventListener("DOMContentLoaded", fire, false);
    // Fallback for old browsers
    if (document.readyState) timer = setTimeout(function() {
      if (/loaded|complete/.test(document.readyState)) fire();
      else if (! document.ready) timer = setTimeout(arguments.callee, 25);
    }, 0);
    // Fallback to onload
    window.addEventListener("load", fire, false);
  }
  else { // Internet Explorer
    if (window == top) timer = setTimeout(function() {
    	// doScroll fails until dom content loaded
      try {document.documentElement.doScroll('left'); fire();}
      catch (e) {timer = setTimeout(arguments.callee, 25);}
    }, 0);
    // Fallback to polling onreadystatechange
    document.attachEvent("onreadystatechange", function() {
      if (/loaded|complete/.test(document.readyState)) {
        document.detachEvent("onreadystatechange", arguments.callee);
        fire();
      }
    });
    // Fallback to onload
    window.attachEvent("onload", fire);
  }

  Export(addEvent);
  Export(removeEvent);
});
