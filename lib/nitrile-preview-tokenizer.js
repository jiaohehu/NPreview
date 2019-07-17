'use babel';

const re_token = /\\\;|\\\,|\\\:|\\\\|\\\{|\\\}|\\\w+|./g;
const pjson = require('./nitrile-preview-config.json');

module.exports = { 

  "sub_rate" : 0.50,
  "sup_rate" : 0.50,

  async tokenize (str) {
    return this.toTokens(str);
  },

  async groupize (str) {
    var l = this.toTokens(str);
    var g = this.toGroups(l);
    return g;
  },

  async svgize (str) {
    return this.parse(str);
  },

  parse (str) {
    var l = this.toTokens(str);
    var l = this.removeEmptyTokens(l);
    var g = this.toGroups(l);
    var g = this.toSubsup(g);
    var s = this.toSvg(g);
    return s;
  },

  measureText(str, fontSize = 12) {
    const widths = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.2796875,0.2765625,0.3546875,0.5546875,0.5546875,0.8890625,0.665625,0.190625,0.3328125,0.3328125,0.3890625,0.5828125,0.2765625,0.3328125,0.2765625,0.3015625,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.2765625,0.2765625,0.584375,0.5828125,0.584375,0.5546875,1.0140625,0.665625,0.665625,0.721875,0.721875,0.665625,0.609375,0.7765625,0.721875,0.2765625,0.5,0.665625,0.5546875,0.8328125,0.721875,0.7765625,0.665625,0.7765625,0.721875,0.665625,0.609375,0.721875,0.665625,0.94375,0.665625,0.665625,0.609375,0.2765625,0.3546875,0.2765625,0.4765625,0.5546875,0.3328125,0.5546875,0.5546875,0.5,0.5546875,0.5546875,0.2765625,0.5546875,0.5546875,0.221875,0.240625,0.5,0.221875,0.8328125,0.5546875,0.5546875,0.5546875,0.5546875,0.3328125,0.5,0.2765625,0.5546875,0.5,0.721875,0.5,0.5,0.5,0.3546875,0.259375,0.353125,0.5890625]
    const avg = 0.5279276315789471
    return str
      .split('')
      .map(c => c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg)
      .reduce((cur, acc) => acc + cur) * fontSize
  },

  max (v1,v2) {
    return (v1 > v2) ? v1 : v2;
  },

  shrinkSvg (v,rate) {
    var [w2_,h2_,mid2_,s2_] = v;
    var nw2_ = w2_*rate;
    var nh2_ = h2_*rate;
    var nmid2_ = mid2_*rate;
    var o = [];
    o.push(`<svg x='0' y='0' width='${nw2_}pt' height='${nh2_}pt' viewbox='0 0 ${w2_*1.3333} ${h2_*1.3333}'>`);
    o.push(s2_);
    o.push(`</svg>`);
    return [nw2_,nh2_,nmid2_,o.join('\n')];
  },

  findIdByElement (v) {
    for (var mathSymbol of pjson.mathSymbols) {
      let {kbd,width,id} = mathSymbol;
      if (kbd === v) {
        return [id,width];
      }
    }
    return ['',0];
  },

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
  },

  removeEmptyTokens (tokens) {
    
    var o = [];
    for (var token of tokens) {
      if (token.match(/^\s+$/)) {
        /// skip
      } else {
        o.push(token);
      }
    }
    return o;
  },

  toSubsup (g) {

    var inner0 = null;
    var inner1 = null;
    var inner2 = null;
    var inner3 = null;
    var inner4 = null;
    if (Array.isArray(g)) {
      var key = g[0];
      if (key  === 'brace' || key  === 'leftright') {
        var inner = g[1];
        var fence1 = g[2];
        var fence2 = g[3];
        var o = [];
        var j = 0;
        while (j < inner.length) {
          inner0 = inner[j]
          inner1 = inner[j+1]
          inner2 = inner[j+2]
          inner3 = inner[j+3]
          inner4 = inner[j+4]
          if (inner1 === '_' && inner3 === '^') {
            o.push(['\\subsup',inner0,inner2,inner4]);
            j += 5;
          } else if (inner1 === '^' && inner3 === '_') {
            o.push(['\\subsup',inner0,inner4,inner2]);
            j += 5;
          } else if (inner1 === '_') {
            o.push(['\\sub',inner0,inner2]);
            j += 3;
          } else if (inner1 === '^') {
            o.push(['\\sup',inner0,inner2]);
            j += 3;
          } else {
            o.push(inner0);
            j += 1;
          }
        }
        if (key  === 'brace') {
          return [key,o];
        } else {
          return [key,o,fence1,fence2];
        }
      }
    }
    return g;
  },

  toGroups (tokens) {

    var o = [];
    var group = null;
    while (tokens.length) {
      [tokens,group] = this.getNextGroup(tokens);
      o.push(group);
    }
    return ['brace',o];
  },

  getThisToken (tokens) {
    var token = tokens[0];
    tokens = tokens.slice(1);
    return [tokens,token];
  },

  skipEmptyTokens (tokens) {
    while (tokens.length && tokens[0].match(/\s/)) {
      tokens = tokens.slice(1);
    }
    return tokens;
  },

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
      [tokens,fence1] = this.getThisToken(tokens);
      while (tokens.length) {
        if (tokens[0] === '\\right') {
          tokens = tokens.slice(1);
          [tokens,fence2] = this.getThisToken(tokens);
          break;
        } else {
          [tokens,group] = this.getNextGroup(tokens);
          inner.push(group);
        }
      }
      return [tokens,['leftright',inner,fence1,fence2]];

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
      return [tokens,['brace',inner]];

    } else if (tokens[0] === '\\sqrt') {

      tokens = tokens.slice(1);
      tokens = this.skipEmptyTokens(tokens);
      [tokens,group] = this.getNextGroup(tokens);
      return [tokens,['\\sqrt',group]];

    } else if (tokens[0] === '\\frac') {

      tokens = tokens.slice(1);
      tokens = this.skipEmptyTokens(tokens);
      [tokens,group1] = this.getNextGroup(tokens);
      [tokens,group2] = this.getNextGroup(tokens);
      return [tokens,['\\frac',group1,group2]];

    } else if (tokens[0] === '\\binom') {

      tokens = tokens.slice(1);
      tokens = this.skipEmptyTokens(tokens);
      [tokens,group1] = this.getNextGroup(tokens);
      [tokens,group2] = this.getNextGroup(tokens);
      return [tokens,['\\binom',group1,group2]];

    } else {

      return this.getThisToken(tokens);
  
    }

  },

  toInnerSvg (v) {

    /// one group, such as 'leftright', '[', ']', ...
    
    var x = 0;
    var y = 0;
    var w = 0;
    var h = 12;
    var mid = 6;
    var s = '';
    if (!v) {
      var s = `<use x='0' y='0' xlink:href='#myUDQU' />`
      return [8,12,6,s]; 
    } else if (Array.isArray(v)) {
      switch (v[0]) {

        case 'leftright': 
        case 'brace':  
          var g = v[1];
          var w = 0;
          var h = 0;
          var mid = 0;
          var results = g.map( (z) => this.toInnerSvg(z) );
          var s = '';
          var o = [];
          for (result of results) {
            var [w_,h_,mid_,s_] = result;
            w += w_;
            h = (h > h_) ? h : h_;
            mid = (mid > mid_) ? mid : mid_;
          }
          var w = 0;
          for (result of results) {
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
          if (v[0] === 'brace') {
            return [w,h,mid,o.join('\n')];
          } else {
            /// leftright
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
          return [w,h,mid,o.join('\n')];
          break;
         
        case '\\frac':  
          var [w1_,h1_,mid1_,s1_] = this.toInnerSvg(v[1]);
          var [w2_,h2_,mid2_,s2_] = this.toInnerSvg(v[2]);
          w = (w1_ > w2_) ? w1_ : w2_;
          w += 4; /// make it 2pt longer than either one of the numerator/denomitator
          h = 1 + h1_ + h2_;
          mid = h1_;
          var o = [];
          var rate = 0.70;
          if (w1_ < w2_) {
            var dx = 2+ (w2_ - w1_)/2;
            o.push(`<svg x='${dx}pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg x='2pt' y='${1+h1_}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<line x1='0pt' y1='${0.5+h1_}pt' x2='${w}pt' y2='${0.5+h1_}pt' class='MyLine'/>`);
            return this.shrinkSvg([w,h,mid,o.join('\n')],rate);
          } else {
            var dx = 2+ (w1_ - w2_)/2;
            o.push(`<svg x='2pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg x='${dx}pt' y='${1+h1_}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<line x1='0pt' y1='${0.5+h1_}pt' x2='${w}pt' y2='${0.5+h1_}pt' class='MyLine'/>`);
            return this.shrinkSvg([w,h,mid,o.join('\n')],rate);
          }
          break;

        case '\\binom':  
          var [w1_,h1_,mid1_,s1_] = this.toInnerSvg(v[1]);
          var [w2_,h2_,mid2_,s2_] = this.toInnerSvg(v[2]);
          w = (w1_ > w2_) ? w1_ : w2_;
          w += 4; /// make it 2pt longer on each side 
          h = 1 + h1_ + h2_;
          mid = h1_;
          var o = [];
          var rate = 0.70;
          var [id1,w1] = this.findIdByElement('(');
          var [id2,w2] = this.findIdByElement(')');
          if (w1_ < w2_) {
            var dx = 2+ (w2_ - w1_)/2;///dx for numerator
            o.push(`<svg x='${w1+dx}pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg x='${w1+2}pt' y='${1+h1_}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<svg x='0' y='0' width='${w1}pt' height='${h}pt' viewbox='0 0 ${w1*1.333} 16' preserveaspectratio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id1}' />`);
            o.push(`</svg>`);
            o.push(`<svg x='${w1+w}pt' y='0' width='${w2}pt' height='${h}pt' viewbox='0 0 ${w2*1.333} 16' preserveaspectratio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id2}' />`);
            o.push(`</svg>`);
            return this.shrinkSvg([w1+w+w2,h,mid,o.join('\n')],rate);
          } else {
            var dx = 2+ (w1_ - w2_)/2;///dx for denominator
            o.push(`<svg x='${w1+2}pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg x='${w1+dx}pt' y='${1+h1_}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<svg x='0' y='0' width='${w1}pt' height='${h}pt' viewbox='0 0 ${w1*1.333} 16' preserveaspectratio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id1}' />`);
            o.push(`</svg>`);
            o.push(`<svg x='${w1+w}pt' y='0' width='${w2}pt' height='${h}pt' viewbox='0 0 ${w2*1.333} 16' preserveaspectratio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#${id2}' />`);
            o.push(`</svg>`);
            return this.shrinkSvg([w1+w+w2,h,mid,o.join('\n')],rate);
          }
          break;

        case '\\sup':  
          var [w1_,h1_,mid1_,s1_] = this.toInnerSvg(v[1]);
          var [w2_,h2_,mid2_,s2_] = this.toInnerSvg(v[2]);
          var o = [];
          var nw2_ = w2_*this.sup_rate;
          var nh2_ = h2_*this.sup_rate;
          o.push(s1_);
          o.push(`<svg x='${w1_}pt' y='0' width='${nw2_}pt' height='${nh2_}pt' viewbox='0 0 ${w2_*1.333} ${h2_*1.333}'>`);
          o.push(s2_);
          o.push(`</svg>`);
          return [w1_+nw2_,h1_,mid1_,o.join('\n')];
          break;

        case '\\sub':  
          var [w1_,h1_,mid1_,s1_] = this.toInnerSvg(v[1]);
          var [w2_,h2_,mid2_,s2_] = this.toInnerSvg(v[2]);
          var o = [];
          var nw2_ = w2_*this.sub_rate;
          var nh2_ = h2_*this.sub_rate;
          o.push(s1_);
          o.push(`<svg x='${w1_}pt' y='${h1_-(nh2_*0.5)}pt' width='${nw2_}pt' height='${nh2_}pt' viewbox='0 0 ${w2_*1.333} ${h2_*1.333}'>`);
          o.push(s2_);
          o.push(`</svg>`);
          return [w1_+nw2_,h1_+(nh2_*0.50),mid1_,o.join('\n')];
          break;

        case '\\subsup':  
          var [w1_,h1_,mid1_,s1_] = this.toInnerSvg(v[1]);
          var [w2_,h2_,mid2_,s2_] = this.toInnerSvg(v[2]);
          var [w3_,h3_,mid3_,s3_] = this.toInnerSvg(v[3]);
          var o = [];
          var nw2_ = w2_*this.sub_rate;
          var nh2_ = h2_*this.sub_rate;
          var nw3_ = w3_*this.sup_rate;
          var nh3_ = h3_*this.sup_rate;
          o.push(s1_);
          o.push(`<svg x='${w1_}pt' y='${h1_-(nh2_*0.5)}pt' width='${nw2_}pt' height='${nh2_}pt' viewbox='0 0 ${w2_*1.333} ${h2_*1.333}'>`);
          o.push(s2_);
          o.push(`</svg>`);
          o.push(`<svg x='${w1_}pt' y='0' width='${nw3_}pt' height='${nh3_}pt' viewbox='0 0 ${w3_*1.333} ${h3_*1.333}'>`);
          o.push(s3_);
          o.push(`</svg>`);
          return [w1_+this.max(nw2_,nw3_),h1_+(nh2_*0.50),mid1_,o.join('\n')];
          break;

        default:
          throw new Error(`unhandled key: '${v[0]}'`);

          break;
         
      } ///switch
    } else if (v === ' ') {
      /// skip
      return [0,0,0,'']; 
    } else {
      var [id,width] = this.findIdByElement(v);
      if (id) {
        var s = `<use xlink:href='#${id}' />`
        var w = parseFloat(width);
        var h = 12.0;
        var mid = 6.0;
        return [w,h,mid,s]; 
      } else {
        var s = `<text class='MyText' dy='0.8em'>${v}</text>`
        var w = this.measureText(v,12);    
        var h = 12.0;
        var mid = 6.0;
        return [w,h,mid,s]; 
      }
    }
  },
    
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
      defs.push(`<text dy='${dy}' dx='${dx}' class='MyText' id='${id}'>${unicode}</text>`);
    }
    return `\
<svg xmlns:xlink='http://www.w3.org/1999/xlink' 
width='${w}pt' 
height='${h}pt' 
style='outline:1px solid orange; vertical-align:${dv}pt;'
role='img' focusable='false' 
xmlns='http://www.w3.org/2000/svg' > 
<defs>
  <style type="text/css"><![CDATA[
     .MyText {
       stroke: none;
       fill: black;
       font-size: 12pt;
     }
     .MyLine {
       stroke: black;
       fill: none;
       font-size: 12pt;
     }
  ]]></style>
  ${defs.join('\n')}
</defs>
${news}
</svg>`

  },


};

