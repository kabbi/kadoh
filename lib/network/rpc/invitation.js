var RPC  = require('./rpc'),
    Peer = require('../../dht/peer');

var InvitationRPC = module.exports = RPC.extend({

  initialize: function(queried_peer, target_peer) {
    if (arguments.length === 0) {
      this.supr();
    } else {
      this.supr(queried_peer, 'INVITATION', [target_peer]);
    }
  },

  getTargetPeer: function () {
    return this.getParams(0);
  },

  normalizeParams: function() {
    return {
      targetPeer: this.getTargetPeer().getTriple()
    };
  },

  handleNormalizedParams: function(params) {
    try {
      var targetPeer = new Peer(params.targetPeer);
    } catch (e) {
      return this.reject();
    }
    this.params = [params.targetPeer];
    return this;
  },

  normalizeResult: function() {
    return {};
  },

  handleNormalizedResult: function(result) {
    this.resolve();
  }
});
