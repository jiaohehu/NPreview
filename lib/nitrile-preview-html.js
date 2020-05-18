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
    this.view = null; /// this is a NitrilePreviewView object
    this.imgid = 1;
    this.stylesheet = ``;
    this.stylesheet_html = ``;
    this.stylesheet_epub = ``;
    this.stylesheet_preview = `

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

  do_part(block) {
    var {id,row1,row2,sig,dept,data,para,dept,fencecmd,base,subrow} = block;
    var text = data;
    text = this.escape(`Part ${dept}. ${text}`);
    var o = [];
    o.push(`<h2 id='${id}' class='PART' dept='${dept}' fName='' rows='${row1} ${row2}' >`);
    o.push(`<p class='P'>`);
    o.push(text);
    o.push(`</p>`);
    o.push(`</h2>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_hdgs(block) {
    var {id,row1,row2,sig,level,data,para,dept,fencecmd,base,subrow} = block;
    var text = data;
    text = this.escape(text);
    var o = [];
    var heading;
    if (this.config.haschapter!=1) {
      switch (level) {
        case 0:
          heading = 'TITLE';
          o.push(`<h1 id='${id}' class='${heading}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' >`);
          o.push(`${text} `);
          o.push(`</h1>`);
          break;
        case 1:
          heading = 'SECTION';
          o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' >`);
          o.push(`${dept} &#160; ${text} `);
          o.push(`</h2>`);
          break;
        case 2:
          heading = 'SUBSECTION';
          o.push(`<h3 id='${id}' class='${heading}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' >`);
          o.push(`${dept} &#160; ${text} `);
          o.push(`</h3>`);
          break;
        default:
          heading = 'SUBSUBSECTION';
          o.push(`<h4 id='${id}' class='${heading}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' >`);
          o.push(`${dept} &#160; ${text} `);
          o.push(`</h4>`);
          break;
      }
    } else {
      switch (level) {
        case 0:
          heading = 'TITLE';
          o.push(`<h1 id='${id}' class='${heading}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' >`);
          o.push(`${text} `);
          o.push(`</h1>`);
          break;
        case 1:
          heading = 'CHAPTER';
          o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${this.tofName()}'  rows='${row1} ${row2}' >`);
          o.push(`Chapter ${dept} &#160; ${text} `);
          o.push(`</h2>`);
          break;
        case 2:
          heading = 'SECTION';
          o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' >`);
          o.push(`${dept} &#160; ${text} `);
          o.push(`</h2>`);
          break;
        case 3:
          heading = 'SUBSECTION';
          o.push(`<h3 id='${id}' class='${heading}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' >`);
          o.push(`${dept} &#160; ${text} `);
          o.push(`</h3>`);
          break;
        default:
          heading = 'SUBSUBSECTION';
          o.push(`<h4 id='${id}' class='${heading}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' >`);
          o.push(`${dept} &#160; ${text} `);
          o.push(`</h4>`);
          break;
      }
    }
    o.push('');
    block.html = o.join('\n');
  }
  do_dlst(block) {
    var {id,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
    var o = []; 
    o.push(`<dl id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-top:${this.xtop};margin-bottom:${this.xbot};' >`);
    for (var item of data) {
      var [keys,text] = item;
      keys = keys.map( x => this.escape(x) );
      text = this.unmask(text);
      for (var key of keys) {
        o.push(`<dt class='DT'><b>${key}</b></dt>`);
      }
      o.push(`<dd class='DD' style='margin-left:${fencecmd.left}mm;' >${text}</dd>`);
    }
    o.push('</dl>');
    o.push('');
    block.html = o.join('\n');
  }
  do_plst(block) {
    ///NOTE: cannot place a <p> around the <ul>. 
    var {id,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
    var o = []; 
    var TOPATTRS=`id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2} '`; 
    var TOPSTYLE=`margin-top:${this.xtop};margin-bottom:${this.xbot};`;
    var count=0;
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
        value = this.chomp(bullet);
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
            if(count==0){
              count++;
              o.push(`<ol ${TOPATTRS} style='${TOPSTYLE};padding-left:${fencecmd.left}mm;list-style-position:outside;'><li value='${value}'>${text}`);
            }else{
              o.push(`<ol style='padding-left:${fencecmd.left}mm;list-style-position:outside;'><li value='${value}'>${text}`);
            }
            break;
          }
          case 'UL': {
            if(count==0){
              count++;
              o.push(`<ul ${TOPATTRS} style='${TOPSTYLE};padding-left:${fencecmd.left}mm;list-style-position:outside;'><li value='${value}'>${text}`);
            }else{
              o.push(`<ul style='padding-left:${fencecmd.left}mm;list-style-position:outside;'><li value='${value}'>${text}`);
            }
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
    o.push('');
    block.html = o.join('\n');
  }
  do_verb(block) {
    var {id,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
    var o = []; 
    var s = [];
    var text = data;
    if (this.xnumbers) {
      var linenum = 0;
      for (var k=0; k < text.length; ++k) {
        var line = text[k];
        var lines = [line];
        if (this.xwraplines > 0) {
          lines = this.wrapSample(lines,this.xwraplines);
        }
        var line = lines.shift();
        line = this.escape(line);
        if (fencecmd.monospace) {
          line = `<code>${line}</code>`;
        } else {
          line = line;
        }
        s.push(`<tr><td style='font-size:xx-small;padding-right:${this.xnumbersep};'>${++linenum}</td><td style='white-space:pre;width:100%;font-size:${this.xcssfontsize};'>${line}</td></tr>` );
        while (lines.length > 0) {
          var line = lines.shift();
          line = this.escape(line);
          if (fencecmd.monospace) {
            line = `<code>${line}</code>`;
          } else {
            line = line;
          }
          s.push(`<tr><td></td><td style='white-space:pre;width:100%;font-size:${this.xcssfontsize};'>${line}</td></tr>` );
        }
      }
    } else {
      for (var k=0; k < text.length; ++k) {
        var line = text[k];
        var lines = [line];
        if (this.xwraplines > 0) {
          lines = this.wrapSample(lines,this.xwraplines);
        }
        while (lines.length > 0) {
          var line = lines.shift();
          line = this.escape(line);
          if (fencecmd.monospace) {
            line = `<code>${line}</code>`;
          } else {
            line = line;
          }
          s.push(`<tr><td style='white-space:pre;width:100%;font-size:${this.xcssfontsize};'>${line}</td></tr>` );
        }
      }
    }
    text = s.join('\n');
    text = `<table border='0' style='border-collapse:collapse;width:100%;'>${text}</table>`;
    if (this.xname === 'listing') {
      o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:0;margin-right:0;margin-top:${this.xtop};margin-bottom:${this.xbot};' >`);
      o.push(`<figcaption style='text-align:left;margin-top:${this.xtop};margin-bottom:${this.xbot};' > Listing ${this.xidnum} : ${this.caption_text} </figcaption>`);
      o.push(text);
      o.push('</figure>');
      o.push('');
    } else {
      o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:0;margin-right:0;margin-top:${this.xtop};margin-bottom:${this.xbot};' >`);
      o.push(text);
      o.push(`</figure>`);
      o.push('');
    }
    block.html = o.join('\n');
  } 
  do_samp(block) {
    var {id,rmap,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
    var o = []; 
    var text = data;
    if(fencecmd.style==1){
      text = this.trimSampPara(text);
      text = this.getMode1SampPara(text);
      text = text.map( x => this.escape(x) );
      if (rmap.length>0) { text = text.map( x => this.rubify(x,rmap)); }
      text = text.map( x => x?x:'&#160;' );
      if(fencecmd.ttfamily){
        text = text.map( x => `<tt>${x}</tt>` );
      }
      text = text.map( x => `<dt>${x}</dt>` );
      text = text.join('\n');
      o.push(`<dl id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:${fencecmd.left}mm;margin-top:${this.xtop};margin-bottom:${this.xbot};font-size:${fencecmd.cssfontsize};'>${text}</dl>`);
      o.push('');
    }
    else{
      text = this.trimSampPara(text);
      text = text.map( x => this.escape(x) );
      text = text.map( x => this.solidify(x));
      if (rmap.length>0) { text = text.map( x => this.rubify(x,rmap)); }
      text = text.map( x => x?x:'&#160;' );
      if(fencecmd.ttfamily){
        text = text.map( x => `<tt>${x}</tt>` );
      }
      text = text.map( x => `<dt>${x}</dt>` );
      text = text.join('\n');
      o.push(`<dl id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:${fencecmd.left}mm;margin-top:${this.xtop};margin-bottom:${this.xbot};font-size:${fencecmd.cssfontsize};'>${text}</dl>`);
      o.push('');
    } 
    block.html = o.join('\n');
  }
  do_hrle(block) {
    var {id,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
    var o = []; 
    var text = data;
    o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-top:${this.xtop};margin-bottom:${this.xbot};' >`);
    text = this.unmask(text);
    o.push(`<table border='0' style='margin:0 auto;'><tr><td>${text}</td></tr></table>`);
    o.push('</figure>');
    o.push('');
    block.html = o.join('\n');
  }
  do_text(block) {
    var {id,row1,row2,sig,standalone,lead,leadn,data,para,dept,fencecmd,base,subrow} = block;
    var o = []; 
    var text = data;
    var v;
    if (leadn && leadn>0) {
      lead = this.escape(lead);
      text = this.unmask(text);
      if (leadn === 1) {
        const indent = '';
        text = `${indent}<b>${lead}</b> &#160; ${text}`;
        this.textblockcount = 0;
      }
      else if (leadn === 2) {
        const indent = '';
        text = `${indent}<b><i>${lead}</i></b> &#160; ${text}`;
        this.textblockcount = 0;
      } 
      else {
        const indent = '';
        text = `${indent}<b><i>${lead}</i></b> &#160; ${text}`;
      }
    } else {
      text = this.unmask(text);
    }
    /// watch out for "standalone"
    if (standalone) {
      var left=`${fencecmd.left}mm`;
    } else if (leadn && leadn==1) {
      var left=`0`;
    } else if (leadn && leadn==2) {
      var left=`0`;
    } else if (leadn) {
      var left=`0`;
    }else{
      var left='0';
    }
    ///output to 'o'
    o.push(`<p id='${id}' class='P TEXT' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:${left};margin-top:${this.xtop};margin-bottom:${this.xbot};' >${text}</p>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_sbdc(block){
    var {id,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
    var o = []; 
    var text = para;///must use 'para', as 'data' has been parsed by parseQUOT()
    text = text.map( x => this.escape(x) );
    o.push(`<p id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-top:${this.xtop};margin-bottom:${this.xbot};' >`);
    o.push(text.join('<br/>'));
    o.push(`</p>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_imgs(block) {
    var {id,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
    var s = [];
    var imgsrcs = [];

    for(var blk of data){
      var n = blk.length;
      blk = blk.map( img => {
        var {srcs,opts,sub} = img;
        var src = srcs[0];
        var imgsrc = `./${src}`;///THIS is the URL that is assigned to <img src=...>
        var imgid = ++this.imgid;
        if (this.view) {
          if( this.view.imagemap.has(src)) {
            let [imgbuf,mime] = this.view.imagemap.get(src);
            imgsrc = `data:${mime};base64,${imgbuf.toString('base64')}`;///TODO: harded coded to PNG,
          } else {
            this.view.requestImage(imgid,src);
          }
        }
        img = {srcs,opts,sub,imgsrc,imgid};
        imgsrcs.push(src);
        return img;
      });
      var pp = blk.map( img => {
        const {srcs,opts,sub,imgsrc,imgid} = img;
        var width = this.toHtmlLength(opts.width);
        var height = this.toHtmlLength(opts.height);
        var sub_text = this.unmask(sub);
        if (!width) {
          width = this.toHtmlLength(`${100/n}%`);
        }
        return(`<td style='text-align:center;vertical-align:bottom;width:${width};'> <img id='nitrileimg-${imgid}' style='width:100%;height:${height};' src='${imgsrc}'/> </td>`);
      });
      var qq = blk.map( img => {
        const {srcs,opts,sub} = img;
        var width = this.toHtmlLength(opts.width);
        var height = this.toHtmlLength(opts.height);
        var sub_text = this.unmask(sub);
        if (!width) {
          width = this.toHtmlLength(`${100/n}%`);
        }
        return(`<td style='text-align:center;vertical-align:top;'> ${sub_text} </td>`);
      });
      s.push(`<table>`);
      s.push(`<tr>${pp.join(' ')}</tr>`);
      s.push(`<tr>${qq.join(' ')}</tr>`);
      s.push(`</table>`);
    }

    s.unshift(`<p id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' >`);
    s.push('</p>');

    var o = [];
    if (this.xname === 'figure') {
      o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:0;margin-right:0;margin-top:${this.xtop};margin-bottom:${this.xbot};'>`);
      o.push(`<figcaption style='text-align:left;margin-top:${this.xtop};margin-bottom:${this.xbot};' > Figure ${this.xidnum} : ${this.caption_text} </figcaption>`);
      o.push(s.join('\n'));
      o.push('</figure>');
    } else {
      o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:0;margin-right:0;margin-top:${this.xtop};margin-bottom:${this.xbot};'>`);
      o.push(s.join('\n'));
      o.push('</figure>');
    }
    o.push('');

    ///block.imgsrcs is a list of images that will be read by epub generation
    /// to know the external list of image file to pack them into EPUB archieve
    block.imgsrcs = imgsrcs;
    block.html = o.join('\n');
  }
  do_pict(block) {
    var {id,mode,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
    var s = [];
    var imgsrcs = [];
    for(var blk of data){
      var n = blk.length;
      blk = blk.map( img => {
        const {src,sub} = img;
        var imgsrc = `./${src}`;///THIS is the URL that is assigned to <img src=...>
        var imgid = ++this.imgid;
        if (this.view) {
          if( this.view.imagemap.has(src)) {
            let [imgbuf,mime] = this.view.imagemap.get(src);
            imgsrc = `data:${mime};base64,${imgbuf.toString('base64')}`;///TODO: harded coded to PNG,
          } else {
            this.view.requestImage(imgid,src);
          }
        }
        img = {src,imgsrc,imgid,sub};
        imgsrcs.push(src);
        return img;
      });
      var pp = blk.map( img => {
        const {src,imgsrc,imgid} = img;
        return(`<td style='text-align:center;vertical-align:bottom;width:${100/n}%;'> <img id='nitrileimg-${imgid}' style='width:100%;' src='${imgsrc}' alt='${src}'/> </td>`);
      });
      var qq = blk.map( img => {
        const {sub} = img;
        var sub_text = this.unmask(sub);
        return(`<td style='text-align:center;vertical-align:top;'> ${sub_text} </td>`);
      });
      if(mode && mode.width){
        s.push(`<table border='0' style='width:${100*mode.width}%;'>`);
      }else{
        s.push(`<table border='0' style='width:100%;'>`);
      }
      s.push(`<tr>${pp.join(' ')}</tr>`);
      s.push(`<tr>${qq.join(' ')}</tr>`);
      s.push(`</table>`);
    }

    //s.unshift(`<p id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' >`);
    //s.push('</p>');

    var o = [];
    if (this.xname === 'figure') {
      o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:0;margin-right:0;margin-top:${this.xtop};margin-bottom:${this.xbot};'>`);
      o.push(`<figcaption style='text-align:left;margin-top:${this.xtop};margin-bottom:${this.xbot};' > Figure ${this.xidnum} : ${this.caption_text} </figcaption>`);
      o.push(s.join('\n'));
      o.push('</figure>');
    } else {
      o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:0;margin-right:0;margin-top:${this.xtop};margin-bottom:${this.xbot};'>`);
      o.push(s.join('\n'));
      o.push('</figure>');
    }
    o.push('');

    ///block.imgsrcs is a list of images that will be read by epub generation
    /// to know the external list of image file to pack them into EPUB archieve
    block.imgsrcs = imgsrcs;
    block.html = o.join('\n');
  }
  do_quot(block) {
    var {id,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
    var text = data;
    text = this.unmask(text);
    var lq = String.fromCharCode('0x201C');
    var rq = String.fromCharCode('0x201D');
    text = `${lq}${text}${rq}`;
    text = `<div style='font-size:${this.xcssfontsize};'>${text}</div>`;
    var o = [];
    o.push(`<blockquote id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:${fencecmd.left}mm;margin-right:${fencecmd.right}mm;margin-top:${this.xtop};margin-bottom:${this.xbot};'>`);
    o.push(text);
    o.push(`</blockquote>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_tabb(block){
    var {id,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
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
      var n = pp.length;
      var ww = Array(n);
      ww.fill(1);
      ww = this.wwToHundred(ww);
      pp = pp.map(x => this.unmask(x));
      pp = pp.map((x,i) => `<td>${x}</td>`);
      var p = pp.join('<td>&#160;&#160;&#160;&#160;&#160;&#160;</td>');
      var p = `<tr>${p}</tr>`;
      s.push(p);
    }
    var text = s.join('\n');
    var text = `<table border='0' style='font-size:${this.xcssfontsize};border-collapse:collapse;'>${text}</table>`;
    o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:${fencecmd.left}mm;margin-right:${fencecmd.right}mm;margin-top:${this.xtop};margin-bottom:${this.xbot};'>`);
    o.push(text);
    o.push('</figure>');
    o.push('');
    block.html = o.join('\n');
  }
  do_long(block){
    var {id,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
    var o = []; 
    var [rows,maxj,ww] = data;
    if (fencecmd.adjust) {
      ww = this.toAdjustedColumns(maxj,fencecmd.adjust);
    }
    var vlines = fencecmd.cssvlines;
    var hlines = fencecmd.csshlines;
    var vpadding = fencecmd.cssvpadding;
    var hpadding = fencecmd.csshpadding;
    var vlines = this.toArray(vlines);
    var hlines = this.toArray(hlines);
    var vpadding = parseInt(vpadding);
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
    var header = rows.shift();
    var header = header.map((x,i) => `<th style='text-align:left;vertical-align:top;\
padding:${t}pt ${h}pt;\
${'width:'+ww[i]+'%;'}\
${(vlines.indexOf(`${i}`)>=0||vlines.indexOf('*')>=0)?'border-left:1px solid;':''}\
${(vlines.indexOf(`${i+1}`)>=0||vlines.indexOf('*')>=0)?'border-right:1px solid;':''}\
${hlines.indexOf('t')>=0?'border-top:1px solid;':''}\
${hlines.indexOf('m')>=0?'border-bottom:1px solid;':''} '>${x}</th>`);
    s.push(`<thead>`);
    s.push(`<tr>${header.join('')}</tr>`);
    s.push(`</thead>`);
    s.push(`<tbody>`);
    var n = rows.length;
    for (var j=0; j < rows.length; ++j) {
      var row = rows[j];
      var row = row.map((x,i) => `<td style='text-align:left;vertical-align:top;\
padding:${t}pt ${h}pt;\
${'width:'+ww[i]+'%;'}\
${(vlines.indexOf(`${i}`)>=0||vlines.indexOf('*')>=0)?'border-left:1px solid;':''}\
${(vlines.indexOf(`${i+1}`)>=0||vlines.indexOf('*')>=0)?'border-right:1px solid;':''}\
${j==0&&hlines.indexOf('m')>=0?'border-top:1px solid;':''}\
${j>0&&hlines.indexOf('r')>=0?'border-top:1px solid;':''}\
${j==n-1&&hlines.indexOf('b')>=0?'border-bottom:1px solid;':''} '>${x}</td>`);
      s.push(`<tr>${row.join('')}</tr>`);
    }
    s.push(`</tbody>`);
    var text = s.join('\n');
    text = `<table border='0' style='font-size:${this.xcssfontsize};width:100%;border-collapse:collapse;'>${text}</table>`;
    if (this.xname === 'table') {
      o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:0;margin-right:0;margin-top:${this.xtop};margin-bottom:${this.xbot};' >`);
      o.push(`<figcaption style='text-align:left;margin-top:${this.xtop};margin-bottom:${this.xbot};' > Table ${this.xidnum} : ${this.caption_text} </figcaption>`);
      o.push(text);
      o.push(`</figure>`);
    } else {
      o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:0;margin-right:0;margin-top:${this.xtop};margin-bottom:${this.xbot};' >`);
      o.push(text);
      o.push(`</figure>`);
    } 
    o.push('');
    block.html = o.join('\n');
  } 
  do_tabr(block){
    /// extrac data and place them into s
    var {id,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
    var o = []; 
    var vlines = fencecmd.cssvlines;
    var hlines = fencecmd.csshlines;
    var vpadding = fencecmd.cssvpadding;
    var hpadding = fencecmd.csshpadding;
    var vlines = this.toArray(vlines);
    var hlines = this.toArray(hlines);
    var vpadding = parseInt(vpadding);
    var hpadding = parseInt(hpadding);
    var t = (vpadding>0)?vpadding:0;
    var h = (hpadding>0)?hpadding:0;
    var ncols = data.length;
    var nrows = 0;
    var s = [];
    /// find out the longest rows
    data.forEach(x => {
      var n = x.length;
      nrows = Math.max(n,nrows);
    });
    /// pp is a list columns of row j
    for(var j=0; j<nrows; ++j){
      var pp = data.map(x => x[j]||'');
      var n = pp.length;
      var ww = Array(n);
      ww.fill(1);
      ww = this.wwToHundred(ww);
      pp = pp.map(x => this.unmask(x));
      pp = pp.map((x,i) => `<${j==0?'th':'td'} style='text-align:left;vertical-align:top;\
font-size:${this.xcssfontsize};\
padding:${t}pt ${h}pt;\
${(vlines.indexOf(`${i}`)>=0||vlines.indexOf('*')>=0)?'border-left:1px solid;':''}\
${(vlines.indexOf(`${i+1}`)>=0||vlines.indexOf('*')>=0)?'border-right:1px solid;':''}\
${j==0&&hlines.indexOf('t')>=0?'border-top:1px solid;':''}\
${j==0&&hlines.indexOf('m')>=0?'border-bottom:1px solid;':''}\
${j>1&&hlines.indexOf('r')>=0?'border-top:1px solid;':''}\
${j==nrows-1&&hlines.indexOf('b')>=0?'border-bottom:1px solid;':''} '>${x}</${j==0?'th':'td'}>`);
      var p = pp.join('');
      var p = `<tr>${p}</tr>`;
      if(j==0){
        s.push(`<thead>`);
        s.push(p);
        s.push(`</thead>`);
      }else{
        s.push(`<tbody>`);
        s.push(p);
        s.push(`</tbody>`);
      }
    }
    var text = s.join('\n');
    text = `<table border='0' style='margin-left:0;margin-right:auto;border-collapse:collapse;'>${text}</table>`;
    if (this.xname === 'table') {
      o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:${fencecmd.left}mm;margin-right:0;margin-top:${this.xtop};margin-bottom:${this.xbot};' >`);
      o.push(`<figcaption style='text-align:left;margin-top:${this.xtop};margin-bottom:${this.xbot};' > Table ${this.xidnum} : ${this.caption_text} </figcaption>`);
      o.push(text);
      o.push(`</figure>`);
    } else {
      o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:${fencecmd.left}mm;margin-right:0;margin-top:${this.xtop};margin-bottom:${this.xbot};' >`);
      o.push(text);
      o.push(`</figure>`);
    } 
    o.push('');
    block.html = o.join('\n');
  } 
  do_diag(block){
    var {id,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
    var o = []; 
    if (fencecmd.star) {
      (new NitrilePreviewDiagramSVG(this,this.tokenizer)).def_pic(data);
    } else {
      var [text,vw,vh] = new NitrilePreviewDiagramSVG(this,this.tokenizer).parse(data);
      var s = [];
      s.push(`<svg xmlns:xlink='http://www.w3.org/1999/xlink' fill='currentColor' stroke='currentColor' viewBox='-1 -1 ${vw+2} ${vh+2}'\
              role='img' focusable='false' xmlns='http://www.w3.org/2000/svg' >`);
      s.push(text);
      s.push(`</svg>`);
      var text = s.join('\n');
      if (this.xname === 'figure') {
        o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:0;margin-right:0;margin-top:${this.xtop};margin-bottom:${this.xbot};'>`);
        o.push(`<figcaption style='text-align:left;margin-top:${this.xtop};margin-bottom:${this.xbot};' > Figure ${this.xidnum} : ${this.caption_text} </figcaption>`);
        o.push(text);
        o.push('</figure>');
        o.push('');
      } else {
        o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:0;margin-right:0;margin-top:${this.xtop};margin-bottom:${this.xbot};'>`);
        o.push(text);
        o.push('</figure>');
        o.push('');
      }
    }
    block.html = o.join('\n');
  }
  do_math(block) {
    var {id,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
    var o = []; 
    var name = fencecmd.name;
    name = name||'';
    name = name.toLowerCase();
    if (fencecmd.name=='equation') {
      var mydata = this.toMathTabularAligned(data);
      var rowspan = mydata.length;
      mydata = mydata.map((x,i) => {
          if(i==0) {
            var numtext = `<nobr>(${this.xidnum})</nobr>`;
            //return `<td rowspan='${rowspan}' style='width:${this.config.HTML.eqnumwidth}mm;text-align:left;' >${numtext}</td>${x}`;
            return `${x}<td rowspan='${rowspan}' style='width:100%;text-align:right;' >${numtext}</td>`;
          } else {
            return x;
          }
      });
      var mydata = mydata.map(x => `<tr>${x}</tr>`);
    } else {
      var mydata = this.toMathTabularAligned(data);
      var rowspan = mydata.length;
      mydata = mydata.map((x,i) => {
          if(i==0) {
            var numtext = `<nobr></nobr>`;
            return `${x}<td rowspan='${rowspan}' style='width:100%;text-align:right;' >${numtext}</td>`;
          } else {
            return x;
          }
      });
      var mydata = mydata.map(x => `<tr>${x}</tr>`);
    }
    var text = mydata.join('\n');
    text = `<table border='0' style='border-collapse:collapse;width:100%;'>${text}</table>`;
    o.push(`<figure id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-left:${fencecmd.left}mm;margin-right:0;margin-top:${this.xtop};margin-bottom:${this.xbot};'>`);
    o.push(text);
    o.push('</figure>');
    o.push('');
    block.html = o.join('\n');
  }
  do_frmd(block) {
    var {id,row1,row2,sig,data,para,dept,fencecmd,base,subrow} = block;
    var o = []; 
    var text = data;
    var [out, vw, vh] = this.toFramedSvg(text);
    if (fencecmd.frameborder==1) {
      var text = `<img style='width:100%;max-width:${vw}px;border:1px solid;padding:6px;box-sizing:border-box;' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(out)}" />`;
    } else {
      var text = `<img style='width:100%;max-width:${vw}px;' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(out)}" />`;
    }
    o.push(`<p id='${id}' class='P ${sig}' dept='${dept}' fName='${this.tofName()}' rows='${row1} ${row2}' style='margin-top:${this.xtop};margin-bottom:${this.xbot};'>`);
    o.push(text);
    o.push('</p>');
    o.push('');
    block.html = o.join('\n');
  }

  solidify (s) {
    var ns = '';
    for( var c of s ) {
      if(c === ' '){
        ns += '&#160;';
      }else{
        ns += c;
      }
    }
    return ns;
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

  ruby (rb,rt) {
    return `<ruby><rb>${this.escape(rb)}</rb><rt>${this.escape(rt)}</rt></ruby>`;
  }

  ref (str) {
    for (var j=0; j < this.blocks.length; ++j) {
      var block = this.blocks[j];
      var {id,fencecmd,saveas,idnum} = block;
      var baselabel = fencecmd.baselabel;
      if( str.localeCompare(baselabel)===0) {
        return `<a class='REF' href='${saveas}#${id}'>${idnum}</a>`;
        break;
      }
    }
    return `<tt>${this.escape(str)}</tt>`;
  }

  inlinemath (str) {
    var s = this.tokenizer.parse(str);
    return s;
  }

  displaymath (str) {
    var s = this.tokenizer.parse(str,true);
    return s;
  }

  uri(v) {
    const [cnt,uri] = v;
    if (cnt) {
      return `<span>${this.escape(cnt)}</span> (<span class='URL' >${this.escape(uri)}</span>)`;
    } else {
      return `<span class='URL' >${this.escape(uri)}</span>`
    }
  }

  style (type, text) {

    type = type || '';
    switch (type) {
      case 'code': {
        text = text.trim();
        return `<code class='CODE'>${this.escape(text)}</code>`
        break;
      }
      case 'em': {
        text = text.trim();
        return `<i>${this.escape(text)}</i>`
        break;
      }
      case 'strong': {
        text = text.trim();
        return `<b>${this.escape(text)}</b>`
        break;
      }
      case 'overstrike': {
        text = text.trim();
        return `<s>${this.escape(text)}</s>`
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

  extractRubyItems (base, top, desc) {
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
    if(desc){
      desc = this.escape(desc);
      o = `<abbr title='${desc}'>${o}</abbr>`;
    }
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

  toMathTabularLeft(data) {
    var data = data.map( x => this.joinPara(x) );
    var data = data.map( x => this.tokenizer.parse(x,true) )
    var data = data.map( x => `<td style='text-align:left;'>${x}</td>` )
    var data = data.map( x => [x] )
    return data;
  }

  toMathTabularCenter(data) {
    var data = data.map( x => this.joinPara(x) );
    var data = data.map( x => this.tokenizer.parse(x,true) )
    var data = data.map( x => `<td style='text-align:center;'>${x}</td>` )
    var data = data.map( x => [x] )
    return data;
  }

  toMathTabularRight(data) {
    var data = data.map( x => this.joinPara(x) );
    var data = data.map( x => this.tokenizer.parse(x,true) )
    var data = data.map( x => `<td style='text-align:right;'>${x}</td>` )
    var data = data.map( x => [x] )
    return data;
  }

  toMathTabularAligned(data) {
    var data = data.map( row => row[0] );
    var data = data.map( x => this.tokenizer.toMathSvg(x,true) );
    var maxshiftdist = 0;
    var data = data.map( x => {
        var {s,nw,nh,shiftdist} = x;
        maxshiftdist = Math.max(maxshiftdist,shiftdist);
        return x;
    });
    var data = data.map( x => {
        var {s,nw,nh,shiftdist} = x;
        //console.log('shiftdist=',shiftdist);
        var dist = maxshiftdist - shiftdist;
        return (`<td style='left:${dist}px;position:relative;text-align:left;'>${s}</td>`);
    });
    return data;
  }

  toHtmlLength(str) {
    return str||'';
  }

  toHtmlDocument() {
    var config = this.config;
    var htmlines = this.blocks.map(x => x.html);
    var stylesheet_html = this.stylesheet_html;
    var mylines = this.toConfigLines();
    var mylines = mylines.map(x => `<!-- ${x} -->`);
    var geometry_opts = [];
    geometry_opts.push(`padding-left:${config.HTML.leftmargin}mm`);
    geometry_opts.push(`padding-right:${config.HTML.rightmargin}mm`);
    geometry_opts.push(`padding-top:${config.HTML.topmargin}mm`);
    geometry_opts.push(`background-color:white`);
    geometry_opts.push(`color:#333`);
    geometry_opts.push(`margin:0`);
    geometry_opts.push(`box-sizing:border-box`);
    geometry_opts.push(`width:8.5in`);///should be changed to reflect papersize such as letter or A4
    geometry_opts.push(`font-family:roman`);
    geometry_opts.push(`font-size:${config.HTML.bodyfontsizept}pt`);
    var title = config.title?config.title:'Untitle';
    var author = config.author?config.author:'';
    title = this.escape(title);
    author = this.escape(author);
    var data = `\
<!DOCTYPE html>
<html>
${mylines.join('\n')}
<head>
<meta charset="utf-8" />
<style>
${stylesheet_html}
</style>
</head>
<body>
<main class='PAGE' style='${geometry_opts.join(';')}' >
${htmlines.join('\n')}
</main>
</body>
</html>
`;
    return data;
  }

  toXhtmlDocument() {
    var config = this.config;
    var htmlines = this.blocks.map(x => x.html);
    var stylesheet_html = this.stylesheet_html;
    var mylines = this.toConfigLines();
    var mylines = mylines.map(x => `<!-- ${x} -->`);
    var geometry_opts = [];
    geometry_opts.push(`padding-left:${config.HTML.leftmargin}mm`);
    geometry_opts.push(`padding-right:${config.HTML.rightmargin}mm`);
    geometry_opts.push(`padding-top:${config.HTML.topmargin}mm`);
    geometry_opts.push(`background-color:white`);
    geometry_opts.push(`color:#333`);
    geometry_opts.push(`margin:0`);
    geometry_opts.push(`box-sizing:border-box`);
    geometry_opts.push(`width:8.5in`);///should be changed to reflect papersize such as letter or A4
    geometry_opts.push(`font-family:roman`);
    geometry_opts.push(`font-size:${config.HTML.bodyfontsizept}pt`);
    var title = config.title?config.title:'Untitle';
    var author = config.author?config.author:'';
    title = this.escape(title);
    author = this.escape(author);
    var data = `\
<?xml version='1.0' encoding='UTF-8'?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>
<head>
<meta http-equiv='default-style' content='text/html' charset='utf-8'/>
<meta name='viewport' content='width=device-width, initial-scale=1.0'/>
<style>
${stylesheet_html}
</style>
</head>
<body class='nitrile-preview'>
<main class='PAGE' style='${geometry_opts.join(';')}' >
${htmlines.join('\n')}
</main>
</body>
</html>
`;
    return data;
  }

}

module.exports = { NitrilePreviewHtml };
