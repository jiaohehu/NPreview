'use babel';

const re_token = /\\\;|\\\,|\\\:|\\\\|\\\{|\\\}|\\begin\{\w+\}|\\end\{\w+\}|(\\mathscr|\\mathcal|\\mathbf|\\mathbb|\\mathrm|\\mathit)\s*\{[A-Za-z0-9]*\}|\\[a-zA-Z]+|./g;
const pjson = require('./nitrile-preview-math.json');
const char_widths = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.2796875,0.2765625,0.3546875,0.5546875,0.5546875,0.8890625,0.665625,0.190625,0.3328125,0.3328125,0.3890625,0.5828125,0.2765625,0.3328125,0.2765625,0.3015625,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.2765625,0.2765625,0.584375,0.5828125,0.584375,0.5546875,1.0140625,0.665625,0.665625,0.721875,0.721875,0.665625,0.609375,0.7765625,0.721875,0.2765625,0.5,0.665625,0.5546875,0.8328125,0.721875,0.7765625,0.665625,0.7765625,0.721875,0.665625,0.609375,0.721875,0.665625,0.94375,0.665625,0.665625,0.609375,0.2765625,0.3546875,0.2765625,0.4765625,0.5546875,0.3328125,0.5546875,0.5546875,0.5,0.5546875,0.5546875,0.2765625,0.5546875,0.5546875,0.221875,0.240625,0.5,0.221875,0.8328125,0.5546875,0.5546875,0.5546875,0.5546875,0.3328125,0.5,0.2765625,0.5546875,0.5,0.721875,0.5,0.5,0.5,0.3546875,0.259375,0.353125,0.5890625];
const my_valid_fence_ids = [ "myLB",     "myRB",     "myLBR",    "myRBR",    "myLLBR",   "myRRBR",   "myLANGLE", "myRANGLE", "myLPAREN", "myRPAREN", "myLVERT",  "myRVERT",  "myLLVERT", "myRRVERT", "myLCEIL",  "myRCEIL",  "myLFLOOR", "myRFLOOR" ];
const re_fontvariants = /^\\(mathit|mathrm|mathscr|mathbf|mathbb|mathcal)\s*\{(.*)\}$/;
const re_variable = /^[A-Za-z]$/;
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');

class NitrilePreviewLmath extends NitrilePreviewTokenizer {

  constructor (parser) {
    super(parser);
  }

  parse (str, isdisplaymath = false) {
    this.used.clear();
    this.isdisplaymath = isdisplaymath;
    var l = this.toTokens(str);
    var g = this.toGroups(l);
    var g = this.toCleanup(g);
    var g = this.toCommands(g);
    var g = this.toSubsup(g);
    var s = this.toSvg(g);
    return s;
  }

  toInnerSvg (v, compact=false) {

    /// 'v': is an element, such as '\alpha', '1', '+', or a group,
    /// such as: '\\brace',     [Array], '', '', ...
    /// or:      '\\leftright', [Array], '[', ']', ...
    /// or:      '\\beginend',  [Array], 'pmatrix', 'pmatrix', ...
    ///
    /// The return value of this function is an array of seven elements:
    ///           var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(...)
    ///  w_    this is a number expressing the width of the SVG in terms of pt
    ///  h_    this is a number expressing the height of the SVG in terms of pt
    ///  mid_  this is a number expresses vertically shift has to be in order to
    //         align this element with neighboring elements in a row.
    ///        It is a number expressing the distance from the top, in the unit of pt
    ///  s_    this is a string expressing a SVG element such as "<text> ... </text>"
    ///        or "<line />", or "<svg> ... </svg>"
    ///  g_    this is usually the same as the op= attribute of the element
    ///        that gives hint about whether it needs to add gaps before
    ///        and/or after this element
    ///  q_    this is a flag of 0/1 indicating whether a gap is forced after
    ///        this element, such as after a summation symbol.
    ///  id_   this is a string that is set to be the same as the id= attribute
    //         of the symbol; this is useful to let us know what symbol we are current
    //         laying out so we can space it accordingly. So far the only usage is
    //         when an open-parenthesis symbol is detected and the previous symbol is \log or
    //         like, the gap between the previous symbol and this open-parenthesis is
    //         suppressed; otherwise the gap is preserved;

    var x = 0;
    var y = 0;
    var w = 0;
    var h = 12;
    var mid = 6;
    var s = '';
    if (v === undefined || v === null) {
      var s = `<use x='0' y='0' xlink:href='#myUDQU' />`
      this.used.add('myUDQU');
      return [8,12,6,s,0,0,''];
    } else if (v === '') {
      return [0,0,0,'',0,0,''];
    } else if (v === '\\displaystyle') {
      this.isdisplaymath = true;
      return [0,0,0,'',0,0,''];
    } else if (Array.isArray(v)) {
      switch (v[0]) {

        case '\\beginend': {

          var name = v[2];
          if (name == 'cases' || 'matrix' || name == 'pmatrix' || name == 'bmatrix' || name == 'Bmatrix' || name == 'vmatrix' || name == 'Vmatrix' ) {
            this.isinmatrix = true;
            var o = [];
            var p = this.splitArray(v[1]);
            var nrow = p.length;
            var ncol = p.map(d => d.length).reduce((cur,acc) => Math.max(cur,acc));
            for (let i=0; i < nrow; ++i) {
              var ss = [];
              for (let j=0; j < ncol; ++j) {
                let pv = p[i][j];
                if (pv) {
                  var {s: s1} = this.toInnerSvg(['\\brace',pv,'','',''],compact);
                  ss.push(s1);
                }
              }
              ss = ss.join(' \\NC ');
              ss = `\\NC ${ss} \\NR`;
              o.push(ss);
            }
            var s = o.join('\n');
            this.isinmatrix = false;
            ///now we need to add some fences for
            ///    matrix
            ///    pmatrix
            ///    bmatrix
            ///    Bmatrix
            ///    vmatrix
            ///    Vmatrix
            var fence1 = '';
            var fence2 = '';
            if (name == 'pmatrix') {
              fence1 = '(';
              fence2 = ')';
            } else if (name == 'bmatrix') {
              fence1 = '[';
              fence2 = ']';
            } else if (name == 'Bmatrix') {
              fence1 = '\\{';
              fence2 = '\\}';
            } else if (name == 'vmatrix') {
              fence1 = '\\vert';
              fence2 = '\\vert';
            } else if (name == 'Vmatrix') {
              fence1 = '\\Vert';
              fence2 = '\\Vert';
            } else {
              fence1 = '';
              fence2 = '';
            }
            o = [];
            if(name == 'cases'){
              o.push(`\\startcases[]`);
              o.push(s);
              o.push(`\\stopcases`);
              var s = o.join('\n');
              return {s};
            } else {
              var left = '';
              var right = '';
              if (fence1) { var left = `\\left${fence1}\\,`; }
              if (fence2) { var right = `\\,\\right${fence2}`; }
              o.push(`\\startmatrix[left={${left}},right={${right}}]`);
              o.push(s);
              o.push(`\\stopmatrix`);
              var s = o.join('\n');
              return {s};
            }
          } else {
            ///turn it into a \\brace command
            return this.toInnerSvg(['\\brace',v[1],'','',v[4]],compact);
          }
          break;
        }

        case '\\math':
        case '\\brace':
        case '\\leftright':

          this.bracelevel += 1;
          var g = v[1];
          var results = g.map( x => this.toInnerSvg(x,compact) );
          var s = '';
          var o = [];
          if (v[0] === '\\math') {
            this.bracelevel -= 1;
            var ss = results.map( x => x.s );
            var s = ss.join(' ');
            var s = `${s}`;
            return {s};
          } else if (v[0] === '\\brace') {
            this.bracelevel -= 1;
            var ss = results.map( x => x.s );
            var s = ss.join(' ');
            var s = `{${s}}`;
            return {s};
          } else {
            this.bracelevel -= 1;
            var ss = results.map( x => x.s );
            var s = ss.join(' ');
            var fence1 = v[2];
            var fence2 = v[3];
            /// corrections
            if (fence1 === '\\\{') fence1 = '\\lbrace';
            if (fence1 === '\\\}') fence1 = '\\rbrace';
            if (fence2 === '\\\{') fence2 = '\\lbrace';
            if (fence2 === '\\\}') fence2 = '\\rbrace';
            /// corrections
            if (fence1 === '[') fence1 = '\\lbrack';
            if (fence1 === ']') fence1 = '\\rbrack';
            if (fence2 === '[') fence2 = '\\lbrack';
            if (fence2 === ']') fence2 = '\\rbrack';
            /// corrections
            if (fence1 === '\\lparen') fence1 = '(';
            if (fence1 === '\\rparen') fence1 = ')';
            if (fence2 === '\\lparen') fence2 = '(';
            if (fence2 === '\\rparen') fence2 = ')';
            /// corrections
            if (fence1 === '.') fence1 = '.';
            if (fence2 === '.') fence2 = '.';
            s =  `\\left${fence1} ${s} \\right${fence2}`;
            return {s};
          }
          break;

        case '\\operatorname':
          /// all these are text only
          var v1 = v[1];
          var str = '';
          if (Array.isArray(v1)) {
            if (v1[0] === '\\brace') {
              str = v1[4];
            } else {
              str = '';
            }
          } else {
            str = ''+v1;/// ensure this is text
          }
          var s = `{\\:\\mathrm{${str}}\\:}`;
          return {s};
          break;

        case '\\text':
        case '\\dot':
        case '\\ddot':
        case '\\dddot':
        case '\\ddddot':
        case '\\bar':
        case '\\vec':
        case '\\mathring':
        case '\\hat':
        case '\\check':
        case '\\grave':
        case '\\acute':
        case '\\breve':
        case '\\tilde':
          /// all these are text only
          var v1 = v[1];
          var str = '';
          if (Array.isArray(v1)) {
            if (v1[0] === '\\brace') {
              str = v1[4];
            } else {
              str = '';
            }
          } else {
            str = ''+v1;/// ensure this is text
          }
          var s = `${v[0]}{${str}}`;
          return {s};
          break;

        case '\\dif':
          /// \dif{x}
          var {s: s1} = this.toInnerSvg(v[1],compact);
          var s = `\\mathrm{d}\\mathit{${s1}}`;
          return {s};
          break;

        case '\\od':
          // 2 arguments, 1 option
          var opt = v[1];
          var {s: s1} = this.toInnerSvg(v[2],compact);
          var {s: s2} = this.toInnerSvg(v[3],compact);
          if (opt) {
            var s = `\\frac{\\mathrm{d}^{${opt}}${s1}}{\\mathrm{d}\\mathit${s2}^{${opt}}}`
            return {s};
          } else {
            var s = `\\frac{\\mathrm{d}${s1}}{\\mathrm{d}\\mathit${s2}}`
            return {s};
          }
          break;

        case '\\pd':
          // 2 arguments, 1 option
          var opt = v[1];
          var {s: s1} = this.toInnerSvg(v[2],compact);
          var {s: s2} = this.toInnerSvg(v[3],compact);
          if (opt) {
            var s = `\\frac{\\mathrm{\\partial}^{${opt}}${s1}}{\\mathrm{\\partial}\\mathit${s2}^{${opt}}}`
            return {s};
          } else {
            var s = `\\frac{\\mathrm{\\partial}${s1}}{\\mathrm{\\partial}\\mathit${s2}}`
            return {s};
          }
          break;

        case '\\sqrt':
          /// 1 argument, 1 option
          var opt = v[1];
          var {s: s1} = this.toInnerSvg(v[2],compact);
          if (opt) {
            var s =          `${v[0]}[${opt}]{${s1}}`;
            return {s};
          } else {
            var s =          `${v[0]}{${s1}}`;
            return {s};
          }

        case '\\widehat':
        case '\\overline':
        case '\\overleftrightarrow':
        case '\\overrightarrow':
          /// 1 arguments, 0 option
          var {s: s1} = this.toInnerSvg(v[1],compact);
          var s =          `${v[0]}{${s1}}`;
          return {s};
          break;

        case '\\binom':
        case '\\frac':
          /// 2 arguments, 0 option
          var {s: s1} = this.toInnerSvg(v[1],compact);
          var {s: s2} = this.toInnerSvg(v[2],compact);
          var s =          `${v[0]}{${s1}}{${s2}}`;
          return {s};
          break;

        case '\\sub':
          /// 2 arguments, 0 option
          var {s: s1} = this.toInnerSvg(v[1],compact);
          var {s: s2} = this.toInnerSvg(v[2],compact);
          var s =          `${s1}_${s2}`;
          return {s};
          break;

        case '\\sup':
          /// 2 arguments, 0 option
          var {s: s1} = this.toInnerSvg(v[1],compact);
          var {s: s2} = this.toInnerSvg(v[2],compact);
          var s =          `${s1}^${s2}`;
          return {s};
          break;

        case '\\subsup':
          /// 3 arguments, 0 option
          var {s: s1} = this.toInnerSvg(v[1],compact);
          var {s: s2} = this.toInnerSvg(v[2],compact);
          var {s: s3} = this.toInnerSvg(v[3],compact);
          var s =          `${s1}_${s2}^${s3}`;
          return {s};
          break;

        case '\\pmod':
          var {s: s1} = this.toInnerSvg(v[1],compact);
          var s = `\\pmod ${s1}`;
          return {s};
          break;

        default:
          throw new Error(`unhandled key: '${v[0]}'`);
          break;

      } ///switch

    } else {

      var [id,width,op] = this.findIdByElement(v);
     
      if(id){

        var s = v;
        return {s};

      } else if (v.startsWith('\\')){

        v = v.slice(1);
        var s = `\\text{${v}}`;
        return {s};

      } else {

        var s = `\\text{${v}}`;
        return {s};

      }

    }
  }

  toSvg (v) {

    var {s} = this.toInnerSvg(v);
    return s;
  }

  lower(y,id) {
    var dy = pjson.smallLetters[id];
    if (dy) {
      dy = parseFloat(dy);
      if (Number.isFinite(dy)) {
        return y + dy;
      }
    }
    return y;
  }

}

module.exports = { NitrilePreviewLmath }
