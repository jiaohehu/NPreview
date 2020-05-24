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
    this.re_fence = /^\s*(\`\`\`)\s*(\w+\*|\w+|)$/;
    //this.re_unmask = /\{\{(.*?)\}\}|``(.*?)``|`(.*?)`|\[\[(\S+?)\]\]|(?<!\S)\'(\S+)\'/g;
    this.re_unmask = /(?<!\S)\{\{(.*?)\}\}|(?<!\S)``(.*?)``|(?<!\S)`(.*?)`|\$\{(.*?)\}/g;
    this.re_texmath = /\$\$(.*?)\$\$|\$(.*?)\$/g;
    this.re_texcomment  = /^\%\s+\!TEX\s*(.*)$/;
    this.re_nitrileflag1 = /^nitrile\.([\w]+)\s*\=\s*(.*)\s*$/;
    this.re_nitrileflag2 = /^nitrile\.([\w]+)\.([\w]+)\s*\=\s*(.*)\s*$/;
    //this.re_fencecmd    = /^\.(\w+)\s*(.*)$/;
    this.re_blank = /^(\s+)(.*)$/;
    this.re_plain = /^(\S+\s*)(.*)$/;
    this.re_caption_para = /^(\w+)\:\:\s*(.*)$/;
    this.re_label = /(.*)\s*\(#(\S+)\)$/;
    this.re_four_spaces = /^\s{4}/;
    this.re_hdgs = /^(#+)\s+(.*)$/u;
    this.re_sbdc = /^(!+)\s+(.*)$/u;
    this.re_part = /^(#)\s+(.*)\s+\1$/u;
    this.re_leadspaces = /^(\s*)(.*)$/;
    this.re_image = /^(\[.*?\]|)\((.*?)\)\s*(.*)$/;
    this.re_alt_tabb = /^\s*\-{1,}(\|\-{1,})+$/;
    this.re_alt_tabb2 = /^\s*\|\-{1,}(\|\-{1,})+\|$/;
    this.re_prim = /^\[\s+(.+?)\s+\]\s*(.*)$/;
    this.re_seco = /^\[\[\s+(.*?)\s+\]\]\s*(.*)$/;
    this.re_thrd = /^\[\[\[\s+(.*?)\s+\]\]\]\s*(.*)$/;
    this.re_displaymath = /^\`\`(.*)\`\`$/;
    this.re_hruler = /^\*\*\*$/;
    this.re_math        = /^(\$)\s(.*)$/u;
    this.re_long        = /^\((&|\u{ff06})\)\s+(.*)$/u;
    this.re_dlst_astr   = /^(\*)\s+(\S+)\s*(.*)$/u;
    this.re_dlst_astr2  = /^(\*)\s+\{(.*?)\}\s*(.*)$/u;
    this.re_dlst_plus   = /^(\+|\u{ff0b})\s+(.*)$/u;
    this.re_tabb        = /^(=|\u{ff1d})\s(.*)$/u;
    this.re_tabr        = /^(&|\u{ff06})\s(.*)$/u;
    this.re_pict        = /^(@|\u{ff20})\s(.*)$/u;
    this.re_quot        = /^(>|\u{11fe}|\u{300b})\s(.*)$/u;
    this.re_plst        = /^(-|--|\d+\.|\d+\)|\u{30fc}|\u{ff0d}|\u{30fc}\u{30fc}|\u{ff0d}\u{ff0d})\s+(.*)$/u;
    this.re_rbit1       = /^(\S+?)(\/|\u{30fb})(\S+)\s*(.*)$/u;
    this.re_ruby        = /^(%|\u{ff05})(\S+?)(\u{30fb})(\S+)/u;
    this.re_ruby2       = /^(%|\u{ff05})(\S+?)(\u{30fb})(\S+)\s*(.*)$/u;
    this.re_flag        = /^(%)\s*#(.*)$/u;
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
    this.idname = '';///used to prefix all block's id attribute
    this.xcssfontsize = '';///needed for unmask
    this.xlatfontsize = '';///needed for unmask
    this.xconfontsize = '';///needed for unmask
  }

  newConfig() {

    var config = {};

    /// initialize a new config object
    config.title = '';
    config.author = '';

    /// All the layout dimensions are in 'mm'
    config.CONTEX = {};
    config.CONTEX.backspace=38;
    config.CONTEX.width=130;
    config.CONTEX.topspace=20;
    config.CONTEX.header=10;
    config.CONTEX.footer=0;
    config.CONTEX.height=250;
    config.CONTEX.bodyfontsizept=11.5;
    config.CONTEX.papersize='A4';
    config.CONTEX.chapter = '\\bfd';
    config.CONTEX.section = '\\bfb';
    config.CONTEX.subsection = '\\bfa';
    config.CONTEX.subsubsection = '\\bold';
    config.CONTEX.subsubsubsection = '\\bold';
    config.CONTEX.pages = 0;

    /// All the layout dimensions are in 'mm'
    config.LATEX = {};
    config.LATEX.leftmargin=40;
    config.LATEX.rightmargin=40;
    config.LATEX.topmargin=30;
    config.LATEX.bodyfontsizept=11.5;
    config.LATEX.papersize='a4paper';
    config.LATEX.twoside='';///set to '1' to enable
    config.LATEX.twocolumn='';///set to '1' to enable
    config.LATEX.latexengine='';///set to 'pdflatex' or 'lualatex', default to 'lualatex'
    config.LATEX.toc='';///when set to 1 '\tableofcontents' will be inserted
    config.LATEX.documentclass='';///set to 'book','scrbook', etc., if not set will be 'report' if 'config.LATEX.pages' is set, or 'article' if not
    config.LATEX.pages = 0;

    /// All the layout dimensins are in 'mm'
    config.HTML = {};
    config.HTML.leftmargin=44;
    config.HTML.rightmargin=44;
    config.HTML.topmargin=30;
    config.HTML.bodyfontsizept=11.5;
    config.HTML.bodymargin=2;
    config.HTML.eqnumwidth=10;///'10mm' for equation number field

    /// All the layout dimensins are in 'mm'
    config.TEXT = {};
    config.TEXT.left='5';///5mm for standalone text block
    config.MATH = {};
    config.MATH.left='5';///5mm left margin
    config.HDGS = {};
    config.PART = {};
    config.PARA = {};
    config.SBDC = {};
    config.PLST = {};
    config.PLST.left = '5';///5mm padding left for each list group
    config.DLST = {};
    config.DLST.left = '10';
    config.TOPI = {};
    config.LONG = {};
    config.LONG.cssfontsize = '0.9em';
    config.LONG.latfontsize = 'small';
    config.LONG.confontsize = 'small';
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
    config.TABR.cssfontsize = '0.9em';
    config.TABR.latfontsize = 'small';
    config.TABR.confontsize = 'small';
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
    config.SAMP.cssfontsize = '0.75em';
    config.SAMP.latfontsize = 'small';
    config.SAMP.confontsize = 'small';
    config.SAMP.monospace = 1;
    config.SAMP.style = 0;
    config.TABB = {};
    config.TABB.left='5';///5mm margin
    config.TABB.right='0';///0mm margin
    config.TABB.cssfontsize = '0.9em';
    config.TABB.latfontsize = 'small';
    config.TABB.confontsize = 'small';
    config.IMGS = {};
    config.DIAG = {};
    config.VERB = {};
    config.VERB.numbers = 1;
    config.VERB.monospace = 0;
    config.VERB.cssfontsize = '0.9em';
    config.VERB.latfontsize = 'small';
    config.VERB.confontsize = 'small';
    config.PICT = {};
    config.QUOT = {};
    config.QUOT.left='5';///5mm margin
    config.QUOT.right='5';///5mm margin
    config.QUOT.cssfontsize = '0.9em';
    config.QUOT.latfontsize = 'small';
    config.QUOT.confontsize = 'small';
    config.FRMD = {};
    config.FRMD.frameborder = 1;
    config.FRMD.framewidth = 480;///480pt width frame

    return config;
  }

  readFromLines(lines) {

    /*
    This func returns an arrow of two elements. The first one is an array of
    blocks. The second element is the name of the file. If used as a PREVIEW,
    this entry might be empty.

    The first one is an arry of blocks. Each block is an array of 11 elements.
    Following is a description:

    [0] id: an id, used as HTML id= attribute, such as 'nitrile-preview-myfile-1',
        'nitrile-preview-myfile-mylabel'
    [1] row1: the first line number in the original MD file
    [2] row2: the last line number in the original MD file
    [3] sig: the signature of the blocks: 
        PART,
        HDGS,
        SBDC,
        TEXT, 
        SAMP,
        HRLE, 
        MATH, 
        IMGS, 
        DIAG,
        PLST, 
        TABB, 
        DLST, 
        LONG, 
        TABR, 
        VERB, 
        FRMD
        Note that for the blocks that are marked using [] are those that are
        planned but not yet implemented.
    [5] data: the parsed structured data for this block. The exact details of the
        structure is dependent on the type of the block.
    [6] para: the untempered line of the source document. Note that in some cases
        if multiple paragraphs are taken to form a single block, such as the case
        for DLST, or LONG, then the para will likely only have lines from the very
        first paragraph.
    [7] fencecmd: an javascript object containing properties of this block. The
        collections of properties includes display elements such as font size, table
        v/h lines, v/h padding, etc. It will also contain user provided info
        such as caption, label, or star.
    [10] subrow: initially set to empty string, but will be filled with a number by
        this.insertSubs() if this document is a sub-document---a document included by
        another as 'includes'. This number expresses the exact line number in the
        main document that imports this sub-document.
    [11] fname: the filename of the source file, if any. It could also be the
        file name of the child document. Note that the fname element does not include
        any directory names.  It only contains the name of the file.

    Standard blocks: TEXT, SAMP, HRLE, MATH, IMGS, DIAG,
        PLST, TABB, DLST, LONG, TABR, VERB, FRMD

    Recognized fenced blocks:
        includes
        diagram
        diagram*
        math
        equation
        split
        subequations
        gathers
        aligns
        multline
        framed
        verse

    */

    var v = '';
    var v1 = '';
    var v2 = '';
    var v3 = '';
    var i = 0;
    var brand0 = '';
    var nblocks = 0;
    var nlines = 0;
    var rmap = [];
    var mode = {};
    var row1 = 0;
    var row2 = 0;
    var fencecmd = {};
    var block_type0 = '';
    var the_caption_block = {};

    /// initialize the output
    var o = [];

    /// initialize the config
    this.config = this.newConfig();

    /// start processing all lines of the editor
    while (lines.length > 0) {

      /// save off the previous block type
      block_type0 = block_type;

      var [nread, para, lines, the_fence, fencecmd, is_sample, block_type] = this.readPara(lines);

      /// increment block count
      ++nblocks;
      row1 = nlines;
      nlines += nread;
      row2 = nlines;
      var end = para.length-1;

      /// merge the attributes from the_caption_block if any
      fencecmd = {...fencecmd, ...the_caption_block};
      the_caption_block = {};

      /// prepare for HTML ID, change the ID to be include the
      /// label if set by user
      if (fencecmd.label) {
        var baselabel = `${fencecmd.label}`;
        fencecmd.baselabel = baselabel;
      } else {
        var baselabel = '';
        fencecmd.baselabel = baselabel;
      }

      /// trim empty lines at the beginning and/or end of the
      /// paragraph
      while (para.length && para[para.length-1].length == 0) {
        para.pop();
        row2--;
      }
      while (para.length && para[0].length == 0) {
        para.shift();
        row1++;
      }

      var subrow = '';
      var html = '';
      var data;

      if (block_type === 'SAMP') {

        if (block_type0 === 'SAMP') {
          var bl = o.pop();
          var data = bl.data;
          data.push('');///insert an empty line
          data = data.concat(para);
          bl.row2 = row2;
          bl.data = data;
          o.push(bl);
        } else {
          var data = para;
          sig = 'SAMP';
          o.push({mode,rmap,row1,row2,sig,html,data,para,fencecmd,subrow});
        }
        continue

      } else if (block_type === 'SBDC') {

        var line = para[0];
        sig = 'SBDC';
        var v = this.re_sbdc.exec(line);
        if (v) {
          var sublevel = v[1].length;
          var subfname = v[2].trim();
          var subrow = parseInt(row1);
          var data = {sublevel,subfname,subrow};
          o.push({mode,rmap,row1,row2,sig,html,data,para,fencecmd,subrow});
        }
        continue;

      } else if (block_type === 'HDGS') {

        var v = this.re_hdgs.exec(para[0]);
        var v2 = this.re_part.exec(para[0]);

        if (v2) {
          /// # Part 1: Background #
          /// ## Part 1: Background ##
          /// ### Part 1: Background ###
          /// #### Part 1: Background ####
          var text = v2[2];
          sig = 'PART';
          data = text;
          o.push({mode,rmap,row1,row2,sig,html,data,para,fencecmd,subrow});
          continue;
        } else if (v) {
          /// # Chapter 1 (#mychap1)
          /// ## Section 1 (#mysec1)
          var hdgn = v[1].length;
          var text = v[2];
          var data = text;
          sig = 'HDGS';
          var level = hdgn;
          o.push({mode,rmap,row1,row2,sig,html,hdgn,level,data,para,fencecmd,subrow});
          continue;
        }

      } else if (block_type === '' && the_fence === '```' ) {

        /// trim the paragraph to remove any indenting spaces
        var [data, m] = this.trimPara(para);

        var [data,fence,brand] = this.trimFences(data);
        brand = brand.toLowerCase(brand);
        if (brand.endsWith('*')) {
          var sig = brand.slice(0,brand.length-1);
          var star = '*';
          fencecmd.star = '*';
        } else {
          var sig = brand;
          var star = '';
        }

        /// if brand is empty, then use brand0 if possible
        if (!brand && brand0) {
          brand = brand0;
          sig = brand;
        } else if (brand) {
          brand0 = brand;
        }

        /// look out for sig

        if (sig === 'diagram') {

          data = this.parseDIAGRAM(data);
          sig = 'DIAG';
          o.push({mode,rmap,row1,row2,sig,html,data,para,fencecmd,subrow});

        } else if (sig==='framed'){

          sig = 'FRMD';
          o.push({mode,rmap,row1, row2, sig, html, data, para, fencecmd,  subrow});
          block_type = 'FRMD';

        } else {

          sig = 'VERB';
          o.push({mode,rmap,row1,row2,sig,html,data,para,fencecmd,subrow});
          block_type = 'VERB';
        }
        continue;

      } else if (this.isCaptionPara(para)) {

        the_caption_block = this.parseCaptionPara(para);
        block_type = '';

      } else if (this.isMathPara(para)) {

        if (block_type0 === 'mathpara') {
          var bl = o.pop();
          var data = bl.data;
          var item = this.parseMathPara(para,fencecmd);
          data.push(item);
          bl.row2 = row2;
          bl.data = data;
          o.push(bl);
        } else {
          var item = this.parseMathPara(para,fencecmd);
          var data = [item];
          sig = 'MATH';
          o.push({mode,rmap,row1,row2,sig,html,data,para,fencecmd,subrow});
        }
        block_type = 'mathpara';
        continue

      } else if (this.isLongPara(para)) {

        if (block_type0 === 'longtablepara') {
          var bl = o.pop();
          var data = bl.data;
          var [srow,ww] = this.parseLongPara(para);
          data[0].push(srow);
          bl.row2 = row2;
          bl.data = data;
          o.push(bl);
        } else {
          var [srow,ww] = this.parseLongPara(para);
          var maxj = srow.length;
          var data = [[srow],maxj,ww];
          sig = 'LONG';
          o.push({mode,rmap,row1,row2,sig,html,data,para,fencecmd,subrow});
        }
        block_type = 'longtablepara';
        continue

      } else if (this.isDlstPara(para)) {

        if (block_type0 === 'dtlistpara') {
          var bl = o.pop();
          var data = bl.data;
          var nitems = this.parseDlstPara(para);
          for (var item of nitems) {
            data.push(item);
          }
          bl.row2 = row2;
          bl.data = data;
          o.push(bl);
        } else {
          var data = this.parseDlstPara(para);
          sig = 'DLST';
          o.push({mode,rmap,row1,row2,sig,html,data,para,fencecmd,subrow});
        }
        block_type = 'dtlistpara';
        continue

      } else if (this.isTopiPara(para)) {

        if (block_type0 === 'topicpara') {
          var bl = o.pop();
          var data = bl.data;
          data.push(this.parseTopiPara(para));
          bl.row2 = row2;
          bl.data = data;
          o.push(bl);
        } else {
          var data = [];
          data.push(this.parseTopiPara(para));
          sig = 'TOPI';
          o.push({mode,rmap,row1,row2,sig,html,data,para,fencecmd,subrow});
        }
        block_type = 'topicpara';
        continue

      } else if (this.isTabbPara(para)){

        var items = this.parseTabbPara(para);
        if(block_type0 === 'tabbpara'){
          var bl = o.pop();
          var data = bl.data;
          data = data.concat(items);
          bl.data = data;
          o.push(bl);
        } else {
          sig = 'TABB';
          data = items;
          o.push({mode,rmap,row1, row2, sig, html, data,    para, fencecmd,  subrow});
        }
        block_type = 'tabbpara';
        continue;

      } else if (this.isTabrPara(para)){

        var items = this.parseTabrPara(para);
        if(block_type0 === 'tabrpara'){
          var bl = o.pop();
          var data = bl.data;
          data = data.concat(items);
          bl.row2 = row2;
          bl.data = data;
          o.push(bl);
        } else {
          sig = 'TABR';
          data = items;
          o.push({mode,rmap,row1, row2, sig, html, data,    para, fencecmd,  subrow});
        }
        block_type = 'tabrpara';
        continue;

      } else if (this.isPictPara(para)){

        var item = this.parsePictPara(para);
        if(block_type0 === 'pictpara'){
          var bl = o.pop();
          var data = bl.data;
          data.push(item);
          bl.row2 = row2;
          bl.data = data;
          o.push(bl);
        } else {
          sig = 'PICT';
          var data = [];
          data.push(item);
          o.push({mode,rmap,row1, row2, sig, html, data,    para, fencecmd,  subrow});
        }
        block_type = 'pictpara';
        continue;

      } else if (this.isQuotPara(para)){

        var item = this.parseQuotPara(para);
        if(1){
          sig = 'QUOT';
          data = item;
          o.push({mode,rmap,row1, row2, sig, html, data,    para, fencecmd,  subrow});
        }
        block_type = 'quotpara';
        continue;

      } else if ((v = this.re_plst.exec(para[0])) !== null) {

        /// trim it first before parse
        var [data, m] = this.trimPara(para);
        var data = this.parse_plst(para);
        sig = 'PLST';
        o.push({mode,rmap,row1,row2,sig,html,data,para,fencecmd,subrow});
        block_type = 'plistpara';
        continue

      } else if((v=this.re_ruby.exec(para[0]))!==null){

        for( var s of para ) {
          if((v=this.re_ruby2.exec(s))!==null){
            var rb = v[2];
            var rt = v[4];
            var ds = v[5];
            rmap.push([rb,rt,ds]);
          }
        }
        continue;

      } else if ((v1 = this.re_prim.exec(para[0])) !== null ||
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
        for (i=1; i < para.length; ++i) {
          /// candidate for line join
          text = this.joinLine(text,para[i]);
        }
        var data = text;
        sig = 'TEXT';
        o.push({mode,rmap,row1,row2,sig,html,lead,leadn,data,para,fencecmd,subrow});
        block_type = 'TEXT';

      } else  if ((v=this.re_leading_space.exec(para[0])) !== null) {
        var data = para.map(x => x);
        var s = data[0];
        var re1 = /^\s\s\@\s+(.*)$/;
        var re2 = /^\s\s\-\s+(.*)$/;
        if((v=re1.exec(s))!==null){
          data[0] = v[1];
          sig = 'SAMP';
          var mode = 1;
          o.push({mode,rmap,row1,row2,mode,sig,html,data,para,fencecmd,subrow});
          block_type = 'SAMP';
        } else if ((v=re2.exec(s))!==null){
          data[0] = v[1];
          sig = 'SAMP';
          var mode = 3;
          o.push({mode,rmap,row1,row2,mode,sig,html,data,para,fencecmd,subrow});
          block_type = 'SAMP';
        } else {
          sig = 'TEXT';
          var data = this.joinPara(para);
          var standalone = 1;
          o.push({mode,rmap,row1,row2,sig,html,standalone,data,para,fencecmd,subrow});
          block_type = 'TEXT';
        }

      } else {

        var text = this.joinPara(para);
        if ((v=this.re_hruler.exec(text))!==null) {
          text = '***';
          sig = 'HRLE';
          data = text;
          o.push({mode,rmap,row1, row2, sig, html, data, para, fencecmd,  subrow});
          block_type = 'HRLE';
          continue;

        } 

        sig = 'TEXT';
        data = text;
        if(data=='{}') data='';
        o.push({mode,rmap,row1,row2,sig,html,data,para,fencecmd,subrow});
        block_type = 'TEXT';
        continue;
      }
    }

    /// If the first block is a text, turn it into a HDGS/0 block
    if(o.length > 0) {
      var block = o[0];
      var {sig} = block;
      if (sig === 'TEXT') {
        block.sig = 'HDGS'
        block.hdgn = 0;
        block.level = 0;
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
      var newblock = this.new_hdgs_block('Untitled');
      o.unshift(newblock);
    }

    /// Set the config.title if it is not set and
    /// the first block is a HDGS/0 block
    if(!this.config.title && o.length > 0) {
      var block = o[0];
      var {sig,hdgn,data} = block;
      if (sig === 'HDGS' && hdgn === 0) {
        this.config.title = data;
      }
    }

    this.blocks = o;
  }

  readPara (lines) {

    ///
    /// Read a paragraph and return the paragraph, the unread lines.
    /// and the fence if there is any. If it started with NTR lines they
    /// will also be processed and returned. The fence and the fencecmd
    /// will also be processed and returned. There should not be any blank
    /// lines between the fence commands and the content of the block.

    /// A paragraph will look like the following:
    ///
    ///
    /// ``` imgs
    /// image (image-tree.png) Tree
    /// image (image-flog.png) Flog
    /// ```

    var v = null;
    var label = '';
    var fencecmd = {};
    var para = [];
    var is_fence = false;
    var the_fence = '';
    var num_solid = 0;
    var is_sample = false;
    var block_type = '';
    var the_sample_fence = '';
    var v = null;
    var line0 = '';

    for (var i=0; i < lines.length; ++i) {
      var line = lines[i];
      line = line.trimRight();
      if (is_fence) {
        if ((v = this.re_fence.exec(line)) !== null && v[1] == the_fence) {
          para.push(line);
          i += 1;
          break
        }
        para.push(line);
        continue
      } else if (is_sample) {
        if (the_sample_fence) {
          if (the_sample_fence === line) {
            para.push(line);
            i += 1;
            break;
          }
        } else {
          if (line.length == 0) {
            break
          }
        }
        para.push(line);
        continue
      }

      // following is for non-fenced para

      // if encounter a blank line and we have
      // already encountered at least one non-blank
      // lines then we get out
      if (line.length == 0) {
        if (num_solid) {
          break
        }
      }

      /// If we haven't seen any solid lines and line0 is non-empty,
      /// that means the previous line is ended with a backslash and
      /// the current line is a continuation of a previous fence cmd line
      ///
      /// .caption Tree and flogs \        <- 'line0'
      /// lovely.                          <- current line
      ///
      /// We will join the *line0* + *line*, removing the backslash of *line0* first,
      /// and set the *line* to be the joint line.

      // if (num_solid == 0 && line0) {
      //   line0 = line0.slice(0,line0.length-1);
      //   line0 = this.joinLine(line0,line);
      //   line = line0;
      //   line0 = '';
      // }

      /// If we haven't ready any solid lines and we have seen
      /// a fence command line, then we will process it.

      // if (num_solid == 0 && this.re_fencecmd.test(line)) {
      //   var v = this.re_fencecmd.exec(line);
      //   ///check to see if the fence cmd line ends with a backslash
      //   if (line.length && line[line.length-1] == '\\') {
      //     line0 = line;
      //     line = line.slice(0,line.length-1);
      //   } else {
      //     line0 = '';
      //   }
      //   ///
      //   /// .adjust .33 .33
      //   /// .caption The tree and flog \
      //   /// are lovely.
      //   ///
      //   var the_key = v[1]
      //   var the_val = v[2].trim();
      //   fencecmd[the_key] = the_val;
      //   para.push('');
      //   continue
      // }

      /// If we haven't seen any solid lines and we have seen
      /// a !TEX line, then process it
      var v = this.re_texcomment.exec(line);
      if ((num_solid == 0) && (v !== null)) {
        para.push('');
        var nitrile_line = v[1];
        if ((v = this.re_nitrileflag1.exec(nitrile_line)) !== null) {
          var key2 = v[1];
          var val = v[2];
          key2 = key2.toLowerCase();
          if (this.config.hasOwnProperty(key2)) {
            this.config[key2] = val;
          }
        }
        else if ((v = this.re_nitrileflag2.exec(nitrile_line)) !== null) {
          var key1 = v[1];
          var key2 = v[2];
          var val = v[3];
          key1 = key1.toUpperCase();
          key2 = key2.toLowerCase();
          if (this.config.hasOwnProperty(key1) &&
              this.config[key1].hasOwnProperty(key2)) {
            this.config[key1][key2] = val;
          }
        }
        continue;
      }

      /// Here is for solid lines

      // add to this paragraph
      para.push(line);

      /// keep track of the number of solid lines
      if (line.length) {
        num_solid += 1;

      }

      /// 'num_solid' expresses how many solid lines we have collected
      /// has been encountered, not including the config flags,
      /// but including the fence that is ```

      if (num_solid === 1) {

        /// If it is a hash-mark followed by one or more texts, then
        /// we are only interested in the first line

        if (this.re_hdgs.test(line) ) {
          i += 1;
          block_type = 'HDGS';
          ///extract the label and place it inside fencecmd.label
          var v = null;
          if ((v = this.re_label.exec(line)) !== null) {
            line = v[1].trimRight();
            fencecmd.label = v[2];
            if (para.length > 0) {
              /// make sure to replace the last line of this para
              para[para.length-1] = line;
            }
          }
          break;

        }

        /// If it is a greater-than symbol followed by one or more texts, then
        /// we are only interested in the first line

        if (this.re_sbdc.test(line) ) {
          i += 1;
          block_type = 'SBDC';
          
          break;

        }

        /// if this is the first solid line the we check
        /// to see if this is a sample

        var v = this.re_leadspaces.exec(line);
        if (v) {
          if (v[1].length >= N_sampspaces) {
            is_sample = true;
            block_type = 'SAMP';
            if (this.re_sampfence.test(line)) {
              the_sample_fence = line;
            }
            continue
          }
        }

        // if this is the first solid line then we check
        // to see if this is a fence

        var v = this.re_fence.exec(line);
        if (v) {
          is_fence = true;
          the_fence = v[1];
          continue
        }


      }

    }
    return [
      i,
      para,
      lines.slice(i),
      the_fence.trim(),
      fencecmd,
      is_sample,
      block_type
    ];
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

      } else if (v[4] !== undefined) { /// [[entity]]

        var cnt = v[4];
        if(cnt.startsWith('#')){
          cnt = cnt.slice(1);
          newtext += this.ref(cnt);
        } else {
          newtext += this.uri(cnt);
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
    var dt = '';
    var sep = '';
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
        var dt = '';
        var sep = '';
        var idx = text.indexOf(' : ');
        if( idx > 0 ){
          var dt = text.substring(0,idx);
          var sep = text.substring(idx,3+idx);
          var text = text.substring(3+idx);
        }
        if(bullet == '--' || bullet == '\u30FC\u30FC' || bullet == '\uFF0D\uFF0D'){
          value = `${++num}.`;
          bull = 'OL';
        } else if (bullet == '-' || bullet == '\u30FC' || bullet == '\uFF0D'){
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
        items.push({bull,bullet,value,text,sep,dt});
      } else if (action === 'pop') {
        var [lead,bull] = levels.pop();
        bull = `/${bull}`;
        items.push({bull,bullet,value,text,sep,dt});
      } else if (action === 'item') {
        bull = 'LI';
        items.push({bull,bullet,value,text,sep,dt});
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

  new_hdgs_block (text) {

    /// create a new 'HDGS/0' block

    var fencecmd = {};
    var para = [];
    var row1 = -1;
    var row2 = -1;
    var sig = 'HDGS';
    var data = text;
    var subrow = '';
    var hdgn = 0;
    return ({row1,row2,sig,hdgn,data,para,fencecmd,subrow});

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

  getSubs() {

    var o = [];
    for (var block of this.blocks) {
      const {sig,data} = block;
      switch (sig) {
        case 'SBDC': {
          o.push(data);
          break;
        }
      }
    }

    return o;
  }

  mergeSubs (subs) {

    ///index them according to 'subrow'
    var db = {};
    for (var sub of subs) {
      let {subfname,subrow,subparser} = sub;
      db[subrow] = {fname:subfname,flow:subparser.blocks};
    }
    var o = [];
    for (var m of this.blocks) {
      const {sig,data} = m;
      switch (sig) {
        case 'SBDC': {
          let {subfname,sublevel,subrow} = data;
          let {fname,flow} = db[subrow];
          if (flow) {
            for (var f of flow) {
              f.row1 = parseInt(subrow); ///change the row1 and row2 field
              f.row2 = parseInt(subrow) + 1;
              f.subrow = parseInt(subrow);///NOTE:subrow field has to be a number
              f.sublevel = parseInt(sublevel);
              o.push(f)
            }
          }
          break;
        }
        default: {
          o.push(m);
          break;
        }
      }
    }
    this.blocks = o;
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

  rubify (src,rmap) {

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
      for (var rubyitem of rmap) {
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

  updateFencecmd(fencecmd,sig,config){
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
    if (this.re_dlst_astr.test(s0)) {
      return true;
    } else if (this.re_dlst_astr2.test(s0)) {
      return true;
    } 
    return false;
  }

  parseDlstPara(para) {

    var o = [];
    var keys = [];
    var desc = [];
    o.push([keys,desc]);
    var re1 = this.re_dlst_astr2;
    var re2 = this.re_dlst_astr;
    for (var j = 0; j < para.length; ++j) {
      var s = para[j];
      var v;
      if((v=re1.exec(s)) !== null) {
        var bullet = v[1];
        var key    = v[2];
        var text   = v[3];
        /// if desc is not empty,then we need to create a new row
        if (desc.length > 0) {
          var keys = [];
          var desc = [];
          o.push([keys,desc]);
        }
        keys.push(key);
        if (text.length > 0) {
          desc.push(text);
        }
      } else if((v=re2.exec(s)) !== null) {
        var bullet = v[1];
        var key    = v[2];
        var text   = v[3];
        /// if desc is not empty,then we need to create a new row
        if (desc.length > 0) {
          var keys = [];
          var desc = [];
          o.push([keys,desc]);
        }
        keys.push(key);
        if (text.length > 0) {
          desc.push(text);
        }
      } else {
        desc.push(s);
      }
    }
    /// we need to remove the last row if it is empty
    o = o.filter( item => (item[0].length > 0)?true:false );
    o = o.map( item => {
      item[1] = this.joinPara(item[1]);
      return item;
    });
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
    //if((v=re_equalsign.exec(data))!==null){
    if(0){
      data = ['',''];
      data[0] = v[1];
      data[1] = '= ' + v[2];
      fencecmd.isalignequalsign = 1;
    } else {
      data = [data,''];
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

  isTabrPara(para){

    if(para.length>0 && this.re_tabr.test(para[0])){
      return true;
    }
    return false;

  }

  parseTabrPara(para){

    /// & あ a   か ka
    ///   い i   き ki
    ///   う u   く ku
    ///   え e   け ke
    ///   お o   こ ko
    ///

    /// form is ''
    var o = [];
    var data = para.map(x=>x);
    var s = data[0];
    var v = this.re_tabr.exec(s);
    if(v){
      data[0] = v[2];
    }
    if(data[0].indexOf('|') >= 0){
      var data = data.map(row => this.splitLineVbars(row));
      var re_bars = /^-+$/;
      data = data.filter(x => !re_bars.test(x[0]));
      var ncols = data.reduce((acc,x) => Math.max(acc,x.length),0);
      for (var j=0; j < ncols; j++){
        var items = data.map(x => x[j]||'');
        o.push(items);
      }
      return o;
    }else{
      var data = data.map(row => this.splitCells(row));
      var data = data.map(row => row.map(x => (x=='{}')?'':x));
      var ncols = data.reduce((acc,x) => Math.max(acc,x.length),0);
      for (var j=0; j < ncols; j++){
        var items = data.map(x => x[j]||'');
        o.push(items);
      }
      return o;
    }
  }

  isPictPara(para){

    if(para.length>0 && this.re_pict.test(para[0])){
      return true;
    }
    return false;

  }

  parsePictPara(para){

    /// @ tree.png (a)
    ///   fish.png (b)
    ///   frog.png (c)
    ///

    /// @ [width:.5]
    ///   tree.png (a)
    ///   fish.png (b)
    ///   frog.png (c)
    ///

    /// form is ''
    var mode = {};
    var images = [];
    var data = para.map(x=>x);
    var s = data[0];
    var v = this.re_pict.exec(s);
    if(v){
      data[0] = v[2];
    }
    var re = /^\s*(\S+)\s*(.*)$/;
    var re_mode = /^\s*\[(.*)\]$/;
    for(var i=0; i < data.length; ++i){
      var line = data[i];
      if((v=re_mode.exec(line))!==null){
        mode = this.toStyle(v[1]);
        continue;
      }
      if((v=re.exec(line))!==null){
        var src = v[1];
        var sub = v[2];
        images.push({src,sub});
        continue;
      }
    }
    return {images,mode};
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
      'PART': this.do_part,
      'HDGS': this.do_hdgs,
      'TEXT': this.do_text,
      'SAMP': this.do_samp,
      'SBDC': this.do_sbdc,
      'DLST': this.do_dlst,
      'TOPI': this.do_topi,
      'PLST': this.do_plst,
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

    this.xsig0 = '';
    this.needblank = 0;
    for (var block of this.blocks) {
      var {row1,row2,sig,level,data,para,fencecmd,subrow} = block;
      this.block = block;
      var fencecmd = this.updateFencecmd(fencecmd,sig,this.config);
      var caption = fencecmd.caption||'';
      this.xcssfontsize = fencecmd.cssfontsize||'';
      this.xlatfontsize = fencecmd.latfontsize||'';
      this.xconfontsize = fencecmd.confontsize||'';
      this.xnumbers = fencecmd.numbers||'';
      this.xwraplines = parseInt(fencecmd.wraplines);
      this.xwraplines = (Number.isFinite(this.xwraplines))?this.xwraplines:0;
      this.xbaselabel = fencecmd.baselabel||'';
      if(1){
        this.iscaption = 1;
        this.caption_text = this.unmask(caption);
        this.iscaption = 0;
      }
      this.latexlabelcmd = this.xbaselabel?`\\label{${this.xbaselabel}}`:'';
      this.xname = fencecmd.name||'';
      this.xidnum = block.idnum||'';
      this.xsig = sig;
      this.xfencecmd = fencecmd;
      //this.xtop = `${this.config.HTML.bodymargin}mm`;
      //this.xbot = `${this.config.HTML.bodymargin}mm`;
      this.xtop = '';
      this.xbot = '';
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

  async readFromFileAsync(fname) {
    try {
      var out = await this.readFileAsync(fname);
    } catch (e) {
      console.error(e);
      this.setError(e.toString());
      return;
    }
    var lines = out.split('\n');
    this.fname = fname;
    this.readFromLines(lines);
  }

  async readSubsAsync(subs,dirname) {
    for( var sub of subs ) {
      let { subfname, sublevel, subrow } = sub;
      var fsubfname = path.join(dirname,subfname);
      sub.subparser = new NitrilePreviewParser();
      sub.subprom = await sub.subparser.readFromFileAsync(fsubfname);
    }
    for( var sub of subs ) {
      await sub.subprom;
    }
  }

  toConfigLines(){
    const config = this.config;
    var mylines = [];
    for(var key1 in config) {
      if (config.hasOwnProperty(key1)) {
        var obj = config[key1];
        if (typeof obj === 'string') {
          mylines.push(`% !TEX nitrile.${key1} = ${obj}`);
          continue;
        }
        for(var key2 in obj) {
          if (obj.hasOwnProperty(key2)) {
            mylines.push(`% !TEX nitrile.${key1}.${key2} = ${obj[key2]}`);
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

}

module.exports = { NitrilePreviewParser };
