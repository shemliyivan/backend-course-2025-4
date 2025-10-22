const {program} = require("commander");
const http = require('node:http')
const fs = require('node:fs');

program.option('-i, --input <file>').option('-h, --host <file>').option('-p, --port').option('-v, --variety').option('-l, --length [num]');

program.parse();

const options = program.opts();

if(!options.input && options.input.trim() == ""){
    console.error("Pleasy specify input file");
    process.exit();
}

