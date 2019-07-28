
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

  /// return an array of 
  ///
  /// [dept fig]

  idenBlock (config,block,plevel,isarticle) {

    var dept_text = '';
    var fig_text = '';
    const [id,row1,row2,sig,n,data,para,fencecmd,dept,fig,caption,base,label,fname] = block;
    switch (sig) {
      case 'HDGS': {
        var [cat,text,flags] = data;
        if (plevel) {
          cat += plevel;
        }
        switch (cat) {
          case 0:
            this.chapnum += 1;
            this.secnum = 0;
            this.subsecnum = 0;
            this.subsubsecnum = 0;
            this.subsubsubsecnum = 0;
            this.subsubsubsubsecnum = 0;
            this.fignum = 0;
            this.lstnum = 0;
            this.eqnnum = 0;
            if (isarticle) {
              dept_text = 'title'
            } else {
              dept_text = `${this.chapnum}`;
            }
            break;
          case 1:
            this.secnum += 1;
            this.subsecnum = 0;
            this.subsubsecnum = 0;
            this.subsubsubsecnum = 0;
            this.subsubsubsubsecnum = 0;
            if (isarticle) {
              dept_text = `${this.secnum}`;
            } else {
              dept_text = `${this.chapnum}.${this.secnum}`;
            }
            break;
          case 2:
            this.subsecnum += 1;
            this.subsubsecnum = 0;
            this.subsubsubsecnum = 0;
            this.subsubsubsubsecnum = 0;
            if (isarticle) {
              dept_text = `${this.secnum}.${this.subsecnum}`;
            } else {
              dept_text = `${this.chapnum}.${this.secnum}.${this.subsecnum}`;
            }
            break;
          case 3:
            this.subsubsecnum += 1;
            this.subsubsubsecnum = 0;
            this.subsubsubsubsecnum = 0;
            if (isarticle) {
              dept_text = `${this.secnum}.${this.subsecnum}.${this.subsubsecnum}`;
            } else {
              dept_text = `${this.chapnum}.${this.secnum}.${this.subsecnum}.${this.subsubsecnum}`;
            }
            break;
          case 4:
            this.subsubsubsecnum += 1;
            this.subsubsubsubsecnum = 0;
            if (isarticle) {
              dept_text = `${this.secnum}.${this.subsecnum}.${this.subsubsecnum}.${this.subsubsubsecnum}`;
            } else {
              dept_text = `${this.chapnum}.${this.secnum}.${this.subsecnum}.${this.subsubsecnum}.${this.subsubsubsecnum}`;
            }
            break;
          default:
            this.subsubsubsubsecnum += 1;
            if (isarticle) {
              dept_text = `${this.secnum}.${this.subsecnum}.${this.subsubsecnum}.${this.subsubsubsecnum}.${this.subsubsubsubsecnum}`;
            } else {
              dept_text = `${this.chapnum}.${this.secnum}.${this.subsecnum}.${this.subsubsecnum}.${this.subsubsubsecnum}.${this.subsubsubsubsecnum}`;
            }
            break;
        }
        break;
      }
      case 'PICT': {
        if (caption) {
          this.fignum += 1;
          fig_text     = `${this.fignum}`;
          if (!isarticle) {
            fig_text     = `${this.chapnum}-${this.fignum}`;
          }
        }
        break;
      }
      case 'CODE': {
        if (caption) {
          this.lstnum += 1;
          fig_text     = `${this.lstnum}`;
          if (!isarticle) {
            fig_text     = `${this.chapnum}-${this.lstnum}`;
          }
        }
        break;
      }
      case 'TABB': {
        if (caption) {
          this.tblnum += 1;
          fig_text     = `${this.tblnum}`;
          if (!isarticle) {
            fig_text     = `${this.chapnum}-${this.tblnum}`;
          }
        }
        break;
      }
      case 'EQTN': {
        this.eqnnum += 1;
        fig_text     = `${this.eqnnum}`;
        if (!isarticle) {
          fig_text     = `${this.chapnum}-${this.eqnnum}`;
        }
        break;
      }
      default: {
        break;
      }
    }
    /// overwrite the 'dept' field of block
    return [dept_text, fig_text];
  }
}

module.exports = { NitrilePreviewAutonum };
