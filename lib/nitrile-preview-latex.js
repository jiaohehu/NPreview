'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const path = require('path');
const fs = require('fs');
const fontmap = require('./nitrile-preview-fontmap');

class NitrilePreviewLatex extends NitrilePreviewParser {

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
    this.mymapcode = [
      " "  , "~"                   ,
      "\\" , "\\char92{}"          ,
      "|"  , "\\char124{}"         ,
      "*"  , "\\char42{}"          ,
      "?"  , "\\char63{}"          ,
      "~"  , "\\char126{}"         ,
      "^"  , "\\char94{}"          ,
      "<"  , "\\char60{}"          ,
      ">"  , "\\char62{}"          ,
      "\[" , "\\char91{}"          ,
      "\]" , "\\char93{}"          ,
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
    return an array of lines that are the result of converted blocks
  */
  translate (blocks,isarticle,o) {
    this.blocks = blocks;
    o = o || [];
    const step = 0.25;
    for (var block of blocks) {
      this.block = block;
      const [id,row1,row2,type,n,data,para,ins,ins_local,ins_text,fname,plevel] = block;
      const left = `${step*n}cm`;
      if (type.match(/\^%/)) {
        o.push(`\\begin\{Verbatim\}`)
        for (var text of para) {
          o.push(text);
        }
        o.push('\\end\{Verbatim\}')
        o.push('');
        continue
      }
      switch (type) {
        case 'HDGS': {
          var [cat,text] = data;
          text = this.escape(text);
          if (plevel) {
            cat += plevel;
          }
          switch (cat) {
            case 0:
              if (isarticle) {
                this.title = text;
              } else {
                o.push(`\\chapter{${text}}\\label{${id}}`);
                o.push('');
              }
              break;
            case 1:
              o.push(`\\section{${text}}\\label{${id}}`);
              o.push('');
              break;
            case 2:
              o.push(`\\subsection{${text}}\\label{${id}}`);
              o.push('');
              break;
            default:
              o.push(`\\subsubsection{${text}}\\label{${id}}`);
              o.push('');
              break;
          }
          break;
        }
        case 'PICT': {
          /// check to see if we have a caption
          if (ins === 'figure') {
            o.push('\\begin{figure}\[ht\]');
            o.push('\\centering');
            if (ins_local) {
              var base = id.split(':')[0];
              o.push(`\\label{${base}:${ins_local}}`);
            } else {
              o.push(`\\label{${id}}`);
            }
            for (var pp of data) {
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
            o.push(`\\caption{${this.unmask(ins_text)}}`);
            o.push('\\end{figure}');
            o.push('');
          } else {
            o.push('\\begin{flushleft}');
            o.push(`\\begin{adjustwidth}{${left}}{}`);
            for (var pp of data) {
              const [type,opts,srcs,sub] = pp;
              if (type === 'image') {
                var {width,height,frame} = opts;
                if (width) {
                  var v =  width.match(/^(\d+)\%$/);
                  if (v) {
                    width = `${+v[1]/100.0}\\linewidth`;
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
                  var s = '\\frame{s}';
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
          var maxj = this.matrixMaxJ(data);
          if (maxj == 0) {
            maxj = 1;
          }
          for (var i in data) {
            var pp = data[i];
            var pp = this.expandRow(pp,'',maxj);
            data[i] = pp;
          }
          for (var i in data) {
            var pp = data[i];
            var pp = pp.map(x => x.split('\n'));
            var kk = pp.map(x => x.length);
            var kkm = kk.reduce((acc,curr) => acc>curr?acc:curr);
            var pp = pp.map(x => {while(x.length<kkm) x.push(''); return x;});
            data[i] = pp;
          }
          var pp = this.expandRow([],'l',maxj);
          o.push(`\\begin{adjustwidth}{${left}}{}`);
          o.push(`\\begin{xtabular}{|${pp.join('|')}|}`);
          o.push('\\hline');
          for (var pp of data) {
            var kkm = pp[0].length;
            for (var k=0; k < kkm; ++k) {
              var ppk = pp.map(p => p[k]);
              o.push(ppk.join(' & ') + ' \\\\');
              o.push('\\hline');
            }
          }
          if (data.length == 0) {
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
          for (var i=0; i < data.length; i+=2) {
            var dt = data[i];
            var dd = data[i+1];
            dt = this.escape(dt);
            dd = this.unmask(dd);
            o.push(`\\item\[${dt}\] \\mbox{}\\\\`);
            o.push(`${dd}`);
          }
          if (data.length == 0) {
            o.push(`\\item\[(empty)\]`);
          }
          o.push('\\end{description}');
          o.push('\\end{adjustwidth}');
          o.push('\\end{flushleft}')
          o.push('');
          break;
        }
        case 'QUOT': {
          o.push('\\begin{displayquote}');
          o.push(`\\begin{adjustwidth}{${left}}{}`);
          var text = this.unmask(data);
          o.push(text);
          o.push('\\end{adjustwidth}');
          o.push('\\end{displayquote}')
          o.push('');
          break;
        }
        case 'CODE': {
          o.push(`\\begin{flushleft}`);
          o.push(`\\begin\{adjustwidth\}{${left}}{}`)
          for (var i=0; i < data.length; ++i) {
            var text = data[i];
            text = this.replaceSubstrings(text,this.mymapcode);
            if (i === data.length-1) {
              o.push(`\\mbox{\\ttfamily{}${text}}`);

            } else {
              o.push(`\\mbox{\\ttfamily{}${text}}\\\\`);

            }
          }
          o.push('\\end\{adjustwidth\}');
          o.push('\\end\{flushleft\}');
          o.push('');
          break;
        }
        case 'VERB': {
          o.push(`\\begin\{Verbatim\}\[xleftmargin=${left}\]`)
          for (var text of data) {
            o.push(text);
          }
          o.push('\\end\{Verbatim\}')
          o.push('');
          break;
        }
        case 'VRSE': {
          o.push('\\begin\{verse\}')
          o.push(`\\begin\{adjustwidth\}{${left}}{}`)
          var text = '';
          for (text of data) {
            text = this.unmask(text);
            o.push(`${text} \\\\`);
          }
          if (text !== '') {
            o[o.length-1] = text;
          }
          o.push('\\end{adjustwidth}');
          o.push('\\end\{verse\}')
          o.push('');
          break;
        }
        case 'DEF1': {
          var [keys,text,xn] = data;
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
          var [keys,text,xn] = data;
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
          var [keys,text,xn] = data;
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
          var [lead,text] = data;
          lead = this.escape(lead);
          text = this.unmask(text);
          o.push(`\\paragraph{${lead}}`);
          o.push(text);
          o.push('');
          break;
        }
        case 'SECO': {
          var [lead,text] = data;
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
          for (var item of data) {
            var [lead,bullet,text] = item;
            bullet = bullet || '';
            text = text || '';
            if (bullet === '*') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `\\texttt{${this.escape(v[1])}} ${v[2]} ${this.unmask(v[3])}`;
              } else {
                text = this.unmask(text);
              }
              bullet = '';
            } else if (bullet.match(/^\d+\.$/)) {
              bullet = this.chomp(bullet);
              text = this.unmask(text);
            } else {
              bullet = '';
            }
            if (item.length === 3) {
              switch (lead) {
                case 'OL': {
                  o.push(`\\begin{compactenum}`);
                  o.push(`\\item\[${bullet}.\] ${text}`);
                  break;
                }
                case 'UL': {
                  o.push(`\\begin{compactitem}`);
                  o.push(`\\item ${text}`);
                  break;
                }
                case 'LI': {
                  if (bullet) {
                    o.push(`\\item\[${bullet}.\] ${text}`);
                  } else {
                    o.push(`\\item ${text}`);
                  }
                  break;
                }
                case '/OL': {
                  o.push(`\\end{compactenum}`);
                  if (bullet) {
                    o.push(`\\item\[${bullet}.\] ${text}`);
                  } else {
                    o.push(`\\item ${text}`);
                  }
                  break;
                }
                case '/UL': {
                  o.push(`\\end{compactitem}`);
                  if (bullet) {
                    o.push(`\\item\[${bullet}.\] ${text}`);
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
        case 'ERRO': {
          o.push('\\begin{flushleft}');
          o.push('=== ERROR === : ');
          o.push(this.escape(data));
          o.push('\\end{flushleft}');
          o.push('');
          break;
        }
        case '%!BOOK': {
          o.push('\\begin{Verbatim}');
          for (var text of para) {
            o.push(text);
          }
          o.push('\\end{Verbatim}');
          o.push('');
          break;
        }
        default: {
          o.push('\\begin\{flushleft\}')
          o.push(`\\begin\{adjustwidth\}{${left}}{}`)
          o.push(this.unmask(data));
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
        const [cnt,href] = text;
        if (cnt) {
          return `${this.escape(cnt)}(\\href{${href}}{${href}})`
        } else {
          return `\\href{${href}}{${href}}`
        }
        break;
      }
      case 'ruby': {
        const [rb,rt] = text;
        return `\\ruby{${this.escape(rb)}}{${this.escape(rt)}}`
        break;
      }
      case 'ref': {
        return `\\ref{${text}}`;
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

  async toARTICLE (blocks) {
    var o = [];
    var title = 'Untitled';
    var documentclass = 'article';
    var parser = new NitrilePreviewLatex();
    if (blocks.length == 0) {
      return '';
    }
    documentclass = 'article';
    o = parser.translate(blocks,true,o);
    if (parser.title) {
      title = parser.title;
    }
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
\\usepackage{csquotes}
\\title{${title}}
\\begin{document}
\\maketitle
${o.join('\n')}
\\end{document}`;

  },

  async toCHAPTER (blocks) {
    /*
    Convert to a bare document without the header
    */
    var o = [];
    var parser = new NitrilePreviewLatex();
    if (blocks.length == 0) {
      return '';
    }
    o = parser.translate(blocks,0,false,o);
    if (parser.title) {
      title = parser.title;
    }
    return o.join('\n');
  },

  async toBOOK (blocks,dirname) {
    /*
    Generate a LUALATEX BOOK
    */
    var theblock = blocks[0];
    var title = 'Untitled';
    var author = '';
    var documentclass = 'book';
    const [id,row1,row2,type,n,data,para,ins,ins_local,ins_text,fname,plevel] = theblock;
    if (blocks && theblock && type === '%!BOOK') {
      /// great!
    } else {
      throw "Not a #!BOOK block!";
    }
    ///
    /// start a new parser and a new block array
    ///
    var parser = new NitrilePreviewLatex();
    var re_colon = /^(\:{1,})\s+(.*)$/;
    var re_config = /^(\w+)\=(.*)$/;
    var blocks1 = [];

    for (var line of data) {
      var v = re_colon.exec(line);
      if (v) {
        var plevel1 = v[1].length - 1;
        var fname1 = v[2].trim();
        var ffname1 = path.join(dirname,fname1);
        var data1 = await fs.readFileSync(ffname1,'utf8');
        blocks1 = parser.toBLOCKS(data1.split('\n'),fname1,plevel1,blocks1);
        continue;
      }
      var v = re_config.exec(line);
      if (v) {
        var key = v[1];
        var val = v[2].trim();
        switch (key) {
          case 'title': {
            title = val;
            break;
          }
          case 'author': {
            author = val;
            break;
          }
        }
      }
    }
    var lines1 = parser.translate(blocks1,false);
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
\\usepackage{csquotes}
\\title{${title}}
\\author{${author}}
\\begin{document}
\\maketitle
${lines1.join('\n')}
\\end{document}`;

  },

}
