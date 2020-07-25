const { NitrilePreviewParser } = require('../lib/nitrile-preview-parser');
const { NitrilePreviewContext } = require('../lib/nitrile-preview-context');
const utils = require('../lib/nitrile-preview-utils');

console.log('process.arg=',process.argv);
const fname = process.argv[2];
console.log('fname=',fname);

var work = async ()=>{
  console.log(fname);
  var out = await utils.readFileAsync(fname);
  var lines = out.split('\n');
  const parser = new NitrilePreviewParser();
  const translator = new NitrilePreviewContext(parser);
  parser.read_md_lines(lines);
  translator.translate_blocks();
  var main = parser.blocks;
  var latex = main.map(x=>x.latex);
  console.log(latex.join('\n'));
};

if(fname){
  work();
}
