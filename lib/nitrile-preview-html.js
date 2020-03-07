'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');
const { NitrilePreviewAutonum } = require('./nitrile-preview-autonum');
const N_lstlisting_numbers_xleftmargin = .75;/// additional left margin in cm for when lstlisting is numbered
const utils = require('./nitrile-preview-utils');
const entjson = require('./nitrile-preview-entity.json');

class NitrilePreviewHtml extends NitrilePreviewParser {

  constructor() {
    super();
    this.tokenizer = new NitrilePreviewTokenizer();
    this.images = new Map();/// this is a image src -> base64-encoded string map
    this.view = null; /// this is a NitrilePreviewView object
    this.imgid = 0;
    this.autonum = new NitrilePreviewAutonum();


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
line-height:1.30; \
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
border:1px solid #333; \
padding-top:.3em; \
padding-bottom:.3em; \
`

    this.tdcssstyle = `\
border:1px solid #333; \
`

    this.tdcssstylefirstrow = `\
border:1px solid #333; \
padding-top:.3em; \
`

    this.tdcssstylelastrow = `\
border:1px solid #333; \
padding-bottom:.3em; \
`

    this.tdcssstyleonlyrow = `\
padding-top:.3em; \
padding-bottom:.3em; \
border:1px solid #333; \
`

    this.acssstyle = `\
color:#337ab7; \
`

  }

  setView (view) {
    this.view = view;
  }

  translateHtml (all,config,ispreview) {

    ///
    /// Translate to HTML, returning an array of
    /// lines.
    ///
    /// sub: is an object
    ///

    var o = [];
    var p = [];
    var heading = '';
    var dept = '';
    var blockcount = 1;
    this.block = [];
    this.config = config;
    this.isarticle = config.latexIsArticle;
    this.autonum.start();
    for (var block of all) {
      blockcount++;///will be cleared by a HDGS
      const [id,row1,row2,sig,n,data,para,fencecmd,caption,base,label,fname] = block;
      this.block = block;
      this.base = base;
      const showlabeltext = (ispreview && config.previewShowLabelEnabled) ? `<mark style='font-size:small; position:absolute; '>[${label}]</mark>` : '';
      const showidtext    = (ispreview && config.previewShowIdEnabled   ) ? `<mark style='font-size:small; position:absolute; right:0; '>[${id}]</mark>` : '';
      const label_text = (label) ? `${base}:${label}` : '';
      const caption_text = this.unmask(caption);
      /// turn off showing of blocks if outlineviewing is on
      if (ispreview && config.previewOutlineEnabled) {
        if (sig === 'PART') {
        } else if (sig === 'HDGS') {
        } else if (sig === 'ERRO') {
        } else if (config.previewOutlineSection && this.isInsideSection(dept,config.previewOutlineSection)) {
        } else {
          ///do not show this block
          continue;
        }
      }
      switch (sig) {
        case 'PART': {
          var text = data;
          text = this.escape(text);
          p.push(['PART',id,label_text,dept,text,o.length,'']);
          o.push(`<h2 id='${id}' class='PART' dept='' fName='' rows='${row1} ${row2}' style='${this.partcssstyle}' >`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}'>`);
          o.push(text);
          o.push(`</p>`);
          o.push(`</h2>`);
          o.push('');
          break;
        }
        case 'ERRO': {
          var [hdgn,text] = data;
          var text = this.escape(text);
          if (this.isarticle) {
            switch (hdgn) {
              case 0:
                break;
              case 1:
                heading = 'SECTION';
                p.push([heading,id,label_text,dept,text,o.length,'']);
                o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.sectioncssstyle}'>`);
                o.push(`${showidtext}`);
                o.push(`${dept} &#160; ${text} ${showlabeltext} `);
                o.push(`</h2>`);
                break;
              case 2:
                heading = 'SUBSECTION';
                p.push([heading,id,label_text,dept,text,o.length,'']);
                o.push(`<h3 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.subsectioncssstyle}'>`);
                o.push(`${showidtext}`);
                o.push(`${dept} &#160; ${text} ${showlabeltext} `);
                o.push(`</h3>`);
                break;
              default:
                heading = 'SUBSUBSECTION';
                p.push([heading,id,label_text,dept,text,o.length,'']);
                o.push(`<h4 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.subsubsectioncssstyle}'>`);
                o.push(`${showidtext}`);
                o.push(`${dept} &#160; ${text} ${showlabeltext} `);
                o.push(`</h4>`);
                break;
            } 
          } else {
            switch (hdgn) {
              case 0:
                break;
              case 1:
                heading = 'CHAPTER';
                p.push([heading,id,label_text,dept,text,o.length,'']);
                o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${fname}'  rows='${row1} ${row2}' style='${this.chaptercssstyle}' >`);
                o.push(`${showidtext}`);
                o.push(`Chapter ${dept} &#160; ${text} ${showlabeltext} `);
                o.push(`</h2>`);
                break;
              case 2:
                heading = 'SECTION';
                p.push([heading,id,label_text,dept,text,o.length,'']);
                o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.sectioncssstyle}'>`);
                o.push(`${showidtext}`);
                o.push(`${dept} &#160; ${text} ${showlabeltext} `);
                o.push(`</h2>`);
                break;
              case 3:
                heading = 'SUBSECTION';
                p.push([heading,id,label_text,dept,text,o.length,'']);
                o.push(`<h3 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.subsectioncssstyle}'>`);
                o.push(`${showidtext}`);
                o.push(`${dept} &#160; ${text} ${showlabeltext} `);
                o.push(`</h3>`);
                break;
              default:
                heading = 'SUBSUBSECTION';
                p.push([heading,id,label_text,dept,text,o.length,'']);
                o.push(`<h4 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.subsubsectioncssstyle}'>`);
                o.push(`${showidtext}`);
                o.push(`${dept} &#160; ${text} ${showlabeltext} `);
                o.push(`</h4>`);
                break;
            }
          }
          break;
        }
        case 'HDGS': {
          var [hdgn,text] = data;
          text = this.escape(text);
          dept = this.autonum.idenHeading (hdgn,this.isarticle);
          // reset the normal paragraph count to 0 so that the first normal paragraph will not indent
          blockcount = 0;///this number keeps track total blocks, and is cleared
                         ///after a HDG is encountered, allowing TEXT block to figure if it needs
                         ///to add indent to its text.
          if (this.isarticle) {
            switch (hdgn) {
              case 0:
                break;///this has to be ignored specifically otherwise it will show through
              case 1:
                heading = 'SECTION';
                p.push([heading,id,label_text,dept,text,o.length,'']);
                o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.sectioncssstyle}'>`);
                o.push(`${showidtext}`);
                o.push(`${dept} &#160; ${text} ${showlabeltext} `);
                o.push(`</h2>`);
                break;
              case 2:
                heading = 'SUBSECTION';
                p.push([heading,id,label_text,dept,text,o.length,'']);
                o.push(`<h3 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.subsectioncssstyle}'>`);
                o.push(`${showidtext}`);
                o.push(`${dept} &#160; ${text} ${showlabeltext} `);
                o.push(`</h3>`);
                break;
              default:
                heading = 'SUBSUBSECTION';
                p.push([heading,id,label_text,dept,text,o.length,'']);
                o.push(`<h4 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.subsubsectioncssstyle}'>`);
                o.push(`${showidtext}`);
                o.push(`${dept} &#160; ${text} ${showlabeltext} `);
                o.push(`</h4>`);
                break;
            } 
          } else {
            switch (hdgn) {
              case 0:
                break;///this has to be ignored specifically otherwise it will show through
              case 1:
                heading = 'CHAPTER';
                p.push([heading,id,label_text,dept,text,o.length,'']);
                o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${fname}'  rows='${row1} ${row2}' style='${this.chaptercssstyle}' >`);
                o.push(`${showidtext}`);
                o.push(`Chapter ${dept} &#160; ${text} ${showlabeltext} `);
                o.push(`</h2>`);
                break;
              case 2:
                heading = 'SECTION';
                p.push([heading,id,label_text,dept,text,o.length,'']);
                o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.sectioncssstyle}'>`);
                o.push(`${showidtext}`);
                o.push(`${dept} &#160; ${text} ${showlabeltext} `);
                o.push(`</h2>`);
                break;
              case 3:
                heading = 'SUBSECTION';
                p.push([heading,id,label_text,dept,text,o.length,'']);
                o.push(`<h3 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.subsectioncssstyle}'>`);
                o.push(`${showidtext}`);
                o.push(`${dept} &#160; ${text} ${showlabeltext} `);
                o.push(`</h3>`);
                break;
              default:
                heading = 'SUBSUBSECTION';
                p.push([heading,id,label_text,dept,text,o.length,'']);
                o.push(`<h4 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.subsubsectioncssstyle}'>`);
                o.push(`${showidtext}`);
                o.push(`${dept} &#160; ${text} ${showlabeltext} `);
                o.push(`</h4>`);
                break;
            }
          }
          o.push('');
          break;
        }
        case 'LIST': {
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${0}cm'>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}' >`);
          o.push(`<ul style='padding-left:${config.latexStepMargin}cm;list-style-position:outside;'>`);
          for (var text of data) {
            text = this.unmask(text);
            o.push(`<li>${text}</li>`);
          }
          o.push('</ul>');
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'DESC': {
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}' >`);
          o.push(`${showidtext}`);
          o.push(`<dl style='${this.paracssstyle}' >`);
          var [ cat, keys, text, xn ] = data;
          text = this.unmask(text);
          const xleft = xn*config.latexStepMargin;
          var bullet = '';
          try {
            if (config.latexDescriptionItemBullet) {
              bullet = String.fromCodePoint(config.latexDescriptionItemBullet);
              bullet += ' ';
            }
          } catch(e) {
          }
          for (var key of keys) {
            key = this.unmask(key);
            o.push(`<dt style='${this.dtcssstyle}' >${bullet} <b>${mykey}</b></dt>`);
          }
          o.push(`<dd style='margin-left:${xleft}cm; ${this.ddcssstyle}'>${this.unmask(text)}</dd>`);
          o.push('</dl>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PLST': {
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${0}cm'>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}' >`);
          for (var item of data) {
            var [lead,bullet,text] = item;
            text = this.unmask(text);
            bullet = bullet || '';
            text = text || '';
            if (bullet === '-' || bullet === '*' || bullet === '+') {
              bullet = '';
            } else if (bullet.match(/^\d+\.$/)) {
              bullet = this.chomp(bullet);
            } else {
              bullet = '';
            }
            if (item.length === 3) {
              switch (lead) {
                case 'OL': {
                  o.push(`<ol style='padding-left:${config.latexStepMargin}cm;list-style-position:outside;'><li value='${bullet}'>${text}`);
                  break;
                }
                case 'UL': {
                  o.push(`<ul style='padding-left:${config.latexStepMargin}cm;list-style-position:outside;'><li value='${bullet}'>${text}`);
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
        case 'ITEM': {
          const xleft = config.latexStepMargin;
          var [fence,text] = data;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${xleft}cm; '>`);
          if (fence) {
            text = text.map( x => this.escape(x) );
            o.push(`<pre style='${this.paracssstyle}; overflow:hidden; font-size:75%; white-space:pre-wrap; word-wrap:break-word; word-break:break-all; padding-left:0;' >${text.join('\n')}</pre>`);

          } else {
            text = this.unmask(text.join('\n'));
            o.push(`<p style='${this.paracssstyle}' >${text}</p>`);
          }
          o.push(`</div>`);
          break;
        }
        case 'SAMP': {
          var text = data;
          var xleft = config.latexSampleMargin;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-left:${xleft}cm; '>`);
          o.push(`${showidtext}`);
          text = text.map( x => this.escape(x) );
          if (config.latexAutoRubyEnabled) {
            text = text.map( x => this.rubify(x) );
          }
          text = text.join('\n');
          o.push(`<pre style='${this.samplecssstyle}; overflow:hidden; font-size:75%; white-space:pre-wrap; word-wrap:break-word; word-break:break-all; padding-left:0;' >${text}</pre>`);
          o.push(`</div>`);
          o.push('');

          break;
        }
        case 'PARA': {
          var text = data;
          text = this.unmask(text);
          o.push(`<div id='${id}' class='TEXT' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; ; margin-top:2em; margin-bottom:0;'>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}' >`);
          o.push(text);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PRIM': {
          var lead
          var text;
          [lead,text] = data;
          lead = this.unmask(lead);
          text = this.unmask(text);
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-bottom:0; '>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}' >`);
          o.push(`<b>${lead}</b> &#160; ${text}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'SECO': {
          var lead
          var text;
          [lead,text] = data;
          lead = this.unmask(lead);
          text = this.unmask(text);
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; margin-bottom:0; '>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}' >`);
          const indent = '&#160;'.repeat(5);
          o.push(`${indent}<b>${lead}</b> &#160; ${text}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'TEXT': {
          var text = data;
          text = this.unmask(text);
          o.push(`<div id='${id}' class='TEXT' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; ; margin-top:0; margin-bottom:0;'>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}' >`);
          if (blockcount == 1) {
            o.push(text);
          } else {
            const indent = '&#160;'.repeat(5);
            o.push(`${indent}${text}`);
          }
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'CITE': {
          var text = para;///must use 'para', as 'data' has been parsed by parseCITE()
          text = text.map( x => this.escape(x) );
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; '>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}; ' >`);
          o.push(text.join('<br/>'));
          o.push(`</p>`);
          o.push(`</div>`);
          o.push('');
          break;
        }
        ///***NOTE: following are fenced blocks
        case 'imgs': {
          var text = data;

          var column = 1;
          if (fencecmd.column) {
            column = fencecmd.column;
          }
          var adjust = '1 '.repeat(column);
          if (fencecmd.adjust) {
            adjust = fencecmd.adjust;
          }
          var margin = 0.0;
          if (fencecmd.margin) {
            margin = fencecmd.margin;
          }
          var gap = 0.0;
          if (fencecmd.gap) {
            gap = fencecmd.gap;
          }
          if (!utils.isNumber(column)) {
            column = 1;
          }
          if (!utils.isNumber(margin)) {
            margin = 0.0;
          }
          if (!utils.isNumber(gap)) {
            gap = 0.1;
          }

          var ww = this.toAdjustedColumns(column,adjust);
          var pcol = this.toPcolumnsHtml(margin,gap,ww);
//console.log(column);
//console.log(adjust);
//console.log(ww);
//console.log(pcol);
//console.log(data);
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; ; '>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}; text-align:left; ' >`);
          o.push(this.toFramedImgs(column, 100.0*margin, 100.0*gap, pcol, text, config, ispreview));
          o.push('</p>');
          o.push('</div>');
          o.push('');

          break;
        }
        case 'longtabu': 
        case 'tabbing': 
        case 'tabular': 
        case 'tabularx': 
        case 'tabulary': {
          var [text,maxj,ww] = data;
          var text = this.toFramedTabb(text,maxj,ww,fencecmd,config);
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; '>`);
          o.push(`${showidtext}`);
          o.push(text);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'quot': {
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; '>`);
          o.push(`${showidtext}`);
          var text = this.unmask(data);
          o.push(`<p style='${this.samplecssstyle}; margin:0; ' >`);
          o.push(text);
          o.push(`</p>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'center': {
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; '>`);
          o.push(`${showidtext}`);
          var text = this.unmask(data);
          o.push(`<p style='${this.paracssstyle}; text-align:center; margin:0; ' >`);
          o.push(text);
          o.push(`</p>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'flushright': {
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; '>`);
          o.push(`${showidtext}`);
          var text = this.unmask(data);
          o.push(`<p style='${this.paracssstyle}; text-align:right; margin:0; ' >`);
          o.push(text);
          o.push(`</p>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'flushleft': {
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; '>`);
          o.push(`${showidtext}`);
          var text = this.unmask(data);
          o.push(`<p style='${this.paracssstyle}; text-align:left; margin:0; ' >`);
          o.push(text);
          o.push(`</p>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'diagram': {
          var text = para;///must use 'para', as 'data' has been parsed by parseCITE()
          text = text.map( x => this.escape(x) );
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; '>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}; text-align:left; margin:0; line-height:1; font-size:small;' >`);
          o.push(text.join('<br/>'));
          o.push(`</p>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'dt': {
          const xleft = config.latexStepMargin;
          var text = data;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; '>`);
          o.push(`${showidtext}`);
          o.push(`<dl style='${this.paracssstyle}' >`);
          for(var i=0; i < text.length; i+=2) {
            var dt = text[i];
            var dd = text[i+1];
            var dt = this.unmask(dt);
            var dd = this.unmask(dd);
            o.push(`<dt style='${this.dtcssstyle}' >${dt}</dt>`);
            o.push(`<dd style='${this.ddcssstyle}; margin-left:${xleft}cm; '>${dd}</dd>`);
          }
          o.push('</dl>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'math': {
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle};' >`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}' >`);
          var text = data;
          if (text.length == 1) {
            var num = '';
            for (var s of text) {
              s = this.tokenizer.parse(s,true);
              if (fencecmd.label) {
                var num = num || this.autonum.idenEquation(this.isarticle);
                var numtext = `<span style='position:absolute;right:0px;'>(${num})</span>`;
              } else {
                var numtext = '';
              }
              o.push(`<span style='display:block;text-align:center;position:relative'>${s}${numtext}</span>`);
            }
          } else if (text.length > 1) {
            var j = 0;
            var num = '';
            for (var s of text) {
              s = this.tokenizer.parse(s,true);
              if (fencecmd.label) {
                var num = num || this.autonum.idenEquation(this.isarticle);
                var subnum = this.toSubfigNum(j);
                var numtext = `<span style='position:absolute;right:0px;'>(${num}${subnum})</span>`;
              } else {
                var numtext = '';
              }
              o.push(`<span style='display:block;text-align:center;position:relative'>${s}${numtext}</span>`);
              j += 1;
            }
          }
          o.push(`</p>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'code': {
          var text = data;
          text = this.toFramedCode(text);
          if (fencecmd.label) {
            var num = this.autonum.idenListing(this.isarticle);
            p.push(['code',id,label_text,num,'',o.length,'']);
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; '>`);
            o.push(`${showidtext}`);
            o.push(`<span> Listing ${num} : ${caption_text} ${showlabeltext} </span>`);
            o.push(text);
            o.push(`</div>`);
            o.push('');
          } else {
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; '>`);
            o.push(`${showidtext}`);
            o.push(text);
            o.push(`</div>`);
            o.push('');
          }
          break;
        }
        case 'verb': {
          var text = data;
          var [out, vw, vh] = this.toFramedSvg(text,config);

          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; '>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}; border:1px solid #333; padding:3px; box-sizing:border-box; '>`);
          o.push( `<img style='width:100%; max-width:${vw}px;' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(out)}" />` );
          o.push('</p>');
          o.push(`</div>`);
          o.push('');

          break;
        }
        case 'verse': {
          var text = data;
          text = text.map ( x => this.unmask(x) );
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='${this.divcssstyle}; '>`);
          o.push(`${showidtext}`);
          o.push(`<p style='${this.paracssstyle}' >`);
          o.push(text.join('<br/>'));
          o.push(`</p>`);
          o.push(`</div>`);
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

  /*
    return an HTML entity symbol:
    'grave' -> '\`'
    'amp' -> '\&'
    'deg' -> '\textdegree'
  */
  entity (str) {
    //return `&${str};`;
    var v = entjson.entities[str];
    if (v) {
      return v.html;
    } else {
      return this.escape(str);
    }
  }

  ruby (str) {
    const dotchar = '0x30fb';
    const sep = String.fromCodePoint(dotchar);
    const [rb,rt] = str.split(sep);
    if (rb && rt) {
      return `<ruby><rb>${this.escape(rb)}</rb><rt>${this.escape(rt)}</rt></ruby>`;
    }
    return this.escape(str);
  }

  ref (str) {
    var segs = str.split(':');
    segs = segs.map(x => x.trim());
    if (segs.length>=2) {
      if (segs[0]=='') {
        segs[0] = this.base;
      }
      str = segs.join(':');
    } else {
      str = `${str}:1`;
    }
    return `[[#${str}#]]`
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
      case 'code': {
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

  toFramedImgs (column, margin, gap, pcol, text, config, ispreview) {

    var o = [];
    var n = 0;
    var m = 0;

    var pp = text.map( x => {
        var [image,srcs,sub] = x;
        var src = '';
        if (srcs.length) {
          src = srcs[0];///TODO: need to change it so that it picks a right format
        }
        var imgsrc = `./${src}`;
        this.imgid += 1;///always assign a new id
        var imgid = this.imgid;
        if (this.view) {
          if (config.previewImageEnabled && ispreview) {
            if( this.view.imagemap.has(src)) {
              let [imgbuf,mime] = this.view.imagemap.get(src);
              imgsrc = `data:${mime};base64,${imgbuf.toString('base64')}`;///TODO: harded coded to PNG,
            } else {
              this.view.requestImage(imgid,src);
            }
          }
        }
        if (!sub) {
          sub = '&#160;'
        } else {
          sub = this.unmask(sub);
        }
        return `<img id='nitrile-preview-img-${imgid}' alt='${src}' src='${imgsrc}'
                style='outline:orange 1px solid; vertical-align:text-bottom;
                width:100%;
                box-sizing:border-box; ' /><span style='display:inline-block; width:100%; margin-top:.5em'>${sub}</span>`;

    });

    while (pp.length) {
      if (n == 0) {
        var p = pp.shift();
        n = 1;
        m = 1;
        o.push(`<span style='display:flex; justify-content:flex-start; align-items:flex-end; '>`);
        o.push(`<span style='display:inline-block; width:${margin}%'></span>`);
        o.push(`<span style='display:inline-block; text-align:center; width:${pcol[0]}%'>${p}</span>`);
        continue;
      }
      if (n == column) {
        o.push(`<span style='display:inline-block; width:${margin}%'></span>`);
        o.push(`</span>`);
        o.push(`<span style='display:inline-block; width:100%'>&#160;</span>`);/// extra vertical space
        n = 0;
        continue;
      }
      var p = pp.shift();
      o.push(`<span style='display:inline-block; width:${gap}%'></span>`);
      o.push(`<span style='display:inline-block; text-align:center; width:${pcol[m]}%'>${p}</span>`);
      n += 1;
      m += 1;
    }
    while (n < column) {
      o.push(`<span style='display:inline-block; width:${gap}%'></span>`);
      o.push(`<span style='display:inline-block; width:${pcol[m]}%'></span>`);
      n += 1;
    }
    o.push(`<span style='display:inline-block; width:${margin}%'></span>`);
    o.push(`</span>`);

    return o.join('\n');
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
            if (config.previewImageEnabled && ispreview) {
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
    var verbminwidth = 80;
    if (mpara < verbminwidth) {
      mpara = verbminwidth;
    }

    var width = `${2*(mpara+2)}mm`;
    var height = `${(npara+3)*10}pt`;

    var vw1 = (1+mpara)*6.00*1.333333; /// px
    var vw = (mpara)*6.00*1.333333; /// px
    var vh = (npara+1)*10*1.333333; /// from pt -> px
    var fontsize = 10*1.333333; /// from pt -> px
    var extra_dy = 0.25;

    var o = [];
    o.push( `<svg xmlns='http://www.w3.org/2000/svg' width='${vw1}' height='${vh}' viewBox='0 0 ${vw1} ${vh}' >` );
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
    o.push( `<svg xmlns='http://www.w3.org/2000/svg' width='100%' viewBox='0 0 ${vw} ${vh}' >` );
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
    o.push( `<svg xmlns='http://www.w3.org/2000/svg' width='100%' viewBox='0 0 ${vw} ${vh}' >` );
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

  toFramedCode (text) {

    text = text.map( x => this.escape(x) );
    var linenum = 0;
    text = text.map( x => `<span style='position:relative; left:2.5em;'><span style='position:absolute; left:-2.5em;'><small>${++linenum}</small></span>${x}</span>` );
    text = text.join('\n');
    var o = [];
    o.push(`<pre style='${this.precssstyle}; padding-left:0; ' >${text}</pre>`);
    return o.join('\n');
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

  toFramedTabl (text, maxj, ww, fencecmd, config) {
    var tableww = 'table-layout:fixed; width:100%; max-width:100%';
    if (fencecmd.adjust) {
      ww = this.toAdjustedColumns(maxj,fencecmd.adjust);
    }
    ww = this.toPcolumnsHtml(0,0.01,ww);//only the data columns and not the gap columns
    var formats = this.toArray(fencecmd.format);
    var o = [];
    o.push(`<table style='${this.paracssstyle}; ${this.tablecssstyle}; ${tableww}; ' >`);
    var rowcount = 0;
    var islastrow = false;
    for (var pp of text) {

      pp = pp.map(x => x.split('\n'));
      pp = pp.map(x => x.map(y => this.unmask(y)));
      pp = pp.map(x => x.join('<br/>'));

      rowcount += 1;
      var isfirstrow = (rowcount === 2);
      var islastrow = (rowcount === text.length);
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

  /// This is a singleline table that is tight.
  toFramedTabb (text, maxj, ww, fencecmd, config) {
    var o = [];
    o.push(`<table style='${this.paracssstyle}; ${this.tablecssstyle}; ' >`);
    for (var pp of text) {
      pp = pp.map(x => x.split('\n'));
      pp = pp.map(x => x.map(y => this.unmask(y)));
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

    var re = /\[\[\#(.*?)\#\]\]/g;
    var v = null;
    var out = [];
    for (var str of htmls) {

      var start_i = 0;
      var newtext = '';
      while ((v = re.exec(str)) !== null) {
        var mywhole = v[0];
        var mylabeltext = v[1];
        var i = v.index;
        newtext += str.slice(start_i,i);
        var isfound = false;
        for (var chap of chaps) {
          const [heading,id,labeltext,dept,text,ln,saveas] = chap;
          if (labeltext === mylabeltext) {
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

  toPcolumnsHtml (margin,gap,ww) {

    /// given a ww that is a list of ".2 .3 .5" try to figure out
    /// the width of each p-column with an assumed gap between columns
    /// that is .01\linewidth

    if (!utils.isNumber(margin)) {
      margin = 0.0;
    }

    if (!utils.isNumber(gap)) {
      gap = 0.1;
    }

    var total_w = 1.0;
    total_w -= margin;
    total_w -= margin;
    var num_gaps = ww.length - 1;
    var gap_w = num_gaps * gap;
    var remain_w = total_w - gap_w;
    var sum = ww.reduce( (acc,num) => acc += parseFloat(num), 0 );
    ww = ww.map( x => x/sum );
    ww = ww.map( x => x*remain_w );
    ww = ww.map( x => x*100 );
    return ww;
  }

}

module.exports = { NitrilePreviewHtml };
