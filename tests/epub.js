const { NitrilePreviewParser } = require('../lib/nitrile-preview-parser');
const { NitrilePreviewEpub } = require('../lib/nitrile-preview-epub');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];

var work = async ()=>{
  console.log(fname);
  var out = await utils.readFileAsync(fname);
  var lines = out.split('\n');
  const parser = new NitrilePreviewParser();
  parser.read_md_lines(lines);
  var translator = new NitrilePreviewEpub();
  parser.translate_blocks(translator);
  var main = parser.blocks;
  var htmls = main.map(x=>x.html);
  console.log(htmls.join('\n'));

  /// now construct a Context document
  const data = await translator.to_epub_document_async();
};

work();
