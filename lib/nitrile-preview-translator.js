'use babel';

const json_rubyitems = require('./nitrile-preview-rubyitems.json');
const json_math = require('./nitrile-preview-math.json');
const entjson = require('./nitrile-preview-entity.json');

const re_labeled = /^\\ref\{([^\{\}]*)\}\s*(.*)$/u;
const re_comm = /^%([\^!].*)$/u;
const re_spcl = /^(@@|@)\s+(\w+)\s*(.*)$/u;
const re_hdgs = /^(#+)\s+(.*)$/u;
const re_quot = /^(>)\s+(.*)$/u;
const re_math = /^(\$\$|\$)\s+(.*)$/u;
const re_plst = /^(-|\*\)+|\d+\)+)\s+(.*)$/u;
const re_hlst = /^(\+)\s+(.*)$/u;
const re_dlst = /^(\*)\s+(.*)$/u;
const re_nlst = /^(\d+\))\s+(.*)$/u;
const re_long = /^(\(&\))\s+(.*)$/u;
const re_tabb = /^(&)\s+(.*)$/u;
const re_tabu = /^(=)\s+(.*)$/u;
const re_samp = /^\s+(.*)$/u;
const re_pass = /^(~~|~)\s+(.*)$/u;
const re_note = /^(%)\s+(.*)$/u;
const re_hrle = /^\*{3}$/u;
const re_sep = /^\s*(-{3,})$/u;
const re_indented = /^\s/;
const re_unmask = /`([^`]+)`|``([^`]+)``|```([^`]+)```|(?<!\w)\\(\w+)\{([^\{\}]+)\}|(?<!\w)\\\((.*?)\\\)|(?<!\w)\\\[(.*?)\\\]/g;
const re_uri = /^\w+:\/\//u;
const re_ruby = /^(\S+?)\u{30fb}(\S+)/u;
const re_prim = /^\[\s+(.+?)\s+\]\s*(.*)$/;
const re_seco = /^\[\[\s+(.*?)\s+\]\]\s*(.*)$/;
const re_thrd = /^\[\[\[\s+(.*?)\s+\]\]\]\s*(.*)$/;
const re_blank = /^(\s+)(.*)$/;
const re_plain = /^(\S+\s*)(.*)$/;
const re_nitrilemode = /^\^(\w+)=(.*)$/u;
const re_nitrileitem = /^\^(\S+?)\u{30fb}(\S+)/u;
const re_nitrileconf = /^!(\w+)\.(\w+)\s*=\s*(.*)$/u;
const re_nitrileconf_plus = /^!(\w+)\.(\w+)\s*\+=\s*(.*)$/u;
const ar_partnums = ['I','II','III','IV','V','VI','VII','IIX','IX','X'];
const ar_subfignums = ['a','b','c','d','e','f','g','h','i','j','k','l','m',
                       'n','o','p','q','r','s','t','u','v','w','x','y','z'];

class NitrilePreviewTranslator {

  constructor(name) {
    this.name = name; /// the accumulating count of content blocks for this dept
  }

  unmask (line) {
    /// unmask all inline markups within a text
    ///
    /// 1  {{emph-text}}
    /// 2  ``math-text``
    /// 3  `code-text`
    /// 4  ${string}
    ///

    var cnt;
    var v;
    var line = line || '';
    var start_i = 0;
    var newtext = '';
    var re_bq = /^(`{1,})([^`]+)(`{1,})$/;
    var re_sq = /^'([^']+)'$/;
    while ((v = re_unmask.exec(line)) !== null) {
      var i = v.index;
      cnt = line.slice(start_i,i);
      cnt = this.escape(cnt);
      newtext = newtext.concat(cnt);
      if (v[1] !== undefined) {

        //` ... `

        var cnt = v[1]; 
        newtext += this.style('var',cnt);

      } else if (v[2] !== undefined) {

        //`` ... ``

        var cnt = v[2]; 
        newtext += this.inlinemath(cnt);

      } else if (v[3] !== undefined) {

        //``` ... ```

        var cnt = v[3]; 
        newtext += this.style('code',cnt);

      } else if (v[4] !== undefined || v[5] !== undefined) {

        //\em{...}
        //\uri{...}
        //\ruby{...}
        //\ref{...}
        //\img{...}
        //\vbarchart{...}
        //\xyplot{...}

        var key = v[4]; 
        var cnt = v[5]; 
        if(key=='em'){
          newtext += this.style('em',cnt);
        }else if(key=='uri'){
          newtext += this.uri(cnt);
        }else if(key=='ruby'){
          if(re_ruby.test(cnt)){
            var v = re_ruby.exec(cnt);
            var rb = v[1];
            var rt = v[2];
            newtext += this.ruby(rb,rt);
          }else{
            cnt = this.escape(cnt);
            newtext += this.rubify(cnt);
          }
        }else if(key=='ref'){
          newtext += this.to_ref(cnt);
        }else if(key=='img'){
          newtext += this.do_img(cnt);
        }else if(key=='vbarchart'){
          newtext += this.do_vbarchart(cnt);
        }else if(key=='xyplot'){
          newtext += this.do_xyplot(cnt);
        }else{
          var cnt = v[0]; 
          cnt = this.escape(cnt);
          newtext += cnt;
        }

      } else if (v[6] !== undefined) {

        /// \( ... \)
        var cnt = v[6]; 
        newtext += this.inlinemath(cnt);

      } else if (v[7] !== undefined) {

        /// \[ ... \]
        var cnt = v[7]; 
        newtext += this.inlinemath(cnt,1);

      }
      start_i = re_unmask.lastIndex;
    }
    cnt = line.slice(start_i);
    cnt = this.escape(cnt);
    newtext += cnt;
    return newtext;
  }


  getNextCell(line){
    if(line.length==0){
      return ['','','',''];
    }
    ///${...}
    if(line.charCodeAt(0)==36 && line.charCodeAt(1)==123){
      var i=2;
      var n=1;
      while(i < line.length){
        if(n==0){
          break;
        }
        if(line.charCodeAt(i)==125){
          i+=1;
          n=0;
        }else{
          ++i;
        }
      }
      var s = line.substring(0,i);
      if(n==0){
        var cnt = line.substring(2,i-1);
      }else{
        var cnt = line.substring(2,i);
      }
      return [s,line.slice(i),'uri',cnt];
    }
    ///{...}
    if(line.charCodeAt(0)==123){
      var i=1;
      var n=1;
      while(i < line.length){
        if(n==0){
          break;
        }
        if(line.charCodeAt(i)==92){
          i+=2;
        }else if(line.charCodeAt(i)==123){
          n++;
          ++i;
        }else if(line.charCodeAt(i)==125){
          n--;
          ++i;
        }else{
          ++i;
        }
      }
      var s = line.substring(0,i);
      if(n==0){
        var cnt = line.substring(1,i-1);
      }else{
        var cnt = line.substring(1,i);
      }
      return [s,line.slice(i),'brace',cnt];
    }
    ///``...``
    if(line.charCodeAt(0)==96 && line.charCodeAt(1)==96){
      var i=2;
      var n=1;
      while(i < line.length){
        if(n==0){
          break;
        }
        if(line.charCodeAt(i)==96 && line.charCodeAt(i+1)==96){
          i+=2;
          n=0;
        }else{
          ++i;
        }
      }
      var s = line.substring(0,i);
      if(n==0){
        var cnt = line.substring(2,i-2);
      }else{
        var cnt = line.substring(2,i);
      }
      return [s,line.slice(i),'math',cnt];
    }
    ///plain text with trailing blanks
    var v = re_plain.exec(line);
    if(v){
      return [v[1],v[2],'',v[1]];
    }
    var v = re_blank.exec(line);
    if(v){
      return [v[1],v[2],'',v[1]];
    }
    ///get next char only
    var s = line.charAt(0);
    return [s,line.slice(1),'',s];
  }

  getNextComponent(line){
    if(line.length==0){
      return ['','','',''];
    }
    ///{{...}}
    if(line.charCodeAt(0)==123 && line.charCodeAt(1)==123){
      var i=2;
      var n=1;
      while(i < line.length){
        if(n==0){
          break;
        }
        if(line.charCodeAt(i)==125 && line.charCodeAt(i+1)==125){
          i+=2;
          n=0;
        }else{
          ++i;
        }
      }
      var s = line.substring(0,i);
      if(n==0){
        var cnt = line.substring(2,i-2);
      }else{
        var cnt = line.substring(2,i);
      }
      return [s,line.slice(i),'emph',cnt];
    }
    ///${#...}
    if(line.charCodeAt(0)==36 && line.charCodeAt(1)==123 && line.charCodeAt(2)==35){
      var i=3;
      var n=1;
      while(i < line.length){
        if(n==0){
          break;
        }
        if(line.charCodeAt(i)==125){
          i+=1;
          n=0;
        }else{
          ++i;
        }
      }
      var s = line.substring(0,i);
      if(n==0){
        var cnt = line.substring(3,i-1);
      }else{
        var cnt = line.substring(3,i);
      }
      return [s,line.slice(i),'ref',cnt];
    }
    ///${...}
    if(line.charCodeAt(0)==36 && line.charCodeAt(1)==123){
      var i=2;
      var n=1;
      while(i < line.length){
        if(n==0){
          break;
        }
        if(line.charCodeAt(i)==125){
          i+=1;
          n=0;
        }else{
          ++i;
        }
      }
      var s = line.substring(0,i);
      if(n==0){
        var cnt = line.substring(2,i-1);
      }else{
        var cnt = line.substring(2,i);
      }
      return [s,line.slice(i),'uri',cnt];
    }
    ///``...``
    if(line.charCodeAt(0)==96 && line.charCodeAt(1)==96){
      var i=2;
      var n=1;
      while(i < line.length){
        if(n==0){
          break;
        }
        if(line.charCodeAt(i)==96 && line.charCodeAt(i+1)==96){
          i+=2;
          n=0;
        }else{
          ++i;
        }
      }
      var s = line.substring(0,i);
      if(n==0){
        var cnt = line.substring(2,i-2);
      }else{
        var cnt = line.substring(2,i);
      }
      return [s,line.slice(i),'math',cnt];
    }
    ///`...`
    if(line.charCodeAt(0)==96){
      var i=1;
      var n=1;
      while(i < line.length){
        if(n==0){
          break;
        }
        if(line.charCodeAt(i)==96){
          i+=1;
          n=0;
        }else{
          ++i;
        }
      }
      var s = line.substring(0,i);
      if(n==0){
        var cnt = line.substring(1,i-1);
      }else{
        var cnt = line.substring(1,i);
      }
      return [s,line.slice(i),'verb',cnt];
    }
    ///plain text with trailing blanks
    var v = re_plain.exec(line);
    if(v){
      return [v[1],v[2],'',v[1]];
    }
    ///get next char only
    var s = line.charAt(0);
    return [s,line.slice(1),'',s];
  }

  get_braced_text(s){
    /// for an input string that is '{blah...}', 
    /// return 'blah...', otherwise return the
    /// whole string
    if(s.startsWith('{')&&s.endsWith('}')){
      return s.slice(1,s.length-1);
    }
    return s;
  }

  matrixMaxJ (matrix) {
    ///
    /// Return the MaxJ of the matrix
    ///

    var maxj = 0;
    for (var row of matrix) {
      var maxj = row.length > maxj ? row.length : maxj;
    }
    return maxj;
  }

  calcTabbWidthByColumnWidth (text,maxj) {

    var text = text.map ( pp => {
      pp = pp.map(x => x.split('\n'));
      pp = pp.map(x => x.map( y => y.length ));
      pp = pp.map(x => x.reduce( (a,c) => (a>c)?(a):(c) ), 0);
      return pp;
    });
    var ww = this.expandArray([],maxj,0);
    var ww = ww.map( (x,i) => {
        var n = 0;
        for (var row of text) {
          n = (n > row[i]) ? n : row[i];
        }
        return n;
    });
    var n = ww.reduce( (a,c) => a + c, 0 );
    var ww = ww.map( x => x/n );
    return ww;
  }

  toWW (maxj) {

    var w = 1;
    var ww = this.expandArray([],maxj,w);
    return ww;
  }

  calcTabbWidthByNumCharacters (rows,maxj) {

    var w = 1;
    var ww = this.expandArray([],maxj,w);

    for (var k=0; k < rows.length; ++k) {
      var pp = rows[k];

      var pp = pp.map(x => x.split('\n'));
      var nn = pp.map(x => x.length);
      var maxn = nn.reduce((acc,cur) => Math.max(acc,cur));
      for (var i=0; i < maxn; ++i) {
        var qq = pp.map(x => x[i]);
        var ll = qq.map(x => (x)?x.length:0);
        var ww = ww.map((w,n) => Math.max(w,ll[n]));
      }
    }
    return ww;
  }

  expandArray (row,maxj,data) {
    ///
    /// Expand an array so that it has at least this number of
    /// elements.
    ///

    while (row.length < maxj) {
      row.push(data);
    }
    return row;
  }

  toSubfigNum (j) {
    ///
    /// Given an integer, return the subfig number: 0 -> a, 1 -> b
    ///

    return ar_subfignums[j];
  }

  toPartNum (j) {
    ///
    /// Given an integer, return the subfig number: 0 -> a, 1 -> b
    ///

    return ar_partnums[j];
  }

  toEllipsedText (text,m) {
    ///
    /// Return part of the text trimmed at 5 characters, and if it is longer than 5 characters it will be appended ...
    ///

    if (text.length > m) {
      return text.slice(0,m) + '...';
    }
    return text;
  }

  chomp (text) {
    ///
    /// Remove the last character of a string.
    ///

    text = text || '';
    text = ''+text;
    return text.slice(0,text.length-1);
  }

  champ (text) {
    ///
    /// Remove the first and last character of a string.
    ///

    text = text || '';
    text = ''+text;
    return text.slice(1,text.length-1);
  }

  toArray (text) {

    ///
    /// Turn a text into a list separated by one or more spaces
    ///

    text = text || '';
    text = ''+text;
    var pp = text.split(' ');
    pp = pp.filter(x => (x.length)?true:false);
    return pp;
  }

  toIntArray (text) {

    var pp = this.toArray(text);
    pp = pp.map(x => parseInt(x));
    pp = pp.filter(x => Number.isFinite(x));
    return pp;
  }

  toInt (text,def_v) {

    var v = parseInt(text);
    if (Number.isFinite(v)){
      return v;
    }
    return def_v;
  }

  fromStyle (line) {
    ///
    /// convert from a string that is 'width:1cm;height:2cm' to an object that has width and height as its attributes and 1cm and 2cm set as the values
    ///

    return line.split(';').map(x => x.split(':'))
        .reduce((acc,curr) => {
            if (curr.length == 2) {
              var key = curr[0].trim();
              var val = curr[1].trim();
              if (key) {
                acc[key] = val;
              }
            } else if (curr.length == 1) {
              var key = curr[0].trim();
              var val = 1;
              if (key) {
                acc[key] = val;
              }
            }
            return acc;
        }, {});
  }

  toStyle (line) {

    /// converting a line such as 'n' to an object that is {n:1}

    if (/^\w+$/.test(line)) {
      var o = {};
      o[line] = true;
      return o;
    }

    /// champ the first and the last character
    /// [width:1in; height: 2in]

    if (/^\[.*\]$/.test(line)) {
      line = this.champ(line);
    }

    var pp = line.split(';');
    var o = {};
    for (var s of pp) {
      var kk = s.split(':');
      var key = '';
      var val = '';
      if (kk.length == 1) {
        var key = kk[0].trim();
        var val = '1'; /// this should always be a text string
                       /// as user might type 'columns' and then
                       /// this 'columns' field will have a value
                       /// that is '1'.
      } else if (kk.length == 2) {
        var key = kk[0].trim();
        var val = kk[1].trim();
      }
      if (key) {
        o[key] = val;
      }
    }
    return o;
  }

  assertConfigEntry (val,entry) {

    /// given a value such as 12.5, ensure that it is valid
    /// by the definition of the entry, and return the corrected
    /// one if the one given is out-of-range.
    switch (entry['type']) {
      case 'boolean': {
        return this.getBool(val);
        break;
      }
      case 'integer': {
        try {
          val = parseInt(val);
        } catch(e) {
          val = 0;
        }
        if (isNaN(val)) {
          val = 0;
        }
        if (entry.hasOwnProperty('minimum')) {
          var the_minimum = parseInt(entry['minimum']);
          if (val < the_minimum) {
            val = the_minimum;
          }
          var the_maximum = parseInt(entry['maximum']);
          if (val > the_maximum) {
            val = the_maximum;
          }
        }
        return val;
        break;
      }
      case 'number': {
        try {
          val = parseFloat(val);
        } catch(e) {
          val = 0;
        }
        if (isNaN(val)) {
          val = 0;
        }
        if (entry.hasOwnProperty('minimum')) {
          var the_minimum = parseFloat(entry['minimum']);
          if (val < the_minimum) {
            val = the_minimum;
          }
          var the_maximum = parseFloat(entry['maximum']);
          if (val > the_maximum) {
            val = the_maximum;
          }
        }
        return val;
        break;
      }
      case 'string': {
        if (entry.hasOwnProperty('enum')) {
          var the_enum = entry['enum'];
          if (the_enum.indexOf(val) < 0) {
            val = the_enum[0];
          }
        }
        return val;
        break;
      }
      case 'list': {
        return this.toArray(val);
        break;
      }
      default: {
        return val;
        break;
      }
    }
  }

  getBool (val) {

    ///
    /// given a string, return a boolean value
    ///
    /// getBool("1"); //true
    /// getBool("12"); //true
    /// getBool("12.5"); //true
    /// getBool("1005"); //true
    /// getBool("0"); //false
    /// getBool("0.0"); //false
    /// getBool(" "); //false
    /// getBool(""); //false
    /// getBool(undefined); //false
    /// getBool(null); //false
    /// getBool('blah'); //false
    /// getBool('yes'); //true
    /// getBool('on'); //true
    /// getBool('YES'); //true
    /// getBool('ON'); //true
    /// getBool("true"); //true
    /// getBool("TRUE"); //true
    /// getBool("false"); //false
    /// getBool("FALSE"); //false
    ///

    if (!val) return false;
    if (typeof val === 'string') {
      val = val.trim();
      if (!val.length) { return false; }
      val = val.toLowerCase();
      if (val === 'true' || val === 'yes' || val === 'on') {
        return true;
      }
      val = +val;
      if (isNaN(val)) return false;
      return (val !== 0);
    }
    if (typeof val === 'boolean') {
      return val;
    }
    if (typeof val === 'number') {
      return !(val == 0);
    }
    return true;
  }

  replaceAllBlanks (str, c) {
    return str.replace(/\s/g,c);
  }

  replaceLeadingBlanks (str, c) {
    var newstr = '';
    var m = /^(\s*)(.*)$/.exec(str);
    if (m) {
      if (m[1].length > 0) {
        for (var j=0; j < m[1].length; ++j) {
          newstr += c;
        }
        newstr += m[2];
        return newstr;
      }
    }
    return str;
  }

  isInsideSection (w, v) {

    ///
    /// given two sections, w and v, returns true
    /// if w is considered part of v.
    ///
    /// 1.1, 1 => true
    /// 1, 1.1 => false

    var vv = v.split('.');
    var ww = w.split('.');

    if (ww.length < vv.length) {
      return false;
    }
    for (var j=0; j < vv.length; ++j) {
      if (ww[j] !== vv[j]) {
        return false;
      }
    }
    return true;
  }

  isSectionShowing (dept, sections) {
    for (var section of sections) {
      if (this.isInsideSection(dept,section)) {
        return true;
      }
    }
    return false;
  }

  findSpaceBeforeWordAt (s, longn, shortn) {
    var j = longn;
    var c = s[j];
    var re_ws = /\s/;
    if (re_ws.test(c)) {
      return j;
    }
    while (j > shortn && !re_ws.test(c)) {
      --j;
      c = s[j];
    }
    if (j == shortn) {
      j = longn;/// if cannot find a space, use the longn
    }
    return j;
  }

  wrapSample (para, sampwrapn) {
    var re_leadn = /^(\s*)/;
    var o = [];
    var l = [];
    for (var n = 0; n < para.length; ++n) {
      var s = para[n];
      var lineno = n+1;
      lineno = ''+lineno;/// convert to string
      var leadn = 0;
      var v = re_leadn.exec(s);
      if (v) {
        leadn = v[1].length;
      }
      var maxn = sampwrapn - leadn;
      if (maxn < 1) {
        maxn = 1;
      }
      var longn = maxn + leadn;
      var shortn = 1 + leadn;
      if (sampwrapn == 0 || s.length <= longn) {
        o.push(s);
        l.push(lineno);
        continue;
      }
      while (s.length > longn) {
        var s1 = s;
        var s2 = '';
        ///var k = this.findSpaceBeforeWordAt(s, longn, shortn);
        var k = longn;
        if (k < shortn) {
          k = shortn;
        }
        var s1 = s.slice(0,k);
        var s2 = s.slice(k);
        o.push(`${s1}\\`);
        l.push(lineno);
        lineno = '';/// clear out so that for subsequent cont lines they are blank
        /// add in the leadn of blank spaces
        s = '';
        s += ' '.repeat(leadn);
        s += this.unicode_right_arrow;
        s += s2;
        longn = 1 + maxn + leadn;///increment by 1 because of the arrow
        shortn = 2 + leadn;///increment by 1 because of the arrow
      }
      o.push(s);
      l.push(lineno);
    }
    return o;
  }

  toAdjustedColumns (maxj,adjust) {

    /// For an adjust that is "2 3" and x_count is "3".
    /// it returns "2 3 3"

    var aa = this.toArray(adjust);
    var aa = aa.map( x => parseFloat(x) );
    var aa = aa.filter( x => Number.isFinite(x) );
    var aa = aa.filter( x => (x!=0) );
    if (aa.length>0) {
      var aa = this.expandArray(aa,maxj,aa[aa.length-1]);
    } else {
      var aa = this.expandArray([],maxj,1);
    }
    return aa;
  }

  toReversedArray (para) {
    var o = [];
    for (var s of para) {
      o.unshift(s);
    }
    return o;
  }

  getParaMaxWidth (para) {
    var n = 0;
    for (var s of para) {
      n = (s.length > n) ? s.length : n;
    }
    return n;
  }

  rubify (src) {

    ///
    /// perform replacements given a list of substrings and target
    /// strings. Following example is a source string and the
    /// str1 located is "greeting"
    ///
    /// "Hello world greeting and goodbye"
    ///        j     i0
    ///              k0
    ///                      j
    ///                          i0
    ///                          k0

    var j = 0;
    var k = 0;
    var i = 0;
    var i0 = 0;
    var found = 0;
    var found_str1 = '';
    var found_str2 = '';
    var found_desc = '';
    var out = '';
    src = src || '';
    while (j < src.length) {
      i0 = src.length;
      found = 0;
      for (var rubyitem of this.xparser.rmap) {
        var [str1,str2,desc] = rubyitem;
        var i = src.indexOf(str1,j);
        if (i < 0) {
          continue
        }
        if (i < i0) { /// first found or a new found that is closer
          i0 = i;
          found = 1;
          found_str1 = str1;
          found_str2 = str2;
          found_desc = desc;
        } else if (i === i0 && str1.length > found_str1.length) { /// found two at the same location, prefer the longest
          i0 = i;
          found = 1;
          found_str1 = str1;
          found_str2 = str2;
          found_desc = desc;
        }
      }
      if (found) {
        /// found!
        var str1 = found_str1;
        var str2 = found_str2;
        var desc = found_desc;
        out += src.slice(j,i0);
        out += this.to_ruby_item(str1,str2,desc);
        j = i0 + str1.length;
      } else {
        /// we are done, none of the substrings exists!
        out += src.slice(j);
        j = src.length;
      }
    }
    return out;
  }

  buildRubyMapFromJson (json) {
    /// build an array
    /// each array-item is a two-item-array: [rb,rt]
    var o = [];
    for (var item of json.vsuru) {
      let [base,top] = item;
      o.push(item);
      o.push([base.slice(0,base.length-2),top.slice(0,top.length-2)]);
    }
    for (var item of json.v1) {
      let [base,top] = item;
      o.push(item);
      o.push([base.slice(0,base.length-1),top.slice(0,top.length-1)]);
    }
    for (var item of json.v5m) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
            '\u307e', //ま
            '\u307f', //み
            '\u3081', //め
            '\u3082\u3046', //もう
            '\u3093\u3067', //んで
            '\u3093\u3060'  //んだ
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5b) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
            '\u3070', //ば
            '\u3073', //び
            '\u3079', //べ
            '\u307c\u3046', //ぼう
            '\u3093\u3067', //んで
            '\u3093\u3060'  //んだ
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5n) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u306a', //な
          '\u306b', //に
          '\u306d', //ね
          '\u306e\u3046', //のう
          '\u3093\u3067', //んで
          '\u3093\u3060'   //んだ
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5s) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u3055', //さ
          '\u3057', //し
          '\u305b', //せ
          '\u305d\u3046', //そう
          '\u3057\u3066', //して
          '\u3057\u305f'  //した
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5g) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u304c', //が
          '\u304e', //ぎ
          '\u3052', //げ
          '\u3054\u3046', //ごう
          '\u3044\u3067', //いで
          '\u3044\u3060'  //いだ
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5k) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u304b', //か
          '\u304d', //き
          '\u3051', //け
          '\u3053\u3046', //こう
          '\u3044\u3066', //いて
          '\u3044\u305f'  //いた
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5r) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u3089', //ら
          '\u308a', //り
          '\u308c', //れ
          '\u308d\u3046', //ろう
          '\u3063\u3066', //って
          '\u3063\u305f'  //った
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5t) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u305f', //た
          '\u3061', //ち
          '\u3066', //て
          '\u3068\u3046', //とう
          '\u3063\u3066', //って
          '\u3063\u305f'  //った
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5u) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u308f', //わ
          '\u3044', //い
          '\u3048', //え
          '\u304a\u3046', //おう
          '\u3063\u3066', //って
          '\u3063\u305f'  //った
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.adji) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u304b\u3063\u305f', //かった
          '\u304f', //く
          '\u3055', //さ
          '\u307f', //み
          '\u305d\u3046'  //そう
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.exp) {
      o.push(item);
    }
    return o;
  }

  countEmptyLines (para) {

    var n = 0;
    for (let line of para) {
      if (line.length == 0) {
        n++;
      }
    }
    return n;

  }

  removeLeadingEndingVerticalBar (para) {

    var o = [];
    for (let line of para) {
      if (line[0] === '|') {
        line = line.slice(1);
      }
      if (line[line.length-1] === '|') {
        line = line.slice(0,line.length-1);
      }
      o.push(line);
    }
    return o;
  }

  wwToOne(ww) {
    var sum = ww.reduce( (acc,num) => acc += parseFloat(num), 0 );
    ww = ww.map( x => x/sum );
    ww = ww.map( x => x.toFixed(6) );
    return ww;
  }

  wwToHundred(ww) {
    var sum = ww.reduce( (acc,num) => acc += parseFloat(num), 0 );
    ww = ww.map( x => x/sum );
    ww = ww.map( x => x*100 );
    ww = ww.map( x => Math.round(x) );
    return ww;
  }

  updateFencecmd(sig,config){
    var fencecmd = {};
    /// now grab all fenceopt
    for (var key in config) {
      if (key === sig) {
        for (var prop in config[key]) {
          if(fencecmd[prop]){
            ///good ignore
          }else{
            var val = config[key][prop];
            fencecmd[prop]=val;
          }
        }
      }
    }
    return fencecmd;
  }

  getClusterLines(lines) {
    var o = [];
    ///skip empty lines
    while(lines.length > 0){
      var line = lines[0];
      if (line.length === 0) {
        lines.shift();
      } else {
        break;
      }
    }
    /// get as many solid lines
    while(lines.length > 0){
      var line = lines[0];
      if (line.length > 0) {
        o.push(line);
        lines.shift();
      } else {
        break;
      }
    }
    return [o,lines];
  }

  splitShortRowVB(s) {
    if (!s || typeof s !== 'string') {
      return [];
    }
    if (s.charAt(0) === '|') {
      s = s.slice(1);
    }
    var ss = s.split('|');
    return ss;
  }

  isLongPara(para) {

    if(para.length>0 && this.re_long.test(para[0])){
      return true;
    }
    return false;
  }


  col_letter_to_num(a){
    var start = 'a'.charCodeAt(0);
    var code = a.charCodeAt(0);
    var n = code-start;
    if(!Number.isFinite(n)){
      n = 0;
    }
    else if(n<0){ 
      n = 0;
    } 
    else if(n>25){
      n = 25;
    } 
    return n;
  }
  row_letter_to_num(a){
    var n = parseInt(a);
    if(!Number.isFinite(n)){
      n = 0;
    }
    else if(n < 0) {
      n = 0;
    }
    else if (n>200){
      n = 200;
    }
    return n;
  }


  isQuotPara(para){

    if(para.length>0 && this.re_quot.test(para[0])){
      return true;
    }
    return false;

  }

  parseQuotPara(para){

    /// > A connected graph has an Euler cycle
    ///   if and only if every vertex has
    ///   even degree.
    ///

    /// form is ''
    var data = para.map(x=>x);
    var s = data[0];
    var v = this.re_quot.exec(s);
    if(v){
      data[0] = v[2];
    }
    return (this.joinPara(data));
  }

  isTightTable(para) {

    if(para.length>0 && this.re_tightable.test(para[0])){
      return true;
    }
    return false;

  }

  parseTightTable(para) {

    var re = /^\-+$/;
    var o = [];
    var maxj = 0;
    var ww = [];
    var ss0 = this.splitShortRowVB(para[0]);
    var ss1 = this.splitShortRowVB(para[1]);

    para.shift();
    para.shift();
    o.push(ss0);
    maxj = ss0.length;
    for( var s of para) {
      var ss = this.splitShortRowVB(s);
      while(ss.length > maxj) {
        ss.pop();
      }
      while(ss.length < maxj) {
        ss.push('');
      }
      o.push(ss);
    }
    ///for tabular ww does not matter
    return [o,maxj,ww];
  }

  isListPara(para) {
    var re = /^\-\s+(.*)$/;
    return re.test(para[0]);
  }

  parseListPara(para) {
    var re = /^\-\s+(.*)$/;
    var o = [];
    var s0 = '';
    o.push(s0);
    for( var s of para) {
      var v = re.exec(s);
      if( v ) {
        s0 = v[1];
        o.push(s0);
      } else {
        s0 = this.joinLine(s0,s);
        o.pop();
        o.push(s0);
      }
    }
    o = o.filter( x => (x.length>0)?true:false );
    return o;
  }

  to_paratype(v) {
    v = parseInt(v);
    if (Number.isFinite(v)){
      return v;
    }
    return 0;
  }

  to_indent(v) {
    return v||'';
  }

  entity (str) {
    var ent = entjson.entities[str];
    if (ent) {
      return String.fromCharCode(ent.code);
    }
    if (str.startsWith('#x')) {
      var mystr = '0x'+str.slice(2);
      return String.fromCharCode(mystr);
    }
    if (str.startsWith('#')) {
      var mystr = str.slice(1);
      return String.fromCharCode(mystr);
    }
    return str;
  }

  isHeaderEmpty(header) {
    header = header.filter(x => (x.length > 0) ? true : false);
    if (header.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  async readFileAsync (filename) {

    /// Returns a Promise that resolves to a string of
    /// the entire file content being read

    return new Promise((resolve, reject)=>{
      fs.readFile(filename, "utf8", function(err, data) {
        if (err) {
          reject(err.toString());
        } else {
          resolve(data.toString());
        }
      });
    });
  }

  async writeFileAsync (filename, data) {

    /// Returns a Promise that resolves to a string of
    /// the entire file content being read

    return new Promise((resolve, reject)=>{
      fs.writeFile(filename, data, 'utf8', function(err) {
        if (err) {
          reject(err.toString());
        } else {
          resolve(filename);
        }
      });
    });

  }

  async readFromFileAsync(fname,dirname) {
    if(dirname){
      var fullname = path.join(dirname,fname);
    } else {
      var fullname = fname;
    }

    ///ensure it is a MD file
    fullname = `${fullname.slice(0,fullname.length-path.extname(fullname).length)}.md`;
    console.log('reading',fullname);

    var out = await this.readFileAsync(fullname);
    var lines = out.split('\n');
    this.fname = fname;
    this.readFromLines(lines);
  }

  toConfigLines(){
    const obj = this.config[this.name];
    var mylines = [];
    if (typeof obj === 'object') {
      for(var key2 in obj) {
        if (obj.hasOwnProperty(key2)) {
          mylines.push(`%!${this.name}.${key2} = ${obj[key2]}`);
        }
      }
    }
    return mylines;
  }

  tofName(){
    return path.basename(this.fname);
  }


  to_samp1_body(para){
    var re = /^\s+/;
    var o = [];
    for(var i=0; i < para.length; ++i){
      var s = para[i];
      if(i==0){
        o.push(s);
        continue;
      }
      if(re.test(s)){
        var s0 = o.pop();
        s0 = this.joinLine(s0,s);
        o.push(s0);
        continue;
      }
      o.push(s);
    }
    return o;
  }

  isFloat(val){
    var re = /^[0-9\.]+$/;
    return re.test(val);
  }

  measureText(str, fontSize = 12) {
    const avg = 0.5279276315789471
    return str
      .split('')
      .map(c => c.charCodeAt(0) < char_widths.length ? char_widths[c.charCodeAt(0)] : avg)
      .reduce((cur, acc) => acc + cur, 0) * fontSize;
  }

  to_ref (str) {
    for (var j=0; j < this.xblocks.length; ++j) {
      var block = this.xblocks[j];
      var {id,sig,label,floatname,saveas,idnum,more,saveas,id} = block;
      label = label||'';
      if(sig=='MATH'){
        if( str.localeCompare(label)===0) {
          //return `${floatname}.\\ref{${str}}`;
          return this.do_ref(sig,str,floatname,idnum,saveas,id);
          break;
        }
        if(more&&more.length){
          for(let k=0; k < more.length; k++){
            let x = more[k];
            if(str.localeCompare(x.label)===0){
              //return `${floatname}.\\ref{${str}}`;
              return this.do_ref(sig,str,floatname,x.idnum,saveas,id);
              break;
            }
          }
        }
      }else if(sig=='HDGS'){
        if( str.localeCompare(label)===0) {
          var secsign = String.fromCharCode(0xA7);
          //return `${secsign}{${idnum}}`;
          return this.do_ref(sig,str,floatname,idnum,saveas,id);
          break;
        }
      }else{
        if( str.localeCompare(label)===0) {
          //return `${floatname}.{${idnum}}`;
          return this.do_ref(sig,str,floatname,idnum,saveas,id);
          break;
        }
      }
    }
    //str = this.escape(str);
    //return `{\\ttfamily\\sout{${str}}}`;
    return this.do_ref('',str,'','','','');
  }

  toConfigLines() {
    const obj = this.xconfig;
    var mylines = [];
    if (typeof obj === 'object') {
      for (var key2 in obj) {
        if (obj.hasOwnProperty(key2)) {
          mylines.push(`%!${this.name}.${key2} = ${obj[key2]}`);
        }
      }
    }
    return mylines;
  }

  replaceSubstrings(src, map) {

    ///
    /// perform replacements given a list of substrings and target
    /// strings. Following example is a source string and the
    /// str1 located is "greeting"
    ///
    /// "Hello world greeting and goodbye"
    ///        j     i0
    ///              k0
    ///                      j
    ///                          i0
    ///                          k0

    var j = 0;
    var k = 0;
    var i = 0;
    var i0 = 0;
    var k0 = 0;
    var out = '';
    src = src || '';
    while (j < src.length) {
      i0 = src.length;
      k0 = map.length;
      for (k = 0; k < map.length; k += 2) {
        var str1 = map[k];
        var str2 = map[k + 1];
        var i = src.indexOf(str1, j);
        if (i < 0) {
          continue
        }
        /// save the i that is the least
        if (i < i0) {
          i0 = i;
          k0 = k;
        }
      }
      if (k0 < map.length) {
        /// found!
        var str1 = map[k0];
        var str2 = map[k0 + 1];
        out += src.slice(j, i0);
        out += str2;
        j = i0 + str1.length;
      } else {
        /// we are done, none of the substrings exists!
        out += src.slice(j);
        j = src.length;
      }
    }
    return out;
  }

  is_indented_line(line){
    const re = /^\s/;
    return (line.lenght > 0 && re.test(line));
  }


  fix(v) {
    if (typeof v == 'number') {
    } else {
      v = parseFloat(v);
    }
    return parseFloat(v.toFixed(2));
  }

  fix0(v) {
    if (typeof v == 'number') {
    } else {
      v = parseFloat(v);
    }
    return parseFloat(v.toFixed(0));
  }

  fix2(v) {
    if (typeof v == 'number') {
    } else {
      v = parseFloat(v);
    }
    return parseFloat(v.toFixed(2));
  }

  ///
  /// xyplot   
  ///

  to_mp_xyplot(cnt){
    // *** \xyplot{20;10;0.2,0.2,0.3,0.3,0.4,0.4}
    //
    //  \begin{mplibcode}
    //  beginfig(1)
    //  linecap := butt;
    //  linejoin := mitered;
    //  w := 20mm;
    //  h := 10mm;
    //  fill fullcircle scaled(2) shifted(0.2,0.2) scaled(u) ;`);
    //  fill fullcircle scaled(2) shifted(0.3,0.3) scaled(u) ;`);
    //  fill fullcircle scaled(2) shifted(0.4,0.4) scaled(u) ;`);
    //  endfig
    //  \end{mplibcode}
    //
    var o = [];
    var p_circledot=1;
    var p_interline=2;
    var args = cnt.split(';');
    var args = args.map(x => x.trim());
    var w = args[0];
    var h = args[1];
    var data = args[2];
    var p = args[3];
    if(w && h && data){
      var data = data.split(',');
      var data = data.map(x => x.trim());
      var data = data.map(x => parseFloat(x));
      var data = data.filter(x => Number.isFinite(x));
      if(p&p_interline){
        var ldata = data.slice(0,4);
        data = data.slice(4);
      }else{
        var ldata=[];
      }
      o.push(`linecap := butt;`);
      o.push(`linejoin := mitered;`);
      o.push(`w := ${w}mm;`);
      o.push(`h := ${h}mm;`);
      o.push(`draw (0,0)--(1,1) xscaled(w) yscaled(h) withcolor white;`);
      for(var j=0; j < data.length; j+=2){
        var x=data[j];
        var y=data[j+1];
        var x=this.fix(x);
        var y=this.fix(y);
        if(p&p_circledot){
          o.push(`draw fullcircle scaled(2) shifted(${x}*w,${y}*h) ;`);
        }else{
          o.push(`fill fullcircle scaled(2) shifted(${x}*w,${y}*h) ;`);
        }
      }
      ///draw interline
      if(ldata.length==4){
        var x1=ldata[0];
        var y1=ldata[1];
        var x2=ldata[2];
        var y2=ldata[3];
        o.push(`draw ((${x1},${y1})--(${x2},${y2})) xscaled(w) yscaled(h) ;`);
      }
    }
    return o.join('\n');
  }
  
  to_svg_xyplot (cnt) {
    // *** \xyplot{20;10;0.2,0.2,0.3,0.3,0.4,0.4}
    //
    var p_circledot=1;
    var p_interline=2;
    var o = [];
    var args = cnt.split(';');
    var args = args.map(x => x.trim());
    var w = args[0];
    var h = args[1];
    var data = args[2];
    var p = args[3];
    if(w && h && data){
      var u = 3.78;
      var data = data.split(',');
      var data = data.map(x => x.trim());
      var data = data.map(x => parseFloat(x));
      var data = data.filter(x => Number.isFinite(x));
      if(p&p_interline){
        var ldata = data.slice(0,4);
        data = data.slice(4);
      }else{
        var ldata=[];
      }
      for(var j=0; j < data.length; j+=2){
        var x=data[j];
        var y= 1 - data[j+1];
        if(p&p_circledot){
          o.push(`<circle cx='${this.fix(x*u*w)}' cy='${this.fix(y*u*h)}' r='1pt' stroke='inherit' fill='none' />`);
        }else{
          o.push(`<circle cx='${this.fix(x*u*w)}' cy='${this.fix(y*u*h)}' r='1pt' stroke='none' fill='inherit' />`);
        }
      }
      ///draw interline
      if(ldata.length==4){
        var x1=ldata[0];
        var y1=1 - ldata[1];
        var x2=ldata[2];
        var y2=1 - ldata[3];
        o.push(`<line x1='${this.fix(x1*u*w)}' y1='${this.fix(y1*u*h)}' x2='${this.fix(x2*u*w)}' y2='${this.fix(y2*u*h)}' stroke='inherit' />`);
      }
    }
    var s = o.join('\n');
    return {s,w,h};
  }

  ///
  /// vbarchart
  ///

  to_mp_vbarchart (cnt) {
    // *** \vbarchart{20;10;0.2,0.8,0.6,0.4,1.0}
    //
    //  \begin{mplibcode}
    //  beginfig(1)
    //  linecap := butt;
    //  linejoin := mitered;
    //  w := 20mm;
    //  h := 10mm;
    //  draw ((0,0)--(0.2,0)--(0.2,0.2)--(0,0.2)--cycle)     xscaled(w) yscaled(h) ;
    //  draw ((0.2,0)--(0.4,0)--(0.4,0.8)--(0.2,0.8)--cycle) xscaled(w) yscaled(h) ;
    //  draw ((0.4,0)--(0.6,0)--(0.6,0.6)--(0.4,0.6)--cycle) xscaled(w) yscaled(h) ;
    //  draw ((0.6,0)--(0.8,0)--(0.8,0.4)--(0.6,0.4)--cycle) xscaled(w) yscaled(h) ;
    //  draw ((0.8,0)--(1,0)--(1,1.0)--(0.8,1.0)--cycle)     xscaled(w) yscaled(h) ;
    //  endfig
    //  \end{mplibcode}
    //
    var o = [];
    var args = cnt.split(';');
    var args = args.map(x => x.trim());
    var w = args[0];
    var h = args[1];
    var data = args[2];
    if(w && h && data){
      var data = data.split(',');
      var data = data.map(x => x.trim());
      o.push(`linecap := butt;`);
      o.push(`linejoin := mitered;`);
      o.push(`w := ${w}mm;`);
      o.push(`h := ${h}mm;`);
      o.push(`draw (0,0)--(1,1) xscaled(w) yscaled(h) withcolor white;`);
      for(var j=0; j < data.length; j++){
        var num=data[j];
        var gap=1/data.length;
        var x1=j*gap;
        var x2=(j+1)*gap;
        var y1=0;
        var y2=data[j];
        var x1=this.fix(x1);
        var x2=this.fix(x2);
        var y1=this.fix(y1);
        var y2=this.fix(y2);
        o.push(`draw ((${x1},${y1})--(${x2},${y1})--(${x2},${y2})--(${x1},${y2})--cycle) xscaled(w) yscaled(h) ;`);
      }
    }
    var s = o.join('\n');
    return s;
  }

  to_svg_vbarchart (cnt) {
    //  \vbarchart{20;10;0.2,0.8,0.6,0.4,1.0}. 
    //
    var o = [];
    var args = cnt.split(';');
    var args = args.map(x => x.trim());
    var w = args[0];
    var h = args[1];
    var data = args[2];
    if(w && h && data){
      var u = 3.78;
      var data = data.split(',');
      var data = data.map(x => x.trim());
      for(var j=0; j < data.length; j++){
        var num=data[j];
        var gap=1/data.length;
        var x1=j*gap;
        var y1=1-num;
        o.push(`<rect x='${this.fix(x1*u*w)}' y='${this.fix(y1*u*h)}' width='${this.fix(gap*u*w)}' height='${this.fix(num*u*h-1)}' stroke='inherit' fill='none' />`);
      }
    }
    var s = o.join('\n');
    return {s,w,h};
  }

}

module.exports = { NitrilePreviewTranslator }
