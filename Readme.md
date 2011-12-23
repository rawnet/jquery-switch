# jQuery/Switch

jQuery/Switch is an iOS-inspired slide/toggle widget. It began as an alternative switch for jQuery Mobile, but it also targets desktop browsers as well.

This is a fork of https://github.com/rawnet/jquery-switch. Refer to it for more information.

This fork adds a "slide" event notification passing the customized new value after the transition has happened. So you can get notified by doing this:

```javascript
something.bind("slide", function(event, slide_val)) {
	// Do something with slide_val ...
});
```

Also there's an option to pass a custom function "before(...)" that is run before any on/off/toggle action.
Returning false prevents to action while true let the action happen.

before(...) takes 3 arguments:
- controls: the control object so you can run your own action e.g. control.on()  
- type: on/off
- custom_type: the custom values for on/off

```javascript
$("select").switchify({
	before: function(controls, type, custom_type) {
    	// do something asynchronous that has some callbacks for success and/or error for example.
        _sendMessage({
			//...
			success: function() {
				// Do something custom here, and then call the transition silently so before function is not called.
            	controls[type]({silent: true});   // like controls.on({silent: true});
            },
            error: function(){
            	// the slider won't move because there was an error. 
            }
        });
        
		return false;
    }
});
```

