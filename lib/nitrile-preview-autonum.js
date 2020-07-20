
class NitrilePreviewAutonum {


    /// assign chapter/section/figure/listing numbers for each block
    /// will change the 'dept' field of the block. Returns
    /// a new block.

  constructor(parser) {
    this.parser = parser;
    this.partnum = 0;
    this.fignum = 0;
    this.lstnum = 0;
    this.tblnum = 0;
    this.eqnnum = 0;
    this.sub = {};
    this.haschapter = 0;

  }

  iden_blocks() {

    /// this method will insert following properties to each block:
    ///    saveasid, saveas, refid, dept, idnum, id
      
    var saveasid = 0;
    var saveas = '';
    var refid = '';
    var dept = '';
    var text = '';
    var title = '';
    var totaln = 0;
    var idname = this.parser.idname;
    var part_n = 0;
    var chap_n = 0;
    var sect_n = 0;
    var ismaster = this.parser.ismaster;
    
    if(idname) {
      idname = `${idname}-`;
    }

    ///if epub, always advance one so 'saveasid' is set to 1 to begin with
    if(this.parser.isepub){
      saveasid++;
      saveas = `content${saveasid}.xhtml`;
      refid = `content${saveasid}`;
    }

    for (var block of this.parser.blocks) {
      var {id,row1,row2,sig,hdgn,name,subn,text,caption,label,islabeled} = block;
      caption=caption||'';
      label=label||'';
      block.caption = caption;
      block.label = label;
      totaln++;

      if (sig === 'HDGS') {

        if(name=='part'){

          if (this.parser.isepub) {
            saveasid++;
            saveas = `content${saveasid}.xhtml`;
            refid = `content${saveasid}`;
          } 

          var idnum = this.parser.toPartNum(this.partnum++);
          dept = idnum;
          title = text;

          block.id = `${idname}${totaln}`;
          block.saveasid = saveasid;
          block.saveas = saveas;
          block.refid = refid;
          block.dept = dept;
          block.title = title;
          block.idnum = idnum;
          ++part_n;
          
        } else if (name=='h'){
          
          if (this.parser.isepub) {
            saveasid++;
            saveas = `content${saveasid}.xhtml`;
            refid = `content${saveasid}`;
          }

          let level = parseInt(subn) + parseInt(hdgn);
          var idnum = this.iden_hdgs(1+level);//1=chapter, 2=section
          dept = idnum;
          title = text;

          block.id = `${idname}${totaln}`;
          block.saveasid = saveasid;
          block.saveas = saveas;
          block.refid = refid;
          block.dept = dept;
          block.title = title;
          block.idnum = dept;
        
        } else if(hdgn==0){

          // for EPUB start a new page
          if(this.parser.isepub){
            saveasid++;
            saveas = `content${saveasid}.xhtml`;
            refid = `content${saveasid}`;
          }

          block.id = `${idname}${totaln}`;
          block.saveasid = saveasid;
          block.saveas = saveas;
          block.refid = refid;

        } else if(hdgn > 0){

          // for EPUB start a new page
          if (this.parser.isepub && hdgn == 1) {
            saveasid++;
            saveas = `content${saveasid}.xhtml`;
            refid = `content${saveasid}`;
          }

          var idnum = this.iden_hdgs(hdgn);
          dept = idnum;
          title = text;

          block.id = `${idname}${totaln}`;
          block.saveasid = saveasid;
          block.saveas = saveas;
          block.refid = refid;
          block.dept = dept;
          block.title = text;
          block.idnum = idnum;

        }
          
      } else { 

        ///This is not a HDGS block

        block.id = `${idname}${totaln}`;
        
        /// following are assigned to be the same as the last
        //HDGS block
        block.saveasid = saveasid;
        block.saveas = saveas;
        block.refid = refid;
        block.dept = dept;
        block.title = title;

        ///The idnum is assigned to be the figure, table, or
        //program number
        block.idnum = '';
        if (sig  === 'PICT' && islabeled) {
          block.idnum = this.iden_figure();
        } else if (sig  === 'DIAG' && islabeled) {
          block.idnum = this.iden_figure();
        } else if (sig  === 'FRMD' && islabeled) {
          block.idnum = this.iden_figure();
        } else if (sig === 'PROG' && islabeled) {
          block.idnum = this.iden_figure();
        } else if (sig === 'TABR' && islabeled) {
          block.idnum = this.iden_table();
        } else if (sig == 'MATH' && islabeled) {
          block.idnum = this.iden_equation();
          for(let i=0; i < block.more.length; ++i){
            var more = block.more[i];
            more.idnum = this.iden_equation();
          }
        } 
      }
    }

    this.parser.part_n = part_n;
    this.parser.chap_n = chap_n;
    this.parser.sect_n = sect_n;
  }

  iden_hdgs(hdgn) {
    var vv = [];
    if(hdgn > 0) {
      var o = this.sub;
      for(; hdgn > 0; hdgn--){
        var counter = o.counter||0;
        var sub = o.sub||{};
        o.counter = counter;
        o.sub = sub;
        if (hdgn==1) {
          o.counter += 1;
          vv.push(o.counter);
          o.sub = {};
          break;
        } else {
          vv.push(o.counter);
          o = o.sub;
        }
      }
    }
    return vv.join('.');
  }

  chapnum() {
    if(this.sub.counter) {
      return this.sub.counter;
    }
    return 0;
  }

  iden_figure () {
    var o = this.sub;
    if (this.haschapter) {
      o = o.sub;
      if(!o) {
        o.sub = {};
        o = o.sub;
      }
    }
    if (!o.fignum) {
      o.fignum = 1;
    } else {
      o.fignum += 1;
    }
    if(this.haschapter){
      return `${this.chapnum()}-${o.fignum}`;
    } else {
      return `${o.fignum}`;
    }
  }

  idenListing () {
    var o = this.sub;
    if (this.haschapter) {
      o = o.sub;
      if(!o) {
        o.sub = {};
        o = o.sub;
      }
    }
    if (!o.lstnum) {
      o.lstnum = 1;
    } else {
      o.lstnum += 1;
    }
    if(this.haschapter){
      return `${this.chapnum()}-${o.lstnum}`;
    } else {
      return `${o.lstnum}`;
    }
  }

  iden_table () {
    var o = this.sub;
    if (this.haschapter) {
      o = o.sub;
      if(!o) {
        o.sub = {};
        o = o.sub;
      }
    }
    if (!o.tblnum) {
      o.tblnum = 1;
    } else {
      o.tblnum += 1;
    }
    if(this.haschapter){
      return `${this.chapnum()}-${o.tblnum}`;
    } else {
      return `${o.tblnum}`;
    }
  }

  iden_equation () {
    var o = this.sub;
    if (this.haschapter) {
      o = o.sub;
      if(!o) {
        o.sub = {};
        o = o.sub;
      }
    }
    if (!o.eqnnum) {
      o.eqnnum = 1;
    } else {
      o.eqnnum += 1;
    }
    if(this.haschapter){
      return `${this.chapnum()}-${o.eqnnum}`;
    } else {
      return `${o.eqnnum}`;
    }
  }

}

module.exports = { NitrilePreviewAutonum };
