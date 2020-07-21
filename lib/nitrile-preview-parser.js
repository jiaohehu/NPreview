'use babel';

const fs = require('fs');
const path = require('path');
const json_rubyitems = require('./nitrile-preview-rubyitems.json');
const json_math = require('./nitrile-preview-math.json');
const entjson = require('./nitrile-preview-entity.json');
const { NitrilePreviewAutonum } = require('./nitrile-preview-autonum');
const { NitrilePreviewBase } = require('./nitrile-preview-base.js');

const re_labeled = /^\\ref\{([^\{\}]*)\}\s*(.*)$/u;
const re_comm = /^%([\^!].*)$/u;
const re_spcl = /^(@@|@)\s+(\w+)\s*(.*)$/u;
const re_hdgs = /^(#+)\s+(.*)$/u;
const re_quot = /^(>)\s+(.*)$/u;
const re_math = /^(\$\$|\$)\s+(.*)$/u;
const re_plst = /^(-|\*\)+|\d+\)+|\d+\.)\s+(.*)$/u;
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

class NitrilePreviewParser extends NitrilePreviewBase {

  constructor() {
    super();

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
    this.config = {};
    this.blocks = [];///all blocks
    this.mode = [];
    this.rmap = [];
    this.notes = new Map();///stores all the NODE block
    this.fname = '';///the filename metadata
    this.dirname = '';
    this.idname = '';///used to prefix all block's id attribute
    this.editorrow = -1;///
    this.editorcolumn = -1;
    this.isepub = 0;///set to 1 to indicate that it is for EPUB
    this.iscaption = 0;///set to 1 for typesetting caption
    this.ispreview = 0;///set to 1 for preview in Atom
    this.ismaster = 0;///set to 1 if this document is detected to be a master document
    this.root = '';///set by %^root=
    this.only = '';///set by %^only=
    this.program = '';///set by %^program=
    this.outfname = '';
  }

  read_md_lines(lines) {

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
      block.rmap = this.rmap;
      block.notes = this.notes;

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
    var wide;
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
            let refid=n;
            this.mode.push({name,subf,refid});
          }else if(key==='root'){
            this.root = val;
          }else if(key==='only'){
            this.only = val;
          }else if(key==='program'){
            this.program = val;
          }else if(key==='part'){
            let name='part';
            let text=val;
            let refid=n;
            this.mode.push({name,text,refid});
          }else if(re_sub.test(key)){
            let myv = re_sub.exec(key);
            let name='h';
            let subn=parseInt(myv[1]||0);
            let subf=val;
            let refid=n;///let refid be the same as linenum
            this.mode.push({name,subn,subf,refid});
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
          if (this.config.hasOwnProperty(key1)){
            this.config[key1][key2]=val;
          }else{
            this.config[key1]={};
            this.config[key1][key2]=val;
          }
          if(this.string_is_float(val)){
            var num = parseFloat(val);
            if(Number.isFinite(num)){
              this.config[key1][key2]=num;
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
          if (this.config.hasOwnProperty(key1)) {
          }else{
            this.config[key1]={};
          }
          if(this.config[key1]){
            this.config[key1][key2]=val;
          }else{
            this.config[key1][key2]+='\t';
            this.config[key1][key2]+=val;
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
          caption = this.join_line(caption,line);
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
        var floatname = 'Figure';
        sig = 'FRMD';
        body = this.trim_samp_body(body);
        return {para,sig,wide,caption,label,islabeled,body,floatname};
      } 
      else if (fenceid == 'listing'){
        var floatname = 'Listing';
        body = this.trim_samp_body(body);
        sig = 'LLST';
        return {para,sig,wide,caption,label,islabeled,body,floatname};
      } 
      else if (fenceid == 'diagram'){
        var floatname = 'Figure';
        sig = 'DIAG';
        body = this.join_backslashed_lines(body);
        body = body.map(x => x.trimLeft());
        return {para,sig,wide,caption,label,islabeled,body,floatname};
      } 
      else if (fenceid == 'table'){
        var floatname = 'Table';
        sig = 'TABR';
        cols = this.parse_tabr(body);
        return {para,sig,wide,caption,label,islabeled,cols,body,floatname};
      } 
      else if (fenceid == 'image'){
        var floatname = 'Figure';
        sig = 'PICT';
        var {opts,images} = this.parse_pict(body);
        return {para,sig,wide,caption,label,islabeled,opts,images,body,floatname};
      }
      else {//treat it as verbatim
        var floatname = 'Verbatim';
        body = this.trim_samp_body(body);
        sig = 'VBTM';
        return {para,sig,wide,caption,label,islabeled,body,floatname};
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
      text = this.join_para(body);
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
        text = this.join_para(body);
        return {para,sig,text,body};
      }
    } 
    else if(type == 'pass'){
      body = this.trim_pass_body(body);
      if(bull.length==2){
        let s = this.join_para(body);
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
        text = this.join_line(text, para[i]);
      }
    } else {
      text = this.join_para(para);
    }
    return { leadn, lead, text };
  }


  trim_para (para) {

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
    para = this.trim_para_at(para,n0);

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

  trim_para_at (para,n) {

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

  trim_fences (para) {

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

  split_line_three_spaces (line) {
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

  get_next_phrase(line){
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

  split_line_vbar (line) {
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
          text = this.join_line(text,line);
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
      item.text = this.join_line(item.text,line);
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

  replace_sub_strings (src, map) {

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

  is_han (cc) {
    ///
    /// Given a character code and returns true if it is considered a CJK unified character
    ///

    if (cc >= 0x4E00 && cc <= 0x9FFF) {
      return true;
    } else {
      return false;
    }
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
      ///if (this.isHan(s0.charCodeAt(s0[s0.length-1])) && this.isHan(s1.charCodeAt(0))) {
    } else {
      return s0 + s1;
      ///return s0 + ' ' + s1;
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

  async read_mode_async() {
    let all = [];
    /// get dirname
    var dirname = this.dirname;
    /// if there is a root then read this root
    if(this.root){
      var rootparser = new NitrilePreviewParser();
      await rootparser.read_md_file_async(this.root,dirname);
      this.mode = rootparser.mode;
      this.config = rootparser.config;
      this.rmap = rootparser.rmap;
      this.notes = rootparser.notes;
      this.blocks = rootparser.blocks;
      this.ismaster = 1;
      this.outfname = this.root;
    }
    /// read all this.mode
    for( var d of this.mode ) {
      let { subf } = d;
      if(subf){
        d.subparser = new NitrilePreviewParser();
        all.push( d.subparser.read_md_file_async(subf,dirname) );
      }
    }
    /// wait for all
    await Promise.all(all);
    /// at this point all sub-documents are read from disk
    for(let d of this.mode){
      let {name,subn,text,subf,subparser,refid} = d;
      if(name==='rmap'){
        for(let m of subparser.rmap){
          this.rmap.push(m);
        }
      }else if(name==='part'){
        let sig='PART';
        this.blocks.push({sig,text,refid});///the 'part' block will have a refid
        this.ismaster = 1;
        console.log('part',text,refid);
      }else if(name==='h' && subparser){
        /// this is the master
        /// all rmap entries of current to the end of the child 
        for(let m of this.rmap){
          subparser.rmap.push(m);
        }
        console.log('h',subf,refid);
        subparser.blocks.forEach((x,i) => {
          x.name=name;
          x.subf=subf;
          x.subn=subn;
          x.refid=refid;//note that many block will have the same refid if they belong to the same source file
          this.blocks.push(x);
        });
        this.ismaster = 1;
      }
    }
  }

  assert_config_entry (val,entry) {

    /// given a value such as 12.5, ensure that it is valid
    /// by the definition of the entry, and return the corrected
    /// one if the one given is out-of-range.
    switch (entry['type']) {
      case 'boolean': {
        return this.to_bool(val);
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
        return this.string_to_array(val);
        break;
      }
      default: {
        return val;
        break;
      }
    }
  }

  to_bool (val) {

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


  find_space_before_word_at (s, longn, shortn) {
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

  wrap_sample (para, sampwrapn) {
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

  build_rubymap_from_json (json) {
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
          key = this.join_line(key, s);
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
          key = this.join_line(key, s);
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
          item.text = this.join_line(item.text,s);
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
          text = this.join_line(text,s);
          item = {key,text};
          items.push(item);
        }
      }
    }
    return items;
  }

  iden_blocks() {
    var autonum = new NitrilePreviewAutonum(this);
    autonum.iden_blocks();
  }

  parse_math(body) {

    return this.join_para(body).replace(/`/g,'');

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

    var body = body.map(row => this.split_line_vbar(row));
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

    ///   {grid:3}
    ///   \img{tree.png} (a)
    ///   \img{fish.png} (b)
    ///   \img{frog.png} (c)
    ///   \img{tree.png} (d)
    ///   

    /// form is ''
    var mode = {};
    var images = [];
    lines = lines.map(x => x.trim());
    var re_img = /^\\img\{(.*?)\}\s*(.*)$/;
    var re_mode = /^\{(.*)\}$/;
    var data = [];
    var images = [];
    var opts = {};
    var v;

    ///now process the rest of the data
    for(var i=0; i < lines.length; ++i){
      var line = lines[i];
      if((v=re_mode.exec(line))!==null){
        opts = this.string_to_style(v[1]);
        continue;
      }
      if((v=re_img.exec(line))!==null){
        var segs = v[1].split(';');
        var src = segs[0];
        var width = segs[1];
        var height = segs[2];
        var sub = v[2];
        images.push({src,width,height,sub});
        continue;
      }
      if(images.length){
        var image = images.pop();
        var {sub} = image;
        sub = this.join_line(sub,line);
        image.sub = sub;
        images.push(image);
      }
    }
    return {opts,images};
  }

  translate_blocks(translator) {

    const name = translator.name;
    translator.xparser = this;//this master parser
    translator.xismaster = this.ismaster;
    translator.xblocks = this.blocks;
    translator.xdirname = this.dirname;
    translator.xroot = this.root;
    translator.xonly = this.only;

    ///update the translator's .xconfig member
    var obj = this.config[name];
    if(obj && translator.xconfig && typeof translator.xconfig === 'object'){
      for(var m in obj){
        if(obj.hasOwnProperty(m)){
          translator.xconfig[m] = obj[m];
        }
      }
    }

    ///call translator do_identify(block,A) method for each block,
    ///where A is a global object that is passed from call to call
    var A = {};
    for (var block of this.blocks) {
      translator.do_identify(block,A);
    }
    
/*
    var dispatch = {
      'HDGS': translator.do_hdgs,//x
      'TEXT': translator.do_text,//x
      'SAMP': translator.do_samp,//x
      'PASS': translator.do_pass,//x
      'PLST': translator.do_plst,//x
      'HLST': translator.do_hlst,//x
      'DLST': translator.do_dlst,//x
      'TABU': translator.do_tabu,//x
      'TABR': translator.do_tabr,//x
      'LONG': translator.do_long,//x
      'TABB': translator.do_tabb,//?
      'HRLE': translator.do_hrle,//?
      'PICT': translator.do_pict,//x
      'QUOT': translator.do_quot,//x
      'PROG': translator.do_prog,//x
      'DIAG': translator.do_diag,//x
      'MATH': translator.do_math,//x
      'FRMD': translator.do_frmd//x
    };
*/
    for (var block of this.blocks) {
      var {id,row1,row2,sig,dept,level,data,caption,label,islabeled,idnum,para,subrow,subf} = block;
      translator.xblock = block;
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
      /*
        /// call the dispatch function
      if (dispatch[sig]) {
        var func = dispatch[sig];
        func.call(this,block);
      }
      */
      switch(sig){
        case 'PART': translator.do_part(block); break;
        case 'HDGS': translator.do_hdgs(block); break;
        case 'TEXT': translator.do_text(block); break;
        case 'SAMP': translator.do_samp(block); break;
        case 'PASS': translator.do_pass(block); break;
        case 'PLST': translator.do_plst(block); break;
        case 'HLST': translator.do_hlst(block); break;
        case 'DLST': translator.do_dlst(block); break;
        case 'TABU': translator.do_tabu(block); break;
        case 'TABR': translator.do_tabr(block); break;
        case 'LONG': translator.do_long(block); break;
        case 'TABB': translator.do_tabb(block); break;
        case 'HRLE': translator.do_hrle(block); break;
        case 'PICT': translator.do_pict(block); break;
        case 'QUOT': translator.do_quot(block); break;
        case 'LLST': translator.do_llst(block); break;
        case 'PROG': translator.do_prog(block); break;
        case 'VBTM': translator.do_vbtm(block); break;
        case 'DIAG': translator.do_diag(block); break;
        case 'MATH': translator.do_math(block); break;
        case 'FRMD': translator.do_frmd(block); break;
      }

    }
  }

  async read_file_async (filename) {

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

  async write_file_async (filename, data) {

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

  async read_md_file_async(fname,dirname) {
    
    if(dirname){
      var fullname = path.join(dirname,fname);
    } else {
      var fullname = fname;
    }

    ///ensure it is a MD file
    fullname = `${fullname.slice(0,fullname.length-path.extname(fullname).length)}.md`;
    console.log('reading',fullname);

    var out = await this.read_file_async(fullname);
    var lines = out.split('\n');
    this.fname = fname;
    this.dirname = path.dirname(fname);
    this.read_md_lines(lines);
  }

  add_ruby_item(base,top,type,mydesc,rmap) {
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
        s0 = this.join_line(s0,s);
        o.push(s0);
        continue;
      }
      o.push(s);
    }
    return o;
  }

  parse_plst (para) {
    /// -
    /// *)
    /// *))
    /// *)))
    /// 1)
    /// 1))
    /// 1)))
    /// 1.

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
    const re_ddot = /^(\d+)\.$/;
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
        }else if((v = re_ddot.exec(bull))!==null){
          lead = ')';
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
          text = this.join_line(text, line);
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



}

module.exports = { NitrilePreviewParser }
