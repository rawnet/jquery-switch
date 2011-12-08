# jQuery Switch

jQuery Switch is an iOS-inspired slide toggle. It began as an alternative switch for jQuery Mobile, but it also targets desktop browsers as well.

## Usage

jQuery Switch builds from `<select>` elements which contain two `<option>` elements relating to the "on" and "off" states respectively. These can be in any order, but the first `<option>` will by default be assumed to relate to the "on" state (this can be overridden).

```html
<select>
  <option value="1">On</option>
  <option value="0">Off</option>
</select>
```

Then, initialize the plugin:

```javascript
$(document).ready(function() {
  $('select').switcher();
  
  // optionally, override the defaults:
  // $('select').switcher({ on: '1', off: '0' });
});
```

## Features

- Respects the selected value of the original `<select>`
- Supports multiple switches
- Updates the selected value of the original `<select>` when the state is updated
- Listens for the 'change' event on the original `<select>`
- Respects the "disabled" attribute
- Works on both desktop and mobile browsers. IE is currently supported from version 9
- Drag or click/tap controls as well as API `.on()`, `.off()`, and `.toggle()`

## Notes

Due to a webkit bug the markup is fairly complex, which makes custom styling difficult. This will hopefully be improved over time, along with wider browser support (including IE).

Additionally, to improve performance the page offset coordinates of each switch is cached. This means that if the "y" position of a switch changes (ie it is moved horizontally) then the switch may not work correctly. Therefore if you have any actions which may result in your switches changing position, you may need to update the cache by calling the plugin with "update" as the argument:

``` javascript
$('select').switcher('update');
```

#### Copyright Rawnet 2011. MIT licence.
