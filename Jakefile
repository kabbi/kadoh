var DIST_DIR = __dirname + '/dist/';
var SPEC_DIST = __dirname + '/spec/dist/';

var LIB_DIR = {
  'kadoh': __dirname + '/lib/client',
  'socket.io-client' : __dirname + '/node_modules/socket.io-client/dist'
};

var ENTRY_FILES = [
  'node'
];

var FS = require('fs');
var PATH = require('path');
var PROC = require('child_process');

//**************DEFAULT********************
desc('Say Hello to Kadoh');
task('default', [], function() {
  var exec  = require('child_process').exec;

  exec('cowsay Hello KadOH', function(error, stdout, stderr) {
    if(stderr)
      console.log('Hello KadOH');
    else
      console.log(stdout);
    complete();
  });

}, true);

desc('Testing');
task('test', ['default'], function() {
  
  Build(SPEC_DIST + 'KadOH.js', false);
 
  PROC.exec('jasmine-node spec --verbose', function(err, stdout, stderr) {
    if (err) {
      console.error('!ERROR!');
      console.error(err.message);
    }
    console.log(stdout);

    complete();
  });
}, true);

namespace('test', function() {
  
  desc('Testing in the browser');
  task('browser', ['default'], function() {
    
    Build(SPEC_DIST + 'KadOH.js', false);
    
    try{
      var jasmine = require('jasmine-runner');
      jasmine.run({command : 'mon', cwd : __dirname, args : []});
      console.log('use jasmine-runner w/out command line');
    }
    catch(e){
      
      var spawn = PROC.spawn;
        var jasmine = spawn('jasmine', ['mon']);
        
        jasmine.stdout.on('data', function(data) {
          //suppress blank line
          (data = data.toString().split(/\n/)).pop()
          console.log(data.join('\n'));
        });
        
        jasmine.stderr.on('data', function(data) {
          console.error(data.toString());
        });
    }
    

  });

});

//**************BUILD****************
desc('Building and minifing the embedded code');
task('build', ['default'], function() {
  Build(DIST_DIR + 'KadOH.js', false);
  Build(DIST_DIR + 'KadOH.min.js', true);
});

namespace('build', function() {
  
  desc('Building the code');
  task('normal', ['default'], function() {
    Build(DIST_DIR + 'KadOH.js', false);
  });

  desc('Minifying the embedded code');
  task('min', ['default'], function() {
    Build(DIST_DIR + 'KadOH.min.js', true);
  });
  
  desc('Building code for test');
  task('test', [], function(){
    Build(SPEC_DIST + 'KadOH.js', false);
  });
  
});

//*************UTIL*********************
var Build = function(where, mini) {
  var mini = mini || false;
  console.log('[Build] START' + (mini ? ' with mignify' : ''));
  
  var dep = new Dependencies();
  ENTRY_FILES.forEach(function(file) {
    dep.addFile(PATH.join(LIB_DIR['kadoh'],file));
  });
  
  FS.writeFileSync(where, buildCode(dep.Stack, mini), 'utf-8');
  console.log('[Build] OK : building ' + PATH.basename(where) + ' complete');
};

var buildCode = function(files, mini) {
  mini = mini || false;
  var code = [];
  var results = {success : [], fail : []};

  for(i in files) {
    path = files[i];
    try {
      var content = FS.readFileSync(path, 'utf-8');
      if(mini) {
        var ugly = require('uglify-js');

        var ast = ugly.parser.parse(content);
        ast = ugly.uglify.ast_mangle(ast)
        ast = ugly.uglify.ast_squeeze(ast)
        var content = ugly.uglify.gen_code(ast);
      }
      code.push(content);
      results.success.push( PATH.basename(path));
    }
    catch(err) {
      results.fail.push( PATH.basename(path));
    }
  };
  
  console.log('[Build] OK : '+results.success.join(', '));
  if(results.fail.length)
    console.log('[Build] read FAIL : '+results.fail.join(', '));
    
  return code.join('\n');
}

var Dependencies = function() {
  this.Stack = [];
};

Dependencies.prototype.extractDep= function(code, originpath) {

  originpath = PATH.dirname(originpath);
  var dep = [];

  code.split('\n').forEach(function(line) {
    match = false;

    if (extracted = /\s*\/\/\s*Dep\s*:\s*\[(.*)\](\S*)\s*.*/gi.exec(line)) {
      var rootpath = LIB_DIR[extracted[1].toLowerCase()];
      var path = extracted[2];      
      match = true;
    } else if (extracted = /\s*\/\/\s*Dep\s*:\s*(\S*)\s*.*/gi.exec(line)) {
      var path = extracted[1];
      var rootpath = originpath;
      match = true;
    }

    if (match) {
      path = (PATH.extname(path) == "") ? path + ".js" : path;
      dep.push(PATH.join(rootpath,path));
    }
  });
  return dep;
};



Dependencies.prototype.addFile = function(filepath) {
  filepath = (PATH.extname(filepath) == "") ? filepath + ".js" : filepath;
  try {
    var code = FS.readFileSync(filepath, 'utf-8');
  } catch(e) {
    console.log('[Build] read FAIL : ' + PATH.basename(filepath) + ' not found.')
    return;
  }

  var dep = this.extractDep(code, filepath);
  
  if(this.Stack.indexOf(filepath) == -1) this.Stack.unshift(filepath);

  for (i in dep) {
    index = this.Stack.indexOf(dep[i]);
    if (index == -1) {
      this.addFile(dep[i]);
    }
    else {
      this.Stack.splice(index,1);
      this.addFile(dep[i]);
    }
  }
};
