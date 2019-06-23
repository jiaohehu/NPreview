'use babel';

const { SphinxPreviewParser } = require('./sphinx-preview-parser');

class SphinxPreviewLatex extends SphinxPreviewParser {

  constructor() {
    super();
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
    console.log(this.mymap);
  }

  /*
  Return a string that is the HTML
  */
  toTEXT (lines) {
    var blocks = this.toBLOCKS(lines);
    var o = [];
    for (var block of blocks) {
      const [id,row1,row2,type,n,para] = block;
      switch (type) {
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
  }

}




