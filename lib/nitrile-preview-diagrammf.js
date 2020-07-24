'use babel';

const { NitrilePreviewDiagramMP } = require('./nitrile-preview-diagrammp');


class NitrilePreviewDiagramMF extends NitrilePreviewDiagramMP {

  constructor(translator) {
    super(translator);
  }
  
  ///redefine the 'to_text_label' method because MetaFun has changed its
  ///syntax
  to_tex_label(text){
    text = text.toString();
    var v; if ((v=this.re_inlinemath.exec(text))!==null) {
      var s = this.translator.math_diag(v[1]);
    } else {
      var s = this.translator.escape_for_diag(text);
    }
    return `"${s}"`;
  }

}
module.exports = { NitrilePreviewDiagramMF };
