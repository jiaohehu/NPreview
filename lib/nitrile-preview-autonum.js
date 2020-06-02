
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

  }

  idenBlocks (all,config,idname,isepub=0) {

    /// this method will insert following properties to each block:
    ///    saveasid, saveas, refid, dept, title, level, idnum, id
      
    var saveasid = 0;
    var saveas = '';
    var refid = '';
    var dept = '';
    var title = '';
    var level = 0;
    var text = '';
    var haschapter = 0;
    var totaln = 0;
    
    if(idname) {
      idname = `${idname}-`;
    }

    ///if epub, always advance one so 'saveasid' is set to 1 to begin with
    if(isepub){
      saveasid++;
      saveas = `content${saveasid}.xhtml`;
      refid = `content${saveasid}`;
    }

    for (var block of all) {
      var {id,row1,row2,sig,part,title,hdgn,sublevel,data,caption,label} = block;
      caption=caption||'';
      label=label||'';
      block.caption = caption;
      block.label = label;
      totaln++;

      if (sig === 'HDGS' && part) {
        dept = this.parser.toPartNum(this.partnum++);
        if (isepub) {
          saveasid++;
          saveas = `content${saveasid}.xhtml`;
          refid = `content${saveasid}`;
        } 
        block.id = `${idname}${totaln}`;
        block.saveasid = saveasid;
        block.saveas = saveas;
        block.refid = refid;
        block.dept = dept;
        block.idnum = dept;

      } else if (sig === 'HDGS') {

        level = hdgn;
        if (sublevel) {
          level += parseInt(sublevel);
        }
        var idnum = this.idenNewHdgs(level,haschapter);
        dept = idnum;
        if (isepub && level === 1) {
          saveasid++;
          saveas = `content${saveasid}.xhtml`;
          refid = `content${saveasid}`;
        }
        block.id = `${idname}${totaln}`;
        block.saveasid = saveasid;
        block.saveas = saveas;
        block.refid = refid;
        block.dept = dept;
        block.level = level;
        block.idnum = dept;

      } else {

        block.id = `${idname}${totaln}`;
        block.saveasid = saveasid;
        block.saveas = saveas;
        block.refid = refid;
        block.dept = dept;
        block.level = level;
        block.idnum = '';
        if (sig  === 'PICT' && label) {
          block.idnum = this.idenFigure(haschapter);
        } else if (sig === 'VERB' && label) {
          block.idnum = this.idenListing(haschapter);
        } else if (sig === 'TABR' && label) {
          block.idnum = this.idenTable(haschapter);
        } else if (sig == 'MATH' && label) {
          var howmany = label.split(',').length;
          var pp_idnum = [];
          for (var j=0; j < howmany; ++j) {
            pp_idnum.push(this.idenEquation(haschapter));
          }
          block.idnum = pp_idnum.join(',');
        } 
      }
    }
  }

  idenNewHdgs(level,haschapter) {
    var vv = [];
    if(level > 0) {
      var o = this.sub;
      for(; level > 0; level--){
        var counter = o.counter||0;
        var sub = o.sub||{};
        o.counter = counter;
        o.sub = sub;
        if (level==1) {
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

  idenFigure (haschapter) {
    var o = this.sub;
    if (haschapter) {
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
    if(haschapter){
      return `${this.chapnum()}-${o.fignum}`;
    } else {
      return `${o.fignum}`;
    }
  }

  idenListing (haschapter) {
    var o = this.sub;
    if (haschapter) {
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
    if(haschapter){
      return `${this.chapnum()}-${o.lstnum}`;
    } else {
      return `${o.lstnum}`;
    }
  }

  idenTable (haschapter) {
    var o = this.sub;
    if (haschapter) {
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
    if(haschapter){
      return `${this.chapnum()}-${o.tblnum}`;
    } else {
      return `${o.tblnum}`;
    }
  }

  idenEquation (haschapter) {
    var o = this.sub;
    if (haschapter) {
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
    if(haschapter){
      return `${this.chapnum()}-${o.eqnnum}`;
    } else {
      return `${o.eqnnum}`;
    }
  }

}

module.exports = { NitrilePreviewAutonum };
