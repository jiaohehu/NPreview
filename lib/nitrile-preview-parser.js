'use babel';

const fs = require('fs');
const path = require('path');
const { NitrilePreviewBase } = require('./nitrile-preview-base.js');

const re_style = /^&style\{([^\{\}]*)\}\s*(.*)$/u;
const re_ref = /^&ref\{([^\{\}]*)\}\s*(.*)$/u;
const re_img = /^&img\{(.*?)\}\s*(.*)$/u;

const re_spcl = /^(@+)\s+(\w+)\s*(.*)$/u;
const re_hdgs = /^(#+)\s+(.*)$/u;
const re_math = /^(\$+)\s+(.*)$/u;
const re_plst = /^(-+|\++|\*+|\d+\)|\d+\.)\s+(.*)$/u;
const re_tabb = /^(<+)\s+(.*)$/u;
const re_mult = /^(&+)\s+(.*)$/u;

const re_samp = /^\s\s\s\s(.*)$/u;
const re_hrle = /^\*{3}$/u;
const re_fence = /^```/u;
const re_verse = /^---$/u;
const re_story = /^===$/u;
const re_stop = /^\s*(={3,})\s*$/u;
const re_bars = /^\s*-{1,}\s*$/u;
const re_uri = /^\w+:\/\//u;
const re_ruby = /^(\S+?)\u{30fb}(\S+)/u;
const re_prim1 = /^\[\s+(.*?)\s+\]\s*(.*)$/;
const re_prim2 = /^\[\[\s+(.*?)\s+\]\]\s*(.*)$/;
const re_prim3 = /^\[\[\[\s+(.*?)\s+\]\]\]\s*(.*)$/;
const re_blank = /^(\s+)(.*)$/;
const re_plain = /^(\S+\s*)(.*)$/;
const re_comm             = /^%(.*)$/u;
const re_nitrilemode      = /^(\w+)(\*|)=(.*)$/u;
const re_nitrileitem      = /^(\S+?)\u{30fb}(\S+)/u;
const re_nitrileconf      = /^(\w+)\.(\w+)\s*=\s*(.*)$/u;
const re_nitrileconf_plus = /^(\w+)\.(\w+)\s*\+=\s*(.*)$/u;
const re_leading_space = /^\s+(.*)$/;
const re_fullline = /^\S/;
const re_indented = /^\s/;
const re_frnt = /^---$/;
const re_kval = /^(\w[\w\.]*)\s*:\s*(.*)$/;
const s_unicode_right_arrow = String.fromCharCode(8594);

class NitrilePreviewParser extends NitrilePreviewBase {

  constructor() {
    super();
    this.dirname = '';
    this.fname = '';///the filename metadata
    this.subname = '';///assigned to 'h' when being imported
    this.sublevel = 0;///assigned to a number when being imported
    this.subid = 0;///assigned to a number when being imported
    this.initialize();
  }

  initialize(){
    this.config = new Map();
    this.blocks = [];
    this.mode = [];         
    this.rmap = [];         
    this.notes = new Map();
    this.ismaster = 0;
    this.sample = 0;
    this.program = '';
    this.endblock = {};
  }

  read_md_lines(lines) {

    this.initialize();

    var nlines = 0;
    var row1 = 0;
    var row2 = 0;
    var o = [];

    /// start processing all lines of the editor
    while (nlines < lines.length) {

      var block  = this.read_para(lines,nlines);
      var para = block.para;

      /// increment block count
      var nread = para.length;
      row1 = nlines;
      nlines += nread;
      row2 = nlines;

      block.row1 = row1;
      block.row2 = row2;
      block.parser = this;

      /// 'sig' must *not* be empty
      o.push(block);

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
    var floatid = '';
    var type = '';
    var sig = '';
    var hdgn = '';
    var sig = '';
    var bull = '';
    var title = '';
    var wide = 0;
    var nspace = 0;
    var plitems = [];
    var items = [];
    var num_empty_lines = 0;
    var v;
    var is_plitems = 0;
    var re_plitems = null;
    var is_spcl = 0;
    var is_samp = 0;
    var is_text = 0;
    var is_caption = 0;
    var done = 0;
    var caption_body = [];
    var is_solid = 0;
    //var re_sub = /^h(\d*)$/i;

    /// if n0 == 0 then checks to see if we need
    /// to read front matter
    if(n0===0){
      if(re_frnt.test(lines[0].trim())){
        let sig = 'FRNT';
        let data = [];
        n++;
        for(n=1; n < lines.length; n++){
          if(re_frnt.test(lines[n].trim())){
            n++;
            break;
          }
          let line = lines[n];
          if(re_fullline.test(line)){
            if((v=re_kval.exec(line))!==null){
              let key = v[1];
              let val = v[2];
              data.push([key,val]);
            }
          }else{
            let val1 = line.trimLeft();
            if(data.length){
              let [key,val] = data.pop();
              val += '\n';
              val += val1; 
              data.push([key,val]);
            }
          }
        }
        let para = lines.slice(n0, n);
        return {sig,data,para};
      }
    }

    /// read blank lines or TEX-comment lines

    for (; n < lines.length; ++n) {
      var line = lines[n];
      line = line.trimRight();
      if((v=re_comm.exec(line))!==null){
        var nitrile_line = v[1];
        if ((v = re_nitrilemode.exec(nitrile_line)) !== null) {
          var key = v[1];
          var only= v[2];
          var val = v[3];
          if(key==='config'){
            let name='config';
            let subf=val;
            let refid=n;
            this.mode.push({name,subf,refid});
          }else if(key==='rmap'){
            let name='rmap';
            let subf=val;
            let refid=n;
            this.mode.push({name,subf,refid});
          }else if(key==='program'){
            this.program = val;
          }else if(key==='part'){
            let name='part';
            let text=val;
            let refid=n;
            this.mode.push({name,text,refid});
          }else if(key==='chapter'){
            let name='chapter';
            let subn=0;
            let subf=val;
            let refid=n;///let refid be the same as linenum
            this.mode.push({name,only,subn,subf,refid});
          }else if(key==='section'){
            let name='section';
            let subn=1;
            let subf=val;
            let refid=n;///let refid be the same as linenum
            this.mode.push({name,only,subn,subf,refid});
          }else if(key==='subsection'){
            let name='subsection';
            let subn=2;
            let subf=val;
            let refid=n;///let refid be the same as linenum
            this.mode.push({name,only,subn,subf,refid});
          }else if(key==='subsubsection'){
            let name='subsubsection';
            let subn=3;
            let subf=val;
            let refid=n;///let refid be the same as linenum
            this.mode.push({name,only,subn,subf,refid});
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
          var _key1 = v[1];
          var _key2 = v[2];
          var val = v[3];
          var key = `${_key1}.${_key2}`;
          this.config.set(key,val);
          if(this.string_is_float(val)){
            var num = parseFloat(val);
            if(Number.isFinite(num)){
              this.config.set(key,num);
            }
          }
          continue;
        }
        if ((v = re_nitrileconf_plus.exec(nitrile_line)) !== null) {
          var _key1 = v[1];
          var _key2 = v[2];
          var key = `${_key1}.${_key2}`;
          var val = v[3];
          if(this.config.has(key)){
            let prev = this.config.get(key);
            val = `${prev}\t${val}`;
            this.config.set(key,val);
          }else{
            this.config.set(key,val);
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

    for (let i=0; !done && n < lines.length; ++i,++n) {
      var line = lines[n];
      line = line.trimRight();
      is_solid++;
      if(i==0 && (v=re_spcl.exec(line))!==null){
        label = '';
        type = 'spcl';
        is_spcl = 1;
        is_caption = 1;
        bull = v[1];
        floatid = v[2].toLowerCase();
        let s = v[3];
        caption_body.push(s);
        continue;
      }
      if(i==0 && (v=re_hdgs.exec(line))!==null){
        type = 'hdgs';
        bull = v[1];
        let s = v[2];
        if((v=re_ref.exec(s))!==null){
          islabeled = 1;
          label = v[1];
          title = v[2];
        } else {
          title = s;
        }
        hdgn = bull.length;
        if(n==0){
          //if n==0 then it is at the first line of the file
          /// we treat it as HDGS/0
          hdgn=0;
        }
        n++;
        body.push(line);
        break;
      }
      if (i == 0 && n == 0) {
        hdgn = 0;
        type = 'hdgs';
        done = 1;
        title = line;
        body.push(line);
        continue;
      }
      if(i==0 && (v=re_hrle.exec(line))!==null){
        type = 'hrle';
        title = v[0];
        body.push(line);
        n++;  
        break;
      }
      if(i==0 && (v=re_samp.exec(line))!==null){
        is_samp = 1;
        type = 'samp';
        body.push(line);
        continue;  
      }
      if(i==0 && (v=re_plst.exec(line))!==null){
        is_plitems = 1;
        re_plitems = re_plst;
        type = 'plst';
        body.push(line);
        plitems.push(body);
        continue;  
      }
      if (i == 0 && (v=re_math.exec(line))!==null) {
        is_plitems = 1;
        re_plitems = re_math;
        type = 'math';
        body.push(line);
        plitems.push(body);
        continue;
      }
      if(i==0 && (v=re_prim1.exec(line))!==null){
        type = 'prim';
        hdgn = 1;
        title = v[1];
        body.push(v[2]);
        continue;
      }
      if(i==0 && (v=re_prim2.exec(line))!==null){
        type = 'prim';
        hdgn = 2
        title = v[1];
        body.push(v[2]);
        continue;
      }
      if(i==0 && (v=re_prim3.exec(line))!==null){
        type = 'prim';
        hdgn = 3
        title = v[1];
        body.push(v[2]);
        continue;
      }
      if(i==0){
        is_text = 1;
        type = 'text';
        body.push(line);
        continue;  
      }
      if(is_spcl){
        if(re_fullline.test(line)){
          break;
        }
        if(line.length==0){
          if(is_caption){
            is_caption = 0;
            continue;
          }
          body.push(line);
          continue;
        }
        if(is_caption){
          caption_body.push(line);
        }else{
          body.push(line);
        }
        continue;
      }
      if(is_plitems){
        if(line.length==0){
          num_empty_lines++;
          body = [];
          plitems.push(body);
          continue;
        }
        if(re_fullline.test(line)){
          if(re_plitems.test(line)){
            body = [];
            plitems.push(body);
            body.push(line);
            continue;
          }else{
            break;
          }
        }
        ///normal line
        body.push(line);
        continue;
      }//is_plitems
      if(is_samp){
        if(line.length==0){
          num_empty_lines++;
          body.push(line);
          continue;
        }
        num_empty_lines=0;
        if(re_fullline.test(line)){
          break;
        }
        if(!re_samp.test(line)){
          break;
        }
        ///normal line
        body.push(line);
        continue;
        
      }//end of is_samp
      if(line.length==0){
        break;
      }
      body.push(line);
      continue;
    }

    /// if is 'spcl' then rollback the last few lines 
    /// that are empty

    while(is_spcl && n > n0 && lines[n-1].length==0){
      n = n-1;
    }

    /// remove bottom of 'para' that are empty lines
    /// so that these empty lines are considered part
    /// of next para

    while (is_solid && n > n0 && lines[n-1].length==0) {
      n--;
    }

    /// post-processing of 'body'

    para = lines.slice(n0, n);
    sig = type.toUpperCase();


    /// parse 'body'
    
    if(type == 'spcl'){
      ///all the bodys are just for the caption
      ///it will need to be joint by following SAMP paragraphs
      if(bull.length>1){ wide=1; }
      var caption = this.join_para(caption_body).trim();
      var [islabeled,label,caption] = this.read_caption_ref(caption);
      var [style,caption] = this.read_caption_style(caption);
      var lines = [];
      islabeled = 1;///always set the islabeled to true
      if(floatid == 'figure'){
        var floatname = 'Figure';
        sig = 'FIGE'
      } 
      else if (floatid == 'listing'){
        var floatname = 'Listing';
        sig = 'LLST';
      } 
      else if (floatid == 'table'){
        var floatname = 'Table';
        sig = 'TABR';
      } 
      else if (floatid == 'equation'){
        var floatname = 'Equation';
        sig = 'QUAT';
      }
      else if (floatid == 'note'){
        var floatname = 'Note';
        if(label){
          this.notes.set(label,body);
        }
      }
      else {//treat it as LLST    
        var floatname = '';
        sig = 'TEXT';
        nspace = 0;
      }
      body = this.trim_samp_body(body);
      return { para, sig, wide, caption, label, islabeled, style, floatname, body, hdgn, title, nspace, items};
    }
    else if(type == 'hdgs'){
      return { para, sig, wide, caption, label, islabeled, style, floatname, body, hdgn, title, nspace, items};
    } 
    else if(type == 'plst'){
      plitems = plitems.filter(x => x.length);
      items = this.parse_plitems_for_plst(plitems);
      return { para, sig, wide, caption, label, islabeled, style, floatname, body, hdgn, title, nspace, items};
    }
    else if (type == 'math') {
      plitems = plitems.filter(x => x.length);
      items = this.parse_plitems_for_math(plitems);
      return { para, sig, wide, caption, label, islabeled, style, floatname, body, hdgn, title, nspace, items };
    }
    else if(type == 'samp'){
      body = this.trim_samp_body(body);
      return { para, sig, wide, caption, label, islabeled, style, floatname, body, hdgn, title, nspace, items};
    } 
    else if(type == 'prim'){
      return { para, sig, wide, caption, label, islabeled, style, floatname, body, hdgn, title, nspace, items};
    } 
    else if(type == 'text'){
      [body, nspace] = this.trim_samp_para(body);
      return { para, sig, wide, caption, label, islabeled, style, floatname, body, hdgn, title, nspace, items};
    } 
    else if(type == 'hrle'){
      return { para, sig, wide, caption, label, islabeled, style, floatname, body, hdgn, title, nspace, items};
    }
    else if(type){
      console.error(`unhandled type: (${type})`);
      console.error(para);
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

  async read_mode_async() {
    this.ismaster = 1;
    let all = [];
    /// get dirname
    var dirname = this.dirname;
    console.log('dirname',dirname);
    /// read all this.mode
    for (var d of this.mode) {
      let { subf } = d;
      if (subf) {
        d.subparser = new NitrilePreviewParser();
        all.push(d.subparser.read_md_file_async(subf, dirname));
      }
    }
    /// wait for all
    await Promise.all(all);
    console.log('all mode file read completed','total',all.length,'files');
    /// at this point all sub-documents are read from disk
    for (let d of this.mode) {
      let { name, only, subn, text, subf, subparser, refid } = d;
      if (name === 'config') {
        this.config = subparser.config;
      } else if (name === 'rmap') {
        this.rmap = this.rmap.concat(subparser.rmap);
        console.log('rmap', text, refid, `${subparser.rmap.length} entries`);
      } else if (name === 'part') {
        let sig = 'PART';
        let subseq = 0;
        let title = text;
        this.blocks.push({ sig, title, refid, subseq });///the 'part' block will have a refid
        console.log('part', text, refid);
      } else if (name && subparser) {
        /// this is the master
        /// all rmap entries of current to the end of the child 
        subparser.rmap = subparser.rmap.concat(this.rmap);
        subparser.subname = name;
        subparser.sublevel = subn;
        ///only for the intended
        console.log(name, subf, refid, 'blocks',subparser.blocks.length);
        subparser.blocks.forEach((x, i) => {
          x.name = name;
          x.subf = subf;
          x.subn = subn;
          x.refid = refid;//all blocks from the same source file will have the same refid
          x.subseq = i;
          this.blocks.push(x);
        });
      }
    }
    console.log('read_mode_async completed','total blocks',this.blocks.length);
  }

  parse_text(para) {
    var v1;
    var v2;
    var v3;
    var isverse = 0;
    var isstory = 0;
    var nspace = 0;
    var ncols = 0;
    var lines = [];
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
      lines.push(text);
      for (let i = 1; i < para.length; ++i) {
        lines.push(para[i].trimLeft());
      }
    } else {
      [lines,nspace] = this.trim_samp_para(para);
    } 
    text = lines.join('\n');
    return { leadn, lead, text, nspace };
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

  trim_tabr_body (para) {

    if(para.length==0){
      return para;
    }

    var line0 = para[0];
    var line00 = line0.trimLeft();
    var n0 = line0.length - line00.length;

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

  parse_plst (para,isbroad) {
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
    var k = 0;
    var more = [];
    var v;
    const re_leadspaces = /^(\s*)(.*)$/;
    //
    //var re = /^(\s*)(\+|\-|\*|\d+\.)\s+(.*)$/;
    //
    var re = /^(\s*)/;
    for (var line of para) {
      if(line.length==0){
        k=0;  
        more.push('');
        continue;
      }
      if(isbroad && !k && re_indented.test(line) && !re_plst.test(line.trimLeft())){
        more.push(line);
        continue;
      }
      k++;
      v = re_leadspaces.exec(line);
      if (v) {
        lead = v[1];
        line = v[2];
      } else {
        lead = '';
      }
      v = re_plst.exec(line);
      if(isbroad && k>1){
        v = null;
      }
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
        more = [];
        items.push({bull,bullet,value,text,more});
      } else if (action === 'pop') {
        var [lead,bull] = levels.pop();
        bull = `/${bull}`;
        more = [];
        items.push({bull,bullet,value,text,more});
      } else if (action === 'item') {
        bull = 'LI';
        more = [];
        items.push({bull,bullet,value,text,more});
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
    /// to_bool("1"); //true
    /// to_bool("12"); //true
    /// to_bool("12.5"); //true
    /// to_bool("1005"); //true
    /// to_bool("0"); //false
    /// to_bool("0.0"); //false
    /// to_bool(" "); //false
    /// to_bool(""); //false
    /// to_bool(undefined); //false
    /// to_bool(null); //false
    /// to_bool('blah'); //false
    /// to_bool('yes'); //true
    /// to_bool('on'); //true
    /// to_bool('YES'); //true
    /// to_bool('ON'); //true
    /// to_bool("true"); //true
    /// to_bool("TRUE"); //true
    /// to_bool("false"); //false
    /// to_bool("FALSE"); //false
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
        s += s_unicode_right_arrow;
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

  parse_tabr(para) {

    para = this.trim_tabr_body(para);

    var re_fr = /^(\d+)fr$/;
    //var re_item = /^\$([A-Za-z])\s*=\s*(.*)$/;
    //var re_ITEM = /^\$\s+(.*)$/;
    var re_ITEM = /^\S/;
    var v;
    var ww = [];
    var rows = [];
    var pp = [];
    var column_mode = 0;
    var coli = NaN;
    for (var j = 0; j < para.length; ++j) {
      var s = para[j];
      if(re_stop.test(s)){
        if(column_mode==0){
          column_mode=1;
          pp = [];
          rows.push(pp);
          coli = NaN;
          continue;
        }else{
          ///entering row mode
          column_mode=0;
          continue;
        }
      }
      else{
        ///not stop
        if(column_mode==0){
          ///row mode
          var pp = s.split('|');
          var pp = pp.map(x => x.trim());
          rows.push(pp);
        }else{
          ///column mode
          if(s.length==0){
            pp = [];
            rows.push(pp);
            coli = NaN;
            continue;
          }else{
            if((v=re_ITEM.exec(s))!==null){
              if(s=='{}'){
                pp.push('');
              }else{
                pp.push(s);
              }
            }else{
              if(pp.length){                
                let p = pp.pop();
                p = this.join_line(p,s);
                pp.push(p);
              }
            }
          }
        }
      }
    }

    ///fill in the holds of the columns
    rows = rows.map(pp => {
      for(let j=0; j < pp.length; ++j){
        pp[j] = pp[j]||'';
      }
      return pp;
    })

    ///detect those rows that do not have any contents
    rows = rows.map(pp => {
      let tt = pp.map(x => x.length);
      let n = tt.reduce((acc,cur) => acc + cur,0);
      if(n == 0){
        return [];
      }
      return pp;
    })

    //remove empty rows
    rows = rows.filter(pp => pp.length > 0 ? true : false);

    /// remove those rows who looks like separators
    rows = rows.map((pp,i) => {
      let tt = pp.map(x => re_bars.test(x) ? 1 : 0);
      let n = tt.reduce((acc, cur) => acc + cur,0);
      if (n == tt.length) {
        return [];
      }
      return pp;
    })

    //remove empty rows
    rows = rows.filter(pp => pp.length > 0 ? true : false);

    ///extract the row that has only the width info
    rows = rows.map(pp => {
      let tt = pp.map(x => re_fr.test(x) ? 1 : 0);
      let n = tt.reduce((acc, cur) => acc + cur,0);
      if (n == tt.length) {
        ww = pp.map(x => re_fr.exec(x)[1]);
        return [];
      }
      return pp;
    })
    
    //remove empty rows
    rows = rows.filter(pp => pp.length > 0 ? true:false);
    
    ///set ww    
    if(rows.length){
      var pp = rows[0];
      while(ww.length < pp.length){
        ww.push(1);
      }
    }

    ///ensure each rows has the same length as ww
    var ncols = ww.length;
    rows = rows.map(pp => {
      if(pp.length > ncols){
        while(pp.length > ncols){
          pp.pop();
        }
      }else{
        while(pp.length < ncols){
          pp.push('');
        }
      }
      return pp;
    })

    return { rows, ww };
  }

  parse_para(body) {
    var pp = body.map(x => x.trim());
    return {pp};
  }

  parse_dlst(para) {

    const re_key_braced   = /^\{\s+(.*?)\s+\}\s*(.*)$/u;
    const re_key_quoted   = /^'(.*?)'\s*(.*)$/u;
    const re_key_dquoted   = /^"(.*?)"\s*(.*)$/u;
    const re_key_item     = /^(\S+)\s*(.*)$/u;
    var v;
    var o = [];
    for (var j = 0; j < para.length; ++j) {
      let s = para[j];
      let bullet;
      let type;
      let key;
      let text;
      let rb;
      let rt;
      let quote;
      if((v=re_dlst.exec(s)) !== null) {
        bullet = v[1];
        type   = '';
        s = v[2];
        if((v=re_key_braced.exec(s))!==null){
          /// { Apple tree } 
          ///   is good
          key    = v[1];
          text   = v[2];
        }
        else if((v=re_key_quoted.exec(s))!==null){
          /// '\hspace <len>' is good
          key    = v[1];
          text   = v[2];
          type   = 'quoted';
          quote  = "'";
        }
        else if((v=re_key_dquoted.exec(s))!==null){
          /// "\hspace <len>" is good
          key    = v[1];
          text   = v[2];
          type   = 'quoted';
          quote  = '"';
        }
        else if((v=re_key_item.exec(s))!==null){
          /// Apple is good
          key    = v[1];
          text   = v[2];
        }
        else{
          /// Apple
          key = s;
          text = '';
        }
        if((v=re_ruby.exec(key)) !== null) {
          type   = 'rmap';
          rb     = v[1];
          rt     = v[2];
          this.rmap.push([rb,rt]);
        }
        var item = {bullet,key,text,type,rb,rt,quote};
        o.push(item);
      } 
      else {
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

  parse_math(body) {

    return this.join_para(body).replace(/`/g,'');

  }

  parse_quat_one(body) {

    var s = this.join_para(body).replace(/`/g,'');
    s = s.trimLeft();
    var v;
    if((v=re_ref.exec(s))!==null){
      let label=v[1];
      let math=v[2];
      let islabeled=1;
      return {islabeled,label,math};
    }else{
      let label='';
      let math=s;
      let islabeled=0;
      return {islabeled,label,math};
    }

  }

  parse_data(para,isspace){

    para = this.trim_samp_body(para);

    if(isspace){  // separated by spaces
      var para = para.map(row => row.trim());
      var para = para.map(row => row.split(/\s+/));
      var para = para.map(row => row.map(x => x.trim()));
    }else{
      var para = para.map(row => row.trim());
      var para = para.map(row => row.split(','));
      var para = para.map(row => row.map(x => x.trim()));
    }

    //ensure all rows are the same length
    var tt = para.map(pp => pp.length);
    var n = tt.reduce((acc,cur) => Math.max(acc,cur),0);
    para = para.map(pp => {
      while(pp.length < n){
        pp.push('');
      }
      return pp;
    });

    return para;
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
      if((v=re_stop.exec(line))!==null){
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
        $(a1)=Hdg 1
        $(b1)=Hdg 2
    */

    // Separate the incoming to 'lines' and 'extra'

    var body = [];
    var extra = [];
    var isextra = 0;
    for(var x of para){
      if(!isextra){
        if(!re_stop.test(x)){
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
    /// $(a1), $(b2), etc.
    
    var re_item = /^\$\(([A-Za-z])(\d+)\)=\s*(.*)$/;
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
    a = a.toLowerCase();
    var start = 'a'.charCodeAt(0);
    var code = a.charCodeAt(0);
    var n = code-start;
    if(!Number.isFinite(n)){
      n = NaN;
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
    if(1){
      translator.do_starttranslate();
    }
    if(1){
      var A = {};
      console.log(`***do_identity: ${this.blocks.length}***`);
      for (var block of this.blocks) {
        this.block = block;
        translator.do_identify(block,A);
      }
      console.log(`***end do_identity: ${this.blocks.length}***`);
    }
    if(1){
      console.log(`***translate block: ${this.blocks.length}***`);
      for (var block of this.blocks) {
        this.block = block;
        let {sig,refid,subseq,subf} = block;
        refid=refid||'';
        subseq=subseq||'';
        subf=subf||'';
        console.log('->',`sig:${sig} refid:${refid} subseq:${subseq} subf:${subf}`);
        switch(block.sig){
          case 'PART': translator.do_part(block); break;
          case 'HDGS': translator.do_hdgs(block); break;
          case 'SAMP': translator.do_samp(block); break;
          case 'PRIM': translator.do_prim(block); break;
          case 'TEXT': translator.do_text(block); break;
          case 'PLST': translator.do_plst(block); break;
          case 'MATH': translator.do_math(block); break;
          case 'HRLE': translator.do_hrle(block); break;
          case 'QUAT': translator.do_quat(block); break;
          case 'FIGE': translator.do_fige(block); break;
          case 'TABR': translator.do_tabr(block); break;
          case 'LLST': translator.do_llst(block); break;
          default: break;
        }
      }
      console.log(`***end translate block: ${this.blocks.length}***`);
    }
    if(1){
      translator.do_endtranslate();
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

    ///replace the last extension with .md
    fullname = `${fullname.slice(0,fullname.length-path.extname(fullname).length)}.md`;
    var out = await this.read_file_async(fullname);
    var lines = out.split('\n');
    console.log('read file',fname,lines.length,'lines');
    this.dirname = path.dirname(fullname);
    this.fname = path.basename(fullname);
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

  parse_plst_new (para) {
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

  read_caption_ref(line) {
    var v;
    var label = '';
    var islabeled = 0;
    if ((v = re_ref.exec(line)) !== null) {
      islabeled = 1;
      label = v[1].trim();
      line = v[2];
    } 
    return [islabeled,label,line];
  }
  line_is_fence(line){
    return re_fence.test(line.trimLeft());
  }
  line_is_verse(line) {
    return re_verse.test(line.trim());
  }
  line_is_story(line) {
    return re_story.test(line.trim());
  }
  read_caption_style(line) {
    var v;
    var g = {};
    if ((v = re_style.exec(line)) !== null) {
      g = this.string_to_style(v[1].trim());
      line = v[2];
    } 
    return [g,line];
  }
  parse_plitems_for_plst (plitems) {
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
    var k = 0;
    var more = [];
    var v;
    const re_leadspaces = /^(\s*)(.*)$/;
    //
    //var re = /^(\s*)(\+|\-|\*|\d+\.)\s+(.*)$/;
    //
    var re = /^(\s*)/;
    for (var plitem of plitems) {
      var line = plitem[0];
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
        plitem[0] = text;
        text = plitem.join('\n');
        var ds = null;
        var dl = null;
        if (bullet[0] == '-'){
          value = '';
          bull = 'UL';
        } else if (bullet[0] == '*'){
          value = '';
          bull = 'UL';
          ds = this.to_key_item(plitem);
        } else if (bullet[0] == '+'){
          if(lead==''){
            value = '';
            bull = 'DL';
            let dt = plitem[0];
            let dd = plitem.slice(1).join('\n');
            dl = {dt,dd};
          }else{
            value = '';
            bull = 'UL';
          }
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
          var bull0 = levels[levels.length-1][1];
          if (lead0.length < lead.length) {
            action = 'push';
          } else if (levels.length > 1 && lead0.length > lead.length) {
            action = 'pop';
          } else {
            action = 'item';
          }
        }
      } 
      else {
        more.push(plitem);
        continue;
      }

      /// For Japanese language input, the following three
      /// are used for three levels of nesting
      ///  ー \u30fc
      ///  ＋ \uff0b
      ///  ＊ \uff0a

      if (action === 'push') {
        levels.push([lead,bull]);
        more = [];
        items.push({bull});
        items.push({bull:'LI',bullet,value,text,dl,ds,more});
      } else {
        if (action === 'pop') {
          var [lead0,bull0] = levels.pop();
          items.push({bull:`/${bull0}`});
        }
        let n = levels.length;
        var [lead0,bull0] = levels[n-1];
        if(bull0.localeCompare(bull)!==0){
          items.push({bull:`/${bull0}`});
          items.push({bull});
          levels[n-1][1] = bull;//replace
        }
        more = [];
        items.push({bull:'LI',bullet,value,text,dl,ds,more});
      }
    }
    //
    while (levels.length > 0) {
      [lead,bull] = levels.pop();
      bull = `/${bull}`;
      items.push({bull});
    }
    // clean up 'more'
    items.forEach(x => {
      if(x.more){
        x.more = x.more.map(plitem => {
          plitem = this.trim_samp_body(plitem);
          let lines = plitem;
          return {lines};
        })
      }
    })
    //
    return items;
  }
  parse_plitems_for_math (plitems) {
    ///
    /// Parse the paragraph that is PLST
    ///

    var items = [];
    var v;
    plitems.forEach(lines => {
      let s0 = lines[0];
      if((v = re_math.exec(s0))!==null){
        lines[0] = v[2];
        let math = lines.join(' ');
        var label = '';
        if((v=re_ref.exec(math))!==null){
          label = v[1];
          math = v[2];
        }
        items.push({label,math});
      }
    });
    return items;
  }
  to_key_item(ss){
    let cat;
    let word;
    let desc;
    let rb;
    let rt;
    let q;
    let keys = [];
    var v;
    const re_key_bracked = /^\[\s+(.*?)\s+\]\s*(.*)$/;
    const re_key_braced = /^\{\s+(.*?)\s+\}\s*(.*)$/;
    const re_key_quoted = /^('.*?'|".*?")\s*(.*)$/;
    const re_key_coloned = /^(.*?):\s+(.*)$/;
    const re_key_item = /^(\S+)\s*(.*)$/;
    let s = ss[0]||'';
    if ((v = re_key_bracked.exec(s)) !== null) {
      keys = v[1].split(',');
      desc = v[2];
      keys = keys.map(x => x.trim());
      keys = keys.filter(x => x.length);
      keys = keys.map(x => {
        if(x.startsWith(`'`)&&x.endsWith(`'`)){
          word = x;
          cat = 'quoted';
          return({word,cat});
        }
        else if(x.startsWith(`"`)&&x.endsWith(`"`)){
          word = x;
          cat = 'quoted';
          return({word,cat});
        }
        else {
          word = x;
          return({word});
        }
      });
    }
    else if ((v = re_key_braced.exec(s)) !== null) {
      /// { Apple tree } 
      ///   is good
      word = v[1];
      desc = v[2];
      cat = 'braced';
      keys.push({word,cat,rb,rt});
    }
    else if ((v = re_key_quoted.exec(s)) !== null) {
      /// '\hspace <len>' is good
      word = v[1];
      desc = v[2];
      cat = 'quoted';
      keys.push({word,cat});
    }
    else if ((v = re_key_coloned.exec(s)) !== null) {
      /// apple source: this is good
      word = v[1];
      desc = v[2];
      cat = '';
      keys.push({word,cat});
    }
    else {
      if((v = re_key_item.exec(s)) !== null) {
        /// Apple is good
        word = v[1];
        desc = v[2];
      }
      else {
        /// Apple
        word = s;
        desc = '';
      }
      if ((v = re_ruby.exec(word)) !== null) {
        cat = 'rmap';
        rb = v[1];
        rt = v[2];
        this.rmap.push([rb, rt]);
      }
      keys.push({word,cat,rb,rt});
    }
    ss[0] = desc;
    desc = ss.join('\n');
    desc = desc.trim();
    var item = { keys, desc };
    return item;
  }


}

module.exports = { NitrilePreviewParser }
