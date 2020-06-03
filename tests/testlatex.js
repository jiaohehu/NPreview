const { NitrilePreviewLatex } = require('../lib/nitrile-preview-latex');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

var work = async ()=>{
  var parser = new NitrilePreviewLatex();
  await parser.readFromFileAsync(fname);
  await parser.readModeAsync();
  parser.idenBlocks();
  parser.translateBlocks();
  var main = parser.blocks;
  var texlines = main.map(x=>x.latex);
  console.log(texlines[0]);
  console.log(texlines[1]);
};

work();

