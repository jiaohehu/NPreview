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
      console.log(cnt);
      console.log(v);
      o.push(v[0]);
      start_i = re_token.lastIndex;
    }
    cnt = str.slice(start_i);
    console.log(cnt);
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
    

};

