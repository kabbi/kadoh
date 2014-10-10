var klass = require('klass');
var _ = require('underscore');
/*
 * Basic Storage class. Used in Node.js when lawnchair is not defined.
 * Imitate the API of lawnchair but is not persistant.
 */

var BasicPersistentStorage = module.exports = klass({

  initialize: function(config, cb) {
    cb = cb || function(){};
    this.config = config; //could be usefull
    this._index = {};
    cb.call(this, this);
  },

  save: function(kv, cb) {
    cb = cb || function(){};
    if (typeof this._index[kv.key] == 'undefined')
      this._index[kv.key] = [];
    this._index[kv.key].push(kv);
    cb.call(this, kv);
    return this;
  },

  get: function(key, cb) {
    cb = cb || function(){};
    if(typeof this._index[key] == 'undefined') {
      cb.call(this, null);
      return this;
    }
    cb.call(this, this._index[key]);
    return this;
  },

  exists: function(kv, cb) {
    if(typeof this._index[kv.key] == 'undefined') {
      cb.call(this, false);
      return this;
    }
    for (var i = this._index[kv.key].length - 1; i >= 0; i--) {
      var el = this._index[kv.key][i];
      if (this.kvEquals(el, kv)) {
        cb.call(this, true);
        return this;
      }
    };
    cb.call(this, false);
    return this;
  },

  remove: function(kv, cb) {
    cb = cb || function(){};
    if(typeof this._index[kv.key] == 'undefined') {
      cb.call(this);
      return this;
    }
    this._index = _.filter(this._index,
      _.partial(this.kvEquals, kv), this);
    if (this._index.length === 0)
      delete this._index[kv.key];
    cb.call(this);
    return this;
  },

  nuke: function(cb) {
    cb = cb || function(){};
    this._index = {};
    cb.call(this);
  },

  each: function(cb) {
    for(var obj in this._index) {
      for (var i = obj.length - 1; i >= 0; i--) {
        cb.call(this, obj[i]);
      };
    }
  },

  keys: function(cb) {
    cb(_.keys(this._index));
  },

  kvEquals: function(kv1, kv2) {
    return (kv1.key == kv2.key) && _.isEqual(kv1.value, kv2.value);
  }
});