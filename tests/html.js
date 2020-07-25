const { NitrilePreviewParser } = require('../lib/nitrile-preview-parser');
const { NitrilePreviewHtml } = require('../lib/nitrile-preview-html');
const utils = require('../lib/nitrile-preview-utils');

console.log('process.arg=',process.argv);
const fname = process.argv[2];
console.log('fname=',fname);

var work = async ()=>{
  var out = await utils.readFileAsync(fname);
  var lines = out.split('\n');
  const parser = new NitrilePreviewParser();
  const translator = new NitrilePreviewHtml(parser);
  parser.read_md_lines(lines);
  translator.translate_blocks();
  var main = parser.blocks;
  var htmls = main.map(x=>x.html);
  var html = htmls.join('\n');
  console.log(html);
};

if(fname){
  work();
}

