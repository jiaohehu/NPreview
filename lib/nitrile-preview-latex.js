'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');
const path = require('path');
const fs = require('fs');
const fontmap = require('./nitrile-preview-fontmap');
const utils = require('./nitrile-preview-utils');
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
      " "  , "\\ "                 ,
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
      const left = n*config.latexStepMargin;
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
            default:
              o.push(`\\subsubsection{${text}}${label_text}`);
              o.push('');
              break;
          }
          break;
        }

        case 'CITE': {

          var text = data;
          o.push('\\begin{flushleft}');
          for (var s of text) {
            o.push(`${this.escape(s)} \\\\`);
          }
          o.push(`\\end{flushleft}`);
          o.push('');
          break;
        }
        case 'IMGS': {

          var column = 1;
          if (fencecmd.column) {
            column = fencecmd.column;
          }
          var adjust = '1 '.repeat(column);
          if (fencecmd.adjust) {
            adjust = fencecmd.adjust;
          }
          var margin = 0.0;
          if (fencecmd.margin) {
            margin = fencecmd.margin;
          }
          var gap = 0.0;
          if (fencecmd.gap) {
            gap = fencecmd.gap;
          }
          var ww = this.toAdjustedColumns(column,adjust);
          var pcol = this.toPcolumn2(margin,gap,ww);
///console.log(column);
///console.log(adjust);
///console.log(ww);
///console.log(pcol);
///console.log(data);

          var text = this.toFramedImgs(column,data,pcol);

          o.push(`\\begin{flushleft}`);
          o.push(text);
          o.push('\\end{flushleft}');
          o.push('');

          break;
        }
        case 'TABULAR': {
          var [text,maxj,ww] = data;
          text = text.map ( row => {
            row = row.map(x => x.split('\n'));
            row = row.map(x => x.map(y => this.unmask(y)));
            row = row.map(x => x.join(' \newline '));
            return row;
          });
          var pcol = 'l'.repeat(maxj);
          o.push(`\\begin{center}`);
          o.push(`\\begin{tabular}{${pcol}}`);
          for (var pp of text) {
            o.push(`${pp.join(' & ')}\\\\`);
            o.push(`\\noalign{\\medskip}`);  
          } 
          if (text.length == 0) {
            o.push(`(empty)`);
          } else {
            o.pop(); ///remove the last \medskip
          }
          o.push('\\end{tabular}');
          o.push('\\end{center}');
          o.push('');
          break;
        }
        case 'LONGTABU': {
          var [text,maxj,ww] = data;
          if (fencecmd.adjust) {
            ww = this.toAdjustedColumns(maxj,fencecmd.adjust);
            ///***NOTE: ww is a list of floating point numbers
            ///add up to 1, such as: 
            ///    .2 .3 .5
          }
          text = text.map ( row => {
            row = row.map(x => x.split('\n'));
            row = row.map(x => x.map(y => this.unmask(y)));
            row = row.map(x => x.join(' \newline '));
            return row;
          });
          var pcols = ww.map(w => `X[${w}]`);
          var pcol = pcols.join(''); 
          let header = text.shift();
          header = header.map(x => `\\textbf{${x}}`);
          o.push(`\\begin{longtabu} to \\linewidth {${pcol}}`);
          if (fencecmd.caption && fencecmd.label) {
            o.push(`\\caption{${this.unmask(fencecmd.caption)}}\\label{${fencecmd.label}}\\\\`);
          } else if (fencecmd.caption) {
            o.push(`\\caption{${this.unmask(fencecmd.caption)}}\\\\`);
          }
          o.push(`\\toprule`);
          o.push(`${header.join(' & ')}\\\\`);
          o.push(`\\midrule`);
          o.push(`\\endhead`);
          o.push(`\\bottomrule`);
          o.push(`\\endfoot`);
          o.push(this.toLongtabuRows(text,config.latexTableStyle));
          o.push('\\end{longtabu}');
          o.push('');
          break;
        }
        case 'TABULARY': {
          var [text,maxj,ww] = data;
            ///***NOTE: do not need to adjust ww as tabulary
            ///adjust table columns automatically
            ///However, it still support \newline macro
          text = text.map ( row => {
            row = row.map(x => x.split('\n'));
            row = row.map(x => x.map(y => this.unmask(y)));
            row = row.map(x => x.join(' \\newline '));
            return row;
          });
          var pcol = 'L'.repeat(maxj);
          var header = text.shift();
          var header = header.map(x => `\\textbf{${x}}`);
          o.push(`\\begin{center}`);
          o.push(`\\begin{tabulary}{\\linewidth}{${pcol}}`);
          o.push('\\toprule');
          o.push(`${header.join(' & ')}\\\\`);
          o.push('\\midrule');
          o.push(this.toTabularyRows(text,config.latexTableStyle));
          o.push('\\bottomrule');
          o.push('\\end{tabulary}');
          o.push(`\\end{center}`);
          o.push('');
          break;
        }
        case 'TABULARX': {
          var [text,maxj,ww] = data;
          if (fencecmd.adjust) {
            ww = this.toAdjustedColumns(maxj,fencecmd.adjust);
          }
          var pcol = this.toTabularXcolumn(maxj,ww,config.latexTableStyle);
            ///***NOTE: tabularx environment has some perculiar way of specifying
            ///columns
          text = text.map ( row => {
            row = row.map(x => x.split('\n'));
            row = row.map(x => x.map(y => this.unmask(y)));
            row = row.map(x => x.join(' \\newline '));
            return row;
          });
          var header = text.shift();
          var header = header.map(x => `\\textbf{${x}}`);
          o.push(`\\begin{tabularx}{\\linewidth}{${pcol}}`);
          o.push('\\toprule');
          o.push(`${header.join(' & ')}\\\\`);
          o.push(this.toTabularXrows(text,config.latexTableStyle));
          o.push('\\bottomrule');
          o.push('\\end{tabularx}');
          o.push('');
          break;
        }
        case 'TABF': { ///***NOTE: current deprecate: need to rewrite this
          var [text,maxj,ww] = data;
          if (fencecmd.adjust) {
            ww = this.toAdjustedColumns(maxj,fencecmd.adjust);
          }
          var pcol = this.toPcolumn(ww,config.latexTableStyle);
          text = text.map ( row => {
            row = row.map(x => x.split('\n'));
            row = row.map(x => x.map(y => this.unmask(y)));
            row = row.map(x => x.join(' \\newline '));
            return row;
          });
          var header = text.shift();
          var header = header.map(x => `\\textbf{${x}}`);
          o.push(`\\begin{table}`);
          if (fencecmd.caption && fencecmd.label) {
            o.push(`\\caption{${this.unmask(fencecmd.caption)}}${label_text}`);
          }
          o.push(`\\begin{tabular}{${pcol}}`);
          if (config.latexTableStyle == 'standard' ||
              config.latexTableStyle == 'boxed' ||
              config.latexTableStyle == 'full') {
            o.push('\\hline');
          }
          o.push(`${header.join(' & & ')}\\\\`);
          if (config.latexTableStyle == 'standard' ||
              config.latexTableStyle == 'boxed' ||
              config.latexTableStyle == 'full') {
            o.push('\\hline');
          }
          o.push(this.toLatexTableRows(text,config.latexTableStyle));
          if (config.latexTableStyle == 'standard' ||
              config.latexTableStyle == 'boxed' ||
              config.latexTableStyle == 'full') {
            o.push('\\hline');
          }
          o.push('\\end{tabular}');
          o.push('\\end{table}');
          o.push('');
          break;
        }
        case 'QUOT': {
          o.push('\\begin{flushleft}');
          var text = this.unmask(data);
          o.push(text);
          o.push('\\end{flushleft}')
          o.push('');
          break;
        }
        case 'CENTER': {
          o.push('\\begin{center}');
          var text = this.unmask(data);
          o.push(text);
          o.push('\\end{center}')
          o.push('');
          break;
        }
        case 'FLUSHRIGHT': {
          o.push('\\begin{flushright}');
          var text = this.unmask(data);
          o.push(text);
          o.push('\\end{flushright}')
          o.push('');
          break;
        }
        case 'FLUSHLEFT': {
          o.push('\\begin{flushleft}');
          var text = this.unmask(data);
          o.push(text);
          o.push('\\end{flushleft}')
          o.push('');
          break;
        }
        case 'DIAGRAM': {
          o.push('\\begin{mplibcode}');
          o.push('beginfig(1)');
          o.push((new NitrilePreviewDiagram(this)).toMetaPost(data));
          o.push('endfig')
          o.push('\\end{mplibcode}')
          o.push('');
          break;
        }
        case 'TERM': {
          var text = data;
          o.push('\\begin{flushleft}');
          o.push(`\\begin{description}\[nosep,style=unboxed,font=\\normalfont\\ttfamily]`);
          for (var i=0; i < text.length; i+=2) {
            var dt = text[i];
            var dd = text[i+1];
            dt = this.escape(dt);
            dd = this.unmask(dd);
            o.push(`\\item\[${dt}\] `);
            if (dd.length) {
              o.push(`\\hfill\\break{}${dd}`);
            }
          }
          if (text.length == 0) {
            o.push(`\\item\[(empty)\]`);
          }
          o.push('\\end{description}');
          o.push('\\end{flushleft}')
          o.push('');
          break;
        }
        case 'MATH': {
          var text = data;
          var count = text.length;
          if (count == 1) {
            o.push(`\\begin{equation*}`);
            for (var s of text) {
              o.push(s);
            }
            o.push(`\\end{equation*}`);
            o.push('');
          } else if (count > 1) {
            o.push(`\\begin{gather*}`);
            for (var s of text) {
              o.push(s);
              o.push('\\\\');
            }
            o.pop();
            o.push(`\\end{gather*}`);
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
        case 'CODE': {
          var myopts=[];
          myopts.push('basicstyle=\\ttfamily\\small');
          myopts.push('numberstyle=\\tiny');
          myopts.push('breaklines=true');
          myopts.push('postbreak=\\textrightarrow\\space');
          myopts.push(`numbers=left`);
          myopts.push('numbersep=1pt');
          myopts.push('xleftmargin=12pt');
          if (caption) {
            myopts.push(`title={${this.unmask(caption)}}`);
          }
          if (label) {
            myopts.push(`label=${label}`);
          }
          var text = data;
          o.push(`\\begin{lstlisting}[${myopts.join(',')}]`);
          for (var k=0; k < text.length; ++k) {
            var line = text[k];
            o.push(line);
          }
          o.push('\\end{lstlisting}');
          o.push('');
          break;
        }
        case 'VERB': {
          var text = data;
          var [out, vw, vh] = this.toFramedLtpp(text,config);
          o.push(`\\begin{flushleft}`);
          o.push(`\\setlength{\\unitlength}{1pt}`);
          o.push(`{\\resizebox{\\linewidth}{!}{\\fbox{${out}}} }`);
          o.push(`\\end{flushleft}`);
          o.push('');
          break;
        }
        case 'LINE': {
          o.push('\\begin{flushleft}')
          var text = '';
          for (text of data) {
            text = this.unmask(text);
            o.push(`${text} \\\\`);
          }
          if (data.length) {
            o.pop();
            o.push(text);
          }
          o.push('\\end{flushleft}')
          o.push('');
          break;
        }
        case 'DESC': {
          var [cat,keys,text,xn] = data;
          const xleft = xn*config.latexStepMargin;
          ///const xleft = 0;
          var bullet = '';
          try {
            if (config.latexDescriptionItemBullet) {
              bullet = String.fromCodePoint(config.latexDescriptionItemBullet);
              bullet += ' ';
            }
          } catch(e) {
          }
          text = this.unmask(text);
          o.push(`\\begin{flushleft}`);
          o.push(`\\begin{description}\[nosep,style=unboxed,leftmargin=${xleft}cm,font=\\normalfont]`);
          for (var key of keys) {
            key = `${this.escape(bullet)}\\bfseries{}${this.unmask(key)}`;
            o.push(`\\item\[${key}\]`);
          }
          if (text) {
            o.push('\\hfill\\break');
            o.push(text);
          }
          o.push(`\\end{description}`);
          o.push(`\\end{flushleft}`);
          o.push('');
          break;
        }
        case 'PLST': {
          o.push('\\begin\{flushleft\}')
          for (var item of data) {
            var [lead,bullet,text] = item;
            bullet = bullet || '';
            text = text || '';
            if (bullet === '-' || bullet === '*' || bullet === '+') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `\\textit{${this.escape(v[1])}} ${v[2]} ${this.unmask(v[3])}`;
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
                  o.push(`\\begin{enumerate}[nosep,leftmargin=${config.latexStepMargin}cm]`);
                  o.push(`\\item\[${bullet}.\] ${text}`);
                  break;
                }
                case 'UL': {
                  o.push(`\\begin{itemize}[nosep,leftmargin=${config.latexStepMargin}cm]`);
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
          o.push('\\end\{flushleft\}')
          o.push('');
          break;
        }
        case 'ITEM': {
          var [fence,text] = data;
          const xleft = config.latexStepMargin;
          if (fence) {
            o.push(`\\begin{flushleft}`);
            o.push(`\\begin\{adjustwidth\}{${xleft}cm}{}`)
            for (var line of text) {
              line = this.replaceSubstrings(line,this.mymapcode);
              line = this.fontifyLATEX(line);
              line = `{\\ttfamily{}${line}}\\\\`;
              o.push(line);
            }
            if (text.length) {
              /// remove the last line's double-backslash
              line = o.pop();
              line = line.slice(0,line.length-2);
              o.push(line);
            }
            o.push(`\\end\{adjustwidth\}`)
            o.push(`\\end{flushleft}`);
            o.push('');
          } else {
            o.push(`\\begin{flushleft}`);
            o.push(`\\begin\{adjustwidth\}{${xleft}cm}{}`)
            text = this.unmask(text.join('\n'));
            o.push(text);
            o.push(`\\end\{adjustwidth\}`)
            o.push(`\\end{flushleft}`);
            o.push('');
          }
          break;
        }
        case 'SAMP': {
          var text = data;
          const xleft = config.latexStepMargin;
          o.push(`\\begin{flushleft}`);
          o.push(`\\begin\{adjustwidth\}{${xleft}cm}{}`)
          if (config.latexWrapSampleEnabled) {
            var text = this.wrapSample(text,config.latexWrapSampleLength);
          }
          for (var i=0; i < text.length; ++i) {
            var line = text[i];
            line = this.replaceSubstrings(line,this.mymapsmpl);
            line = this.solidifyLeadingBackslashSpaces(line);
            line = this.fontifyLATEX(line);
            if (config.latexAutoRubyEnabled) {
              line = this.rubify(line);
            }
            if (line.length == 0) {
              line = '~';
            }
            var s = `{\\ttfamily{}${line}}`;
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
        case 'PARA': {
          var text; 
          text = data;
          text = this.unmask(text);
          o.push('\\bigskip');
          o.push('\\noindent');
          o.push(text);
          o.push('');
          break;
        }
        case 'PRIM': {
          var lead;
          var text; 
          [lead,text] = data;
          lead = this.unmask(lead);
          text = this.unmask(text);
          o.push(`\\paragraph{${lead}}`);
          o.push(text);
          o.push('');
          break;
        }
        case 'SECO': {
          var lead;
          var text; 
          [lead,text] = data;
          lead = this.unmask(lead);
          text = this.unmask(text);
          o.push(`\\subparagraph{${lead}}`);
          o.push(text);
          o.push('');
          break;
        }
        case 'TEXT': {
          var text = data;
          text = this.unmask(text);
          o.push(text);
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
    if (config.latexTwoColumnEnabled) {
      geometry_opts.push(`left=${config.latexLeftMarginForTwoColumn}cm`);
      geometry_opts.push(`right=${config.latexRightMarginForTwoColumn}cm`);
      geometry_opts.push(`top=${config.latexTopMarginForTwoColumn}cm`);
    } else {
      geometry_opts.push(`left=${config.latexLeftMargin}cm`);
      geometry_opts.push(`right=${config.latexRightMargin}cm`);
      geometry_opts.push(`top=${config.latexTopMargin}cm`);
    }
    if (config.latexA4PaperEnabled) {
      geometry_opts.push('a4paper');
    }
    if (config.latexTwoSideEnabled) {
      geometry_opts.push('twoside');
    }

    var geometry_text = `\\usepackage[${geometry_opts.join(',')}]{geometry}`;

    if (config.latexEngine.toLowerCase() == 'pdflatex') {
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
\\DeclareMathSymbol{\\Alpha}{\\mathalpha}{operators}{"41}
\\DeclareMathSymbol{\\Beta}{\\mathalpha}{operators}{"42}
\\DeclareMathSymbol{\\Epsilon}{\\mathalpha}{operators}{"45}
\\DeclareMathSymbol{\\Zeta}{\\mathalpha}{operators}{"5A}
\\DeclareMathSymbol{\\Eta}{\\mathalpha}{operators}{"48}
\\DeclareMathSymbol{\\Iota}{\\mathalpha}{operators}{"49}
\\DeclareMathSymbol{\\Kappa}{\\mathalpha}{operators}{"4B}
\\DeclareMathSymbol{\\Mu}{\\mathalpha}{operators}{"4D}
\\DeclareMathSymbol{\\Nu}{\\mathalpha}{operators}{"4E}
\\DeclareMathSymbol{\\Omicron}{\\mathalpha}{operators}{"4F}
\\DeclareMathSymbol{\\Rho}{\\mathalpha}{operators}{"50}
\\DeclareMathSymbol{\\Tau}{\\mathalpha}{operators}{"54}
\\DeclareMathSymbol{\\Chi}{\\mathalpha}{operators}{"58}
\\DeclareMathSymbol{\\omicron}{\\mathord}{letters}{"6F}
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
\\usepackage{tabularx}
\\usepackage{tabulary}
\\usepackage{tabu}
\\usepackage{booktabs}
\\usepackage{csquotes}
\\usepackage[export]{adjustbox}
\\renewcommand{\\rubysize}{0.5}
\\renewcommand{\\rubysep}{0.0ex}`

    } else {

      return `\\usepackage{microtype}
\\usepackage{luatexja-fontspec}
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
\\DeclareMathSymbol{\\Alpha}{\\mathalpha}{operators}{"41}
\\DeclareMathSymbol{\\Beta}{\\mathalpha}{operators}{"42}
\\DeclareMathSymbol{\\Epsilon}{\\mathalpha}{operators}{"45}
\\DeclareMathSymbol{\\Zeta}{\\mathalpha}{operators}{"5A}
\\DeclareMathSymbol{\\Eta}{\\mathalpha}{operators}{"48}
\\DeclareMathSymbol{\\Iota}{\\mathalpha}{operators}{"49}
\\DeclareMathSymbol{\\Kappa}{\\mathalpha}{operators}{"4B}
\\DeclareMathSymbol{\\Mu}{\\mathalpha}{operators}{"4D}
\\DeclareMathSymbol{\\Nu}{\\mathalpha}{operators}{"4E}
\\DeclareMathSymbol{\\Omicron}{\\mathalpha}{operators}{"4F}
\\DeclareMathSymbol{\\Rho}{\\mathalpha}{operators}{"50}
\\DeclareMathSymbol{\\Tau}{\\mathalpha}{operators}{"54}
\\DeclareMathSymbol{\\Chi}{\\mathalpha}{operators}{"58}
\\DeclareMathSymbol{\\omicron}{\\mathord}{letters}{"6F}
%\\usepackage{stmaryrd}
%\\usepackage{wasysym}
%\\usepackage{textcomp}
\\usepackage{changepage}
\\usepackage[unicode]{hyperref}
\\usepackage{anyfontsize}
\\usepackage{tikz}
\\usepackage{luamplib}
\\usepackage[normalem]{ulem}
\\usepackage{listings}
\\usepackage{ltablex}
\\usepackage{tabularx}
\\usepackage{tabulary}
\\usepackage{tabu}
\\usepackage{booktabs}
\\usepackage[export]{adjustbox}`

    }

  }

  toFramedLtpp (para, config ) {
    //var width [expr 2*([get-para-width $para]+2)]mm
    //set n [llength $para]
    //set height [expr ($n+3)*10]pt

    var mpara = this.getParaMaxWidth(para);
    var npara = para.length;

    var verbminwidth = 80;
    if (mpara < verbminwidth) {
      mpara = verbminwidth;
    }

    var _vw = `${6*mpara}`;
    var _vh = `${10*(1+npara)}`;
    var vw = `${6*mpara}pt`;
    var vh = `${10*(1+npara)}pt`;
    para = this.toReversedArray( para );

    var o = [];
    ///o.push(`\\setlength{\\unitlength}{1pt}`);
    o.push(`\\begin{picture}(${_vw},${_vh})`);

    var y = 8; /// 8 is a sensable number---the bigger the number the more upwards the contents shifts
    for (var line of para) {
      var x = 0;
      for (var c of line) {
        if (/\S/.test(c)) {
          c = this.escapeTT(c);
          o.push(`\\put(${x},${y}){\\ttfamily\\fontsize{10pt}{10pt}\\selectfont{}${c}}`);
        }
        x += 6;
      }
      y += 10;
    }

    o.push(`\\end{picture}`);
    return [o.join('\n'), vw, vh];
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

  ///In this <longtable> environment all columns are 'p{}'
  toFramedTabl (text) {
    var text = text.map ( row => {
      row = row.map(x => x.split('\n'));
      row = row.map(x => x.map(y => this.unmask(y)));
      row = row.map(x => x.join(' \\newline '));
      return row;
    });

    var o = [];
    if (text.length == 0) {
      o.push('\\hline');
      o.push('(empty) ');
      o.push('\\hline');
    } else {

      var n = 0;
      for (var row of text) {
        n++;
        if (n == 1) {
          o.push('\\hline');
        } else if (n == 2) {
          o.push('\\hline');
        }
        o.push(row.join(' & & ') + ' \\\\');
      }
      /// now add the last \hline
      o.push('\\hline');

    }
    return o.join('\n');

  }

  ///In this <tabular> environment all columns are 'l'
  toTabularRows (text) {
    var text = text.map ( row => {
      row = row.map(x => x.split('\n'));
      row = row.map(x => x.map(y => this.unmask(y)));
      row = row.map(x => x.join(' '));
      return row;

    });
    var o = [];
    for (var pp of text) {
      o.push(`${pp.join(' & ')}\\\\`);
    }
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

  toFramedImgs (column,text,pcol) {
///console.log(column);
    var o = [];
    o.push(`\\begin{tabular}{${pcol}}`);
    var n = 0;
    var pp = text.map( x => {
        var [image,srcs,sub] = x;
        var src = '';
        if (srcs.length) {
          src = srcs[0];///TODO: need to change it so that it picks a right format
        }
	sub = this.unmask(sub);
        return `{\\begin{minipage}{\\linewidth}\\includegraphics[width=\\linewidth,frame]{${src}}\\captionof*{figure}{\\small{}${sub}}\\end{minipage}}`;
    });

    while (pp.length) {
///console.log(n);
      if (n == 0) {
        var p = pp.shift();
        n = 1;
        o.push(`{} & ${p} &`);
        continue;
      }
      if (n == column) {
        o.push(`{} \\\\`);
        o.push(`\\end{tabular}`);
        o.push(`\\bigskip`);
        o.push(`\\begin{tabular}{${pcol}}`);
        n = 0;
        continue;
      }
      var p = pp.shift();
      o.push(`{} & ${p} &`);
      n += 1;
    }
    while (n < column) {
      o.push(`{} & {} &`);
      n += 1;
    }
    o.push(`{} `);
    o.push(`\\end{tabular}`);
    n = 0;
///console.log(o);
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
          //return `{\\includegraphics[${myopts.join(',')}]{${src}}}`;
          return `{\\begin{minipage}{${adjust}\\linewidth}\n\\includegraphics[width=\\linewidth]{${src}}\n\\captionof*{figure}{${sub}}\n\\end{minipage}}`;
      });

      var spacing = 1;
      var sep = '~'.repeat(spacing);
      o.push(pp.join(sep));
      o.push('');
    }
    return o.join('\n');
  }

  toPcolumn (ww, tablestyle) {

    /// given a ww that is a list of ".2 .3 .5" try to figure out
    /// the width of each p-column with an assumed gap between columns
    /// that is .01\linewidth

    var num_gaps = ww.length - 1;
    var gap_w = num_gaps * 0.01;
    var remain_w = 1.0 - gap_w;
    var sum = ww.reduce( (acc,num) => acc += parseFloat(num), 0 );
    ww = ww.map( x => x/sum );
    ww = ww.map( x => x*remain_w );
    var o = [];
    for (var w of ww) {
      o.push(w);
      o.push(0.01);
    }
    o.pop();
    o = o.map(x => `p{${x}\\linewidth}`);
    if (tablestyle == 'boxed') {
      return `@{}|${o.join('@{}')}|@{}`
    } else if (tablestyle == 'full') {
      for (let i in o) {
        let j = i % 2;
        if (j == 0) { //this is data column, not gap column
          o[i]= `|${o[i]}`;
        }
      }
      return `@{}${o.join('@{}')}|@{}`
    } else {
      return `@{}${o.join('@{}')}@{}`
    }
  }

  toPcolumn2 (margin, gap, ww) {

    /// This version is similar to toPcolumn() except that it expects
    /// two additional arguments. First one is the margin, and the second
    /// one gap.  Both of them should be a number between 0-1 which expresses
    /// the fraction of \linewidth.

    if (!utils.isNumber(margin)) {
      margin = 0.0;
    }

    if (!utils.isNumber(gap)) {
      gap = 0.1;
    }

    var total_w = 1.0;
    total_w -= margin;
    total_w -= margin;
    var num_gaps = ww.length - 1;
    var gap_w = num_gaps * gap ;
    var remain_w = total_w - gap_w;
    var sum = ww.reduce( (acc,num) => acc += parseFloat(num), 0 );
    ww = ww.map( x => x/sum );
    ww = ww.map( x => x*remain_w );
    var o = [];
    o.push(margin);
    for (var w of ww) {
      o.push(w);
      o.push(gap );
    }
    o.pop();
    o.push(margin);
    o = o.map(x => `p{${x}\\linewidth}`);
    return `@{}${o.join('@{}')}@{}`
  }

  solidifyLeadingBackslashSpaces(line) {

    var re = /^(\\\s)+/;
    var v = re.exec(line);
    if (v) {
      var num = v[0].length/2;
      var rep = '~'.repeat(num);
      return `${rep}${line.slice(num*2)}`;
    }
    return line;
  }

  toLatexTableRows(text,tablestyle) {
    var o = [];
    if (tablestyle == '' || tablestyle == 'plain' || tablestyle == 'standard' || tablestyle == 'boxed') {
      if (text.length == 0) {
        o.push('(empty) ');
      } else {
        for (var row of text) {
          o.push(row.join(' & & ') + ' \\\\');
        }
      }

    } else if (tablestyle == 'full') {
      if (text.length == 0) {
        o.push('(empty) ');
      } else {
        let myn = 0;
        for (var row of text) {
          if (myn) {
            o.push('\\hline');
          }
          o.push(row.join(' & & ') + ' \\\\');
          myn++;
        }
      }
    }
    return o.join('\n');
  }

  toTabularXcolumn (maxj, ww, tablestyle) {

    /// given a ww that is a list of ".2 .3 .5" try to figure out
    /// the width of each p-column with an assumed gap between columns
    /// that is .01\linewidth

    /// \begin{tabularx}{\linewidth}{
    /// | >{\hsize=0.5\hsize\raggedright\arraybackslash}X 
    ///  | >{\hsize=0.5\hsize\centering\arraybackslash}X 
    ///  | >{\hsize=2.0\hsize\raggedleft\arraybackslash}X | }
    
    var sum = ww.reduce( (acc,num) => acc += parseFloat(num), 0 );
    ww = ww.map( x => x/sum );
    ww = ww.map( x => x*maxj );
    ww = ww.map(x => `>{\\hsize=${x}\\hsize\\raggedright\\arraybackslash}X`);
    return `${ww.join('')}`;
  }

  toTabularXrows(text,tablestyle) {
    var o = [];
    var k = 0;
    if (tablestyle == 'full') {
      if (text.length == 0) {
        o.push('(empty) ');
      } else {
        for (var row of text) {
          o.push('\\midrule');
          o.push(row.join(' & ') + ' \\\\');
          k++;
        }
      }

    } else {
      if (text.length == 0) {
        o.push('(empty) ');
      } else {
        for (var row of text) {
          if (k==0) { 
            o.push('\\midrule');
          } else {
            o.push('\\noalign{\\medskip}');
          }
          o.push(row.join(' & ') + ' \\\\');
          k++;
        }
      }
    }
    return o.join('\n');
  }

  toTabularyRows(text,tablestyle) {
    var o = [];
    var k = 0;
    if (tablestyle == 'full') {
      if (text.length == 0) {
        o.push('(empty) ');
      } else {
        for (var row of text) {
          if (k) {
            o.push('\\midrule');
          }
          o.push(row.join(' & ') + ' \\\\');
          k++;
        }
      }

    } else {
      if (text.length == 0) {
        o.push('(empty) ');
      } else {
        for (var row of text) {
          if (k) { 
            o.push('\\noalign{\\medskip}');
          } 
          o.push(row.join(' & ') + ' \\\\');
          k++;
        }
      }
    }
    return o.join('\n');
  }

  toLongtabuRows(text,tablestyle) {
    var o = [];
    var k = 0;
    if (tablestyle == 'full') {
      if (text.length == 0) {
        o.push('(empty) ');
      } else {
        for (var row of text) {
          if (k) {
            o.push('\\midrule');
          }
          o.push(row.join(' & ') + ' \\\\');
          k++;
        }
      }

    } else {
      if (text.length == 0) {
        o.push('(empty) ');
      } else {
        for (var row of text) {
          if (k) { 
            o.push('\\noalign{\\medskip}');
          } 
          o.push(row.join(' & ') + ' \\\\');
          k++;
        }
      }
    }
    return o.join('\n');
  }

}

module.exports = { NitrilePreviewLatex };
