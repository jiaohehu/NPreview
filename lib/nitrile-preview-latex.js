'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const path = require('path');
const fs = require('fs');
const fontmap = require('./nitrile-preview-fontmap');

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
      "\}" , "\\}"                 ,
      "-" , "-{}"
    ];
    this.mymapsample = [
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
      "\}" , "\\}"                 ,
      "-" , "-{}"
    ];
  }

  translateLatex (config,xrefs,blocks,isarticle,o) {
    /// the 'blocks' argument is an array of blocks; the 'isarticle'
    /// is a Boolean type set to true only when generating an 'article'
    /// document type, such that HDGS/0 will be treated as the title
    /// of the document and not a chapter.

    ///this.blocks = blocks; /// this line is probably not needed
    /// as it was used before to search for a ref-id given a filename
    o = o || [];
    this.block = [];
    this.xrefs = xrefs;
    this.config = config;
    this.isarticle = isarticle;
    for (var block of blocks) {
      this.block = block;
      const [id,row1,row2,sig,n,data,para,fencecmd,dept,fig,caption,base,label,fname,subrow,plevel] = block;
      const left = `${Math.floor(n/config.stepspaces)*config.stepmargin}cm`;
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
          if (this.isSkippingHdgs(config,dept,cat)) { break; }
          switch (cat) {
            case 0:
              o.push(`\\chapter{${text}}\\label{${label}}`);
              o.push('');
              break;
            case 1:
              o.push(`\\section{${text}}\\label{${label}}`);
              o.push('');
              break;
            case 2:
              o.push(`\\subsection{${text}}\\label{${label}}`);
              o.push('');
              break;
            case 3:
              o.push(`\\subsubsection{${text}}\\label{${label}}`);
              o.push('');
              break;
            case 4:
              o.push(`\\paragraph{${text}}\\label{${label}}`);
              o.push('');
              break;
            default:
              o.push(`\\subparagraph{${text}}\\label{${label}}`);
              o.push('');
              break;
          }
          break;
        }

        case 'PICT':  
          if (this.isSkipping(config,dept)) break;

          if (fencecmd.float) {
            var text = data;
            o.push('\\begin{figure*}\[ht\]');
            o.push('\\centering');
            for (var pp of text) {
              pp = pp.map( x => {
                  var [image,width,opts,src,srcs,sub] = x;
                  if (!src && srcs.length) {
                    src = srcs[0];///TODO: need to change it so that it picks a right format
                  }
                  var { height, frame } = opts;
                  if (height && frame) {
                    return `\\begin{subfigure}[t]{${width}\\linewidth}\\frame{\\includegraphics[height=${height},width=\\linewidth]{${src}}}\\caption{${this.unmask(sub)}}\\end{subfigure}`;
                  } else if (frame) {
                    return `\\begin{subfigure}[t]{${width}\\linewidth}\\frame{\\includegraphics[width=\\linewidth]{${src}}}\\caption{${this.unmask(sub)}}\\end{subfigure}`;
                  } else if (height) {
                    return `\\begin{subfigure}[t]{${width}\\linewidth}\\includegraphics[height=${height},width=\\linewidth]{${src}}\\caption{${this.unmask(sub)}}\\end{subfigure}`;
                  } else {
                    return `\\begin{subfigure}[t]{${width}\\linewidth}\\includegraphics[width=\\linewidth]{${src}}\\caption{${this.unmask(sub)}}\\end{subfigure}`;
                  }
              });

              var sep = '';
              if (fencecmd.spacing && fencecmd.spacing > 0) {
                var sep = '~'.repeat(fencecmd.spacing);
              }

              o.push(pp.join(sep));
              o.push('');
            }
            o.push(`\\caption{${this.unmask(caption)}}\\label{${label}}`);
            o.push('\\end{figure*}');
            o.push('');
            break;

          } else {
            var text = data;
            o.push('\\begin{flushleft}');
            o.push(`\\begin{adjustwidth}{${left}}{}`);
            for (var pp of text) {
              pp = pp.map( x => {
                  var [image,width,opts,src,srcs,sub] = x;
                  if (!src && srcs.length) {
                    src = srcs[0];///TODO: need to change it so that it picks a right format
                  }
                  var { height, frame } = opts;
                  if (height && frame) {
                    return `{\\frame{\\includegraphics[height=${height},width=${width}\\linewidth]{${src}}}}`;
                  } else if (frame) {
                    return `{\\frame{\\includegraphics[width=${width}\\linewidth]{${src}}}}`;
                  } else if (height) {
                    return `{\\includegraphics[height=${height},width=${width}\\linewidth]{${src}}}`;
                  } else {
                    return `{\\includegraphics[width=${width}\\linewidth]{${src}}}`;
                  }
              });

              var sep = '';
              if (fencecmd.spacing && fencecmd.spacing > 0) {
                var sep = '~'.repeat(fencecmd.spacing);
              }

              o.push(pp.join(sep));
            }
            o.push('\\end{adjustwidth}');
            o.push('\\end{flushleft}')
            o.push('');

          }
          break;
         
        case 'TABB': {
          if (this.isSkipping(config,dept)) break;
          var text = data;
          var maxj = this.matrixMaxJ(text);
          if (maxj == 0) {
            maxj = 1;
          }
          var formats = this.toArray(fencecmd.format);
          var text = text.map( pp => this.expandList(pp,maxj,'') );
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
          if (fencecmd.float) {
            if (fencecmd.adjust) {
              var ww = this.toArray(fencecmd.adjust);
              var ww = this.toPcolumns(maxj,ww);
              o.push(`\\begin{table*}`);
              o.push(`\\caption{${this.unmask(caption)}}`);
              o.push(`\\label{${label}}`);
              o.push(`\\centering`);
              o.push(`\\begin{tabular}{${ww.join('')}}`);
              o.push('\\toprule');
            } else {
              var ww = this.expandList([],maxj,'l');
              o.push(`\\begin{table*}`);
              o.push(`\\caption{${this.unmask(caption)}}`);
              o.push(`\\label{${label}}`);
              o.push(`\\centering`);
              o.push(`\\begin{tabular}{${ww.join('')}}`);
              o.push('\\toprule');
            }
          } else {
            if (fencecmd.adjust) {
              var ww = this.toArray(fencecmd.adjust);
              var ww = this.toPcolumns(maxj,ww);
              o.push(`\\begin{flushleft}`);
              o.push(`\\begin{adjustwidth}{${left}}{}`);
              o.push(`\\begin{xtabular}{${ww.join('')}}`);
              o.push('\\toprule');
              var tab = "xtabular";
            } else {
              var ww = this.expandList([],maxj,'l');
              o.push(`\\begin{flushleft}`);
              o.push(`\\begin{adjustwidth}{${left}}{}`);
              o.push(`\\begin{xtabular}{${ww.join('')}}`);
              o.push('\\toprule');
              var tab = "xtabular";
            }
          }
          var rowcount = 0
          for (var pp of text) {
            rowcount += 1;
            var kkm = pp[0].length;
            for (var k=0; k < kkm; ++k) {
              var ppk = pp.map(p => p[k]);
              if (rowcount === 1) {
                var ppk = ppk.map(p => `\\multicolumn{1}{c}{\\textbf{${this.escape(p)}}}`);
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
          if (fencecmd.float) {
            o.push('\\end{tabular}');
            o.push('\\end{table*}');
          } else {
            o.push('\\end{xtabular}');
            o.push('\\end{adjustwidth}');
            o.push('\\end{flushleft}');
          }
          o.push('');
          break;
        }
        case 'QUOT': {
          if (this.isSkipping(config,dept)) break;
          o.push('\\begin{displayquote}');
          o.push(`\\begin{adjustwidth}{${left}}{}`);
          var text = this.unmask(data);
          o.push(text);
          o.push('\\end{adjustwidth}');
          o.push('\\end{displayquote}')
          o.push('');
          break;
        }
        case 'TERM': {
          if (this.isSkipping(config,dept)) break;
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
            o.push(`\\begin{adjustwidth}{${left}}{}`);
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
            o.push(`\\begin{adjustwidth}{${left}}{}`);
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
          if (this.isSkipping(config,dept)) break;
          var text = data;
          var count = text.length;
          if (count == 1) {
            o.push(`\\begin{equation}`);
            o.push(`\\label{${label}}`);
            for (var s of text) {
              o.push(s);  
            }
            o.push(`\\end{equation}`);
            o.push('');
          } else if (count > 1) {
            o.push(`\\begin{subequations}`);
            o.push(`\\label{${label}}`);
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
          if (this.isSkipping(config,dept)) break;
          var text = data;
          o.push(`\\begin{flushleft}`);
          o.push(`\\begin\{adjustwidth\}{${left}}{}`)
          o.push(`\\begin\{description\}\[nosep,style=unboxed,leftmargin=0.5cm,nosep,font=\\normalfont\\ttfamily\]`)
          for (var i=0; i < text.length; ++i) {
            var line = text[i];
            line = this.replaceSubstrings(line,this.mymapsample);
            line = this.fontifyLATEX(line);
            line = this.replaceLeadingBlanks(line,'~');
            o.push(`\\item[${line}]`);
          }
          o.push('\\end\{description\}')
          o.push('\\end\{adjustwidth\}');
          o.push('\\end\{flushleft\}')
          o.push('');
          break;
        }

        case 'CODE':  
          if (this.isSkipping(config,dept)) break;
          
          if (fencecmd.float && fencecmd.slice) {
            var text = data;
            var numbers_text = (fencecmd.n) ? `numbers=left,` : ``;
            const increment = 40;
            for (var k=0; k < text.length; k += increment) {
              if (k == 0) {
                o.push(`\\begin{lstlisting}[float=*,firstnumber=${k+1},${numbers_text} label=${label},caption={${this.unmask(caption)}}]`);
              } else {
                o.push(`\\begin{lstlisting}[float=*,firstnumber=${k+1},${numbers_text} caption={${this.unmask(caption)} (continue)}]`);
              }
              for (var i=0; i < increment && (k+i) < text.length; ++i) {
                var line = text[k+i];
                o.push(line);
              }
              o.push('\\end\{lstlisting\}');
              o.push('');
            }
          } else if (fencecmd.float) {
            var text = data;
            o.push(`\\begin{lstlisting}[float=*,label=${label},caption={${this.unmask(caption)}}]`);
            for (var i=0; i < text.length; ++i) {
              var line = text[i];
              o.push(line);
            }
            o.push('\\end\{lstlisting\}');
            o.push('');

          } else {
            var text = data;
            o.push(`\\begin{flushleft}`);
            o.push(`\\begin\{adjustwidth\}{${left}}{}`)
            var linenum = 0;
            for (var i=0; i < text.length; ++i) {
              var line = text[i];
              line = this.replaceSubstrings(line,this.mymapcode);
              line = this.fontifyLATEX(line);
              var s = `\\mbox{\\ttfamily{}${line}}`;
              linenum = i+1;
              if (fencecmd.n) {
                linenum = ''+linenum; /// convert it into a string
                linenum = this.expandString(linenum,4,'~');
                s = `\\mbox{\\ttfamily{}{\\footnotesize{}${linenum}}${line}}`;
              }
              o.push(`${s}\\\\`);
            }
            if (linenum > 0) {
              o.pop();
              o.push(s);
            }
            o.push('\\end\{adjustwidth\}');
            o.push('\\end\{flushleft\}');
            o.push('');

          }
          break;
         
        case 'VERB': {
          if (this.isSkipping(config,dept)) break;
          var text = data;
          if (fencecmd['frame']) {
            o.push(`\\begin\{Verbatim\}\[xleftmargin=${left},frame=single\]`)
            for (var line of text) {
              o.push(line);
            }
            o.push('\\end\{Verbatim\}')
            o.push('');
          } else {
            o.push(`\\begin\{Verbatim\}\[xleftmargin=${left}\]`)
            for (var line of text) {
              o.push(line);
            }
            o.push('\\end\{Verbatim\}')
            o.push('');
          }
          break;
        }
        case 'VRSE': {
          if (this.isSkipping(config,dept)) break;
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
        case 'DESC': {
          if (this.isSkipping(config,dept)) break;
          var [cat,keys,text,xn] = data;
          const xleft = `${Math.floor(xn/config.stepspaces)*config.stepmargin}cm`;
          text = this.unmask(text);
          o.push(`\\begin{flushleft}`);
          if (cat === 'mono') {
            o.push(`\\begin{description}\[nosep,style=unboxed,leftmargin=${xleft},font=\\normalfont\\ttfamily\\bfseries\]`);
          } else if (cat === 'strong') {
            o.push(`\\begin{description}\[nosep,style=unboxed,leftmargin=${xleft},font=\\normalfont\\bfseries\]`);
          } else {
            o.push(`\\begin{description}\[nosep,style=unboxed,leftmargin=${xleft},font=\\normalfont\\bfseries\\itshape\]`);
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
          if (this.isSkipping(config,dept)) break;
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
          if (this.isSkipping(config,dept)) break;
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
          if (this.isSkipping(config,dept)) break;
          o.push('\\begin\{flushleft\}')
          o.push(`\\begin\{adjustwidth\}{${left}}{}`)
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
                  o.push(`\\begin{enumerate}[nosep,leftmargin=${config.stepmargin}cm]`);
                  o.push(`\\item\[${bullet}.\] ${text}`);
                  break;
                }
                case 'UL': {
                  o.push(`\\begin{itemize}[nosep,leftmargin=${config.stepmargin}cm]`);
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
          if (this.isSkipping(config,dept)) break;
          if (config.parskip || config.stepspaces <= n) {
            o.push('\\begin\{flushleft\}')
            o.push(`\\begin\{adjustwidth\}{${left}}{}`)
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
          return `${this.escape(cnt)}(\\url{${href}})`
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
        return `\\ref{${text}}`;
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
            w = 'p{\\textwidth}';
          } else {
            w = `p{${w}\\textwidth}`;
          }
        } else {
          w = ''+w;
          w = parseFloat(w);
          acc_w += w;
          if (w == 1) {
            w = 'p{\\textwidth}';
          } else {
            w = `p{${w}\\textwidth}`;
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
            w = `\\hsize=${w}\\hsize\\textwidth=\\hsize`;
          }
        } else {
          w = ''+w;
          w = parseFloat(w);
          acc_w += w;
          w *= x_count;
          if (w == 1) {
            w = '';
          } else {
            w = `\\hsize=${w}\\hsize\\textwidth=\\hsize`;
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

  toPcolumns (x_count,ww) {

    var n = x_count;
    var def_w = 1;
    var acc_w = 0;
    var o = [];
    for (var k=0; k < x_count; ++k) {
      var w = ww[k];
      if (!w) {
        if (n > 0) {
          def_w = (1.0 - acc_w)/n;
          n = 0;
        }
        if (def_w < 0.1) {
          def_w = 0.1;
        }
        w = def_w;
        if (w == 1) {
          w = '\\textwidth';
        } else {
          w = `${w}\\textwidth`;
        }
      } else {
        w = ''+w;
        w = parseFloat(w);
        acc_w += w;
        if (w == 1) {
          w = '\\textwidth';
        } else {
          w = `${w}\\textwidth`;
        }
        n -= 1;
      }
      o.push(`p{${w}}`);
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

  toRequiredPackages (texfamily) {

    if (texfamily.toLowerCase() == 'pdflatex') {
      return `\\usepackage[utf8]{inputenc}
\\usepackage{CJKutf8,pinyin}
\\usepackage[overlap,CJK]{ruby}
\\newcommand*{\\cn}[1]{\\begin{CJK}{UTF8}{gbsn}#1\\end{CJK}}
\\newcommand*{\\tw}[1]{\\begin{CJK}{UTF8}{bsmi}#1\\end{CJK}}
\\newcommand*{\\jp}[1]{\\begin{CJK}{UTF8}{min}#1\\end{CJK}}
\\newcommand*{\\kr}[1]{\\begin{CJK}{UTF8}{mj}#1\\end{CJK}}
\\usepackage{graphicx}
\\usepackage{subcaption}
\\usepackage{caption}
\\usepackage{paralist}
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
\\usepackage{tabulary}
\\usepackage{csquotes}
\\renewcommand{\\rubysize}{0.5}
\\renewcommand{\\rubysep}{0.0ex}`

    } else {

      return `\\usepackage{luatexja-fontspec}
\\usepackage{luatexja-ruby}
\\newjfontfamily\\cn{arplsungtilgb}
\\newjfontfamily\\tw{arplmingti2lbig5}
\\newjfontfamily\\jp{ipaexmincho}
\\newjfontfamily\\kr{baekmukbatang}
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
\\usepackage{tabulary}
\\usepackage{csquotes}
\\usepackage{float}
\\floatstyle{plaintop}
\\newfloat{program}{thp}{lop}
\\floatname{program}{Program}
`

    }

  }

}

module.exports = { NitrilePreviewLatex };
