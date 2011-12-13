// jQuery/Switch, an iOS-inspired slide/toggle switch
// by Mike Fulcher for Rawnet: http://www.rawnet.com
// 
// Version 0.3.0
// Full source at https://github.com/rawnet/jquery-switch
// Copyright (c) 2011 Rawnet http://www.rawnet.com

// MIT Licence: https://github.com/rawnet/jquery-switch/blob/master/LICENCE

;(function($, doc){

  // reused vars
  var $doc = $(doc),
  mousedown = false;
  
  // typeOf function by Douglas Crockford
  function typeOf(value) {
    var s = typeof value;
    if (s === 'object') {
      if (value) {
        if (typeof value.length === 'number' &&
            !(value.propertyIsEnumerable('length')) &&
            typeof value.splice === 'function') {
          s = 'array';
        }
      } else {
        s = 'null';
      }
    }
    return s;
  }
  
  // the markup
  // the backslashes escape the newlines to allow the 
  // block to be enclosed within a single string
  var template = '\
    <div class="ui-switch">                                 \n\
      <div class="ui-switch-mask">                          \n\
        <div class="ui-switch-master">                      \n\
          <div class="ui-switch-upper">                     \n\
            <span class="ui-switch-handle"></span>          \n\
          </div>                                            \n\
          <div class="ui-switch-lower">                     \n\
            <div class="ui-switch-labels">                  \n\
              <a href="#" class="ui-switch-on">{{on}}</a>   \n\
              <a href="#" class="ui-switch-off">{{off}}</a> \n\
            </div>                                          \n\
          </div>                                            \n\
        </div>                                              \n\
      </div>                                                \n\
      <div class="ui-switch-middle"></div>                  \n\
    </div>';
                  
  // helpers to indicate when the mouse button
  // is held down
  $doc.bind('mousedown', function(e) {
    // only listen for left-clicks with no modifier keys in use
    if (e.which <= 1 && !e.metaKey && !e.shiftKey && !e.altKey && !e.ctrlKey) {
      mousedown = true;
    }
  }).bind('mouseup', function(e) {
    mousedown = false;
  });
  
  // when releasing the mousebutton after dragging
  // the switch, snap to position
  $doc.bind('mouseup touchend', function() {
    $('.ui-switch[data-dragging=true]').each(function(i, widget) {
      $switch = $(widget);
      if (!$switch.data('animating')) {
        if ($switch.find('.ui-switch-handle').offset().left + 15 > $switch.data('center').left) {
          $switch.data('controls').on();
        } else {
          $switch.data('controls').off();
        }
      }
    });
  });
  
  // object contains the core plugin functions
  var switchify = {
    // main build function
    build: function($select, options) {
      // hide the original <select>
      $select.hide();
      
      // get the initial val, and determine if it is disabled
      var opts      = $select.find('option'),
          val       = $select.val(),
          disabled  = !!$select.attr('disabled');
          
      // get the on/off values and labels
      var values = {
        on: options.on || opts.first().val(),
        off: options.off || opts.last().val()
      }, text = {
        on: opts.filter('[value=' + values.on + ']').text(),
        off: opts.filter('[value=' + values.off + ']').text()
      };
      
      // assign the <select>'s val as a class on the switch
      var $switch = $(template.replace('{{on}}', text.on).replace('{{off}}', text.off));
      $switch.addClass($select.val() == values.on ? 'on' : 'off');
      
      // if the <select> is disabled/readonly, add class 'disabled'
      if (disabled) { $switch.addClass('disabled'); }
      
      // cache the master and handle elements
      var $master = $switch.find('.ui-switch-master'),
          $handle = $switch.find('.ui-switch-handle');
          
      // insert the switch into the dom
      $switch.insertAfter($select);
      
      // find the max label width
      var linkWidths = $switch.find('a').map(function(i, a) { return $(a).width() }),
          labelMaxWidth = Math.max(linkWidths[0], linkWidths[1]);
      
      // adjust the switch widths
      $switch.find('.ui-switch-middle').width(labelMaxWidth + 43);
      $switch.find('a').width(labelMaxWidth);
      
      // cache the "off" and "on" positions
      var masterOff = '-' + (labelMaxWidth + 21) + 'px',
          masterOn  = '-2px';
          
      // default to the "off" position
      $master.css({ left: masterOff });
      $handle.css({ left: (labelMaxWidth + 16) + 'px' });
      
      // set the position to "on" based on the selected <option>
      if (values.on == val) { $master.css({ left: masterOn }); }
      
      // helper references between the original <select> and the switch widget
      $select.data('switch', $switch);
      $switch.data('select', $select);
      
      // helpers to determine if the switch is currently in motion or being dragged
      $switch.data('animating', false).attr('data-dragging', 'false');
      
      // cache the offset, dimensions and center point of the switch widget
      $switch
        .data('offset', $switch.offset())
        .data('dimensions', { width: $switch.width(), height: $switch.height() })
        .data('center', { left: $switch.data('offset').left + ($switch.data('dimensions').width / 2), top: $switch.data('offset').top + ($switch.data('dimensions').height / 2) });
        
      // cache the offset of the "master" and "handle" elements
      $master.data('offset', $master.offset());
      $handle.data('offset', $handle.offset());
      
      // add controls to the switch widget
      var controls = $switch.data('controls', {
        on:  function() { if (!disabled) { $switch.trigger('slide:on');  return $switch; } },
        off: function() { if (!disabled) { $switch.trigger('slide:off'); return $switch; } },
        toggle: function() {
          if (!disabled) {
            $switch.trigger('slide:' + ($select.val() == values.on ? 'off' : 'on'));
          }; return $switch;
        }
      }) && $switch.data('controls');
      
      // watch for changes to the <select> and update the widget accordingly
      $select.bind('change', function() {
        controls[$select.val() == values.on ? 'on' : 'off']();
      });
      
      // allow the switches to have focus and bind the enter key to toggle states
      $switch.attr('tabindex', '0').bind('keyup', function(e) {
        if (e.which === 13) {
          controls.toggle();
        }
      });
      
      // tap to toggle
      $switch.bind('mouseup touchend', function(e) {
        e.preventDefault();
        
        if (!$(e.target).is('span')) {
          controls.toggle();
        }
      });
      
      // "grab" the switch at a certain point when dragging starts
      $switch.bind('mousedown touchstart', function(e) {
        e.preventDefault();
        
        // normalize the pageX, pageY coordinates
        var pageX, pageY;
        if (e.type == "touchstart") {
          pageX = e.originalEvent.targetTouches[0].pageX;
          pageY = e.originalEvent.targetTouches[0].pageY;
        } else {
          pageX = e.pageX;
          pageY = e.pageY;
        }
        
        // calculate the offset based on which part of the switch was grabbed
        var masterLeft = parseInt($master.css('left')),
            masterOffsetLeft = $switch.data('offset').left + masterLeft,
            modifier = (masterOffsetLeft - pageX);
            
        $switch.data('modifier', modifier);
      });
      
      // "snap" to position when dragging beyond the switch
      $switch.bind('mouseleave touchcancel', function(e) {
        if (!$switch.data('animating')) {
          if ($switch.find('.ui-switch-handle').offset().left + 15 > $switch.data('center').left) {
            controls.on();
          } else {
            controls.off();
          }
        }
      });
      
      // drag the handle to slide manually
      $switch.bind('mousemove touchmove', function(e) {
        e.preventDefault();
        
        if (!disabled && (e.type == 'touchmove' || mousedown)) {
          $switch.attr('data-dragging', 'true');
          
          // normalize the pageX, pageY coordinates
          var pageX, pageY;
          if (e.type == "touchmove") {
            pageX = e.originalEvent.targetTouches[0].pageX;
            pageY = e.originalEvent.targetTouches[0].pageY;
          } else {
            pageX = e.pageX;
            pageY = e.pageY;
          }
          
          // get the offset, dimensions, and center point
          var offset      = $switch.data('offset'),
              dimensions  = $switch.data('dimensions'),
              center      = $switch.data('center');
              
          // calculate the new offset
          var newOffset     = pageX + $switch.data('modifier'),
              currentOffset = offset.left - (labelMaxWidth + 35);
              
          // move the switch within a fixed range
          if ((newOffset > (currentOffset + 18)) && (newOffset <= (currentOffset - 19 + dimensions.width))) {
            $master.offset({ left: newOffset });
          }
        }
      });
      
      // 
      // on/off events
      // 
      
      // slide to the "on" position
      $switch.bind('slide:on', function() {
        $switch.data('animating', true).attr('data-dragging', 'false');
        $master.stop().animate({ left: masterOn }, 'fast', function() {
          $switch.data('animating', false).data('select').val(values.on);
          $switch.removeClass('off').addClass('on');
        });
      });
      
      // slide to the "off" position
      $switch.bind('slide:off', function() {
        $switch.data('animating', true).attr('data-dragging', 'false');
        $master.stop().animate({ left: masterOff }, 'fast', function() {
          $switch.data('animating', false).data('select').val(values.off);
          $switch.removeClass('on').addClass('off');
        });
      });
      
      return $select;
    },
    
    // updates the cached offset, dimensions, and center point
    update: function($select, options) {
      var $switch = $select.data('switch');
      
      // cache the master and handle elements
      var $master = $switch.find('.ui-switch-master'),
          $handle = $switch.find('.ui-switch-handle');
          
      // cache the offset, dimensions and center point of the switch widget
      $switch
        .data('offset', $switch.offset())
        .data('dimensions', { width: $switch.width(), height: $switch.height() })
        .data('center', { left: $switch.data('offset').left + ($switch.data('dimensions').width / 2), top: $switch.data('offset').top + ($switch.data('dimensions').height / 2) });
        
      // cache the offset of the "master" and "handle" elements
      $master.data('offset', $master.offset());
      $handle.data('offset', $handle.offset());
      
      return $select;
    }
  }
  
  // register the plugin: $('.selector select').switchify();
  // the main function accepts a string ("update"),
  // an object (overriding the default options) or
  // no arguments at all
  $.fn.switchify = function(arg) {
    this.each(function(i, select) {
      var $select = $(select);
      // prevent multiple instantiation
      if (arg != 'update' && $select.data('switch')) { return; }
      // build or update
      switchify[arg == 'update' ? 'update' : 'build']($select, arg || {});
    });
    
    return this; // maintain chaining
  }
  
}(jQuery, window.document));