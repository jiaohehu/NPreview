
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
  }

  /// end, save the 
  end() {
  }

  idenBlocks (all,config) {
      
    var saveasid = 0;
    var isreport = config.ALL.isReport;
    for (var block of all) {
      const [id,row1,row2,sig,subrow,data,para,fencecmd,star,base,label,fname] = block;
      if (sig === 'PART') {
        fencecmd.saveasid = ++saveasid;///increase by 1
      }
      else if (sig === 'HDGS') {
        var [hdgn,text] = data;
        var idnum = this.idenHeading(hdgn,isreport);
        fencecmd.idnum = idnum;
        if (hdgn === 1) {
          fencecmd.saveasid = ++saveasid;///increase by 1
        } else {
          fencecmd.saveasid = saveasid;///maintain the same id
        }
      } 
      else {
        fencecmd.saveasid = saveasid;///maintain the same id
        if (!fencecmd.star) {
          if (fencecmd.name === 'Figure') {
            fencecmd.idnum = this.idenFigure(isreport);
          } else if (fencecmd.name === 'Listing') {
            fencecmd.idnum = this.idenListing(isreport);
          } else if (fencecmd.name === 'Table') {
            fencecmd.idnum = this.idenTable(isreport);
          } else if (fencecmd.name === 'Gathers'||fencecmd.name === 'Aligns') {
            var howmany = data.length;
            var pp_idnum = [];
            for (var j=0; j < howmany; ++j) {
              pp_idnum.push(this.idenTable(isreport));
            }
            fencecmd.idnum = pp_idnum.join(',');
          } else if (fencecmd.name === 'Subequations') {
            fencecmd.idnum = this.idenTable(isreport);
          } else if (fencecmd.name === 'Multline') {
            fencecmd.idnum = this.idenTable(isreport);
          } else if (fencecmd.name === 'Equationsplit') {
            fencecmd.idnum = this.idenTable(isreport);
          } else if (fencecmd.name === 'Equation') {
            fencecmd.idnum = this.idenTable(isreport);
          }
        }
      }
    }
    return all;
  }

  idenFigure (isreport) {
    this.fignum += 1;
    var fig_text     = `${this.fignum}`;
    if (isreport) {
      fig_text     = `${this.chapnum}-${this.fignum}`;
    }
    return fig_text;
  }

  idenListing (isreport) {
    this.lstnum += 1;
    var fig_text     = `${this.lstnum}`;
    if (isreport) {
      fig_text     = `${this.chapnum}-${this.lstnum}`;
    }
    return fig_text;
  }

  idenTable (isreport) {
    this.tblnum += 1;
    var fig_text     = `${this.tblnum}`;
    if (isreport) {
      fig_text     = `${this.chapnum}-${this.tblnum}`;
    }
    return fig_text;
  }

  idenEquation (isreport) {
    this.eqnnum += 1;
    var fig_text     = `${this.eqnnum}`;
    if (isreport) {
      fig_text     = `${this.chapnum}-${this.eqnnum}`;
    }
    return fig_text;
  }

  /// return an array of 
  ///
  /// [dept fig]

  idenHeading (hdgn,isreport) {

    /// For isarticle, then 1=>section, 2=>subsection, 3=>subsubsection
    /// For isreport, then 1=>chapter, 2=>section, 3=>subsection

    var dept_text = '';
    var cat = hdgn;
    if (!isreport) {
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
        if (!isreport) {
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
        if (!isreport) {
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
        if (!isreport) {
          dept_text = `${this.secnum}.${this.subsecnum}`;
        } else {
          dept_text = `${this.chapnum}.${this.secnum}.${this.subsecnum}`;
        }
        break;
      case 4:
        this.subsubsecnum += 1;
        this.subsubsubsecnum = 0;
        this.subsubsubsubsecnum = 0;
        if (!isreport) {
          dept_text = `${this.secnum}.${this.subsecnum}.${this.subsubsecnum}`;
        } else {
          dept_text = `${this.chapnum}.${this.secnum}.${this.subsecnum}.${this.subsubsecnum}`;
        }
        break;
      case 5:
        this.subsubsubsecnum += 1;
        this.subsubsubsubsecnum = 0;
        if (!isreport) {
          dept_text = `${this.secnum}.${this.subsecnum}.${this.subsubsecnum}.${this.subsubsubsecnum}`;
        } else {
          dept_text = `${this.chapnum}.${this.secnum}.${this.subsecnum}.${this.subsubsecnum}.${this.subsubsubsecnum}`;
        }
        break;
      default:
        this.subsubsubsubsecnum += 1;
        if (!isreport) {
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
