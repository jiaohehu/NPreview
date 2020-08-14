'use babel';

const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewDiagramTikz } = require('./nitrile-preview-diagramtikz');
const { NitrilePreviewLmath } = require('./nitrile-preview-lmath');

class NitrilePreviewXelatex extends NitrilePreviewLatex {

  constructor(parser) {
    super(parser);
    this.diagram = new NitrilePreviewDiagramTikz(this);
  }
  do_starttranslate(){
    this.fnsmap = new Map();
    var ss = this.conf('xelatex.fonts');
    if(ss){
      var ss = ss.split('\t');
      ss.forEach(x => {
        let [fn,fnt] = x.split(',');
        this.fnsmap.set(fn,fnt); 
      });
    }
  }
  to_xelatex_document() {
    var conflines = this.to_config_lines();
    var texlines = this.parser.blocks.map(x => x.latex);
    var titlelines = this.to_titlelines();
    var toclines = this.to_toclines();
    var p_documentclass = this.to_documentclass();
    var p_documentclassopt = this.to_documentclassopt();
    var p_layout=this.to_layout();
    var p_packages=this.to_core_packages();
    var p_extra_packages = this.to_extra_packages();
    var p_fonts = this.to_xelatex_fonts();
    var p_linebreaklocale = this.conf('xelatex.linebreaklocale');
    return     `\
%!TeX program=XeLatex
\\documentclass[${p_documentclassopt||''}]{${p_documentclass}}
\\usepackage{ucs}
\\usepackage[utf8x]{inputenc}
\\usepackage{fontspec}
${p_layout}
${p_packages}
\\usepackage{unicode-math}
\\usepackage{tikz}
${p_extra_packages}
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
  /* override from super */
  do_diag(block){
    var {lines,wide,notes,caption,label,islabeled} = block;
    lines=lines||[];
    var {s,xm,ym,unit} = this.diagram.to_diagram(lines,notes);
    var d = [];
    d.push('\\begin{tikzpicture}');
    d.push(s);
    d.push('\\end{tikzpicture}')
    var text = d.join('\n');
    text = `\\resizebox{\\linewidth}{!}{${text}}`;
    var star = wide?'*':'';
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    if(islabeled){
      o.push(`\\begin{figure${star}}[ht]`);
      o.push(`\\centering`);
      if(1){
        var caption_text = (this.unmask(caption));
        o.push(`\\caption{${caption_text}}`);
      }
      if(label){
        o.push(`${this.to_latexlabelcmd(label)}`);
      }
    }else{
      o.push(`\\begin{center}`);
    }
    o.push(text);
    if(islabeled){
      o.push(`\\end{figure${star}}`);
    }else{
      o.push(`\\end{center}`);
    }
    block.latex = o.join('\n');
  }
}
module.exports = { NitrilePreviewXelatex }
