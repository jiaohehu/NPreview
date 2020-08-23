'use babel';

const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const unijson = require('./nitrile-preview-unicode');

class NitrilePreviewBeamer extends NitrilePreviewLatex {

  constructor(parser) {
    super(parser);
    this.frames = 0;
    this.ending = '';
  }
  to_conf_step(){
    return this.conf('latex.step','5mm');
  }
  do_starttranslate(){
    this.fnsmap = new Map();
    if(this.conf('latex.fonts')){
      var ss = this.conf('latex.fonts').split('\t');
      ss.forEach(x => {
        let [fn,fnt] = ss.split(',');
        this.fnsmap.set(fn,fnt); 
      });
    }
  }
  do_endtranslate(){
    var o = [];
    if(this.frames){
      o.push(`\\end{frame}`); 
    }
    this.ending = o.join('\n');
  }
  do_identify(block,A){
  }
  do_part(block){
  }
  do_hdgs(block){
    var {hdgn,text,name,subn,label,parser} = block;
    var text = this.unmask(text);//note that it might have something like \jp
                                 //which is fine because the "bookmark" package 
                                 //will remove it

    if(hdgn == 1){
      var o = [];
      if(this.frames){
        o.push(`\\end{frame}`); 
        o.push('');
      }
      o.push(`\\begin{frame}`);
      o.push(`\\frametitle{${text}}`);
      block.latex = o.join('\n');
      this.frames = 1;
    }
  }
  to_beamer_document() {
    var p_core_packages = this.to_core_packages();
    var p_extra_packages = this.to_extra_packages();
    var texlines = this.parser.blocks.map(x => x.latex);
    var titlelines = this.to_titlelines();
    var toclines = this.to_toclines();
    var p_core_packages = this.to_core_packages();
    var p_extra_packages = this.to_extra_packages();

    return     `\
%!TeX program=PdfLatex
\\documentclass{beamer}
\\usepackage[utf8x]{inputenc}
\\usepackage[T1]{fontenc}
${p_core_packages}
${p_extra_packages}
\\begin{document}
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
${this.ending}
\\end{document}
`;
  }
}
module.exports = { NitrilePreviewBeamer }
