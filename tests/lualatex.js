const { NitrilePreviewLualatex } = require('../lib/nitrile-preview-latex');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

var work = async ()=>{
  var parser = new NitrilePreviewLualatex();
  await parser.readFromFileAsync(fname);
  await parser.readModeAsync();
  parser.idenBlocks();
  parser.translateBlocks();
  var main = parser.blocks;
  var texlines = main.map(x=>x.latex);
  texlines.forEach(x => console.log(x));
};

work();

