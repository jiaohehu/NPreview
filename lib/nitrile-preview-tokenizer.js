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
    var group = null;
    while (tokens.length) {
      [tokens,group] = this.toGroup(tokens);
      o.push(group);
    }
    return o;
  },

  toGroup (tokens) {
    if (tokens[0] === '\\left') {
      /// search for \\right
      var fence1 = tokens[1];
      var fence2 = null;
      var inner = [];
      var group = null;
      tokens = tokens.slice(2);
      while (tokens.length) {
        if (tokens[0] === '\\right') {
          fence2 = tokens[1];
          tokens = tokens.slice(2);
          break;
        } else {
          [tokens,group] = this.toGroup(tokens);
          inner.push(group);
        }
      }
      return [tokens,'leftright',fence1,fence2,inner];
    }
    if (tokens[0] === '\{') {
      var inner = [];
      while (tokens.length) {
        if (tokens[0] === '\}') {
          tokens = tokens.slice(1);
          break;
        } else {
          [tokens,group] = this.toGroup(tokens);
          inner.push(group);
        }
      }
      return [tokens,'brace',inner];
    }
    if (tokens[0] === '\\sqrt') {
      tokens = tokens.slice(1);
      while (tokens[0].match(/\s/)) {
        tokens = tokens.slice(1);
      }
      [tokens,group] = this.toGroup(tokens);
      return [tokens,['\\sqrt',group]];
    }
    group = tokens[0];
    tokens = tokens.slice(1);
    return [tokens,group];

  },

  toInnerSvg (g) {

    /// one group, such as 'leftright', '[', ']', ...
    
    var x = 0;
    var y = 0;
    var w = 0;
    var h = 12;
    var mid = 6;
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
      } else if (v !== ' ') {
        var id = this.findIdByElement(v);
        s += `<use x='${x}pt' y='${y}pt' xlink:href='#${id}' />`
        x += 10;
        w += 10;
      }
    }
    return [w,h,mid,s]; 
  },
    
  toSvg (g) {

    var [w,h,mid,s] = this.toInnerSvg(g);
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
  <text dy='.7em' class='MyText' id='myN'>&#x1D45B;</text>
  <text dy='1em' class='MyText' id='mySQ'>&#x221A;</text>
  <text dy='.7em' class='MyText' id='myPLUS'>+</text>
</defs>
${news}
</svg>`

  },


};

