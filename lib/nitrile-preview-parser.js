'use babel';

const fs = require('fs');
const path = require('path');
const json_rubyitems = require('./nitrile-preview-rubyitems.json');
const json_math = require('./nitrile-preview-math.json');
const entjson = require('./nitrile-preview-entity.json');
const { NitrilePreviewAutonum } = require('./nitrile-preview-autonum');
const N_sampspaces = 1;
const char_widths = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.2796875,0.2765625,0.3546875,0.5546875,0.5546875,0.8890625,0.665625,0.190625,0.3328125,0.3328125,0.3890625,0.5828125,0.2765625,0.3328125,0.2765625,0.3015625,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.2765625,0.2765625,0.584375,0.5828125,0.584375,0.5546875,1.0140625,0.665625,0.665625,0.721875,0.721875,0.665625,0.609375,0.7765625,0.721875,0.2765625,0.5,0.665625,0.5546875,0.8328125,0.721875,0.7765625,0.665625,0.7765625,0.721875,0.665625,0.609375,0.721875,0.665625,0.94375,0.665625,0.665625,0.609375,0.2765625,0.3546875,0.2765625,0.4765625,0.5546875,0.3328125,0.5546875,0.5546875,0.5,0.5546875,0.5546875,0.2765625,0.5546875,0.5546875,0.221875,0.240625,0.5,0.221875,0.8328125,0.5546875,0.5546875,0.5546875,0.5546875,0.3328125,0.5,0.2765625,0.5546875,0.5,0.721875,0.5,0.5,0.5,0.3546875,0.259375,0.353125,0.5890625];

//const re_jpchar = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/g;
const re_jpchar = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\u4E00-\u9FFF]/;

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
const re_fence = /^\s*(`{3,})\s*(\w*)$/u;
const re_tilda = /^\s*(~{3,})\s*(\w*)$/u;
const re_sep = /^\s*(-{3,})$/u;
const re_indented = /^\s/;
const re_unmask = /`([^`]+)`|``([^`]+)``|```([^`]+)```|(?<!\w)\\(\w+)\{([^\{\}]+)\}/g;
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

class NitrilePreviewParser {

  constructor(name) {
    this.contentBlockCount = 0; /// the accumulating count of content blocks for this dept

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
    this.name = name;//LATEX,CONTEX,HTML,EPUB
    this.re_unmask_1 = /^&(.*)$/;/// ENTITY: [[&deg;]] or [[&amp;]]
    this.re_unmask_2 = /^(.*?)\u{30fb}(.*)$/u;/// RUBY: [[簡単・かんたん^]]
    this.re_unmask_3 = /^#(\S+)$/;/// REF: [[#myfigure]]
    this.re_leading_space = /^\s+(.*)$/;
    this.unicode_right_arrow = String.fromCharCode(8594);
    this.config = this.newConfig();
    this.blocks = [];///all blocks
    this.block = {};///the active block
    this.mode = [];
    this.rmap = [];
    this.notes = new Map();///stores all the NODE block
    this.fname = '';///the filename metadata
    this.idname = '';///used to prefix all block's id attribute
    this.editorrow = -1;///
    this.editorcolumn = -1;
    this.isepub = 0;///set to 1 to indicate that it is for EPUB
    this.iscaption = 0;///set to 1 for typesetting caption
    this.ispreview = 0;///set to 1 for preview in Atom
    this.ismaster = 0;///set to 1 if this document is detected to be a master document
    this.root = '';///set by %^root=
    this.only = '';///set by %^only=
    this.outfname = '';
  }

  conf(key){
    return this.config[this.name][key];
  }

  newConfig() {

    /// initialize a new config object
    var config = {};

    /// All the layout dimensions are in 'mm'
    config.CONTEX = {};
    config.CONTEX.title = '';
    config.CONTEX.author = '';
    config.CONTEX.backspace=40;//left margin
    config.CONTEX.cutspace=40;//right margin
    config.CONTEX.width=130;
    config.CONTEX.topspace=20;
    config.CONTEX.header=10;
    config.CONTEX.footer=0;
    config.CONTEX.height=250;
    config.CONTEX.bodyfontsizept=11;
    config.CONTEX.diagfontsizept=12;
    config.CONTEX.papersize='A4';///210 x 297
    config.CONTEX.distance=2;///inter-image dist in percentage of page width for PICT
    config.CONTEX.twocolumn=0;///set to 1 to enable
    config.CONTEX.maxn=44;//maximum line number for each "float" Program
    config.CONTEX.chapter = '\\bfc';
    config.CONTEX.section = '\\bfb';
    config.CONTEX.subsection = '\\bfa';
    config.CONTEX.subsubsection = '\\bold';
    config.CONTEX.subsubsubsection = '\\bold';
    config.CONTEX.toc=0;///when set to 1 '\placecontent' will be inserted
    config.CONTEX.docstyle=0;///0=auto;1=article;2=report
    config.CONTEX.frontpage=0;//1=title page will be generated
    config.CONTEX.trace=0;
    config.CONTEX.step=5;//5mm left-padding for some
    config.CONTEX.nicaption='sm';
    config.CONTEX.nipass='sm';
    config.CONTEX.nisamp='sm';
    config.CONTEX.nitabr='sm';
    config.CONTEX.nilong='sm';
    config.CONTEX.nitabb='sm';
    config.CONTEX.nitabu='sm';
    config.CONTEX.niprog='xsm';
    config.CONTEX.longpadding='1 3';
    config.CONTEX.longvlines='*';
    config.CONTEX.longhlines='t m b r';
    config.CONTEX.autonum=0;

    /// All the layout dimensions are in 'mm'
    config.PDFLATEX = {};
    config.PDFLATEX.title = '';
    config.PDFLATEX.author = '';
    config.PDFLATEX.leftmargin=40;
    config.PDFLATEX.rightmargin=40;
    config.PDFLATEX.topmargin=20;
    config.PDFLATEX.bodyfontsizept='';
    config.PDFLATEX.diagfontsizept=12;
    config.PDFLATEX.papersize='a4paper';
    config.PDFLATEX.twoside=0;///set to '1' to enable
    config.PDFLATEX.twocolumn=0;///set to '1' to enable
    config.PDFLATEX.toc=0;///when set to 1 '\tableofcontents' will be inserted
    config.PDFLATEX.documentclass='';///set to 'book','scrbook', etc.
    config.PDFLATEX.docstyle=0;///0=auto;1=article;2=report
    config.PDFLATEX.frontpage=0;//1=title page will be generated
    config.PDFLATEX.maxn=44;//maximum line number for each "float" Program
    config.PDFLATEX.step=5;//5mm left-padding for some
    config.PDFLATEX.nipass='small';
    config.PDFLATEX.nisamp='small';
    config.PDFLATEX.nitabr='small';
    config.PDFLATEX.nilong='small';
    config.PDFLATEX.nitabb='small';
    config.PDFLATEX.nitabu='small';
    config.PDFLATEX.nicaption='small';
    config.PDFLATEX.niprog='footnotesize';
    config.PDFLATEX.extra='';
    config.PDFLATEX.autonum=0;

    /// All the layout dimensions are in 'mm'
    config.LUALATEX = {};
    config.LUALATEX.title = '';
    config.LUALATEX.author = '';
    config.LUALATEX.leftmargin=40;
    config.LUALATEX.rightmargin=40;
    config.LUALATEX.topmargin=20;
    config.LUALATEX.bodyfontsizept='';
    config.LUALATEX.diagfontsizept=12;
    config.LUALATEX.papersize='a4paper';
    config.LUALATEX.twoside=0;///set to '1' to enable
    config.LUALATEX.twocolumn=0;///set to '1' to enable
    config.LUALATEX.toc=0;///when set to 1 '\tableofcontents' will be inserted
    config.LUALATEX.documentclass='';///set to 'book','scrbook', etc.
    config.LUALATEX.docstyle=0;///0=auto;1=article;2=report
    config.LUALATEX.frontpage=0;//1=title page will be generated
    config.LUALATEX.maxn=44;//maximum line number for each "float" Program
    config.LUALATEX.step=5;//5mm left-padding for some
    config.LUALATEX.nipass='small';
    config.LUALATEX.nisamp='small';
    config.LUALATEX.nitabr='small';
    config.LUALATEX.nilong='small';
    config.LUALATEX.nitabb='small';
    config.LUALATEX.nitabu='small';
    config.LUALATEX.nicaption='small';
    config.LUALATEX.niprog='footnotesize';
    config.LUALATEX.extra='';
    config.LUALATEX.autonum=0;

    /// All the layout dimensins are in 'mm'
    config.HTML = {};
    config.HTML.title = '';
    config.HTML.author = '';
    config.HTML.step=2;//similar to CONTEX.step but specifing in 'em'
    config.HTML.mathfontsizept=12;
    config.HTML.diagfontsizept=12;
    config.HTML.css='';//to be added using +=
    config.HTML.width=130;///130mm textwidth in MAIN element
    config.HTML.margin=4;///4mm margins left/right/top/bottom for MAIN element
    config.HTML.leftmargin=44;
    config.HTML.rightmargin=44;
    config.HTML.topmargin=30;
    config.HTML.toc=0;///when set to 1 a customized TOC will be inserted

    /// All the layout dimensins are in 'mm'
    config.EPUB = {};
    config.EPUB.title = '';
    config.EPUB.author = '';
    config.EPUB.step=2;//similar to CONTEX.step but specifing in 'em'
    config.EPUB.mathfontsizept=12;
    config.EPUB.diagfontsizept=12;
    config.EPUB.css='';//to be added using +=

    /// All the layout dimensions are in 'mm'
    config.MEMOR = {};
    config.MEMOR.title = '';
    config.MEMOR.author = '';
    config.MEMOR.leftmargin=40;
    config.MEMOR.rightmargin=40;
    config.MEMOR.topmargin=20;
    config.MEMOR.bodyfontsizept='';
    config.MEMOR.diagfontsizept=12;
    config.MEMOR.papersize='a4paper';
    config.MEMOR.twoside=0;///set to '1' to enable
    config.MEMOR.twocolumn=0;///set to '1' to enable
    config.MEMOR.toc=0;///when set to 1 '\tableofcontents' will be inserted
    config.MEMOR.documentclass='';///set to 'book','scrbook', etc.
    config.MEMOR.docstyle=0;///0=auto;1=article;2=report
    config.MEMOR.frontpage=0;//1=title page will be generated
    config.MEMOR.maxn=44;//maximum line number for each "float" Program
    config.MEMOR.step=5;//5mm left-padding for some
    config.MEMOR.nipass='small';
    config.MEMOR.nisamp='small';
    config.MEMOR.nitabr='small';
    config.MEMOR.nilong='small';
    config.MEMOR.nitabb='small';
    config.MEMOR.nitabu='small';
    config.MEMOR.nicaption='small';
    config.MEMOR.niprog='footnotesize';
    config.MEMOR.extra='';
    config.MEMOR.autonum=0;

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
    while (nlines < lines.length) {

      var block  = this.read_para(lines,nlines);
      var para = block.para;
      var sig = block.sig;

      /// increment block count
      var nread = para.length;
      row1 = nlines;
      nlines += nread;
      row2 = nlines;

      block.row1 = row1;
      block.row2 = row2;
      block.parser = this;

      if(sig=='SAMP'){
    
        /// merge multiple 'SAMP' 

        if(sig0=='SAMP'){

          var blk = o.pop();
          blk.body.push('');
          blk.body = blk.body.concat(block.body);
          blk.para = blk.para.concat(block.para);
          blk.row2 = block.row2;
          o.push(blk);
        } else {
          o.push(block);
        }

      } else if(sig == 'TEXT'){

        /// if it contains a single math expression, then 
        /// we treat it as a display math
        
        var {text} = block;
        var re_dmat = /^``([^`]+)``$/;
        if((v=re_dmat.exec(text))!==null){
          sig = 'MATH';
          block.sig = sig;
          block.math = v[1];
          block.more = [];
        }
        o.push(block);

      } else if(sig == 'PLST'){

        /// merge multiple 'LONG'
        
        if(sig0 == 'PLST'){

          var blk = o.pop();
          blk.body = blk.body.concat(block.body);
          blk.items = this.parse_plst(blk.body); 
          blk.para = blk.para.concat(block.para);
          blk.row2 = block.row2;
          blk.isbroad = 1;
          o.push(blk);
        } else {
          o.push(block);
        }

      } else if(sig == 'LONG'){

        /// merge multiple 'LONG'

        var {pp,ww} = block.data;
        if(sig0 == 'LONG'){

          var blk = o.pop();
          blk.rows.push(pp);
          blk.para = blk.para.concat(block.para);
          blk.row2 = block.row2;
          o.push(blk);
        } else {
          block.rows = [];
          block.rows.push(pp);
          block.ww = ww;
          o.push(block);
        }

      } else if(sig == 'TABB'){

        /// merge multiple 'TABB'

        var {pp,ww} = block.data;
        if(sig0 == 'TABB'){

          var blk = o.pop();
          blk.rows.push(pp);
          blk.para = blk.para.concat(block.para);
          blk.row2 = block.row2;
          o.push(blk);
        } else {
          block.rows = [];
          block.rows.push(pp);
          block.ww = ww;
          o.push(block);
        }

      } else if(sig == 'DLST'){

        /// merge multiple 'DLST'

        if(sig0 == 'DLST'){

          var blk = o.pop();
          blk.items = blk.items.concat(block.items);
          blk.para = blk.para.concat(block.para);
          blk.row2 = block.row2;
          o.push(blk);
        } else {
          o.push(block);
        }

      } else if(sig == 'MATH'){

        /// merge multiple 'MATH'

        if(sig0 == 'MATH'){

          var blk = o.pop();
          blk.row2 = block.row2;
          blk.para = blk.para.concat(block.para);
          var math = block.math;
          var label = block.label;
          blk.more.push({math,label});
          o.push(blk);

        } else {

          block.more = [];
          o.push(block);

        }

      } else if (sig) {

        /// 'sig' must *not* be empty

        o.push(block);
      }

      /// assign the last sig
      sig0 = sig;
    }

    /// assign to 'this.blocks'
    this.blocks = o;
  }

 
  read_para (lines,n) {
    let n0 = n;

    /// @ ${#fig:a} 
    ///   This is caption text.
    ///   ``` framed
    ///   data ...
    ///   data ...
    ///
    ///   data ...
    ///   data ...
    ///   ```
    ///

    /// @ ${#fig:a} 
    ///   This is caption text.
    ///   --- 
    ///   data ...
    ///   data ...
    ///

    /// @ Table ${#fig:a} 
    ///   This is caption text.
    ///
    ///   Color option       |CH  |   |   |   |    |
    ///   -------------------|----|---|---|---|----|----
    ///                      |    |1  |2  |4  |8   |16
    ///   Indexed            |1   |1  |2  |4  |8   |x
    ///   Grayscale          |1   |1  |2  |4  |8   |16
    ///   Grayscale and alpha|2   |x  |x  |x  |16  |32
    ///   Truecolor          |3   |x  |x  |x  |24  |48
    ///   Truecolor and alpha|4   |x  |x  |x  |32  |64

    /// Normal text paragram
    /// that ends with a blank line.
    ///

    ///   Following are samples.
    ///   console.log(...)
    ///   console.log(...)
    ///   console.log(...)
    ///   

    /// + HLST    
    /// + HLST    

    /// - PLST    
    /// - PLST    
    /// 1) PLST    
    /// 2) PLST    
    /// 1. PLST    
    /// 2. PLST    

    /// -- ILST    
    /// -- ILST    

    /// * DLST    
    /// * DLST    

    /// (&) LONG    
    /// (&) LONG    

    /// List of symbols at the start
    /// @ = & > # $ %

    var bull = '';
    var body = [];
    var para = [];
    var label = '';
    var islabeled = 0;
    var caption = '';
    var iscaption = 0;
    var fenceid = '';
    var isspcl = 0;
    var type = '';
    var sig = '';
    var hdgn = '';
    var sig = '';
    var data;
    var text;
    var gather;
    var wide;
    var float;
    var v;
    var re_sub = /^h(\d*)$/i;

    /// read blank lines or TEX-comment lines

    for (; n < lines.length; ++n) {
      var line = lines[n];
      line = line.trimRight();
      if((v=re_comm.exec(line))!==null){
        var nitrile_line = v[1];
        if ((v = re_nitrilemode.exec(nitrile_line)) !== null) {
          var key = v[1];
          var val = v[2];
          if(key==='rmap'){
            let name='rmap';
            let subf=val;
            this.mode.push({name,subf});
          }else if(key==='root'){
            this.root = val;
          }else if(key==='only'){
            this.only = val;
          }else if(key==='part'){
            let name='part';
            let text=val;
            this.mode.push({name,text});
          }else if(re_sub.test(key)){
            let myv = re_sub.exec(key);
            let name='h';
            let subn=parseInt(myv[1]||0);
            let subf=val;
            this.mode.push({name,subn,subf});
          }
          continue;
        }
        if ((v = re_nitrileitem.exec(nitrile_line)) !== null) {
          var rb = v[1];
          var rt = v[2];
          this.rmap.push([rb,rt]);
          continue;
        }
        if ((v = re_nitrileconf.exec(nitrile_line)) !== null) {
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
        if ((v = re_nitrileconf_plus.exec(nitrile_line)) !== null) {
          var key1 = v[1];
          var key2 = v[2];
          var val = v[3];
          key1 = key1.toUpperCase();
          key2 = key2.toLowerCase();
          if (this.config.hasOwnProperty(key1) && this.config[key1].hasOwnProperty(key2)) {
            var val0 = this.config[key1][key2];
            val0 = val0||'';
            if(val0){
              val0 = `${val0}\t${val}`;//always insert a newline
              this.config[key1][key2] = val0;
            }else{
              this.config[key1][key2] = val;//first entry
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

    /// read body                   

    for (let i=0; n < lines.length; ++i,++n) {
      var line = lines[n];
      line = line.trimRight();
      if(i==0 && (v=re_spcl.exec(line))!==null){
        isspcl = 1;
        iscaption = 1;
        caption = '';
        label = '';
        float=1;
        type = 'spcl';
        bull = v[1];
        fenceid = v[2].toLowerCase();
        let s = v[3];
        if(bull.length==2){
          wide=1;
        }
        if((v=re_labeled.exec(s))!==null){
          islabeled = 1;
          label = v[1];
          caption = v[2];
        } else {
          caption = s;
        }
        continue;
      }
      if(i==0 && (v=re_hdgs.exec(line))!==null){
        type = 'hdgs';
        bull = v[1];
        let s = v[2];
        if((v=re_labeled.exec(s))!==null){
          islabeled = 1;
          label = v[1];
          text = v[2];
        } else {
          text = s;
        }
        hdgn = bull.length;
        if(n==0){
          //if n==0 then it is at the first line of the file
          /// we treat it as HDGS/0
          hdgn=0;
        }
        n++;
        break;
      }
      if(i==0 && (v=re_hrle.exec(line))!==null){
        type = 'hrle';
        text = v[0];
        n++;  
        break;
      }
      if(i==0 && (v=re_math.exec(line))!==null){
        type = 'math';
        bull = v[1];
        let s = v[2];
        if(bull=='$$') {wide = 1}
        if((v=re_labeled.exec(s))!==null){
          islabeled = 1;
          label = v[1];
          body.push(v[2]);///first line of math block
        } else {
          body.push(s);///first line of math block
        }
        continue;
      }
      if(i==0 && (v=re_quot.exec(line))!==null){
        type = 'quot';
        bull = v[1];
        let s = v[2];
        body.push(s);///first line of quot block
        continue;
      }
      if(i==0 && (v=re_plst.exec(line))!==null){
        type = 'plst';
        body.push(line);
        continue;  
      }
      if(i==0 && (v=re_hlst.exec(line))!==null){
        type = 'hlst';
        body.push(line);
        continue;  
      }
      if(i==0 && (v=re_dlst.exec(line))!==null){
        type = 'dlst';
        body.push(line);
        continue;  
      }
      if(i==0 && (v=re_long.exec(line))!==null){
        type = 'long';
        body.push(line);
        continue;  
      }
      if (i==0 && (v=re_tabb.exec(line))!==null){
        type = 'tabb';
        body.push(line);
        continue;
      }
      if (i==0 && (v=re_tabu.exec(line))!==null){
        type = 'tabu';
        body.push(v[2]);
        continue;
      }
      if(i==0 && (v=re_samp.exec(line))!==null){
        type = 'samp';
        body.push(line);
        continue;  
      }
      if(i==0 && (v=re_pass.exec(line))!==null){
        bull = v[1];
        type = 'pass';
        body.push(v[2]);
        continue;  
      }
      if(i==0 && (v=re_note.exec(line))!==null){
        type = 'note';
        body.push(v[2]);
        continue;  
      }
      if(i==0){
        type = 'text';
        body.push(line);
        continue;  
      }
      ///from here it is the second line or forward
      if(isspcl){
        if(line.length > 0){
          if(!re_indented.test(line)){
            break;
          }
        }
        if(iscaption && line.length==0){
          iscaption = 0;
        }else if(iscaption){
          caption = this.joinLine(caption,line);
        }else{
          body.push(line);//must also include blank lines
        }
        continue;
      }
      if(line.length==0){
        break;
      }
      body.push(line);
      continue;
    }

    /// post-processing of 'body'

    para = lines.slice(n0, n);
    sig = type.toUpperCase();

    /// parse 'body'
    
    if(type == 'spcl'){
      if(fenceid == 'framed'){
        sig = 'FRMD';
        body = this.trim_samp_body(body);
        return {para,sig,wide,float,caption,label,islabeled,body};
      } 
      else if (fenceid == 'listing' || fenceid == 'program'){
        body = this.trim_samp_body(body);
        sig = 'PROG';
        return {para,sig,wide,float,caption,label,islabeled,body};
      } 
      else if (fenceid == 'diagram'){
        sig = 'DIAG';
        body = this.join_backslashed_lines(body);
        body = this.trim_left(body);
        return {para,sig,wide,float,caption,label,islabeled,body};
      } 
      else if (fenceid == 'table'){
        sig = 'TABR';
        cols = this.parse_tabr(body);
        return {para,sig,wide,float,caption,label,islabeled,cols,body};
      } 
      else if (fenceid == 'image'){
        sig = 'PICT';
        var rows = this.parse_pict(body);
        return {para,sig,wide,float,caption,label,islabeled,rows,body};
      }
      else {//treat it as listing
        body = this.trim_samp_body(body);
        sig = 'PROG';
        return {para,sig,wide,float,caption,label,islabeled,body};
      }
    } 
    else if (type == 'tabu'){
      var cols = this.parse_tabu(body);
      return {para,sig,caption,label,islabeled,cols,body};
    }
    else if(type == 'math'){
      var math = this.parse_math(body);
      return {para,sig,label,islabeled,math,wide,body};
    }
    else if(type == 'hdgs'){
      return {para,sig,hdgn,label,islabeled,text,body};
    } 
    else if(type == 'quot'){
      text = this.joinPara(body);
      return {para,sig,text,body};
    }
    else if(type == 'plst'){
      var items = this.parse_plst(body);
      return {para,sig,items,body};
    }
    else if(type == 'hlst'){
      var items = this.parse_hlst(body);
      return {para,sig,items,body};
    }
    else if(type == 'dlst'){
      var items = this.parse_dlst(body);
      return {para,sig,items,body};
    }
    else if(type == 'nlst'){
      return {para,sig,bull,body};
    }
    else if(type == 'long'){
      data = this.parse_long(body);
      return {para,sig,data,body};
    }
    else if(type == 'tabb'){
      data = this.parse_tabb(body);
      return {para,sig,data,body};
    }
    else if(type == 'samp'){
      if(this.is_samp_body(body)){//all lines has to be indented
        body = this.trim_samp_body(body);
        return {para,sig,body};
      }else{
        sig='TEXT';
        text = this.joinPara(body);
        return {para,sig,text,body};
      }
    } 
    else if(type == 'pass'){
      body = this.trim_pass_body(body);
      if(bull.length==2){
        let s = this.joinPara(body);
        body = [s];
      }
      return {para,sig,body};
    } 
    else if(type == 'text'){
      ///for a special case, if the TEXT block is at line
      ///1 and there is only one line, we will treat it
      ///as a HDGS/0 block. The check of n0==0 && n==1 ensures that
      ///there is only one line, and it is the first line of the document
      if(body.length==1 && n0==0 && n==1){
        sig = 'HDGS';
        hdgn = 0;
        text = body.join('');
        return {para,sig,hdgn,text,body};
      } 
      else {
        var {leadn,lead,text} = this.parse_text(body);
        return {para,sig,leadn,lead,text,body};
      }
    } 
    else if(type == 'note'){
      let name = body[0];
      body = body.slice(1);
      this.notes.set(name,body);
      sig = '';
      return {para,sig};///empty sig so it will be ignored
    }
    else if(type == 'hrle'){
      return {para,sig,text,body};
    }
    else if(type){
      console.log(`unhandled type: (${type})`);
      console.log(para);
      return {para,sig,body};
    }
    else {
      ///note that a type='' could happen in two circumstances:
      /// 1)the last few lines of a document; or
      /// 2)when the entire doucment such as a master 
      ///   document where everything is a TEX comment
      return {para,sig,body};
    }

  }

  parse_text(para) {
    var v1;
    var v2;
    var v3;
    if ((v1 = re_prim.exec(para[0])) !== null ||
        (v2 = re_seco.exec(para[0])) !== null ||
        (v3 = re_thrd.exec(para[0])) !== null) {
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
      for (let i = 1; i < para.length; ++i) {
        text = this.joinLine(text, para[i]);
      }
    } else {
      text = this.joinPara(para);
    }
    return { leadn, lead, text };
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

      } 
      start_i = re_unmask.lastIndex;
    }
    cnt = line.slice(start_i);
    cnt = this.escape(cnt);
    newtext += cnt;
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

  is_samp_body(body){
    var re = /^\s/;
    return body.every(x => re.test(x));
  }

  trim_samp_body (para) {

    if(para.length==0){
      return para;
    }

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

    /// now trim of the left n character 
    para = this.trimParaAt(para,n0);

    // now remove the top and bottom empty lines
    while(para.length > 0){
      if(para[0].length==0){
        para.shift();
      } else {
        break;
      }
    }
    while(para.length > 0){
      if(para[para.length-1].length==0){
        para.pop();
      } else {
        break;
      }
    }
    return para;
  }

  trim_pass_body(para) {

    if(para.length==0){
      return para;
    }

    para = para.map(x => x.trimLeft());
    return this.join_backslashed_lines(para);
  }

  trim_diag_body(para) {
    
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
    o = o.map(x => this.get_braced_text(x));
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

  parse_plst_old (para) {
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
    const re_leadspaces = /^(\s*)(.*)$/;
    //
    //var re = /^(\s*)(\+|\-|\*|\d+\.)\s+(.*)$/;
    //
    var re = /^(\s*)/;
    for (var line of para) {
      v = re_leadspaces.exec(line);
      if (v) {
        lead = v[1];
        line = v[2];
      } else {
        lead = '';
      }
      v = re_plst.exec(line);
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

  parse_ilst (para) {
    var items = [];
    var v;
    var re_item = /^(.*?)(?<!\S)([:\-])\s+(.*)$/;
    var re_word = /^(\S+)\s*(.*)$/;
    for (var line of para) {
      if((v = re_ilst.exec(line))!==null){
        var bull = v[1];
        var type = 0;
        if(bull=='--') {type=1}
        else if(bull=='++') {type=2}
        else if(bull=='**') {type=3}
        var text = v[2];
        items.push({bull,type,text});
        continue;
      } 
      var item = items.pop();
      item.text = this.joinLine(item.text,line);
      items.push(item);
    }
    items = items.map(item => {
      var dt = '';
      var sep = '';
      var {text} = item;
      if((v = re_item.exec(text))!==null){
        item.dt = v[1].trim();
        item.sep = v[2].trim();
        item.text = v[3].trim();
      }
      else if((v = re_word.exec(text))!==null){
        item.dt = v[1].trim();
        item.text = v[2].trim();
      }
      return item;
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

  trim_left(para){
    return para.map(x => x.trimLeft());
  }

  join_backslashed_lines (para) {
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

  async readModeAsync(dirname) {
    let all = [];
    /// get dirname
    if(!dirname){
      dirname = path.dirname(this.fname);
    }
    /// if there is a root then read this root
    if(this.root && !this.only){
      var rootparser = new NitrilePreviewParser();
      await rootparser.readFromFileAsync(this.root,dirname);
      this.mode = rootparser.mode;
      this.config = rootparser.config;
      this.rmap = rootparser.rmap;
      this.blocks = rootparser.blocks;
      this.ismaster = 1;
      this.outfname = this.root;
    }else if(this.root && this.only){
      var rootparser = new NitrilePreviewParser();
      await rootparser.readFromFileAsync(this.root,dirname);
      this.config = rootparser.config;
      this.rmap = rootparser.rmap.concat(this.rmap);
      this.blocks.forEach((x,i) => {x.name='h'; x.subn=0; x.seqn=i});
      this.ismaster = 1;
      this.outfname = this.root;
    }
    /// read all this.mode
    for( var d of this.mode ) {
      let { subf } = d;
      if(subf){
        d.subparser = new NitrilePreviewParser();
        all.push( d.subparser.readFromFileAsync(subf,dirname) );
      }
    }
    /// wait for all
    await Promise.all(all);
    /// at this point all sub-documents are read from disk
    for(let d of this.mode){
      let {name,subn,text,subf,subparser} = d;
      if(name==='rmap'){
        for(let m of subparser.rmap){
          this.rmap.push(m);
        }
      }else if(name==='part'){
        let sig='HDGS';
        let hdgn=0;
        this.blocks.push({sig,name,hdgn,text});
        this.ismaster = 1;
      }else if(name==='h' && subparser){
        /// this is the master
        /// all rmap entries of current to the end of the child 
        for(let m of this.rmap){
          subparser.rmap.push(m);
        }
        console.log('importing',subf);
        subparser.blocks.forEach((x,i) => {
          x.name=name;
          x.subf=subf;
          x.subn=subn;
          x.seqn=i;
          this.blocks.push(x);
        });
        this.ismaster = 1;
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

  parse_tabular (para) {

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

  parse_para_tabular(para) {
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

  parse_line_tabular(para) {

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

  parse_long(para) {

    var re_fr = /(.*)\$\((\d+)fr\)$/;
    var items = [];
    var v;
    var re = re_long;
    for (var j = 0; j < para.length; ++j) {
      var s = para[j];
      if ((v = re.exec(s)) !== null) {
        var bullet = v[1];
        var key = v[2];
        items.push(key);
      } else {
        if (items.length > 0) {
          var key = items.pop();
          key = this.joinLine(key, s);
          items.push(key);
        }
      }
    }
    /// extract the $(1fr) and place them into ww
    var ww = items.map(x => {
      var v = re_fr.exec(x);
      if (v) {
        return parseInt(v[2]);
      } else {
        return 1;
      }
    });
    /// remove any appearances of (1fr) in o
    var pp = items.map(x => {
      var v = re_fr.exec(x);
      if (v) {
        return v[1].trimRight();
      } else {
        return x;
      }
    });
    return { pp, ww };
  }

  parse_tabb(para) {

    var items = [];
    var v;
    var re = re_tabb;
    for (var j = 0; j < para.length; ++j) {
      var s = para[j];
      if ((v = re.exec(s)) !== null) {
        var bullet = v[1];
        var key = v[2];
        items.push(key);
      } else {
        if (items.length > 0) {
          var key = items.pop();
          key = this.joinLine(key, s);
          items.push(key);
        }
      }
    }
    /// extract the (1fr) and place them into ww
    var ww = items.map(x => {
      var re = /.*\((\d+)fr\)$/;
      var v = re.exec(x);
      if (v) {
        return parseInt(v[1]);
      } else {
        return 1;
      }
    });
    /// remove any appearances of (1fr) in o
    var pp = items.map(x => {
      var re = /(.*)\((\d+)fr\)$/;
      var v = re.exec(x);
      if (v) {
        return v[1].trimRight();
      } else {
        return x;
      }
    });
    return { pp, ww };
  }

  parse_dlst(para) {

    const re_dlst_text_brace  = /^(\*)\s+\{\s(.*?)\s\}\s*(.*)$/u;
    const re_dlst_text_word   = /^(\*)\s+(\S+)\s*(.*)$/u;
    const re_dlst_var    = /^(\*)\s+`([^`]+)`\s*(.*)$/u;
    const re_dlst_math   = /^(\*)\s+``([^`]+)``\s*(.*)$/u;
    const re_dlst_code   = /^(\*)\s+```([^`]+)```\s*(.*)$/u;
    const re_dlst_quot   = /^(\*)\s+"(.*?)"\s*(.*)$/u;
    const re_dlst_rmap   = /^(\*)\s+(\S+)(\u{30fb})(\S+)\s*(.*)$/u;

    var o = [];
    for (var j = 0; j < para.length; ++j) {
      var s = para[j];
      var v;
      if((v=re_dlst_quot.exec(s)) !== null) {
        var bullet = v[1];
        var key    = v[2];
        var text   = v[3];
        var type   = 'quot';
        var item = {key,text,type};
        o.push(item);
      } else if((v=re_dlst_var.exec(s)) !== null) {
        var bullet = v[1];
        var key    = v[2];
        var text   = v[3];
        var type   = 'var';
        var item = {key,text,type};
        o.push(item);
      } else if((v=re_dlst_math.exec(s)) !== null) {
        var bullet = v[1];
        var key    = v[2];
        var text   = v[3];
        var type   = 'math';
        var item = {key,text,type};
        o.push(item);
      } else if((v=re_dlst_code.exec(s)) !== null) {
        var bullet = v[1];
        var key    = v[2];
        var text   = v[3];
        var type   = 'code';
        var item = {key,text,type};
        o.push(item);
      } else if((v=re_dlst_rmap.exec(s)) !== null) {
        var bullet = v[1];
        var rb     = v[2];
        var dot    = v[3];
        var rt     = v[4];
        var text   = v[5];
        var type   = 'rmap';
        var key = `${rb}${dot}${rt}`;
        var item = {key,text,type,rb,rt};
        o.push(item);
        /// also add to this.rmap
        this.rmap.push([rb,rt]);
      } else if((v=re_dlst_text_brace.exec(s)) !== null) {
        var bullet = v[1];
        var key    = v[2];
        var text   = v[3];
        var type   = 'text';
        var item = {key,text,type};
        o.push(item);
      } else if((v=re_dlst_text_word.exec(s)) !== null) {
        var bullet = v[1];
        var key    = v[2];
        var text   = v[3];
        var type   = 'text';
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

  parse_hlst(para) {

    var items = [];
    var v;
    var key = '';
    var text = '';
    var re = re_hlst;
    for (var j = 0; j < para.length; ++j) {
      var s = para[j];
      if((v=re.exec(s)) !== null) {
        var bullet = v[1];
        var key    = v[2];
        items.push({key});
      } else {
        if(items.length > 0){
          var item = items.pop();
          var {key,text} = item;
          text = this.joinLine(text,s);
          item = {key,text};
          items.push(item);
        }
      }
    }
    return items;
  }

  idenBlocks() {
    var autonum = new NitrilePreviewAutonum(this);
    autonum.idenBlocks();
  }

  parse_math(body) {

    return this.joinPara(body).replace(/`/g,'');

/*
    /// a = \sqrt{2} + \sqrt{3} 
    ///       + \sqrt{4}
    ///

    var re_equalsign = /^(.*?)&=(.*)$/;
    var line = this.joinPara(body);
    var v;

    if((v=re_equalsign.exec(line))!==null){
      var maths = ['',''];
      maths[0] = v[1];
      maths[1] = '= ' + v[2];
    } else {
      var maths = [line];
    }
    return maths;
*/
  }

  parse_tabu(para){

    if(para.length && para[0].indexOf(',')>=0){
      var para = para.map(row => row.trim());
      var para = para.map(row => row.split(','));
      var para = para.map(row => row.map(x => x.trim()));
    }else{
      var para = para.map(row => row.trim());
      var para = para.map(row => row.split(/\s+/));
    }

    ///arrange 'para' so that it is col oriented

    var ncols = para.reduce((acc, x) => Math.max(acc, x.length), 0);
    var cols = [];
    for (var j = 0; j < ncols; j++) {
      var items = para.map(x => x[j] || '');
      cols.push(items);
    }
    return cols;
  }

  parse_tabr_hyphen_minus(para){

    /// parse the table of the following nature.

      /// Names          
      /// John 
      /// Jane 
      /// James 
      /// ---
      /// Ages
      /// 18
      /// 20
      /// 18

    var cols = [];
    var items = [];
    for(var i=0; i < para.length; ++i){
      var line = para[i];
      var v;
      if((v=re_sep.exec(line))!==null){
        if(items.length){
          cols.push(items);
          items = [];
        }
        continue;
      }
      items.push(line);
    }
    if(1){
      if(items.length){
        cols.push(items);
        items = [];
      }
    }
    return cols;
  }

  parse_tabr_vertical_bar(para){

    var para = para.map(x => x.trim());
    var para = para.filter(x => x.length?true:false);
    var cols = [];
    var v;

    /*
       parse the table of the following format:

    ///  |Bits   |Description
    /// -|-------|--------------------------------------
    /// 0|0b000  |grayscale
    /// 2|0b010  |red, green and blue: rgb/truecolor
    /// 3|0b011  |indexed: channel containing   
    ///  |       |indices into a palette of colors
    /// 4|0b100  |grayscale and alpha: level of   
    ///  |       |opacity for each pixel
    /// 6|0b110  |red, green, blue and alpha
        ---
        $a1=Hdg 1
        $b1=Hdg 2
    */

    // Separate the incoming to 'lines' and 'extra'

    var body = [];
    var extra = [];
    var isextra = 0;
    for(var x of para){
      if(!isextra){
        if(!re_sep.test(x)){
          body.push(x);
        } else {
          isextra=1;
        }
        continue;
      } else {
        extra.push(x);
      } 
    }

    // parse 'body'

    var body = body.map(row => this.splitLineVbars(row));
    var re_bars = /^-+$/;
    body = body.filter(x => !re_bars.test(x[0]));
    var ncols = body.reduce((acc,x) => Math.max(acc,x.length),0);

    /// arrange them in cols.

    for (var j=0; j < ncols; j++){
      var items = body.map(x => x[j]||'');
      cols.push(items);
    }

    /// process the extra to insert new data
    /// $a1, $b2, etc.
    
    var re_item = /^\$([a-z])(|\d+)=\s*(.*)$/;
    for (var x of extra) {
      x = x.trim();
      if ((v = re_item.exec(x)) !== null) {
        let col = this.col_letter_to_num(v[1]);
        let row = this.row_letter_to_num(v[2]);
        let str = v[3];
        if(!cols[col]){
          cols[col] = [];
        }
        cols[col][row] = str;
      }
    }

    return cols;
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

  parse_tabr(para){

    return this.parse_tabr_vertical_bar(para);
  }

  parse_pict(lines){

    ///   \img{tree.png} (a)
    ///   \img{fish.png} (b)
    ///   \img{frog.png} (c)
    ///   ---
    ///   [width:.5]
    ///   \img{tree.png} (d)
    ///   

    /// form is ''
    var mode = {};
    var images = [];
    lines = lines.map(x => x.trim());
    var re_img = /^\\img\{(.*?)\}\s*(.*)$/;
    var re_mode = /^\[(.*)\]$/;
    var data = [];
    var images = [];
    var mode = {};
    var v;

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
      if((v=re_img.exec(line))!==null){
        var src = v[1];
        var sub = v[2];
        images.push({src,sub});
        continue;
      }
      if(images.length){
        var image = images.pop();
        var {src,sub} = image;
        sub = this.joinLine(sub,line);
        image = {src,sub};
        images.push(image);
      }
    }
    if(1){
      if(images.length){
        data.push({mode,images});
        images = [];
        mode = {};
      }
    }
    return data;
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
      'HDGS': this.do_hdgs,//x
      'TEXT': this.do_text,//x
      'SAMP': this.do_samp,//x
      'PASS': this.do_pass,//x
      'PLST': this.do_plst,//x
      'HLST': this.do_hlst,//x
      'DLST': this.do_dlst,//x
      'TABU': this.do_tabu,//x
      'TABR': this.do_tabr,//x
      'LONG': this.do_long,//x
      'TABB': this.do_tabb,//?
      'HRLE': this.do_hrle,//?
      'PICT': this.do_pict,//x
      'QUOT': this.do_quot,//x
      'PROG': this.do_prog,//x
      'DIAG': this.do_diag,//x
      'MATH': this.do_math,//x
      'FRMD': this.do_frmd//x
    };

    this.head = '';
    this.xsig0 = '';
    this.needblank = 0;
    for (var block of this.blocks) {
      var {id,row1,row2,sig,dept,level,data,caption,label,islabeled,idnum,para,subrow,subf,parser} = block;
      this.block = block;
      //this.xrmap = parser&&parser.rmap||[];
      //this.xsig = sig||'';
      //this.xsubfname=subf||'';
      //this.xrow1=row1||'';
      //this.xrow2=row2||'';
      //this.xidnum = idnum||'';
      //this.xlabel = label||'';
      //this.xcaption = caption||'';
      //this.latexlabelcmd = this.xlabel?`\\label{${this.xlabel}}`:'';
      /*
      if(block.floatname){
        this.floatname = block.floatname;
        this.caption_text = `${block.floatname}&#160;${this.xidnum}: ${this.unmask(this.xcaption)}`;
      } else if (this.xcaption){
        this.floatname = '';
        this.caption_text = `${this.unmask(this.xcaption)}`;
      } else {
        this.floatname = '';
        this.caption_text = '';
      }
      this.label_text = this.xlabel.slice(1);
      */
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
    for (var j=0; j < this.blocks.length; ++j) {
      var block = this.blocks[j];
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

  is_indented_line(line){
    const re = /^\s/;
    return (line.lenght > 0 && re.test(line));
  }

  parse_plst (para) {
    /// -
    /// *)
    /// *))
    /// *)))
    /// 1)
    /// 1))
    /// 1)))

    var items = [];
    //
    var lead = '';
    var bull = '';
    var bull = '';
    var value = '';
    var all = [];
    var v;
    var lead0 = '';
    const re_lead = /^([^\)]+)(\)+)$/;
    //
    //
    for (var line of para) {
      bull='';
      lead='';
      if((v = re_plst.exec(line))!==null){
        bull = v[1];
        text = v[2];
        if((v = re_lead.exec(bull))!==null){
          lead = v[2];
          bull = v[1];
        }else{
          lead = ')';
          bull = '*';
        } 
        if (bull == '*'){
          value = '';
          bull = 'UL';
        } else {
          let num = parseInt(bull);
          value = `${num}.`;
          bull = 'OL';
        }
        // check for indentation
        if (lead0.length < lead.length) {
          while(lead0.length < lead.length){
            lead0 += ')';
            items.push({ lead:lead0, bull, value, text });
            all.push(bull);
          }
        } else if (lead0.length > lead.length) {
          while(lead0.length > lead.length){
            var bull = all.pop();
            bull = `/${bull}`;
            items.push({ lead:lead0, bull, value, text });
            lead0 = lead0.slice(0,lead0.length-1);
          }
        } else {
          bull = 'LI';
          items.push({ lead:lead0, bull, value, text });
        }
      } else {
        if (items.length > 0) {
          var item = items.pop();
          var { text } = item;
          text = this.joinLine(text, line);
          item.text = text;
          items.push(item);
        }      
      }
    }
    //
    while (all.length > 0) {
      bull = all.pop();
      bull = `/${bull}`;
      items.push({bull});
    }
    //
    return items;
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

module.exports = { NitrilePreviewParser }
