'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const path = require('path');
const fs = require('fs');
const fontmap = require('./nitrile-preview-fontmap');

class NitrilePreviewLatex extends NitrilePreviewParser {

  constructor() {
    super();
    this.lstnum = 0;
    this.title = '';
    this.author = '';
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
      "\}" , "\\}"
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
      "\}" , "\\}"
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
          var maxj = this.matrixMaxJ(data);
          if (maxj == 0) {
            maxj = 1;
          }
          var text = data.map( pp => this.expandRow(pp,maxj,'') );
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
          var ll = this.expandRow([],maxj,'l');
          o.push(`\\begin{adjustwidth}{${left}}{}`);
          o.push(`\\begin{xtabular}{|${ll.join('|')}|}`);
          o.push('\\hline');
          for (var pp of text) {
            var kkm = pp[0].length;
            for (var k=0; k < kkm; ++k) {
              var ppk = pp.map(p => p[k]);
              o.push(ppk.join(' & ') + ' \\\\');
            }
            o.push('\\hline');
          }
          if (text.length == 0) {
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
          var [keys,text,xn] = data;
          var xleft = `${step*xn}cm`;
          text = this.unmask(text);
          o.push(`\\begin{flushleft}`);
          o.push(`\\begin{description}\[nosep,leftmargin=${xleft},font=\\normalfont\\ttfamily\\bfseries\]`);
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
}

module.exports = { NitrilePreviewLatex };

