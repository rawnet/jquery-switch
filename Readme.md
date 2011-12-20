# jQuery/Switch

jQuery/Switch is an iOS-inspired slide/toggle widget. It began as an alternative switch for jQuery Mobile, but it also targets desktop browsers as well.

This is a fork of https://github.com/rawnet/jquery-switch. Refer to it for more information.

This fork adds a "slide" event notification passing the customized new value when called. So you can get notified by doing this:

```javascript
something.bind("slide", function(event, slide_val)) {
	// Do something with slide_val ...
});
```

