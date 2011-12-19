var jQueryVersions = ['1.4.0', '1.7.1'];

// run the test suite against multiple jquery versions
for (var i = 0; i < jQueryVersions.length; i++) {
  var version = jQueryVersions[i].replace(/\./g, '');
  window.jQuery = window.$ = window['jQuery' + version];
  
  // custom matchers
  beforeEach(function() {
    this.addMatchers({
      // test if an element is hidden
      toBeHidden: function() {
        return $(this.actual).is(':hidden');
      },
      // test if an element is visible
      toBeVisible: function() {
        return $(this.actual).is(':visible');
      },
      // test if a class is present
      toHaveClass: function(classes) {
        return $(this.actual).hasClass(classes);
      }
    });
  });
  
  // spec suite: generic traits
  // these specs test features which should be the same
  // regardless of configuration
  describe('generic traits (' + jQueryVersions[i] + ')', function() {
    var $select, $switch;
    
    beforeEach(function() {
      $select = $('<select><option value="1">On</option><option value="0">Off</option></select>').appendTo('body').switchify();
      $switch = $select.data('switch');
    });
    
    afterEach(function() {
      $('select, .ui-switch').remove();
      $select = undefined;
      $switch = undefined;
    });
    
    it('should be chainable', function() {
      $select.switchify().addClass('chaining-test');
      expect($select.hasClass('chaining-test')).toBeTruthy();
    });
    
    it('should hide the original <select>', function() {
      expect($select).toBeHidden();
    });
    
    it('should insert the ui widget immediately after the <select>', function() {
      var nextEl = $select.next();
      expect(nextEl).toHaveClass('ui-switch');
      expect(nextEl).toBeVisible();
    });
    
    it('should create references between the select and the switch via .data()', function() {
      var dataOnSelect = $select.data('switch'),
          dataOnSwitch = $switch.data('select');
      
      expect(dataOnSelect[0]).toBe($switch[0]);
      expect(dataOnSwitch[0]).toBe($select[0]);
    });
    
    it('should normalize the width of the labels', function() {
      var widths = $switch.find('a').map(function(i, a) { return $(a).width() });
      expect(widths[0]).toEqual(widths[1]);
    });
  });
  
  // spec suite: <select> variations
  // these test the default configuration against
  // different variations of the original <select>
  describe('select variations (' + jQueryVersions[i] + ')', function() {
    beforeEach(function() {
      
    });
    
    afterEach(function() {
      $('select, .ui-switch').remove();
    });
    
    it('should use the <option> inner text as the labels', function() {
      var $select = $('<select><option value="1">OnLabel</option><option value="0">OffLabel</option></select>').appendTo('body').switchify(),
          $switch = $select.data('switch');
          
      var onLabel  = $switch.find('.ui-switch-on').text(),
          offLabel = $switch.find('.ui-switch-off').text();
      
      expect(onLabel).toBe('OnLabel');
      expect(offLabel).toBe('OffLabel');
    });
    
    it('should assume that the first <option> represents the "on" state, and the last the "off" state', function() {
      var $select = $('<select><option value="1">OnState</option><option value="0">OffState</option></select>').appendTo('body').switchify(),
          $switch = $select.data('switch');
          
      expect($switch.find('.ui-switch-on').text()).toBe('OnState');
      expect($switch.find('.ui-switch-off').text()).toBe('OffState');
    });
    
    // loose matching only; full testing of the on/off state of the switch is performed in another test suite
    it('should assume the correct state depending on the selected <option>', function() {
      var $select = $('<select><option value="1">On</option><option value="0">Off</option></select>').appendTo('body').switchify(),
          $switch = $select.data('switch');
      expect($switch).toHaveClass('on');
      
      var $select = $('<select><option value="1" selected="selected">On</option><option value="0">Off</option></select>').appendTo('body').switchify(),
          $switch = $select.data('switch');
      expect($switch).toHaveClass('on');
      
      var $select = $('<select><option value="1">On</option><option value="0" selected="selected">Off</option></select>').appendTo('body').switchify(),
          $switch = $select.data('switch');
      expect($switch).toHaveClass('off');
    });
    
    it('should disable changing state if the original <select> is disabled', function() {
      var $select = $('<select disabled="disabled"><option value="1">On</option><option value="0">Off</option></select>').appendTo('body').switchify(),
          $switch = $select.data('switch');
          
      expect($switch).toHaveClass('on');
      $switch.data('controls').off();
      expect($switch).toHaveClass('on');
      $switch.trigger('mouseup');
      expect($switch).toHaveClass('on');
      $select.val('0');
      expect($switch).toHaveClass('on');
    });
    
    it('should initialize multiple switches for each <select>', function() {
      var $select1 = $('<select><option value="1">On</option><option value="0">Off</option></select>').appendTo('body'),
          $select2 = $('<select><option value="1">On</option><option value="0" selected="selected">Off</option></select>').appendTo('body');
          
      $('select').switchify();
      
      var $switch1 = $select1.data('switch'),
          $switch2 = $select2.data('switch');
          
      expect($switch1).toHaveClass('ui-switch');
      expect($switch2).toHaveClass('ui-switch');
      expect($switch1).toHaveClass('on');
      expect($switch2).toHaveClass('off');
    });
  });
  
  // spec suite: passing in options when initializing
  // these test that the various options are honoured
  describe('select variations (' + jQueryVersions[i] + ')', function() {
    beforeEach(function() {
      
    });
    
    afterEach(function() {
      $('select, .ui-switch').remove();
    });
    
    it('should allow passing in a javascript object to ".switchify()"', function() {
      var $select = $('<select><option value="1">On</option><option value="0">Off</option></select>').appendTo('body');
      $select.switchify({});
      expect($select.data('switch')).toHaveClass('ui-switch');
    });
    
    it('should allow specifying which <option> value represents the "on" and "off" states', function() {
      var $select = $('<select><option value="0">Off</option><option value="1">On</option></select>').appendTo('body');
      $select.switchify({ on: '1', off: '0' });
      var $switch = $select.data('switch');
      expect($switch.find('.ui-switch-on').text()).toBe('On');
      expect($switch.find('.ui-switch-off').text()).toBe('Off');
    });
    
    it('should still respect the state of the <select> when overriding the defaults', function() {
      var $select1 = $('<select><option value="1">On</option><option value="0">Off</option></select>').appendTo('body'),
          $select2 = $('<select><option value="1">On</option><option value="0" selected="selected">Off</option></select>').appendTo('body'),
          $select3 = $('<select disabled="disabled"><option value="1">On</option><option value="0">Off</option></select>').appendTo('body'),
          $select4 = $('<select><option value="0">Off</option><option value="1">On</option></select>').appendTo('body');
          
      $('select').switchify({ on: '1', off: '0' });
      
      var $switch1 = $select1.data('switch'),
          $switch2 = $select2.data('switch'),
          $switch3 = $select3.data('switch'),
          $switch4 = $select4.data('switch');
      
      expect($('.ui-switch').length).toBe(4);
      expect($switch1).toHaveClass('on');
      expect($switch2).toHaveClass('off');
      expect($switch3).toHaveClass('on');
      $switch3.data('controls').off();
      expect($switch3).toHaveClass('on');
      expect($switch4).toHaveClass('off');
      expect($switch4.find('.ui-switch-on').text()).toBe('On');
      expect($switch4.find('.ui-switch-off').text()).toBe('Off');
    });
  });
  
}