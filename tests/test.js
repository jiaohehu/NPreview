const { NitrilePreviewParser } = require('../lib/nitrile-preview-parser');
const { NitrilePreviewContext } = require('../lib/nitrile-preview-context');
const { NitrilePreviewLualatex } = require('../lib/nitrile-preview-lualatex');
const { NitrilePreviewPdflatex } = require('../lib/nitrile-preview-pdflatex');
const { NitrilePreviewHtml } = require('../lib/nitrile-preview-html');
const { NitrilePreviewEpub } = require('../lib/nitrile-preview-epub');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const opt = process.argv[2];
const fname = process.argv[3];
console.log('opt',opt);
console.log('fname',fname);

var work = async ()=>{
  var out = await utils.readFileAsync(fname);
  var lines = out.split('\n');
  const parser = new NitrilePreviewParser();
  parser.read_md_lines(lines);
  await parser.read_mode_async();
  switch(opt){
    case 'context':
      let translator = new NitrilePreviewContext(parser);
      translator.translate_blocks();
      let outlines = main.map(x=>x.latex);
      console.log(outlines.join('\n'));
      let data = translator.to_context_document();
      let ofile = `${fname.slice(0,fname.length-path.extname(fname).length)}.tex`;
      await utils.writeFileAsync(ofile,data);
      break;
    case 'lualatex':
      let translator = new NitrilePreviewLualatex(parser);
      translator.translate_blocks();
      let outlines = main.map(x=>x.latex);
      console.log(outlines.join('\n'));
      let data = translator.to_lualatex_document();
      let ofile = `${fname.slice(0,fname.length-path.extname(fname).length)}.tex`;
      await utils.writeFileAsync(ofile,data);
      break;
    case 'pdflatex':
      let translator = new NitrilePreviewPdflatex(parser);
      translator.translate_blocks();
      let outlines = main.map(x=>x.latex);
      console.log(outlines.join('\n'));
      let data = translator.to_lualatex_document();
      let ofile = `${fname.slice(0,fname.length-path.extname(fname).length)}.tex`;
      await utils.writeFileAsync(ofile,data);
      break;
    case 'html':
      let translator = new NitrilePreviewHtml(parser);
      translator.translate_blocks();
      let outlines = main.map(x=>x.html);
      console.log(outlines.join('\n'));
      let data = translator.to_html_document();
      let ofile = `${fname.slice(0,fname.length-path.extname(fname).length)}.html`;
      await utils.writeFileAsync(ofile,data);
      break;
    case 'xhtml':
      let translator = new NitrilePreviewHtml(parser);
      translator.translate_blocks();
      let outlines = main.map(x=>x.html);
      console.log(outlines.join('\n'));
      let data = translator.to_xhtml_document();
      let ofile = `${fname.slice(0,fname.length-path.extname(fname).length)}.html`;
      await utils.writeFileAsync(ofile,data);
      break;
    case 'epub':
      let translator = new NitrilePreviewEpub(parser);
      translator.translate_blocks();
      let outlines = main.map(x=>x.html);
      console.log(outlines.join('\n'));
      let data = await translator.to_epub_document_async();
      let ofile = `${fname.slice(0,fname.length-path.extname(fname).length)}.epub`;
      await utils.writeFileAsync(ofile,data);
      break;
    default: 
      break;
  }
};

work();
