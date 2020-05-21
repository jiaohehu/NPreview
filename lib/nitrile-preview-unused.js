
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
