var RPC = require('./rpc');

var ObserveRPC = module.exports = RPC.extend({

  initialize: function(queried_peer) {
    if (arguments.length === 0) {
      this.supr();
    } else {
      this.supr(queried_peer, 'OBSERVE');
    }
  },

  normalizeParams: function() {
    return {};
  },

  handleNormalizedParams: function(params) {
    this.params = [];
    return this;
  },

  normalizeResult: function() {
    var args = this.getResult();
    var externalAddress = args[0];
    return {
      address: externalAddress
    };
  },

  handleNormalizedResult: function(result) {
    if (!result.address) {
      this.reject(new Error('non valid observe response'));
    }
    this.resolve(result.address);
  }
});
