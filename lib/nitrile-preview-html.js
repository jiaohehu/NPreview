'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');
const P_lstlisting_numbers_xleftmargin = .75;/// additional left margin in cm for when lstlisting is numbered

class NitrilePreviewHtml extends NitrilePreviewParser {

  constructor() {
    super();
    this.tokenizer = new NitrilePreviewTokenizer();
    this.images = new Map();/// this is a image src -> base64-encoded string map
    this.view = null; /// this is a NitrilePreviewView object 
    this.imgid = 0;

    this.titlecssstyle = `\
column-span:all; \
font-size:x-large; \
text-align:center; \
`
 
    this.authorcssstyle = `\
column-span:all; \
font-size:large; \
text-align:center; \
`
 
    this.datecssstyle = `\
column-span:all; \
font-size:large; \
text-align:center; \
`
 
    this.partcssstyle = `\
column-span:all; \
background-color:inherit; \
color:inherit; \
font-size:xx-large; \
font-variant:small-caps; \
font-weight:bold; \
position:relative; \
`

    this.chaptercssstyle = `\
column-span:all; \
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

    this.precssstyle = `\
background-color:inherit; \
color:inherit; \
font-size:75%; \
font-weight:inherit; \
line-height:1.1; \
overflow:auto; \
`

    this.paracssstyle = `\
background-color:inherit; \
color:inherit; \
padding:inherit; \
font-size:inherit;
font-weight:inherit;
line-height:1.15; \
`
 
    this.samplecssstyle = `\
background-color:inherit; \
color:inherit; \
padding:inherit; \
font-size:inherit;
font-weight:inherit;
line-height:1.1; \
`
 
    this.codecssstyle = `\
background-color:inherit; \
color:inherit; \
padding:inherit; \
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
table-layout:fixed; \
overflow-wrap:break-word; \
border-collapse:collapse; \
border-top:1px solid #333; \
border-bottom:1px solid #333; \
`

    this.trcssstyle = `\
`

    this.thcssstyle = `\
border-bottom:1px solid #333; \
padding:2px 3px; \
`

    this.tdcssstyle = `\
padding:1px 3px; \
`

    this.acssstyle = `\
color:#337ab7; \
`

  }

  setView (view) {
    this.view = view;
  }

  translateHtml (config,xrefs,blocks,isarticle,o) {

    /// 
    /// Translate to HTML, returning an array of 
    /// lines.
    ///

    o = o || [];
    var heading = '';
    this.block = [];
    this.xrefs = xrefs;
    this.config = config;
    this.isarticle = isarticle;
    for (var block of blocks) {
      /// store the current processed block so that it
      /// can be accessed by 'unmask' function to find out
      /// what block is currently being processed
      this.block = block;
      const [id,row1,row2,sig,n,data,para,fencecmd,dept,fig,caption,base,label,fname,subrow,plevel] = block;
      const left = Math.floor(n/config.stepspaces)*config.stepmargin;
      const showlabeltext = config.showlabels ? `<mark style='font-size:small; position:absolute; '>[${label}]</mark>` : '';
      switch (sig) {
        case 'FILE': {
          o.push(`<div id='${id}' class='FILE' fName='${fname}' subrow='${subrow}' >`);
          o.push('');
          break;
        }
        case 'FEND': {
          o.push(`</div>`);
          o.push('');
          break;
        }
        case 'PART': {
          var text = data;
          o.push(`<h1 id='${id}' class='PART' dept='' fName='' subrow='${subrow}' rows='' style='${this.partcssstyle}' >`);
          o.push(`<p style='${this.paracssstyle}'>`);
          o.push(this.escape(text));
          o.push(`</p>`);
          o.push(`</h1>`);
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
          if (this.isSkippingHdgs(config,dept,cat)) { break; }
          switch (cat) {
            case 0:
              heading = 'CHAPTER';
              o.push(`<h1 id='${id}' class='${heading}' dept='${dept}' fName='${fname}'  subrow='${subrow}' rows='${row1} ${row2}' style='${this.chaptercssstyle}' >`);
              o.push(`Chapter ${dept} &#160; ${this.escape(text)}`);
              if (config.showlabels) {
                o.push(`<mark style='font-size:small;position:absolute; '>[${label}]</mark>`);
              }
              o.push(`</h1>`);
              break;
            case 1:
              heading = 'SECTION';
              o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.sectioncssstyle}'>`);
              o.push(`${dept} &#160; ${this.escape(text)}`);
              if (config.showlabels) {
                o.push(`<mark style='font-size:small;position:absolute; '>[${label}]</mark>`);
              }
              o.push(`</h2>`);
              break;
            case 2:
              heading = 'SUBSECTION';
              o.push(`<h3 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.subsectioncssstyle}'>`);
              o.push(`${dept} &#160; ${this.escape(text)}`);
              if (config.showlabels) {
                o.push(`<mark style='font-size:small;position:absolute; '>[${label}]</mark>`);
              }
              o.push(`</h3>`);
              break;
            case 3:
              heading = 'SUBSUBSECTION';
              o.push(`<h4 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.subsubsectioncssstyle}'>`);
              o.push(`${dept} &#160; ${this.escape(text)}`);
              if (config.showlabels) {
                o.push(`<mark style='font-size:small;position:absolute; '>[${label}]</mark>`);
              }
              o.push(`</h4>`);
              break;
            case 4:
              heading = 'SUBSUBSUBSECTION';
              o.push(`<h5 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.subsubsectioncssstyle}'>`);
              o.push(`${dept} &#160; ${this.escape(text)}`);
              if (config.showlabels) {
                o.push(`<mark style='font-size:small;position:absolute; '>[${label}]</mark>`);
              }
              o.push(`</h5>`);
              break;
            default:
              heading = 'SUBSUBSUBSUBSECTION';
              o.push(`<h6 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='${this.subsubsectioncssstyle}'>`);
              o.push(`${dept} &#160; ${this.escape(text)}`);
              if (config.showlabels) {
                o.push(`<mark style='font-size:small;position:absolute; '>[${label}]</mark>`);
              }
              o.push(`</h6>`);
              break;
          }
          o.push('');
          break;
        }
        case 'VRSE': {
          if (this.isSkipping(config,dept)) break;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; margin-left:${left}cm'>`);
          o.push(`<blockquote style='${this.paracssstyle}' >`);                
          for (var text of data) {
            text = this.unmask(text);
            o.push(`${text}<br/>`);
          }
          o.push(`</blockquote>`);
          o.push(`</div>`);
          o.push('');
          break;
        }
        case 'LSTG': {
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; '>`);
          o.push(`<figure style='${this.paracssstyle}' >`);                
          o.push(`<figcaption style='position:relative; '>`);
          o.push(` Listing ${fig}: ${this.unmask(caption)} `);
          if (config.showlabels) {
            o.push(`<mark style='font-size:small;position:absolute; '>[${label}]</mark>`);
          }
          o.push(`</figcaption>`);
          text = text.map( x => this.escape(x) );
          text = text.join('\n');
          o.push(`<code style='${this.codecssstyle}' >`);
          o.push(`<pre style='${this.precssstyle}' >${text}</pre>`);
          o.push(`</code>`);
          o.push(`</figure>`);
          o.push(`</div>`);
          o.push('');
          break;
        }

        case 'SMPL': {
          if (this.isSkipping(config,dept)) break;
          var text = data;
          text = this.parseSample(text,config);
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; margin-left:${left}cm'>`);
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
          if (this.isSkipping(config,dept)) break;
          var text = data;
          if (fig) {
            text = text.map( x => this.escape(x) );
            text = text.join('\n');
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; column-span:all; '>`);
            o.push(`<span> Program ${fig} : ${this.unmask(caption)} ${showlabeltext} </span>`);
            if (fencecmd.n) {
              var linenum = 0;
              text = text.map( x => `<small>${this.expandString(++linenum,4,' ')}</small>${x}` );
            }
            if (fencecmd.frame) {
              o.push(`<pre style='border:1px solid #333; padding:6px; border-radius:2px; ${this.precssstyle}' >${text}</pre>`);
            } else {
              o.push(`<pre style='${this.precssstyle}' >${text}</pre>`);
            }
            o.push(`</div>`);
            o.push('');
          } else {
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; margin-left:${left}cm'>`);
            if (fencecmd.n) {
              text = text.map( x => this.escape(x) );
              text = text.join('\n');
              var linenum = 0;
              text = text.map( x => `<small>${this.expandString(++linenum,4,' ')}</small>${x}` );
            }
            if (fencecmd.frame) {
              text = text.map( x => this.escape(x) );
              text = text.join('\n');
              o.push(`<pre style='border:1px solid #333; padding:6px; border-radius:2px; ${this.precssstyle}' >${text}</pre>`);
            } else {
              //////o.push(`<pre style='${this.precssstyle}' >${text}</pre>`);
              o.push( this.toFramedSvg (text ) );
            }
            o.push(`</div>`);
            o.push('');
          }
          break;

        case 'CODE':  
          if (this.isSkipping(config,dept)) break;
         
          if (fig) {
            var text = data;
            text = text.map( x => this.escape(x) );
            if (fencecmd.n) {
              var linenum = 0;
              text = text.map( x => `<span style='position:relative;'><span style='font-size:75%; position:absolute; left:-${P_lstlisting_numbers_xleftmargin}cm;' >${this.expandString(++linenum,4,' ')}</span>${x}</span>` );
              text = text.join('\n');
              o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; column-span:all; '>`);
              o.push(`<span> Listing ${fig} : ${this.unmask(caption)} ${showlabeltext} </span>`);
              o.push(`<pre style='${this.precssstyle}; padding-left:${P_lstlisting_numbers_xleftmargin}cm;' >${text}</pre>`);
              o.push(`</div>`);
              o.push('');
            } else {
              text = text.join('\n');
              o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; column-span:all; '>`);
              o.push(`<span> Listing ${fig} : ${this.unmask(caption)} ${showlabeltext} </span>`);
              o.push(`<pre style='${this.precssstyle}; padding-left:0;' >${text}</pre>`);
              o.push(`</div>`);
              o.push('');
            }

          } else {
            var text = data;
            text = text.map( x => this.escape(x) );
            if (fencecmd.n) {
              var linenum = 0;
              text = text.map( x => `<span style='position:relative;'><span style='font-size:75%; position:absolute; left:-${P_lstlisting_numbers_xleftmargin}cm;' >${this.expandString(++linenum,4,' ')}</span>${x}</span>` );
              text = text.join('\n');
              o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; margin-left:${left}cm'>`);
              o.push(`<pre style='${this.precssstyle}; padding-left:${P_lstlisting_numbers_xleftmargin}cm;' >${text}</pre>`);
              o.push(`</div>`);
              o.push('');
            } else {
              text = text.join('\n');
              o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; margin-left:${left}cm'>`);
              o.push(`<pre style='${this.precssstyle}; padding-left:0;' >${text}</pre>`);
              o.push(`</div>`);
              o.push('');
            }
          }
          break;

        case 'PICT':  
          if (this.isSkipping(config,dept)) break;

          if (fig) {
            var text = data;
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; column-span:all;'>`);
            o.push(` <span style='text-align:center' > Figure ${fig}: ${this.unmask(caption)} ${showlabeltext} <span>`);
            o.push(`<p style='text-align:center; ${this.paracssstyle}' >`);                
            o.push(this.convertPict(text, config, fencecmd, true));
            o.push('</p>');
            o.push('</div>');
            o.push('');

          } else {
            var text = data;
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; margin-left:${left}cm'>`);
            o.push(`<p style='${this.paracssstyle}' >`);                
            o.push(this.convertPict(text, config, fencecmd, false));
            o.push('</p>');
            o.push('</div>');
            o.push('');

          }
          break;
         
        case 'TABB': {
          if (this.isSkipping(config,dept)) break;
          var text = data;
          var maxj = this.matrixMaxJ(text);
          if (maxj == 0) {
            maxj = 1;
          }
          var ww = [];
          var tableww = '';
          if (fencecmd.adjust) {
            ww = this.toArray(fencecmd.adjust);
            ww = this.toPcolumns(maxj,ww);
            ww = ww.map( x => 100.0 * parseFloat(x) );
            ww = ww.map( x => 'width:'+x+'%' );
            tableww = 'width:100%';
          }
          var text = text.map ( pp => this.expandList(pp,maxj,'') )
          var formats = this.toArray(fencecmd.format);
          if (fig) {
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; column-span:all; text-align:center; '>`);
            o.push(` <span> Table ${fig}: ${this.unmask(caption)} ${showlabeltext} <span>`);
            o.push(`<table style='${this.paracssstyle}; ${this.tablecssstyle}; ${tableww}; max-width:100%; margin-left:auto; margin-right:auto; ' >`);                
            var rowcount = 0;
            for (var pp of text) {
              rowcount += 1;
              pp = pp.map(x => x.split('\n'));
              if (rowcount == 1) {
                pp = pp.map(x => x.map(y => this.escape(y)));
              } else {
                pp = pp.map((x,i) => x.map(y => this.style(formats[i],y)));
              }
              pp = pp.map(x => x.join('<br/>'));
              o.push(`<tr style='${this.trcssstyle}' >`);
              if (rowcount == 1) {
                pp = pp.map((x,i) => `<th style='text-align:left; ${ww[i]?ww[i]:''}; ${this.thcssstyle} '>${x}</th>`);
                o.push(pp.join(''));
              } else {
                pp = pp.map((x,i) => `<td style='text-align:left; ${this.tdcssstyle} '>${x}</td>`);
                o.push(pp.join(''));
              }
              o.push('</tr>');
            }
            o.push(`</table>`);
            o.push('</div>');
            o.push('');
          } else {
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; margin-left:${left}cm'>`);
            o.push(`<table style='${this.paracssstyle}; ${this.tablecssstyle}; ${tableww}; max-width:100%; ' >`);                
            var rowcount = 0;
            for (var pp of text) {
              rowcount += 1;
              pp = pp.map(x => x.split('\n'));
              if (rowcount == 1) {
                pp = pp.map(x => x.map(y => this.escape(y)));
              } else {
                pp = pp.map((x,i) => x.map(y => this.style(formats[i],y)));
              }
              pp = pp.map(x => x.join('<br/>'));
              o.push(`<tr style='${this.trcssstyle}' >`);
              if (rowcount == 1) {
                pp = pp.map((x,i) => `<th style='text-align:left; ${ww[i]?ww[i]:''}; ${this.thcssstyle} '>${x}</th>`);
                o.push(pp.join(''));
              } else {
                pp = pp.map((x,i) => `<td style='text-align:left; ${this.tdcssstyle} '>${x}</td>`);
                o.push(pp.join(''));
              }
              o.push('</tr>');
            }
            o.push(`</table>`);
            o.push('</div>');
            o.push('');
          }
          break;
        }
        case 'QUOT': {
          if (this.isSkipping(config,dept)) break;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; margin-left:${left}cm'>`);
          var text = this.unmask(data);
          o.push(`<blockquote style='${this.paracssstyle}' >`);         
          o.push(`<q>${text}</q>`);
          o.push(`</blockquote>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'TERM': {
          if (this.isSkipping(config,dept)) break;
          if (fencecmd.table) {
            var text = data;
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; margin-left:${left}cm'>`);
            o.push(`<table style='${this.paracssstyle} ${this.tablecssstyle} width:100%; ' >`);         
            o.push(`<colgroup>`);
            o.push(`<col width='30%'/>`);
            o.push(`<col width='70%'/>`);
            o.push(`</colgroup>`);
            o.push(`<tbody>`);
            for (var i=0; i < text.length; i+=2) {
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
                o.push(`<tr style='${this.trcssstyle}' ><th style='text-align:left; ${this.thcssstyle} '>${dt}</th><th style='text-align:left; ${this.thcssstyle} '>${dd}</th></tr>`);
              } else {
                o.push(`<tr style='${this.trcssstyle}' ><td style='text-align:left; ${this.tdcssstyle} '>${dt}</td><td style='text-align:left; ${this.tdcssstyle} '>${dd}</td></tr>`);
              }
            }
            o.push(`</tbody>`);
            o.push(`</table>`);
            o.push('</div>');
            o.push('');
          } else {
            var text = data;
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; margin-left:${left}cm'>`);
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
          if (this.isSkipping(config,dept)) break;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0;' >`);
          o.push(`<p style='${this.paracssstyle}' >`);         
          var text = data;
          if (text.length == 1) {
            for (var s of text) {
              s = this.tokenizer.parse(s,true);
              o.push(`<span style='display:block;text-align:center;position:relative'>${s} `);
              o.push(` <span style='position:absolute;right:0px;'>(${fig}) `);
              if (config.showlabels) {
                o.push(`  <mark style='font-size:small;position:absolute; '>[${label}]</mark> `);
              }
              o.push(` </span> `);
              o.push(`</span> `);
            }
          } else if (text.length > 1) {
            var j = 0;
            for (var s of text) {
              s = this.tokenizer.parse(s,true);
              var subfig = this.toSubfigNum(j);
              o.push(`<span style='display:block;text-align:center;position:relative'>${s} `);
              o.push(` <span style='position:absolute;right:0px;'>(${fig}${subfig}) `);
              if (config.showlabels) {
                o.push(`  <mark style='font-size:small;position:absolute; '>[${id}]</mark> `);
              }
              o.push(` </span> `);
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
          if (this.isSkipping(config,dept)) break;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0' >`);
          o.push(`<dl style='${this.paracssstyle}' >`);         
          var [ cat, keys, text, xn ] = data;
          const xleft = `${Math.floor(xn/config.stepspaces)*config.stepmargin}cm`;
          for (i=0; i < keys.length; ++i) {
            if (cat === 'mono') {
              o.push(`<dt style='${this.dtcssstyle}' ><code style='${this.codecssstyle}' ><b>${this.escape(keys[i])}</b></code></dt>`);
            } else if (cat === 'strong') {
              o.push(`<dt style='${this.dtcssstyle}' ><b>${this.escape(keys[i])}</b></dt>`);
            } else {
              o.push(`<dt style='${this.dtcssstyle}' ><b><i>${this.escape(keys[i])}</i></b></dt>`);
            }
          }
          o.push(`<dd style='margin-left:${xleft}; ${this.ddcssstyle}'>${this.unmask(text)}</dd>`);
          o.push('</dl>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PRIM': {
          if (this.isSkipping(config,dept)) break;
          var [lead,text] = data;
          o.push(`<div id='${id}' class='PRIM' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0' >`);
          o.push(`<p style='${this.paracssstyle}' >`);         
          o.push(`<b>${this.escape(lead)}</b>`);
          o.push(`${this.unmask(text)}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'SECO': {
          if (this.isSkipping(config,dept)) break;
          var [lead,text] = data;
          o.push(`<div id='${id}' class='SECO' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0' >`);
          o.push(`<p style='${this.paracssstyle}' >`);         
          o.push(`&#160; &#160; &#160; <b>${this.escape(lead)}</b>`);
          o.push(`${this.unmask(text)}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PLST': {
          if (this.isSkipping(config,dept)) break;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; margin-left:${left}cm'>`);
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
          if (this.isSkipping(config,dept)) break;
          o.push(`<div id='${id}' class='TEXT' dept='${dept}' fName='${fname}' subrow='${subrow}' rows='${row1} ${row2}' style='margin:1em 0; margin-left:${left}cm'>`);
          var text = this.unmask(data);
          if (config.parskip) {
            o.push(`<p style='${this.paracssstyle}' >`);
            o.push(`${text}`);
            o.push(`</p>`);
          } else {
            /// checks the 'heading' variable and if it is set to 'CHAPTER', 'SECTION', etc.,
            /// then this is the first content block for this dept.
            if (heading) {
              o.push(`<p style='margin:0'>${text}</p>`);
              heading = '';
            } else {
              o.push(`<p style='margin:0;text-indent:0.5cm'>${text}</p>`);
            }
          }
          o.push('</div>');
          o.push('');
          break;
        }
      }
    }
    return o;
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
          return `<span>${this.escape(cnt)}</span><span style='word-break:break-all'>(<code style='${this.codecssstyle}' >${this.escape(uri)}</code>)</span>`
        } else {
          return `<span style='word-break:break-all'><code style='${this.codecssstyle}' >${this.escape(uri)}</code></span>`
        }
        break;
      }
      case 'ruby': {
        const [rb,rt] = text;
        return `<ruby><rb>${this.escape(rb)}</rb><rt>${this.escape(rt)}</rt></ruby>`
        break;
      }
      case 'ref': {
        /// checks to see if it exists in 'this.xrefs' database
        var label = text;
        if (this.xrefs[label]) {
          var ref_texts = this.xrefs[label];
          var ref_texts = ref_texts.map( ref_text => `<a href='#' style='${this.acssstyle}' >${this.escape(ref_text)}</a>`);
          var o = [];
          o.push(ref_texts.join(', '));
          if (this.config.showlabels) {
            o.push(`<mark style='font-size:small'>[${label}]</mark>`);
          }
          return o.join(' ');
        } else {
          var o = [];
          o.push( '??' );
          if (this.config.showlabels) {
            o.push(`<mark style='font-size:small'>[${label}]</mark>`);
          } 
          return o.join(' ');
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

  convertPict (text, config, fencecmd, isfigure) {

    var o = [];
    for (var pp of text) {

      var kk = pp.map( x => {
          var [image,width,opts,src,srcs,sub] = x;
          if (!src && srcs.length) {
            src = srcs[0];///TODO: need to change it so that it picks a right format
          }
          if (config.previewimages && this.view && this.view.hasImage(src)) {
            var imgdata = this.view.getImage(src);
            var imgid = '';
          } else {
            var imgdata = `./${src}`;
            var imgid = ''
            if (config.previewimages && this.view) {
              this.imgid += 1;
              imgid = `nitrile-preview-img-${this.imgid}`;
              this.view.requestImage(imgid,src);
            }
          }
          var { height, frame } = opts;
          if (!height) {
            height = '';
          }
          if (!frame) {
            frame = '';
          } else {
            frame = '1px solid #333';
          }
          return `<img id='${imgid}' alt='${src}' src='${imgdata}' width='${100.0*width}%' 
                  style='vertical-align:text-bottom; width:${100.0*width}%; 
                  height:${height}; outline:${frame};' />`;
      });

      var sep = '';
      if (fencecmd.spacing && fencecmd.spacing > 0) {
        var sep = '&#160;'.repeat(fencecmd.spacing);
      }

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
    if (config.twocolumn) {
      var leftmargin = config.leftmarginTC;
      var rightmargin = config.rightmarginTC;
      var topmargin = config.topmarginTC;
      geometry_opts.push(`padding-left:${leftmargin}cm`);
      geometry_opts.push(`padding-right:${rightmargin}cm`);
      geometry_opts.push(`padding-top:${topmargin}cm`);
      geometry_opts.push(`column-count:2`);
      geometry_opts.push(`column-gap:0.40cm`);
    } else {
      var leftmargin = config.leftmargin;
      var rightmargin = config.rightmargin;
      var topmargin = config.topmargin;
      geometry_opts.push(`padding-left:${leftmargin}cm`);
      geometry_opts.push(`padding-right:${rightmargin}cm`);
      geometry_opts.push(`padding-top:${topmargin}cm`);
    }
    geometry_opts.push(`background-color:white`); 
    geometry_opts.push(`color:#333`); 
    geometry_opts.push(`margin:0`); 
    geometry_opts.push(`box-sizing:border-box`); 
    geometry_opts.push(`width:21.6cm`); 
    geometry_opts.push(`padding-bottom:4cm`); 
    geometry_opts.push(`font-family:roman`); 
    geometry_opts.push(`font-size:11.5pt`); 
    var geometry_text = geometry_opts.join('; ');
    return geometry_text;
  }

  getParaMaxWidth (para) {
    var n = 0;
    for (var s of para) {
      n = (s.length > n) ? s.length : n;
    }
    return n;
  }

  toFramedSvg (para ) {

    var npara = para.length; 
    var mpara = this.getParaMaxWidth(para);

    var width = `${2*(mpara+2)}mm`;
    var height = `${((npara+3)*12/96.0)}in`;

    var vw = 2*(mpara+2)*3.78;/// from mm -> px
    var vh = (npara+3)*12;

    var o = [];
    o.push( `<svg xmlns='http://www.w3.org/2000/svg' width='100%' viewbox='0 0 ${vw} ${vh}' >` );
    var i = 1;
    for (var s of para) {
      i += 1;
      var s = this.escape(s);
      o.push( `<text\
            style='font-family:monospace;white-space:pre;font-size:12px;'\
            text-anchor='start'\
            x='0' y='0' dx='12px' dy='${i*12}px'>${s}</text>` );
    }
    o.push( "</svg>" );
    return o.join('\n');
  }

}

module.exports = { NitrilePreviewHtml };
