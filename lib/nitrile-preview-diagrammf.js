'use babel';

const { NitrilePreviewDiagramMP } = require('./nitrile-preview-diagrammp');


class NitrilePreviewDiagramMF extends NitrilePreviewDiagramMP {

  constructor(translator) {
    super(translator);
  }
  
  ///redefine the 'to_text_label' method because MetaFun has changed its
  ///syntax
  to_tex_label(txt,ts){
    txt=txt||'';
    var fs = `${this.translator.conf('diagfontsizept')}pt`;
    if (ts == 2) {//math
      /// return something like: \math{A_0+B_0}
      var s = this.translator.to_inlinemath(txt);
      var s = `{\\switchtobodyfont[${fs}]${s}}`
    } else if (ts == 1) {//var
      ///return something like: A_0+B_0
      var s = this.translator.polish(txt);
      var s = `{\\switchtobodyfont[${fs}]${s}}`
    } else {
      ///return sth like: $A_0$+$B_0$
      var s = this.translator.smooth(txt);
      var s = `{\\switchtobodyfont[${fs}]${s}}`
    }
    return `"${s}"`;
  }

}
module.exports = { NitrilePreviewDiagramMF };
