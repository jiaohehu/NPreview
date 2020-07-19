'use babel';

class NitrilePreviewBase {

  constructor(){
  }

  trim_left(para){
    return para.map(x => x.trimLeft());
  }

  join_backslashed_lines (para) {
    var o = [];
    var s0 = '';
    for (var s of para) {
      if (s0 && s0[s0.length-1] === '\\') {
        s0 = s0.slice(0,s0.length-1);///remove the last backslash
        s0 = this.join_line(s0,s);
        o.pop();
        o.push(s0);
      } else {
        s0 = s.trimLeft();
        o.push(s0);
      }
    }
    return o;
  }

  join_line (s0, s1) {
    ///
    /// join two lines
    ///

    s0 = s0 || '';
    s1 = s1 || '';
    s1 = s1.trimLeft();
    if (!s0) {
      return s1;
    } else if (!s1) {
      return s0;
    } else if (s0.charCodeAt(s0.length-1) < 128 || s1.charCodeAt(0) < 128) {
      return s0 + ' ' + s1;
    } else {
      return s0 + s1;
    }
  }

  join_para (para) {
    ///
    /// join two lines
    ///

    if (para.length === 0) {
      return '';
    }
    var line = para.shift();
    for (var s of para) {
      line = this.join_line(line,s);
    }
    return line;
  }

}
module.exports = { NitrilePreviewBase };
