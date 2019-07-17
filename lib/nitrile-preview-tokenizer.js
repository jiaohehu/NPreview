'use babel';

const re_token = /\\\;|\\\,|\\\:|\\\\|\\\{|\\\}|\\\w+|./g;

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
console.error(g);
    var s = this.toSvg(g);
    return s;
  },

  findIdByElement (v) {
    switch (v) {
      case 'a': return 'myA';
      case 'b': return 'myB';
      case 'c': return 'myC';
      case 'd': return 'myD';
      case '+': return 'myPLUS';
      case 'n': return 'myN';
      case '\\sqrt': return 'mySQ';
      default: return '';
    }
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

  toGroups (tokens) {

    var o = [];
    var group = null;
    while (tokens.length) {
      [tokens,group] = this.getNextGroup(tokens);
      o.push(group);
    }
    return o;
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
      return [tokens,['leftright',fence1,fence2,inner]];
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

    /// one group, such as 'leftright', '[', ']', ...
    
    var x = 0;
    var y = 0;
    var w = 0;
    var h = 12;
    var mid = 6;
    var s = '';
    if (Array.isArray(v)) {
      switch (v[0]) {
        case 'leftright': {
          return '';
          break;
        }
        case 'brace': {
          var g = v[1];
          var w = 0;
          var h = 0;
          var mid = 0;
          var results = g.map( x => this.toInnerSvg(x) );
          var s = '';
          var o = [];
          for (result of results) {
            var [w_,h_,mid_,s_] = result;
            w += w_;
            h = (h > h_) ? h : h_;
            mid = (mid > mid_) ? mid : mid_;
          }
          w = 0;
          for (result of results) {
            var [w_,h_,mid_,s_] = result;
            if (mid_ < mid) {
              var dy = mid - mid_;
              o.push(`<svg x='${w}pt' y='${dy}pt'>${s_}</svg>`);
              /// recal row height because of dy shift
              h_ += dy;
              h = (h > h_) ? h : h_;
            } else {
              o.push(`<svg x='${w}pt' y='0'>${s_}</svg>`);
            }
            w += w_;
          }
          return [w,h,mid,o.join('\n')];
          break;
        }
        case '\\sqrt': {
          var [w_,h_,mid_,s_] = this.toInnerSvg(v[1]);
          var lead = 8;
          w = w_ + lead;
          h = h_;
          mid = h/2;
          var o = [];
          o.push(`<svg x='${lead}pt'>`);
          o.push(s_);
          o.push(`</svg>`);
          o.push(`<use x='0' y='0' xlink:href='#mySQ' />`);
          o.push(`<line x1='${lead}pt' y1='0' x2='${w}pt' y2='0' class='MyLine'/>`);
          return [w,h,mid,o.join('\n')];
          break;
        }
        case '\\frac': {
          var [w1_,h1_,mid1_,s1_] = this.toInnerSvg(v[1]);
          var [w2_,h2_,mid2_,s2_] = this.toInnerSvg(v[2]);
          var lead = 8;
          w = (w1_ > w2_) ? w1_ : w2_;
          w += 4; /// make it 2pt longer than either one of the numerator/denomitator
          h = 5 + h1_ + h2_;
          mid = h1_;
          var o = [];
          if (w1_ < w2_) {
            var dx = 2+ (w2_ - w1_)/2;
            o.push(`<svg x='${dx}pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg x='2pt' y='${5+h1_}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<line x1='0pt' y1='${2+h1_}pt' x2='${w}pt' y2='${2+h1_}pt' class='MyLine'/>`);
            return [w,h,mid,o.join('\n')];
          } else {
            var dx = 2+ (w1_ - w2_)/2;
            o.push(`<svg x='2pt' y='0'>`);
            o.push(s1_);
            o.push(`</svg>`);
            o.push(`<svg x='${dx}pt' y='${5+h1_}pt'>`);
            o.push(s2_);
            o.push(`</svg>`);
            o.push(`<line x1='0pt' y1='${2+h1_}pt' x2='${w}pt' y2='${2+h1_}pt' class='MyLine'/>`);
            return [w,h,mid,o.join('\n')];
          }
          break;
        }
      }
    } else if (v === ' ') {
      /// skip
      return [0,0,0,'']; 
    } else {
      var id = this.findIdByElement(v);
      s = `<use x='${x}pt' y='${y}pt' xlink:href='#${id}' />`
      x += 8;
      w = 8;
      h = 12;
      mid = 6;
      return [w,h,mid,s]; 
    }
  },
    
  toSvg (g) {

    var [w,h,mid,s] = this.toInnerSvg(['brace',g]);
    var news = `<svg>${s}</svg>`
    var dv = -h + mid + 4;
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
  <circle id="myCircle" cx="0" cy="0" r="5" />
  <text dy='.7em' class='MyText' id='myA'>&#x1D44E;</text>
  <text dy='.7em' class='MyText' id='myB'>&#x1D44F;</text>
  <text dy='.7em' class='MyText' id='myC'>&#x1D450;</text>
  <text dy='.7em' class='MyText' id='myD'>&#x1D451;</text>
  <text dy='.7em' class='MyText' id='myN'>&#x1D45B;</text>
  <text dy='1em' class='MyText' id='mySQ'>&#x221A;</text>
  <text dy='1em' class='MyText' id='myOVERLINE'>&#x0305;</text>
  <text dy='.7em' class='MyText' id='myPLUS'>+</text>
</defs>
${news}
</svg>`

  },


};

