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
    var s = this.toSvg(g);
    return s;
  },

  findIdByElement (v) {
    switch (v) {
      case 'a': return 'myA';
      case 'b': return 'myB';
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
      console.error(cnt);
      console.error(v);
      o.push(v[0]);
      start_i = re_token.lastIndex;
    }
    cnt = str.slice(start_i);
    console.error(cnt);
    return o;
  },

  toGroups (tokens) {

    var o = [];
    while (tokens.length) {
      if (tokens[0] === '\\left') {
        /// search for \\right
        var fence1 = tokens[1];
        var fence2 = null;
        for (var j=2; j < tokens.length; ++j) {
          if (tokens[j] === '\\right') {
            fence2 = tokens[j+1];
            break;
          }
        }
        o.push(['leftright',fence1,fence2,this.toGroups(tokens.slice(2,j))]);
        tokens = tokens.slice(j+2);
        continue;
      }
      if (tokens[0] === '\{') {
        /// search for \}
        for (var j=1; j < tokens.length; ++j) {
          if (tokens[j] === '\}') {
            break;
          }
        }
        o.push(['brace',this.toGroups(tokens.slice(1,j))]);
        tokens = tokens.slice(j+1);
        continue;
      }
      o.push(tokens[0]);
      tokens = tokens.slice(1);
    }
    return o;

  },

  toInnerSvg (g) {

    /// one group, such as 'leftright', '[', ']', ...
    
    var x = 0;
    var y = 0;
    var w = 0;
    var h = 1;
    var mid = 0.5;
    var s = '';
    for (v of g) {
      if (Array.isArray(v)) {
        switch (v[0]) {
          case 'leftright': {
            break;
          }
          case 'brace': {
            break;
          }
        }
      } else {
        var id = this.findIdByElement(v);
        s += `<use x='${x}ex' y='${y}em' xlink:href='#${id}' />`
        x += 1;
        w += 1;
      }
    }
    return [w,h,mid,s]; 
  },
    
  toSvg (g) {

    var [w,h,mid,s] = this.toInnerSvg(g);
    var news = `<svg>${s}</svg>`
    var dv = -h + mid + 0.3;
    return `\
<svg xmlns:xlink='http://www.w3.org/1999/xlink' 
width='${w}ex' 
height='${h}em' 
style='outline:1px solid orange; vertical-align:${dv}em;'
role='img' focusable='false' 
xmlns='http://www.w3.org/2000/svg' > 
<defs>
  <style type="text/css"><![CDATA[
     .MyStyle {
       stroke: black;
       fill: none;
       font-size: 12pt;
     }
  ]]></style>
  <circle id="myCircle" cx="0" cy="0" r="5" />
  <text dy='.7em' id='myA'>a</text>
  <text dy='.7em' id='myB'>b</text>
  <text dy='.7em' id='myN'>&#x1D45B;</text>
  <text dy='1em' id='mySQ'>&#x221A;</text>
  <text dy='.7em' id='myPLUS'>+</text>
</defs>
${news}
</svg>`

  },


};

