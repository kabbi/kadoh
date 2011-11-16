// Dep: [KadOH]/util/crypto

(function(exports) {

  var KadOH = exports;
  KadOH.globals = {
    // Maximum number of contacts in a k-bucket
    _k: 20,

    // Degree of parallelism for network calls
    _alpha: 3,

    // The number of triple to put in a response
    _beta: 2,

    // Size of the space in bits
    _B: 160,

    // Implemented RPCs
    _rpcs: [
      'PING'
    , 'FIND_NODE'
    ],
    
    _transport_server : 'localhost',

    // Request timeout in milliseconds
    _timeout: 5 * 1000,

    // SHA1 function
    _digest: KadOH.util.Crypto.digest.SHA1,

    // Parser function
    _parse: (typeof JSON !== 'undefined') ? JSON.parse : function(data) { eval('(' + data + ')'); },

    // Interval for cleanup of the Reactor's RPCs in milliseconds
    _cleanup_interval: 30 * 1000
  };

})('object' === typeof module ? module.exports : (this.KadOH = this.KadOH || {}));