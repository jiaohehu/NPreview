'use babel';

const { NitrilePreviewLatex } = require('./nitrile-preview-latex');

class NitrilePreviewXelatex extends NitrilePreviewLatex {

  constructor(parser) {
    super(parser);
  }
  do_starttranslate(){
    super.do_starttranslate();
  }
  to_xelatex_document() {
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
    var p_core_packages=this.to_core_packages();
    var p_extra_packages = this.to_extra_packages();
    var p_layout=this.to_geometry_layout();
    var p_fonts = this.to_xelatex_fonts();
    var p_linebreaklocale = this.conf('xelatex.linebreaklocale');
    return     `\
%!TeX program=XeLatex
\\documentclass[${p_documentclassopt||''}]{${p_documentclass}}
\\usepackage{ucs}
\\usepackage[utf8x]{inputenc}
\\usepackage{fontspec}
${p_core_packages}
${p_extra_packages}
\\usepackage{unicode-math}
${p_layout}
${p_fonts}
\\XeTeXlinebreaklocale "${p_linebreaklocale}"
\\begin{document}
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
\\end{document}
`;
  }
  to_xelatex_fonts () {
    var ss = this.conf('xelatex.fonts');
    if(ss){
      ss = ss.split('\t');
      ss = ss.map(s => {
        let [fn,fnt] = s.split(',').map(x => x.trim());
        return `\\newcommand{\\${fn}}[1]{{\\fontspec{${fnt}}#1}}`;
      });
      ss = ss.filter(x => x.length);
      return ss.join('\n');
    }
    return '';
  }
}
module.exports = { NitrilePreviewXelatex }
