const { NitrilePreviewParser } = require('../lib/nitrile-preview-parser');
const { NitrilePreviewPdflatex } = require('../lib/nitrile-preview-pdflatex');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

var work = async ()=>{
  console.log(fname);
  const parser = new NitrilePreviewParser();
  const translator = new NitrilePreviewPdflatex();
  await parser.read_md_file_async(fname);
  parser.translate_blocks(translator);
  var main = parser.blocks;
  var latex = main.map(x=>x.latex);
  console.log(latex.join('\n'));
  var data = translator.to_pdf_document();
  console.log(data);
};

work();

