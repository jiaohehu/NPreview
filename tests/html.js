const { NitrilePreviewHtml } = require('../lib/nitrile-preview-html');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];

var work = async ()=>{
  console.log(fname);
  var out = await utils.readFileAsync(fname);
  var lines = out.split('\n');
  const parser = new NitrilePreviewHtml();
  parser.readFromLines(lines);
  parser.iden_blocks();
  parser.translate_blocks();
  var main = parser.blocks;
  var htmls = main.map(x=>x.html);
  console.log(htmls.join('\n'));
};

work();