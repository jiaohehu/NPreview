const { NitrilePreviewContex } = require('../lib/nitrile-preview-contex');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

var work = async ()=>{
  var out = await utils.readFileAsync(fname);
  var lines = out.split('\n');
  const parser = new NitrilePreviewContex();
  parser.readFromLines(lines);
  await parser.readModeAsync();
  parser.translate_blocks();
  var main = parser.blocks;
  var outlines = main.map(x=>x.latex);
  console.log(outlines.join('\n'));
};

work();
