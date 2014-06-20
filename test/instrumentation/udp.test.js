var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require("sinon-chai");
chai.use(sinonChai);
var expect = chai.expect;

process.env.KADOH_TRANSPORT = 'udp';
var FIRST_BOOTSTRAP_PORT = 13000;
var FIRST_NODE_PORT = 15000;
var NUMBER_OF_BOOTSTRAPS = 10;
var NUMBER_OF_NODES = 100;
var MAX_STORE_ITEM_SIZE = 1000;
var NUMBER_OF_PINGS = 10;

// Some utility functions
function pick(array, count) {
    if (count != undefined) {
        var results = [];
        for (var i = 0; i < count; i++)
            results.push(pick(array));
        return results;
    }
    var idx = Math.floor(Math.random() * array.length);
    return array[idx];
}

describe('Local DHT cluster', function() {
    var Deferred = require('../../lib/util/deferred');
    var Bootstrap = require('../../lib/bootstrap');
    var Crypto = require('../../lib/util/crypto');
    var Node = require('../../lib/node');
    var globals = require('../../lib/globals');

    var config = {
        reactor: {
            protocol: 'jsonrpc2',
            transport: {
                host: '127.0.0.1',
                port: FIRST_BOOTSTRAP_PORT,
                reconnect: true
            }
        }
    };

    // THese are set by 'bootstrap' test suite
    var bootstraps = [], bootstrapReady;

    describe('with bootstrap nodes', function() {

        it('should create ' + NUMBER_OF_BOOTSTRAPS + ' valid bootstrap nodes', function() {
            for (var i = 0; i < NUMBER_OF_BOOTSTRAPS; i++) {
                config.reactor.transport.port = FIRST_BOOTSTRAP_PORT + i;
                var node = new Bootstrap(null, config);
                bootstraps.push(node);

                expect(node).to.be.ok;
                expect(node.getID()).to.be.a('string');
            }
        });

        it('should generate unique id for every node', function() {
            var idMap = {};
            for (var i = 0; i < bootstraps.length; i++) {
                var id = bootstraps[i].getID();
                expect(idMap).not.to.have.keys(id);
                idMap[id] = true;
            }
        });

        it('should connect all the nodes successfully', function(done) {
            var finished = [];
            for (var i = 0; i < bootstraps.length; i++) {
                // As connect is not deferred :(
                (function() {
                    var deferred = new Deferred();
                    bootstraps[i].connect(function() {
                        deferred.resolve();
                    });
                    finished.push(deferred);
                })();
            }
            bootstrapReady = Deferred.whenAll(finished).then(function() {
                done();
            });
        });
    });

    // These are set by 'usual' test suite
    var nodes = [], nodesReady;

    describe('with dht nodes', function() {

        before(function(done) {
            // Ensure all bootstraps are connected
            bootstrapReady.then(function() {
                done();
            });
        });

        it('should create ' + NUMBER_OF_NODES + ' dht nodes', function() {
            // Using previously generated bootstraps here
            config.bootstraps = bootstraps;

            for (var i = 0; i < NUMBER_OF_NODES; i++) {
                config.reactor.transport.port = FIRST_NODE_PORT + i;
                var node = new Node(null, config);
                nodes.push(node);

                expect(node).to.be.ok;
                expect(node.getID()).to.be.a('string');
            }
        });

        it('should generate unique id for every node', function() {
            var idMap = {};
            for (var i = 0; i < nodes.length; i++) {
                var id = nodes[i].getID();
                expect(idMap).not.to.have.keys(id);
                idMap[id] = true;
            }
        });

        it('should connect all the nodes successfully', function(done) {
            var finished = [];
            for (var i = 0; i < nodes.length; i++) {
                // As connect is not deferred :(
                (function() {
                    var deferred = new Deferred();
                    nodes[i].connect(function() {
                        deferred.resolve();
                    });
                    finished.push(deferred);
                })();
            }
            nodesReady = Deferred.whenAll(finished).then(function() {
                done();
            });
        });
    });

    describe('with one random DHT node', function() {

        var nodeToTest, storedItem = {};

        before(function(done) {
            // Ensure all nodes are connected
            nodesReady.then(function() {
                nodeToTest = pick(nodes);
                expect(nodeToTest).to.be.ok;
                done();
            });
        });

        it('should be able to support all declared RPCs', function() {
            var rpcs = globals.RPCS;
            for (var i = 0; i < rpcs.length; i++) {
                expect(nodeToTest._reactor.RPCObject[rpcs[i]]).to.be.ok;
            }
        });

        it('should be able to reliable ping any other node', function(done) {
            var PingRPC = nodeToTest._reactor.RPCObject.PING;
            var rpcs = pick(nodes, NUMBER_OF_PINGS).map(function(node) {
                return new PingRPC(node);
            });
            Deferred.whenAll(rpcs).then(function() {
                done();
            });
            nodeToTest._reactor.sendRPC(rpcs);
        });

        it('should store random piece of value', function(done) {
            storedItem.key = Crypto.digest.randomSHA1();
            storedItem.value = Crypto.randomBytes(Math.random() * MAX_STORE_ITEM_SIZE);
            var store = nodeToTest.iterativeStore(storedItem.key, storedItem.value);
            store.then(function() {
                done();
            });
        });

        it('should successfully return the stored item', function(done) {
            var find = nodeToTest.iterativeFindValue(storedItem.key);
            find.then(function(item) {
                expect(item.value).to.be.eql(storedItem.value);
                done();
            });
        });

        it('should find this item from some other node', function() {
            var nodeToTest = pick(nodes);
            var find = nodeToTest.iterativeFindValue(storedItem.key);
            find.then(function(item) {
                expect(item.value).to.be.eql(storedItem.value);
                done();
            });
        });
    });

    after(function() {
        // Destroy everything
        for (var i = 0; i < bootstraps.length; i++) {
            bootstraps[i].disconnect();
        }
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].disconnect();
        }
    });

});
