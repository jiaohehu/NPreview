'use babel';

const { NitrilePreviewDiagramMP } = require('./nitrile-preview-diagrammp');


class NitrilePreviewDiagramMF extends NitrilePreviewDiagramMP {

  constructor(translator) {
    super(translator);
  }
  
  ///redefine the 'to_text_label' method because MetaFun has changed its
  ///syntax
  to_tex_label(txt,ts,fontsize){
    txt=txt||'';
    var fs = `${fontsize}pt`;
    if (ts==2) {
      // math text
      var s = this.translator.to_inlinemath(txt);
      var s = `{\\switchtobodyfont[${fs}]${s}}`
    } else if (ts==1){
      // literal text
      var s = this.translator.polish(txt);
      var s = `{\\switchtobodyfont[${fs}]${s}}`
    } else {
      // normal text with symbols
      var s = this.translator.smooth(txt);
      var s = `{\\switchtobodyfont[${fs}]${s}}`
    }
    return `"${s}"`;
  }

}
module.exports = { NitrilePreviewDiagramMF };
