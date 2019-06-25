'use babel';

const { SphinxPreviewParser } = require('./sphinx-preview-parser');
const path = require('path');
const fs = require('fs');
const fontmap = require('./sphinx-preview-fontmap');

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
  toTEXT (blocks,plevel,isarticle,o) {
    const step = 0.25;
    for (var block of blocks) {
      const [id,row1,row2,type,n,para] = block;
      const left = `${step*n}cm`;
      switch (type) {
        case 'HDGS': {
          var [cat,text] = para;
          text = this.escape(text);
          cat += plevel;
          switch (cat) {
            case 0: 
              if (isarticle) {
                this.title = text;
              } else {
                o.push(`\\chapter{${text}}`);
                o.push('');
              }
              break;
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
        case 'PICT': {
          /// check to see if we have a caption
          var [caption,images] = para;
          if (caption) {
            o.push('\\begin{figure}\[ht\]');
            for (var pp of images) {
              const [type,opts,srcs,sub] = pp;
              var src = srcs[0];
              if (type === 'image') {
                var {width} = opts;
                if (!width) { width = '1in' }
                o.push(`\\begin{subfigure}\[b\]{${width}}`);
                o.push(`\\includegraphics\[width=\\textwidth\]{${src}}`);
                o.push(`\\caption{${this.unmask(sub)}}`);
                o.push(`\\end{subfigure}`);
              }
            }
            o.push(`\\caption{${this.unmask(caption)}}`);
            o.push('\\end{figure}');
            o.push('');
          } else {
            o.push('\\begin{flushleft}');
            o.push(`\\begin{adjustwidth}{${left}}{}`);
            for (var pp of para) {
              const [type,opts,srcs,sub] = pp;
              if (type === 'image') {
                var {width,height,frame} = opts;
                if (width) {
                  if(width === '100%') {
                    width = '\\linewidth';
                  }
                }
                var s = '';
                if (width && height) {
                  var s = `\\includegraphics\[width=${width},height=${height}\]{${srcs[0]}}`;
                } else if (width) {
                  var s = `\\includegraphics\[width=${width}\]{${srcs[0]}}`;
                } else if (height) {
                  var s = `\\includegraphics\[height=${height}\]{${srcs[0]}}`;
                } 
                if (s && frame === '1') {
                  var s = '\\frame{$s}';
                }
                o.push(s);
              }
            }
            o.push('\\end{adjustwidth}');
            o.push('\\end{flushleft}')
            o.push('');
          }
          break;
        }
        case 'TABB': {
          var maxj = this.matrixMaxJ(para);
          if (maxj == 0) {
            maxj = 1;
          }
          for (var i in para) {
            var pp = para[i];
            var pp = this.expandRow(pp,'',maxj);
            para[i] = pp;
          }
          for (var i in para) {
            var pp = para[i];
            var pp = pp.map(x => x.split('\n'));
            var kk = pp.map(x => x.length);
            var kkm = kk.reduce((acc,curr) => acc>curr?acc:curr);
            var pp = pp.map(x => {while(x.length<kkm) x.push(''); return x;});
            para[i] = pp;
          }
          var pp = this.expandRow([],'l',maxj);
          o.push(`\\begin{adjustwidth}{${left}}{}`);
          o.push(`\\begin{xtabular}{|${pp.join('|')}|}`);
          o.push('\\hline');
          for (var pp of para) { 
            var kkm = pp[0].length;
            for (var k=0; k < kkm; ++k) {
              var ppk = pp.map(p => p[k]);
              o.push(ppk.join(' & ') + ' \\\\');
              o.push('\\hline');
            }
          }
          if (para.length == 0) {
            o.push('(empty)\\\\');
          }
          o.push('\\end{xtabular}');
          o.push('\\end{adjustwidth}');
          o.push('');
          break;
        }
        case 'TERM': {
          o.push('\\begin{flushleft}');
          o.push(`\\begin{adjustwidth}{${left}}{}`);
          o.push(`\\begin{description}\[nosep,font=\\ttfamily]`);
          for (var i=0; i < para.length; i+=2) {
            var dt = para[i]; 
            var dd = para[i+1]; 
            dt = this.escape(dt);
            dd = this.unmask(dd);
            o.push(`\\item\[${dt}\] \\mbox{}\\\\`);
            o.push(`${dd}`);
          }
          if (para.length == 0) {
            o.push(`\\item\[(empty)\]`);
          }
          o.push('\\end{description}');
          o.push('\\end{adjustwidth}');
          o.push('\\end{flushleft}')
          o.push('');
          break;
        }
        case 'CODE': {
          o.push(`\\begin\{Verbatim\}\[xleftmargin=${left}\]`)
          for (var text of para) {
            o.push(text);
          }
          o.push('\\end\{Verbatim\}')
          o.push('');
          break;
        }
        case 'VRSE': {
          o.push('\\begin\{flushleft\}')
          o.push(`\\begin\{adjustwidth\}{${left}}{}`)
          var text = '';
          for (text of para) {
            text = this.unmask(text);
            o.push(`${text} \\\\`);
          }
          if (text !== '') {
            o[o.length-1] = text;
          }
          o.push('\\end{adjustwidth}');
          o.push('\\end\{flushleft\}')
          o.push('');
          break;
        }
        case 'DEF1': {
          var [keys,text,xn] = para;
          var xleft = `${step*xn}cm`;
          text = this.unmask(text);
          o.push(`\\begin{description}\[leftmargin=${xleft},font=\\normalfont\\bfseries\]`);
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
          var [keys,text,xn] = para;
          var xleft = `${step*xn}cm`;
          text = this.unmask(text);
          o.push(`\\begin{description}\[leftmargin=${xleft},font=\\normalfont\\bfseries\\itshape\]`);
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
          var [keys,text,xn] = para;
          var xleft = `${step*xn}cm`;
          text = this.unmask(text);
          o.push(`\\begin{description}\[leftmargin=${xleft},font=\\normalfont\\ttfamily\\bfseries\]`);
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
          o.push('\\begin\{flushleft\}')
          o.push(`\\begin\{adjustwidth\}{${left}}{}`)
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
          o.push(`\\end{adjustwidth}`);
          o.push('\\end\{flushleft\}')
          o.push('');
          break;
        }
        default: {
          o.push('\\begin\{flushleft\}')
          o.push(`\\begin\{adjustwidth\}{${left}}{}`)
          o.push(this.unmask(para));
          o.push(`\\end{adjustwidth}`);
          o.push('\\end\{flushleft\}')
          o.push('');
          break;
        }
      }
    }
    return o;
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
    var text = this.smooth(text);
    var text = this.fontifyLATEX(text);
    return text;
  }

  /*
    return the styled inline text   
  */
  style (type, text) {
    switch (type) {
      case 'tt': {
        return `\\texttt{${this.escape(text)}}`
        break;
      }
      case 'em': {
        return `\\emph{${this.escape(text)}}`
        break;
      }
      case 'strong': {
        return `\\textbf{${this.escape(text)}}`
        break;
      }
      case 'uri': {
        return `\\href{${this.escape(text)}}{${this.escape(text)}}`
        break;
      }
      case 'ruby': {
        const [rb,rt] = text;
        return `\\ruby{${this.escape(rb)}}{${this.escape(rt)}}`
        break;
      }
      default: {
        return `{${this.escape(text)}}`
        break;
      }
    }
  }
}

module.exports = {

  async toLUALATEX (lines,dirname) {
    var o = [];
    var title = 'Untitled';
    var documentclass = 'article';
    var parser = new SphinxPreviewLatex();

    var blocks = parser.toBLOCKS(lines);

    /// if no block at all, then return empty string
    if (blocks.length == 0) {
      return '';
    }

    /// if the first block is 'BOOK', then we only process
    /// this block
    const [id,row1,row2,type,n,para] = blocks[0];
    if (type === 'BOOK') {
      documentclass = 'book';
      for (var line of para) {
        var re = /^\s*(\:{1,})\s+(.*)$/;
        var v = re.exec(line);
        var fname = undefined;
        var text = undefined;
        var plevel = 0;
        if (v) { 
          if (/^\"(.*)\"$/.test(v[2])) {
            text = v[2];
            text = text.slice(1,text.length-1);
          } else {
            fname = v[2];
          }
          if (v[1] === ':') {
            plevel = 0;
          } else {
            plevel = v[1].length - 1;
          }
          if (fname) {
            var fullfname = path.join(dirname,fname);
            try {
              var data = await fs.readFileSync(fullfname,'utf8');
              var s_lines = data.split('\n');
              var s_blocks = parser.toBLOCKS(s_lines);
              o = parser.toTEXT(s_blocks,plevel,false,o);
            } catch(e) {
              o.push('\\begin{flushleft}');
              o.push(`'${''+e}' cannot be located`);
              o.push('\\end{flushleft}');
              o.push('');
            }
          }
        }
      }
    } else { 
      documentclass = 'article';
      o = parser.toTEXT(blocks,0,true,o);
      if (parser.title) {
        title = parser.title;
      }
    }

    /// return the content of the the entire Lualatex document
    /// as a single string
    return `\% \!TEX program = lualatex
\\documentclass{${documentclass}}
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
\\usepackage{xtab}
\\title{${title}}
\\begin{document}
\\maketitle
${o.join('\n')}
\\end{document}`;

  },

}




