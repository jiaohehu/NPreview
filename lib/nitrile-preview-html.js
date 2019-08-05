'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');
const N_lstlisting_numbers_xleftmargin = .75;/// additional left margin in cm for when lstlisting is numbered

class NitrilePreviewHtml extends NitrilePreviewParser {

  constructor() {
    super();
    this.tokenizer = new NitrilePreviewTokenizer();
    this.images = new Map();/// this is a image src -> base64-encoded string map
    this.view = null; /// this is a NitrilePreviewView object
    this.imgid = 0;

    this.titlecssstyle = `\
font-size:175%; \
text-align:center; \
`

    this.authorcssstyle = `\
font-size:large; \
text-align:center; \
`

    this.datecssstyle = `\
font-size:large; \
text-align:center; \
`

    this.partcssstyle = `\
background-color:inherit; \
color:inherit; \
font-size:xx-large; \
font-variant:small-caps; \
font-weight:bold; \
position:relative; \
`

    this.chaptercssstyle = `\
background-color:inherit; \
color:inherit; \
font-size:163%; \
font-weight:bold; \
position:relative; \
`

    this.sectioncssstyle = `\
background-color:inherit; \
color:inherit; \
font-size:153%; \
font-weight:bold; \
position:relative; \
`

    this.subsectioncssstyle = `\
background-color:inherit; \
color:inherit; \
font-size:123%; \
font-weight:bold; \
position:relative; \
`

    this.subsubsectioncssstyle = `\
background-color:inherit; \
color:inherit; \
font-size:100%; \
font-weight:bold; \
position:relative; \
`

    this.divcssstyle = `\
margin:1em 0; \
position:relative; \
`

    this.paracssstyle = `\
background-color:inherit; \
color:inherit; \
border:none; \
padding:0; \
margin:0; \
font-size:inherit;
font-weight:inherit;
line-height:1.15; \
`

    this.samplecssstyle = `\
background-color:inherit; \
color:inherit; \
border:none; \
padding:0; \
margin:0; \
font-size:inherit;
font-weight:inherit;
line-height:1.1; \
`

    this.precssstyle = `\
background-color:inherit; \
color:inherit; \
border:none; \
padding:0; \
margin:0; \
font-size:75%; \
font-weight:inherit; \
line-height:1.1; \
overflow:auto; \
`

    this.textcssstyle = `\
background-color:inherit; \
color:inherit; \
padding:inherit; \
`

    this.codecssstyle = `\
background-color:inherit; \
color:inherit; \
padding:inherit; \
font-size:75%; \
`

    this.urlcssstyle = `\
background-color:inherit; \
color:inherit; \
padding:inherit; \
word-break:break-all; \
font-family:monospace; \
font-size:75%; \
`

    this.dtcssstyle = `\
margin-top:0; \
margin-bottom:0; \
line-height:inherit; \
`

    this.ddcssstyle = `\
margin-top:0; \
margin-bottom:0; \
line-height:inherit; \
`

    this.tablecssstyle = `\
overflow-wrap:break-word; \
border-collapse:collapse; \
`

    this.thcssstyle = `\
border-top:1px solid #333; \
border-bottom:1px solid #333; \
padding-top:.3em; \
padding-bottom:.3em; \
`

    this.tdcssstyle = `\
`

    this.tdcssstylefirstrow = `\
padding-top:.3em; \
`

    this.tdcssstylelastrow = `\
padding-bottom:.3em; \
border-bottom:1px solid #333; \
`

    this.tdcssstyleonlyrow = `\
padding-top:.3em; \
padding-bottom:.3em; \
border-bottom:1px solid #333; \
`

    this.acssstyle = `\
color:#337ab7; \
`

  }

  setView (view) {
    this.view = view;
  }

  translateHtml (autonum,config,blocks,isarticle,ispreview,subrow,plevel,o,p) {

    ///
    /// Translate to HTML, returning an array of
    /// lines.
    ///
    /// sub: is an object
    ///

    o = o || [];
    p = p || [];
    var heading = '';
    var dept = '';
    this.block = [];
    this.config = config;
    this.isarticle = isarticle;
    for (var block of blocks) {
      const [id,row1,row2,sig,n,data,para,fencecmd,caption,base,label,fname] = block;
      this.block = block;
      this.base = base;
      const left = n*config.stepmargin;
      const showlabeltext = (ispreview && config.showlabels) ? `<mark style='font-size:small; position:absolute; '>[${label}]</mark>` : '';
      const showidtext    = (ispreview && config.showids   ) ? `<mark style='font-size:small; position:absolute; right:0; '>[${id}]</mark>` : '';
      const [dept1,fig] = autonum.idenBlock(config,block,plevel,isarticle);
      if (dept1) {
        /// dept1 could return an empty string for a non-HDGS block,
        /// in this case we will set it back the last valid one
        dept = dept1;
      }
      switch (sig) {
        case 'PART': {
          var text = data;
          p.push(['PART',id,label,dept,this.escape(text),o.length,'']);
          o.push(`<h2 id='${id}' class='PART' dept='' fName='' subrow='${subrow}' rows='' style='${this.partcssstyle}' >`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}'>`);
          o.push(this.escape(text));
          o.push(`</p>`);
          o.push(`</h2>`);
          o.push('');
          break;
        }
        case 'HDGS': {
          var [cat,text] = data;
          if (plevel) {
            cat += plevel;
          }
          if (cat == 0 && isarticle) {
            /// dont do anything
            break
          }

          switch (cat) {
            case 0:
              if (ispreview && this.isSkippingHdgs(config,dept,cat)) break;
              heading = 'CHAPTER';
              p.push([heading,id,label,dept,this.escape(text),o.length,'']);
              o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${fname}'  subrow='${subrow}' rows='${row1} ${row2}' style='${this.chaptercssstyle}' >`);
              o.push(`${showidtext}`);
              o.push(`Chapter ${dept} &#160; ${this.escape(text)} ${showlabeltext} `);
              o.push(`</h2>`);
              break;
            case 1:
              if (ispreview && this.isSkippingHdgs(config,dept,cat)) break;
              heading = 'SECTION';
              p.push([heading,id,label,dept,this.escape(text),o.length,'']);
              o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.sectioncssstyle}'>`);
              o.push(`${showidtext}`);
              o.push(`${dept} &#160; ${this.escape(text)} ${showlabeltext} `);
              o.push(`</h2>`);
              break;
            case 2:
              if (ispreview && this.isSkippingHdgs(config,dept,cat)) break;
              heading = 'SUBSECTION';
              p.push([heading,id,label,dept,this.escape(text),o.length,'']);
              o.push(`<h3 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.subsectioncssstyle}'>`);
              o.push(`${showidtext}`);
              o.push(`${dept} &#160; ${this.escape(text)} ${showlabeltext} `);
              o.push(`</h3>`);
              break;
            case 3:
              if (ispreview && this.isSkippingHdgs(config,dept,cat)) break;
              heading = 'SUBSUBSECTION';
              p.push([heading,id,label,dept,this.escape(text),o.length,'']);
              o.push(`<h4 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.subsubsectioncssstyle}'>`);
              o.push(`${showidtext}`);
              o.push(`${dept} &#160; ${this.escape(text)} ${showlabeltext} `);
              o.push(`</h4>`);
              break;
            case 4:
              if (ispreview && this.isSkippingHdgs(config,dept,cat)) break;
              heading = 'SUBSUBSUBSECTION';
              p.push([heading,id,label,dept,this.escape(text),o.length,'']);
              o.push(`<h5 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.subsubsectioncssstyle}'>`);
              o.push(`${showidtext}`);
              o.push(`${dept} &#160; ${this.escape(text)} ${showlabeltext} `);
              o.push(`</h5>`);
              break;
            default:
              if (ispreview && this.isSkippingHdgs(config,dept,cat)) break;
              heading = 'SUBSUBSUBSUBSECTION';
              p.push([heading,id,label,dept,this.escape(text),o.length,'']);
              o.push(`<h6 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.subsubsectioncssstyle}'>`);
              o.push(`${showidtext}`);
              o.push(`${dept} &#160; ${this.escape(text)} ${showlabeltext} `);
              o.push(`</h6>`);
              break;
          }
          o.push('');
          break;
        }
        case 'SBJT': {
          if (ispreview && this.isSkipping(config,dept)) break;
          var [cat,text] = data;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${left}cm'>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle} font-size:large; font-weight:bold; text-align:center; ' >`);
          o.push(this.escape(text));
          o.push(`</p>`);
          o.push(`</div>`);
          o.push('');
          break;
        }
        case 'VRSE': {
          if (ispreview && this.isSkipping(config,dept)) break;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${left}cm'>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}' >`);
          for (var text of data) {
            text = this.escape(text);
            text = this.rubify(text);
            o.push(`${text}<br/>`);
          }
          o.push(`</p>`);
          o.push(`</div>`);
          o.push('');
          break;
        }

        case 'SMPL': {
          if (ispreview && this.isSkipping(config,dept)) break;
          var xleft = config.sampmargin;
          var text = this.wrapSample(data,config.sampwrap);
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${xleft}cm; '>`);
          o.push(`${showidtext}`);
          o.push(`<dl style='${this.samplecssstyle}' >`);
          text = text.map( x => this.escape(x) );
          text = text.map( x => this.replaceAllBlanks(x,'&#160;') );
          text = text.map( x => `<dt style='${this.dtcssstyle}' ><code style='${this.codecssstyle}' >${x}</code></dt>` );
          o.push(text.join('\n'));
          o.push(`</dl>`);
          o.push(`</div>`);
          o.push('');
          break;
        }

        case 'VERB':
          if (ispreview && this.isSkipping(config,dept)) break;
          var text = data;
          var [out, vw, vh] = this.toFramedSvg(text,config);

          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${left}cm'>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}; ${(config.verbframe)?'border:1px solid #333; padding:3px; box-sizing:border-box':''}; '>`);
          o.push( `<img style='width:100%; max-width:${vw}px;' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(out)}" />` );
          o.push('</p>');
          o.push(`</div>`);
          o.push('');

          break;

        case 'CODE':
          if (ispreview && this.isSkipping(config,dept)) break;

          var text = data;
          text = this.toFramedCode(text, left, config);

          if (fig) {
            p.push(['CODE',id,label,fig,'',o.length,'']);
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; '>`);
            o.push(`${showidtext}`);
            o.push(`<span> Listing ${fig} : ${this.unmask(caption)} ${showlabeltext} </span>`);
            o.push(text);
            o.push(`</div>`);
            o.push('');

          } else {
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${left}cm'>`);
            o.push(`${showidtext}`);
            o.push(text);
            o.push(`</div>`);
            o.push('');
          }
          break;

        case 'PICT':
          if (ispreview && this.isSkipping(config,dept)) break;
          var text = data;

          /// generate ['image',...] entries in 'p'
          for (var pp of text) {
                pp.forEach( x => {
                    var [image,width,opts,src,srcs,sub] = x;
                    if (image === 'image') {
                      if( src ) {
                        p.push(['image','','','',src,o.length,'']);
                      } else if (srcs.length) {
                        src = srcs[0];///TODO: need to change it so that it picks a right format
                        p.push(['image','','','',src,o.length,'']);
                      }
                    }
                });
          }

          if (fig) {
            p.push(['PICT',id,label,fig,'',o.length,'']);
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; '>`);
            o.push(`${showidtext}`);
            o.push(` <span style='text-align:center' > Figure ${fig}: ${this.unmask(caption)} ${showlabeltext} </span>`);
            o.push(`<p style='${this.paracssstyle}; ${(config.pictframe)?'border:1px solid #333; padding:3px; box-sizing:border-box; ':''}; text-align:center; ' >`);
            o.push(this.toFramedPict(text, config, fencecmd, true, ispreview));
            o.push('</p>');
            o.push('</div>');
            o.push('');

          } else {
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${left}cm; '>`);
            o.push(`${showidtext}`);
            o.push(`<p style='${this.paracssstyle}; ${(config.pictframe)?'border:1px solid #333; padding:3px':''}; text-align:left; ' >`);
            o.push(this.toFramedPict(text, config, fencecmd, false, ispreview));
            o.push('</p>');
            o.push('</div>');
            o.push('');

          }
          break;

        case 'TABB': {
          if (ispreview && this.isSkipping(config,dept)) break;

          var [text,maxj,ww] = data;
          ww = this.toPcolumnsHtml(ww);
          var text = this.toFramedTabb2(text,maxj,ww,fencecmd);
          if (fig) {
            p.push(['TABB',id,label,fig,'',o.length,'']);
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; text-align:center; '>`);
            o.push(`${showidtext}`);
            o.push(` <span> Table ${fig}: ${this.unmask(caption)} ${showlabeltext} </span>`);
            o.push(text);
            o.push('</div>');
            o.push('');
          } else {
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${left}cm'>`);
            o.push(`${showidtext}`);
            o.push(text);
            o.push('</div>');
            o.push('');
          }
          break;
        }

        case 'TABU': {
          if (ispreview && this.isSkipping(config,dept)) break;
          var [text,maxj,ww] = data;
          var text = this.toFramedTabu(text,maxj,ww,fencecmd);
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${left}cm'>`);
          o.push(`${showidtext}`);
          o.push(text);
          o.push('</div>');
          o.push('');
          break;
        }

        case 'QUOT': {
          if (ispreview && this.isSkipping(config,dept)) break;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${left}cm; margin-right:${left}cm; '>`);
          o.push(`${showidtext}`);
          var text = this.escape(data);
          var text = this.rubify(text);
          o.push(`<p style='${this.samplecssstyle}; margin:0; ' >`);
          if (config.quotquotation) {
            o.push('<q>');
            o.push(text);
            o.push('</q>');
          } else {
            o.push(text);
          }
          o.push(`</p>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'TERM': {
          if (ispreview && this.isSkipping(config,dept)) break;
          if (fencecmd.table) {
            var text = data;
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${left}cm'>`);
            o.push(`${showidtext}`);
            o.push(`<table style='${this.paracssstyle}; ${this.tablecssstyle}; table-layout:fixed; width:100%; ' >`);
            o.push(`<colgroup>`);
            o.push(`<col width='30%'/>`);
            o.push(`<col width='70%'/>`);
            o.push(`</colgroup>`);
            o.push(`<tbody>`);
            var rowtotal = text.length/2;
            for (var i=0; i < text.length; i+=2) {
              var rowcount = i/2 + 1;
              var dt = text[i];
              var dd = text[i+1];
              if (i==0) {
                dt = this.escape(dt);
                dd = this.escape(dd);
              } else {
                dt = this.style('mono',dt);
                dd = this.unmask(dd);
              }
              if (i == 0) {
                o.push(`<tr ><th style='text-align:left; ${this.thcssstyle} '>${dt}</th><th style='text-align:left; ${this.thcssstyle} '>${dd}</th></tr>`);
              } else {
                var isfirstrow = (rowcount === 2);
                var islastrow = (rowcount === rowtotal);
                if (isfirstrow && islastrow) {
                  o.push(`<tr ><td style='text-align:left; ${this.tdcssstyleonlyrow} '>${dt}</td><td style='text-align:left; ${this.tdcssstyleonlyrow} '>${dd}</td></tr>`);
                } else if (isfirstrow) {
                  o.push(`<tr ><td style='text-align:left; ${this.tdcssstylefirstrow} '>${dt}</td><td style='text-align:left; ${this.tdcssstylefirstrow} '>${dd}</td></tr>`);
                } else if (islastrow) {
                  o.push(`<tr ><td style='text-align:left; ${this.tdcssstylelastrow} '>${dt}</td><td style='text-align:left; ${this.tdcssstylelastrow} '>${dd}</td></tr>`);
                } else {
                  o.push(`<tr ><td style='text-align:left; ${this.tdcssstyle} '>${dt}</td><td style='text-align:left; ${this.tdcssstyle} '>${dd}</td></tr>`);
                }
              }
            }
            o.push(`</tbody>`);
            o.push(`</table>`);
            o.push('</div>');
            o.push('');
          } else {
            var text = data;
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${left}cm'>`);
            o.push(`${showidtext}`);
            o.push(`<dl style='${this.paracssstyle}' >`);
            for(var i=0; i < text.length; i+=2) {
              var dt = text[i];
              var dd = text[i+1];
              var dt = this.escape(dt);
              var dd = this.unmask(dd);
              o.push(`<dt style='${this.dtcssstyle}' ><code style='${this.codecssstyle}' >${dt}</code></dt>`);
              o.push(`<dd style='${this.ddcssstyle} margin-left:0.5cm; '>${dd}</dd>`);
            }
            o.push('</dl>');
            o.push('</div>');
            o.push('');
          }
          break;
        }
        case 'EQTN': {
          if (ispreview && this.isSkipping(config,dept)) break;
          p.push(['EQTN',id,label,fig,'',o.length,'']);
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle};' >`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}' >`);
          var text = data;
          if (text.length == 1) {
            for (var s of text) {
              s = this.tokenizer.parse(s,true);
              o.push(`<span style='display:block;text-align:center;position:relative'>${s} `);
              o.push(` <span style='position:absolute;right:0px;'>(${fig}) ${showlabeltext} </span>`);
              o.push(`</span> `);
            }
          } else if (text.length > 1) {
            var j = 0;
            for (var s of text) {
              s = this.tokenizer.parse(s,true);
              var subfig = this.toSubfigNum(j);
              o.push(`<span style='display:block;text-align:center;position:relative'>${s} `);
              o.push(` <span style='position:absolute;right:0px;'>(${fig}${subfig}) ${showlabeltext} </span>`);
              o.push(`</span> `);
              j += 1;
            }
          }
          o.push(`</p>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'DESC': {
          if (ispreview && this.isSkipping(config,dept)) break;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}' >`);
          o.push(`${showidtext}`);
          o.push(`<dl style='${this.paracssstyle}' >`);
          var [ cat, keys, text, xn ] = data;
          const xleft = xn*config.stepmargin;
          for (i=0; i < keys.length; ++i) {
            if (cat === 'mono') {
              o.push(`<dt style='${this.dtcssstyle}' ><code style='${this.codecssstyle}' ><b>${this.escape(keys[i])}</b></code></dt>`);
            } else if (cat === 'strong') {
              o.push(`<dt style='${this.dtcssstyle}' ><b>${this.escape(keys[i])}</b></dt>`);
            } else {
              o.push(`<dt style='${this.dtcssstyle}' ><b><i>${this.escape(keys[i])}</i></b></dt>`);
            }
          }
          o.push(`<dd style='margin-left:${xleft}cm; ${this.ddcssstyle}'>${this.unmask(text)}</dd>`);
          o.push('</dl>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PRIM': {
          if (ispreview && this.isSkipping(config,dept)) break;
          var [lead,text] = data;
          o.push(`<div id='${id}' class='PRIM' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}' >`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}' >`);
          o.push(`<b>${this.escape(lead)}</b>`);
          o.push(`${this.unmask(text)}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'SECO': {
          if (ispreview && this.isSkipping(config,dept)) break;
          var [lead,text] = data;
          o.push(`<div id='${id}' class='SECO' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}' >`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}' >`);
          o.push(`&#160; &#160; &#160; <b>${this.escape(lead)}</b>`);
          o.push(`${this.unmask(text)}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PLST': {
          if (ispreview && this.isSkipping(config,dept)) break;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${left}cm'>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}' >`);
          for (var item of data) {
            var [lead,bullet,text] = item;
            bullet = bullet || '';
            text = text || '';
            if (bullet === '-') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `<i>${this.escape(v[1])}</i> ${v[2]} ${this.unmask(v[3])}`;
              } else {
                text = this.unmask(text);
              }
              bullet = '';
            } else if (bullet === '+') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `<code style='${this.codecssstyle}' >${this.escape(v[1])}</code> ${v[2]} ${this.unmask(v[3])}`;
              } else {
                text = this.unmask(text);
              }
              bullet = '';
            } else if (bullet === '*') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `<b>${this.escape(v[1])}</b> ${v[2]} ${this.unmask(v[3])}`;
              } else {
                text = this.unmask(text);
              }
              bullet = '';
            } else if (bullet.match(/^\d+\.$/)) {
              bullet = this.chomp(bullet);
              text = this.unmask(text);
            } else {
              bullet = '';
              text = this.unmask(text);
            }
            if (item.length === 3) {
              switch (lead) {
                case 'OL': {
                  o.push(`<ol style='padding-left:${config.stepmargin}cm;list-style-position:outside;'><li value='${bullet}'>${text}`);
                  break;
                }
                case 'UL': {
                  o.push(`<ul style='padding-left:${config.stepmargin}cm;list-style-position:outside;'><li value='${bullet}'>${text}`);
                  break;
                }
                case 'LI': {
                  o.push(`</li><li value='${bullet}'>${text}`);
                  break;
                }
                case '/OL': {
                  o.push(`</li></ol></li><li value='${bullet}'>${text}`);
                  break;
                }
                case '/UL': {
                  o.push(`</li></ul></li><li value='${bullet}'>${text}`);
                  break;
                }
              }
            } else if (item.length == 1) {
              if (item[0] === '/OL') {
                o.push('</li></ol>');
              } else if (item[0] === '/UL') {
                o.push('</li></ul>');
              }
            }
          }
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case '': {
          if (ispreview && this.isSkipping(config,dept)) break;
          o.push(`<div id='${id}' class='TEXT' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${left}cm'>`);
          o.push(`${showidtext}`);
          var text = this.unmask(data);
          o.push(`<p style='${this.paracssstyle}' >`);
          o.push(`${text}`);
          o.push(`</p>`);
          o.push('</div>');
          o.push('');
          break;
        }
      }
    }
    return [o,p];
  }

  escape (unsafe) {

    ///
    /// Returns a safe string suitable for HTML
    ///

    unsafe = ''+unsafe; /// force it to be a string when it can be a interger
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  style (type, text) {

    ///
    /// return the styled inline text
    ///

    type = type || '';
    switch (type) {
      case 'inlinemath': {
        var s = this.tokenizer.parse(text);
        return `<span style='display:inline-block; '>${s}</span>`;
        break;
      }
      case 'displaymath': {
        var s = this.tokenizer.parse(text,true);
        return `<span style='display:block; text-align:center; '>${s}</span>`;
        break;
      }
      case 'mono': {
        return `<code style='${this.codecssstyle}' >${this.escape(text)}</code>`
        break;
      }
      case 'em': {
        return `<i>${this.escape(text)}</i>`
        break;
      }
      case 'strong': {
        return `<b>${this.escape(text)}</b>`
        break;
      }
      case 'uri': {
        const [cnt,uri] = text;
        if (cnt) {
          return `<span>${this.escape(cnt)}</span> (<span style='${this.urlcssstyle}' >${this.escape(uri)}</span>)`;
        } else {
          return `<span style='${this.urlcssstyle}' >${this.escape(uri)}</span>`
        }
        break;
      }
      case 'ruby': {
        const [rb,rt] = text;
        return `<ruby><rb>${this.escape(rb)}</rb><rt>${this.escape(rt)}</rt></ruby>`
        break;
      }
      case 'ref': {
        let label = text;
        return `[#](${label})`
        break;
      }
      default: {
        return `<span>${this.escape(text)}</span>`
        break;
      }
    }
  }

  columnsToTableCellStyles (ll) {
    var o = [];
    var re_p = /^p\{(.*)\}$/;
    for (var s of ll) {
      if (s === 'l') {
        o.push('text-align:left');
      } else if (s === 'r') {
        o.push('text-align:right');
      } else if (s === 'c') {
        o.push('text-align:center');
      } else if (s === 'L') {
        o.push('');
      } else {
        var v = re_p.exec(s);
        if (v) {
          o.push(`width:${v[1]}`);
        } else {
          o.push('');
        }
      }
    }
    return o;
  }

  toFramedPict (text, config, fencecmd, isfigure, ispreview) {

    var o = [];
    for (var pp of text) {

      var kk = pp.map( x => {
          var [image,adjust,opts,src,srcs,sub] = x;
          if (!src && srcs.length) {
            src = srcs[0];///TODO: need to change it so that it picks a right format
          }
          var imgsrc = `./${src}`;
          this.imgid += 1;///always assign a new id
          var imgid = this.imgid;
          if (this.view) {
            if (config.previewimages && ispreview) { 
              if( this.view.imagemap.has(src)) {
                let [imgbuf,mime] = this.view.imagemap.get(src);
                imgsrc = `data:${mime};base64,${imgbuf.toString('base64')}`;///TODO: harded coded to PNG,
              } else {
                this.view.requestImage(imgid,src);
              }
            }
          }
          var { height, width } = opts;
          height = height || '';
          width = width || '';
          var mywidth = `${100.0*adjust}%`;
          if (width) {
            mywidth = width;
          }
          return `<img id='nitrile-preview-img-${imgid}' alt='${src}' src='${imgsrc}' 
                  style='vertical-align:text-bottom; 
                  width:${mywidth}; max-width:${mywidth};
                  height:${height}; box-sizing:border-box; ' />`;

      });

      var spacing = 1;
      var sep = '&#160;'.repeat(spacing);

      if (isfigure) {
        o.push(`<span style='display:flex; justify-content:center; align-items:flex-end; '>`);
      } else {
        o.push(`<span style='display:flex; justify-content:flex-start; align-items:flex-end; '>`);
      }
      o.push(kk.join(sep));
      o.push(`</span>`);

      if (isfigure) {
        var kk = pp.map( (x,j) => {
            var [image,width,opts,src,srcs,sub] = x;
            return `<span style='font-size:small; line-height:1; box-sizing:border-box;
                    display:inline-block; padding:6pt; width:${100.0*width}%; text-align:center;
                    vertical-align:top; '>(${this.toSubfigNum(j)}) ${this.unmask(sub)}</span>`;
        });

        o.push(`<span style='display:flex; justify-content:center; align-items:flex-start; '>`);
        o.push(kk.join(sep));
        o.push(`</span>`);
      }
    }

    return o.join('\n');
  }

  toPageCssStyleText (config) {

    var geometry_text = '';
    var geometry_opts = [];
    geometry_opts.push(`padding-left:4.45cm`);
    geometry_opts.push(`padding-right:4.45cm`);
    geometry_opts.push(`padding-top:4cm`);
    geometry_opts.push(`padding-bottom:4cm`);
    geometry_opts.push(`background-color:white`);
    geometry_opts.push(`color:#333`);
    geometry_opts.push(`margin:0`);
    geometry_opts.push(`box-sizing:border-box`);
    geometry_opts.push(`width:21.6cm`);
    geometry_opts.push(`font-family:roman`);
    geometry_opts.push(`font-size:11.5pt`);
    var geometry_text = geometry_opts.join('; ');
    return geometry_text;
  }

  toFramedSvg (para, config ) {

    /// ...draw using a 10pt font

    var mpara = this.getParaMaxWidth(para);
    var npara = para.length;

    /// if mpara is too small, set to be at least 65 characters long
    if (mpara < config.verbminwidth) {
      mpara = config.verbminwidth;
    }

    var width = `${2*(mpara+2)}mm`;
    var height = `${(npara+3)*10}pt`;

    var vw1 = (1+mpara)*6.00*1.333333; /// px
    var vw = (mpara)*6.00*1.333333; /// px
    var vh = (npara+1)*10*1.333333; /// from pt -> px
    var fontsize = 10*1.333333; /// from pt -> px
    var extra_dy = 0.25;

    var o = [];
    o.push( `<svg xmlns='http://www.w3.org/2000/svg' width='${vw1}' height='${vh}' viewbox='0 0 ${vw1} ${vh}' >` );
    o.push( `<text style='font-family:monospace;white-space:pre;font-size:${fontsize}px;' text-anchor='start' x='0' y='0' textLength='${vw}' lengthAdjust='spacing' >` );
    for (var i=0; i < npara; ++i) {
      var s = para[i];
      while (s.length < mpara) {
        s += ' ';
      }
      s = this.escape(s);
      s = this.replaceAllBlanks(s,'&#160;');
      var x = 0;
      o.push( `<tspan y='${(i+1+extra_dy)*10*1.333333}px' x='0'>${s}</tspan>` );
    }
    o.push( `</text>`);
    o.push( "</svg>" );
    return [o.join('\n'), vw1, vh];
  }

  yyyyyyyyyyy (para ) {

    /// ...draw using a 10pt font

    var mpara = this.getParaMaxWidth(para);
    var npara = para.length;

    var width = `${2*(mpara+2)}mm`;
    var height = `${(npara+3)*10}pt`;

    var vw = (mpara)*6.00*1.333333; /// px
    var vh = (npara+1)*10*1.333333; /// from pt -> px

    var o = [];
    o.push( `<svg xmlns='http://www.w3.org/2000/svg' width='100%' viewbox='0 0 ${vw} ${vh}' >` );
    o.push( `<text style='font-family:monospace;white-space:pre;font-size:10pt;' text-anchor='start' x='0pt' y='0pt'>` );
    for (var i=0; i < npara; ++i) {
      var s = para[i];
      var x = 0;
      for (var j=0; j < s.length; ++j) {
        var c = s[j];
        if (c === ' ') {
          c = '&#160;'
        } else {
          c = this.escape(c);
        }
        o.push( `<tspan y='${(i+1)*10}pt' x='${x}pt'>${c}</tspan>` );
        x += 6;
      }
    }
    o.push( `</text>`);
    o.push( "</svg>" );
    return o.join('\n');
  }

  xxxxxxxxxxx (para ) {

    /// ...draw using a 10pt font

    var mpara = this.getParaMaxWidth(para);
    var npara = para.length;

    var width = `${2*(mpara+2)}mm`;
    var height = `${(npara+3)*10}pt`;

    var vw = (mpara)*6.00*1.333333; /// px
    var vh = (npara+3)*10*1.333333; /// from pt -> px

    var o = [];
    o.push( `<svg xmlns='http://www.w3.org/2000/svg' width='100%' viewbox='0 0 ${vw} ${vh}' >` );
    for (var j=0; j < mpara; ++j) {
      o.push( `<text style='font-family:monospace;white-space:pre;font-size:10pt;' text-anchor='start' x='${j*6}pt' y='20pt'>` );
      for (var i=0; i < npara; ++i) {
        var c = para[i][j];
        if (!c || /\s/.test(c)) {
          c = '&#160;';
        }
        o.push( `<tspan x='${j*6}pt' dy='10pt'>${c}</tspan>` );
      }
      o.push( `</text>`);
    }
    o.push( "</svg>" );
    return o.join('\n');
  }

  toFramedCode (text, left, config) {

    if (config.codenumbers) {
      text = text.map( x => this.escape(x) );
      var linenum = 0;
      text = text.map( x => `<span style='position:relative; left:2.5em;'><span style='position:absolute; left:-2.5em;'><small>${++linenum}</small></span>${x}</span>` );
      text = text.join('\n');
      var o = [];
      o.push(`<pre style='${this.precssstyle}; padding-left:0; ' >${text}</pre>`);
      return o.join('\n');
    } else {
      text = text.map( x => this.escape(x) );
      text = text.join('\n');
      var o = [];
      o.push(`<pre style='${this.precssstyle}; padding-left:0;' >${text}</pre>`);
      return o.join('\n');
    }
  }

  XXXXXXXXXXXX (text, left, fencecmd) {

    if (fencecmd.numbers) {
      text = text.map( x => this.escape(x) );
      var linenum = 0;
      text = text.map( x => `<span style='font-size:75%'>${this.expandString(++linenum,4,' ')}</span>${x}` );
      text = text.join('\n');
      var o = [];
      o.push(`<pre style='${this.precssstyle}; padding-left:0;' >${text}</pre>`);
      return o.join('\n');
    } else {
      text = text.map( x => this.escape(x) );
      text = text.join('\n');
      var o = [];
      o.push(`<pre style='${this.precssstyle}; padding-left:0;' >${text}</pre>`);
      return o.join('\n');
    }
  }

  toFramedTabb (text, maxj, ww, fencecmd) {
    var tableww = 'table-layout:fixed; width:100%';
    if (fencecmd.adjust) {
      ww = this.toAdjustedColumns(maxj,fencecmd.adjust);
    }
    ww = ww.map( x => 100.0 * parseFloat(x) );
    ww = ww.map( x => 'width:'+x+'%' );
    var formats = this.toArray(fencecmd.format);
    var istighttable = (this.getBool(fencecmd.tight));
    if (istighttable) {
      tableww = '';
      ww = [];
    }
    var o = [];
    o.push(`<table style='${this.paracssstyle}; ${this.tablecssstyle}; ${tableww}; max-width:100%; ' >`);
    var rowcount = 0;
    var islastrow = false;
    for (var pp of text) {
      rowcount += 1;
      var isfirstrow = (rowcount === 2);
      var islastrow = (rowcount === text.length);
      pp = pp.map(x => x.split('\n'));
      if (rowcount == 1) {
        pp = pp.map(x => x.map(y => this.escape(y)));
      } else {
        pp = pp.map((x,i) => x.map(y => this.style(formats[i],y)));
      }
      pp = pp.map(x => x.join('<br/>'));
      o.push(`<tr >`);
      if (rowcount == 1) {
        pp = pp.map((x,i) => `<th style='text-align:left; ${ww[i]?ww[i]:''}; ${this.thcssstyle} '>${x}</th>`);
        o.push(pp.join(`<th style='${this.thcssstyle}; padding:0 .5em;' ></th>`)); /// add some gaps between columns
        if (istighttable) {
          var v = o.pop();
          v = `<th style='${this.thcssstyle}; padding:0 .3em;' ></th>${v}<th style='${this.thcssstyle}; padding:0 .3em;' ></th>`;
          o.push(v);
        }
      } else {
        if (isfirstrow && islastrow) {
          var tdcssstyle = (this.tdcssstyleonlyrow);
        } else if (isfirstrow) {
          var tdcssstyle = (this.tdcssstylefirstrow);
        } else if (islastrow) {
          var tdcssstyle = (this.tdcssstylelastrow);
        } else {
          var tdcssstyle = (this.tdcssstyle);
        }
        pp = pp.map((x,i) => `<td style='text-align:left; ${tdcssstyle} '>${x}</td>`);
        o.push(pp.join(`<td style='${tdcssstyle};' ></td>`)); /// add some gaps between columns
        if (istighttable) {
          var v = o.pop();
          v = `<td style='${tdcssstyle};' ></td>${v}<td style='${tdcssstyle};' ></td>`;
          o.push(v);
        }
      }
      o.push('</tr>');
    }
    o.push(`</table>`);
    return o.join('\n');
  }

  toFramedTabb2 (text, maxj, ww, fencecmd) {
    var tableww = 'table-layout:fixed; width:100%; max-width:100%';
    if (fencecmd.adjust) {
      ww = this.toAdjustedColumns(maxj,fencecmd.adjust);
    }
    ww = this.toPcolumnsHtml(ww);
    var formats = this.toArray(fencecmd.format);
    var o = [];
    o.push(`<table style='${this.paracssstyle}; ${this.tablecssstyle}; ${tableww}; ' >`);
    var rowcount = 0;
    var islastrow = false;
    for (var pp of text) {
      rowcount += 1;
      var isfirstrow = (rowcount === 2);
      var islastrow = (rowcount === text.length);
      pp = pp.map(x => x.split('\n'));
      if (rowcount == 1) {
        pp = pp.map(x => x.map(y => this.escape(y)));
      } else {
        pp = pp.map((x,i) => x.map(y => this.style(formats[i],y)));
      }
      pp = pp.map(x => x.join('<br/>'));
      o.push(`<tr >`);
      if (rowcount == 1) {
        pp = pp.map((x,i) => `<th style='${this.thcssstyle}; text-align:left; width:${ww[i]}%; '>${x}</th>`);
        o.push(pp.join(`<th style='${this.thcssstyle}; width:1%; ' />`)); /// add some gaps between columns
      } else {
        if (isfirstrow && islastrow) {
          var tdcssstyle = (this.tdcssstyleonlyrow);
        } else if (isfirstrow) {
          var tdcssstyle = (this.tdcssstylefirstrow);
        } else if (islastrow) {
          var tdcssstyle = (this.tdcssstylelastrow);
        } else {
          var tdcssstyle = (this.tdcssstyle);
        }
        pp = pp.map((x,i) => `<td style='${tdcssstyle}; text-align:left; '>${x}</td>`);
        o.push(pp.join(`<td style='${tdcssstyle};' />`)); /// add some gaps between columns
      }
      o.push('</tr>');
    }
    o.push(`</table>`);
    return o.join('\n');
  }

  toFramedTabu (text, maxj, ww, fencecmd) {
    var o = [];
    o.push(`<table style='${this.paracssstyle}; ${this.tablecssstyle}; ' >`);
    for (var pp of text) {
      pp = pp.map(x => x.split('\n'));
      pp = pp.map(x => x.map(y => this.escape(y)));
      pp = pp.map(x => x.join('<br/>'));
      o.push(`<tr >`);
      pp = pp.map((x) => `<td style='text-align:left; ${this.tdcssstyle} '>${x}</td>`);
      var v = pp.join(`<td style='${this.tdcssstyle}; padding:0 .5em'>&#160;</td>`)
      o.push(v);
      o.push('</tr>');
    }
    o.push(`</table>`);
    return o.join('\n');
  }


  extractRubyItems (base, top) {
    var re = '';
    var rb = '';
    var rt = '';
    for (var c of base) {
      if (!/[\u3040-\u309F]/.test(c)) {
        ///not hiragana
        if (rt.length) {
          re += `(${rt})`;
          rt = '';
        }
        rb += c;
      } else {
        if (rb.length) {
          re += '(.+?)';
          rb = '';
        }
        rt += c;
      }
    }
    if (rb.length) {
      re += '(.+?)';
      rb = '';
    } else if (rt.length) {
      re += `(${rt})`;
      rt = '';
    }
    ///console.log(re);
    re = `^${re}$`;
    ///console.log(re);
    var re = new RegExp(re);
    var v = re.exec(top);
    ///console.log(v);
    var v1 = re.exec(base);
    ///console.log(v1);
    var o = '';
    if (v && v1 && v.length === v1.length) {
      /// match
      for (var j=1; j < v.length; ++j) {
        if (v1[j] === v[j]) {
          o += `<rb>${v1[j]}</rb><rt></rt>`;
        } else {
          o += `<rb>${v1[j]}</rb><rt>${v[j]}</rt>`;
        }
      }
      o = `<ruby>${o}</ruby>`;
    } else {
      o = `<ruby><rb>${base}</rb><rt>${top}</rt></ruby>`;
    }
    ///console.log(o);
    return o;
  }

  replaceRef( htmls, chaps ) {

///~~~
///['PART',   'nitri....1',''        ,'   ','PART I..',0,  'content0.xhtml']
///['CHAPTER','nitri...12','my:intro','1  ','Intro...',1,  'content1.xhtml']
///['SECTION','nitri...24',''        ,'1.1','Welco...',225,'content2.xhtml']
///['CHAPTER','nitri...34',''        ,'2  ','Regexp..',300.'content3.xhtml']
///~~~

    var re = /\[\#\]\((.*?)\)/g;
    var v = null;
    var out = [];
    for (var str of htmls) {

      var start_i = 0;
      var newtext = '';
      while ((v = re.exec(str)) !== null) {
        var mywhole = v[0];
        var mylabel = v[1];
        var i = v.index;
        newtext += str.slice(start_i,i);
        var isfound = false;
        for (var chap of chaps) {
          const [heading,id,label,dept,text,ln,saveas] = chap;
          if (label === mylabel) {
            isfound = true;
            newtext += `<a style='${this.acssstyle}' href='${saveas}#${id}'>${dept}</a>`;
            break;
          }
        }
        if (!isfound) {
          newtext += mywhole;
        }
        start_i = re.lastIndex;
      }
      if (start_i !== 0) {
        newtext += str.slice(start_i);
        out.push(newtext);
      } else {
        out.push(str);
      }
    }
    return out;
  }

  toPcolumnsHtml (ww) {

    /// given a ww that is a list of ".2 .3 .5" try to figure out
    /// the width of each p-column with an assumed gap between columns
    /// that is .01\linewidth

    var num_gaps = ww.length - 1;
    var gap_w = num_gaps * 0.01;
    var remain_w = 1.0 - gap_w;
    var sum = ww.reduce( (acc,num) => acc += parseFloat(num), 0 );
    ww = ww.map( x => x/sum );
    ww = ww.map( x => x*remain_w );
    ww = ww.map( x => x*100 );
    return ww;
  }
}

module.exports = { NitrilePreviewHtml };
