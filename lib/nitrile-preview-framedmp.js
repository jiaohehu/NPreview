'use babel';

const { NitrilePreviewBase } = require('./nitrile-preview-base');

class NitrilePreviewFramedMP extends NitrilePreviewBase {
  constructor(translator){
    super();
    this.translator = translator;
  }
  to_framed(ss){
    var o = [];
    var n = ss.length;
    var solid = '\\ '.repeat(80);
    o.push(`\\begin{mplibcode}`);
    o.push(`numeric o; o := 12pt;`);
    o.push(`draw (1*o,0)--(1*o,-${n-1}*o) withpen pencircle withcolor white;`);
    o.push(`label.rt(btex {\\ttfamily\\fontsize{12pt}{12pt}\\selectfont{}${solid}} etex, (0,0));`);
    ss.forEach((x,i) => {
      x = this.translator.polish(x);
      o.push(`label.rt(btex {\\ttfamily\\fontsize{12pt}{12pt}\\selectfont{}${x}} etex, (0,-${i}*o));`);
    });
    o.push(`endfig`);
    o.push(`\\end{mplibcode}`);
    var s = o.join('\n');
    return {s};
  }
}
module.exports = {NitrilePreviewFramedMP}