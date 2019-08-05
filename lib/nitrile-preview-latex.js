'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const path = require('path');
const fs = require('fs');
const fontmap = require('./nitrile-preview-fontmap');
const N_lstlisting_numbers_xleftmargin = 0.75;/// additional left margin for when lstlisting is numbered
const C_textrightarrow = String.fromCharCode(8594);

class NitrilePreviewLatex extends NitrilePreviewParser {

  constructor() {
    super();
    this.mymap = [
      "’"  , "'"                   ,
      "“"  , "\""                  ,
      "”"  , "\""                  ,
      "\\" , "\\textbackslash{}"   ,
      "|"  , "\\textbar{}"         ,
      "*"  , "{*}"                 ,
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
      "\}" , "\\}"                 ,
      "-" , "-{}"
    ];
    this.mymapcode = [
      " "  , "~"                   ,
      "’"  , "'"                   ,
      "“"  , "\""                  ,
      "”"  , "\""                  ,
      "\\" , "\\char92{}"          ,
      "|"  , "\\char124{}"         ,
      "*"  , "\\char42{}"          ,
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
    this.mymapsmpl = [
      C_textrightarrow, "\\textrightarrow{}",
      " "  , "~"                   ,
      "’"  , "'"                   ,
      "“"  , "\""                  ,
      "”"  , "\""                  ,
      "\\" , "\\char92{}"          ,
      "|"  , "\\char124{}"         ,
      "*"  , "\\char42{}"          ,
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

  translateLatex (autonum,config,blocks,isarticle,subrow,plevel,o) {

    /// the 'blocks' argument is an array of blocks; the 'isarticle'
    /// is a Boolean type set to true only when generating an 'article'
    /// document type, such that HDGS/0 will be treated as the title
    /// of the document and not a chapter.

    ///this.blocks = blocks; /// this line is probably not needed
    /// as it was used before to search for a ref-id given a filename
    o = o || [];
    this.block = [];
    this.config = config;
    this.isarticle = isarticle;
    for (var block of blocks) {
      const [id,row1,row2,sig,n,data,para,fencecmd,caption,base,label,fname] = block;
      this.block = block;
      this.base = base;
      const left = n*config.latexstepmargin;
      const label_text = (label) ? `\\label{${label}}` : '';
      const [dept,fig] = autonum.idenBlock(config,block,plevel,isarticle);
      switch (sig) {
        case 'PART': {
          var text = data;
          o.push(`\\part{${text}}`);
          o.push('');
          break;
        }
        case 'HDGS': {
          var [cat,text] = data;
          text = this.escape(text);
          if (plevel) {
            cat += plevel;
          }
          if (cat == 0 && isarticle) {
            break;
          }
          switch (cat) {
            case 0:
              o.push(`\\chapter{${text}}${label_text}`);
              o.push('');
              break;
            case 1:
              o.push(`\\section{${text}}${label_text}`);
              o.push('');
              break;
            case 2:
              o.push(`\\subsection{${text}}${label_text}`);
              o.push('');
              break;
            case 3:
              o.push(`\\subsubsection{${text}}${label_text}`);
              o.push('');
              break;
            case 4:
              o.push(`\\paragraph{${text}}${label_text}`);
              o.push('');
              break;
            default:
              o.push(`\\subparagraph{${text}}${label_text}`);
              o.push('');
              break;
          }
          break;
        }

        case 'SBJT':

          var [cat,text] = data;
          text = this.escape(text);
          o.push('\\medskip');
          o.push('\\begin{center}');
          o.push(`{\\bfseries\\large{}${text}}`);
          o.push('\\smallskip');
          o.push('\\end{center}');
          o.push('');
          break;

        case 'PICT':

          if (fig) {
            var text = this.toFramedFigure(data);
            o.push('\\begin{figure*}\[ht\]');
            if (config.pictframe) {
              o.push('\\fbox{\\begin{minipage}{\\linewidth}');
              o.push('\\centering');
              o.push(text);
              o.push('\\end{minipage}}');
            } else {
              o.push('\\centering');
              o.push(text);
            }
            o.push(`\\caption{${this.unmask(caption)}}${label_text}`);
            o.push('\\end{figure*}');
            o.push('');
            break;

          } else {
            var text = this.toFramedPict(data);
            o.push('\\begin{flushleft}');
            o.push(`\\begin{adjustwidth}{${left}cm}{}`);
            if (config.pictframe) {
              o.push('\\fbox{\\begin{minipage}{\\linewidth}');
              o.push(text);
              o.push('\\end{minipage}}');
            } else {
              o.push(text);
            }
            o.push('\\end{adjustwidth}');
            o.push('\\end{flushleft}')
            o.push('');

          }
          break;

        case 'TABB': {

          var [text,maxj,ww] = data;
          if (!fig && config.latextwocolumn) {
            var r = 1 - 0.015*(maxj-1);
          } else {
            var r = 1 - 0.008*(maxj-1);
          }
          var text = this.toFramedTabb(text, maxj, ww, fencecmd, r);
          if (fencecmd.adjust) {
            ww = this.toPcolumns(maxj,fencecmd.adjust);
          }
          var ww = ww.map( x => `${r*x}` );
          var ww = ww.map( x => `p{${x}\\linewidth}` );
          if (fig) {
            if (this.getBool(fencecmd.tight)) {
              var ll = this.expandList([],maxj,'l');
              o.push(`\\begin{table*}`);
              o.push(`\\caption{${this.unmask(caption)}}${label_text}`);
              o.push(`\\centering`);
              o.push(`\\begin{tabular}{${ll.join('')}}`);
              o.push(text);
              o.push('\\end{tabular}');
              o.push('\\end{table*}');
              o.push('');
            } else {
              o.push(`\\begin{table*}`);
              o.push(`\\caption{${this.unmask(caption)}}${label_text}`);
              o.push(`\\centering`);
              o.push(`\\begin{tabular}{@{}${ww.join('@{~}')}@{}}`);
              o.push(text);
              o.push('\\end{tabular}');
              o.push('\\end{table*}');
              o.push('');
            }
          } else {
            if (this.getBool(fencecmd.tight)) {
              var ll = this.expandList([],maxj,'l');
              o.push(`\\begin{flushleft}`);
              o.push(`\\begin{adjustwidth}{${left}cm}{}`);
              o.push(`\\begin{xtabular}{${ll.join('')}}`);
              o.push(text);
              o.push('\\end{xtabular}');
              o.push('\\end{adjustwidth}');
              o.push('\\end{flushleft}');
              o.push('');
            } else {
              o.push(`\\begin{flushleft}`);
              o.push(`\\begin{adjustwidth}{${left}cm}{}`);
              o.push(`\\begin{xtabular}{@{}${ww.join('@{~}')}@{}}`);
              o.push(text);
              o.push('\\end{xtabular}');
              o.push('\\end{adjustwidth}');
              o.push('\\end{flushleft}');
              o.push('');
            }
          }
          break;
        }
        case 'QUOT': {
          o.push('\\begin{flushleft}');
          o.push(`\\begin{adjustwidth}{${left}cm}{${left}cm}`);
          var text = this.escape(data);
          var text = this.rubify(text);
          if (config.quotquotation) {
            o.push('``')
            o.push(text);
            o.push(`''`);
          } else {
            o.push(text);
          }
          o.push('\\end{adjustwidth}');
          o.push('\\end{flushleft}')
          o.push('');
          break;
        }
        case 'TERM': {
          if (fencecmd.table) {
            var text = data;
            var ll = this.expandList([],2,'L');
            if (fencecmd.adjust) {
              var ww = this.toArray(fencecmd.adjust);
              var ll = this.toXtabularAligns(ll,ww);
            } else {
              var ww = this.toArray('0.3 0.7');
              var ll = this.toXtabularAligns(ll,ww);
            }
            o.push(`\\begin{flushleft}`);
            o.push(`\\begin{adjustwidth}{${left}cm}{}`);
            o.push(`\\begin{xtabular}{${ll.join('')}}`);
            o.push(`\\toprule`);
            for (var i=0; i < text.length; i+=2) {
              var dt = text[i];
              var dd = text[i+1];
              if (i == 0) {
                dt = this.escape(dt);
                dd = this.escape(dd);
                o.push(`\\multicolumn{1}{l}{\\textbf{${dt}}} & \\multicolumn{1}{l}{\\textbf{${dd}}} \\\\`);
                o.push(`\\midrule`);
              } else {
                dt = this.style('mono',dt);
                dd = this.unmask(dd);
                o.push(`${dt} & ${dd} \\\\`);
              }
            }
            o.push(`\\bottomrule`);
            o.push(`\\end{xtabular}`);
            o.push(`\\end{adjustwidth}`);
            o.push(`\\end{flushleft}`);
            o.push('');
          } else {
            var text = data;
            o.push('\\begin{flushleft}');
            o.push(`\\begin{adjustwidth}{${left}cm}{}`);
            o.push(`\\begin{description}\[nosep,style=nextline,font=\\normalfont\\ttfamily]`);
            for (var i=0; i < text.length; i+=2) {
              var dt = text[i];
              var dd = text[i+1];
              dt = this.escape(dt);
              dd = this.unmask(dd);
              o.push(`\\item\[${dt}\] `);
              o.push(`${dd}`);
            }
            if (text.length == 0) {
              o.push(`\\item\[(empty)\]`);
            }
            o.push('\\end{description}');
            o.push('\\end{adjustwidth}');
            o.push('\\end{flushleft}')
            o.push('');
          }
          break;
        }
        case 'EQTN': {
          var text = data;
          var count = text.length;
          if (count == 1) {
            o.push(`\\begin{equation}${label_text}`);
            for (var s of text) {
              o.push(s);
            }
            o.push(`\\end{equation}`);
            o.push('');
          } else if (count > 1) {
            o.push(`\\begin{subequations}${label_text}`);
            o.push(`\\begin{gather}`);
            for (var s of text) {
              o.push(s);
              o.push('\\\\');
            }
            o.pop();
            o.push(`\\end{gather}`);
            o.push(`\\end{subequations}`);
            o.push('');
          }
          break;
        }
        case 'SMPL': {
          var text = this.wrapSample(data,config.latexsampwrap);
          const xleft = config.latexsampmargin;
          o.push(`\\begin{flushleft}`);
          o.push(`\\begin\{adjustwidth\}{${xleft}cm}{}`)
          for (var i=0; i < text.length; ++i) {
            var line = text[i];
            line = this.replaceSubstrings(line,this.mymapsmpl);
            line = this.fontifyLATEX(line);
            var s = `\\mbox{\\ttfamily{}${line}}`;
            o.push(`${s}\\\\`);
          }
          if (i > 0) {
            o.pop();
            o.push(s);
          }
          o.push('\\end\{adjustwidth\}');
          o.push('\\end\{flushleft\}')
          o.push('');
          break;
        }

        case 'CODE': {

          const numbers = (config.codenumbers) ? 'left' : 'none';
          const xleft = (config.codenumbers) ? N_lstlisting_numbers_xleftmargin : 0;
          const myopts=`basicstyle=\\ttfamily\\small,numberstyle=\\tiny,breaklines=true,postbreak=\\textrightarrow\\space,numbers=${numbers},xleftmargin=${xleft}cm`;
          if (fig) {
            var text = data;
            const increment = 40;
            for (var k=0; k < text.length; k += increment) {
              if (k == 0) {
                o.push(`\\begin{lstlisting}[float=*,${myopts},firstnumber=${k+1},label=${label},caption={${this.unmask(caption)}}]`);
              } else {
                o.push(`\\begin{lstlisting}[float=*,${myopts},firstnumber=${k+1}]`);
              }
              for (var i=0; i < increment && (k+i) < text.length; ++i) {
                var line = text[k+i];
                o.push(line);
              }
              o.push('\\end{lstlisting}');
              o.push('');
            }

          } else {
            var text = data;
            o.push(`\\begin{lstlisting}[${myopts}]`);
            for (var k=0; k < text.length; ++k) {
              var line = text[k];
              o.push(line);
            }
            o.push('\\end{lstlisting}');
            o.push('');

          }
          break;
        }
        case 'VERB': {

          var text = data;

          var [out, vw, vh] = this.toFramedPgfp(text,config);

          if (config.verbframe) {
            out =  `\\ifthenelse{\\dimtest{${vw}}{>}{\\linewidth}}{ \\resizebox{\\linewidth}{!}{\\fbox{${out}}} }{ \\fbox{${out}} }`;
          } else {
            out =  `\\ifthenelse{\\dimtest{${vw}}{>}{\\linewidth}}{ \\resizebox{\\linewidth}{!}{ ${out} } }{ ${out} }`;
          }

          /// \ifthenelse{\ dimtest{134mm}{>}{\linewidth}}{\resizebox{\linewidth}{!}{
          ///    \begin{tikzpicture}
          ///      ...
          ///    \end{tikzpicture}
          ///  }}{}

          o.push(`\\begin{flushleft}`);
          o.push(`\\begin\{adjustwidth\}{${left}cm}{}`)
          o.push(out);
          o.push(`\\end{adjustwidth}`);
          o.push(`\\end{flushleft}`);
          o.push('');

          break;
        }
        case 'VRSE': {
          o.push('\\begin{flushleft}')
          o.push(`\\begin{adjustwidth}{${left}cm}{}`)
          var text = '';
          for (text of data) {
            text = this.escape(text);
            text = this.rubify(text);
            if (text.length == 0) {
              text = '\\mbox{}';
            }
            o.push(`${text} \\\\`);
          }
          if (text.length) {
            o.pop();
            o.push(text);
          }
          o.push('\\end{adjustwidth}');
          o.push('\\end{flushleft}')
          o.push('');
          break;
        }
        case 'DESC': {
          var [cat,keys,text,xn] = data;
          const xleft = xn*config.latexstepmargin;
          text = this.unmask(text);
          o.push(`\\begin{flushleft}`);
          if (cat === 'mono') {
            o.push(`\\begin{description}\[nosep,style=unboxed,leftmargin=${xleft}cm,font=\\normalfont\\ttfamily\\bfseries\]`);
          } else if (cat === 'strong') {
            o.push(`\\begin{description}\[nosep,style=unboxed,leftmargin=${xleft}cm,font=\\normalfont\\bfseries\]`);
          } else {
            o.push(`\\begin{description}\[nosep,style=unboxed,leftmargin=${xleft}cm,font=\\normalfont\\bfseries\\itshape\]`);
          }
          for (var key of keys) {
            key = this.escape(key);
            o.push(`\\item\[${key}\]`);
          }
          if (text) {
            o.push('\\mbox{}\\\\');
            o.push(text);
          }
          o.push(`\\end{description}`);
          o.push(`\\end{flushleft}`);
          o.push('');
          break;
        }
        case 'PRIM': {
          var [lead,text] = data;
          lead = this.escape(lead);
          text = this.unmask(text);
          o.push('\\begin{flushleft}');
          o.push(`\\textbf{${lead}}`);
          o.push(text);
          o.push('\\end{flushleft}');
          o.push('');
          break;
        }
        case 'SECO': {
          var [lead,text] = data;
          lead = this.escape(lead);
          text = this.unmask(text);
          o.push('\\begin{flushleft}');
          o.push(`~ ~ ~\\textbf{${lead}}`);
          o.push(text);
          o.push('\\end{flushleft}');
          o.push('');
          break;
        }
        case 'PLST': {
          o.push('\\begin\{flushleft\}')
          o.push(`\\begin\{adjustwidth\}{${left}cm}{}`)
          for (var item of data) {
            var [lead,bullet,text] = item;
            bullet = bullet || '';
            text = text || '';
            if (bullet === '-') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `\\textit{${this.escape(v[1])}} ${v[2]} ${this.unmask(v[3])}`;
              } else {
                text = this.unmask(text);
              }
              bullet = '';
            } else if (bullet === '+') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `\\texttt{${this.escape(v[1])}} ${v[2]} ${this.unmask(v[3])}`;
              } else {
                text = this.unmask(text);
              }
              bullet = '';
            } else if (bullet === '*') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `\\textbf{${this.escape(v[1])}} ${v[2]} ${this.unmask(v[3])}`;
              } else {
                text = this.unmask(text);
              }
              bullet = '';
            } else if (bullet.match(/^\d+\.$/)) {
              bullet = this.chomp(bullet);
              text = this.unmask(text);
            } else {
              bullet = '';
              text = this.unmask(text);
            }
            if (item.length === 3) {
              switch (lead) {
                case 'OL': {
                  o.push(`\\begin{enumerate}[nosep,leftmargin=${config.latexstepmargin}cm]`);
                  o.push(`\\item\[${bullet}.\] ${text}`);
                  break;
                }
                case 'UL': {
                  o.push(`\\begin{itemize}[nosep,leftmargin=${config.latexstepmargin}cm]`);
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
                  o.push(`\\end{enumerate}`);
                  if (bullet) {
                    o.push(`\\item\[${bullet}.\] ${text}`);
                  } else {
                    o.push(`\\item ${text}`);
                  }
                  break;
                }
                case '/UL': {
                  o.push(`\\end{itemize}`);
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
                o.push('\\end{enumerate}');
              } else if (lead === '/UL') {
                o.push('\\end{itemize}');
              }
            }
          }
          o.push(`\\end{adjustwidth}`);
          o.push('\\end\{flushleft\}')
          o.push('');
          break;
        }
        case '': {
          if (config.latexparskip || n) {
            o.push('\\begin\{flushleft\}')
            o.push(`\\begin\{adjustwidth\}{${left}cm}{}`)
            o.push(this.unmask(data));
            o.push(`\\end{adjustwidth}`);
            o.push('\\end\{flushleft\}')
            o.push('');
          } else {
            o.push(this.unmask(data));
            o.push('');
          }
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
    smooth the text
  */
  smoothTT (text) {
    return this.replaceSubstrings(text,this.mymapcode);
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
    escape the text to be used with \ttfamily font
  */
  escapeTT (text) {
    var text = this.smoothTT(text);
    var text = this.fontifyLATEX(text);
    return text;
  }

  /*
    return the styled inline text
  */
  style (type, text) {
    type = type || '';
    switch (type) {
      case 'inlinemath': {
        var s = `\\( ${text} \\)`;
        return s;
        break;
      }
      case 'displaymath': {
        var s = `\\[ ${text} \\]`;
        return s;
        break;
      }
      case 'mono': {
        return `\\texttt{${this.escape(text)}}`
        break;
      }
      case 'em': {
        return `\\textit{${this.escape(text)}}`
        break;
      }
      case 'strong': {
        return `\\textbf{${this.escape(text)}}`
        break;
      }
      case 'uri': {
        const [cnt,href] = text;
        if (cnt) {
          return `${this.escape(cnt)} (\\url{${href}})`
        } else {
          return `\\url{${href}}`
        }
        break;
      }
      case 'ruby': {
        const [rb,rt] = text;
        return `\\ruby{${this.escape(rb)}}{${this.escape(rt)}}`
        break;
      }
      case 'ref': {
        return `\\underline{\\ref{${text}}}`;
        break;
      }
      default: {
        return `{${this.escape(text)}}`
        break;
      }
    }
  }

  normalizeLL (ll) {
    var re_p = /^p\{(.*)\}$/;
    for (var s of ll) {
      var v = re_p.exec(s);
      if (s === 'l') {
        o.push('l');
      } else if (s === 'r') {
        o.push('r');
      } else if (s === 'c') {
        o.push('c');
      } else if (v) {
        o.push(s);
      } else {
        o.push('X');
      }
    }
    return o;
  }

  toXtabularAligns (ll,ww) {

    // count the number of "L"s
    var x_count = 0;
    for (var s of ll) {
      if (s === 'L') {
        x_count += 1;
      }
    }

    var n = x_count;
    var def_w = 1;
    var acc_w = 0;
    var o = [];
    var re_p = /^p\{(.*)\}$/;
    var k = 0;
    for (var j in ll) {
      var s = ll[j];
      var v = re_p.exec(s);
      if (s === 'l') {
        o.push('l');
      } else if (s === 'r') {
        o.push('r');
      } else if (s === 'c') {
        o.push('c');
      } else if (v) {
        o.push(`p{${v[1]}}`);
      } else if (s === 'L') {
        var w = ww[k];
        if (!w) {
          if (n > 0) {
            def_w = (1.0 - acc_w)/n;
            n = 0;
          }
          w = def_w;
          if (w == 1) {
            w = 'p{\\linewidth}';
          } else {
            w = `p{${w}\\linewidth}`;
          }
        } else {
          w = ''+w;
          w = parseFloat(w);
          acc_w += w;
          if (w == 1) {
            w = 'p{\\linewidth}';
          } else {
            w = `p{${w}\\linewidth}`;
          }
          n -= 1;
          k += 1;
        }
        o.push(w);
      } else {
        o.push('l');
      }
    }
    return o;
  }

  columnsToLongTableCellStyles (ll,ww) {

    // count the number of "L"s
    var x_count = 0;
    for (var s of ll) {
      if (s === 'L') {
        x_count += 1;
      }
    }

    var n = x_count;
    var def_w = 1;
    var acc_w = 0;
    var o = [];
    var re_p = /^p\{(.*)\}$/;
    var k = 0;
    for (var j in ll) {
      var s = ll[j];
      var v = re_p.exec(s);
      if (s === 'l') {
        o.push('l');
      } else if (s === 'r') {
        o.push('r');
      } else if (s === 'c') {
        o.push('c');
      } else if (v) {
        o.push(`p{${v[1]}}`);
      } else if (s === 'L') {
        var w = ww[k];
        if (!w) {
          if (n > 0) {
            def_w = (1.0 - acc_w)/n;
            n = 0;
          }
          w = def_w;
          w *= x_count;
          if (w == 1) {
            w = '';
          } else {
            w = `\\hsize=${w}\\hsize\\linewidth=\\hsize`;
          }
        } else {
          w = ''+w;
          w = parseFloat(w);
          acc_w += w;
          w *= x_count;
          if (w == 1) {
            w = '';
          } else {
            w = `\\hsize=${w}\\hsize\\linewidth=\\hsize`;
          }
          n -= 1;
          k += 1;
        }
        o.push(`>{\\raggedright\\arraybackslash${w}}X`);
      } else {
        o.push('l');
      }
    }
    return o;
  }

  columnsToTableCellStyles (ll) {
    var o = [];
    var re_p = /^p\{(.*)\}$/;
    for (var s of ll) {
      if (s === 'l') {
        o.push('l');
      } else if (s === 'r') {
        o.push('r');
      } else if (s === 'c') {
        o.push('c');
      } else if (s === 'L') {
        o.push('L');
      } else {
        var v = re_p.exec(s);
        if (v) {
          o.push(`p{${v[1]}}`);
        } else {
          o.push('l');
        }
      }
    }
    return o;
  }

  toRequiredPackages (isarticle,config) {

    var geometry_opts = [];
    if (config.latextwocolumn) {
      geometry_opts.push(`left=${config.latexleftmarginTC}cm`);
      geometry_opts.push(`right=${config.latexrightmarginTC}cm`);
      geometry_opts.push(`top=${config.latextopmarginTC}cm`);
    } else {
      geometry_opts.push(`left=${config.latexleftmargin}cm`);
      geometry_opts.push(`right=${config.latexrightmargin}cm`);
      geometry_opts.push(`top=${config.latextopmargin}cm`);
    }
    if (config.latexa4paper) {
      geometry_opts.push('a4paper');
    }
    if (config.latextwoside) {
      geometry_opts.push('twoside');
    }

    var geometry_text = `\\usepackage[${geometry_opts.join(',')}]{geometry}`;

    if (config.latexfamily.toLowerCase() == 'pdflatex') {
      return `\\usepackage[utf8]{inputenc}
\\usepackage{CJKutf8,pinyin}
\\usepackage[overlap,CJK]{ruby}
\\newcommand*{\\cn}[1]{\\begin{CJK}{UTF8}{gbsn}#1\\end{CJK}}
\\newcommand*{\\tw}[1]{\\begin{CJK}{UTF8}{bsmi}#1\\end{CJK}}
\\newcommand*{\\jp}[1]{\\begin{CJK}{UTF8}{min}#1\\end{CJK}}
\\newcommand*{\\kr}[1]{\\begin{CJK}{UTF8}{mj}#1\\end{CJK}}
${geometry_text}
\\usepackage{graphicx}
\\usepackage{subcaption}
\\usepackage{caption}
\\usepackage{paralist}
\\usepackage{enumitem}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
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
\\usepackage{booktabs}
\\usepackage{xtab}
\\usepackage{ltablex}
\\usepackage{csquotes}
\\usepackage{xifthen}
\\renewcommand{\\rubysize}{0.5}
\\renewcommand{\\rubysep}{0.0ex}`

    } else {

      return `\\usepackage{luatexja-fontspec}
\\usepackage{luatexja-ruby}
\\newjfontfamily\\cn{arplsungtilgb}
\\newjfontfamily\\tw{arplmingti2lbig5}
\\newjfontfamily\\jp{ipaexmincho}
\\newjfontfamily\\kr{baekmukbatang}
${geometry_text}
\\usepackage{graphicx}
\\usepackage{subcaption}
\\usepackage{caption}
\\usepackage{enumitem}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{unicode-math}
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
\\usepackage{booktabs}
\\usepackage{xtab}
\\usepackage{ltablex}
\\usepackage{csquotes}
\\usepackage{xifthen}`

    }

  }

  toFramedPgfp (para, config ) {
    //var width [expr 2*([get-para-width $para]+2)]mm
    //set n [llength $para]
    //set height [expr ($n+3)*10]pt

    var mpara = this.getParaMaxWidth(para);
    var npara = para.length;

    if (mpara < config.verbminwidth) {
      mpara = config.verbminwidth;
    }

    var vw = `${6*mpara}pt`;
    var vh = `${10*(1+npara)}pt`;
    para = this.toReversedArray( para );

    var o = [];
    o.push(`\\begin{pgfpicture}{0pt}{0pt}{${vw}}{${vh}}`);

    var y = 7; /// 7 is a sensable number---the bigger the number the more upwards the contents shifts
    for (var line of para) {
      var x = 0;
      for (var c of line) {
        if (/\S/.test(c)) {
          c = this.escapeTT(c);
          o.push(`\\pgftext[x=${x}pt,y=${y}pt,base,left]{\\ttfamily\\fontsize{10pt}{10pt}\\selectfont{}${c}}`);
        }
        x += 6;
      }
      y += 10;
    }

    o.push(`\\end{pgfpicture}`);
    return [o.join('\n'), vw, vh];
  }

  toFramedTikz (para, config ) {
    //var width [expr 2*([get-para-width $para]+2)]mm
    //set n [llength $para]
    //set height [expr ($n+3)*10]pt

    var mpara = this.getParaMaxWidth(para);
    var npara = para.length;

    if (mpara < config.verbminwidth) {
      mpara = config.verbminwidth;
    }

    var width = `${5.4*(mpara+1)}pt`;
    var height = `${(npara+1)*10}pt`;

    var o = [];
    o.push(`\\begin{tikzpicture}`);

    o.push(`\\draw[color=black] (0,0) rectangle (${width},${height});`);

    para = this.toReversedArray( para );
    var i = 0;
    for (var line of para) {
      i += 1;
      line = this.replaceSubstrings(line,this.mymapcode);
      line = this.fontifyLATEX(line);
      o.push( `\\draw (0pt,${i*10}pt) node\[right\]\
        {\\ttfamily\\fontsize{10pt}{10pt}\\selectfont{}${line}};` );
    }
    o.push(`\\end{tikzpicture}`);
    return [o.join('\n'), width, height];
  }

  toFramedTabb (text, maxj, ww, fencecmd, r) {
    var formats = this.toArray(fencecmd.format);
    var text = text.map ( pp => {
      pp = pp.map(x => x.split('\n'));
      var kk = pp.map(x => x.length); /// an new array of length
      var kkm = kk.reduce((acc,curr) => acc>curr?acc:curr); /// max length
      /// this step is to ensure that all elements of 'pp', which is also
      /// an array, which represents all the split lines of a single table
      /// row, is of the same length, which is essential to perform
      // the subsequent operation
      pp = pp.map(x => {while(x.length<kkm) x.push(''); return x;});
      return pp;

    });
    var o = [];
    o.push('\\toprule');
    var rowcount = 0
    for (var pp of text) {
      rowcount += 1;
      var kkm = pp[0].length;
      for (var k=0; k < kkm; ++k) {
        var ppk = pp.map(p => p[k]);
        if (rowcount === 1) {
          ///var ppk = ppk.map(p => `\\multicolumn{1}{c}{\\textbf{${this.escape(p)}}}`);
          var ppk = ppk.map((p,i) => this.style('strong'  ,p));
          o.push(ppk.join(' & ') + ' \\\\');
        } else {
          var ppk = ppk.map((p,i) => this.style(formats[i],p));
          o.push(ppk.join(' & ') + ' \\\\');
        }
      }
      if (rowcount === 1) {
        o.push('\\midrule');
      }
    }
    if (text.length == 0) {
      o.push('(empty) \\\\');
    }
    o.push('\\bottomrule');
    return o.join('\n');
  }

  extractRubyItems (base, top) {
    var re = '';
    var rb = '';
    var rt = '';
    for (var c of base) {
      if (!/[\u3040-\u309F]/.test(c)) {
        ///not hiragana
        if (rt.length) {
          re += `(${rt})`;
          rt = '';
        }
        rb += c;
      } else {
        if (rb.length) {
          re += '(.+?)';
          rb = '';
        }
        rt += c;
      }
    }
    if (rb.length) {
      re += '(.+?)';
      rb = '';
    } else if (rt.length) {
      re += `(${rt})`;
      rt = '';
    }
    ///console.log(re);
    re = `^${re}$`;
    ///console.log(re);
    var re = new RegExp(re);
    var v = re.exec(top);
    ///console.log(v);
    var v1 = re.exec(base);
    ///console.log(v1);
    var o = '';
    if (v && v1 && v.length === v1.length) {
      /// match
      for (var j=1; j < v.length; ++j) {
        if (v1[j] === v[j]) {
          o += `\\ruby{${v1[j]}}{}`;
        } else {
          o += `\\ruby{${v1[j]}}{${v[j]}}`;
        }
      }
    } else {
      o = `\\ruby{${base}}{${top}}`;
    }
    ///console.log(o);
    return o;
  }

  toFramedFigure (text) {
    var o = [];
    for (var pp of text) {
      pp = pp.map( x => {
          var [image,width,opts,src,srcs,sub] = x;
          if (!src && srcs.length) {
            src = srcs[0];///TODO: need to change it so that it picks a right format
          }
          var { height } = opts;
          if (height) {
            return `\\begin{subfigure}[t]{${width}\\linewidth}\\includegraphics[keepaspectratio=true,height=${height},width=\\linewidth]{${src}}\\caption{${this.unmask(sub)}}\\end{subfigure}`;
          } else {
            return `\\begin{subfigure}[t]{${width}\\linewidth}\\includegraphics[keepaspectratio=true,width=\\linewidth]{${src}}\\caption{${this.unmask(sub)}}\\end{subfigure}`;
          }
      });

      var spacing = 1;
      var sep = '~'.repeat(spacing);
      o.push(pp.join(sep));
      o.push('');
    }
    return o.join('\n');
  }

  toFramedPict (text,config) {
    var o = [];
    for (var pp of text) {
      pp = pp.map( x => {
          var [image,adjust,opts,src,srcs,sub] = x;
          if (!src && srcs.length) {
            src = srcs[0];///TODO: need to change it so that it picks a right format
          }
          var { height, width } = opts;
          height = height || '';
          width = width || '';
          var myopts = [];
          if (height) {
            myopts.push(`height=${height}`);
          }
          if (width) {
            if (width !== 'auto') {
              myopts.push(`width=${this.toLatexLength(width)}`);
            }
          } else {
            ///if user hasn't provided any width then use the one in adjust
            myopts.push(`width=${adjust}\\linewidth`);
          }
          return `{\\includegraphics[${myopts.join(',')}]{${src}}}`;
      });

      var spacing = 1;
      var sep = '~'.repeat(spacing);
      o.push(pp.join(sep));
      o.push('');
    }
    return o.join('\n');
  }

}

module.exports = { NitrilePreviewLatex };
