const { NitrilePreviewLatex } = require('../lib/nitrile-preview-latex');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

var work = async ()=>{
  console.log(fname);
  var out = await utils.readFileAsync(fname);
  var lines = out.split('\n');
  console.log(lines);
  const parser = new NitrilePreviewLatex();
  parser.readFromLines(lines);
  parser.idenBlocks();
  parser.translateBlocks();
  var main = parser.blocks;
  var outlines = main.map(x=>x.latex);
  console.log(outlines.join('\n'));
};

work();

