const { NitrilePreviewParser } = require('../lib/nitrile-preview-parser');
const { NitrilePreviewLualatex } = require('../lib/nitrile-preview-lualatex');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

var work = async ()=>{
  console.log(fname);
  var out = await utils.readFileAsync(fname);
  var lines = out.split('\n');
  const parser = new NitrilePreviewParser();
  parser.read_md_lines(lines);
  var translator = new NitrilePreviewLualatex();
  parser.translate_blocks(translator);
  var main = parser.blocks;
  var latex = main.map(x=>x.latex);
  console.log(latex.join('\n'));
};

work();

