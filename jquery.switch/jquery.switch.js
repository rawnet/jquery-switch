// jQuery/Switch, an iOS-inspired slide/toggle switch
// by Mike Fulcher for Rawnet, http://www.rawnet.com
// 
// Version 0.2.0
// Full source at https://github.com/rawnet/jquery-switch
// Copyright (c) 2011 Rawnet http://www.rawnet.com

// MIT License, https://github.com/rawnet/jquery-switch/blob/master/LICENCE

;(function($){
  
  var helpers = {
    // typeOf function by Douglas Crockford
    typeOf: function(value) {
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
    },
    
    // the markup
    template:   '<div class="ui-switch">' +
                  '<div class="ui-switch-mask">' +
                    '<div class="ui-switch-master">' +
                      '<div class="ui-switch-upper">' +
                        '<span class="ui-switch-handle"></span>' +
                      '</div>' +
                      '<div class="ui-switch-lower">' +
                        '<div class="ui-switch-labels">' +
                          '<a href="#" class="ui-switch-on">{{on}}</a>' +
                          '<a href="#" class="ui-switch-off">{{off}}</a>' +
                        '</div>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="ui-switch-middle"></div>' +
                '</div>',
    
    // reused vars
    doc: $(document),
    mousedown: false
  }
  
  // helpers to indicate when the mouse button
  // is held down
  helpers.doc.bind('mousedown', function(e) {
    if (e.which <= 1 && !e.metaKey && !e.shiftKey && !e.altKey && !e.ctrlKey) {
      helpers.mousedown = true;
    }
  }).bind('mouseup', function(e) {
    helpers.mousedown = false;
  });
  
  // when releasing the mousebutton after dragging
  // the switch, "snap" to position
  helpers.doc.bind('mouseup touchend', function() {
    $('.ui-switch[data-dragging=true]').each(function(i, slider) {
      slider = $(slider);
      if (!slider.data('animating')) {
        if (slider.find('.ui-switch-handle').offset().left + 15 > slider.data('center').left) {
          slider.data('controls').on();
        } else {
          slider.data('controls').off();
        }
      }
    });
  });
  
  var switcher = {
    // main build function
    build: function(select, options) {
      // hide the <select>, get it's initial val, and determine if it is disabled/readonly
      var select    = $(select).hide(),
          opts      = select.find('option'),
          val       = select.val(),
          disabled  = !!(select.attr('disabled') || select.attr('readonly'));
          
      // get the on/off values and labels
      var values = {
        on: options.on || opts.first().val(),
        off: options.off || opts.last().val()
      }, text = {
        on: opts.filter('[value=' + values.on + ']').text(),
        off: opts.filter('[value=' + values.off + ']').text()
      };
      
      // assign the <select>'s val as a class on the slider
      var slider = $(helpers.template.replace('{{on}}', text.on).replace('{{off}}', text.off));
      slider.addClass(select.val() == values.on ? 'on' : 'off');
      
      // if the <select> is disabled/readonly, add class 'disabled'
      if (disabled) { slider.addClass('disabled'); }
      
      // cache the master and handle elements
      var master = slider.find('.ui-switch-master'),
          handle = slider.find('.ui-switch-handle');
          
      // insert the slider into the dom
      slider.insertAfter(select);
      
      // find the max label width
      var labelMaxWidth = Math.max.apply(null, slider.find('a').map(function(i, a) {
        return $(a).width();
      }).toArray());
      
      // adjust the slider widths
      slider.find('.ui-switch-middle').width(labelMaxWidth + 43);
      slider.find('a').width(labelMaxWidth);
      
      // cache the "off" and "on" positions
      var masterOff = '-' + (labelMaxWidth + 21) + 'px',
          masterOn  = '-2px';
          
      // default to the "off" position
      master.css({ left: masterOff });
      handle.css({ left: (labelMaxWidth + 16) + 'px' });
      
      // set the position to "on" based on the selected <option>
      if (values.on == val) { master.css({ left: masterOn }); }
      
      // helper references between the original <select> and the slider widget
      select.data('slider', slider);
      slider.data('select', select);
      
      // helpers to determine if the slider is currently in motion or being dragged
      slider.data('animating', false).attr('data-dragging', 'false');
      
      // cache the offset, dimensions and center point of the slider widget
      slider
        .data('offset', slider.offset())
        .data('dimensions', { width: slider.width(), height: slider.height() })
        .data('center', { left: slider.data('offset').left + (slider.data('dimensions').width / 2), top: slider.data('offset').top + (slider.data('dimensions').height / 2) });
        
      // cache the offset of the "master" and "handle" elements
      master.data('offset', master.offset());
      handle.data('offset', handle.offset());
      
      // add controls to the slider widget
      var controls = slider.data('controls', {
        on:  function() { if (!disabled) { slider.trigger('slide:on'); return slider;  } },
        off: function() { if (!disabled) { slider.trigger('slide:off'); return slider; } },
        toggle: function() {
          if (!disabled) {
            slider.trigger('slide:' + (select.val() == values.on ? 'off' : 'on'));
          }; return slider;
        }
      }) && slider.data('controls');
      
      // watch for changes to the <select> and update the widget accordingly
      select.bind('change', function() {
        controls[select.val() == values.on ? 'on' : 'off']();
      });
      
      // allow the sliders to have focus and bind the enter key to toggle states
      slider.attr('tabindex', '0').bind('keyup', function(e) {
        if (e.which === 13) {
          controls.toggle();
        }
      });
      
      // tap to toggle
      slider.bind('mouseup touchend', function(e) {
        e.preventDefault();
        
        if (!$(e.target).is('span')) {
          controls.toggle();
        }
      });
      
      // "grab" the slider at a certain point when dragging starts
      slider.bind('mousedown touchstart', function(e) {
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
        
        // calculate the offset based on which part of the slider was grabbed
        var masterLeft = parseInt(master.css('left')),
            masterOffsetLeft = slider.data('offset').left + masterLeft,
            modifier = (masterOffsetLeft - pageX);
            
        slider.data('modifier', modifier);
      });
      
      // "snap" to position when dragging beyond the slider
      slider.bind('mouseleave touchcancel', function(e) {
        if (!slider.data('animating')) {
          if (slider.find('.ui-switch-handle').offset().left + 15 > slider.data('center').left) {
            controls.on();
          } else {
            controls.off();
          }
        }
      });
      
      // drag the handle to slide manually
      slider.bind('mousemove touchmove', function(e) {
        e.preventDefault();
        
        if (!disabled && (e.type == 'touchmove' || helpers.mousedown)) {
          slider.attr('data-dragging', 'true');
          
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
          var offset      = slider.data('offset'),
              dimensions  = slider.data('dimensions'),
              center      = slider.data('center');
              
          // calculate the new offset
          var newOffset     = pageX + slider.data('modifier'),
              currentOffset = offset.left - (labelMaxWidth + 35);
              
          // move the slider within a fixed range
          if ((newOffset > (currentOffset + 18)) && (newOffset <= (currentOffset - 19 + dimensions.width))) {
            master.offset({ left: newOffset });
          }
        }
      });
      
      // 
      // on/off events
      // 
      
      // slide to the "on" position
      slider.bind('slide:on', function() {
        slider.data('animating', true).attr('data-dragging', 'false');
        master.stop().animate({ left: masterOn, useTranslate3d:true }, 'fast', function() {
          slider.data('animating', false).data('select').val(values.on);
          slider.removeClass('off').addClass('on');
        });
      });
      
      // slide to the "off" position
      slider.bind('slide:off', function() {
        slider.data('animating', true).attr('data-dragging', 'false');
        master.stop().animate({ left: masterOff, useTranslate3d:true }, 'fast', function() {
          slider.data('animating', false).data('select').val(values.off);
          slider.removeClass('on').addClass('off');
        });
      });
      
      return select;
    },
    
    // updates the cached offset, dimensions, and center point
    update: function(select, options) {
      var slider = select.data('slider');
      
      // cache the master and handle elements
      var master = slider.find('.ui-switch-master'),
          handle = slider.find('.ui-switch-handle');
          
      // cache the offset, dimensions and center point of the slider widget
      slider
        .data('offset', slider.offset())
        .data('dimensions', { width: slider.width(), height: slider.height() })
        .data('center', { left: slider.data('offset').left + (slider.data('dimensions').width / 2), top: slider.data('offset').top + (slider.data('dimensions').height / 2) });
        
      // cache the offset of the "master" and "handle" elements
      master.data('offset', master.offset());
      handle.data('offset', handle.offset());
      
      return select;
    }
  }
  
  // register the plugin: $('.selector select').switcher();
  // the main function accepts a string ("update"),
  // an object (overriding the default options) or
  // no arguments at all
  $.fn.switcher = function(arg) {
    this.each(function(i, select) {
      switcher[arg == 'update' ? 'update' : 'build'](select, arg || {});
    });
    
    return this; // maintain chaining
  }
  
}(jQuery));