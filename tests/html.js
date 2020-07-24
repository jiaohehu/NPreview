const { NitrilePreviewParser } = require('../lib/nitrile-preview-parser');
const { NitrilePreviewHtml } = require('../lib/nitrile-preview-html');
const utils = require('../lib/nitrile-preview-utils');

console.log('process.arg=',process.argv);
const fname = process.argv[2];
console.log('fname=',fname);

var work = async ()=>{
  console.log(fname);
  var out = await utils.readFileAsync(fname);
  var lines = out.split('\n');
  const parser = new NitrilePreviewParser();
  parser.read_md_lines(lines);
  var translator = new NitrilePreviewHtml();
  parser.translate_blocks(translator);
  var main = parser.blocks;
  var htmls = main.map(x=>x.html);
  console.log(htmls.join('\n'));
};

if(fname){
  work();
}
