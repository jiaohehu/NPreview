'use babel';

const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewDiagramMP } = require('./nitrile-preview-diagrammp');

class NitrilePreviewLualatex extends NitrilePreviewLatex {
  constructor(parser) {
    super(parser);
  }
  do_starttranslate(){
    super.do_starttranslate();
  }
  to_lualatex_document() {
    if (1) {
      this.imgs.forEach(src => {
        console.log(src);
      })
    }
    var texlines = this.parser.blocks.map(x => x.latex);
    var titlelines = this.to_titlelines();
    var toclines = this.to_toclines();
    var p_documentclass = this.to_documentclass();
    var p_documentclassopt = this.to_documentclassopt();
    var p_core_packages = this.to_core_packages();
    var p_extra_packages = this.to_extra_packages();
    var p_layout = this.to_geometry_layout();
    var p_fonts = this.to_lualatex_fonts();
    return     `\
%!TeX program=LuaLatex
\\documentclass[${p_documentclassopt||''}]{${p_documentclass}}
\\usepackage{fontspec}
\\usepackage{ruby}
${p_core_packages}
${p_extra_packages}
\\usepackage{unicode-math}
${p_layout}
${p_fonts}
\\begin{document}
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
\\end{document}
`;
  }
  to_lualatex_fonts () {
    var ss = this.conf('lualatex.fonts');
    if(ss){
      ss = ss.split('\t');
      ss = ss.map(s => {
        let [fn,fnt] = s.split(',');
        return `\\newfontfamily\\${fn}{${fnt}}`;
      });
      ss = ss.filter(x => x.length);
      return ss.join('\n');
    }
    return '';
  }
}
module.exports = { NitrilePreviewLualatex };
