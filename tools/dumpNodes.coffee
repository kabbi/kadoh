# A tool to parse utorrent dht peers store
bncode = require "bncode"
fs = require "fs"
dgram = require "dgram"

# Parse args
argv = require("yargs").usage("Usage: $0 dht.dat").argv

# Basic parsing tool
parseHostName = (buf, offset) ->
    "#{buf[offset]}.#{buf[offset + 1]}.#{buf[offset + 2]}.#{buf[offset + 3]}:#{buf[offset + 4] << 8 | buf[offset + 5]}"

dhtData = fs.readFileSync argv._[0]
dhtData = bncode.decode dhtData

console.log "Our self node id: #{dhtData.id.toString 'hex'}"
console.log "Nodes in contact table: #{dhtData.nodes.length / 6}"

console.log "Contact table:"
for offset in [0...dhtData.nodes.length] by 6
    console.log parseHostName dhtData.nodes, offset

# TODO: ping nodes