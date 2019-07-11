'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const path = require('path');
const fs = require('fs');
const fontmap = require('./nitrile-preview-fontmap');

class NitrilePreviewLatex extends NitrilePreviewParser {

  constructor() {
    super();
    this.lstnum = 0;
    this.mymap = [
      "’"  , "'"                   ,
      "“"  , "\""                  ,
      "”"  , "\""                  ,
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
      "\}" , "\\}"                 ,
      "-" , "-{}"
    ];
  }

  translate (config,blocks,isarticle,o) {
    /// the 'blocks' argument is an array of blocks; the 'isarticle'
    /// is a Boolean type set to true only when generating an 'article'
    /// document type, such that HDGS/0 will be treated as the title
    /// of the document and not a chapter.

    ///this.blocks = blocks; /// this line is probably not needed
    /// as it was used before to search for a ref-id given a filename
    o = o || [];
    const step = config['step'];
    const indentMargin = config['indentMargin'];
    const flushLeftParagraph = config['flushLeftParagraph'];
    this.heading = '';
    this.block = [];
    for (var block of blocks) {
      this.block = block;
      const [id,row1,row2,type,n,data,para,fencecmd,refname,caption,fname,plevel] = block;
      const left = `${Math.floor(n/step)*indentMargin}cm`;
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
                // do nothing
              } else {
                o.push(`\\chapter{${text}}\\label{${id}}`);
                o.push('');
              }
              this.heading = 'CHAPTER';
              break;
            case 1:
              o.push(`\\section{${text}}\\label{${id}}`);
              o.push('');
              this.heading = 'SECTION';
              break;
            case 2:
              o.push(`\\subsection{${text}}\\label{${id}}`);
              o.push('');
              this.heading = 'SUBSECTION';
              break;
            case 3:
              o.push(`\\subsubsection{${text}}\\label{${id}}`);
              o.push('');
              this.heading = 'SUBSUBSECTION';
              break;
            case 4:
              o.push(`\\paragraph{${text}}\\label{${id}}`);
              o.push('');
              this.heading = 'PARAGRAPH';
              break;
            default:
              o.push(`\\subparagraph{${text}}\\label{${id}}`);
              o.push('');
              this.heading = 'SUBPARAGRAPH';
              break;
          }
          break;
        }
        case 'PICT': {
          var text = data;
          if (fencecmd.figure) {
            o.push('\\begin{figure}\[ht\]');
            o.push('\\centering');
            o.push(`\\label{id}`);
            for (var pp of text) {
              const [what,opts,srcs,sub] = pp;
              if (what === 'image') {
                var src = srcs[0];
                var {width} = opts;
                if (!width) { width = '1in' }
                o.push(`\\begin{subfigure}\[b\]{${width}}`);
                o.push(`\\includegraphics\[width=\\textwidth\]{${src}}`);
                o.push(`\\caption{${this.unmask(sub)}}`);
                o.push(`\\end{subfigure}`);
              } else {
                o.push('');
              }
            }
            o.push(`\\caption{${this.unmask(caption)}}`);
            o.push('\\end{figure}');
            o.push('');
          } else {
            o.push('\\begin{flushleft}');
            o.push(`\\begin{adjustwidth}{${left}}{}`);
            for (var pp of text) {
              const [what,opts,srcs,sub] = pp;
              if (what === 'image') {
                var {width,height,frame} = opts;
                if (width) {
                  var v =  width.match(/^(\d+)\%$/);
                  if (v) {
                    width = `${+v[1]/100.0}\\linewidth`;
                  }
                }
                var src = srcs[0];
                var s = '';
                if (width && height) {
                  var s = `\\includegraphics\[width=${width},height=${height}\]{${src}}`;
                } else if (width) {
                  var s = `\\includegraphics\[width=${width}\]{${src}}`;
                } else if (height) {
                  var s = `\\includegraphics\[height=${height}\]{${src}}`;
                } else {
                  var s = `\\includegraphics{${src}}`;
                }
                if (s && frame === '1') {
                  var s = `\\frame{${s}}`;
                }
                o.push(s);
              } else {
                o.push('');
              }
            }
            o.push('\\end{adjustwidth}');
            o.push('\\end{flushleft}')
            o.push('');
          }
          break;
        }
        case 'TABB': {
          var text = data;
          var maxj = this.matrixMaxJ(text);
          if (maxj == 0) {
            maxj = 1;
          }
          var formats = this.toList(fencecmd.format);
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
          if (fencecmd.adjust) {
            var ww = this.toList(fencecmd.adjust);
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
          o.push(`\\end{${tab}}`);
          o.push('\\end{adjustwidth}');
          o.push('\\end{flushleft}');
          o.push('');
          break;
        }
        case 'TERM': {
          o.push('\\begin{flushleft}');
          o.push(`\\begin{adjustwidth}{${left}}{}`);
          o.push(`\\begin{description}\[nosep,font=\\normalfont\\ttfamily]`);
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
        case 'SPEC': {
          var text = data;
          var ll = this.expandList([],2,'L');
          if (fencecmd.adjust) {
            var ww = this.toList(fencecmd.adjust);
            var ll = this.toXtabularAligns(ll,ww);
          } else {
            var ww = this.toList('0.3 0.7');
            var ll = this.toXtabularAligns(ll,ww);
          }
          o.push(`\\begin{flushleft}`);
          o.push(`\\begin{adjustwidth}{${left}}{}`);
          o.push(`\\begin{xtabular}{@{}${ll.join('')}@{}}`);
          o.push(`\\toprule`);
          for (var i=0; i < text.length; i+=2) {
            var dt = text[i];
            var dd = text[i+1];
            if (i == 0) {
              dt = this.escape(dt);
              dd = this.escape(dd);
              o.push(`\\multicolumn{1}{c}{\\textbf{${dt}}} & \\multicolumn{1}{c}{\\textbf{${dd}}} \\\\`);
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
          break;
        }
        case 'CODE': {
          var text = data;
          if (fencecmd.listing) {

            o.push(`\\begin{lstlisting}[label=${id},caption=${this.unmask(caption)}]`);
            this.lstnum += 1;
            for (var i=0; i < text.length; ++i) {
              var line = text[i];
              o.push(line);
            }
            o.push('\\end\{lstlisting\}');
            o.push('');

          } else if (fencecmd.n) {

            o.push(`\\begin{flushleft}`);
            o.push(`\\begin\{adjustwidth\}{${left}}{}`)
            var linenum = 0;
            for (var i=0; i < text.length; ++i) {
              var line = text[i];
              line = this.replaceSubstrings(line,this.mymapcode);
              line = this.fontifyLATEX(line);
              var linenum = i+1;
              linenum = ''+linenum; /// convert it into a string
              linenum = this.expandString(linenum,4,'~');
              if (i === text.length-1) {
                o.push(`\\mbox{\\ttfamily{}{\\footnotesize{}${linenum}}${line}}`);

              } else {
                o.push(`\\mbox{\\ttfamily{}{\\footnotesize{}${linenum}}${line}}\\\\`);
              }
            }
            o.push('\\end\{adjustwidth\}');
            o.push('\\end\{flushleft\}');
            o.push('');

          } else {

            o.push(`\\begin{flushleft}`);
            o.push(`\\begin\{adjustwidth\}{${left}}{}`)
            for (var i=0; i < text.length; ++i) {
              var line = text[i];
              line = this.replaceSubstrings(line,this.mymapcode);
              line = this.fontifyLATEX(line);
              if (i === text.length-1) {
                o.push(`\\mbox{\\ttfamily{}${line}}`);

              } else {
                o.push(`\\mbox{\\ttfamily{}${line}}\\\\`);

              }
            }
            o.push('\\end\{adjustwidth\}');
            o.push('\\end\{flushleft\}');
            o.push('');
          }
          break;
        }
        case 'VERB': {
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
          var [cat,keys,text,xn] = data;
          var xleft = `${step*xn}cm`;
          text = this.unmask(text);
          o.push(`\\begin{flushleft}`);
          if (cat === 'mono') {
            o.push(`\\begin{description}\[nosep,leftmargin=${xleft},font=\\normalfont\\ttfamily\\bfseries\]`);
          } else if (cat === 'strong') {
            o.push(`\\begin{description}\[nosep,leftmargin=${xleft},font=\\normalfont\\bfseries\]`);
          } else {
            o.push(`\\begin{description}\[nosep,leftmargin=${xleft},font=\\normalfont\\bfseries\\itshape\]`);
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
                  o.push(`\\begin{enumerate}[nosep,leftmargin=${indentMargin}cm]`);
                  o.push(`\\item\[${bullet}.\] ${text}`);
                  break;
                }
                case 'UL': {
                  o.push(`\\begin{itemize}[nosep,leftmargin=${indentMargin}cm]`);
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
        case 'ERRO': {
          o.push('\\begin{flushleft}');
          o.push('=== ERROR === : ');
          o.push(this.escape(data));
          o.push('\\end{flushleft}');
          o.push('');
          break;
        }
        case '!BOOK': {
          o.push('\\begin{Verbatim}');
          for (var text of para) {
            o.push(text);
          }
          o.push('\\end{Verbatim}');
          o.push('');
          break;
        }
        default: {
          if (this.heading === 'PARAGRAPH' || this.heading === 'SUBPARAGRAPH') {
            this.heading = '';
            if (data) {
              o.pop(); // get rid of the empty line
              o.push(this.unmask(data));
              o.push('');
            } else {
              // this is to cancel out the previous paragraph or subparagraph so
              // that it does not affect the future text blocks
              o.pop(); // get rid of the empty line
              o.push('\\mbox{}');
              o.push('');
            }
          } else if (data) {
            if (flushLeftParagraph ||
                n > 0 ) {
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
\\usepackage{booktabs}
\\usepackage{xtab}
\\usepackage{ltablex}
\\usepackage{tabulary}
\\usepackage{csquotes}`

    }

  }

  readFileAsync (filename) {

    /// Returns a Promise that resolves to a string of 
    /// the entire file content being read

    return new Promise((resolve, reject)=>{
        fs.readFile(filename, "utf8", function(err, data) {
                if (err) {
                  console.error(err.toString());
                  reject(err.toString());
                } else {
                  resolve(data.toString());
                }
        });
    });
  }

  writeFileAsync (filename, data) {

    /// Returns a Promise that resolves to a string of 
    /// the entire file content being read

    return new Promise((resolve, reject)=>{
        fs.writeFile(filename, data, 'utf8', function(err) {
                if (err) {
                  console.error(err.toString());
                  reject(err.toString());
                } else {
                  resolve();
                }
        });
    });
  }

  async convert (filename) {

    var out = await this.readFileAsync('my.md');
    let lines = out.split('\n');
    let [blocks,flags] = this.toBLOCKS(lines,'my',0);

    /// get the properties from configSchema
    var config = {};
    var schema = pjson.configSchema;
    for (var key in schema) {
      if (schema.hasOwnProperty(key)) {
        config[key] = this.getConfig(key,flags,schema);
        console.log(key+' '+config[key]);
      }
    }

    /// does translation with config and blocks
    let olines = this.translate(config,blocks,true);

    /// construct the final LATEX file
    let title = flags.title ? flags.title : 'Untitled'
    let author = flags.author ? flags.author : ''
    let data = `% !TEX program = ${config.texFamily}
\\documentclass{article}
${this.toRequiredPackages(config.texFamily)}
\\title{${title}}
\\author{${author}}
\\begin{document}
\\maketitle
${olines.join('\n')}
\\end{document}\n`;

    /// write to the outfile
    let outfilename = `${filename}.tex`;
    await this.writeFileAsync(outfilename, data);
    console.log(`write to ${outfilename}`);

  }

}

module.exports = { NitrilePreviewLatex };
