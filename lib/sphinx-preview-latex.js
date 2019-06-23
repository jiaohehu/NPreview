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
    const step = 0.25;
    for (var block of blocks) {
      const [id,row1,row2,type,n,para] = block;
      const left = `${step*n}cm`;
      switch (type) {
        case 'SECT': {
          this.title = this.smooth(para);
          break;
        }
        case 'HDGS': {
          var [cat,text] = para;
          text = this.escape(text);
          switch (cat) {
            case 1: 
              o.push(`\\section{${text}}`);
              o.push('');
              break;
            case 2: 
              o.push(`\\subsection{${text}}`);
              o.push('');
              break;
            default:
              o.push(`\\subsubsection{${text}}`);
              o.push('');
              break;
          }
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
          o.push('\\begin\{flushleft\}')
          var text = '';
          for (text of para) {
            text = this.unmask(text);
            o.push(`${text} \\\\`);
          }
          if (text !== '') {
            o[o.length-1] = text;
          }
          o.push('\\end\{flushleft\}')
          o.push('');
          break;
        }
        case 'DEF1': {
          var [keys,text] = para;
          text = this.unmask(text);
          o.push(`\\begin{description}\[nosep,leftmargin=${left},font=\\normalfont\\bfseries\]`);
          for (var key of keys) {
            key = this.escape(key);
            o.push(`\\item\[${key}\]`);
          }
          if (text) {
            o.push('\\mbox{}\\\\');
            o.push(text);
          }
          o.push(`\\end{description}`);
          o.push('');
          break;
        }
        case 'DEF2': {
          var [keys,text] = para;
          text = this.unmask(text);
          o.push(`\\begin{description}\[nosep,leftmargin=${left},font=\\normalfont\\bfseries\\itshape\]`);
          for (var key of keys) {
            key = this.escape(key);
            o.push(`\\item\[${key}\]`);
          }
          if (text) {
            o.push('\\mbox{}\\\\');
            o.push(text);
          }
          o.push(`\\end{description}`);
          o.push('');
          break;
        }
        case 'DEF3': {
          var [keys,text] = para;
          text = this.unmask(text);
          o.push(`\\begin{description}\[nosep,leftmargin=${left},font=\\normalfont\\ttfamily\\bfseries\]`);
          for (var key of keys) {
            key = this.escape(key);
            o.push(`\\item\[${key}\]`);
          }
          if (text) {
            o.push('\\mbox{}\\\\');
            o.push(text);
          }
          o.push(`\\end{description}`);
          o.push('');
          break;
        }
        case 'PRIM': {
          var [lead,text] = para;
          lead = this.escape(lead); 
          text = this.unmask(text);
          o.push(`\\paragraph{${lead}}`);
          o.push(text);
          o.push('');
          break;
        }
        case 'SECO': {
          var [lead,text] = para;
          lead = this.escape(lead); 
          text = this.unmask(text);
          o.push(`\\subparagraph{${lead}}`);
          o.push(text);
          o.push('');
          break;
        }
        case 'PLST': {
          var items = para;
          var lead0 = '';
          for (item of items) {
            var [lead,value,text] = item;
            if (lead0 === '') {
              lead0 = lead;
            }
            text = this.unmask(text);
            if (item.length === 3) {
              switch (lead) {
                case 'OL': {
                  o.push(`\\begin{compactenum}`);
                  o.push(`\\item\[${value}.\] ${text}`);
                  break;
                }
                case 'UL': {
                  o.push(`\\begin{compactitem}`);
                  o.push(`\\item ${text}`);
                  break;
                }
                case 'LI': {
                  if (value) {
                    o.push(`\\item\[${value}.\] ${text}`);
                  } else {
                    o.push(`\\item ${text}`);
                  }
                  break;
                }
                case '/OL': {
                  o.push(`\\end{compactenum}`);
                  if (value) {
                    o.push(`\\item\[${value}.\] ${text}`);
                  } else {
                    o.push(`\\item ${text}`);
                  }
                  break;
                }
                case '/OL': {
                  o.push(`\\end{compactitem}`);
                  if (value) {
                    o.push(`\\item\[${value}.\] ${text}`);
                  } else {
                    o.push(`\\item ${text}`);
                  }
                  break;
                }
              }
            } else {
              if (lead === '/OL') {
                o.push('\\end{compactenum}');
              } else if (lead === '/UL') {
                o.push('\\end{compactitem}');
              }
            }
          }
          o.push('');
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




