'use babel';

const re_token = /\\\;|\\\,|\\\:|\\\\|\\\{|\\\}|\\begin\{\w+\}|\\end\{\w+\}|(\\mathscr|\\mathcal|\\mathbf|\\mathbb|\\mathrm|\\mathit)\s*\{[A-Za-z0-9]*\}|\\[a-zA-Z]+|./g;
const pjson = require('./nitrile-preview-math.json');
const char_widths = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.2796875,0.2765625,0.3546875,0.5546875,0.5546875,0.8890625,0.665625,0.190625,0.3328125,0.3328125,0.3890625,0.5828125,0.2765625,0.3328125,0.2765625,0.3015625,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.2765625,0.2765625,0.584375,0.5828125,0.584375,0.5546875,1.0140625,0.665625,0.665625,0.721875,0.721875,0.665625,0.609375,0.7765625,0.721875,0.2765625,0.5,0.665625,0.5546875,0.8328125,0.721875,0.7765625,0.665625,0.7765625,0.721875,0.665625,0.609375,0.721875,0.665625,0.94375,0.665625,0.665625,0.609375,0.2765625,0.3546875,0.2765625,0.4765625,0.5546875,0.3328125,0.5546875,0.5546875,0.5,0.5546875,0.5546875,0.2765625,0.5546875,0.5546875,0.221875,0.240625,0.5,0.221875,0.8328125,0.5546875,0.5546875,0.5546875,0.5546875,0.3328125,0.5,0.2765625,0.5546875,0.5,0.721875,0.5,0.5,0.5,0.3546875,0.259375,0.353125,0.5890625];
const my_valid_fence_ids = [ "myLB",     "myRB",     "myLBR",    "myRBR",    "myLLBR",   "myRRBR",   "myLANGLE", "myRANGLE", "myLPAREN", "myRPAREN", "myLVERT",  "myRVERT",  "myLLVERT", "myRRVERT", "myLCEIL",  "myRCEIL",  "myLFLOOR", "myRFLOOR" ];
const re_fontvariants = /^\\(mathit|mathrm|mathscr|mathbf|mathbb|mathcal)\s*\{(.*)\}$/;
const re_variable = /^[A-Za-z]$/;

class NitrilePreviewTokenizer {

  constructor (parser) {
    this.parser = parser;
    this.display_rate = 2.00;
    this.sub_rate = 0.63;
    this.sup_rate = 0.63;
    this.frac_rate = 0.72;
    this.nroot_rate = 0.72;
    this.extra_gap = 2.5;
    this.used = new Set();
    this.isdisplaymath = false;
    this.cssfontrate = 1;
    this.isinmatrix = false;
    this.bracelevel = 0;
    this.fraclevel = 0;
    this.re_begin = /^\\begin\{(\w+)\}$/;
    this.re_end = /^\\end\{(\w+)\}$/;
  }

  async tokenize (str) {
    return this.toTokens(str);
  }

  async groupize (str) {
    var l = this.toTokens(str);
    var g = this.toGroups(l);
    var g = this.toCleanup(g);
    var g = this.toCommands(g);
    var g = this.toSubsup(g);
    return g;
  }

  async svgize (str, isdisplaymath=false, addoutline=false) {
    return this.parse(str,isdisplaymath,addoutline);
  }

  parse (str) {
    str = str.trim();
    if(!str){ return ''; }
    this.used.clear();
    var l = this.toTokens(str);
    var g = this.toGroups(l);
    var g = this.toCleanup(g);
    var g = this.toCommands(g);
    var g = this.toSubsup(g);
    var {s,nw,nh,shiftdist} = this.toSvg(g);
    return s;
  }

  toMathSvg (str) {
    str = str.trim();
    if(!str){ 
      var s = '';
      var nw = 0;
      var nh = 0;
      var shiftdist = 0;
      return {s,nw,nh,shiftdist};
    }
    this.used.clear();
    var l = this.toTokens(str);
    var g = this.toGroups(l);
    var g = this.toCleanup(g);
    var g = this.toCommands(g);
    var g = this.toSubsup(g);
    return this.toSvg(g);
  }

  toDiagramSvg (str) {
    this.used.clear();
    var l = this.toTokens(str);
    var g = this.toGroups(l);
    var g = this.toCleanup(g);
    var g = this.toCommands(g);
    var g = this.toSubsup(g);
    var [_w,_h,_mid,_s,_g,_q,_id] = this.toInnerSvg(g);
    ///experimental: we add a 1 to the height to increase its height
    /// because On iBook the bottom part of some of the letters are cutoff.
    /// increasing it seems to help expand the viewBox
    ///_h += 1;
    ///building up <defs> contents
    var defss = [];
    for (var mathSymbol of pjson.mathSymbols) {
      let {dy,dx,id,unicode,width} = mathSymbol;
      if (this.used.has(id)) {
        defss.push(`<text class='MyText' id='${id}' dy='9pt' textLength='${width}pt' lengthAdjust='spacingAndGlyphs'>${unicode}</text>`);
      }
    }
    var defs= `\
<defs>
<style type="text/css"><![CDATA[
.MyText { stroke:none; fill:inherit; font-size:12pt; }
.MyLine { stroke:inherit; fill:none; font-size:12pt; }
]]>
</style>
${defss.join('\n')}
</defs>`;
   return [_w,_h,defs,_s];

  }

  isValidFenceId (id) {
    if(!id) return true;
    return (my_valid_fence_ids.indexOf(id) >= 0) ? true : false;
  }

  measureText(str, fontSize = 12) {
    const avg = 0.5279276315789471
    return str
      .split('')
      .map(c => c.charCodeAt(0) < char_widths.length ? char_widths[c.charCodeAt(0)] : avg)
      .reduce((cur, acc) => acc + cur) * fontSize
  }

  max (v1,v2) {
    return (v1 > v2) ? v1 : v2;
  }

  splitArray (l) {
    var o = [];
    var oo = [];
    var v = [];
    oo.push(v);
    o.push(oo);
    for (let ll of l) {
      v.push(ll);
      if (typeof ll === 'string' && ll === '\\\\') {
        v.pop();///pop out the \\\\ that was just inserted
        v = []; /// create a new cell
        oo = []; /// create a new row (empty row)
        oo.push(v); /// add this cell to the new row (empty cell)
        o.push(oo); /// add this row to o
      } else if (typeof ll === 'string' && ll === '&') {
        v.pop();///pop out the new '&' just inserted
        v = [];///create a new cell
        oo.push(v);/// add this new cell to this row
      } else {
        ///do nothing
      }
    }
    return o;
  }

  shrinkSvg (v,rate = 0.7) {
    var [w2_,h2_,mid2_,s2_,g2_,q2_,id2_] = v;
    var nw2_ = w2_*rate;
    var nh2_ = h2_*rate;
    var nmid2_ = mid2_*rate;
    var o = [];
    o.push(`<svg x='0' y='0' width='${nw2_}pt' height='${nh2_}pt' viewBox='0 0 ${w2_*1.3333} ${h2_*1.3333}'>`);
    o.push(s2_);
    o.push(`</svg>`);
    return [nw2_,nh2_,nmid2_,o.join('\n'),g2_,q2_,id2_];
  }

  /// calculate the (x,y) position for this SVG so that it is
  /// centered at the given rectangle given by
  //// (bx,by,bw,bh); The found position is return as an array of two elements
  findXyForCenter (w_,h_,bx,by,bw,bh) {
    bx += (bw - w_)/2.0
    by += (bh - h_)/2.0
    return [bx,by];
  }

  /// calculate the (x,y) position for this SVG so that it is
  /// flushleft at the given rectangle given by
  //// (bx,by,bw,bh); The found position is return as an array of two elements
  findXyForFlushleft (w_,h_,bx,by,bw,bh) {
    by += (bh - h_)/2.0
    return [bx,by];
  }

  findIdByElement (v) {
    for (var mathSymbol of pjson.mathSymbols) {
      let {kbd,width,id,op} = mathSymbol;
      if (kbd === v) {
        this.used.add(id);
        return [id,width,op];
      }
    }
    return ['',0,0];
  }

  toTokens (str) {

    /// tokens:
    /// \;
    /// \,
    /// \:
    /// \\
    /// \{
    /// \}
    /// \left, \right, \sqrt, \emptyset, etc.
    /// individual characters

    var cnt;
    var v;
    var start_i = 0;
    var newtext = '';
    var o = [];
    while ((v = re_token.exec(str)) !== null) {
      var i = v.index;
      cnt = str.slice(start_i,i);
      o.push(v[0]);
      start_i = re_token.lastIndex;
    }
    cnt = str.slice(start_i);
    return o;
  }

  toNots (tokens) {
    /// to combine: ..., '\\not', '\\equiv', ...
    /// into:       ..., '\\not\\equiv', ...
    var o = [];
    while (tokens.length) {
      var s0 = tokens[0];
      tokens = tokens.slice(1);
      if(s0==='\\not'){
        var s1 = tokens[0];
        tokens = tokens.slice(1);
        s0 = `${s0}${s1}`;
        o.push(s0);
      } 
      else {
        o.push(s0);
      }
    }
    return o;
  }

  toGroups (tokens) {

    var o = [];
    var group = null;
    while (tokens.length) {
      [tokens,group] = this.getNextGroup(tokens);
      o.push(group);
    }
    return ['\\math',o];
  }

  toCleanup (g) {

    var inner0 = null;
    var re_empty = /^\s+$/;
    if (Array.isArray(g)) {
      var key = g[0];
      if (key==='\\math' || key  === '\\brace' || key  === '\\leftright' || key === '\\beginend') {
        var inner  = g[1];
        var fence1 = g[2];
        var fence2 = g[3];
        var raw = inner.join('').toString();
        var o = this.toCleanup(inner);
        return [key,o,fence1,fence2,raw];
      } else {
        /// this is the inner
        var o = [];
        var inner = g;
        var j = 0;
        while (j < inner.length) {
          var inner0 = inner[j]
          if (typeof inner0 === 'string') {
            if (re_empty.test(inner0)) {
              /// ignore
            } else {
              o.push(inner0);
            }
          } else {
            o.push(this.toCleanup(inner0));
          }
          j += 1;
        }
        return o;
      }
    }
    return g;
  }

  findMathCommandInfo (cmdname) {
    for (var mathCommand of pjson.mathCommands) {
      if (mathCommand.name === cmdname) {
        return mathCommand;
      }
    }
    return null;
  }

  getNextCommand (items ) {

    /// the input is an array, and the output
    /// is an array of [items,command] where a command
    /// is an array with the first key and the rest
    /// arguments such as: ['\\frac','a','b']

    /// NOTE: each element of the input could be also be
    /// a group such as ['\\brace',...], thus, when this is
    /// is the case, we call this.toCommands() on this item and
    /// not doing anything.

    /// OR, if the first item is '\\frac'' then we will extract
    /// this item and the next two items to form a new command.

    var fence1;
    var fence2;
    var inner = [];
    var group = null;
    var group1 = null;
    var group2 = null;

    var item0 = items[0];
    if (Array.isArray(item0)) {

      items = items.slice(1);
      group = this.toCommands(item0);
      return [items,group];

    } else {

      var commandInfo = this.findMathCommandInfo(item0);
      if (commandInfo) {
        var o = [];
        var cmd = null;
        o.push(item0);
        items = items.slice(1);
        ///before we pop the next two elements from the input
        /// we will check to see if it has an 'option' flag set.
        /// If it is set then we check to see if the next three
        /// element looks like a set of bracket with an element
        /// in the middle
        if (commandInfo.option) {
          /// '[','2',']'...
          if (items[0] === '[' && items[2] === ']') {
            ///***the answer is yes***, so we need to push the optional item
            o.push(items[1]);
            items = items.slice(3);
          } else {
            ///***the answer is no***, but we still need to push an empty one
            o.push('');
          }
        }
        ///we will pop the next two element from the input
        /// and give it to this command
        for (var j=0; j < commandInfo.count; ++j) {
          [items,cmd] = this.getNextCommand(items);
          o.push(cmd);
        }
        return [items,o];

      } else {

        /// some exceptions such as '\\sqrt[n]'
        var re_nroot = /^\\sqrt\[(.*)\]$/;
        if (0 && re_nroot.test(item0)) {
          var m = re_nroot.exec(item0);
          var m1 = m[1];
          var item1 = items[1];
          items = items.slice(2);
          return [items,['\\nroot',m1,item1]];

        } else {

          return this.getNextToken(items);
        }
      }
    }
  }

  toCommands (g) {

    if (Array.isArray(g)) {
      var key = g[0];
      if (key==='\\math' || key  === '\\brace' || key  === '\\leftright' || key === '\\beginend') {
        var inner  = g[1];
        var fence1 = g[2];
        var fence2 = g[3];
        var raw    = g[4];

        var command = null;
        var o = [];
        while (inner.length) {
          [inner,command] = this.getNextCommand(inner);
          o.push(command);
        }
        return [key,o,fence1,fence2,raw];
      }
    }
    /// not an array
    return g;
  }

  toSubsup (g) {

    var inner0 = null;
    var inner1 = null;
    var inner2 = null;
    var inner3 = null;
    var inner4 = null;
    if (Array.isArray(g)) {
      var key = g[0];
      if (key==='\\math' || key  === '\\brace' || key  === '\\leftright' || key === '\\beginend') {
        var inner  = g[1];
        var fence1 = g[2];
        var fence2 = g[3];
        var raw    = g[4];
        var o = [];
        var j = 0;
        while (j < inner.length) {
          inner0 = inner[j]
          inner1 = inner[j+1]
          inner2 = inner[j+2]
          inner3 = inner[j+3]
          inner4 = inner[j+4]
          if (inner1 === '_' && inner3 === '^') {
            o.push(['\\subsup',this.toSubsup(inner0),this.toSubsup(inner2),this.toSubsup(inner4)]);
            j += 5;
          } else if (inner1 === '^' && inner3 === '_') {
            o.push(['\\subsup',this.toSubsup(inner0),this.toSubsup(inner4),this.toSubsup(inner2)]);
            j += 5;
          } else if (inner1 === '_') {
            o.push(['\\sub',this.toSubsup(inner0),this.toSubsup(inner2)]);
            j += 3;
          } else if (inner1 === '^') {
            o.push(['\\sup',this.toSubsup(inner0),this.toSubsup(inner2)]);
            j += 3;
          } else {
            o.push(this.toSubsup(inner0));
            j += 1;
          }
        }
        return [key,o,fence1,fence2,raw];
      } else {
        if (g.length == 2) {
          return [key,this.toSubsup(g[1])];
        }
        if (g.length == 3) {
          return [key,this.toSubsup(g[1]),this.toSubsup(g[2])];
        }
        if (g.length == 4) {
          return [key,this.toSubsup(g[1]),this.toSubsup(g[2]),this.toSubsup(g[3])];
        }
      }
    }
    return g;
  }

  getNextToken (tokens) {
    var token = tokens[0];
    tokens = tokens.slice(1);
    return [tokens,token];
  }

  skipEmptyTokens (tokens) {
    while (tokens.length && tokens[0].match(/\s/)) {
      tokens = tokens.slice(1);
    }
    return tokens;
  }

  getNextGroup (tokens) {
    var v = null;
    var fence1;
    var fence2;
    var inner = [];
    var group = null;
    var group1 = null;
    var group2 = null;
    var group3 = null;
    var group4 = null;
    var token0 = null;
    var token1 = null;
    var token2 = null;
    var token3 = null;
    if (tokens[0] === '\\left') {

      tokens = tokens.slice(1);
      [tokens,fence1] = this.getNextToken(tokens);
      while (tokens.length) {
        if (tokens[0] === '\\right') {
          tokens = tokens.slice(1);
          [tokens,fence2] = this.getNextToken(tokens);
          break;
        } else {
          [tokens,group] = this.getNextGroup(tokens);
          inner.push(group);
        }
      }
      return [tokens,['\\leftright',inner,fence1,fence2]];

    } else if ((v = this.re_begin.exec(tokens[0])) !== null) {

      let name = v[1];
      var v2 = null;
      tokens = tokens.slice(1);
      while (tokens.length) {
        if ((v2 = this.re_end.exec(tokens[0])) !== null && v2[1] === name) {
          tokens = tokens.slice(1);
          break;
        } else {
          [tokens,group] = this.getNextGroup(tokens);
          inner.push(group);
        }
      }
      return [tokens,['\\beginend',inner,name,name]];

    } else if (tokens[0] === '\{') {

      tokens = tokens.slice(1);
      while (tokens.length) {
        if (tokens[0] === '\}') {
          tokens = tokens.slice(1);
          break;
        } else {
          [tokens,group] = this.getNextGroup(tokens);
          inner.push(group);
        }
      }
      return [tokens,['\\brace',inner]];

    } else {

      return this.getNextToken(tokens);

    }

  }

  toInnerSvg (v, compact=false) {

    /// 'v': is an element, such as '\alpha', '1', '+', or a group,
    /// such as: '\\math',      [Array], '', '', ...
    /// or;      '\\brace',     [Array], '', '', ...
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
      const key = v[0];
      switch (v[0]) {

        case '\\beginend': {

          var name = v[2];
          if (name == 'cases' || 'matrix' || name == 'pmatrix' || name == 'bmatrix' || name == 'Bmatrix' || name == 'vmatrix' || name == 'Vmatrix' ) {
            this.isinmatrix = true;
            const gap_w = 5.5;
            const gap_h = 1;
            var o = [];
            var p = this.splitArray(v[1]);
//console.log('p=',p);
//console.log('p[0][0]=',p[0][0]);
            /// figure out how many rows
            var nrow = p.length;
            var ncol = p.map(d => d.length).reduce((cur,acc) => Math.max(cur,acc));
//console.log('nrow=',nrow);
//console.log('ncol=',ncol);

            /// convert to inner svg for all cells
            for (let j=0; j < ncol; ++j) {
              for (let i=0; i < nrow; ++i) {
                let pv = p[i][j];
                if (pv) {
                  p[i][j] = this.toInnerSvg(['\\brace',pv,'','',''],compact);
                }
              }
            }

            /// figure out the total width of the array
            var cols_w = []; /// indexed by the columns
            var rows_h = []; /// indexed by the rows
            cols_w.length = ncol;
            rows_h.length = nrow;
            cols_w.fill(6);
            rows_h.fill(6);
            /// now find out the row height for each row
            for (let j=0; j < ncol; ++j) {
              for (let i=0; i < nrow; ++i) {
                if (p[i][j]) {
                  var [w_,h_,mid_,s_,g_,q_,id_] = p[i][j];
                  rows_h[i] = Math.max(rows_h[i],h_);
                }
              }
            }
            /// now find out the col width for each col
            for (let j=0; j < ncol; ++j) {
              for (let i=0; i < nrow; ++i) {
                if (p[i][j]) {
                  var [w_,h_,mid_,s_,g_,q_,id_] = p[i][j];
                  cols_w[j] = Math.max(cols_w[j],w_);
                }
              }
            }
            /// now increase each col width by 10
            cols_w = cols_w.map(t => t + gap_w + gap_w);
            /// now increase each row height by 10
            rows_h = rows_h.map(t => t + gap_h + gap_h);
            /// now find out the total width of the array
            var array_w = cols_w.reduce((cur,acc) => cur + acc);
            var array_h = rows_h.reduce((cur,acc) => cur + acc);
//console.log('array_w=',array_w);
//console.log('array_h=',array_h);

            /// now we display all the cells
            var dy = 0;
            for (let i=0; i < nrow; ++i) {
              var dx = 0;
              for (let j=0; j < ncol; ++j) {
                if (p[i][j]) {
                  var [w_,h_,mid_,s_,g_,q_,id_] = p[i][j];
                  var bx = dx;
                  var by = dy;
                  var bw = cols_w[j];
                  var bh = rows_h[i];
//console.log('bx=',bx);
//console.log('by=',by);
//console.log('bw=',bw);
//console.log('bh=',bh);
//console.log('w_=',w_);
//console.log('h_=',h_);
                  if(name == 'cases'){
                    [bx,by] = this.findXyForFlushleft(w_,h_,bx,by,bw,bh);
                  }else{
                    [bx,by] = this.findXyForCenter(w_,h_,bx,by,bw,bh);
                  }
//console.log('new bx=',bx);
//console.log('new by=',by);
                  o.push(`<svg x='${bx-gap_w}pt' y='${by-gap_h}pt'>`);
//console.log('dx=',dx);
//console.log('dy=',dy);
//console.log('s_=',s_);
                  o.push(s_);
                  o.push(`</svg>`);
                }
                dx += cols_w[j];
              }
              dy += rows_h[i];
            }

            //var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(['\\brace',p[0][0],'','',''],compact);
            //o.push(`<svg x='${10}pt' y='${10}pt'>`);
            //o.push(s_);
            //o.push(`</svg>`);
            var w = array_w - gap_w - gap_w;
            var h = array_h - gap_h - gap_h;
            var mid = h/2.0;
            this.isinmatrix = false;
            if (name == 'matrix') {
              return [w,h,mid,o.join('\n'),0,0,''];
            }
            ///now we need to add some fences for
            ///    pmatrix
            ///    bmatrix
            ///    Bmatrix
            ///    vmatrix
            ///    Vmatrix
            var s = o.join('\n');
            var fence1 = '';
            var fence2 = '';
            if (name == 'pmatrix') {
              fence1 = '(';
              fence2 = ')';
            } else if (name == 'bmatrix') {
              fence1 = '\\lbrack';
              fence2 = '\\rbrack';
            } else if (name == 'Bmatrix') {
              fence1 = '\\lbrace';
              fence2 = '\\rbrace';
            } else if (name == 'vmatrix') {
              fence1 = '\\lvert';
              fence2 = '\\rvert';
            } else if (name == 'Vmatrix') {
              fence1 = '\\lVert';
              fence2 = '\\rVert';
            } else if (name == 'cases') {
              fence1 = '\\lbrace';
              fence2 = '';
            } else {
              fence1 = '';
              fence2 = '';
            }
            var [id1,w1,op1] = this.findIdByElement(fence1);
            var [id2,w2,op2] = this.findIdByElement(fence2);
            if (!this.isValidFenceId(id1)) { [id1,w1,op1] = this.findIdByElement('\\?');    }
            if (!this.isValidFenceId(id2)) { [id2,w2,op2] = this.findIdByElement('\\?');    }
            o = [];
            o.push(`<svg x='0' y='0' width='${w1}pt' height='${h}pt' viewBox='0 0 ${w1*1.333} 16' preserveAspectRatio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id1}' />`);
            o.push(`</svg>`);
            o.push(`<svg x='${w1+w}pt' y='0' width='${w2}pt' height='${h}pt' viewBox='0 0 ${w2*1.333} 16' preserveAspectRatio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id2}' />`);
            o.push(`</svg>`);
            o.push(`<svg x='${w1}pt' y='0' >`);
            o.push(s);
            o.push(`</svg>`);
            return [w+w1+w2,h,mid,o.join('\n'),0,0,''];
          } else {
            ///turn it into a \\brace command
            return this.toInnerSvg(['\\brace',v[1],'','',v[4]],compact);
          }
          break;
        }

        case '\\math':
        case '\\brace':
        case '\\leftright':
          
          if(key == '\\math'){
            this.shiftdist = 0;
          }
          this.bracelevel += 1;
          var g = v[1];
          var w = 0;
          var h = 0;
          var mid = 0;
          var results = g.map( (z) => this.toInnerSvg(z,compact) );
          var s = '';
          var o = [];
          for (let result of results) {
            /// compute the deepest height (h) and the deepest (mid)
            var [w_,h_,mid_,s_,g_,q_,id_] = result;
            h = (h > h_) ? h : h_;
            mid = (mid > mid_) ? mid : mid_;
          }
          var w = 0;
          ///this is the flag indicating if we need to add some gap
          // before an item; this flag needs to be revisited after
          // processing of each item
          var before_g = 0;
          var before_q = 0;
          var i = 0;
          var first_id = '';
          for (let result of results) {
            var [w_,h_,mid_,s_,g_,q_,id_] = result;
            if(key == '\\math' && id_ == 'myAMPERSAND'){
              //console.log('myampersand',w);
              this.shiftdist = w;
              if(i>0){
                /// the = sign will be moved this extra distance away
                this.shiftdist += this.extra_gap;
              }
              continue;
            }
            if (w_ == 0) {
              /// skip over blanks
              continue;
            }
            if (!first_id) {
              first_id = id_;
            }
            ///keep track of the number of items added
            /// the first item is at index 1
            i++;
            /// this is to add an extra gap before and after
            if (i === 1) {
              /// do not need extra space before it if it is
              // the first item. Note for op=1 and op=2 the gap is optional,
              // but for op=3 the gap is mandatory;
              //
              // op=1    Used for operators such as +, -, and others such that
              //         the gap is to be added before/after, but the gap will
              //         disappear if in compact mode, such as when used in superscript/subscript
              // op=2    Only used for semicolon and comma, such that the gap is not
              //         needed before, but needed after; the gap will also disappear if in
              //         compact mode
              // op=3    Used for \lim like operators, where the spacing is always needed before,
              //         and after, such as "\log x". However, the spacing is removed if followed
              //         by a left parenthesis
              //
              // For q it is also mandatory;
              //
              // The q is set when typesetting \lim, \int, and \sum such that sometime an extra
              // gap is needed to place it after the summation symbol, or not, so q= makes it
              // flexible
              //
              //
              // whether it is compact or not. op=2 only for after gap;
              // op=3 for before and after
            } else if (before_q == 1 ) {
              ///mandatory gap
              if (!compact) {
                w += this.extra_gap;
              } else {
                w += this.extra_gap;
              }
            } else if (before_g == 3 ) {
              ///mandatory gap, suppressed if followed by a myLPAREN
              if (id_ === 'myLPAREN') {
              } else {
                w += this.extra_gap;
              }
            } else if (before_g == 1 || before_g == 2) {
              /// optional gap
              if (!compact) {
                w += this.extra_gap;
              }
            } else if (g_ == 1) {
              ///if current item requires an optional gap, then add it
              // only for non-compact layout
              if (!compact) {
                w += this.extra_gap;
              }
            } else if (g_ == 3) {
              ///if current item requires a mandatory before-gap, then do it
              if (!compact) {
                w += this.extra_gap;
              } else {
                w += this.extra_gap;
              }
            }
            /// this is to push down those elements so that its
            /// mid line aligns with the mid line of the entire row.
            if (mid_ < mid) {
              // NOTE: this will apply to all component
              // except for the deepest (mid) component
              var dy = mid - mid_;
              o.push(`<svg x='${w}pt' y='${dy}pt'>${s_}</svg>`);
              /// check to see if this component will be deeper than
              /// the computed (h)
              h_ += dy;
              h = (h > h_) ? h : h_;
            } else {
              o.push(`<svg x='${w}pt' y='0'>${s_}</svg>`);
            }
            w += parseFloat(w_);
            before_g = g_;
            before_q = q_;
          }
          if (v[0] === '\\math' || v[0] === '\\brace') {
            this.bracelevel -= 1;
            ///fetch the id of the first element and return as this brace
            ///this is useful for \vec{v} where the element after \vec is
            ///a \brace but we need to know that it is the 'v' so that
            ///it can lower the arrow
            return [w,h,mid,o.join('\n'),0,0,first_id];
          } else {
            /// \\leftright
            s = o.join('\n');
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
            if (fence1 === '.') fence1 = '';
            if (fence2 === '.') fence2 = '';
            var [id1,w1,op1] = this.findIdByElement(fence1);
            var [id2,w2,op2] = this.findIdByElement(fence2);
            if (!this.isValidFenceId(id1)) { [id1,w1,op1] = this.findIdByElement('\\?');    }
            if (!this.isValidFenceId(id2)) { [id2,w2,op2] = this.findIdByElement('\\?');    }
            o = [];
            o.push(`<svg x='0' y='0' width='${w1}pt' height='${h}pt' viewBox='0 0 ${w1*1.333} 16' preserveAspectRatio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id1}' />`);
            o.push(`</svg>`);
            o.push(`<svg x='${w1+w}pt' y='0' width='${w2}pt' height='${h}pt' viewBox='0 0 ${w2*1.333} 16' preserveAspectRatio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id2}' />`);
            o.push(`</svg>`);
            o.push(`<svg x='${w1}pt' y='0' >`);
            o.push(s);
            o.push(`</svg>`);
            this.bracelevel -= 1;
            return [w+w1+w2,h,mid,o.join('\n'),0,0,''];
          }
          break;

        case '\\text':

          /// get the 'str'
          var v1 = v[1];
          var str = '';
          if (Array.isArray(v1)) {
            if (v1[0] === '\\brace') {
              str = v1[4];
            } else {
              /// ...this is error
              var [id1,w1,op1] = this.findIdByElement('\\?');
              s = `<use xlink:href='#${id1}' />`;
              return [w1,12,6,s,0,0,''];
            }
          } else {
            str = ''+v1;/// ensure this is text
          }

          /// now construct the SVG
          var o = [];
          var x = 0;
          var w = 0;
          var h = 12.0;
          var mid = 6.0;
          for (var c of str) {
            var [id1,w1,op1] = this.findIdByElement(c);
            if (id1) {
              o.push (`<use x='${w}pt' xlink:href='#${id1}' />`);
              w += w1;
            }
          }
          return [w,h,mid,o.join('\n'),0,0,''];

        case '\\operatorname':

          /// get the 'str'
          var v1 = v[1];
          var str = '';
          if (Array.isArray(v1)) {
            if (v1[0] === '\\brace') {
              str = v1[4];
            } else {
              /// ...this is error
              var [id1,w1,op1] = this.findIdByElement('\\?');
              s = `<use xlink:href='#${id1}' />`;
              return [w1,12,6,s,0,0,''];
            }
          } else {
            str = ''+v1;/// ensure this is text
          }

          /// now construct the SVG
          var o = [];
          var x = 0;
          var w = 0;
          var h = 12.0;
          var mid = 6.0;
          for (var c of str) {
            var [id1,w1,op1] = this.findIdByElement(c);
            if (id1) {
              o.push (`<use x='${w}pt' xlink:href='#${id1}' />`);
              w += w1;
            }
          }
          return [w,h,mid,o.join('\n'),0,0,''];

        case '\\nroot':
          var n = v[1];
          var [w1_,h1_,mid1_,s1_,g1_,q1] = this.shrinkSvg(this.toInnerSvg(['\\brace',n.split('')],compact));
          var nw1_ = w1_*this.sup_rate;
          var nh1_ = h1_*this.sup_rate;
          var nlead = nw1_;
          nlead -= 5;
          if (nlead < 0) nlead = 0;
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[2],compact);
          var lead = 8;
          w = w_;
          h = h_;
          mid = h/2;
          var o = [];
          /// draw the power-text
          o.push(`<svg x='0' y='0' width='${nw1_}pt' height='${nh1_}pt' viewBox='0 0 ${w1_*1.333} ${h1_*1.333}'>`);
          o.push(s1_);
          o.push(`</svg>`);
          /// draw content-text
          o.push(`<svg x='${nlead+lead}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          /// draw sq-symbol
          o.push(`<svg x='${nlead}pt' y='0' width='${lead}pt' height='${h}pt' viewBox='0 0 10.666 16' preserveAspectRatio='none'>`);
          o.push(`<use x='0' y='0' xlink:href='#mySQRT' />`);
          o.push(`</svg>`);
          /// draw overhead line
          o.push(`<line x1='${nlead+lead}pt' y1='0.8pt' x2='${nlead+lead+w}pt' y2='0.8pt' class='MyLine'/>`);
          this.used.add('mySQRT');
          return [nlead+lead+w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\widehat':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var lead = 1;
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          var x0 = 0;
          var y0 = 2.5;
          var xm = w/2;
          var ym = 0.5;
          var x1 = w;
          var y1 = 2.5;
          o.push(`<line x1='${x0}pt' y1='${y0}pt' x2='${xm}pt' y2='${ym}pt' class='MyLine'/>`);
          o.push(`<line x1='${x1}pt' y1='${y1}pt' x2='${xm}pt' y2='${ym}pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\overline':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var lead = 1;
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          o.push(`<line x1='0pt' y1='1.5pt' x2='${w}pt' y2='1.5pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\overleftrightarrow':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var lead = 1; ///the arrow will protrude from either end for 2pt
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          o.push(`<line x1='0pt' y1='1.5pt' x2='${w}pt' y2='1.5pt' class='MyLine'/>`);
          o.push(`<line x1='0pt'    y1='1.5pt' x2='3pt'      y2='3pt' class='MyLine'/>`);
          o.push(`<line x1='0pt'    y1='1.5pt' x2='3pt'      y2='0pt' class='MyLine'/>`);
          o.push(`<line x1='${w}pt' y1='1.5pt' x2='${w-3}pt' y2='3pt' class='MyLine'/>`);
          o.push(`<line x1='${w}pt' y1='1.5pt' x2='${w-3}pt' y2='0pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\overrightarrow':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var lead = 1; ///the arrow will protrude from either end for 2pt
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          o.push(`<line x1='0pt' y1='1.5pt' x2='${w}pt' y2='1.5pt' class='MyLine'/>`);
          //o.push(`<line x1='0pt'    y1='1.5pt' x2='3pt'      y2='3pt' class='MyLine'/>`);
          //o.push(`<line x1='0pt'    y1='1.5pt' x2='3pt'      y2='0pt' class='MyLine'/>`);
          o.push(`<line x1='${w}pt' y1='1.5pt' x2='${w-3}pt' y2='3pt' class='MyLine'/>`);
          o.push(`<line x1='${w}pt' y1='1.5pt' x2='${w-3}pt' y2='0pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\dot':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var lead = 0; ///the arrow will protrude from either end for 2pt
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          var y = 1.5;
          y = this.lower(y,id_);
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          o.push(`<circle cx='${w/2}pt' cy='${y}pt' r='0.5pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\ddot':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var minwidth = 4.0;
          var lead = Math.max(0,minwidth-w_)/2.0;
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          var x0 = w/2 - 1.5;
          var y0 = this.lower(1.5,id_);
          var xm = w/2;
          var ym = this.lower(1.5,id_);
          var x1 = w/2 + 1.5;
          var y1 = this.lower(1.5,id_);
          o.push(`<circle cx='${x0}pt' cy='${y0}pt' r='0.5pt' class='MyLine'/>`);
          o.push(`<circle cx='${x1}pt' cy='${y1}pt' r='0.5pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\dddot':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var minwidth = 5.0;
          var lead = Math.max(0,minwidth-w_)/2.0;
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          var x0 = w/2 - 2.0;
          var y0 = this.lower(1.5,id_);
          var xm = w/2;
          var ym = this.lower(1.5,id_);
          var x1 = w/2 + 2.0;
          var y1 = this.lower(1.5,id_);
          o.push(`<circle cx='${x0}pt' cy='${y0}pt' r='0.5pt' class='MyLine'/>`);
          o.push(`<circle cx='${xm}pt' cy='${ym}pt' r='0.5pt' class='MyLine'/>`);
          o.push(`<circle cx='${x1}pt' cy='${y1}pt' r='0.5pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\ddddot':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var minwidth = 7.0;
          var lead = Math.max(0,minwidth-w_)/2.0;
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          var x0 = w/2 - 3.0;
          var y0 = this.lower(1.5,id_);
          var xm = w/2 - 1.0
          var ym = this.lower(1.5,id_);
          var xn = w/2 + 1.0
          var yn = this.lower(1.5,id_);
          var x1 = w/2 + 3.0;
          var y1 = this.lower(1.5,id_);
          o.push(`<circle cx='${x0}pt' cy='${y0}pt' r='0.5pt' class='MyLine'/>`);
          o.push(`<circle cx='${xm}pt' cy='${ym}pt' r='0.5pt' class='MyLine'/>`);
          o.push(`<circle cx='${xn}pt' cy='${yn}pt' r='0.5pt' class='MyLine'/>`);
          o.push(`<circle cx='${x1}pt' cy='${y1}pt' r='0.5pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\bar':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var lead = 0; ///there will be no protruding from either end
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          var x0 = w/2 - 2.5;
          var y0 = this.lower(1.5,id_);
          var xm = w/2;
          var ym = this.lower(1.5,id_);
          var x1 = w/2 + 2.5
          var y1 = this.lower(1.5,id_);
          o.push(`<line x1='${x0}pt'  y1='${y0}pt'  x2='${x1}pt'     y2='${y1}pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\vec':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var lead = 0; ///there will be no protruding from either end
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          var x0 = w/2 - 2.5;
          var y0 = this.lower(1.5,id_);
          var xm = w/2;
          var ym = this.lower(1.5,id_);
          var x1 = w/2 + 2.5
          var y1 = this.lower(1.5,id_);
          o.push(`<line x1='${x0}pt'  y1='${y0}pt'  x2='${x1}pt'     y2='${y1}pt' class='MyLine'/>`);
          o.push(`<line x1='${x1}pt'  y1='${y1}pt'  x2='${x1-1.5}pt' y2='${y1-1.5}pt' class='MyLine'/>`);
          o.push(`<line x1='${x1}pt'  y1='${y1}pt'  x2='${x1-1.5}pt' y2='${y1+1.5}pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\mathring':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var lead = 0; ///there will be no protruding from either end
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          var x0 = w/2 - 1.5;
          var y0 = this.lower(1.5,id_);
          var xm = w/2;
          var ym = this.lower(1.5,id_);
          var x1 = w/2 + 1.5
          var y1 = this.lower(1.5,id_);
          o.push(`<circle cx='${xm}pt' cy='${ym}pt' r='1.5pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\hat':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var lead = 0; ///there will be no protruding from either end
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          var x0 = w/2 - 2.5;
          var y0 = this.lower(2.5,id_);
          var xm = w/2;
          var ym = this.lower(0.5,id_);
          var x1 = w/2 + 2.5
          var y1 = this.lower(2.5,id_);
          o.push(`<line x1='${x0}pt'  y1='${y0}pt'  x2='${xm}pt' y2='${ym}pt' class='MyLine'/>`);
          o.push(`<line x1='${x1}pt'  y1='${y1}pt'  x2='${xm}pt' y2='${ym}pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\check':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var lead = 0; ///there will be no protruding from either end
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          var x0 = w/2 - 2.5;
          var y0 = this.lower(0.5,id_);
          var xm = w/2;
          var ym = this.lower(2.5,id_);
          var x1 = w/2 + 2.5
          var y1 = this.lower(0.5,id_);
          o.push(`<line x1='${x0}pt'  y1='${y0}pt'  x2='${xm}pt' y2='${ym}pt' class='MyLine'/>`);
          o.push(`<line x1='${x1}pt'  y1='${y1}pt'  x2='${xm}pt' y2='${ym}pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\grave':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var lead = 0; ///there will be no protruding from either end
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          var x0 = w/2 - 1.5;
          var y0 = this.lower(0.5,id_);
          var xm = w/2;
          var ym = this.lower(1.5,id_);
          var x1 = w/2 + 1.5
          var y1 = this.lower(2.5,id_);
          o.push(`<line x1='${x0}pt'  y1='${y0}pt'  x2='${x1}pt'  y2='${y1}pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\acute':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var lead = 0; ///there will be no protruding from either end
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          var x0 = w/2 - 1.5;
          var y0 = this.lower(2.5,id_);
          var xm = w/2;
          var ym = this.lower(1.5,id_);
          var x1 = w/2 + 1.5;
          var y1 = this.lower(0.5,id_);
          o.push(`<line x1='${x0}pt'  y1='${y0}pt'  x2='${x1}pt'  y2='${y1}pt' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\breve':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var lead = 0; ///there will be no protruding from either end
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          var x0 = w/2 - 1.5
          var y0 = 1.5;
          var x1 = w/2 + 1.5
          var y1 = 0.0;
          var dy = this.lower(0,id_);
          y0 -= 1;
          y1 -= 1;
          x0 *= 1.33;
          y0 *= 1.33;
          x1 *= 1.33;
          y1 *= 1.33;
          o.push(`<svg x='-0.5pt' y='${dy}pt'><path d='M ${x0},${y0} a1,1 0 0,0 ${x1-x0} 0' class='MyLine'/></svg>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\tilde':
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var lead = 0; ///there will be no protruding from either end
          var sunk = 3;
          w = w_ + lead + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          var x0 = w/2 - 2.5;
          var y0 = this.lower(2.5,id_);
          var xm = w/2;
          var ym = this.lower(1.5,id_);
          var x1 = w/2 + 2.5
          var y1 = this.lower(0.5,id_);
          var zh = this.lower(0.0,id_);
          var zl = this.lower(3.0,id_);
          x0 *= 1.33;
          y0 *= 1.33;
          xm *= 1.33;
          ym *= 1.33;
          x1 *= 1.33;
          y1 *= 1.33;
          o.push(`<path d='M ${x0},${y0} Q ${(x0+xm)/2},${zh} ${xm},${ym} Q ${(xm+x1)/2},${zl*1.33} ${x1},${y1}' class='MyLine'/>`);
          return [w,h,mid,o.join('\n'),0,0,''];
          break;

        case '\\dif':
          /// \dif{x}

          var [idd_,wd_,op3_] = this.findIdByElement('d');
          var [w1_,h1_,mid1_,s1_,g1_,q1_,id1_] = this.toInnerSvg(v[1],compact);
          var w = wd_ + w1_;
          var h = h1_;
          var mid = mid1_;
          var o = [];
          if (1) {
            var dx = 0;
            var dy_for_d = mid1_-6;
            o.push(`<use x='${dx}pt' y='${dy_for_d}pt' xlink:href='#${idd_}'/>`);
            dx += wd_;
            o.push(`<svg x='${dx}pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
          }
          return [w,h,mid,o.join('\n'),0,0,''];

          break;
        case '\\od':
          ///'od' has an option=1
          /// \od{x^2}{x}
          ///   or
          /// \od[2]{x^2}{x}

          var [idd_,wd_,op3_] = this.findIdByElement('d');
          this.fraclevel += 1;
          var rate = 0.70;
          var opt = v[1];

          /// get the superscript
          var [ids_,ws_,ops_] = this.findIdByElement(opt);
          var hs_ = 12;
          if (ws_) {
            var nws_ = ws_*this.sup_rate;
            var nhs_ = hs_*this.sup_rate;
            var dsy = nhs_*0.30;///so the superscript '2' is to be on top of 'd' in the height of 30% of itself
          } else {
            var nws_ = 0;
            var nhs_ = 0;
            var dsy = 0;
          }

          var [w1_,h1_,mid1_,s1_,g1_,q1_,id1_] = this.toInnerSvg(v[2],compact);
          var [w2_,h2_,mid2_,s2_,g2_,q2_,id2_] = this.toInnerSvg(v[3],compact);
          var top_w_ = wd_ + nws_ + 1 + w1_;
          var bot_w_ = wd_ + 0 + w2_ + nws_;
          w = (top_w_ > bot_w_) ? top_w_ : bot_w_;
          w += 4; /// make it 2pt longer than either one of the numerator/denomitator
          h = 1 + h1_ + h2_ + dsy + dsy;
          mid = h1_ + dsy;
          var o = [];
          if (top_w_ < bot_w_) {
            var top_dx = 2 + (bot_w_ - top_w_)/2;
            var bot_dx = 2;
          } else {
            var top_dx = 2;
            var bot_dx = 2 + (top_w_ - bot_w_)/2;
          }
          if (1) {
            var dx = top_dx;
            var ddy = mid1_-6;
            if (1) {
              /// compute if we add the superscript the d + 2 will be taller than h1_
              if ((ddy - dsy) < 0) {
                var dy = -(ddy-dsy);
              } else {
                var dy = 0;
              }
            }
            /// letter 'd'
            o.push(`<use x='${dx}pt' y='${dy+ddy}pt' xlink:href='#${idd_}'/>`);
            dx += wd_;
            if (ws_) {
              /// letter '2'
              o.push(`<svg x='${dx}pt' y='${dy+ddy-dsy}pt' width='${nws_}pt' height='${nhs_}pt' viewBox='0 0 ${ws_*1.333} ${hs_*1.333}'>`);
              o.push(`<use xlink:href='#${ids_}'/>`);
              o.push(`</svg>`);
              dx += nws_;
            }
            dx += 1;
            o.push(`<svg x='${dx}pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
          }
          if (1) {
            var dx = bot_dx;
            dy += h1_;
            var hline_dy = dy + 0.5;
            dy += 1;
            o.push(`<use x='${dx}pt' y='${dy+dsy}pt' xlink:href='#${idd_}'/>`);
            dx += wd_;
            o.push(`<svg x='${dx}pt' y='${dy+dsy}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            dx += w2_;
            if (ws_) {
              /// letter '2'
              o.push(`<svg x='${dx}pt' y='${dy}pt' width='${nws_}pt' height='${nhs_}pt' viewBox='0 0 ${ws_*1.333} ${hs_*1.333}'>`);
              o.push(`<use xlink:href='#${ids_}'/>`);
              o.push(`</svg>`);
            }
            dy += h2_;
          }
          o.push(`<line x1='0pt' y1='${hline_dy}pt' x2='${w}pt' y2='${hline_dy}pt' class='MyLine'/>`);
          this.fraclevel -= 1;
          mid = hline_dy;
          h = dy;
          var newv = [w,h,mid,o.join('\n'),0,0,''];
          if (this.isdisplaymath && this.fraclevel == 0) {
            return newv;
          } else {
            return this.shrinkSvg(newv,this.frac_rate);
          }

          break;
        case '\\pd':
          /// \pd{x^2}{x}
          ///var [idd_,wd_,op3_] = this.findIdByElement('\\partial');

          var [idd_,wd_,op3_] = this.findIdByElement('\\partial');
          this.fraclevel += 1;
          var rate = 0.70;
          var opt = v[1];

          /// get the superscript
          var [ids_,ws_,ops_] = this.findIdByElement(opt);
          var hs_ = 12;
          if (ws_) {
            var nws_ = ws_*this.sup_rate;
            var nhs_ = hs_*this.sup_rate;
            var dsy = nhs_*0.30;///so the superscript '2' is to be on top of 'd' in the height of 30% of itself
          } else {
            var nws_ = 0;
            var nhs_ = 0;
            var dsy = 0;
          }

          var [w1_,h1_,mid1_,s1_,g1_,q1_,id1_] = this.toInnerSvg(v[2],compact);
          var [w2_,h2_,mid2_,s2_,g2_,q2_,id2_] = this.toInnerSvg(v[3],compact);
          var top_w_ = wd_ + nws_ + 1 + w1_;
          var bot_w_ = wd_ + 0 + w2_ + nws_;
          w = (top_w_ > bot_w_) ? top_w_ : bot_w_;
          w += 4; /// make it 2pt longer than either one of the numerator/denomitator
          h = 1 + h1_ + h2_ + dsy + dsy;
          mid = h1_ + dsy;
          var o = [];
          if (top_w_ < bot_w_) {
            var top_dx = 2 + (bot_w_ - top_w_)/2;
            var bot_dx = 2;
          } else {
            var top_dx = 2;
            var bot_dx = 2 + (top_w_ - bot_w_)/2;
          }
          if (1) {
            var dx = top_dx;
            var ddy = mid1_-6;
            if (1) {
              /// compute if we add the superscript the d + 2 will be taller than h1_
              if ((ddy - dsy) < 0) {
                var dy = -(ddy-dsy);
              } else {
                var dy = 0;
              }
            }
            /// letter 'd'
            o.push(`<use x='${dx}pt' y='${dy+ddy}pt' xlink:href='#${idd_}'/>`);
            dx += wd_;
            if (ws_) {
              /// letter '2'
              o.push(`<svg x='${dx}pt' y='${dy+ddy-dsy}pt' width='${nws_}pt' height='${nhs_}pt' viewBox='0 0 ${ws_*1.333} ${hs_*1.333}'>`);
              o.push(`<use xlink:href='#${ids_}'/>`);
              o.push(`</svg>`);
              dx += nws_;
            }
            dx += 1;
            o.push(`<svg x='${dx}pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
          }
          if (1) {
            var dx = bot_dx;
            dy += h1_;
            var hline_dy = dy + 0.5;
            dy += 1;
            o.push(`<use x='${dx}pt' y='${dy+dsy}pt' xlink:href='#${idd_}'/>`);
            dx += wd_;
            o.push(`<svg x='${dx}pt' y='${dy+dsy}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            dx += w2_;
            if (ws_) {
              /// letter '2'
              o.push(`<svg x='${dx}pt' y='${dy}pt' width='${nws_}pt' height='${nhs_}pt' viewBox='0 0 ${ws_*1.333} ${hs_*1.333}'>`);
              o.push(`<use xlink:href='#${ids_}'/>`);
              o.push(`</svg>`);
            }
            dy += h2_;
          }
          o.push(`<line x1='0pt' y1='${hline_dy}pt' x2='${w}pt' y2='${hline_dy}pt' class='MyLine'/>`);
          this.fraclevel -= 1;
          mid = hline_dy;
          h = dy;
          var newv = [w,h,mid,o.join('\n'),0,0,''];
          if (this.isdisplaymath && this.fraclevel == 0) {
            return newv;
          } else {
            return this.shrinkSvg(newv,this.frac_rate);
          }

          break;
        case '\\pmod':

          var [idlp_,wdlp_] = this.findIdByElement('(');
          var [idrp_,wdrp_] = this.findIdByElement(')');
          var [idmod_,wdmod_] = this.findIdByElement('\\bmod');
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[1],compact);
          var o = [];
          var dx = 0;
          var dy = 0;
          if(h_ > 12){
            dy = (h_-12)/2;
          }
          o.push(`<use x='0' y='${dy}pt' xlink:href='#${idlp_}' />`);
          dx += wdlp_;
          dx += 1;
          o.push(`<use x='${dx}pt' y='${dy}pt' xlink:href='#${idmod_}' />`);
          dx += wdmod_;
          dx += 2;
          o.push(`<svg x='${dx}pt' >${s_}</svg>`);
          dx += w_;
          o.push(`<use x='${dx}pt' y='${dy}pt' xlink:href='#${idrp_}' />`);
          dx += wdrp_;
          var w = dx;
          var h = h_;
          var mid = mid_;
          return [w,h,mid,o.join('\n'),1,0,''];///1 here means need extract space before it

          break;
        case '\\sqrt':
          ///'sqrt' has an option=1
          
          ///NOTE: DO NOT use nested SVG because it clips the radical symbol that is outside of the box.

          var n = v[1];
          /// \sqrt{x} or \sqrt[4]{x}
          var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(v[2],compact);
          var lead = 8;
          var sunk = 2;
          w = w_ + lead;
          h = h_ + sunk;
          mid = h_/2 + sunk;
          var sy = h/12;//scale factor on the y-dir
          var o = [];
          o.push(`<svg x='${lead}pt' y='${sunk}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          if(1){
            //o.push(`<svg x='0' y='0' width='${lead}pt' height='${h}pt' viewBox='0 0 10.666 16' preserveAspectRatio='none'>`);
            o.push(`<use x='0' y='0' transform='scale(1,${sy})' xlink:href='#mySQRT' />`);
            //o.push(`</svg>`);
            o.push(`<line x1='${lead}pt' y1='0.8pt' x2='${w}pt' y2='0.8pt' class='MyLine'/>`);
            this.used.add('mySQRT');
            if(n){
              //var [w1_, h1_, mid1_, s1_, g1_, q1] = this.shrinkSvg(this.toInnerSvg(['\\brace', n.split('')], compact), this.nroot_rate);
              var [ids_,ws_,ops_] = this.findIdByElement(n);
              let nws_ = ws_*this.nroot_rate;
              let nhs_ = 12*this.nroot_rate;
              o.push(`<svg x='2pt' y='0' width='${nws_}' height='${nhs_}pt' viewBox='0 0 ${ws_*1.3333} 16'>`);
              o.push(`<use xlink:href='#${ids_}'/>`);
              o.push(`</svg>`);
            }
          }
          return [w,h,mid,o.join('\n'),0,0,''];

          break;
        case '\\frac':

          this.fraclevel += 1;
          var [w1_,h1_,mid1_,s1_,g1_,q1_,id1_] = this.toInnerSvg(v[1],compact);
          var [w2_,h2_,mid2_,s2_,g2_,q2_,id2_] = this.toInnerSvg(v[2],compact);
          w = (w1_ > w2_) ? w1_ : w2_;
          w += 2; /// make it 1pt longer than either one of the numerator/denomitator
          h = 3 + h1_ + h2_;
          mid = h1_ + 1.5;
          var o = [];
          if (w1_ < w2_) {
            var dx = 1+ (w2_ - w1_)/2;
            o.push(`<svg x='${dx}pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg x='1pt' y='${3+h1_}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<line x1='0pt' y1='${1.5+h1_}pt' x2='${w}pt' y2='${1.5+h1_}pt' class='MyLine'/>`);
            var newv = [w,h,mid,o.join('\n'),0,0,''];
          } else {
            var dx = 1+ (w1_ - w2_)/2;
            o.push(`<svg x='1pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg x='${dx}pt' y='${3+h1_}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<line x1='0pt' y1='${1.5+h1_}pt' x2='${w}pt' y2='${1.5+h1_}pt' class='MyLine'/>`);
            var newv = [w,h,mid,o.join('\n'),0,0,''];
          }
          this.fraclevel -= 1;
          if (this.isdisplaymath && this.fraclevel == 0) {
            return newv;
          } else {
            return this.shrinkSvg(newv,this.frac_rate);
          }
          break;

        case '\\binom':
          var [w1_,h1_,mid1_,s1_,g1_,q1_,id1_] = this.toInnerSvg(v[1],compact);
          var [w2_,h2_,mid2_,s2_,g2_,q2_,id2_] = this.toInnerSvg(v[2],compact);
          w = (w1_ > w2_) ? w1_ : w2_;
          h = 1 + h1_ + h2_;
          mid = h1_;
          var o = [];
          var rate = 0.70;
          var [id1,w1,op1] = this.findIdByElement('(');
          var [id2,w2,op2] = this.findIdByElement(')');
          var T = 8;
          if (w1_ < w2_) {
            var dx =  (w2_ - w1_)/2;///dx for numerator
            o.push(`<svg x='${dx+T}pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg    x='${T}pt' y='${1+h1_}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<svg x='0' y='0' width='${T}pt' height='${h}pt' viewBox='0 0 ${w1*1.333} 16' preserveAspectRatio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id1}' />`);
            o.push(`</svg>`);
            o.push(`<svg x='${T+w}pt' y='0' width='${T}pt' height='${h}pt' viewBox='0 0 ${w2*1.333} 16' preserveAspectRatio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id2}' />`);
            o.push(`</svg>`);
            return this.shrinkSvg([T+w+T,h,mid,o.join('\n'),0,0,''],rate);
          } else {
            var dx = (w1_ - w2_)/2;///dx for denominator
            o.push(`<svg    x='${T}pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg x='${dx+T}pt' y='${1+h1_}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<svg x='0' y='0' width='${T}pt' height='${h}pt' viewBox='0 0 ${w1*1.333} 16' preserveAspectRatio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id1}' />`);
            o.push(`</svg>`);
            o.push(`<svg x='${T+w}pt' y='0' width='${T}pt' height='${h}pt' viewBox='0 0 ${w2*1.333} 16' preserveAspectRatio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id2}' />`);
            o.push(`</svg>`);
            return this.shrinkSvg([T+w+T,h,mid,o.join('\n'),0,0,''],rate);
          }
          break;

        case '\\subsup':
        case '\\sub':
        case '\\sup':
          var compact1 = compact;///the base item follows the parent instruction
          var compact2 = true;///the sub item always compact (no extra space added between items in brace)
          var compact3 = true;///the sup item always compact (no extra space added between items in brace)
          var q = 0;
          if (v[1] === '\\lim' || v[1] === '\\int' || v[1] === '\\sum') {
            var q = 1;
            ///set q=1 for these three items. This allows for flexibility as
            /// we have seen for displaymath and \int pairs the extraspaces are
            /// turned off, but it is left on for inlinemath and \int pair
          }

          if (v[0] === '\\subsup') {
            var [w1_,h1_,mid1_,s1_,g1_,q1_,id1_] = this.toInnerSvg(v[1],compact1);
            var [w2_,h2_,mid2_,s2_,g2_,q2_,id2_] = this.toInnerSvg(v[2],compact2);
            var [w3_,h3_,mid3_,s3_,g3_,q3_,id3_] = this.toInnerSvg(v[3],compact3);
          } else if (v[0] === '\\sub') {
            var [w1_,h1_,mid1_,s1_,g1_,q1_,id1_] = this.toInnerSvg(v[1],compact1);
            var [w2_,h2_,mid2_,s2_,g2_,q2_,id2_] = this.toInnerSvg(v[2],compact2);
            var [w3_,h3_,mid3_,s3_,g3_,q3_,id3_] = [0,0,0,'',0,0];
          } else {
            var [w1_,h1_,mid1_,s1_,g1_,q1_,id1_] = this.toInnerSvg(v[1],compact1);
            var [w2_,h2_,mid2_,s2_,g2_,q2_,id2_] = [0,0,0,'',0,0];
            var [w3_,h3_,mid3_,s3_,g3_,q3_,id3_] = this.toInnerSvg(v[2],compact3);
          }

          if (!this.isinmatrix && this.isdisplaymath && v[1] === '\\sum'
                  || !this.isinmatrix && this.isdisplaymath && v[1] === '\\lim') {
            var o = [];
            if (v[1] === '\\sum') {
              var display_rate_x = 2.5;
              var display_rate_y = 1.8;
              var nw1_ = w1_    *display_rate_x;
              var nh1_ = h1_    *display_rate_y;
              var nmid1_ = mid1_*display_rate_y;
            } else {
              var display_rate = 1.0;
              var nw1_ = w1_    *display_rate;
              var nh1_ = h1_    *display_rate;
              var nmid1_ = mid1_*display_rate;
            }
            var nw2_ = w2_*this.sub_rate;
            var nh2_ = h2_*this.sub_rate;
            var nmid2_ = mid2_*this.display_rate;
            var nw3_ = w3_*this.sup_rate;
            var nh3_ = h3_*this.sup_rate;
            var nmid3_ = mid3_*this.display_rate;

            ///compute the max w
            var max_w = Math.max(nw1_,nw2_,nw3_);
            var dx1_ = (max_w - nw1_)/2;
            var dx2_ = (max_w - nw2_)/2;
            var dx3_ = (max_w - nw3_)/2;

            var h = 0;
            o.push(`<svg x='${dx3_}pt' y='${h}pt' width='${nw3_}pt' height='${nh3_}pt' viewBox='0 0 ${w3_*1.333} ${h3_*1.333}'>`);
            o.push(s3_);
            o.push(`</svg>`);
            h += nh3_;

            o.push(`<svg x='${dx1_}pt' y='${h}pt' width='${nw1_}pt' height='${nh1_}pt' viewBox='0 0 ${w1_*1.333} ${h1_*1.333}' preserveAspectRatio='none'>`);
            o.push(s1_);
            o.push(`</svg>`);
            h += nh1_;

            o.push(`<svg x='${dx2_}pt' y='${h}pt' width='${nw2_}pt' height='${nh2_}pt' viewBox='0 0 ${w2_*1.333} ${h2_*1.333}'>`);
            o.push(s2_);
            o.push(`</svg>`);
            return [Math.max(nw1_,nw2_,nw3_),nh1_+nh2_+nh3_,nh3_+nmid1_,o.join('\n'),0,1,''];

          } else if (!this.isinmatrix && this.isdisplaymath && v[1] === '\\int') {

            var [idtop_,wdtop_,optop_] = this.findIdByElement('\\inttop');
            var [idbot_,wdbot_,opbot_] = this.findIdByElement('\\intbot');

            var nw1_ = w1_    *1.0;//this is for integration symbol
            var nh1_ = h1_    *2.6;//this is for integration symbol
            var nmid1_ = mid1_*2.6;//this is for integration symbol

            var nw2_ = w2_*this.sub_rate;
            var nh2_ = h2_*this.sub_rate;
            var nmid2_ = mid2_*this.display_rate;
            var nw3_ = w3_*this.sup_rate;
            var nh3_ = h3_*this.sup_rate;
            var nmid3_ = mid3_*this.display_rate;

            var o = [];
            if (0) {
              o.push(`<svg x='0' y='0' width='${nw1_}pt' height='${nh1_}pt' viewBox='0 0 ${w1_*1.333} ${h1_*1.333}' preserveAspectRatio='none'>`);
              o.push(s1_);
              o.push(`</svg>`);
            } else {
              o.push(`<svg x='0' y='0'           width='${nw1_}pt' height='${nh1_}pt' viewBox='0 0 ${wdtop_*1.333} ${24*1.333}' preserveAspectRatio='none'>`);
              o.push(`<use y='9pt' xlink:href='#${idtop_}' />`);
              o.push(`<use y='21pt' xlink:href='#${idbot_}' />`);
              o.push(`</svg>`);
            }
            var dx2 = nw1_ * 0.666;
            var dx3 = nw1_;
            /// for bottom one
            o.push(`<svg x='${dx2}pt' y='${nh1_-nh2_}pt' width='${nw2_}pt' height='${nh2_}pt' viewBox='0 0 ${w2_*1.333} ${h2_*1.333}'>`);
            o.push(s2_);
            o.push(`</svg>`);
            /// for top one
            o.push(`<svg x='${dx3}pt' y='0' width='${nw3_}pt' height='${nh3_}pt' viewBox='0 0 ${w3_*1.333} ${h3_*1.333}'>`);
            o.push(s3_);
            o.push(`</svg>`);
            var w = Math.max(nw1_,(dx2+nw2_),(dx3+nw3_));
            var h = nh1_;
            var mid = nmid1_;
            var s = o.join('\n');
            return [w,h,mid,s,0,0,'']; /// q=0

          } else {
            var o = [];
            var nw2_ = w2_*this.sub_rate;
            var nh2_ = h2_*this.sub_rate;
            var nw3_ = w3_*this.sup_rate;
            var nh3_ = h3_*this.sup_rate;
            var supdx = nh3_*0.30;
            var subdx = nh2_*0.30;
            o.push(`<svg y='${supdx}pt'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg x='${w1_}pt' y='${supdx+h1_-nh2_+subdx}pt' width='${nw2_}pt' height='${nh2_}pt' viewBox='0 0 ${w2_*1.333} ${h2_*1.333}'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<svg x='${w1_}pt' width='${nw3_}pt' height='${nh3_}pt' viewBox='0 0 ${w3_*1.333} ${h3_*1.333}'>`);
            o.push(s3_);
            o.push(`</svg>`);
            return [w1_+this.max(nw2_,nw3_),h1_+(subdx)+(supdx),mid1_+(supdx),o.join('\n'),g1_,q,''];
          }
          break;

        default:
          throw new Error(`unhandled key: '${v[0]}'`);

          break;

      } ///switch

    } else {

      ///
      /// ...this is an individual token!, such as 'a', 'b', '1', '2',
      ///    '\\emptyset', '\\mathscr{AB}', ...
      ///

      /// check for following
      ///
      ///   \\mathscr{AB},
      ///   \\mathbb{AB}, and
      ///   \\mathcal{AB}
      ///
      var is_mathvariant = false;
      if (re_fontvariants.test(v)) {
        var m = re_fontvariants.exec(v);
        var key = m[1];
        var str = m[2];
        var id = str[0];
        if (key === 'mathcal') { key = 'mathscr'; }
        is_mathvariant = true;
      } else if (re_variable.test(v)) {
        var key = 'mathit';
        var str = v;
        var id = str[0];
        is_mathvariant = true;
      }

      if (is_mathvariant) {
        var o = [];
        var x = 0;
        var w = 0;
        var h = 12.0;
        var mid = 6.0;
        if (pjson.fontVariants[key]) {
          for (var c of str) {
            var val = pjson.fontVariants[key][c];
            if (val) {
              let {id,width,unicode,dx,dy,fontstyle} = val;
              let opts = [];
              opts.push(`class='MyText'`); 
              opts.push(`x='${x}pt'`);
              opts.push(`dx='${dx}'`);
              opts.push(`dy='0.75em'`);
              opts.push(`textLength='${width}pt'`);
              opts.push(`lengthAdjust='spacingAndGlyphs'`);
              opts.push(`id='${id}'`);
              if(fontstyle){
                opts.push(`font-style='${fontstyle}'`);
              }
              var opt = opts.join(' ');
              o.push( `<text ${opt}>${unicode}</text>` );
              x += width;
              w += width;
            }
          }
        }
        var s = o.join('\n');
        return [w,h,mid,s,0,0,id];
      }

      var [id,width,op] = this.findIdByElement(v);
      if (id === 'myINT') {
        
        var h = 14.0;
        var mid = 6.0;
        var [idtop_,wdtop_,optop_] = this.findIdByElement('\\inttop');
        var [idbot_,wdbot_,opbot_] = this.findIdByElement('\\intbot');
        var s = [];
        s.push(`<svg x='0' y='0' width='${wdtop_}pt' height='14pt' viewBox='0 0 ${wdtop_*1.3333} ${24*1.3333}' preserveAspectRatio='none'>`);
        s.push(`<use y='9pt' xlink:href='#${idtop_}' />`);
        s.push(`<use y='21pt' xlink:href='#${idbot_}' />`);
        s.push(`</svg>`);
        s = s.join('\n');
        w = Math.max(wdtop_,wdbot_);
        return [w,h,mid,s,op,0,id];


      } else if (id) {

        /// found an id in the 'use' database, and use it
        var s = `<use xlink:href='#${id}' />`
        var w = parseFloat(width);
        var h = 12.0;
        var mid = 6.0;
        return [w,h,mid,s,op,0,id];
      } else {

        /// not yet defined for this primitive, thus, we just
        /// display it as text.
        var s = `<text class='MyText' x='0' y='0' dy='0.75em'>${v}</text>`
        var w = this.measureText(v,12);
        var h = 12.0;
        var mid = 6.0;
        return [w,h,mid,s,0,0,''];
      }
    }
  }

  toSvg (v) {

    ///
    /// ...the <use..> element might has the <defs> section
    ///    that is the following:
    ///
    ///<circle id="myCircle" cx="0" cy="0" r="5" />
    ///<text dy='.7em' class='MyText' id='myA'>&#x1D44E;</text>
    ///<text dy='.7em' class='MyText' id='myB'>&#x1D44F;</text>
    ///<text dy='.7em' class='MyText' id='myC'>&#x1D450;</text>
    ///<text dy='.7em' class='MyText' id='myD'>&#x1D451;</text>
    ///<text dy='.7em' class='MyText' id='myN'>&#x1D45B;</text>
    ///<text dy='1em' class='MyText' id='mySQRT'>&#x221A;</text>
    ///<text dy='1em' class='MyText' id='myOVERLINE'>&#x0305;</text>
    ///<text dy='.7em' class='MyText' id='myPLUS'>+</text>
    ///

    ///
    /// ...the toInnerSvg() returns six-element array:
    ///    w - overall width
    ///    h - overall height
    ///    mid - mid-line that should be aligned with surrounding
    ///    s - the SVG-formatted string
    ///    g - an integer indicating if this is an operator that
    ///        should be added extra space before it and after
    ///    q - an integer indicating whether it should be followed
    ///        by extra space, such as for the space between the two
    ///        items of: \\lim_{i=0} i^2
    ///

    var [w,h,mid,s,g,q,id] = this.toInnerSvg(v);
    h+=1; ///experimental: On iBook the bottom part of some of the letters are cutoff.

    ///NOTE: 
    /// The 'this.parser.xcssfontsize' variable contains individual size adjustments
    /// made by the block itself, which is taken from 'TBLR.cssfontsize', 'LONG.cssfontsize' etc.
    /// This means if the font size is made smaller than the math SVG will also need to be
    /// shrinked or enlarged. 
    ///
    /// On top of that the config.HTML.bodyfontsizept specifies the body font size
    /// for the entire document. We also need to take this into account.
    ///
    if(this.cssfontrate){
      var rate = parseFloat(this.cssfontrate);
    } else {
      var rate = 1;
    }
    var vw = w*1.3333;
    var vh = h*1.3333;
    var nw = w;
    var nh = h;
    var nmid = mid;
    var shiftdist = this.shiftdist;
    if (Number.isFinite(rate) && rate != 1.0) {
      nw        *= rate;
      nh        *= rate;
      nmid      *= rate;
      shiftdist *= rate;
    }
    nw        *= 1.3333;
    nh        *= 1.3333;
    nmid      *= 1.3333;
    shiftdist *= 1.3333;

    ///construct svg
    var news = `${s}`;
    //var dv = - nh + nmid;
    //var dv = - nh;
    var defs = [];
    for (var mathSymbol of pjson.mathSymbols) {
      let {dy,dx,id,unicode,width} = mathSymbol;
      if (this.used.has(id)) {
        defs.push(`<text dy='${dy}' dx='${dx}' class='MyText' id='${id}' textLength='${width}pt' lengthAdjust='spacingAndGlyphs'>${unicode}</text>`);
      }
    }
    var s = `\
<svg 
xmlns='http://www.w3.org/2000/svg' 
xmlns:xlink='http://www.w3.org/1999/xlink'
width='${nw}px'
height='${nh}px'
fill='currentColor'
stroke='currentColor'
viewBox='0 0 ${vw} ${vh}'
style='vertical-align:text-bottom;'
role='img'
focusable='false' >
<defs> <style type="text/css"><![CDATA[
   .MyText { stroke:none; fill:currentColor; font-size:12pt; }
   .MyLine { stroke:currentColor; fill:none; font-size:12pt; }
]]></style>
${defs.join('\n')}
</defs>
${news}
</svg>`;

    return {s,nw,nh,shiftdist};
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

  getFontsizePt(str){
    ///NOTE: the input str is 'normalsize', 'small', 'footnotesize', etc.
    var d = pjson.fontSizes[''+this.parser.normalsize];
    if(d) {
      return d[str];///THIS will be an integer
    }
    return null;
  }

  cssfontsizeRate(str){
    ///NOTE: the input str is CSS font size such as '1em','1.2em','0.8em'
    if (str.endsWith('em')){
      var mystr = str.slice(0,str.length-2);
      var mynum = parseFloat(mystr);
      if(Number.isFinite(mynum)){
        return mynum;
      }
    }
    return 1;
  }

  toCssFontsize(fs) {
    ///INPUT is 'normalsize', 'small', 'footnotesize', etc.
    var p = pjson.cssFontsizes[fs];
    if (p) {
      return p;
    }
    return '';
  }

  toLatexFontsize(fs) {
    ///INPUT is 'normalsize', 'small', 'footnotesize', etc.
    var p = pjson.latexFontsizes[fs];
    if (p) {
      return p;
    }
    return '';
  }

}

module.exports = { NitrilePreviewTokenizer }
