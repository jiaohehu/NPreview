'use babel';

const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewDiagramMP } = require('./nitrile-preview-diagrammp');
const { NitrilePreviewLmath } = require('./nitrile-preview-lmath');
const {fontmap, fontnames} = require('./nitrile-preview-fontmap');

class NitrilePreviewXecjk extends NitrilePreviewLatex {

  constructor(parser) {
    super(parser);
  }
  do_starttranslate(){
    this.fnsmap = new Map();
    var ss = this.conf('xecjk.fonts');
    if(ss){
      var ss = ss.split('\t');
      ss.forEach(x => {
        let [fn,fnt] = x.split(',');
       console.log('james','fnsmap',fn,fnt);
        this.fnsmap.set(fn,fnt); 
      });
    }
  }
  to_xecjk_document() {
    var conflines = this.to_config_lines();
    var texlines = this.parser.blocks.map(x => x.latex);
    var titlelines = this.to_titlelines();
    var toclines = this.to_toclines();
    var p_documentclass = this.to_documentclass();
    var p_documentclassopt = this.to_documentclassopt();
    var p_layout=this.to_geometry_layout();
    var p_core_packages=this.to_core_packages();
    var p_extra_packages = this.to_extra_packages();
    var p_main_fonts = this.to_xecjk_main_fonts();
    var p_extra_fonts = this.to_xecjk_extra_fonts();
    return     `\
%!TeX program=XeLatex
\\documentclass[${p_documentclassopt||''}]{${p_documentclass}}
\\usepackage{ucs}
\\usepackage[utf8x]{inputenc}
\\usepackage{fontspec}
\\usepackage{xeCJK}
\\usepackage{ruby}
${p_core_packages}
${p_extra_packages}
\\usepackage{unicode-math}
${p_layout}
${p_main_fonts}
${p_extra_fonts}
\\begin{document}
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
\\end{document}
`;
  }
  to_xecjk_main_fonts(){
    ///mainfont, sansfont, and monofont
    /// \setCJKmainfont{UnGungseo.ttf}
    /// \setCJKsansfont{UnGungseo.ttf}
    /// \setCJKmonofont{gulim.ttf}
    var p_mainfont=this.conf('xecjk.mainfont');
    var p_sansfont=this.conf('xecjk.sansfont');
    var p_monofont=this.conf('xecjk.monofont');
    if(p_mainfont){ p_mainfont=`\\setCJKmainfont{${p_mainfont}}`; }
    if(p_sansfont){ p_sansfont=`\\setCJKsansfont{${p_sansfont}}`; }
    if(p_monofont){ p_monofont=`\\setCJKmonofont{${p_monofont}}`; }
    var p = [p_mainfont,p_sansfont,p_monofont];
    p = p.filter(x => x.length);
    console.log('james',p);
    return p.join('\n');
  }
  to_xecjk_extra_fonts () {
    var ss = this.conf('xecjk.fonts');
    if(ss){
      ss = ss.split('\t');
      ss = ss.map(s => {
        let [fn,fnt] = s.split(',');
        ///\newCJKfontfamily[kr]\kr{AppleGothic}
        return `\\newCJKfontfamily[${fn}]\\${fn}{${fnt}}`;
      });
      ss = ss.filter(x => x.length);
      return ss.join('\n');
    }
    return '';
  }
}
module.exports = { NitrilePreviewXecjk }
