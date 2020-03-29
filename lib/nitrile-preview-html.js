'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');
const { NitrilePreviewDiagramSVG } = require('./nitrile-preview-diagramsvg');
const { NitrilePreviewAutonum } = require('./nitrile-preview-autonum');
const utils = require('./nitrile-preview-utils');
const entjson = require('./nitrile-preview-entity.json');

class NitrilePreviewHtml extends NitrilePreviewParser {

  constructor() {
    super();
    this.tokenizer = new NitrilePreviewTokenizer(this);
    this.images = new Map();/// this is a image src -> base64-encoded string map
    this.view = null; /// this is a NitrilePreviewView object
    this.imgid = 0;
    this.normalsize = '12';
    this.fs = 'normalsize';
    this.xsize = '';
    this.xnormalfontsize = '11.5pt';
    this.blocks = null;
    this.dept = '';
    this.isepub = 0;
    this.stylesheet = `

.TITLE {
  font-size:175%; 
  text-align:center; 
}

.AUTHOR {
  font-size:large; 
  text-align:center; 
}

.DATE {
  font-size:large; 
  text-align:center; 
}

.PART {
  background-color:inherit; 
  color:inherit; 
  font-size:xx-large; 
  font-variant:small-caps; 
  font-weight:bold; 
  position:relative; 
}

.CHAPTER {
  background-color:inherit; 
  color:inherit; 
  font-size:163%; 
  font-weight:bold; 
  position:relative;
}

.SECTION {
  background-color:inherit; 
  color:inherit; 
  font-size:153%; 
  font-weight:bold; 
  position:relative; 
}

.SUBSECTION {
  background-color:inherit; 
  color:inherit; 
  font-size:123%; 
  font-weight:bold; 
  position:relative; 
}

.SUBSUBSECTION {
  background-color:inherit; 
  color:inherit; 
  font-size:100%; 
  font-weight:bold; 
  position:relative; 
}

.P {
  background-color:inherit; 
  color:inherit; 
  border:none; 
  padding:0; 
  margin:1em 0; 
  font-size:inherit;
  font-weight:inherit;
  line-height:1.30; 
  border-collapse:collapse; 
  position:relative; 
}

.CODE {
  background-color:inherit; 
  color:inherit; 
  padding:inherit; 
  font-size:80%; 
}

.URL {
  background-color:inherit; 
  color:inherit; 
  padding:inherit; 
  word-break:break-all; 
  font-family:monospace; 
  font-size:80%; 
}

.REF {
  background-color:inherit; 
  color:inherit; 
  font-family:monospace; 
  font-size:80%; 
}

.DT {
  margin-top:0; 
  margin-bottom:0; 
  font-weight:bold; 
  line-height:inherit; 
}

.DD {
  margin-top:0; 
  margin-bottom:0; 
  line-height:inherit; 
}

.TABLE {
  border-collapse:collapse; 
}
`;

  }

  setView (view) {
    this.view = view;
  }

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
    this.isreport = config.ALL.isReport;
    for (var block of all) {
      var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
      this.blockcount++;///will be cleared by a HDGS
      this.block = block;
      this.base = base;
      console.log(fencecmd);
      var fencecmd = this.updateFencecmd(fencecmd,sig,config);
      console.log(fencecmd);
      var caption = fencecmd.caption?fencecmd.caption:'';
      const star = fencecmd.star;
      this.fs = fencecmd.fs;
      this.xsize = this.toCssFontsize(this.fs);
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
  do_part(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var text = data;
    text = this.escape(text);
    var o = [];
    o.push(`<h2 id='${id}' class='PART' dept='' fName='' rows='${row1} ${row2}' >`);
    o.push(`<p class='P'>`);
    o.push(text);
    o.push(`</p>`);
    o.push(`</h2>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_hdgs(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var [hdgn,text] = data;
    text = this.escape(text);
    var dept = fencecmd.idnum;
    this.dept = dept;
    // reset the normal paragraph count to 0 so that the first normal paragraph will not indent
    this.blockcount = 0;///this number keeps track total blocks, and is cleared
                   ///after a HDG is encountered, allowing TEXT block to figure if it needs
                   ///to add indent to its text.
    var o = [];
    var heading;
    if (!this.isreport) {
      switch (hdgn) {
        case 0:
          break;///this has to be ignored specifically otherwise it will show through
        case 1:
          heading = 'SECTION';
          o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' >`);
          o.push(`${dept} &#160; ${text} `);
          o.push(`</h2>`);
          break;
        case 2:
          heading = 'SUBSECTION';
          o.push(`<h3 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' >`);
          o.push(`${dept} &#160; ${text} `);
          o.push(`</h3>`);
          break;
        default:
          heading = 'SUBSUBSECTION';
          o.push(`<h4 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' >`);
          o.push(`${dept} &#160; ${text} `);
          o.push(`</h4>`);
          break;
      }
    } else {
      switch (hdgn) {
        case 0:
          break;///this has to be ignored specifically otherwise it will show through
        case 1:
          heading = 'CHAPTER';
          o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${fname}'  rows='${row1} ${row2}' >`);
          o.push(`Chapter ${dept} &#160; ${text} `);
          o.push(`</h2>`);
          break;
        case 2:
          heading = 'SECTION';
          o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' >`);
          o.push(`${dept} &#160; ${text} `);
          o.push(`</h2>`);
          break;
        case 3:
          heading = 'SUBSECTION';
          o.push(`<h3 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' >`);
          o.push(`${dept} &#160; ${text} `);
          o.push(`</h3>`);
          break;
        default:
          heading = 'SUBSUBSECTION';
          o.push(`<h4 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' >`);
          o.push(`${dept} &#160; ${text} `);
          o.push(`</h4>`);
          break;
      }
    }
    o.push('');
    block.html = o.join('\n');
  }
  do_dlst(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    o.push(`<dl id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' >`);
    for (var item of data) {
      var [keys,text] = item;
      keys = keys.map( x => this.escape(x) );
      text = this.unmask(text);
      for (var key of keys) {
        o.push(`<dt class='DT'>${key}</dt>`);
      }
      o.push(`<dd class='DD' style='margin-left:${this.xleft};' >${text}</dd>`);
    }
    o.push('</dl>');
    o.push('');
    block.html = o.join('\n');
  }
  do_plst(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    o.push(`<p id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' >`);
    for (var item of data) {
      var [lead,bullet,text] = item;
      bullet = bullet || '';
      text = text || '';
      var value = '';
      if (bullet === '-' || bullet === '*' || bullet === '+') {
        value = '';
      } else if (bullet.match(/^\d+\.$/)) {
        value = this.chomp(bullet);
      } else {
        value = '';
      }
      if (bullet === '*') {
        var re = this.re_dlitem;
        var v = re.exec(text);
        if (v) {
          text = `${this.style('strong',v[1])} - ${this.unmask(v[2])}`;
        } else {
          text = this.unmask(text);
        }
      } else {
        text = this.unmask(text);
      }
      if (item.length === 3) {
        switch (lead) {
          case 'OL': {
            o.push(`<ol style='padding-left:${this.xleft};list-style-position:outside;'><li value='${value}'>${text}`);
            break;
          }
          case 'UL': {
            o.push(`<ul style='padding-left:${this.xleft};list-style-position:outside;'><li value='${value}'>${text}`);
            break;
          }
          case 'LI': {
            o.push(`</li><li value='${value}'>${text}`);
            break;
          }
          case '/OL': {
            o.push(`</li></ol></li><li value='${value}'>${text}`);
            break;
          }
          case '/UL': {
            o.push(`</li></ul></li><li value='${value}'>${text}`);
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
    o.push('');
    block.html = o.join('\n');
  }
  do_verb(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var text = data;
    if (this.xname === 'listing') {
      if (this.xnumbers) {
        var linenum = 0;
        text = text.map( x => this.escape(x) );
        text = text.map( x => `<span style='position:relative;'><span style='position:absolute;right:${this.xnumbersep};font-size:xx-small'>${++linenum}</span></span>${x}` );
      }
      text = text.join('\n');
      text = `<pre>${text}</pre>`;
      o.push(`<figure id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' style='font-size:${this.xsize}'>`);
      o.push(`<figcaption> Listing ${this.xidnum} : ${this.caption_text} </figcaption>`);
      o.push(text);
      o.push('</figure>');
      o.push('');
    } else {
      if (this.xnumbers) {
        var linenum = 0;
        text = text.map( x => this.escape(x) );
        text = text.map( x => `<span style='position:relative;'><span style='position:absolute;right:${this.xnumbersep};font-size:xx-small'>${++linenum}</span></span>${x}` );
      }
      text = text.join('\n');
      o.push(`<pre id='${id}' class='P {sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' style='font-size:${this.xsize};'>${text}</pre>`);
      o.push('');
    }
    block.html = o.join('\n');
  } 
  do_item(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var text = data;
    text = text.join('\n');
    text = this.unmask(text);
    o.push(`<p id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${this.xleft};font-size:${this.xsize};'>${text}</p>`);
    o.push('');
    block.html = o.join('\n');
  }
   
  do_list(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var text = data;
    text = text.map(x => this.unmask(x));
    text = text.map(x => `<li style='padding-left:1em;text-indent:-1em;'>${x}</li>`);
    text = text.join('\n');
    o.push(`<ul id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' style='list-style-position:inside;margin-left:${this.xleft};font-size:${this.xsize};'>${text}</ul>`);
    o.push('');
    block.html = o.join('\n');
  } 
  do_samp(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var text = data;
    if (this.xparatype === 0) {
      text = text.map( x => this.escape(x) );
      if (fencecmd.autoruby) { text = text.map( x => this.rubify(x) ); }
      text = text.join('\n');
      o.push(`<pre id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${this.xleft};font-size:${this.xsize};'>${text}</pre>`);
      o.push('');
    } else if (this.xparatype === 1) {
      text = this.joinBackslashedLines(text);
      text = text.map( x => this.escape(x) );
      if (fencecmd.autoruby) { text = text.map( x => this.rubify(x) ); }
      text = text.join('<br/>\n');
      o.push(`<p id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${this.xleft};font-size:${this.xsize};'>${text}</p>`);
      o.push('');
    } else if (this.xparatype === 2) {
      text = this.joinBackslashedLines(text);
      text = text.map( x => this.escape(x) );
      if (fencecmd.autoruby) { text = text.map( x => this.rubify(x) ); }
      text = text.map( x => `<li>${x}</li>` );
      text = text.join('\n');
      o.push(`<ul id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${this.xleft};font-size:${this.xsize};padding-left:0;list-style-position:outside;' >${text}</ul>`);
      o.push('');
    }
    block.html = o.join('\n');
  }
  do_hrle(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var text = data;
    o.push(`<p id='${id}' class='P ${sig}' style='height:3em;display:flex;flex-direction:row;' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' >`);
    text = this.unmask(text);
    o.push(`<span style='margin:auto;'>${text}</span>`);
    o.push('</p>');
    o.push('');
    block.html = o.join('\n');
  }
  do_prim(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var lead
    var text;
    [lead,text] = data;
    lead = this.unmask(lead);
    text = this.unmask(text);
    o.push(`<p id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' >`);
    o.push(`<b>${lead}</b> &#160; ${text}`);
    o.push('</p>');
    o.push('');
    block.html = o.join('\n');
  }
  do_seco(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var lead
    var text;
    [lead,text] = data;
    lead = this.unmask(lead);
    text = this.unmask(text);
    o.push(`<p id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' >`);
    const indent = '&#160;'.repeat(5);
    o.push(`${indent}<b>${lead}</b> &#160; ${text}`);
    o.push('</p>');
    o.push('');
    block.html = o.join('\n');
  }
  do_text(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var text = data;
    var v;
    if (this.xparatype===0 && this.blockcount == 1) {
      text = this.unmask(text);
      o.push(`<p id='${id}' class='P TEXT' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-top:0;margin-bottom:0;text-indent:0; ' >`);
      o.push(text);
      o.push('</p>');
    } 
    else if (this.xparatype===0 ) {
      text = this.unmask(text);
      o.push(`<p id='${id}' class='P TEXT' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-top:0;margin-bottom:0;text-indent:${this.xindent}; ' >`);
      o.push(text);
      o.push('</p>');
    } 
    else {
      o.push(`<p id='${id}' class='P TEXT' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' >`);
      text = this.unmask(text);
      o.push(text);
      o.push('</p>');
      ///const indent = '&#160;'.repeat(5);
      ///o.push(`${indent}${text}`);
    }
    o.push('');
    block.html = o.join('\n');
  }
  do_quot(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var text = data;
    var lq = String.fromCharCode('0x201C');
    var rq = String.fromCharCode('0x201D');
    o.push(`<p id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${this.xleft};margin-right:${this.xleft};font-size:${this.xsize};'>`);
    o.push(`${lq}${text}${rq}`);
    o.push(`</p>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_incl(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var text = para;///must use 'para', as 'data' has been parsed by parseQUOT()
    text = text.map( x => this.escape(x) );
    o.push(`<p id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' >`);
    o.push(text.join('<br/>'));
    o.push(`</p>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_imgs(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var text = data;
    var re_margin = /^margin\s+(.*)$/;
    var re_gap = /^gap\s+(.*)$/;
    var re_column = /^column\s+(.*)$/;
    var re_columns = /^columns\s+(.*)$/;
    var re_image = /^image\s+\((.*?)\)\s*(.*)$/;

    var columns = [1];
    var gap = 1;
    var margin = 0;
    var images = [];
    var column = 1;

    /// parse the input
    for( var line of data ) {
      var v;
      if((v=re_margin.exec(line))!==null) {
        margin = this.toInt(v[1],margin);
      } else if((v=re_gap.exec(line))!==null) {
        gap = this.toInt(v[1],gap);
      } else if((v=re_column.exec(line))!==null) {
        column = this.toInt(v[1],column);
        if (column < 1) column = 1;
      } else if((v=re_columns.exec(line))!==null) {
        var columns = this.toIntArray(v[1]);
        if (columns.length === 0) {
          columns = [1];
        }
      } else if ((v=re_image.exec(line))!==null) {
        images.push(['image',v[1],v[2]]);
      }
    }

    /// build images using grid layout
    var s = [];
    s.push(`<p id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' style='display:grid;grid-template-columns:repeat(${column},1fr);grid-gap:1rem;' >`);
    images.forEach(x => {
        var [image,src,sub] = x;
        sub = this.unmask(sub);
        s.push(`<span style='display:inline-block;text-align:center;'><img src='./${src}' style='vertical-align:text-bottom;width:100%;' alt='${src}'/><small>${sub}</small></span>`);
    });
    s.push('</p>');

    if (this.xname === 'figure') {
      o.push('<figure>');
      o.push(`<figcaption style='text-align:center;' > Figure ${this.xidnum} : ${this.caption_text} </figcaption>`);
      o.push(s.join('\n'));
      o.push('</figure>');
    } else {
      o.push(s.join('\n'));
    }
    o.push('');

    ///NOTE: ***IMPORTANT*** these must be done in order for EPUB export to work.
    /// IT is to generate ['image',...] entries in 'p'
    var imgsrcs = [];
    images.forEach(x => {
        var [image,src,sub] = x;
        imgsrcs.push(src);
    });

    block.imgsrcs = imgsrcs;
    block.html = o.join('\n');
  }
  do_tabb(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var ncols = data.length;
    var nrows = 0;
    var s = [];
    data.forEach(x => {
      var n = x.length;
      nrows = Math.max(n,nrows);
    });
    for(var j=0; j<nrows; ++j){
      var pp = data.map(x => x[j]||'');
      pp = pp.map(x => this.unmask(x));
      pp = pp.map(x => `<span>${x}</span>`);
      var p = pp.join('\n');
      s.push(p);
    }
    var text = s.join('\n');
    o.push(`<p id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' style='display:grid;grid-template-columns:repeat(${ncols},1fr);' >`);
    o.push(text);
    o.push('</p>');
    o.push('');
    block.html = o.join('\n');
  }
  do_tblr(block){
    this.do_tblr_long(block);
  }
  do_long(block){
    this.do_tblr_long(block);
  }
  do_tblr_long(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var [rows,maxj,ww] = data;
    if (fencecmd.adjust) {
      ww = this.toAdjustedColumns(maxj,fencecmd.adjust);
    }
    var vlines = fencecmd.vlines;
    var hlines = fencecmd.hlines;
    var vlines = this.toArray(vlines);
    var hlines = this.toArray(hlines);
    var vlines = vlines.map( x => parseInt(x) );
    var vpadding = fencecmd.vpadding;
    var vpadding = parseInt(vpadding);
    var hpadding = fencecmd.hpadding;
    var hpadding = parseInt(hpadding);
    rows = rows.map ( row => {
      row = row.map(x => x.split('\n'));
      row = row.map(x => x.map(y => this.unmask(y)));
      row = row.map(x => x.join('<br/>'));
      return row;
    });
    ww = this.wwToHundred(ww);
    var t = (vpadding>0)?vpadding:0;
    var h = (hpadding>0)?hpadding:0;
    var s = [];
    if (sig==='TBLR') {
      s.push(`<table id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' border='0' style='font-size:${this.xsize};margin-left:auto;margin-right:auto; ' >`);
    } else if (sig==='LONG') {
      s.push(`<table id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' border='0' style='font-size:${this.xsize};width:100%; ' >`);
    }
    var header = rows.shift();
    var header = header.map(x => `<strong>${x}</strong>`);
    var header = header.map((x,i) => `<td style='text-align:left;vertical-align:top;\
          padding:${t}px ${h}px;\
          ${(sig==='LONG')?'width:'+ww[i]+'%;':''}
          ${vlines.indexOf(i)>=0?'border-left:1px solid black;':''}\
          ${vlines.indexOf(i+1)>=0?'border-right:1px solid black;':''}\
          ${hlines.indexOf('t')>=0?'border-top:1px solid black;':''}\
          ${hlines.indexOf('m')>=0?'border-bottom:1px solid black;':''} '>${x}</td>`);
    s.push(`<tr>${header.join('')}</tr>`);
    var n = rows.length;
    for (var j=0; j < rows.length; ++j) {
      var row = rows[j];
      var row = row.map((x,i) => `<td style='text-align:left;vertical-align:top;\
          padding:${t}px ${h}px;\
          ${(sig==='LONG')?'width:'+ww[i]+'%;':''}
          ${vlines.indexOf(i)>=0?'border-left:1px solid black;':''}\
          ${vlines.indexOf(i+1)>=0?'border-right:1px solid black;':''}\
          ${j>0&&hlines.indexOf('r')>=0?'border-top:1px solid black;':''}\
          ${j==n-1&&hlines.indexOf('b')>=0?'border-bottom:1px solid black;':''} '>${x}</td>`);
      s.push(`<tr>${row.join('')}</tr>`);
    }
    s.push(`</table>`);
    if (this.xname === 'table') {
      o.push(`<figure>`);
      o.push(`<figcaption style='text-align:center;' > Table ${this.xidnum} : ${this.caption_text} </figcaption>`);
      o.push(s.join('\n'));
      o.push(`</figure>`);
    } else {
      o.push(s.join('\n'));
    }
    o.push('');
    block.html = o.join('\n');
  } 
  do_diag(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var star = fencecmd.star;
    if (star) {
      (new NitrilePreviewDiagramSVG(this,this.tokenizer)).def_pic(data);
    } else {
      var [text,vw,vh] = new NitrilePreviewDiagramSVG(this,this.tokenizer).parse(data);
      o.push(`<p id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' >`);
      o.push(`<svg xmlns:xlink='http://www.w3.org/1999/xlink' fill='currentColor' stroke='currentColor' viewBox='0 0 ${vw} ${vh}'\
              role='img' focusable='false' xmlns='http://www.w3.org/2000/svg' >`);
      o.push(text);
      o.push(`</svg>`);
      o.push(`</p>`);
      o.push('');
    }
    block.html = o.join('\n');
  }
  do_math(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var name = fencecmd.name;
    name = name||'';
    name = name.toLowerCase();
    if (name === 'aligns') {
      this.toEquations(o,id,sig,this.dept,fname,row1,row2,data,fencecmd,true);
    } else if (name === 'gathers') {
      this.toEquations(o,id,sig,this.dept,fname,row1,row2,data,fencecmd,false);
    } else if (name === 'subequations') {
      this.toSubequations(o,id,sig,this.dept,fname,row1,row2,data,fencecmd,false);
    } else if (name === 'multline') {
      this.toMultline(o,id,sig,this.dept,fname,row1,row2,data,fencecmd,false);
    } else if (name === 'split') {
      this.toEquation(o,id,sig,this.dept,fname,row1,row2,data,fencecmd,true);
    } else if (name === 'equation') {
      this.toEquation(o,id,sig,this.dept,fname,row1,row2,data,fencecmd,false);
    } else {
      this.toDisplayMath(o,id,sig,this.dept,fname,row1,row2,data,fencecmd,false);
    }
    block.html = o.join('\n');
  }
  do_frmd(block) {
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var text = data;
    var [out, vw, vh] = this.toFramedSvg(text);
    o.push(`<p id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' >`);
    o.push( `<img style='width:100%; max-width:${vw}px;' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(out)}" />` );
    o.push('</p>');
    o.push('');
    block.html = o.join('\n');
  }
  do_vers(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = []; 
    var text = data;
    text = text.map ( x => this.unmask(x) );
    o.push(`<p id='${id}' class='P ${sig}' dept='${this.dept}' fName='${fname}' rows='${row1} ${row2}' >`);
    o.push(text.join('<br/>'));
    o.push(`</p>`);
    o.push('');
    block.html = o.join('\n');
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
         .replace(/'/g, "&#039;")
         .replace(/⁻¹/g,"<sup><small>-1</small></sup>")
         .replace(/⁻²/g,"<sup><small>-2</small></sup>")
         .replace(/⁻³/g,"<sup><small>-3</small></sup>")
         .replace(/¹/g,"<sup><small>1</small></sup>")
         .replace(/²/g,"<sup><small>2</small></sup>")
         .replace(/³/g,"<sup><small>3</small></sup>");
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
    /// str: myfile-mylabel
    /// search for a block whose 'fencecmd.baselabel' matches str
    /// if found, extracts the 'fencecmd.idnum'
    var idnum = str;
    for (var j=0; j < this.blocks.length; ++j) {
      var block = this.blocks[j];
      var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
      var cssid = block.id;
      var fencecmd = block.fencecmd;
      var base = block.base;
      var saveas = fencecmd.saveas;
      var saveas = saveas || '';
      if (!this.isepub) {
        saveas = '';
      }
      var baselabel = fencecmd.baselabel;
      if( str.localeCompare(baselabel)===0) {
        var idnum = fencecmd.idnum;
        return `<a class='REF' href='${saveas}#${cssid}'>${idnum}</a>`;
        break;
      }
    }
    return `<s>this.escape(str)</s>`;
  }

  style (type, text) {

    ///
    /// return the styled inline text
    ///

    type = type || '';
    switch (type) {
      case 'inlinemath': {
        var s = this.tokenizer.parse(text);
        return `${s}`;
        break;
      }
      case 'displaymath': {
        var s = this.tokenizer.parse(text,true);
        return `${s}`;
        break;
      }
      case 'code': {
        return `<code class='CODE'>${this.escape(text)}</code>`
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
          return `<span>${this.escape(cnt)}</span> (<span class='URL' >${this.escape(uri)}</span>)`;
        } else {
          return `<span class='URL' >${this.escape(uri)}</span>`
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

  toPageCssStyleText (config) {

    var xnormalfontsize = this.to_normalfontsize(config.HTML.normalfontsize);

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
    geometry_opts.push(`font-size:${xnormalfontsize}`);
    return geometry_opts.join('; ');
  }

  toFramedSvg (para ) {

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

  toFramedCode (text) {
    if (this.xnumbers) {
      var linenum = 0;
      text = text.map( x => `<span style='position:relative;'><span style='position:absolute;left:-${this.xnumbersep};'><small>${++linenum}</small></span>${x}</span>` );
    }
  }

  toFramedTabbing(text, maxj, ww, fencecmd, config) {
    ww = this.wwToHundred(ww);
    var o = [];
    o.push(`<table border='0' style='${this.paracssstyle}; ${this.tablecssstyle}; width:100%;' >`);
    for (var pp of text) {
      pp = pp.map(x => x.split('\n'));
      pp = pp.map(x => x.map(y => this.unmask(y)));
      pp = pp.map(x => x.join('<br/>'));
      o.push(`<tr >`);
      pp = pp.map((x,i) => `<td style='text-align:left; padding:2; width:${ww[i]}%; '>${x}</td>`);
      var v = pp.join('');
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

  _replaceRef( htmls, chaps ) {

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
    ww = this.wwToOne(ww);
    ww = ww.map( x => x*remain_w );
    ww = ww.map( x => x*100 );
    return ww;
  }

  toCssFontsize(fs){
    return this.tokenizer.toCssFontsize(fs);
  }

  toDisplayMath(o,id,sig,dept,fname,row1,row2,data,fencecmd,isalignequalsign) {
    var data = data.map( x => x.join('\n') );
    var text = data.join('\n');
    var text = this.tokenizer.parse(text,true);
    o.push(`<p id='${id}' class='P ${sig}' style='text-align:center;' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' >`);
    o.push(text);
    o.push('</p>');
    o.push('');
  }

  toEquation(o,id,sig,dept,fname,row1,row2,data,fencecmd,isalignequalsign) {
    o.push(`<table id='${id}' class='P ${sig}' border='0' style='margin-left:auto;margin-right:auto;' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' >`);
    var bls = data;
    var j = 0;
    var idnum = fencecmd.idnum;
    var idnum = idnum || '';
    var subnum = '';
    var star = fencecmd.star||'';
    for (var bl of bls) {
      j++;
      if (!star && j===1) {
        ///getting it the first time
        var numtext = `<span style='position:absolute;right:-20pt;'>(${idnum}${subnum})</span>`;
      } else {
        var numtext = '';
      }
      var s0 = bl.join(' ');
      if( isalignequalsign) {
        var re_equalsign = /^(.*?)\=(.*)$/;
        var v = re_equalsign.exec(s0);
        if (v) {
          var s = ['&#160;','&#160;','&#160;','&#160;'];
          s[0] = this.tokenizer.parse(v[1],true);
          s[1] = this.tokenizer.parse('=',true);
          s[2] = this.tokenizer.parse(v[2],true);
          var align_vals = ['right','center','left',''];
          var paddn_vals = ['5pt','5pt','0','0'];
          s[3] = `${s[3]}${numtext}`;
        } else {
          var s = ['&#160;','&#160;','&#160;','&#160;'];
          s[2] = this.tokenizer.parse(s0,true);
          var align_vals = ['right','center','left',''];
          var paddn_vals = ['0','0','0','0'];
          s[3] = `${s[3]}${numtext}`;
        }
      } else {
        var s = ['&#160;','&#160;'];
        var align_vals = ['right',''];
        var paddn_vals = ['0','0'];
        s[0] = this.tokenizer.parse(s0,true);
        s[1] = `${s[1]}${numtext}`;
      }
      s = s.map((x,i)=>`<td style='text-align:${align_vals[i]};padding-right:${paddn_vals[i]}'>${x}</td>`);
      s = s.join('');
      s = `<tr>${s}</tr>`;
      o.push(s);
    }
    o.push(`</table>`);
    o.push('');
  }

  toEquations(o,id,sig,dept,fname,row1,row2,data,fencecmd,isalignequalsign) {
    o.push(`<table id='${id}' class='P ${sig}' border='0' style='margin-left:auto;margin-right:auto;' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' >`);
    var bls = data;
    var j = 0;
    var idnum = fencecmd.idnum;
    var idnum = idnum || '';
    var idnums = idnum.split(',');
    var star = fencecmd.star||'';
    for (var bl of bls) {
      j++;
      if (!star) {
        ///getting it every time
        var idnum = idnums[j-1];
        var subnum = '';
        var numtext = `<span style='position:absolute;right:-20pt;'>(${idnum}${subnum})</span>`;
      } else {
        var numtext = '';
      }
      var s0 = bl.join(' ');
      if( isalignequalsign) {
        var re_equalsign = /^(.*?)\=(.*)$/;
        var v = re_equalsign.exec(s0);
        if (v) {
          var s = ['','','','&#160;'];
          s[0] = this.tokenizer.parse(v[1],true);
          s[1] = this.tokenizer.parse('=',true);
          s[2] = this.tokenizer.parse(v[2],true);
          var align_vals = ['right','center','left'];
          var paddn_vals = ['5pt','5pt','0'];
          s[3] = `${s[3]}${numtext}`;
        } else {
          var s = ['','','','&#160;'];
          s[2] = this.tokenizer.parse(s0,true);
          var align_vals = ['right','center','left'];
          var paddn_vals = ['0','0','0'];
          s[3] = `${s[3]}${numtext}`;
        }
      } else {
        var s = ['','&#160;'];
        s[0] = this.tokenizer.parse(s0,true);
        var align_vals = ['center',''];
        var paddn_vals = ['0','0'];
        s[1] = `${s[1]}${numtext}`;
      }
      s = s.map((x,i)=>`<td style='text-align:${align_vals[i]};padding-right:${paddn_vals[i]}'>${x}</td>`);
      s = s.join('');
      s = `<tr>${s}</tr>`;
      o.push(s);
    }
    o.push(`</table>`);
    o.push('');
  }

  toSubequations(o,id,sig,dept,fname,row1,row2,data,fencecmd,isalignequalsign) {
    o.push(`<table id='${id}' class='P ${sig}' border='0' style='margin-left:auto;margin-right:auto;' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' >`);
    var bls = data;
    var j = 0;
    var idnum = fencecmd.idnum;
    var idnum = idnum || '';
    for (var bl of bls) {
      var s0 = bl.join(' ');
      if( fencecmd.alignequalsign) {
        var re_equalsign = /^(.*?)\=(.*)$/;
        var v = re_equalsign.exec(s0);
        if (v) {
          var s = ['','','','&#160;'];
          s[0] = this.tokenizer.parse(v[1],true);
          s[1] = this.tokenizer.parse('=',true);
          s[2] = this.tokenizer.parse(v[2],true);
          var align_vals = ['right','center','left',''];
          var paddn_vals = ['5pt','5pt','0','0'];
        } else {
          var s = ['','','','&#160;'];
          s[2] = this.tokenizer.parse(s0,true);
          var align_vals = ['right','center','left',''];
          var paddn_vals = ['0','0','0','0'];
        }
      } else {
        var s = ['','','','&#160;'];
        s[0] = this.tokenizer.parse(s0,true);
        var align_vals = ['right','center','left',''];
        var paddn_vals = ['0','0','0','0'];
      }
      if (1){
        var subnum = this.toSubfigNum(j++);
        var numtext = `<span style='position:absolute;right:-20pt;'>(${idnum}${subnum})</span>`;
        s[3] = `${s[3]}${numtext}`;
      }
      var mys = s.map((x,i)=>`<td style='text-align:${align_vals[i]};padding-right:${paddn_vals[i]}'>${x}</td>`);
      var mys = mys.join('');
      var mys = `<tr>${mys}</tr>`;
      o.push(mys);
    }
    o.push(`</table>`);
    o.push('');
  }

  toMultline(o,id,sig,dept,fname,row1,row2,data,fencecmd,isalignequalsign) {
    var bls = data;
    var ss = [];
    for(var bl of bls) {
      var s0 = bl.join(' ');
      ss.push(s0);
    }
    o.push(`<table id='${id}' class='P ${sig}' border='0' style='margin-left:auto;margin-right:auto;' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' >`);
    var bls = data;
    var j = 0;
    var idnum = fencecmd.idnum;
    var idnum = idnum || '';
    var star = fencecmd.star||'';
    for (var s0 of ss)   {
      j++;
      var s = ['','&#160;'];
      s[0] = this.tokenizer.parse(s0,true);
      if(j===1){
        var align_vals = ['left',''];
        var paddn_vals = ['0','0'];
      } else {
        var align_vals = ['right'];
        var paddn_vals = ['0','0'];
      }
      if (!star) {
        ///only getting the first one
        if(j===1){
          var subnum = '';
          var numtext = `<span style='position:absolute;right:-20pt;'>(${idnum}${subnum})</span>`;
          s[1] = `${s[1]}${numtext}`;
        }
      } 
      s = s.map((x,i)=>`<td style='text-align:${align_vals[i]};padding-right:${paddn_vals[i]}'>${x}</td>`);
      s = s.join('');
      s = `<tr>${s}</tr>`;
      o.push(s);
    }
    o.push(`</table>`);
    o.push('');
  }

}

module.exports = { NitrilePreviewHtml };
