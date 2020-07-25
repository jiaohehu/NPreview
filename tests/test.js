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
    case 'context': {
      var translator = new NitrilePreviewContext(parser);
      translator.translate_blocks();
      var outlines = main.map(x=>x.latex);
      console.log(outlines.join('\n'));
      var data = translator.to_context_document();
      var ofile = `${fname.slice(0,fname.length-path.extname(fname).length)}.tex`;
      await utils.writeFileAsync(ofile,data);
      break;
    }
    case 'lualatex': {
      var translator = new NitrilePreviewLualatex(parser);
      translator.translate_blocks();
      var outlines = main.map(x=>x.latex);
      console.log(outlines.join('\n'));
      var data = translator.to_lualatex_document();
      var ofile = `${fname.slice(0,fname.length-path.extname(fname).length)}.tex`;
      await utils.writeFileAsync(ofile,data);
      break;
    }
    case 'pdflatex': {
      var translator = new NitrilePreviewPdflatex(parser);
      translator.translate_blocks();
      var outlines = main.map(x=>x.latex);
      console.log(outlines.join('\n'));
      var data = translator.to_lualatex_document();
      var ofile = `${fname.slice(0,fname.length-path.extname(fname).length)}.tex`;
      await utils.writeFileAsync(ofile,data);
      break;
    }
    case 'html': {
      var translator = new NitrilePreviewHtml(parser);
      translator.translate_blocks();
      var outlines = main.map(x=>x.html);
      console.log(outlines.join('\n'));
      var data = translator.to_html_document();
      var ofile = `${fname.slice(0,fname.length-path.extname(fname).length)}.html`;
      await utils.writeFileAsync(ofile,data);
      break;
    }
    case 'xhtml': {
      var translator = new NitrilePreviewHtml(parser);
      translator.translate_blocks();
      var outlines = main.map(x=>x.html);
      console.log(outlines.join('\n'));
      var data = translator.to_xhtml_document();
      var ofile = `${fname.slice(0,fname.length-path.extname(fname).length)}.html`;
      await utils.writeFileAsync(ofile,data);
      break;
    }
    case 'epub': {
      var translator = new NitrilePreviewEpub(parser);
      translator.translate_blocks();
      var outlines = main.map(x=>x.html);
      console.log(outlines.join('\n'));
      var data = await translator.to_epub_document_async();
      var ofile = `${fname.slice(0,fname.length-path.extname(fname).length)}.epub`;
      await utils.writeFileAsync(ofile,data);
      break;
    }
    default: 
      break;
  }
};

if(fname){
  work();
}
