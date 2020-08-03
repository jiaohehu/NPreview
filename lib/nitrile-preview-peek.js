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
  ///override the one from *-html.js
  to_request_image(imgsrc){
    var { imgsrc, imgid } = this.view.query_imagemap_info(imgsrc);
    return {imgsrc,imgid}
  }
  ///override the one from *-html.js
  do_starttranslate(){
    //this.tokenizer.fs = this.view.get_body_font_size_pt();
  }
}
module.exports = { NitrilePreviewPeek };
