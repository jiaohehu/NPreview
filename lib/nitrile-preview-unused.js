
  translateHtml (all,config,ispreview=false,editorrow=-1,editorcolumn=-1) {

    var dispatch = {
      'PART': this.do_part,
      'HDGS': this.do_hdgs,
      'DLST': this.do_dlst,
      'PLST': this.do_plst,
      'VERB': this.do_verb,
      'ITEM': this.do_item,
      'LIST': this.do_list,
      'SAMP': this.do_samp,
      'HRLE': this.do_hrle,
      'PRIM': this.do_prim,
      'SECO': this.do_seco,
      'TEXT': this.do_text,
      'INCL': this.do_incl,
      'QUOT': this.do_quot,
      'TBLR': this.do_tblr,
      'LONG': this.do_long,
      'IMGS': this.do_imgs,
      'TABB': this.do_tabb,
      'DIAG': this.do_diag,
      'MATH': this.do_math,
      'FRMD': this.do_frmd,
      'VERS': this.do_vers
    };

    ///
    /// Translate to HTML, returning an array of
    /// lines.
    ///
    /// sub: is an object
    ///

    var o = [];
    var heading = '';
    this.blockcount = 1;
    this.block = [];
    this.blocks = all;
    this.config = config;
    this.haschapter = config.ALL.haschapter;
    for (var block of all) {
      var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
      this.blockcount++;///will be cleared by a HDGS
      this.block = block;
      this.base = base;
      var fencecmd = this.updateFencecmd(fencecmd,sig,config);
      var caption = fencecmd.caption?fencecmd.caption:'';
      const star = fencecmd.star;
      this.fs = fencecmd.fs;
      this.xcssfontsize = this.toCssFontsize(this.fs);
      this.xleft = this.to_stepmargin(config.ALL.stepmargin);
      this.xnumbers = this.to_numbers(fencecmd.numbers);
      this.xnumbersep = this.to_numbersep(fencecmd.numbersep);
      this.xnormalfontsize = this.to_normalfontsize(config.HTML.normalfontsize);
      this.xparatype = this.to_paratype(fencecmd.paratype);
      this.xindent = this.to_indent(fencecmd.indent);
      this.sig = sig;
      this.saveas = fencecmd.saveas;
      this.refid = fencecmd.refid;
      const label_text = (fencecmd.label) ? `${base}-${fencecmd.label}` : '';
      const caption_text = this.unmask(caption);
      this.label_text = label_text;
      this.caption_text = caption_text;
      this.xname = fencecmd.name||'';
      this.xidnum = block.idnum||'';
      /// turn off showing of blocks if outlineviewing is on
      if (ispreview && typeof subrow==='number') {
        if (sig === 'PART') {
        } else if (sig === 'HDGS') {
        } else if (sig === 'ERRO') {
        } else if (editorcolumn==0 && editorrow==subrow) {
        } else {
          ///do not show this block
          continue;
        }
      }
      if (dispatch[sig]) {
        var func = dispatch[sig];
        func.call(this,block);
      }
    }
  }
  translateLatex (all,config) {

    var dispatch = {
      'PART': this.do_part,
      'HDGS': this.do_hdgs,
      'DLST': this.do_dlst,
      'PLST': this.do_plst,
      'VERB': this.do_verb,
      'ITEM': this.do_item,
      'LIST': this.do_list,
      'SAMP': this.do_samp,
      'HRLE': this.do_hrle,
      'PRIM': this.do_prim,
      'SECO': this.do_seco,
      'TEXT': this.do_text,
      'INCL': this.do_incl,
      'QUOT': this.do_quot,
      'TBLR': this.do_tblr,
      'LONG': this.do_long,
      'IMGS': this.do_imgs,
      'TABB': this.do_tabb,
      'DIAG': this.do_diag,
      'MATH': this.do_math,
      'FRMD': this.do_frmd,
      'VERS': this.do_vers
    };

    /// the 'blocks' argument is an array of blocks; the 'haschapter'
    /// is a Boolean type set to true only when generating an 'report'
    /// document type, such that HDGS/0 will be treated as the title
    /// of the document and not a chapter.

    var o = [];
    this.block = [];
    this.config = config;
    this.haschapter = config.ALL.haschapter;
    for (var block of all) {
      var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
      this.block = block;
      this.base = base;
      this.row1 = row1;
      this.row2 = row2;
      this.fname = fname;
      var fencecmd = this.updateFencecmd(fencecmd,sig,config);
      const star = fencecmd.star;
      const label_text = fencecmd.baselabel;
      const label_cmd = (label_text && !star)?`\\label{${label_text}}`:'';
      const caption_text = (fencecmd.caption)?this.unmask(fencecmd.caption):'';
      this.fs = fencecmd.fs;
      this.xlatexfontsize = this.toLatexFontsize(this.fs);
      this.xleft = this.to_stepmargin(config.ALL.stepmargin);
      this.xnumbers = this.to_numbers(fencecmd.numbers);
      this.xnumbersep = this.to_numbersep(fencecmd.numbersep);
      this.xparatype = this.to_paratype(fencecmd.paratype);
      this.xindent = this.to_indent(fencecmd.indent);
      this.sig = sig;
      this.label_text = label_text;
      this.label_cmd = label_cmd;
      this.caption_text = caption_text;
      if (dispatch[sig]) {
        var func = dispatch[sig];
        func.call(this,block);
      }
    }
  }

  // The old do_dlst for CONTEX, where the setupnarrower is used
  // to create indentation for text description. The latest 
  // implementation has been changed to use \latexdesc 
  // instead.
  _do_dlst(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    o.push(`%DLST`);
    o.push(`\\blank`);
    for (var item of data) {
      var [keys,text] = item;
      keys = keys.map( x => this.escape(x) );
      text = this.unmask(text);
      keys = keys.map( x => `\\bf{}${x}` );
      keys = keys.map( x => `\\noindent{${x}}` );
      o.push(keys.join('\\\\'));
      o.push(`\\setupnarrower[left=${fencecmd.left}mm]`);
      o.push(`\\startnarrower[left]`);
      if(text){
        o.push(`\\noindent ${text}`);
      }
      o.push(`\\stopnarrower`);
    }
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
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
