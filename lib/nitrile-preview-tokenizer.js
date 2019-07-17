'use babel';

const re_token = /\\\;|\\\,|\\\:|\\\\|\\\{|\\\}|\\\w+|./g;
const pjson = require('./nitrile-preview-config.json');

module.exports = { 

  async tokenize (str) {
    return this.toTokens(str);
  },

  async groupize (str) {
    var l = this.toTokens(str);
    var g = this.toGroups(l);
    return g;
  },

  async svgize (str) {
    var l = this.toTokens(str);
    var g = this.toGroups(l);
    var g = this.toSubsup(g);
console.error(g);
    var s = this.toSvg(g);
    return s;
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

  toSubsup (g) {

    var inner0 = null;
    var inner1 = null;
    var inner2 = null;
    var inner3 = null;
    var inner4 = null;
    if (Array.isArray(g)) {
      if (g[0] === 'brace' ||
          g[0] === 'leftright') {
        var inner = g[1];
        var o = [];
        var j = 0;
        for (j=0; j < inner.length; ++j) {
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
        g[1] = o;
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
    while (tokens[0].match(/\s/)) {
      tokens = tokens.slice(1);
    }
    var token = tokens[0];
    tokens = tokens.slice(1);
    return [tokens,token];
  },

  skipThisToken (tokens) {
    tokens = tokens.slice(1);
    while (tokens[0].match(/\s/)) {
      tokens = tokens.slice(1);
    }
    return [tokens];
  },

  getNextGroup (tokens,isskipblank) {
    if (isskipblank) {
      while (tokens[0].match(/\s/)) {
        tokens = tokens.slice(1);
      }
    }
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
      [tokens,fence1] = this.getThisToken(tokens);
      [tokens,fence1] = this.getThisToken(tokens);
      while (tokens.length) {
        if (tokens[0] === '\\right') {
          [tokens,fence2] = this.getThisToken(tokens);
          [tokens,fence2] = this.getThisToken(tokens);
          break;
        } else {
          [tokens,group] = this.getNextGroup(tokens);
          inner.push(group);
        }
      }
      return [tokens,['leftright',inner,fence1,fence2]];
    }
    if (tokens[0] === '\{') {
      [tokens] = this.getThisToken(tokens);
      while (tokens.length) {
        if (tokens[0] === '\}') {
          [tokens] = this.getThisToken(tokens);
          break;
        } else {
          [tokens,group] = this.getNextGroup(tokens);
          inner.push(group);
        }
      }
      return [tokens,['brace',inner]];
    }
    if (tokens[0] === '\\sqrt') {
      [tokens] = this.skipThisToken(tokens);
      [tokens,group] = this.getNextGroup(tokens,true);
      return [tokens,['\\sqrt',group]];
    }
    if (tokens[0] === '\\frac') {
      [tokens] = this.skipThisToken(tokens);
      [tokens,group1] = this.getNextGroup(tokens,true);
      [tokens,group2] = this.getNextGroup(tokens,true);
      return [tokens,['\\frac',group1,group2]];
    }
    group = tokens[0];
    tokens = tokens.slice(1);
    return [tokens,group];

  },

  toInnerSvg (v) {

console.error('toInnerSvg');
console.error(v);

    /// one group, such as 'leftright', '[', ']', ...
    
    var x = 0;
    var y = 0;
    var w = 0;
    var h = 12;
    var mid = 6;
    var s = '';
    if (Array.isArray(v)) {
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
            s = o.join('\n');
            var fence1 = v[2];
            var fence2 = v[3];
            if (fence1 === '\\\{') fence1 = '\\lbrace';
            if (fence1 === '\\\}') fence1 = '\\rbrace';
            if (fence2 === '\\\{') fence2 = '\\lbrace';
            if (fence2 === '\\\}') fence2 = '\\rbrace';
            var [id1,w1] = this.findIdByElement(fence1);
            var [id2,w2] = this.findIdByElement(fence2);
            o = [];
            o.push(`<svg x='0' y='0' width='${w1}pt' height='${h}pt' viewbox='0 0 ${w1*1.333} 16' preserveaspectratio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#myLB' />`);
            o.push(`</svg>`);
            o.push(`<svg x='${w1+w}pt' y='0' width='${w2}pt' height='${h}pt' viewbox='0 0 ${w2*1.333} 16' preserveaspectratio='none'>`);
            o.push(`<use x='0' y='0' xlink:href='#myRB' />`);
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

        case '\\sup':  
          var [w1_,h1_,mid1_,s1_] = this.toInnerSvg(v[1]);
          var [w2_,h2_,mid2_,s2_] = this.toInnerSvg(v[2]);
          var o = [];
          var nw2_ = w2_*0.36;
          var nh2_ = h2_*0.36;
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
          var nw2_ = w2_*0.36;
          var nh2_ = h2_*0.36;
          o.push(s1_);
          o.push(`<svg x='${w1_}pt' y='${h1_-(nh2_*0.5)}pt' width='${nw2_}pt' height='${nh2_}pt' viewbox='0 0 ${w2_*1.333} ${h2_*1.333}'>`);
          o.push(s2_);
          o.push(`</svg>`);
          return [w1_+nw2_,h1_+(nh2_*0.50),mid1_,o.join('\n')];
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
      var s = `<use x='${x}pt' y='${y}pt' xlink:href='#${id}' />`
      var w = parseFloat(width);
      var h = 12.0;
      var mid = 6.0;
      return [w,h,mid,s]; 
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

