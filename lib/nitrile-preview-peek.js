'use babel';

const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');
const { NitrilePreviewDiagramSVG } = require('./nitrile-preview-diagramsvg');
const const_partnums = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'IIX', 'IX', 'X'];
const const_subfignums = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

class NitrilePreviewPeek extends NitrilePreviewHtml {

  constructor(parser) {
    super(parser);
  }
  set_view (view) {
    this.view = view;
  }
  to_peek_document(){
    ///do translate
    let A = {};
    let block0 = null;
    this.parser.blocks.forEach(block => {
      if (!A.count) {
        A.count = 1;
        A.chapters = 0;
        A.sections = 0;
        A.subsections = 0;
        A.subsubsections = 0;
        A.parts = 0;
        A.id = 0;///ID for CSS
        A.floats = new Map();
      }
      var { sig, hdgn } = block;
      /// generate css ID
      A.id++;
      block.id = A.id;
      /// generate 'idnum'
      if (sig == 'HDGS') {
        let idnum;
        if(hdgn == 1) {
          A.sections++;
          A.subsections = 0;
          A.subsubsections = 0;
          idnum = `${A.sections}`;
        } else if (hdgn == 2) {
          A.subsections++;
          A.subsubsections = 0;
          idnum = `${A.sections}.${A.subsections}`;
        } else {
          A.subsubsections++;
          idnum = `${A.sections}.${A.subsections}.${A.subsubsections}`;
        }
        block.style.idnum = idnum;
        block.style.idtext = '';
      } else if (block && block.style && block.style.floatname) {
        if (!A.floats.has(block.style.floatname)) {
          A.floats.set(block.style.floatname, 0);
        }
        let idnum = A.floats.get(block.style.floatname);
        idnum += 1;
        A.floats.set(block.style.floatname, idnum);
        block.style.idnum = idnum;
        block.style.idtext = block.style.floatname;
      }
      block0 = block;
    })
    this.parser.blocks.forEach(block => {
      switch (block.sig) {
        case 'PART': this.do_PART(block); break;
        case 'HDGS': this.do_HDGS(block); break;
        case 'SAMP': this.do_SAMP(block); break;
        case 'PRIM': this.do_PRIM(block); break;
        case 'TEXT': this.do_TEXT(block); break;
        case 'PLST': this.do_PLST(block); break;
        case 'HRLE': this.do_HRLE(block); break;
        case 'FLOA': this.do_FLOA(block); break;
        default: break;
      }
    })
    let htmls = this.parser.blocks.map(x => x.html);
    return htmls.join('\n');
  }
  ///override the one from *-html.js
  to_request_image(imgsrc){
    var { imgsrc, imgid } = this.view.query_imagemap_info(imgsrc);
    return {imgsrc,imgid}
  }
  ///over the one from *-html.js
  to_bodyfontsize(){
    var fontsize = atom.config.get('nitrile-preview.bodyFontSize');
    if(fontsize){
      return fontsize;
    }else{
      return 12;
    }
  }
  ///over the one from *-html.js
  to_mathfontsize(){
    var fontsize = atom.config.get('nitrile-preview.mathFontSize');
    if(fontsize){
      return fontsize;
    }else{
      return 12;
    }
  }

}
module.exports = { NitrilePreviewPeek };
