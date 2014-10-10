var chai = require('chai'),
    crypto = require('../lib/util/crypto');

function helperChai(chai, utils) {

  function assertSorted(compareFn) {
    compareFn = compareFn || function(a, b) { return a - b; };

    var obj = utils.flag(this, 'object');
    for (var i = 0, l = obj.length; i < l - 1; i++) {
      this.assert(compareFn(obj[i], obj[i+1]) < 0, "expected array to be sorted " + utils.inspect(obj));
    }
  }

  function assertPositive() {
  	var obj = utils.flag(this, 'object');
  	this.assert(obj > 0, "expected " + obj + " to be positive");
  }

  chai.Assertion.addMethod('sorted', assertSorted);
  chai.Assertion.addMethod('positive', assertPositive);
}

chai.use(helperChai);
