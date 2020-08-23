'use babel';

const { NitrilePreviewBase } = require('./nitrile-preview-base');

class NitrilePreviewFramedTikz extends NitrilePreviewBase {
  constructor(translator){
    super();
    this.translator = translator;
  }
  to_framed(ss,style){
    var o = [];
    var n = ss.length;
    var unit = 12;
    var solid = '\\ '.repeat(80);
    var x = 0;
    var y = 0;
    var anchor = 'south west';
    var fs = '12pt';
    var textcolor = '';
    o.push(`\\draw (${this.fix(x * unit)}pt,${this.fix(y * unit)}pt) node[anchor=${anchor}] {\\ttfamily\\fontsize{${fs}pt}{${fs}pt}\\selectfont{}${textcolor}${solid}};`);
    ss.forEach((s,i) => {
      s = this.translator.polish(s);
      s = s.replace(/\s/g,"~");
      let x = 0;
      let y = i;
      o.push(`\\draw (${this.fix(x * unit)}pt,${this.fix(y * unit)}pt) node[anchor=${anchor}] {\\ttfamily\\fontsize{${fs}pt}{${fs}pt}\\selectfont{}${textcolor}${s}};`);
    });
    var s = o.join('\n');
    let d = [];
    d.push('\\begin{tikzpicture}');
    d.push(s);
    d.push('\\end{tikzpicture}')
    var text = d.join('\n');
    ///style.width
    if (style && style.width) {
      let str = style.width;
      str = this.translator.str_to_latex_length(str);
      text = `\\resizebox{${str}}{!}{${text}}`;
    } else {
      text = text;
    }
    ///fbox
    text = `\\fbox{${text}}`;
    var s = text;
    return {s};
  }
}
module.exports = {NitrilePreviewFramedTikz}