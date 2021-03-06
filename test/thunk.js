var assert = require('assert');

var snabbdom = require('../snabbdom');
var patch = snabbdom.init([
]);
var h = require('../h').default;
var thunk = require('../thunk').default;

describe('thunk', function() {
  var elm, vnode0;
  beforeEach(function() {
    elm = vnode0 = document.createElement('div');
  });
  it('returns vnode with data and render function', function() {
    function numberInSpan(n) {
      return h('span', 'Number is ' + n);
    }
    var vnode = thunk('span', 'num', numberInSpan, [22]);
    assert.deepEqual(vnode.sel, 'span');
    assert.deepEqual(vnode.data.key, 'num');
    assert.deepEqual(vnode.data.args, [22]);
  });
  it('only calls render function on data change', function() {
    var called = 0;
    function numberInSpan(n) {
      called++;
      return h('span', {key: 'num'}, 'Number is ' + n);
    }
    var vnode1 = h('div', [
      thunk('span', 'num', numberInSpan, [1])
    ]);
    var vnode2 = h('div', [
      thunk('span', 'num', numberInSpan, [1])
    ]);
    var vnode3 = h('div', [
      thunk('span', 'num', numberInSpan, [2])
    ]);
    patch(vnode0, vnode1);
    patch(vnode1, vnode2);
    patch(vnode2, vnode3);
    assert.equal(called, 2);
  });
  it('renders correctly', function() {
    var called = 0;
    function numberInSpan(n) {
      called++;
      return h('span', {key: 'num'}, 'Number is ' + n);
    }
    var vnode1 = h('div', [
      thunk('span', 'num', numberInSpan, [1])
    ]);
    var vnode2 = h('div', [
      thunk('span', 'num', numberInSpan, [1])
    ]);
    var vnode3 = h('div', [
      thunk('span', 'num', numberInSpan, [2])
    ]);
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.firstChild.tagName.toLowerCase(), 'span');
    assert.equal(elm.firstChild.innerHTML, 'Number is 1');
    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.firstChild.tagName.toLowerCase(), 'span');
    assert.equal(elm.firstChild.innerHTML, 'Number is 1');
    elm = patch(vnode2, vnode3).elm;
    assert.equal(elm.firstChild.tagName.toLowerCase(), 'span');
    assert.equal(elm.firstChild.innerHTML, 'Number is 2');
    assert.equal(called, 2);
  });
  it('supports leaving out the `key` argument', function() {
    function vnodeFn(s) {
      return h('span.number', 'Hello ' + s);
    }
    var vnode1 = thunk('span.number', vnodeFn, ['World!']);
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.innerText, 'Hello World!');
  });
  it('renders correctly when root', function() {
    var called = 0;
    function numberInSpan(n) {
      called++;
      return h('span', {key: 'num'}, 'Number is ' + n);
    }
    var vnode1 = thunk('span', 'num', numberInSpan, [1]);
    var vnode2 = thunk('span', 'num', numberInSpan, [1]);
    var vnode3 = thunk('span', 'num', numberInSpan, [2]);

    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.tagName.toLowerCase(), 'span');
    assert.equal(elm.innerHTML, 'Number is 1');

    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.tagName.toLowerCase(), 'span');
    assert.equal(elm.innerHTML, 'Number is 1');

    elm = patch(vnode2, vnode3).elm;
    assert.equal(elm.tagName.toLowerCase(), 'span');
    assert.equal(elm.innerHTML, 'Number is 2');
    assert.equal(called, 2);
  });
  it('can be replaced and removed', function() {
    function numberInSpan(n) {
      return h('span', {key: 'num'}, 'Number is ' + n);
    }
    function oddEven(n) {
      var prefix = (n % 2) === 0 ? 'Even' : 'Odd';
      return h('div', {key: oddEven}, prefix + ': ' + n);
    }
    var vnode1 = h('div', [thunk('span', 'num', numberInSpan, [1])]);
    var vnode2 = h('div', [thunk('div', 'oddEven', oddEven, [4])]);

    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.firstChild.tagName.toLowerCase(), 'span');
    assert.equal(elm.firstChild.innerHTML, 'Number is 1');

    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.firstChild.tagName.toLowerCase(), 'div');
    assert.equal(elm.firstChild.innerHTML, 'Even: 4');
  });
  it('can be replaced and removed when root', function() {
    function numberInSpan(n) {
      return h('span', {key: 'num'}, 'Number is ' + n);
    }
    function oddEven(n) {
      var prefix = (n % 2) === 0 ? 'Even' : 'Odd';
      return h('div', {key: oddEven}, prefix + ': ' + n);
    }
    var vnode1 = thunk('span', 'num', numberInSpan, [1]);
    var vnode2 = thunk('div', 'oddEven', oddEven, [4]);

    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.tagName.toLowerCase(), 'span');
    assert.equal(elm.innerHTML, 'Number is 1');

    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.tagName.toLowerCase(), 'div');
    assert.equal(elm.innerHTML, 'Even: 4');
  });
  it('invokes destroy hook on thunks', function() {
    var called = 0;
    function destroyHook() {
      called++;
    }
    function numberInSpan(n) {
      return h('span', {key: 'num', hook: {destroy: destroyHook}}, 'Number is ' + n);
    }
    var vnode1 = h('div', [
      h('div', 'Foo'),
      thunk('span', 'num', numberInSpan, [1]),
      h('div', 'Foo')
    ]);
    var vnode2 = h('div', [
      h('div', 'Foo'),
      h('div', 'Foo')
    ]);
    patch(vnode0, vnode1);
    patch(vnode1, vnode2);
    assert.equal(called, 1);
  });
  it('invokes remove hook on thunks', function() {
    var called = 0;
    function hook() {
      called++;
    }
    function numberInSpan(n) {
      return h('span', {key: 'num', hook: {remove: hook}}, 'Number is ' + n);
    }
    var vnode1 = h('div', [
      h('div', 'Foo'),
      thunk('span', 'num', numberInSpan, [1]),
      h('div', 'Foo')
    ]);
    var vnode2 = h('div', [
      h('div', 'Foo'),
      h('div', 'Foo')
    ]);
    patch(vnode0, vnode1);
    patch(vnode1, vnode2);
    assert.equal(called, 1);
  });

  it('supports object parameter', function() {
    function vnodeFn(s) {
      return h('span.number', 'Hello ' + s);
    }
    var vnode1 = thunk('span.number', {
      fn: vnodeFn,
      args: ['World!']
    });
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.innerText, 'Hello World!');
  });

  it('supports equality fn parameter', function() {
    function vnodeFn(s) {
      return h('span.number', s + ' World!');
    }

    function getNode(s) {
      return thunk('span.number', {
        fn: vnodeFn,
        args: [s],
        equalityFn: function(arg1, arg2) {
          return true;
        }
      });
    }

    var vnode1 = getNode('Hello');
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.innerText, 'Hello World!');

    var vnode2 = getNode('Goodbye');
    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.innerText, 'Hello World!');

  });
});

