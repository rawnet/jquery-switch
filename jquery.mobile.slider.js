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
  var template = '<div class="ui-slide" unselectable="on">' +
                    '<div class="ui-slide-bg"></div>' +
                    '<div class="ui-slide-inner">' +
                      '<div class="ui-slide-inner-strip">' +
                        '<a href="#" class="ui-slide-inner-strip-on">{{on}}</a>' +
                        '<a href="#" class="ui-slide-inner-strip-off">{{off}}</a>' +
                      '</div>' +
                    '</div>' +
                    '<img src="/assets/images/handle.png" class="ui-slide-handle" unselectable="on" />' +
                  '</div>';
                  
  var doc = $(document);
  // var mousedown = false;
  var timer, thinking;
  
  // plugin function: $('select').slider()
  $.fn.slider = function(options) {
    if (!options) { options = {}; }
    if (!options.vals) { options.vals = ['on', 'off']; }
    
    this.each(function(i, select) {
      // hide the <select> and get it's initial val
      var select = $(select).hide(),
          val    = select.val(),
          text   = { on: select.find('option[value=' + options.vals[0] + ']').text(), off: select.find('option[value=' + options.vals[1] + ']').text() };
          
      // assign the <select>'s val as a class on the slider
      var slider = $(template.replace('{{on}}', text.on).replace('{{off}}', text.off)).addClass(select.val() == options.vals[0] ? 'on' : 'off');
      
      // insert the slider into the dom
      slider.insertAfter(select);
      
      // prevent browsers trying to drag the handle <img>
      slider.find('img').bind('dragstart touchstart', function(e) {
        e.preventDefault();
      });
      
      // helper references between the original <select> and the slider widget
      select.data('slider', slider);
      slider.data('select', select);
      
      // helper to determine if the slider is currently in motion
      slider.data('animating', false);
      
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
        slider.data('controls')[select.val() == options.vals[0] ? 'on' : 'off']();
      });
      
      // tap (anywhere but the handle) to toggle
      slider.bind('tap', function(e) {
        e.preventDefault();
        
        var slider = $(this),
            target = $(e.target);
            
        if (!target.is('img')) {
          slider.data('controls')[slider.hasClass('on') ? 'off' : 'on']();
        }
      });
      
      // drag the handle to slide manually
      slider.bind('touchmove', function(e) {
        var pageX = e.originalEvent.targetTouches[0].pageX;
        var pageY = e.originalEvent.targetTouches[0].pageY;
        
        var offset      = slider.data('offset'),
            dimensions  = slider.data('dimensions'),
            center      = slider.data('center');
            
        // perform manual dragging, but only within an appropriate range
        if (pageX > (offset.left + 16) && pageX < (offset.left + (dimensions.width - 5))) {
          slider.find('.ui-slide-handle').offset({ left: pageX - 13 });
          slider.find('.ui-slide-bg').css({ backgroundPosition: '-' + (240 - (pageX - offset.left) + 14) + 'px 0px' });
          slider.find('.ui-slide-inner-strip').offset({ left: pageX - 50 });
        }
      });
      
      // when releasing the handle, "snap" the slider
      doc.bind('touchend touchcancel', function() {
        $('.ui-slide').each(function(i, slider) {
          slider = $(slider);
          if (!slider.data('animating')) {
            if (slider.find('.ui-slide-handle').offset().left + 10 > slider.data('center').left) {
              slider.data('controls').on();
            } else {
              slider.data('controls').off();
            }
          }
        });
      });
      
      // events
      
      // slide to the "on" position
      slider.bind('slide:on', function() {
        slider.data('animating', true);
        slider.find('.ui-slide-handle').stop().animate({ left: 40 }, 'fast');
        slider.find('.ui-slide-bg').stop().animate({ backgroundPosition: "(-200 0)" }, 'fast');
        slider.find('.ui-slide-inner-strip').stop().animate({ left: 0 }, 'fast', function() {
          slider.data('select').val(options.vals[0]);
          slider.data('animating', false);
          slider.removeClass('off').addClass('on');
        });
      });
      
      // slide to the "off" position
      slider.bind('slide:off', function() {
        slider.data('animating', true);
        slider.find('.ui-slide-handle').stop().animate({ left: 3 }, 'fast');
        slider.find('.ui-slide-bg').stop().animate({ backgroundPosition: "(-240 0)" }, 'fast');
        slider.find('.ui-slide-inner-strip').stop().animate({ left: -41 }, 'fast', function() {
          slider.data('select').val(options.vals[1]);
          slider.data('animating', false);
          slider.removeClass('on').addClass('off');
        });
      });
    });
    
    return this;
  }
  
}(jQuery));