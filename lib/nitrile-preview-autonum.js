
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

  idenBlocks () {

    /// this method will insert following properties to each block:
    ///    saveasid, saveas, refid, dept, level, idnum, id
      
    var saveasid = 0;
    var saveas = '';
    var refid = '';
    var dept = '';
    var level = 0;
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
      var {id,row1,row2,sig,hdgn,name,sublevel,text,float,caption,label} = block;
      caption=caption||'';
      label=label||'';
      block.caption = caption;
      block.label = label;
      totaln++;

      if (sig === 'HDGS') {

        if(name=='part'){

          level = 0;
          block.level = level;

          var idnum = this.parser.toPartNum(this.partnum++);
          dept = idnum;
          if (this.parser.isepub && level <= 1) {
            saveasid++;
            saveas = `content${saveasid}.xhtml`;
            refid = `content${saveasid}`;
          } 
          block.id = `${idname}${totaln}`;
          block.saveasid = saveasid;
          block.saveas = saveas;
          block.refid = refid;
          block.dept = dept;
          block.title = text;
          block.idnum = idnum;
          title = text;
          ++part_n;
          
        } else if (name=='h'){
          
          level = parseInt(sublevel) + parseInt(hdgn);
          block.level = level;
  
          var idnum = this.idenNewHdgs(level);
          dept = idnum;
          if (this.parser.isepub && level <= 1) {
            saveasid++;
            saveas = `content${saveasid}.xhtml`;
            refid = `content${saveasid}`;
          }
          block.id = `${idname}${totaln}`;
          block.saveasid = saveasid;
          block.saveas = saveas;
          block.refid = refid;
          block.dept = dept;
          block.title = text;
          block.idnum = dept;
          title = text;
        
        } else if(hdgn==0){

          /// this is "standalone"

          // no 'name', this is a standalone doc
          level = 0;
          block.name = 'h';
          block.level = level;
          if(this.parser.isepub){
            saveasid++;
            saveas = `content${saveasid}.xhtml`;
            refid = `content${saveasid}`;
          }
          block.id = `${idname}${totaln}`;
          block.saveasid = saveasid;
          block.saveas = saveas;
          block.refid = refid;
          block.dept = '';
          block.title = text;
          block.idnum = '';
          title = text;

        } else if(hdgn > 0){

          /// this is "standalone"

          level = hdgn;  // level starts with 1
          block.name = 'h';
          block.level = level;

          var idnum = this.idenNewHdgs(hdgn);
          dept = idnum;
          if (this.parser.isepub && level <= 1) {
            saveasid++;
            saveas = `content${saveasid}.xhtml`;
            refid = `content${saveasid}`;
          }
          block.id = `${idname}${totaln}`;
          block.saveasid = saveasid;
          block.saveas = saveas;
          block.refid = refid;
          block.dept = dept;
          block.title = text;
          block.idnum = dept;
          title = text;

        }
          
      } else { 

        ///not hdgs here

        block.name = 'h';
        block.level = level;
        block.id = `${idname}${totaln}`;
        block.saveasid = saveasid;
        block.saveas = saveas;
        block.refid = refid;
        block.dept = dept;
        block.title = title;
        block.idnum = '';
        if (sig  === 'PICT' && float && label) {
          block.idnum = this.idenFigure();
          block.floatname = 'Fig';
        } else if (sig  === 'DIAG' && float && label) {
          block.idnum = this.idenFigure();
          block.floatname = 'Fig';
        } else if (sig  === 'FRMD' && float && label) {
          block.idnum = this.idenFigure();
          block.floatname = 'Fig';
        } else if (sig === 'PROG' && float && label) {
          block.idnum = this.idenListing();
          block.floatname = 'Prg';
        } else if (sig === 'TABR' && float && label) {
          block.idnum = this.idenTable();
          block.floatname = 'Tbl';
        } else if (sig == 'MATH' && label) {
          block.idnum = this.idenEquation();
          block.floatname = 'Eq';
          if(block.more){
            var n = 0;
            for(let i=0; i < block.more.length; ++i){
              var more = block.more[i];
              if(more.label){
                n++;
              } 
            }
            if(label){
              for(let i=0; i < block.more.length; ++i){
                var more = block.more[i];
                more.idnum = this.idenEquation();
              }
            }
          }
        } 
      }
    }

    this.parser.part_n = part_n;
    this.parser.chap_n = chap_n;
    this.parser.sect_n = sect_n;
  }

  idenNewHdgs(hdgn) {
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

  idenFigure () {
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

  idenTable () {
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

  idenEquation () {
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
