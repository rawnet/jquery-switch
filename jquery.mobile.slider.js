/**
 * background position animation by Alexander Farkas
 */
(function($) {
  $.extend($.fx.step, {
    backgroundPosition: function(fx) {
      if (fx.state === 0 && typeof fx.end == 'string') {
        var start = $.curCSS(fx.elem, 'backgroundPosition');
        start     = toArray(start);
        fx.start  = [start[0], start[2]];
        var end   = toArray(fx.end);
        fx.end    = [end[0], end[2]];
        fx.unit   = [end[1], end[3]];
      }
      
      var nowPosX = [];
      nowPosX[0] = ((fx.end[0] - fx.start[0]) * fx.pos) + fx.start[0] + fx.unit[0];
      nowPosX[1] = ((fx.end[1] - fx.start[1]) * fx.pos) + fx.start[1] + fx.unit[1];
      fx.elem.style.backgroundPosition = nowPosX[0] + ' ' + nowPosX[1];
      
      function toArray(strg) {
        strg = strg.replace(/left|top/g,'0px');
        strg = strg.replace(/right|bottom/g,'100%');
        strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g,"$1px$2");
        var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
        return [parseFloat(res[1], 10), res[2], parseFloat(res[3], 10), res[4]];
      }
    }
  });
})(jQuery);

/**
 * mobile slider by Mike Fulcher
 */
(function($){
  
  // slider template
  var template =  '<div class="ui-slideToggle">' +
                    '<div class="ui-slideToggle-mask">' +
                      '<div class="ui-slideToggle-master">' +
                        '<div class="ui-slideToggle-upper">' +
                          '<span class="ui-slideToggle-handle"></span>' +
                        '</div>' +
                        '<div class="ui-slideToggle-lower">' +
                          '<div class="ui-slideToggle-labels">' +
                            '<a href="#" class="ui-slideToggle-on">{{on}}</a>' +
                            '<a href="#" class="ui-slideToggle-off">{{off}}</a>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                    '</div>' +
                    '<div class="ui-slideToggle-middle"></div>' +
                  '</div>';
                  
  var doc = $(document),
      mousedown = false;
      
  doc.bind('mousedown', function(e) {
    if (e.which <= 1 && !e.metaKey && !e.shiftKey && !e.altKey && !e.ctrlKey) {
      mousedown = true;
    }
  }).bind('mouseup', function(e) {
    mousedown = false;
  });
  
  // when releasing the handle, "snap" the slider
  doc.bind('mouseup touchend touchcancel', function() {
    $('.ui-slideToggle').each(function(i, slider) {
      slider = $(slider);
      if (slider.find('.ui-slideToggle-handle').offset().left + 15 > slider.data('center').left) {
        slider.data('controls').on();
      } else {
        slider.data('controls').off();
      }
    });
  });
  
  // plugin function: $('.selector select').slider()
  $.fn.slider = function(options) {
    if (!options) { options = {}; }
    
    this.each(function(i, select) {
      // hide the <select> and get it's initial val
      var select  = $(select).hide(),
          opts    = select.find('option'),
          val     = select.val();
      // get the on/off values and labels
      var values = {
        on: options.on || opts.first().val(),
        off: options.off || opts.last().val()
      }, text = {
        on: opts.filter('[value=' + values.on + ']').text(),
        off: opts.filter('[value=' + values.off + ']').text()
      };
          
      // assign the <select>'s val as a class on the slider
      var slider = $(template.replace('{{on}}', text.on).replace('{{off}}', text.off));
      slider.addClass(select.val() == values.on ? 'on' : 'off');
      
      // cache the master and handle elements
      var master = slider.find('.ui-slideToggle-master'),
          handle = slider.find('.ui-slideToggle-handle');
      
      // insert the slider into the dom
      slider.insertAfter(select);
      
      // find the max label width
      var labelMaxWidth = 0;
      slider.find('a').each(function(i, a) {
        var w = $(a).width();
        if (w > labelMaxWidth) {
          labelMaxWidth = w;
        }
      });
      
      // adjust the slider widths
      slider.find('.ui-slideToggle-middle').width(labelMaxWidth + 40);
      slider.find('a').width(labelMaxWidth);
      
      // cache the "off" and "on" positions
      var masterOff = '-' + (labelMaxWidth + 20) + 'px',
          masterOn  = '0px';
      
      // default to the "off" position
      master.css({ left: masterOff });
      handle.css({ left: (labelMaxWidth + 15) + 'px' });
      
      // set the position to "on" based on the selected <option>
      if (values.on == val) {
        master.css({ left: masterOn });
      }
      
      // helper references between the original <select> and the slider widget
      select.data('slider', slider);
      slider.data('select', select);
      
      // cache the offset, dimensions and center point of the slider widget
      slider
        .data('offset', slider.offset())
        .data('dimensions', { width: slider.width(), height: slider.height() })
        .data('center', { left: slider.data('offset').left + (slider.data('dimensions').width / 2), top: slider.data('offset').top + (slider.data('dimensions').height / 2) });
      
      // add controls to the slider widget
      slider.data('controls', {
        on:  function() { slider.trigger('slide:on'); },
        off: function() { slider.trigger('slide:off'); }
      });
      
      // watch for changes to the <select> and update the widget accordingly
      select.bind('change', function() {
        slider.data('controls')[select.val() == values.on ? 'on' : 'off']();
      });
      
      // tap to toggle
      slider.bind('click:left tap', function(e) {
        e.preventDefault();
        
        if (!$(e.target).is('span')) {
          slider.data('controls')[slider.hasClass('on') ? 'off' : 'on']();
        }
      });
      
      // drag the handle to slide manually
      slider.bind('mousemove touchmove', function(e) {
        if (e.type == 'touchmove' || mousedown) {
          // normalize the pageX, pageY coordinates
          var pageX, pageY;
          if (e.type == "touchstart") {
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
          var newOffset = pageX - (labelMaxWidth + 35),
              currentOffset = offset.left - (labelMaxWidth + 35);
              
          // move the slider within a fixed range
          if ((newOffset > (currentOffset + 20)) && (newOffset <= (currentOffset - 20 + dimensions.width))) {
            master.offset({ left: newOffset });
          }
        }
      });
      
      // 
      // on/off events
      // 
      
      // slide to the "on" position
      slider.bind('slide:on', function() {
        master.stop().animate({ left: masterOn }, 'fast', function() {
          slider.data('select').val(values.on);
          slider.removeClass('off').addClass('on');
        });
      });
      
      // slide to the "off" position
      slider.bind('slide:off', function() {
        master.stop().animate({ left: masterOff }, 'fast', function() {
          slider.data('select').val(values.off);
          slider.removeClass('on').addClass('off');
        });
      });
    });
    
    return this;
  }
  
}(jQuery));