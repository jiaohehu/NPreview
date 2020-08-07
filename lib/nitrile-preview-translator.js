'use babel';

const {NitrilePreviewBase} = require('./nitrile-preview-base.js');
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
//const re_unmask = /`([^`]+)`|``([^`]+)``|```([^`]+)```|(?<!\\)\\(\w+)\{([^\{\}]+)\}|(?<!\w)\\\((.*?)\\\)|(?<!\w)\\\[(.*?)\\\]|(?<!\\)\\(\w+)(?!=\w)|(?<!\\)(\\\\)/g;
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
const ar_i_letters = ['', 'i','ii','iii','iv','v','vi','vii','viii','ix','x',
                      'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx',
                      'xxi', 'xxii', 'xxiii', 'xxiv', 'xxv', 'xxvi'];
const ar_I_letters = ['', 'I','II','III','IV','V','VI','VII','VIII','IX','X',
                      'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
                      'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI'];
const ar_a_letters = ['', 'a','b','c','d','e','f','g','h','i','j',
                          'k','l','m','n','o','p','q','r','s','t',
                          'u','v','w','x','y','z'];
const ar_A_letters = ['', 'A','B','C','D','E','F','G','H','I','J',
                          'K','L','M','N','O','P','Q','R','S','T',
                          'U','V','W','X','Y','Z'];
const ar_1_letters = ['', '1','2','3','4','5','6','7','8','9','10',
                          '11','12','13','14','15','16','17','18','19','20',
                          '21','22','23','24','25','26'];

//this.re_all_diacritics = /(?<!\\)\\(dot|ddot|bar|mathring|hat|check|grave|acute|breve|tilde)\{([A-Za-z])\}/g;

class NitrilePreviewTranslator extends NitrilePreviewBase {

  constructor(parser) {
    super();
    this.parser=parser;
    this.name='';
    this.config=new Map();
    this.usepackages = new Set();
    this.re_all_sups = /(?<!\w)([A-Za-z])\^([0-9ni])(?!\w)/g;
    this.re_all_subs = /(?<!\w)([A-Za-z])_([0-9aeoxhklmnpst])(?!\w)/g;
    this.re_all_symbols = /&([A-Za-z][A-Za-z0-9]*);/g;
    this.re_all_symbol_comments = /\[!([A-Za-z][A-Za-z0-9]*)!\]/g;
    this.re_all_diacritics = /(?<!\w)([A-Za-z])~(dot|ddot|bar|mathring|hat|check|grave|acute|breve|tilde)(?!\w)/g;
    this.re_all_mathvariants = /(?<!\w)([A-Za-z])~(mathbb|mathbf|mathit|mathcal)(?!\w)/g;
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
      for (var rubyitem of this.parser.block.rmap) {
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

  string_is_float(val){
    var re = /^[0-9\.]+$/;
    return re.test(val);
  }



  to_ref (str) {
    for (var j=0; j < this.parser.blocks.length; ++j) {
      var block = this.parser.blocks[j];
      var {id,sig,label,floatname,idnum,more,refid,id,chapters} = block;
      label = label||'';
      if(sig=='MATH'){
        if( str.localeCompare(label)===0) {
          //return `${floatname}.\\ref{${str}}`;
          return this.do_ref(sig,str,floatname,idnum,refid,id,chapters);
          break;
        }
        if(more&&more.length){
          for(let k=0; k < more.length; k++){
            let x = more[k];
            if(str.localeCompare(x.label)===0){
              //return `${floatname}.\\ref{${str}}`;
              return this.do_ref(sig,x.label,floatname,x.idnum,refid,id,chapters);
              break;
            }
          }
        }
      }else if(sig=='HDGS'){
        if( str.localeCompare(label)===0) {
          var secsign = String.fromCharCode(0xA7);
          //return `${secsign}{${idnum}}`;
          return this.do_ref(sig,str,floatname,idnum,refid,id,chapters);
          break;
        }
      }else{
        if( str.localeCompare(label)===0) {
          //return `${floatname}.{${idnum}}`;
          return this.do_ref(sig,str,floatname,idnum,refid,id,chapters);
          break;
        }
      }
    }
    //return `{\\ttfamily\\sout{${str}}}`;
    return this.do_ref('',str,'','','','',0);
  }

  to_config_lines() {
    var mylines = [];
    if(this.parser && this.parser.config){
      for(var v of this.parser.config){
        mylines.push(`%${v[0]} = ${v[1]}`);
      }
    }
    return mylines;
  }

  replace_sub_strings(src, map) {

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
        if(p&p_circledot){
          o.push(`draw fullcircle scaled(2) shifted(${this.fix(x)}*w,${this.fix(y)}*h) ;`);
        }else{
          o.push(`fill fullcircle scaled(2) shifted(${this.fix(x)}*w,${this.fix(y)}*h) ;`);
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

  to_svg_colorbox (cnt) {
    // *** \colorbox{20;10;pink}
    //
    var o = [];
    var args = cnt.split(';');
    var args = args.map(x => x.trim());
    var w = args[0];
    var h = args[1];
    var color = args[2];
    o.push(`<rect x='0' y='0' width='${this.fix(w)}mm' height='${this.fix(h)}mm' stroke='none' fill='${this.to_colors(color)}' />`);
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
        o.push(`draw ((${this.fix(x1)},${this.fix(y1)})--(${this.fix(x2)},${this.fix(y1)})--(${this.fix(x2)},${this.fix(y2)})--(${this.fix(x1)},${this.fix(y2)})--cycle) xscaled(w) yscaled(h) ;`);
      }
    }
    var s = o.join('\n');
    return s;
  }

  ///
  /// colorbox
  /// 

  to_mp_colorbox (cnt) {
    var o = [];
    var pp = cnt.split(';');
    pp = pp.map(x => x.trim());
    o.push(`fill unitsquare xscaled(${pp[0]}mm) yscaled(${pp[1]}mm) withcolor ${this.to_colors(pp[2])};`);
    return o.join('\n');
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

  to_i_letter(i){
    return ar_i_letters[i];
  }
  to_I_letter(i){
    return ar_I_letters[i];
  }
  to_a_letter(i){
    return ar_a_letters[i];
  }
  to_A_letter(i){
    return ar_A_letters[i];
  }
  to_1_letter(i){
    return ar_1_letters[i];
  }

  conf(key,def_val=''){
    if(this.parser && this.parser.config && this.parser.config.has(key)){
      return this.parser.config.get(key);
    }
    if(this.config.has(key)){
     return this.config.get(key);
    }
    return def_val;
  }

  translate_blocks(){
    if(this.parser){
      this.parser.translate_blocks(this);
    }
  }

  is_command(key){
    return this.tokenizer.is_command(key);
  }

  is_symbol(key){
    return this.tokenizer.is_symbol(key);
  }

  unmask(line) {
    /// unmask all inline markups within a text
    ///
    /// 1  {{emph-text}}
    /// 2  ``math-text``
    /// 3  `code-text`
    /// 4  ${string}
    ///

    var v;
    var line = line || '';
    var start_i = 0;
    var newtext = '';
    const re_unmask = /(`+)([^`]+)\1/g;

    while ((v = re_unmask.exec(line)) !== null) {
      var i = v.index;
      var txt = line.slice(start_i, i);
      var txt = this.untouch(txt);
      newtext += txt;
      
      if (v[1] !== undefined) {

        var key = v[1];
        var cnt = v[2];
        cnt = cnt.trim();
        if(key.length==1){
          cnt = this.polish(cnt);
          newtext += cnt;
        }else{
          cnt = this.polish_verb(cnt);
          newtext += this.to_style(cnt, 'verb');
        }
      } 
      start_i = re_unmask.lastIndex;
    }
    var txt = line.slice(start_i);
    var txt = this.untouch(txt);
    newtext += txt;
    return newtext;
  }

  untouch (line) {
    var v;
    var line = line || '';
    var start_i = 0;
    var newtext = '';
    const re_untouch = /(?<!\\)(\\[A-Za-z]+\{)|(?<!\\)(\\\()|(?<!\\)(\\\[)/g; //cannot be global because it is used recursively
    while ((v = re_untouch.exec(line)) !== null) {
      var i = v.index;
      var txt = line.slice(start_i,i);
      var txt = this.smooth(txt);
      newtext += txt;

      if (v[1] !== undefined) {

        //\em{...}
        //\uri{...}
        //\ruby{...}
        //\ref{...}
        //\img{...}
        //\vbarchart{...}
        //\xyplot{...}
        //\colorbox{...}

        var head_text = v[1];
        i += head_text.length;
        var key = head_text.slice(1,head_text.length-1);

        start_i = this.extract(line,i);
        var scan_text = line.slice(i,start_i);
        var cnt = scan_text.slice(0,scan_text.length-1);

        try {
          var cnt_text = this.exec_cmd(key,cnt);
          newtext += cnt_text;
        }catch (e){
          if(this.is_symbol(key)&&cnt.length==0){
            var cnt_text = '\\'+key;
            var cnt_text = this.smooth(cnt_text);
            //this will convert the symbol
            newtext += cnt_text;
          }else{
            var cnt_text = `${head_text}${scan_text}`;
            var cnt_text = this.polish(cnt_text);
            //this will have to be polish so that we can see all native codes
            newtext += cnt_text;
          }
        }

        re_untouch.lastIndex = start_i;
        continue;

      } else if (v[2] !== undefined) {

        /// \( ... \)
        i += 2;
        start_i = line.indexOf('\\)',i);
        if(start_i < 0){
          var scan_text = line.slice(i);
          var scan_text = this.to_inlinemath(scan_text);
          newtext += scan_text;
          start_i = line.length;
          re_untouch.lastIndex = start_i;
        }
        else {

          var scan_text = line.slice(i,start_i);
          var scan_text = this.to_inlinemath(scan_text);
          newtext += scan_text;
          start_i += 2;
          re_untouch.lastIndex = start_i;
        }
        continue;

      } else if (v[3] !== undefined) {

        /// \[ ... \]
        i += 2;
        start_i = line.indexOf('\\]',i);
        if(start_i < 0){
          var scan_text = line.slice(i);
          var scan_text = this.to_inlinemath(scan_text,1);
          newtext += scan_text;
          start_i = line.length;
          re_untouch.lastIndex = start_i;
        }
        else {

          var scan_text = line.slice(i,start_i);
          var scan_text = this.to_inlinemath(scan_text,1);
          newtext += scan_text;
          start_i += 2;
          re_untouch.lastIndex = start_i;
        }
        continue;

      } 
      else if(v[4] !== undefined) {

        /// \\Alpha, \\n, \\0, \\1
        
        var match_text = v[4];
        var match_text = match_text.slice(1);//get rid of the first backslash
        var match_text = this.polish_verb(match_text);
        newtext += match_text;
        start_i = re_untouch.lastIndex;
        continue;
      }
      start_i = re_untouch.lastIndex;
    }
    var txt = line.slice(start_i);
    var txt = this.smooth(txt);
    newtext += txt;
    return newtext;
  }

  exec_cmd(key,cnt){
    //note that 'cnt' 
    var newtext = '';
    if(key=='em'){
      newtext += this.to_style(this.untouch(cnt),'em');
    }
    else if(key=='ruby'){
      var v;
      if((v=re_ruby.exec(cnt))!==null){
        newtext += this.do_ruby(v[1],v[2]);
      }else{
        newtext += this.do_ruby(cnt,'');
      }
    }
    else if(key=='uri'){
      newtext += this.do_uri(cnt);
    }
    else if(key=='ref'){
      newtext += this.to_ref(cnt);
    }
    else if(key=='img'){
      newtext += this.do_img(cnt);
    }
    else if(key=='vbarchart'){
      newtext += this.do_vbarchart(cnt);
    }
    else if(key=='xyplot'){
      newtext += this.do_xyplot(cnt);
    }
    else if(key=='colorbox'){
      newtext += this.do_colorbox(cnt);
    }
    else{
      throw "error";
    }
    return newtext;
  }

  extract(line,i){
    let n = 1;
    while(n > 0 && i < line.length){
      var a = line.charAt(i);
      if(a == '\\'){
        i+=2;
        continue;
      }
      else if(a == '{'){
        n++;
        i++;
        continue;
      }
      else if(a == '}'){
        n--;
        i++;
        continue;
      }else{
        i++;
      }
    }
    return i;
  }
}

module.exports = { NitrilePreviewTranslator }
