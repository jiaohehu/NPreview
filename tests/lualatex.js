const { NitrilePreviewParser } = require('../lib/nitrile-preview-parser');
const { NitrilePreviewLualatex } = require('../lib/nitrile-preview-lualatex');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

var work = async ()=>{
  console.log(fname);
  const parser = new NitrilePreviewParser();
  const translator = new NitrilePreviewLualatex();
  await parser.readFromFileAsync(fname);
  parser.idenBlocks();
  parser.translateBlocks(translator);
  var main = parser.blocks;
  var latex = main.map(x=>x.latex);
  console.log(latex.join('\n'));
  var data = translator.toDocument();
  console.log(data);
};

work();

