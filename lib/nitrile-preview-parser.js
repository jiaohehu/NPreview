'use babel';

const fs = require('fs');
const path = require('path');
const json_rubyitems = require('./nitrile-preview-rubyitems.json');
const json_math = require('./nitrile-preview-math.json');
const entjson = require('./nitrile-preview-entity.json');
const { NitrilePreviewAutonum } = require('./nitrile-preview-autonum');
const N_sampspaces = 1;

class NitrilePreviewParser {

  constructor() {
    this.contentBlockCount = 0; /// the accumulating count of content blocks for this dept
    this.subfignums = ['a','b','c','d','e','f','g','h','i','j','k','l','m',
       'n','o','p','q','r','s','t','u','v','w','x','y','z'];
    this.partnums = ['I','II','III','IV','V','VI','VII','IIX','IX','X'];
    this.re_sampfence = /^\s*\~{3,}$/;
    this.re_fence = /^\s*(\`{3,})\s*(\w+)$/;
    this.re_unmask = /(?<!\S)\{\{(.*?)\}\}|(?<!\S)``(.*?)``|(?<!\S)`(.*?)`|\$\{(.*?)\}/g;
    this.re_texmath = /\$\$(.*?)\$\$|\$(.*?)\$/g;
    this.re_texcomment  = /^%(.*)$/;
    this.re_nitrilemode = /^\^(\w+)=(.*)$/u;
    this.re_nitrileitem = /^\^(\S+?)\u{30fb}(\S+)/u;
    this.re_nitrileconf = /^!(\w+)\.(\w+)\s*=\s*(.*)$/u;
    this.re_blank = /^(\s+)(.*)$/;
    this.re_plain = /^(\S+\s*)(.*)$/;
    this.re_caption_para = /^(\w+)\:\:\s*(.*)$/;
    this.re_label = /(.*)\s*\(#(\S+)\)$/;
    this.re_four_spaces = /^\s{4}/;
    this.re_hdgs = /^(#+)\s+(.*)$/u;
    this.re_part = /^(#)\s+(.*)\s+\1$/u;
    this.re_leadspaces = /^(\s*)(.*)$/;
    this.re_image = /^(\[.*?\]|)\((.*?)\)\s*(.*)$/;
    this.re_prim = /^\[\s+(.+?)\s+\]\s*(.*)$/;
    this.re_seco = /^\[\[\s+(.*?)\s+\]\]\s*(.*)$/;
    this.re_thrd = /^\[\[\[\s+(.*?)\s+\]\]\]\s*(.*)$/;
    this.re_hruler      = /^\*\*\*$/;
    this.re_math        = /^(\$)\s+(.*)$/u;
    this.re_long        = /^\((&)\)\s+(.*)$/u;
    this.re_dlst_astr1  = /^(\*)\s+(\S+)\s*(.*)$/u;
    this.re_dlst_astr2  = /^(\*)\s+(\{.*?\})\s*(.*)$/u;
    this.re_dlst_astr3  = /^(\*)\s+(\$\{.*?\})\s*(.*)$/u;
    this.re_dlst_plus   = /^(\+)\s+(.*)$/u;
    this.re_tabb        = /^(=)\s+(.*)$/u;
    this.re_tabr        = /^(&)\s+(.*)$/u;
    this.re_pict        = /^(@)\s+(.*)$/u;
    this.re_quot        = /^(>)\s+(.*)$/u;
    this.re_plst        = /^(-|\d+\.|\d+\))\s+(.*)$/u;
    this.re_hlst        = /^(--)\s+(.*)$/u;
    this.re_uri         = /^\w+:\/\//u;
    this.re_ruby        = /^(\S+?)\u{30fb}(\S+)$/u;
    /*
    ＆  ff06 jp
    ％  ff05 jp,cn
    ＝  ff1d jp,cn
    ＃  ff03 jp,cn
    ＊  ff0a jp,cn
    ー  30fc jp
    －  ff0d cn
    ＋  ff0b jp,cn
    （  ff08 jp,cn
    ）  ff09 jp,cn
    「  300c jp
    」  300d jp
    ［  ff3b cn
    ］  ff3d cn
    〜  301c jp
    ｀  ff40 jp
    ～  ff5e cn
    ｀  ff40 cn
    ｜  ff5c jp,cn
    ・  30fb jp
    ＞  ff1e jp
    》  300b cn
    ＠  ff20 jp,cn



    Please say ~[hello]~
    Please say ~(hello)~
    Please say ~{hello}~
    */
    this.re_unmask_1 = /^&(.*)$/;/// ENTITY: [[&deg;]] or [[&amp;]]
    this.re_unmask_2 = /^(.*?)\u{30fb}(.*)$/u;/// RUBY: [[簡単・かんたん^]]
    this.re_unmask_3 = /^#(\S+)$/;/// REF: [[#myfigure]]
    this.re_leading_space = /^\s+(.*)$/;
    this.unicode_right_arrow = String.fromCharCode(8594);
    this.iscaption = 0;///set to 1 for typesetting caption
    this.isepub = 0;///set to 1 to indicate that it is for EPUB
    this.config = this.newConfig();
    this.blocks = [];///all blocks
    this.block = {};///the active block
    this.fname = '';///the filename metadata
    this.ispreview = 0;///set to 1 for preview in Atom
    this.editorrow = -1;///
    this.editorcolumn = -1;
    this.mode = [];
    this.rmap = [];
    this.idname = '';///used to prefix all block's id attribute
    this.xcssfontsize = '';///needed for unmask
    this.xlatfontsize = '';///needed for unmask
    this.xconfontsize = '';///needed for unmask
    this.xmonospace = '';///needed for unmask
  }

  newConfig() {

    /// initialize a new config object
    var config = {};

    /// All the layout dimensions are in 'mm'
    config.ALL = {};
    config.ALL.title = '';
    config.ALL.author = '';

    /// All the layout dimensions are in 'mm'
    config.CONTEX = {};
    config.CONTEX.backspace=40;//left margin
    config.CONTEX.cutspace=40;//right margin
    config.CONTEX.width=130;
    config.CONTEX.topspace=20;
    config.CONTEX.header=10;
    config.CONTEX.footer=0;
    config.CONTEX.height=250;
    config.CONTEX.bodyfontsizept=11;
    config.CONTEX.papersize='A4';///210 x 297
    config.CONTEX.chapter = '\\bfc';
    config.CONTEX.section = '\\bfb';
    config.CONTEX.subsection = '\\bfa';
    config.CONTEX.subsubsection = '\\bold';
    config.CONTEX.subsubsubsection = '\\bold';
    config.CONTEX.toc=0;///when set to 1 '\placecontent' will be inserted
    config.CONTEX.pages=0;
    config.CONTEX.twocolumns=0;///set to 1 to enable
    config.CONTEX.trace=0;

    /// All the layout dimensions are in 'mm'
    config.LATEX = {};
    config.LATEX.leftmargin=40;
    config.LATEX.rightmargin=40;
    config.LATEX.topmargin=20;
    config.LATEX.bodyfontsizept=12;
    config.LATEX.papersize='a4paper';
    config.LATEX.twoside=0;///set to '1' to enable
    config.LATEX.twocolumns=0;///set to '1' to enable
    config.LATEX.latexengine='';///set to 'pdflatex' or 'lualatex', default to 'lualatex'
    config.LATEX.toc=0;///when set to 1 '\tableofcontents' will be inserted
    config.LATEX.documentclass='';///set to 'book','scrbook', etc., if not set will be 'report' if 'config.LATEX.pages' is set, or 'article' if not
    config.LATEX.pages=0;
    config.LATEX.trace=0;

    /// All the layout dimensins are in 'mm'
    config.HTML = {};
    config.HTML.textcolor='#333';
    config.HTML.width=130;///130mm textwidth in MAIN element
    config.HTML.margin=4;///4mm margins left/right/top/bottom for MAIN element
    config.HTML.leftmargin=44;
    config.HTML.rightmargin=44;
    config.HTML.topmargin=30;
    config.HTML.bodyfontsizept=12;
    config.HTML.eqnumwidth=10;///'10mm' for equation number field
    config.HTML.toc=0;///when set to 1 a customized TOC will be inserted
    config.HTML.trace=0;

    /// All the layout dimensins are in 'mm'
    config.TEXT = {};
    config.MATH = {};
    config.MATH.left='5';///5mm left margin
    config.HDGS = {};
    config.PART = {};
    config.PARA = {};
    config.SBDC = {};
    config.PLST = {};
    config.PLST.padding = '2.0';///2.0em padding-left for <UL> and <OL>
    config.HLST = {};
    config.HLST.padding = '2.0';///2.0em padding-left for <UL> and <OL>
    config.HLST.style = 1;///0=plain;1=monospace;2=italic
    config.DLST = {};
    config.TLST = {};
    config.LONG = {};
    config.LONG.cssfontsize = '0.8';
    config.LONG.latfontsize = 'small';
    config.LONG.confontsize = 'sm';
    config.LONG.csshlines = 't m b r';
    config.LONG.cssvlines = '*';
    config.LONG.cssvpadding = 3;
    config.LONG.csshpadding = 6;
    config.LONG.lathlines = 't m b r';
    config.LONG.latvlines = '*';
    config.LONG.latvpadding = 3;
    config.LONG.lathpadding = 6;
    config.LONG.conhlines = 't m b r';
    config.LONG.convlines = '*';
    config.LONG.convpadding = 3;
    config.LONG.conhpadding = 6;
    config.TABR = {};
    config.TABR.left='5';///5mm margin
    config.TABR.cssfontsize = '0.8';
    config.TABR.latfontsize = 'small';
    config.TABR.confontsize = 'sm';
    config.TABR.csshlines = 't m b';
    config.TABR.cssvlines = '';
    config.TABR.cssvpadding = 1;
    config.TABR.csshpadding = 6;
    config.TABR.lathlines = 't m b';
    config.TABR.latvlines = '';
    config.TABR.latvpadding = 1;
    config.TABR.lathpadding = 6;
    config.TABR.conhlines = 't m b';
    config.TABR.convlines = '';
    config.TABR.convpadding = 1;
    config.TABR.conhpadding = 6;
    config.SAMP = {};
    config.SAMP.left='5';///5mm margin
    config.SAMP.cssfontsize = '0.8';
    config.SAMP.latfontsize = 'small';
    config.SAMP.confontsize = 'sm';
    config.SAMP.monospace = 1;
    config.SAMP.style = 0;///0=VERB, 1=LINES
    config.TABB = {};
    config.TABB.left='5';///5mm margin
    config.TABB.right='0';///0mm margin
    config.TABB.cssfontsize = '0.8';
    config.TABB.latfontsize = 'small';
    config.TABB.confontsize = 'sm';
    config.IMGS = {};
    config.DIAG = {};
    config.VERB = {};
    config.VERB.numbers = 1;
    config.VERB.monospace = 1;
    config.VERB.cssfontsize = '0.8';
    config.VERB.latfontsize = 'small';
    config.VERB.confontsize = 'sm';
    config.PICT = {};
    config.QUOT = {};
    config.QUOT.left='5';///5mm margin
    config.QUOT.right='5';///5mm margin
    config.QUOT.cssfontsize = '0.8';
    config.QUOT.latfontsize = 'small';
    config.QUOT.confontsize = 'sm';
    config.FRMD = {};
    config.FRMD.frameborder = 1;

    return config;
  }

  readFromLines(lines) {

    var v = '';
    var v1 = '';
    var v2 = '';
    var v3 = '';
    var i = 0;
    var brand0 = '';
    var nlines = 0;
    var mode = this.mode;
    var rmap = this.rmap;
    var row1 = 0;
    var row2 = 0;
    var block_type0 = '';
    var the_caption_block = {};
    var sig0 = '';

    /// initialize the output
    var o = [];

    /// start processing all lines of the editor
    while (lines.length > 0) {

      var block  = this.read_para(lines);
      var para = block.para;
      var lines = block.lines;

      /// increment block count
      var nread = para.length;
      row1 = nlines;
      nlines += nread;
      row2 = nlines;

      block.row1 = row1;
      block.row2 = row2;
      block.parser = this;

      o.push(block);
    }

    /// If the first block is a text, turn it into a HDGS/0 block
    if(o.length > 0) {
      var block = o[0];
      var {sig} = block;
      if (sig === 'TEXT') {
        block.sig = 'HDGS'
        block.hdgn = 0;
        block.level = 0;
        block.title = this.joinPara(block.para);
      }
    }

    /// if the first block is a HDGS block, and its hdgn is not 0, then we need to
    /// set it to zero and then change all remaining HDGS block to reduce its hdgn
    /// by 1
    if(o.length > 0) {
      var block = o[0];
      var {sig,hdgn} = block;
      if (sig === 'HDGS' && hdgn > 0) {
        block.hdgn = 0;
        for (var j=1; j < o.length; j++) {
          var block = o[j];
          var {sig,hdgn} = block;
          if (sig ==='HDGS' && hdgn > 1) {
            hdgn--;
            block.hdgn = hdgn;
            block.level = hdgn;
          }
        }
      }
    }

    /// at this point we check to ensure that the first
    /// block is a HDGS/0, and if not we will insert one
    var isgood = 0;
    if(o.length > 0) {
      var block = o[0];
      var {sig,hdgn} = block;
      if (sig === 'HDGS' && hdgn == 0) {
        isgood = 1;
      }
    }

    /// insert a new HDGS/0 block if necessary
    if (!isgood) {
      var sig = 'HDGS';
      var hdgn = 0;
      var title = 'Untitled';
      var newblock = {sig,hdgn,title};
      o.unshift(newblock);
    }

    /// Set the config.ALL.title if it is not set and
    /// the first block is a HDGS/0 block
    if(!this.config.ALL.title && o.length > 0) {
      var block = o[0];
      var {sig,hdgn,data} = block;
      if (sig === 'HDGS' && hdgn === 0) {
        this.config.ALL.title = data;
      }
    }

    this.blocks = o;
  }

  parse_text(para){
    var v1;
    var v2;
    var v3;
    if ((v1 = this.re_prim.exec(para[0])) !== null ||
        (v2 = this.re_seco.exec(para[0])) !== null ||
        (v3 = this.re_thrd.exec(para[0])) !== null) {
      if (v1) {
        var leadn = 1;
        var lead = v1[1];
        var text = v1[2];
      } else if (v2) {
        var leadn = 2;
        var lead = v2[1];
        var text = v2[2];
      } else {
        var leadn = 3;
        var lead = v3[1];
        var text = v3[2];
      }
      for (let i=1; i < para.length; ++i) {
        text = this.joinLine(text,para[i]);
      }
    } else {
      text = this.joinPara(para);
    }
    return {leadn,lead,text};
  }

  read_para (lines) {

    /// @ ${fig:a} 
    ///   This is caption text.
    ///   ~~~ 
    ///   data ...
    ///   data ...
    ///
    ///   data ...
    ///   data ...
    ///   ~~~
    ///

    /// @ ${fig:a} 
    ///   This is caption text.
    ///   --- 
    ///   data ...
    ///   data ...
    ///

    /// Normal text paragram
    /// that ends with a blank line.
    ///

    ///   Following are samples.
    ///   console.log(...)
    ///   console.log(...)
    ///   console.log(...)
    ///   

    /// + TLST    
    /// + TLST    

    /// - PLST    
    /// - PLST    
    /// 1) PLST    
    /// 2) PLST    
    /// 1. PLST    
    /// 2. PLST    

    /// -- HLST    
    /// -- HLST    

    /// * DLST    
    /// * DLST    

    /// (&) LONG    
    /// (&) LONG    

    /// List of symbols at the start
    /// @ = & > # $ %

    var re_caption = /^\$\{#([\w:]+)\}\s*(.*)$/u;
    var re_comm = /^%\s*(.*)$/u;
    var re_spcl = /^(@|=|&)\s+(.*)$/u;
    var re_hdgs = /^(#+)\s+(.*)$/u;
    var re_quot = /^(>)\s+(.*)$/u;
    var re_math = /^(\$)\s+(.*)$/u;
    var re_plst = /^(-|\d+\.|\d+\))\s+(.*)$/u;
    var re_hlst = /^(--)\s+(.*)$/u;
    var re_tlst = /^(\+)\s+(.*)$/u;
    var re_dlst = /^(\*)\s+(.*)$/u;
    var re_long = /^(\(&\))\s+(.*)$/u;
    var re_samp = /^\s+(.*)$/u;
    var re_text = /^\S/u;
    var re_fence = /^\s*(`{3,})\s*(\w*)$/u;
    var re_sep = /^\s*(-{3,})$/u;
    var bull = '';
    var text = [];
    var para = [];
    var label = '';
    var caption = '';
    var isfenced = 0;
    var fenceid = '';
    var type = '';
    var title = '';
    var sig = '';
    var hdgn = '';
    var data;
    var v;

    /// read off blank and comm lines
    for (var i=0; i < lines.length; ++i) {
      var line = lines[i];
      line = line.trimRight();
      if((v=re_comm.exec(line))!==null){
        var nitrile_line = v[1];
        if ((v = this.re_nitrilemode.exec(nitrile_line)) !== null) {
          var re_sub = /^h(\d+)$/i;
          var key = v[1];
          var val = v[2];
          if(key==='root'){
            let name='root';
            let subfname=val;
            this.mode.push({name,subfname});
          }else if(key==='part'){
            let name='part';
            let subtitle=val;
            this.mode.push({name,subtitle});
          }else if(re_sub.test(key)){
            let myv = re_sub.exec(key);
            let name='h';
            let sublevel=myv[1];
            let subfname=val;
            this.mode.push({name,sublevel,subfname});
          }
          continue;
        }
        if ((v = this.re_nitrileitem.exec(nitrile_line)) !== null) {
          var rb = v[1];
          var rt = v[2];
          this.rmap.push([rb,rt]);
          continue;
        }
        if ((v = this.re_nitrileconf.exec(nitrile_line)) !== null) {
          var key1 = v[1];
          var key2 = v[2];
          var val = v[3];
          key1 = key1.toUpperCase();
          key2 = key2.toLowerCase();
          if (this.config.hasOwnProperty(key1) &&
              this.config[key1].hasOwnProperty(key2)) {
            if(this.isFloat(val)){
              var num = parseFloat(val);
              this.config[key1][key2] = num;
            } else {
              this.config[key1][key2] = val;
            }
          }
          continue;
        }
        continue;
      }
      if(line.length==0){
        continue;
      }
      break;
    }

    /// slice off some lines

    para = lines.slice(0,i);
    lines = lines.slice(i);

    /// determine the type of the block
    for (var i=0; i < lines.length; ++i) {
      var line = lines[i];
      line = line.trimRight();
      if(i==0 && (v=re_spcl.exec(line))!==null){
        if(bull=='@'){
          type = 'pict';
        } 
        else if (bull=='&'){
          type = 'tabr';
        } 
        else if (bull=='='){
          type = 'tabb';
        }
        bull = v[1];
        let s = v[2];
        if((v=re_caption.exec(s))!==null){
          label = v[1];
          caption = v[2];
          continue;
        } else {
          break;
        }
      }
      if(i==0 && (v=re_hdgs.exec(line))!==null){
        type = 'hdgs';
        bull = v[1];
        let s = v[2];
        if((v=re_caption.exec(s))!==null){
          label = v[1];
          title = v[2];
        } else {
          title = s;
        }
        hdgn = bull.length;
        i++;
        break;
      }
      if(i==0 && (v=re_math.exec(line))!==null){
        type = 'math';
        bull = v[1];
        let s = v[2];
        if((v=re_caption.exec(s))!==null){
          label = v[1];
          text.push(v[2]);///first line of math block
        } else {
          text.push(s);///first line of math block
        }
        i++;
        break;
      }
      if(i==0 && (v=re_quot.exec(line))!==null){
        type = 'quot';
        bull = v[1];
        let s = v[2];
        text.push(s);///first line of quot block
        i++;
        break;
      }
      if(i==0 && (v=re_plst.exec(line))!==null){
        type = 'plst';
        break;  
      }
      if(i==0 && (v=re_hlst.exec(line))!==null){
        type = 'hlst';
        break;  
      }
      if(i==0 && (v=re_tlst.exec(line))!==null){
        type = 'tlst';
        break;  
      }
      if(i==0 && (v=re_dlst.exec(line))!==null){
        type = 'dlst';
        break;  
      }
      if(i==0 && (v=re_long.exec(line))!==null){
        type = 'long';
        break;  
      }
      if(i==0 && (v=re_samp.exec(line))!==null){
        type = 'samp';
        break;  
      }
      if(i==0){
        type = 'text';
        break;  
      }
      if((v=re_fence.exec(line))!==null){
        isfenced = 1;
        fenceid = v[2];
        i++;
        break;
      }
      if(re_sep.test(line)){
        isfenced = 0;
        i++;
        break;
      }
      caption = this.joinLine(caption,line);
    }

    /// slice off some lines

    para = lines.slice(0,i);
    lines = lines.slice(i);

    /// read the rest of the text, if it is not HDGS and assign them to 'text',
    /// stopping only for another fence or empty line    

    if(type !== 'hdgs'){
      for (var i=0; i < lines.length; ++i) {
        var line = lines[i];
        line = line.trimRight();
        para.push(line);

        if(isfenced && re_fence.test(line)){
          i++;
          break; ///break if a fence is seen
        }

        if(!isfenced && line.length==0){
          i++;
          break; /// break if a blank line is seen
        }

        text.push(line);
      }
    }

    /// slice off some lines

    para = lines.slice(0,i);
    lines = lines.slice(i);

    /// parse 'text'
    
    if(type == 'pict'){
      data = parse_pict(text);
    } 
    else if (type == 'tabr'){
      data = parse_tabb(text);
    } 
    else if (type == 'tabb'){
      data = parse_tabb(text);
    }
    else if(type == 'math'){
      data = parse_math(text);
    }
    else if(type == 'quot'){
      data = parse_quot(text);
    }
    else if(type == 'plst'){
      data = parse_plst(text);
    }
    else if(type == 'hlst'){
      data = parse_hlst(text);
    }
    else if(type == 'tlst'){
      data = parse_tlst(text);
    }
    else if(type == 'dlst'){
      data = parse_dlst(text);
    }
    else if(type == 'long'){
      data = parse_long(text);
    }
    else if(type == 'samp'){
      data = this.trimSampPara(text);
    }
    else {
      data = this.parse_text(text);
    }

    var sig = type.toUpperCase();
    return {para,lines,text,caption,label,title,hdgn,sig,data,isfenced,fenceid};
  }

  extract_texmath(line){
    var cnt;
    var v;
    var start_i = 0;
    var newtext = '';
    while ((v = this.re_texmath.exec(line)) !== null) {
      var i = v.index;
      cnt = line.slice(start_i,i);
      cnt = this.escape(cnt);
      newtext = newtext.concat(cnt);
      if(v[1]!==undefined){
        ///displaymath
        cnt = v[1];
        cnt = this.displaymath(cnt);
        newtext = newtext.concat(cnt);
      }
      else if(v[2]!==undefined){
        ///displaymath
        cnt = v[2];
        cnt = this.inlinemath(cnt);
        newtext = newtext.concat(cnt);
      }
      start_i = this.re_texmath.lastIndex;
    }
    cnt = line.slice(start_i);
    cnt = this.escape(cnt);
    newtext = newtext.concat(cnt);
    return newtext;
  }

  unmask (line) {
    /// unmask all inline markups within a text
    ///
    /// 1  {{emph-text}}
    /// 2  ``math-text``
    /// 3  `code-text`
    /// 4  ${special}
    ///

    var cnt;
    var v;
    var line = line || '';
    var start_i = 0;
    var newtext = '';
    while ((v = this.re_unmask.exec(line)) !== null) {
      var i = v.index;
      cnt = line.slice(start_i,i);
      cnt = this.escape(cnt);
      newtext = newtext.concat(cnt);
      if (v[1] !== undefined) {

        var cnt = v[1]; 
        newtext += this.style('em',cnt);

      } else if (v[2] !== undefined) {

        var cnt = v[2]; 
        newtext += this.inlinemath(cnt);

      } else if (v[3] !== undefined) {

        var cnt = v[3]; 
        newtext += this.style('code',cnt);

      } else if (v[4] !== undefined) {

        var cnt = v[4];
        cnt = cnt.trim();
        if(cnt.startsWith('#')){
          cnt = cnt.slice(1);
          newtext += this.ref(cnt);
        } else if(this.re_uri.test(cnt)){
          newtext += this.uri(cnt);
        } else if(this.re_ruby.test(cnt)){
          var v = this.re_ruby.exec(cnt);
          var rb = v[1];
          var rt = v[2];
          newtext += this.ruby(rb,rt);
        } else {
          var mytext = cnt;
          var mytext = this.escape(mytext);
          var mytext = this.rubify(mytext);
          newtext += mytext;
        }

      } 
      start_i = this.re_unmask.lastIndex;
    }
    cnt = line.slice(start_i);
    cnt = this.escape(cnt);
    newtext = newtext.concat(cnt);
    return newtext;
  }

  _unmask (line) {
    ///
    /// unmask all inline markups within a text
    ///
    /// 1  {{emph-text}}
    /// 2  ``math-text``
    /// 3  `code-text`
    /// 4  {#special}
    /// 5  'file.txt' TODO
    ///

    var line = line || '';
    var newtext = '';
    var cnt0 = '';
    while(line.length > 0){
      var [s,line,type,cnt] = this.getNextComponent(line);

      //merge default type
      if(type == ''){
        cnt0 += cnt;
        continue;
      } 

      // flush default type
      if(cnt0){
        newtext += this.escape(cnt0);
        cnt0 = '';
      }

      if (type == 'emph') {

        newtext += this.style('em',cnt);

      } else if (type == 'math'){      

        newtext += this.inlinemath(cnt);

      } else if (type == 'verb') {

        newtext += this.style('code',cnt);

      } else if (type == 'ref') { 

        newtext += this.ref(cnt);

      } else if (type == 'uri') { 

        newtext += this.uri(cnt);

      } else if (type == 'brace') { 

        // recursive
        newtext += this.unmask(cnt);

      } else {

        newtext += this.escape(cnt);

      }
    }

    // flush default type
    if(cnt0){
      newtext += this.escape(cnt0);
      cnt0 = '';
    }

    return newtext;
  }

  trimPara (para) {

    ///
    /// Trim the paragraph on the left side and return the number of
    /// spaces trimmed
    ///

    if (para.length == 0) {
      return [para, 0];
    }
    var re = /^\s+/;
    var v = re.exec(para[0]);
    if (v == null) {
      return [para, 0];
    }
    /// find out the smallest leading space of all lines
    var n0 = Number.MAX_SAFE_INTEGER;
    for (let line of para) {
      var line0 = line.trimLeft();
      var n = line.length - line0.length;
      if (n < n0) {
        n0 = n;
      }
    }
    var n = n0;
    /// start trimming
    var out = [];
    var i;
    for (i in para) {
      out.push(para[i].slice(n));
    }
    return [out, n];
  }

  trimSampPara (para) {

    var line0 = para[0];
    var line00 = line0.trimLeft();
    var n = line0.length - line00.length;

    /// figure out the n to trim
    var n0 = n;
    for(var i=1; i < para.length; ++i){
      if(!para[i]) continue;
      var line0 = para[i];
      var line00 = line0.trimLeft();
      var n = line0.length - line00.length;
      n0 = Math.min(n0,n);
    }

    /// now trim the entire para
    return this.trimParaAt(para,n0);
  }

  trimParaAt (para,n) {

    ///
    /// Trim the paragraph on the left side for the exact number of
    /// characters provided.
    ///

    var out = [];
    var i;
    for (i in para) {
      out.push(para[i].slice(n));
    }
    return out;
  }

  trimFences (para) {

    ///
    /// Trim the paragraph to remove fences on the top and/or bottom

    /// ``` javascript
    /// printf("hello world\n");
    /// ```

    /// or

    /// ~~~ imgs
    /// image tree.png
    /// ~~~
    ///

    var the_fence = '';
    var the_brand = '';
    var v1 = this.re_fence.exec(para[0]);
    var v2 = this.re_fence.exec(para[para.length-1]);
    if (v1 !== null && v2 !== null) {
      var the_fence = v1[1];
      var the_brand = v1[2];
      para = para.slice(1,para.length-1);
      return [para,the_fence,the_brand];
    } else if (v1 !== null) {
      var the_fence = v1[1];
      var the_brand = v1[2];
      para = para.slice(1);
      return [para,the_fence,the_brand];
    }
    return [para,'',''];
  }

  trimSampleFences (para) {

    ///
    /// Trim the paragraph to remove fences on the top and/or bottom

    /// ~~~
    /// printf("hello world\n");
    /// ~~~

    var v1 = this.re_sampfence.test(para[0]);
    var v2 = this.re_sampfence.test(para[para.length-1]);
    if (v1 && v2) {
      para = para.slice(1,para.length-1);
      return [para,'~~~',''];
    } else if (v1) {
      para = para.slice(1);
      return [para,'~~~',''];
    }
    return [para,'',''];
  }

  concatPara (para) {
    ///
    /// Concatenate all lines within that paragraph that ends with backslashes
    ///

    var out = [];
    var iscont = false;
    var s0 = '';
    for (var line of para) {
      if (iscont) {
        var s = out[out.length-1];
        s = s.slice(0,s.length-1);
        s = this.joinLine(s,line);
        out[out.length-1] = s;
      } else {
        out.push(line);
      }
      iscont = line.endsWith('\\');
    }
    return out;
  }

  splitLineThreeSpaces (line) {
    ///
    /// Break a line into multiple segments based on three-spaces
    ///

    var o = [];
    var i = 0;
    var k = -1;
    var n = 0;
    var j0 = 0;
    var j = 0;
    for (j=0; j < line.length; ++j) {
      var c = line[j];
      if (/\s/.test(c)) {
        i = j;
      } else {
        k = j;
      }
      if (k >= 0 && (i-k == 3)) {
        o.push(line.slice(j0,j+1));
        j0 = j+1;
      }
    }
    if (j0 < j) {
      o.push(line.slice(j0,j));
    }
    return o;
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
      return [cnt,line.slice(i),'brace',cnt];
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
    var v = this.re_plain.exec(line);
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
    var v = this.re_plain.exec(line);
    if(v){
      return [v[1],v[2],'',v[1]];
    }
    ///get next char only
    var s = line.charAt(0);
    return [s,line.slice(1),'',s];
  }

  splitCells (line) {
    ///
    /// Break a line into multiple segments based on either
    /// words separated by spaces or a group enclosed by
    /// braces
    ///

    var o = [];
    var i = 0;
    line = line.trimLeft();
    while(line.length > 0){
      var [s,line] = this.getNextCell(line);
      o.push(s);
    }
    o = o.map(x => x.trim());
    o = o.filter(x => x?true:false );
    return o;
  }

  splitLineDoubleBraces (line) {
    ///
    /// Break a line into multiple segments based on the
    /// appearances of {}
    ///

    var o = [];
    var i = 0;
    var k = -1;
    var n = 0;
    var j0 = 0;
    var j = 0;
    var s = line;
    var n = s.indexOf('{}');
    while(n >= 0){
      o.push(s.substring(0,n-1));
      s = s.slice(n);
      s = s.slice(2);
      n = s.indexOf('{}');
    }
    o.push(s);
    o = o.map(x => x.trim());
    return o;
  }

  splitLineTwoSpaces (line) {
    ///
    /// Break a line into multiple segments based on three-spaces
    ///

    var o = [];
    var i = 0;
    var k = -1;
    var n = 0;
    var j0 = 0;
    var j = 0;
    for (j=0; j < line.length; ++j) {
      var c = line[j];
      if (/\s/.test(c)) {
        i = j;
      } else {
        k = j;
      }
      if (k >= 0 && (i-k == 2)) {
        o.push(line.slice(j0,j+1));
        j0 = j+1;
      }
    }
    if (j0 < j) {
      o.push(line.slice(j0,j));
    }
    o = o.map(x => x.trim());
    return o;
  }

  splitLineVbars (line) {
    ///
    /// Break a line into multiple segments based on the presence of a vertical bar
    ///

    var o = [];
    o = line.split('|');
    o = o.map(x => x.trim());
    return o;
  }

  parseIMGS (para) {
    ///
    /// Parse the IMGS
    ///  image (tree.png tree.pdf) This is a tree.
    ///  image (frog.png frog.pdf) This is a flog.
    ///  image [width:100%;height:2cm](tree.png tree.pdf) This is a tree.
    ///  image [width:5cm;height:2cm](frog.png frog.pdf) This is a flog.
    ///

    /// join backslashed lines
    para = this.joinBackslashedLines(para);

    /// image lines
    var re_nr = /^nr$/;
    var o = [];
    var v;
    var images = [];
    o.push(images);

    /// parse lines
    for (var line of para) {
      if ((v=this.re_image.exec(line))!==null) {
        var opt = v[1];
        var srcs = v[2];
        var sub = v[3];
        var opts = this.toStyle(opt.slice(1,opt.length-1));
        var srcs = this.toArray(srcs);
        images.push({opts,srcs,sub});
        continue;
      }
      var images = [];
      o.push(images);
    }

    /// figure out the empty images
    o = o.filter(x => (x.length>0)?true:false);
    return o;
  }

  parse_plst (para) {
    ///
    /// Parse the paragraph that is PLST
    ///

    var items = [];
    //
    var num = 0;
    var levels = [];
    var lead = '';
    var bull = '';
    var bullet = '';
    var value = '';
    var action = '';
    var v;
    //
    //var re = /^(\s*)(\+|\-|\*|\d+\.)\s+(.*)$/;
    //
    var re = /^(\s*)/;
    for (var line of para) {
      v = this.re_leadspaces.exec(line);
      if (v) {
        lead = v[1];
        line = v[2];
      } else {
        lead = '';
      }
      v = this.re_plst.exec(line);
      if (v) {
        var bullet = v[1];
        var text = v[2];
        if (bullet == '-'){
          value = '';
          bull = 'UL';
        } else {
          bull = 'OL';
          num = parseInt(bullet);
          value = `${num}.`;
        }
        // check for indentation
        if (levels.length == 0) {
          action = 'push';
        } else {
          var lead0 = levels[levels.length-1][0];
          if (lead0.length < lead.length) {
            action = 'push';
          } else if (levels.length > 1 && lead0.length > lead.length) {
            action = 'pop';
          } else {
            action = 'item';
          }
        }
      } else {
        action = 'text';
      }

      /// For Japanese language input, the following three
      /// are used for three levels of nesting
      ///  ー \u30fc
      ///  ＋ \uff0b
      ///  ＊ \uff0a

      if (action === 'push') {
        levels.push([lead,bull]);
        items.push({bull,bullet,value,text});
      } else if (action === 'pop') {
        var [lead,bull] = levels.pop();
        bull = `/${bull}`;
        items.push({bull,bullet,value,text});
      } else if (action === 'item') {
        bull = 'LI';
        items.push({bull,bullet,value,text});
      } else {
        // 'text', concat the new text to the old of the last text
        if (items.length > 0) {
          var item = items.pop();
          var {text} = item;
          text = this.joinLine(text,line);
          item.text = text;
          items.push(item);
        }
      }
    }
    //
    while (levels.length > 0) {
      [lead,bull] = levels.pop();
      bull = `/${bull}`;
      items.push({bull});
    }
    //
    return items;
  }

  parse_hlst (para) {
    var items = [];
    var v;
    var re_item = /^(.*?)(?<!\S)([:\-])\s+(.*)$/;
    var re_word = /^(\S+)\s*(.*)$/;
    for (var line of para) {
      if((v = this.re_hlst.exec(line))!==null){
        var text = v[2];
        items.push(text);
        continue;
      } 
      var text = items.pop();
      text = this.joinLine(text,line);
      items.push(text);
    }
    items = items.map(text => {
      var dt = '';
      var sep = '';
      if((v = re_item.exec(text))!==null){
        var dt = v[1].trim();
        var sep = v[2].trim();
        var text = v[3].trim();
      }
      else if((v = re_word.exec(text))!==null){
        var dt = v[1].trim();
        var text = v[2].trim();
      }
      return {dt,sep,text};
    });
    return items;
  }

  parseDT (para) {
    var out = [];
    var re = /^(\S.*?)\s{2,}(.*)$/;
    var re_dt = /^\S/;
    for (var s of para) {
      var v = re.exec(s);
      if (v) {
        var dt = v[1];
        var dd = v[2];
        out.push(dt);
        out.push(dd);
      } else if (re_dt.test(s)) {
        var dt = s;
        var dd = '';
        out.push(dt);
        out.push(dd);
      } else {
        if (out.length) {
          var last = out.pop();
          s = this.joinLine(last,s);
          out.push(s);
        }
      }
    }
    ///convert to DLST format
    var o = [];
    var p = [[],''];
    var is_cont = 0;
    for (var j=0; j < out.length; j+=2){
      var key = out[j];
      var text = out[j+1];
      if (is_cont) {
        p[0].push(key);
        p[1] = text;
      } else {
        p = [[key],text];
        o.push(p);
      }
      if (!text) {
        is_cont = 1;
      } else {
        is_cont = 0;
      }
    }
    o = o.filter( item => (item[0].length > 0)?true:false );
    return o;
  }

  parseEQTN(para) {
  /*
    var out = [];
    while (para.length > 0) {
      var [o,para] = this.getClusterLines(para);
      if (o.length > 0){
        out.push(o);
      }
    }
    return out;
  */
    return para;
  }

  _parseEQTN (para) {
    var out = [];
    var p = [];
    var s0 = '';
    var re = /(.*)\\\\$/;
    out.push(p);
    for (var s of para) {
      if (s === '') {
        if (p.length) {
          p = [];
          s0 = '';
          out.push(p);
        }
        continue;
      }
      s = `${s0} ${s}`;
      var v = re.exec(s);
      if(v){
        if (s0) {
          p.pop();
        }
        p.push(v[1]);
        s0 = '';
      } else if (s0) {
        p.pop();
        p.push(s);
        s0 = s;
      } else {
        p.push(s);
        s0 = s;
      }
    }
    if (p.length===0) {
      out.pop(p);
    }
    return out;
  }

  parseDIAGRAM (para) {
    var o = [];
    var s0 = '';
    for (var s of para) {
      if (s) {
        if (s0 && s0[s0.length-1] === '\\') {
          s0 = s0.slice(0,s0.length-1);///remove the last backslash
          s0 += ' ';
          s0 += s.trimLeft();
          o.pop();
          o.push(s0);
        } else {
          s0 = s.trimLeft();
          o.push(s0);
        }
      }
    }
    return o;
  }

  joinBackslashedLines (para) {
    var o = [];
    var s0 = '';
    for (var s of para) {
      if (s0 && s0[s0.length-1] === '\\') {
        s0 = s0.slice(0,s0.length-1);///remove the last backslash
        s0 = this.joinLine(s0,s);
        o.pop();
        o.push(s0);
      } else {
        s0 = s.trimLeft();
        o.push(s0);
      }
    }
    return o;
  }

  parseBOOK (para) {
    var out = [];
    for (var s of para) {
      var re = /^\s*(\:|\#{1,})\s+(.*)$/;
      var v = re.exec(s);
      var path = undefined;
      var text = undefined;
      var sec = '';
      var num = 0;
      if (v) {
        if (/^\"(.*)\"$/.test(v[2])) {
          text = v[2];
          text = text.slice(1,text.length-1);
        } else {
          path = v[2];
        }
        if (v[1] === ':') {
          sec = 'chapter';
        } else {
          sec = 'section';
          num = v[1].length;
        }
        /// a chapter
        out.push([sec,num,path,text]);
      }
    }
    return out;
  }

  replaceSubstrings (src, map) {

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
      for (k=0; k < map.length; k+=2) {
        var str1 = map[k];
        var str2 = map[k+1];
        var i = src.indexOf(str1,j);
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
        var str2 = map[k0+1];
        out += src.slice(j,i0);
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

  isHan (cc) {
    ///
    /// Given a character code and returns true if it is considered a CJK unified character
    ///

    if (cc >= 0x4E00 && cc <= 0x9FFF) {
      return true;
    } else {
      return false;
    }
  }

  joinTableCell (s0, s1) {
    ///
    /// join separate components of a single table cell.
    ///

    s0 = s0 || '';
    s1 = s1 || '';

    if (s0.endsWith('\\\\')) {
      s0 = s0.slice(0,s0.length-2);
      return `${s0}\n${s1}`;
    }

    if (s0.endsWith('\\')) {
      s0 = s0.slice(0,s0.length-1);
      return this.joinLine(s0,s1);
    }

    return this.joinLine(s0,s1);
  }

  joinLine (s0, s1) {
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
      ///if (this.isHan(s0.charCodeAt(s0[s0.length-1])) && this.isHan(s1.charCodeAt(0))) {
    } else {
      return s0 + s1;
      ///return s0 + ' ' + s1;
    }
  }

  joinPara (para) {
    ///
    /// join two lines
    ///

    if (para.length === 0) {
      return '';
    }
    var line = para.shift();
    for (var s of para) {
      line = this.joinLine(line,s);
    }
    return line;
  }

  expandString (text, n, c) {
    text = ''+text; /// cast into a string
    var cc = ''+c; /// cast into a string
    if (cc.length > 0) {
      var diff = n - text.length;
      for (var j=0; j < diff; ++j) {
        text += cc;
      }
    }
    return text;
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

    return this.subfignums[j];
  }

  toPartNum (j) {
    ///
    /// Given an integer, return the subfig number: 0 -> a, 1 -> b
    ///

    return this.partnums[j];
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

  new_hdgs_block (title) {

    /// create a new 'HDGS/0' block
    var sig = 'HDGS';
    var hdgn = 0;
    return ({sig,hdgn,title});

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

  splitFenceCmd (fencecmd) {
    ///
    /// split a fencecmd such as 'n;javascript' into array and then set them attributes
    ///

    var o = {};
    for (var v of fencecmd.split(';')) {
      o[v] = 1;
    }
    return o;
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

  async readModeAsync(dirname) {
    if(!dirname){
      dirname = path.dirname(this.fname);
    }
    let all = [];
    ///set to read from disk
    for( var d of this.mode ) {
      let { subfname } = d;
      if(subfname && subfname.localeCompare(this.fname)!=0){
        d.subparser = new NitrilePreviewParser();
        all.push( d.subparser.readFromFileAsync(subfname,dirname) );
      }
    }
    ///wait for all
    await Promise.all(all);
    ///at this point all sub-documents are read from disk
    for(let d of this.mode){
      let {name,sublevel,subtitle,subfname,subparser} = d;
      if(name==='root' && subparser){
        ///root is the master
        this.config = subparser.config;
        for(var m of subparser.rmap){
          this.rmap.push(m);
        }
      }else if(name==='part'){
        let sig='HDGS';
        let hdgn=0;
        let part=1;
        let data=subtitle;
        this.blocks.push({sig,hdgn,part,data});
      }else if(name==='h' && subparser){
        ///this is the master
        ///---add all blocks of this subparser to the end
        ///---of the current parser, and update the subparser's
        ///rmap as well, and also add a new member 'sublevel'
        ///to each block of the subparser
        for(let m of this.rmap){
          subparser.rmap.push(m);
        }
        for(let m of subparser.blocks){
          m.subfname=subfname;
          m.sublevel=sublevel;///for autonum
          this.blocks.push(m);
        }
      }
    }
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
      for (var rubyitem of this.xrmap) {
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
        out += this.extractRubyItems(str1,str2,desc);
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

  parseTABULAR (para) {

    ///
    /// Parse the TABL block
    ///
    ///  ```
    ///  Informal negative        簡単ではない
    ///                           簡単じゃない
    ///
    ///  Informal past            簡単だった
    ///
    ///  Informal negative past   簡単ではなかった
    ///                           簡単じゃなかった
    ///
    ///  Formal                   簡単です
    ///
    ///  Formal negative          簡単ではありません\\
    ///                           簡単じゃありません\\
    ///
    ///  Formal past              簡単でした
    ///  ```
    ///

    var re_ebs = /\\$/;
    var o = [];
    var s0 = [];///this is the current row
    o.push(s0);
    for (var row of para) {
      if (row.length === 0) {
        ///NOTE: we need to insert a new row. But we need to watch
        /// out for multiple empty lines
        if (s0.length) {
          s0 = [];
          o.push(s0);
        }
      }
      ///NOTE: two leading spaces are treated as starting at the
      /// second column
      var pp = this.splitLineDoubleBraces(row);
      var pp = pp.map(s => s.trim());
      var pp = pp.map(s => s=='{}'?'':s);
      if (s0.length === 0) {
        pp.forEach(x => s0.push(x));
        var ebs = s0.map(s => re_ebs.test(s));
      } else {
        var j = 0;
        ebs.forEach((x,i) => {
            if(x){
              s0[i] = s0[i].replace(/\\\\$/,'\n');
              s0[i] = s0[i].replace(/\\$/,'');
              s0[i] = this.joinLine(s0[i],pp[j++]);
            }
        });
        var ebs = s0.map(s => re_ebs.test(s));
      }
    }
    ///NOTE: we need to watch for the last s0 which is empty
    if (s0.length === 0) {
      o.pop();
    }
    ///NOTE: remove all entries with ending \\\\ or \\
    o = o.map( row => {
        row = row.map( s => s.replace(/\\\\$/,'') );
        row = row.map( s => s.replace(/\\$/,'') );
        return row;
    });
    var maxj = this.matrixMaxJ(o);
    if (maxj < 1) maxj = 1;
    var o = o.map( x => this.expandArray(x,maxj,'') );
    var ww = this.calcTabbWidthByNumCharacters(o,maxj);
    var ww = ww.map( x => x.toFixed(3) );
    return [o,maxj,ww];

  }

  parsePARATABULAR(para) {
    ///
    /// ```
    /// apple
    /// Apple is good.
    ///
    /// pear
    /// Pear is good.
    ///
    /// banana
    /// Banana is good.
    /// ```
    var iscont = false;
    var o = [];
    o.push([]);
    for (var line of para) {
      var s = line;
      if (line.trim() === '{}') {
        s = '';
      }
      if (iscont) {
        var i0 = o[o.length-1].length;
        var line0 = o[o.length-1][i0-1];
        if (line0.endsWith('\\\\')) {
          line0 = line0.slice(0,line0.length-2);
          line0 += '\n';
          line0 += s;
          o[o.length-1][i0-1] = line0;
        } else if (line0.endsWith('\\')) {
          line0 = line0.slice(0,line0.length-1);
          line0 = this.joinLine(line0,s);
          o[o.length-1][i0-1] = line0;
        }
        if (!line) {
          o.push([]);
        }
      } else {
        if (!line) {
          if (o[o.length-1].length) {
            o.push([]);
          }
        } else {
          o[o.length-1].push(s);
        }
      }
      /// check for iscont
      iscont = line.endsWith('\\');
    }
    var maxj = this.matrixMaxJ(o);
    if (maxj < 1) maxj = 1;
    var o = o.map( x => this.expandArray(x,maxj,'') );
    var ww = this.calcTabbWidthByNumCharacters(o,maxj);
    var ww = ww.map( x => x.toFixed(3) );
    return [o,maxj,ww];
  }

  parseLINETABULAR(para) {

    /// ```
    ///
    ///   Syntax         Name                           Example(s)
    ///   +              Plus                           x = 5 + 1
    ///   -              Minus                          x = 5 - 1
    ///   *              Multiply                       x = 5 * 1
    ///   /              Divide                         x = 5 / 1
    ///   %              Modulo                         x = 5 % 1
    ///   ++             Increment                      x = ++y
    ///   --             Decrement                      x = --y
    ///   +val           Positive                       x = +y
    ///   -val           Negation                       x = -y
    ///
    /// ```

    /// form is ''
    var o = [];
    var iscont = false;
    for (var row of para) {
      var pp = this.splitLineDoubleBraces(row);
      var pp = pp.map(x => x.trim());
      var pp = pp.map(x => x=='{}'?'':x);
      if (iscont) {
        var pp0 = o[o.length-1];
        var i = 0;  // 'i' is for last row
        var j = 0;  // 'j' is for new row
        for (; i < pp0.length; ++i) {
          var s = pp0[i];
          if (s.endsWith('\\\\')) {
            s = s.slice(0,s.length-2);
            s += '\n';
            s += pp[j] || '';
            pp0[i] = s;
            j++;
          } else if (s.endsWith('\\')) {
            s = s.slice(0,s.length-1);
            s = this.joinLine(s, (pp[j] || ''));
            pp0[i] = s;
            j++;
          }
        }
        o[o.length-1] = pp0;
      } else {
        if (row) {
          /// ignore empty lines
          o.push(pp);
        }
      }
      iscont = pp.some(x => x.endsWith('\\'));
    }
    var maxj = this.matrixMaxJ(o);
    if (maxj < 1) maxj = 1;
    var o = o.map( x => this.expandArray(x,maxj,'') );
    var ww = this.calcTabbWidthByNumCharacters(o,maxj);
    var ww = ww.map( x => x.toFixed(3) );
    return [o,maxj,ww];
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

  parseLongPara(para) {

    var o = [];
    /*
    var re = this.re_long;
    var s = para[0];
    var v = re.exec(s);
    var s0 = '';
    for (var j = 0; j < para.length; ++j) {
      var s = para[j];
      v = re.exec(s);
      if( v ) {
        s0 = v[2];
        o.push(s0);
      } else {
        s0 = this.joinLine(s0,s);
        o.pop();
        o.push(s0);
      }
    }
    */
    /// split the entire paragraph at the point of '(&)'
    /// and remove the first one which should be empty
    var text = this.joinPara(para);
    o = text.split('(&)');
    o = o.map(x => x.trim());
    o = o.slice(1);
    /// extract the (1fr) and place them into ww
    var ww = o.map( x => {
      var re = /.*\((\d+)fr\)$/;
      var v = re.exec(x);
      if(v) {
        return parseInt(v[1]);
      } else {
        return 1;
      }
    });
    /// remove any appearances of (1fr) in o
    var o = o.map( x => {
      var re = /(.*)\((\d+)fr\)$/;
      var v = re.exec(x);
      if(v) {
        return v[1].trimRight();
      } else {
        return x;
      }
    });
    return [o,ww];
  }

  isDlstPara(para) {

    if (para.length === 0) {
      return false;
    }
    var s0 = para[0];
    if (this.re_dlst_astr1.test(s0)) {
      return true;
    } else if (this.re_dlst_astr2.test(s0)) {
      return true;
    } else if (this.re_dlst_astr3.test(s0)) {
      return true;
    } 
    return false;
  }

  parseDlstPara(para) {

    var o = [];
    var re1 = this.re_dlst_astr1;
    var re2 = this.re_dlst_astr2;
    var re3 = this.re_dlst_astr3;
    for (var j = 0; j < para.length; ++j) {
      var s = para[j];
      var v;
      if((v=re3.exec(s)) !== null) {
        var bullet = v[1];
        var key    = v[2];
        var text   = v[3];
        var type   = 3;
        var item = {key,text,type};
        o.push(item);
      } else if((v=re2.exec(s)) !== null) {
        var bullet = v[1];
        var key    = v[2];
        var text   = v[3];
        var type   = 2;
        var item = {key,text,type};
        o.push(item);
      } else if((v=re1.exec(s)) !== null) {
        var bullet = v[1];
        var key    = v[2];
        var text   = v[3];
        var type   = 1;
        var item = {key,text,type};
        o.push(item);
      } else {
        if(o.length > 0){
          var item = o.pop();
          item.text = this.joinLine(item.text,s);
          o.push(item);
        }
      }
    }
    return o;
  }

  isTopiPara(para) {

    if (para.length === 0) {
      return false;
    }
    var s0 = para[0];
    if (this.re_dlst_plus.test(s0)) {
      return true;
    }
    return false;
  }

  parseTopiPara(para) {

    var keys = [];
    var v;
    var re = this.re_dlst_plus;
    for (var j = 0; j < para.length; ++j) {
      var s = para[j];
      if((v=re.exec(s)) !== null) {
        var bullet = v[1];
        var key    = v[2];
        keys.push(key);
      } else {
        if(keys.length > 0){
          var key = keys.pop();
          key = this.joinLine(key,s);
          keys.push(key);
        }
      }
    }
    return keys;
  }

  to_numbers(v) {
    var p = json_math.config_numbers[v];
    if (p) {
      return p;
    }
    return '';
  }

  to_numbersep(v) {
    return v;
  }

  to_htmlmathfontrate(bodyfontsize) {
    var v = parseFloat(bodyfontsize);
    if (Number.isFinite(v)) {
      if (v < 1) {
        v = 1;
      }
      return v/12;
    }
    return 1;
  }

  isCaptionPara(para) {
    if (para.length === 0) {
      return false;
    }
    if (this.re_caption_para.test(para[0])) {
      return true;
    }
    return false;
  }

  parseCaptionPara(para) {
    var o = {};
    for (var j=0; j < para.length; ++j) {
      if (j==0) {
        var v = this.re_caption_para.exec(para[j]);
        o.name = v[1].toLowerCase();
        o.caption = v[2];
      } else {
        o.caption = this.joinLine(o.caption,para[j]);
      }
    }
    ///extract the label if any
    v = this.re_label.exec(o.caption);
    if (v) {
      o.caption = v[1].trimRight();
      o.label = v[2];
    }
    return o;
  }

  idenBlocks() {
    var autonum = new NitrilePreviewAutonum(this);
    autonum.idenBlocks(this.blocks,this.config,this.idname,this.isepub);
  }

  isMathPara(para) {

    if(para.length>0 && this.re_math.test(para[0])){
      return true;
    }
    return false;
  }

  parseMathPara(para,fencecmd) {

    /// $ a = \sqrt{2} + \sqrt{3} 
    ///       + \sqrt{4}
    ///
    var re_equalsign = /^(.*?)&=(.*)$/;

    /// form is ''
    var o = [];
    var data = para.map(x=>x);
    var s = data[0];
    var v = this.re_math.exec(s);
    if(v){
      data[0] = v[2];
    }
    data = this.joinPara(data);
    if((v=re_equalsign.exec(data))!==null){
    //if(0){
      data = ['',''];
      data[0] = v[1];
      data[1] = '= ' + v[2];
      fencecmd.isalignequalsign = 1;
    } else {
      data = [data];
    }
    return data;
  }

  isTabbPara(para){

    if(para.length>0 && this.re_tabb.test(para[0])){
      return true;
    }
    return false;

  }

  parseTabbPara(para){

    /// = あ a
    ///   い i
    ///   う u
    ///   え e
    ///   お o
    ///
    /// = か ka
    ///   き ki
    ///   く ku
    ///   け ke
    ///   こ ko

    /// form is ''
    var o = [];
    var data = para.map(x=>x);
    var s = data[0];
    var v = this.re_tabb.exec(s);
    if(v){
      data[0] = v[2];
    }
    var data = data.map(row => this.splitCells(row));
    var ncols = data.reduce((acc,x) => Math.max(acc,x.length),0);
    for (var j=0; j < ncols; j++){
      var items = data.map(x => x[j]||'');
      o.push(items);
    }
    return o;
  }

  is_tabr(para){

    if(para.length>0 && this.re_tabr.test(para[0])){
      return true;
    }
    return false;

  }

  parse_tabr(para){

    /// & ${#tab:a} This is a table.
    ///   ---
    ///   あ a | か ka
    ///   い i | き ki
    ///   う u | く ku
    ///   え e | け ke
    ///   お o | こ ko
    ///

    /// & ${#tab:a} This is a table.
    ///   ---
    ///   あ a   
    ///   い i   
    ///   う u   
    ///   え e   
    ///   お o   
    ///   ---
    ///   か ka
    ///   き ki
    ///   く ku
    ///   け ke
    ///   こ ko
    ///


    /// form is ''
    var lines = para.map(x=>x);
    var s = lines[0];
    var v = this.re_tabr.exec(s);
    if(v){
      lines[0] = v[2];
    }
    lines = lines.map(x => x.trim());
    var re_caption = /^\$\{#([\w\:]+)\}\s*(.*)$/;
    var re_sep = /^[\-]{3,}$/;
    var re_image = /^(\S+)\s*(.*)$/;
    var re_mode = /^\[(.*)\]$/;
    var caption = '';
    var label = '';
    for(var i=0; i < lines.length; ++i){
      var line = lines[i];
      if(i==0){
        if((v=re_caption.exec(line))!==null){
          label = v[1];
          caption = v[2];
          continue;
        } else {
          break;
        }
      }
      if((v=re_sep.exec(line))!==null){
        i++;
        break;
      }
      caption = this.joinLine(caption,line);
    }

    ///remove the caption lines
    lines = lines.slice(i);
    var data = [];

    ///  |Bits   |Description
    /// -|-------|--------------------------------------
    /// 0|0b000  |grayscale
    /// 2|0b010  |red, green and blue: rgb/truecolor
    /// 3|0b011  |indexed: channel containing   
    ///  |       |indices into a palette of colors
    /// 4|0b100  |grayscale and alpha: level of   
    ///  |       |opacity for each pixel
    /// 6|0b110  |red, green, blue and alpha

    if(lines.length && lines[0].indexOf('|') >= 0){
      var lines = lines.map(row => this.splitLineVbars(row));
      var re_bars = /^-+$/;
      lines = lines.filter(x => !re_bars.test(x[0]));
      var ncols = lines.reduce((acc,x) => Math.max(acc,x.length),0);
      for (var j=0; j < ncols; j++){
        var items = lines.map(x => x[j]||'');
        data.push(items);
      }
      return {data,caption,label};
    }

    ///   あ a   
    ///   い i   
    ///   う u   
    ///   え e   
    ///   お o   
    ///   ---
    ///   か ka
    ///   き ki
    ///   く ku
    ///   け ke
    ///   こ ko
    ///

    var items = [];
    for(var i=0; i < lines.length; ++i){
      var line = lines[i];
      if((v=re_sep.exec(line))!==null){
        if(items.length){
          data.push(items);
          items = [];
        }
        continue;
      }
      items.push(line);
    }
    if(1){
      if(items.length){
        data.push(items);
        items = [];
      }
    }
    return {data,caption,label};
  }

  is_pict(para){

    if(para.length>0 && this.re_pict.test(para[0])){
      return true;
    }
    return false;

  }

  parse_pict(para){

    /// @ tree.png (a)
    ///   fish.png (b)
    ///   frog.png (c)
    ///   ---
    ///   [width:.5]
    ///   tree.png (d)
    ///   
    /// or:
    ///
    /// @ ${#fig:a} Trees and fish 
    ///   and frog.
    ///   ---
    ///   tree.png (a)
    ///   fish.png (b)
    ///   frog.png (c)
    ///   ---
    ///   [width:.5]
    ///   tree.png (d)
    ///   
    ///

    /// form is ''
    var mode = {};
    var images = [];
    var lines = para.map(x=>x);
    var s = lines[0];
    var v = this.re_pict.exec(s);
    if(v){
      lines[0] = v[2];
    }
    lines = lines.map(x => x.trim());
    var re_caption = /^\$\{#([\w\:]+)\}\s*(.*)$/;
    var re_sep = /^[\-]{3,}$/;
    var re_image = /^(\S+)\s*(.*)$/;
    var re_mode = /^\[(.*)\]$/;
    var data = [];
    var images = [];
    var mode = {};
    var caption = '';
    var label = '';
    for(var i=0; i < lines.length; ++i){
      var line = lines[i];
      if(i==0){
        if((v=re_caption.exec(line))!==null){
          label = v[1];
          caption = v[2];
          continue;
        } else {
          break;
        }
      }
      if((v=re_sep.exec(line))!==null){
        i++;
        break;
      }
      caption = this.joinLine(caption,line);
    }
    ///slice off caption lines
    lines = lines.slice(i);
    ///now process the rest of the data
    for(var i=0; i < lines.length; ++i){
      var line = lines[i];
      if((v=re_sep.exec(line))!==null){
        if(images.length){
          data.push({mode,images});
          images = [];
          mode = {};
        }
        continue;
      }
      if((v=re_mode.exec(line))!==null){
        mode = this.toStyle(v[1]);
        continue;
      }
      if((v=re_image.exec(line))!==null){
        var src = v[1];
        var sub = v[2];
        images.push({src,sub});
        continue;
      }
    }
    if(1){
      if(images.length){
        data.push({mode,images});
        images = [];
        mode = {};
      }
    }
    return {caption,label,data};
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

  translateBlocks() {

    var dispatch = {
      'HDGS': this.do_hdgs,
      'TEXT': this.do_text,
      'SAMP': this.do_samp,
      'DLST': this.do_dlst,
      'TLST': this.do_tlst,
      'PLST': this.do_plst,
      'HLST': this.do_hlst,
      'TABB': this.do_tabb,
      'VERB': this.do_verb,
      'HRLE': this.do_hrle,
      'TBLR': this.do_tblr,
      'LONG': this.do_long,
      'TABR': this.do_tabr,
      'PICT': this.do_pict,
      'IMGS': this.do_imgs,
      'DIAG': this.do_diag,
      'MATH': this.do_math,
      'QUOT': this.do_quot,
      'FRMD': this.do_frmd
    };

    this.head = '';
    this.xsig0 = '';
    this.needblank = 0;
    for (var block of this.blocks) {
      var {id,row1,row2,sig,dept,level,data,caption,label,idnum,para,subrow,subfname,parser} = block;
      this.block = block;
      var fencecmd = this.updateFencecmd(sig,this.config);
      this.xtrace = fencecmd.trace||'';
      this.xrmap = parser.rmap;
      this.xcssfontsize = fencecmd.cssfontsize||'';
      this.xlatfontsize = fencecmd.latfontsize||'';
      this.xconfontsize = fencecmd.confontsize||'';
      this.xmonospace = fencecmd.monospace||'';
      this.xnumbers = fencecmd.numbers||'';
      this.xwraplines = parseInt(fencecmd.wraplines);
      this.xwraplines = (Number.isFinite(this.xwraplines))?this.xwraplines:0;
      this.xidnum = idnum||'';
      this.xlabel = label||'';
      this.xcaption = caption||'';
      this.caption_text = this.unmask(caption);
      this.latexlabelcmd = this.xlabel?`\\label{${this.xlabel}}`:'';
      this.xsig = sig;
      this.xfencecmd = fencecmd;
      this.xleft=fencecmd.left||'0';
      this.xright=fencecmd.right||'0';
      this.xsubfname=subfname||'';
      this.xrow1=row1||'';
      this.xrow2=row2||'';
      //HTML attributes
      var cssstyles = [];
      cssstyles.push(`margin-left:${this.xleft}mm`);
      cssstyles.push(`margin-right:${this.xright}mm`);
      var htmlattrs = [];
      htmlattrs.push(`id='${id}'`);
      htmlattrs.push(`class='${sig}'`);
      htmlattrs.push(`dept='${dept}'`);
      htmlattrs.push(`subfname='${this.xsubfname}'`);
      htmlattrs.push(`rows='${this.xrow1} ${this.xrow2}'`);
      this.xattr=htmlattrs.join(' ');
      this.xstyle=cssstyles.join(';');
      /// turn off showing of blocks if outlineviewing is on
      if (this.ispreview && typeof subrow==='number') {
        if (sig === 'PART') {
        } else if (sig === 'HDGS') {
        } else if (editorcolumn==0 && editorrow==subrow) {
        } else {
          ///do not show this block
          block.html = '';
          continue;
        }
      }
      /// call the dispatch function
      if (dispatch[sig]) {
        var func = dispatch[sig];
        func.call(this,block);
      }
      /// save the current sig string so that
      /// the next block can check
      this.xsig0 = sig;
    }
  }

  toCssFontsize(fs){
    return this.tokenizer.toCssFontsize(fs);
  }

  toLatexFontsize(fs){
    return this.tokenizer.toLatexFontsize(fs);
  }

  isHeaderEmpty(header) {
    header = header.filter(x => (x.length > 0) ? true : false);
    if (header.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  setError(str) {
    var o = [];
    o.push(this.new_hdgs_block(str));
    this.blocks = o;
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
      var fsubfname = path.join(dirname,fname);
    } else {
      var fsubfname = fname;
    }
    var out = await this.readFileAsync(fsubfname);
    var lines = out.split('\n');
    this.fname = fname;
    this.readFromLines(lines);
  }

  toConfigLines(){
    const config = this.config;
    var mylines = [];
    for(var key1 in config) {
      if (config.hasOwnProperty(key1)) {
        var obj = config[key1];
        if (typeof obj === 'object') {
          for(var key2 in obj) {
            if (obj.hasOwnProperty(key2)) {
              mylines.push(`% ${key1}.${key2} = ${obj[key2]}`);
            }
          }
        }
      }
    }
    return mylines;
  }

  tofName(){
    return path.basename(this.fname);
  }

  addItem(base,top,type,mydesc,rmap) {
    /// "節約する","せつやくする","vsuru"
    let item = [base,top,mydesc];
    var o = rmap;
    if(type==='vsuru') {
      o.push(item);
      ///o.push([base.slice(0,base.length-2),top.slice(0,top.length-2),mydesc]);
      var suffixes = [
            'して',
            'し',
            ''
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-2)}${suffix}`,`${top.slice(0,top.length-2)}${suffix}`,mydesc]);
      }
    }
    else if(type==='v1') {
      o.push(item);
      ///o.push([base.slice(0,base.length-1),top.slice(0,top.length-1),mydesc]);
      var suffixes = [
            'ます',
            'た',
            'ました',
            'て',
            'られ',
            'させ',
            'させられ',
            'ろ',
            'ない',
            'ません',
            'なかった',
            'ませんでした',
            'なくて',
            'るな',
            ''
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`,mydesc]);
      }
    }
    else if(type==='v5m') {
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
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`,mydesc]);
      }
    }
    else if(type==='v5b') {
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
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`,mydesc]);
      }
    }
    else if(type==='v5n') {
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
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`,mydesc]);
      }
    }
    else if(type==='v5s') {
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
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`,mydesc]);
      }
    }
    else if(type==='v5g') {
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
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`,mydesc]);
      }
    }
    else if(type==='v5k') {
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
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`,mydesc]);
      }
    }
    else if(type==='v5r') {
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
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`,mydesc]);
      }
    }
    else if(type==='v5t') {
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
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`,mydesc]);
      }
    }
    else if(type==='v5u') {
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
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`,mydesc]);
      }
    }
    else if(type==='adji') {
      o.push(item);
      var suffixes = [
          '\u304b\u3063\u305f', //かった
          '\u304f', //く
          '\u3055', //さ
          '\u307f', //み
          'む',
          '\u305d\u3046'  //そう
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`,mydesc]);
      }
    }
    else {
      o.push(item);
    }
    return o;
  }

  getMode1SampPara(para){
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

}

module.exports = { NitrilePreviewParser };
