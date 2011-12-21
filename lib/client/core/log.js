// Dep: [KadOH]/core/eventemitter
// Dep: [jQuery]/jquery-1.7.js


(function(exports) {

  var KadOH        = exports,
      globals      = KadOH.globals,
      EventEmitter = KadOH.core.EventEmitter;

  KadOH.Log = EventEmitter.extend({

    LogLevel : {
      debug : 0,
      info  : 1,
      warn  : 2,
      error : 3,
      fatal : 4
    },

    initialize: function(options) {
      this.supr();

      this.config = {
        level: this.LogLevel.info
      };
  
      this._loggers = {};
      this._group   = 'main';

      for (var key in options) {
        this.config[key] = options[key];
      }
    },

    level: function(level) {
      return this.LogLevel.hasOwnProperty(level) ?
                            this.LogLevel[level] : 
                            level;
    },

    addLogger: function(name, logger) {
      if (KadOH.loggers.hasOwnProperty(name))
        logger = KadOH.loggers[name];

      var listener = function(type) {
        if (typeof logger[type] === 'function') {
          logger[type].apply(logger, Array.prototype.slice.call(arguments, 1));
        }
      };
      this.subscribe(listener);
      this._loggers[name] = listener;
      return this;
    },

    subscribeTo: function(eventemitter, group) {
      if (eventemitter instanceof EventEmitter) {
        eventemitter.subscribe(function() {
          group = group || 'main';
          this.print.call(this, 'info', group, arguments);
        }, this);
      }
    },

    removeLogger: function(name) {
      if (this._loggers.hasOwnProperty(name)) {
        this.unsubscribe(this._loggers[name]);
        delete this._loggers[name];
      }
      return this;
    },

    group: function(name) {
      return this.emit('group', name);
    },

    groupEnd: function(name) {
      return this.emit('groupEnd');
    },

    print: function(level, group, args) {
      if (this.level(level) < this.config.level) return;

      group = group || 'main';
      if (this._group !== group) {
        this.groupEnd();
        if (group !== 'main') {
          this.group(group);
        }
        this._group = group;
      }

      args = Array.prototype.slice.call(args);
      args.unshift(level);
      return this.emit.apply(this, args);
    },

    debug: function() {
      return this.print('debug', 'main', arguments);
    },

    info: function () {
      return this.print('info', 'main', arguments);
    },

    warn: function () {
      return this.print('warn', 'main', arguments);
    },

    error: function () {
      return this.print('error', 'main', arguments);

    },

    fatal: function () {
      return this.print('fatal', 'main', arguments);
    }

  });

  var ConsoleLogger = function() {
    this.name    = 'ConsoleLogger';
    this.console = console;
  };

  ConsoleLogger.prototype = {
    debug: function() {
      this.console.debug.apply(this.console, arguments);
    },

    info: function() {
      this.console.log.apply(this.console, arguments);
    },
    
    warn: function() {
      this.console.warn.apply(this.console, arguments);
    },
    
    error: function() {
      this.console.error.apply(this.console, arguments);
    },
    
    fatal: function() {
      this.console.error.apply(this.console, arguments);
    },

    group: function(name) {
      this.console.group(name);
    },

    groupEnd: function() {
      this.console.groupEnd();
    }
  };

  var jQueryLogger = function(console_id) {
    this.name      = 'jQueryLogger';
    this.consoleID = console_id || 'console';
    this.node      = jQuery('#' + this.consoleID);
  };

  jQueryLogger.prototype = {
    append: function(type, args) {
      var html = 
        '<div class="log ' + type + '">' +
        '<span class="' + type + '">' + type.toUpperCase() + '</span>';
      
      args = Array.prototype.slice.call(args);
      for (var i = 0; i < args.length; i++) {
        html += '<pre>' + this._stringify(args[i]) + '</pre>';
      }
      
      html += '</div>';
      if (this.node.length === 0) {
        this.node = jQuery('#' + this.consoleID);
      }
      this.node.append(html);
    },

    debug: function() {
      this.append('debug', arguments);
    },

    info: function() {
      this.append('info', arguments);
    },
    
    warn: function() {
      this.append('warn', arguments);
    },
    
    error: function() {
      this.append('error', arguments);
    },
    
    fatal: function() {
      this.append('fatal', arguments);
    },

    group: function(name) {
      var group = $('<div class="group ' + name + '"></div>');
      this.node.append(group);
      this.node = group;
    },

    groupEnd: function() {
      if (this.node.attr('id') !== this.consoleID) {
        this.node = this.node.parent();
      }
    },

    _stringify: function(object) {
      if (typeof object !== 'string' && !(object instanceof String)) {
        try {
          var json = JSON.stringify(object, null, 2);
          return json;
        }
        catch(e) {}
      }
      return object.toString();
    }
  };

  KadOH.loggers = KadOH.loggers || {};
  KadOH.log = new KadOH.Log();

  if (typeof console !== 'undefined' && console.log) {
    KadOH.loggers.ConsoleLogger = new ConsoleLogger();
    KadOH.log.addLogger('ConsoleLogger');
  }
  
  if (typeof window !== 'undefined' && window.jQuery) {
    KadOH.loggers.jQueryLogger = new jQueryLogger();
    KadOH.log.addLogger('jQueryLogger');
  }

})('object' === typeof module ? module.exports : (this.KadOH = this.KadOH || {}));