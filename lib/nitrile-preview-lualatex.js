'use babel';

const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewDiagramMP } = require('./nitrile-preview-diagrammp');

class NitrilePreviewLualatex extends NitrilePreviewLatex {
  constructor(parser) {
    super(parser);
    this.diagram = new NitrilePreviewDiagramMP(this);
  }
  do_starttranslate(){
    this.fnsmap = new Map();
    var ss = this.conf('lualatex.fonts');
    if(ss){
      var ss = ss.split('\t');
      ss.forEach(x => {
        let [fn,fnt] = x.split(',');
        this.fnsmap.set(fn,fnt); 
      });
    }
  }
  do_diag(block){
    var {lines,wide,notes,caption,label,islabeled} = block;
    lines=lines||[];
    var {s,xm,ym,unit} = this.diagram.to_diagram(lines,notes);
    var d = [];
    d.push('\\begin{mplibcode}');
    d.push('beginfig(1)');
    d.push(`pu := \\mpdim{\\linewidth}/${xm};`);
    d.push(`u := ${unit}mm;`);
    d.push(`ratio := pu/u;`);
    d.push(`picture wheel;`);
    d.push(`wheel := image(`);
    d.push(s);
    d.push(`);`);
    d.push(`draw wheel scaled(ratio);`);
    d.push('endfig')
    d.push('\\end{mplibcode}')
    var text = d.join('\n');
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
  to_lualatex_document() {
    var conflines = this.to_config_lines();
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
\\usepackage{luamplib}
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
