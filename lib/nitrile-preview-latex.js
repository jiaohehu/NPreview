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

  translate (blocks,isarticle,o) {
    /// the 'blocks' argument is an array of blocks; the 'isarticle'
    /// is a Boolean type set to true only when generating an 'article'
    /// document type, such that HDGS/0 will be treated as the title
    /// of the document and not a chapter.

    ///this.blocks = blocks; /// this line is probably not needed
    /// as it was used before to search for a ref-id given a filename
    o = o || [];
    const step = 0.25;
    this.heading = '';
    this.block = [];
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
          var [cat,text,flags] = data;
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
        case 'FIGE': {
          o.push('\\begin{figure}\[ht\]');
          o.push('\\centering');
          o.push(`\\label{${id}}`);
          for (var pp of data) {
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
          o.push(`\\caption{${this.unmask(ins_text)}}`);
          o.push('\\end{figure}');
          o.push('');
          break;
        }
        case 'PICT': {
          o.push('\\begin{flushleft}');
          o.push(`\\begin{adjustwidth}{${left}}{}`);
          for (var pp of data) {
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
          break;
        }
        case 'TABB': {
          var [text,fencecmd] = data;
          var styles = this.toList(fencecmd.style);
          var maxj = this.matrixMaxJ(text);
          if (maxj == 0) {
            maxj = 1;
          }
          var text = text.map( pp => this.expandRow(pp,maxj,'') );
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
          if (fencecmd.longtable) {
            var ll = this.expandRow(this.toList(fencecmd.column),maxj,'L');
            var ww = this.toList(fencecmd.adjust);
            var ll = this.columnsToLongTableCellStyles(ll,ww);
            o.push(`\\begin{adjustwidth}{${left}}{}`);
            if (fencecmd.rules) {
              o.push(`\\begin{tabularx}{\\textwidth}{|${ll.join('|')}|}`);
              o.push('\\toprule');
            } else {
              o.push(`\\begin{tabularx}{\\textwidth}{${ll.join('')}}`);
              o.push('\\toprule');
            }
          } else {
            var ll = this.expandRow(this.toList(fencecmd.column),maxj,'L');
            var ll = this.columnsToTableCellStyles(ll);
            o.push(`\\begin{adjustwidth}{${left}}{}`);
            if (fencecmd.rules) {
              o.push(`\\begin{tabulary}{\\textwidth}{|${ll.join('|')}|}`);
              o.push('\\toprule');
            } else {
              o.push(`\\begin{tabulary}{\\textwidth}{${ll.join('')}}`);
              o.push('\\toprule');
            }
          }
          var rowcount = 0
          for (var pp of text) {
            rowcount += 1;
            var kkm = pp[0].length;
            for (var k=0; k < kkm; ++k) {
              var ppk = pp.map(p => p[k]);
              if (rowcount === 1) {
                var ppk = ppk.map(p => this.escape(p));
                var ppk = ppk.map((p,i) => {
                  if (fencecmd.rules) {
                    if (i==0) {
                      return `\\multicolumn{1}{|c|}{\\textbf{${p}}}`;
                    } else {
                      return `\\multicolumn{1}{c|}{\\textbf{${p}}}`;
                    }
                  } else {
                    return `\\multicolumn{1}{c}{\\textbf{${p}}}`;
                  }
                });
                o.push(ppk.join(' & ') + ' \\\\');
              } else {
                var ppk = ppk.map((p,i) => this.style(styles[i],p));
                o.push(ppk.join(' & ') + ' \\\\');
              }
            }
            if (fencecmd.rules) {
              o.push('\\midrule');
            } else {
              if (rowcount === 1) {
                o.push('\\midrule');
              }
            }
          }
          if (fencecmd.rules) {
            if (rowcount > 0) {
              o.pop();
            }
            o.push('\\bottomrule');
          } else {
            o.push('\\bottomrule');
          }
          if (text.length == 0) {
            o.push('(empty)\\\\');
          }
          if (fencecmd.longtable) {
            o.push('\\end{tabularx}');
            o.push('\\end{adjustwidth}');
            o.push('');
          } else {
            o.push('\\end{tabulary}');
            o.push('\\end{adjustwidth}');
            o.push('');
          }
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
          o.push(`\\begin{adjustwidth}{${left}}{}`);
          o.push(`\\begin{tabularx}{\\textwidth}{>{\\raggedright\\arraybackslash\\hsize=0.4\\hsize\\textwidth=\\hsize}X>{\\raggedright\\arraybackslash\\hsize=1.6\\hsize\\textwidth=\\hsize}X}`);
          o.push(`\\toprule`);
          for (var i=0; i < data.length; i+=2) {
            var dt = data[i];
            var dd = data[i+1];
            if (i == 0) {
              dt = this.escape(dt);
              dd = this.escape(dd);
              o.push(`\\multicolumn{1}{c}{\\textbf{${dt}}} & \\multicolumn{1}{c}{\\textbf{${dd}}} \\\\`);
              o.push(`\\midrule`);
              o.push(`\\endhead`);
            } else {
              dt = this.style('mono',dt);
              dd = this.unmask(dd);
              o.push(`${dt} & ${dd} \\\\`);
            }
          }
          o.push(`\\bottomrule`);
          o.push(`\\end{tabularx}`);
          o.push(`\\end{adjustwidth}`);
          o.push('');
          break;
        }
        case 'LSTG': {
          o.push(`\\begin{lstlisting}[label=${id},caption=${this.unmask(ins_text)}]`);
          this.lstnum += 1;
          for (var i=0; i < data.length; ++i) {
            var text = data[i];
            o.push(text);
          }
          o.push('\\end\{lstlisting\}');
          o.push('');
          break;
        }
        case 'CODE': {
          var [text,fencecmd] = data;
          if (fencecmd['n']) {
            o.push(`\\begin{flushleft}`);              
            o.push(`\\begin\{adjustwidth\}{${left}}{}`)    
            var linenum = 0;
            for (var i=0; i < text.length; ++i) {
              var line = text[i];
              line = this.replaceSubstrings(line,this.mymapcode);                 
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
          var [text,fencecmd] = data;
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
            o.push('\\begin\{flushleft\}')
            o.push(`\\begin\{adjustwidth\}{${left}}{}`)
            o.push(this.unmask(data));
            o.push(`\\end{adjustwidth}`);
            o.push('\\end\{flushleft\}')
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

  columnsToLongTableCellStyles (ll,ww) {
console.log(ww);

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
console.log('n');
console.log(n);
console.log('def_w');
console.log(def_w);
            n = 0;
          }
          w = def_w;
          w *= x_count;
console.log('n');
console.log(n);
console.log('w');
console.log(w);
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
console.log(o);
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
}

module.exports = { NitrilePreviewLatex };

