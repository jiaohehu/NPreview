
class NitrilePreviewAutonum {


    /// assign chapter/section/figure/listing numbers for each block
    /// will change the 'dept' field of the block. Returns
    /// a new block.

  constructor() {

    this.chapnum = 0;
    this.secnum = 0;
    this.subsecnum = 0;
    this.subsubsecnum = 0;
    this.subsubsubsecnum = 0;
    this.subsubsubsubsecnum = 0;
    this.fignum = 0;
    this.lstnum = 0;
    this.tblnum = 0;
    this.eqnnum = 0;
    this.sub = {};

  }

  /// restart as it is required before each rendering
  /// to a new HTML or LATEX
  
  start() {
    this.chapnum = 0;
    this.secnum = 0;
    this.subsecnum = 0;
    this.subsubsecnum = 0;
    this.subsubsubsecnum = 0;
    this.subsubsubsubsecnum = 0;
    this.fignum = 0;
    this.lstnum = 0;
    this.tblnum = 0;
    this.eqnnum = 0;
    this.sub = {};
  }

  /// end, save the 
  end() {
  }

  idenBlocks (all,config,isepub=0) {
      
    var saveasid = 0;
    var saveas = '';
    var refid = '';
    var dept = '';
    var title = '';
    var haschapter = config.ALL.haschapter;
    if(isepub){
      saveasid++;
      saveas = `content${saveasid}.xhtml`;
      refid = `content${saveasid}`;
    }
    for (var block of all) {
      const {id,row1,row2,sig,hdgn,sublevel,data,para,fencecmd,base,subrow,fname} = block;
      if (sig === 'PART') {
        dept = '';
        title = data;
        if (isepub) {
          saveasid++;
          saveas = `content${saveasid}.xhtml`;
          refid = `content${saveasid}`;
        } 
        block.saveasid = saveasid;
        block.saveas = saveas;
        block.refid = refid;
        block.dept = dept;
        block.title = title;
      }
      else if (sig === 'HDGS') {
        var text = data;
        var level = hdgn;
        if (sublevel) {
          level += parseInt(sublevel);
        }
        var idnum = this.idenNewHdgs(level,haschapter);
        console.log(`james: ${idnum} ${level} ${haschapter}`);
        dept = idnum;
        title = text;
        block.idnum = idnum;
        if (isepub && level === 1) {
          saveasid++;
          saveas = `content${saveasid}.xhtml`;
          refid = `content${saveasid}`;
        }
        block.saveasid = saveasid;
        block.saveas = saveas;
        block.refid = refid;
        block.dept = dept;
        block.title = title;
        block.level = level;
      } 
      else {
        block.saveasid = saveasid;
        block.saveas = saveas;
        block.refid = refid;
        block.dept = dept;
        block.title = title;
        var star = fencecmd.star;
        var name = fencecmd.name||'';
        var name = name.toLowerCase();
        if (!star) {
          if (name === 'figure') {
            block.idnum = this.idenFigure(haschapter);
          } else if (name === 'listing') {
            block.idnum = this.idenListing(haschapter);
          } else if (name === 'table') {
            block.idnum = this.idenTable(haschapter);
          } else if (name === 'gathers'||name==='aligns'||name=='equations') {
            var howmany = data.length;
            var pp_idnum = [];
            for (var j=0; j < howmany; ++j) {
              pp_idnum.push(this.idenTable(haschapter));
            }
            block.idnum = pp_idnum.join(',');
          } else if (name === 'subequations') {
            block.idnum = this.idenTable(haschapter);
          } else if (name === 'multline') {
            block.idnum = this.idenTable(haschapter);
          } else if (name === 'split') {
            block.idnum = this.idenTable(haschapter);
          } else if (name === 'equation') {
            block.idnum = this.idenTable(haschapter);
          }
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

  idenFigure (haschapter) {
    this.fignum += 1;
    var fig_text     = `${this.fignum}`;
    if (haschapter) {
      fig_text     = `${this.chapnum}-${this.fignum}`;
    }
    return fig_text;
  }

  idenListing (haschapter) {
    this.lstnum += 1;
    var fig_text     = `${this.lstnum}`;
    if (haschapter) {
      fig_text     = `${this.chapnum}-${this.lstnum}`;
    }
    return fig_text;
  }

  idenTable (haschapter) {
    this.tblnum += 1;
    var fig_text     = `${this.tblnum}`;
    if (haschapter) {
      fig_text     = `${this.chapnum}-${this.tblnum}`;
    }
    return fig_text;
  }

  idenEquation (haschapter) {
    this.eqnnum += 1;
    var fig_text     = `${this.eqnnum}`;
    if (haschapter) {
      fig_text     = `${this.chapnum}-${this.eqnnum}`;
    }
    return fig_text;
  }

  /// return an array of 
  ///
  /// [dept fig]

  idenHeading (level,haschapter) {

    /// For isarticle, then 1=>section, 2=>subsection, 3=>subsubsection
    /// For haschapter, then 1=>chapter, 2=>section, 3=>subsection

    var dept_text = '';
    var cat = level;
    if (!haschapter) {
      cat += 1;
    }
    if (cat <= 0) {
      return '';
    }
    switch (cat) {
      case 1:
        this.chapnum += 1;
        this.secnum = 0;
        this.subsecnum = 0;
        this.subsubsecnum = 0;
        this.subsubsubsecnum = 0;
        this.subsubsubsubsecnum = 0;
        this.fignum = 0;
        this.lstnum = 0;
        this.eqnnum = 0;
        if (!haschapter) {
          dept_text = ''
        } else {
          dept_text = `${this.chapnum}`;
        }
        break;
      case 2:
        this.secnum += 1;
        this.subsecnum = 0;
        this.subsubsecnum = 0;
        this.subsubsubsecnum = 0;
        this.subsubsubsubsecnum = 0;
        if (!haschapter) {
          dept_text = `${this.secnum}`;
        } else {
          dept_text = `${this.chapnum}.${this.secnum}`;
        }
        break;
      case 3:
        this.subsecnum += 1;
        this.subsubsecnum = 0;
        this.subsubsubsecnum = 0;
        this.subsubsubsubsecnum = 0;
        if (!haschapter) {
          dept_text = `${this.secnum}.${this.subsecnum}`;
        } else {
          dept_text = `${this.chapnum}.${this.secnum}.${this.subsecnum}`;
        }
        break;
      case 4:
        this.subsubsecnum += 1;
        this.subsubsubsecnum = 0;
        this.subsubsubsubsecnum = 0;
        if (!haschapter) {
          dept_text = `${this.secnum}.${this.subsecnum}.${this.subsubsecnum}`;
        } else {
          dept_text = `${this.chapnum}.${this.secnum}.${this.subsecnum}.${this.subsubsecnum}`;
        }
        break;
      case 5:
        this.subsubsubsecnum += 1;
        this.subsubsubsubsecnum = 0;
        if (!haschapter) {
          dept_text = `${this.secnum}.${this.subsecnum}.${this.subsubsecnum}.${this.subsubsubsecnum}`;
        } else {
          dept_text = `${this.chapnum}.${this.secnum}.${this.subsecnum}.${this.subsubsecnum}.${this.subsubsubsecnum}`;
        }
        break;
      default:
        this.subsubsubsubsecnum += 1;
        if (!haschapter) {
          dept_text = `${this.secnum}.${this.subsecnum}.${this.subsubsecnum}.${this.subsubsubsecnum}.${this.subsubsubsubsecnum}`;
        } else {
          dept_text = `${this.chapnum}.${this.secnum}.${this.subsecnum}.${this.subsubsecnum}.${this.subsubsubsecnum}.${this.subsubsubsubsecnum}`;
        }
        break;
    }
    /// overwrite the 'dept' field of block
    return dept_text;
  }

}

module.exports = { NitrilePreviewAutonum };
