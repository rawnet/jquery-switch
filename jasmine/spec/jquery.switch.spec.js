// custom matchers
beforeEach(function () {
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

// spec suite
describe('generic traits', function() {
  // get the appropriate <select> this this suite
  var $select;
  
  beforeEach(function() {
    $select = $('<select id="generic"><option value="1">On</option><option value="0">Off</option></select>').appendTo('body').switchify();
  });
  
  afterEach(function() {
    $select.data('switch').remove();
    $select.remove();
    $select = undefined;
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
});