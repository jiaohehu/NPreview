'use babel';

const { SphinxPreviewParser } = require('./sphinx-preview-parser');

class SphinxPreviewLatex extends SphinxPreviewParser {

  constructor() {
    super();
    this.title = 'Untitled';
    this.mymap = [
      "\\" , "\\textbackslash{}"   ,
      "|"  , "\\textbar{}"         ,
      "*"  , "{*}"                 ,
      "?"  , "\\char63{}"          ,
      "~"  , "\\textasciitilde{}"  ,
      "^"  , "\\textasciicircum{}" ,
      "<"  , "{$<$}"               ,
      ">"  , "{$>$}"               ,
      "\[" , "\{\[\}"              ,
      "\]" , "\{\]\}"              ,
      "$"  , "\\$"                 ,
      "#"  , "\\#"                 ,
      "&"  , "\\&"                 ,
      "_"  , "\\_"                 ,
      "%"  , "\\%"                 ,
      "\{" , "\\{"                 ,
      "\}" , "\\}" 
    ];
  }

  /*
    return a string that is the converted text of the 
    input source lines
  */
  toTEXT (lines) {
    var blocks = this.toBLOCKS(lines);
    var o = [];
    for (var block of blocks) {
      const [id,row1,row2,type,n,para] = block;
      switch (type) {
        case 'SECT': {
          this.title = this.smooth(para);
          break;
        }
        case 'CODE': {
          o.push('\\begin\{verbatim\}')
          for (var text of para) {
            o.push(text);
          }
          o.push('\\end\{verbatim\}')
          o.push('');
          break;
        }
        case 'VRSE': {
          break;
        }
        default: {
          o.push('\\begin\{flushleft\}')
          o.push(this.unmask(para));
          o.push('\\end\{flushleft\}')
          o.push('');
          break;
        }
      }
    }
    return o.join('\n');
  }

  /*
    smooth the text
  */
  smooth (text) {
    return this.replaceSubstrings(text,this.mymap);
  }

  /* 
    escape the text
  */
  escape (text) {
    return this.smooth(text);
  }

  /*
    return the styled inline text   
  */
  style (type, text) {
    switch (type) {
      case 'tt': {
        return `\\texttt{${this.smooth(text)}}`
        break;
      }
      case 'em': {
        return `\\emph{${this.smooth(text)}}`
        break;
      }
      case 'strong': {
        return `\\textbf{${this.smooth(text)}}`
        break;
      }
      case 'uri': {
        return `\\href{${this.smooth(text)}}{${this.smooth(text)}}`
        break;
      }
      case 'ruby': {
        const [rb,rt] = text;
        return `\\ruby{${this.smooth(rb)}}{${this.smooth(rt)}}`
        break;
      }
      default: {
        return `{${this.smooth(text)}}`
        break;
      }
    }
  }
}

module.exports = {

  toTEXT (lines) {
    var parser = new SphinxPreviewLatex();
    return parser.toTEXT(lines);
  },
  
  toLUALATEX (lines) {
    var parser = new SphinxPreviewLatex();
    var text = parser.toTEXT(lines);
    var o = [];
    o.push(
`\% \!TEX program = lualatex
\\documentclass{article}
\\usepackage{luatexja-fontspec}
\\usepackage{luatexja-ruby}
\\newjfontfamily\\cn{arplsungtilgb}
\\newjfontfamily\\tw{arplmingti2lbig5}
\\newjfontfamily\\jp{ipaexmincho}
\\newjfontfamily\\kr{baekmukbatang}
\\usepackage{graphicx}
\\usepackage{subcaption}
\\usepackage{caption}
\\usepackage{paralist}
\\usepackage{enumitem}
\\usepackage{longtable,tabu}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{mathrsfs}
\\usepackage{changepage}
\\DeclareMathOperator{\\sech}{sech}
\\DeclareMathOperator{\\csch}{csch}
\\DeclareMathOperator{\\arcsec}{arcsec}
\\DeclareMathOperator{\\arccot}{arccot}
\\DeclareMathOperator{\\arccsc}{arccsc}
\\DeclareMathOperator{\\arcosh}{arccosh}
\\DeclareMathOperator{\\arsinh}{arsinh}
\\DeclareMathOperator{\\artanh}{artanh}
\\DeclareMathOperator{\\arsech}{arsech}
\\DeclareMathOperator{\\arcsch}{arcsch}
\\DeclareMathOperator{\\arcoth}{arcoth}
\\usepackage{stmaryrd}
\\usepackage{wasysym}
\\usepackage{textcomp}
\\usepackage{xfrac}
\\usepackage[unicode]{hyperref}
\\usepackage{anyfontsize}
\\usepackage{fancyvrb}
\\usepackage{tikz}
\\usepackage[normalem]{ulem}
\\usepackage{listings}
\\usepackage{quoting}
\\usepackage{xtab}`);

    o.push(`\\title{${parser.title}}`);
    o.push(`\\begin{document}`);       
    o.push(`\\maketitle`);
    o.push(text);
    o.push(`\\end{document}`);       
    return o.join('\n');

  },

}




