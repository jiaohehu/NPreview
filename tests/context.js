const { NitrilePreviewParser } = require('../lib/nitrile-preview-parser');
const { NitrilePreviewContext } = require('../lib/nitrile-preview-context');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];

var work = async ()=>{
  console.log(fname);
  var out = await utils.readFileAsync(fname);
  var lines = out.split('\n');
  const parser = new NitrilePreviewParser();
  const translator = new NitrilePreviewContext(parser);
  parser.read_md_lines(lines);
  await parser.read_mode_async();
  translator.translate_blocks();
  var main = parser.blocks;
  var latex = main.map(x=>x.latex);
  console.log(latex.join('\n'));
  var data = translator.to_context_document();
  console.log(data);
};

work();
