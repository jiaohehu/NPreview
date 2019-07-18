'use babel';

const re_token = /\\\;|\\\,|\\\:|\\\\|\\\{|\\\}|\\sqrt\[.*?\]|\\mathscr\{[A-Za-z0-9]*\}|\\mathcal\{[A-Za-z0-9]*\}|\\mathbb\{[A-Za-z0-9]*\}|\\[a-zA-Z]+|./g;
const pjson = require('./nitrile-preview-math.json');
const char_widths = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.2796875,0.2765625,0.3546875,0.5546875,0.5546875,0.8890625,0.665625,0.190625,0.3328125,0.3328125,0.3890625,0.5828125,0.2765625,0.3328125,0.2765625,0.3015625,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.2765625,0.2765625,0.584375,0.5828125,0.584375,0.5546875,1.0140625,0.665625,0.665625,0.721875,0.721875,0.665625,0.609375,0.7765625,0.721875,0.2765625,0.5,0.665625,0.5546875,0.8328125,0.721875,0.7765625,0.665625,0.7765625,0.721875,0.665625,0.609375,0.721875,0.665625,0.94375,0.665625,0.665625,0.609375,0.2765625,0.3546875,0.2765625,0.4765625,0.5546875,0.3328125,0.5546875,0.5546875,0.5,0.5546875,0.5546875,0.2765625,0.5546875,0.5546875,0.221875,0.240625,0.5,0.221875,0.8328125,0.5546875,0.5546875,0.5546875,0.5546875,0.3328125,0.5,0.2765625,0.5546875,0.5,0.721875,0.5,0.5,0.5,0.3546875,0.259375,0.353125,0.5890625];
const my_valid_fence_ids = [ "myLB",     "myRB",     "myLBR",    "myRBR",    "myLLBR",   "myRRBR",   "myLANGLE", "myRANGLE", "myLPAREN", "myRPAREN", "myLVERT",  "myRVERT",  "myLLVERT", "myRRVERT", "myLCEIL",  "myRCEIL",  "myLFLOOR", "myRFLOOR" ]; 

class NitrilePreviewTokenizer {

  constructor () {
    this.sub_rate = 0.70;
    this.sup_rate = 0.70;
    this.used = new Set();
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

  async svgize (str) {
    return this.parse(str);
  } 

  parse (str) {
    this.used.clear();
    var l = this.toTokens(str);
    var g = this.toGroups(l);
    var g = this.toCleanup(g);
    var g = this.toCommands(g);
    var g = this.toSubsup(g);
    var s = this.toSvg(g);
    return s;
  } 

  isValidFenceId (id) { 
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

  shrinkSvg (v,rate = 0.7) {
    var [w2_,h2_,mid2_,s2_] = v;
    var nw2_ = w2_*rate;
    var nh2_ = h2_*rate;
    var nmid2_ = mid2_*rate;
    var o = [];
    o.push(`<svg x='0' y='0' width='${nw2_}pt' height='${nh2_}pt' viewbox='0 0 ${w2_*1.3333} ${h2_*1.3333}'>`);
    o.push(s2_);
    o.push(`</svg>`);
    return [nw2_,nh2_,nmid2_,o.join('\n')];
  } 

  findIdByElement (v) {
    for (var mathSymbol of pjson.mathSymbols) {
      let {kbd,width,id} = mathSymbol;
      if (kbd === v) {
        this.used.add(id);
        return [id,width];
      }
    }
    return ['',0];
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

  toGroups (tokens) {

    var o = [];
    var group = null;
    while (tokens.length) {
      [tokens,group] = this.getNextGroup(tokens);
      o.push(group);
    }
    return ['\\brace',o];
  } 

  toCleanup (g) {

    var inner0 = null;
    var re_empty = /^\s+$/;
    if (Array.isArray(g)) {
      var key = g[0];
      if (key  === '\\brace' || key  === '\\leftright') {
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
        for (var j=0; j < commandInfo.count; ++j) {
          [items,cmd] = this.getNextCommand(items);
          o.push(cmd);
        }
        return [items,o];

      } else {

        /// some exceptions such as '\\sqrt[n]'
        var re_nroot = /^\\sqrt\[(.*)\]$/;
        if (re_nroot.test(item0)) {
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
      if (key  === '\\brace' || key  === '\\leftright') {
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
      if (key  === '\\brace' || key  === '\\leftright') {
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

  toInnerSvg (v) {

    /// one group, such as '\\leftright', '[', ']', ...
    
    var x = 0;
    var y = 0;
    var w = 0;
    var h = 12;
    var mid = 6;
    var s = '';
    if (v === undefined || v === null) {
      var s = `<use x='0' y='0' xlink:href='#myUDQU' />`
      this.used.add('myUDQU');
      return [8,12,6,s]; 
    } else if (v === '') {
      return [0,0,0,'']; 
    } else if (Array.isArray(v)) {
      switch (v[0]) {

        case '\\leftright': 
        case '\\brace':  
          var g = v[1];
          var w = 0;
          var h = 0;
          var mid = 0;
          var results = g.map( (z) => this.toInnerSvg(z) );
          var s = '';
          var o = [];
          for (let result of results) {
            var [w_,h_,mid_,s_] = result;
            w += w_;
            h = (h > h_) ? h : h_;
            mid = (mid > mid_) ? mid : mid_;
          }
          var w = 0;
          for (let result of results) {
            var [w_,h_,mid_,s_] = result;
            if (w_ == 0) {
              /// skip over blanks
              continue;
            }
            if (mid_ < mid) {
              var dy = mid - mid_;
              o.push(`<svg x='${w}pt' y='${dy}pt'>${s_}</svg>`);
              /// recal row height because of dy shift
              h_ += dy;
              h = (h > h_) ? h : h_;
            } else {
              o.push(`<svg x='${w}pt' y='0'>${s_}</svg>`);
            }
            w += parseFloat(w_);
          }
          if (v[0] === '\\brace') {
            return [w,h,mid,o.join('\n')];
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
            var [id1,w1] = this.findIdByElement(fence1);
            var [id2,w2] = this.findIdByElement(fence2);
            if (!this.isValidFenceId(id1)) { [id1,w1] = this.findIdByElement(' ');    }
            if (!this.isValidFenceId(id2)) { [id2,w2] = this.findIdByElement(' ');    }
            o = [];
            o.push(`<svg x='0' y='0' width='${w1}pt' height='${h}pt' viewbox='0 0 ${w1*1.333} 16' preserveaspectratio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id1}' />`);
            o.push(`</svg>`);
            o.push(`<svg x='${w1+w}pt' y='0' width='${w2}pt' height='${h}pt' viewbox='0 0 ${w2*1.333} 16' preserveaspectratio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id2}' />`);
            o.push(`</svg>`);
            o.push(`<svg x='${w1}pt' y='0' >`);
            o.push(s);
            o.push(`</svg>`);
            return [w+w1+w2,h,mid,o.join('\n')];
          }
          break;

        case '\\text':  
          var v1 = v[1];
          if (Array.isArray(v1)) {
            if (v1[0] === '\\brace') {
              var str = v1[4];
              w = this.measureText(str);   
              s = `<text class='MyText' x='0' y='12pt' dy='-2pt'>${str}</text>`;
              return [w,12,6,s];
            } else {
              var [id1,w1] = this.findIdByElement(' ');
              s = `<use xlink:href='#${id1}' />`;
              return [w1,12,6,s];
            }
          } else {
            var str = ''+v1;/// ensure this is text
            w = this.measureText(str);
            s = `<text class='MyText' x='0' y='12pt' dy='-2pt'>${str}</text>`;
            return [w,12,6,s];
          }
          break;

        case '\\nroot':  
          var n = v[1];
          var [w1_,h1_,mid1_,s1_] = this.shrinkSvg(this.toInnerSvg(['\\brace',n.split('')]));
          var nw1_ = w1_*this.sup_rate;
          var nh1_ = h1_*this.sup_rate;
          var nlead = nw1_;
          nlead -= 5;
          if (nlead < 0) nlead = 0;
          var [w_,h_,mid_,s_] = this.toInnerSvg(v[2]);
          var lead = 8;
          w = w_;
          h = h_;
          mid = h/2;
          var o = [];
          /// draw the power-text
          o.push(`<svg x='0' y='0' width='${nw1_}pt' height='${nh1_}pt' viewbox='0 0 ${w1_*1.333} ${h1_*1.333}'>`);
          o.push(s1_);
          o.push(`</svg>`);
          /// draw content-text 
          o.push(`<svg x='${nlead+lead}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          /// draw sq-symbol
          o.push(`<svg x='${nlead}pt' y='0' width='${lead}pt' height='${h}pt' viewbox='0 0 10.666 16' preserveaspectratio='none'>`);
          o.push(`<use x='0' y='0' xlink:href='#mySQ' />`);
          o.push(`</svg>`);
          /// draw overhead line
          o.push(`<line x1='${nlead+lead}pt' y1='0.8pt' x2='${nlead+lead+w}pt' y2='0.8pt' class='MyLine'/>`);
          this.used.add('mySQ');
          return [nlead+lead+w,h,mid,o.join('\n')];
          break;
         
        case '\\sqrt':  
          var [w_,h_,mid_,s_] = this.toInnerSvg(v[1]);
          var lead = 8;
          w = w_ + lead;
          h = h_;
          mid = h/2;
          var o = [];
          o.push(`<svg x='${lead}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          o.push(`<svg x='0' y='0' width='${lead}pt' height='${h}pt' viewbox='0 0 10.666 16' preserveaspectratio='none'>`);
          o.push(`<use x='0' y='0' xlink:href='#mySQ' />`);
          o.push(`</svg>`);
          o.push(`<line x1='${lead}pt' y1='0.8pt' x2='${w}pt' y2='0.8pt' class='MyLine'/>`);
          this.used.add('mySQ');
          return [w,h,mid,o.join('\n')];
          break;
         
        case '\\frac':  
          var rate = 0.70;
          var [w1_,h1_,mid1_,s1_] = this.shrinkSvg(this.toInnerSvg(v[1]),rate);
          var [w2_,h2_,mid2_,s2_] = this.shrinkSvg(this.toInnerSvg(v[2]),rate);
          w = (w1_ > w2_) ? w1_ : w2_;
          w += 4; /// make it 2pt longer than either one of the numerator/denomitator
          h = 1 + h1_ + h2_;
          mid = h1_;
          var o = [];
          if (w1_ < w2_) {
            var dx = 2+ (w2_ - w1_)/2;
            o.push(`<svg x='${dx}pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg x='2pt' y='${1+h1_}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<line x1='0pt' y1='${0.5+h1_}pt' x2='${w}pt' y2='${0.5+h1_}pt' class='MyLine'/>`);
            return [w,h,mid,o.join('\n')];
          } else {
            var dx = 2+ (w1_ - w2_)/2;
            o.push(`<svg x='2pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg x='${dx}pt' y='${1+h1_}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<line x1='0pt' y1='${0.5+h1_}pt' x2='${w}pt' y2='${0.5+h1_}pt' class='MyLine'/>`);
            return [w,h,mid,o.join('\n')];
          }
          break;

        case '\\binom':  
          var [w1_,h1_,mid1_,s1_] = this.toInnerSvg(v[1]);
          var [w2_,h2_,mid2_,s2_] = this.toInnerSvg(v[2]);
          w = (w1_ > w2_) ? w1_ : w2_;
          h = 1 + h1_ + h2_;
          mid = h1_;
          var o = [];
          var rate = 0.70;
          var [id1,w1] = this.findIdByElement('(');
          var [id2,w2] = this.findIdByElement(')');
          var T = 8;
          if (w1_ < w2_) {
            var dx =  (w2_ - w1_)/2;///dx for numerator
            o.push(`<svg x='${dx+T}pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg    x='${T}pt' y='${1+h1_}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<svg x='0' y='0' width='${T}pt' height='${h}pt' viewbox='0 0 ${w1*1.333} 16' preserveaspectratio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id1}' />`);
            o.push(`</svg>`);
            o.push(`<svg x='${T+w}pt' y='0' width='${T}pt' height='${h}pt' viewbox='0 0 ${w2*1.333} 16' preserveaspectratio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id2}' />`);
            o.push(`</svg>`);
            return this.shrinkSvg([T+w+T,h,mid,o.join('\n')],rate);
          } else {
            var dx = (w1_ - w2_)/2;///dx for denominator
            o.push(`<svg    x='${T}pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg x='${dx+T}pt' y='${1+h1_}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<svg x='0' y='0' width='${T}pt' height='${h}pt' viewbox='0 0 ${w1*1.333} 16' preserveaspectratio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id1}' />`);
            o.push(`</svg>`);
            o.push(`<svg x='${T+w}pt' y='0' width='${T}pt' height='${h}pt' viewbox='0 0 ${w2*1.333} 16' preserveaspectratio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id2}' />`);
            o.push(`</svg>`);
            return this.shrinkSvg([T+w+T,h,mid,o.join('\n')],rate);
          }
          break;

        case '\\subsup':  
        case '\\sub':  
        case '\\sup':  
          if (v[0] === '\\subsup') {
            var [w1_,h1_,mid1_,s1_] = this.toInnerSvg(v[1]);
            var [w2_,h2_,mid2_,s2_] = this.toInnerSvg(v[2]);
            var [w3_,h3_,mid3_,s3_] = this.toInnerSvg(v[3]);
          } else if (v[0] === '\\sub') {
            var [w1_,h1_,mid1_,s1_] = this.toInnerSvg(v[1]);
            var [w2_,h2_,mid2_,s2_] = this.toInnerSvg(v[2]);
            var [w3_,h3_,mid3_,s3_] = [0,0,0,''];
          } else { 
            var [w1_,h1_,mid1_,s1_] = this.toInnerSvg(v[1]);
            var [w2_,h2_,mid2_,s2_] = [0,0,0,''];
            var [w3_,h3_,mid3_,s3_] = this.toInnerSvg(v[2]);
          }
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
          o.push(`<svg x='${w1_}pt' y='${supdx+h1_-nh2_+subdx}pt' width='${nw2_}pt' height='${nh2_}pt' viewbox='0 0 ${w2_*1.333} ${h2_*1.333}'>`);
          o.push(s2_);
          o.push(`</svg>`);
          o.push(`<svg x='${w1_}pt' width='${nw3_}pt' height='${nh3_}pt' viewbox='0 0 ${w3_*1.333} ${h3_*1.333}'>`);
          o.push(s3_);
          o.push(`</svg>`);
          return [w1_+this.max(nw2_,nw3_),h1_+(subdx)+(supdx),mid1_+(supdx),o.join('\n')];
          break;

        default:
          throw new Error(`unhandled key: '${v[0]}'`);

          break;
         
      } ///switch

    } else {

      /// this is an individual token!, such as 'a', 'b', '1', '2', 
      /// '\\emptyset', '\\mathscr{AB}', ...

      /// check for \\mathscr{AB}, \\mathbb{AB}, and \\mathcal{AB}
      var re_fontvariants = /^\\(mathscr|mathbb|mathcal)\{(.*)\}$/;
      var m = re_fontvariants.exec(v);
      if (m) {
        var key = m[1];
        var str = m[2];
console.error(key);
console.error(str);
        var o = [];
        var x = 0;
        var w = 0;
        var h = 12.0;
        var mid = 6.0;
        if (key === 'mathcal') { key = 'mathscr'; }
        if (pjson.fontvariants[key]) {
          for (var c of str) {
            var val = pjson.fontvariants[key][c];
            if (val) {
              let {width,unicode,dx,dy} = val;
              o.push( `<text class='MyText' x='${x}pt' dx='${dx}' dy='${dy}'>${unicode}</text>` );
              x += width;
              w += width;
            }
          }
        }
        var s = o.join('\n');
        return [w,h,mid,s]; 
      }

      var [id,width] = this.findIdByElement(v);
      if (id) {

        /// found an id in the 'use' database, and use it
        var s = `<use xlink:href='#${id}' />`
        var w = parseFloat(width);
        var h = 12.0;
        var mid = 6.0;
        return [w,h,mid,s]; 
      } else {

        /// not yet defined for this primitive, thus, we just
        /// display it as text.
        var s = `<text class='MyText' x='0' y='12pt' dy='-2pt'>${v}</text>`
        var w = this.measureText(v,12);    
        var h = 12.0;
        var mid = 6.0;
        return [w,h,mid,s]; 
      }
    }
  } 
    
  toSvg (g) {

  ///<circle id="myCircle" cx="0" cy="0" r="5" />
  ///<text dy='.7em' class='MyText' id='myA'>&#x1D44E;</text>
  ///<text dy='.7em' class='MyText' id='myB'>&#x1D44F;</text>
  ///<text dy='.7em' class='MyText' id='myC'>&#x1D450;</text>
  ///<text dy='.7em' class='MyText' id='myD'>&#x1D451;</text>
  ///<text dy='.7em' class='MyText' id='myN'>&#x1D45B;</text>
  ///<text dy='1em' class='MyText' id='mySQ'>&#x221A;</text>
  ///<text dy='1em' class='MyText' id='myOVERLINE'>&#x0305;</text>
  ///<text dy='.7em' class='MyText' id='myPLUS'>+</text>

    var [w,h,mid,s] = this.toInnerSvg(g);
    var news = `<svg>${s}</svg>`
    var dv = -h + mid + 4;
    var defs = [];
    for (var mathSymbol of pjson.mathSymbols) {
      let {dy,dx,id,unicode} = mathSymbol;
      if (this.used.has(id)) {
        defs.push(`<text dy='${dy}' dx='${dx}' class='MyText' id='${id}'>${unicode}</text>`);
      }
    }
    return `\
<svg xmlns:xlink='http://www.w3.org/1999/xlink' width='${w}pt' height='${h}pt' 
style='outline:1px solid orange; vertical-align:${dv}pt;' role='img' focusable='false' 
xmlns='http://www.w3.org/2000/svg' > 
<defs> <style type="text/css"><![CDATA[
     .MyText { stroke: none; fill: black; font-size: 12pt; }
     .MyLine { stroke: black; fill: none; font-size: 12pt; }
  ]]></style>
  ${defs.join('\n')}
</defs>
${news}
</svg>`

  } 
}

module.exports = { NitrilePreviewTokenizer }

