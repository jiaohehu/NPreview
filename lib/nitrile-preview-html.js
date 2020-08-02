'use babel';

const { NitrilePreviewTranslator } = require('./nitrile-preview-translator');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');
const { NitrilePreviewDiagramSVG } = require('./nitrile-preview-diagramsvg');
const const_partnums = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'IIX', 'IX', 'X'];
const const_subfignums = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

class NitrilePreviewHtml extends NitrilePreviewTranslator {

  constructor(parser) {
    super(parser);
    this.name='HTML';
    this.tokenizer = new NitrilePreviewTokenizer(this);
    this.diagram = new NitrilePreviewDiagramSVG(this);
    this.mathmargin = 3;
    this.mathpadding = 2;
    this.imgid = 1;
    this.imgs = [];
    /// All the layout dimensins are in 'mm'
    this.config = {};
    this.config.title = '';
    this.config.author = '';
    this.config.step = 2;//similar to CONTEX.step but specifing in 'em'
    this.config.mathfontsizept = 12;
    this.config.diagfontsizept = 12;
    this.config.css = '';//to be added using +=
    this.config.width = 130;///130mm textwidth in MAIN element
    this.config.margin = 4;///4mm margins left/right/top/bottom for MAIN element
    this.config.leftmargin = 44;
    this.config.rightmargin = 44;
    this.config.topmargin = 30;
    this.config.toc = 0;///when set to 1 a customized TOC will be inserted
  }
  do_identify(block, A) {
    if (!A.count) {
      A.count = 1;
      A.chapters = 0;
      A.sections = 0;
      A.subsections = 0;
      A.subsubsections = 0;
      A.figures = 0;
      A.tables = 0;
      A.listings = 0;
      A.equations = 0;
      A.parts = 0;
      A.id = 0;///ID for CSS
    }
    var { sig, name, subn, partnum, hdgn, islabeled, floatname } = block;
    /// generate css ID
    A.id++;
    block.id = A.id;
    /// generate 'idnum'
    if (sig == 'PART') {
      A.parts++;
      idnum = A.parts;
      block.idnum = idnum;
    }else if (sig == 'HDGS') {
      subn = subn || 0;
      hdgn += subn;
      var idnum;
      if (hdgn == 0) {
        if(name=='h'){
          A.chapters++;
          A.sections = 0;
          A.subsections = 0;
          A.subsubsections = 0;
          A.figures = 0;
          A.tables = 0;
          A.listings = 0;
          A.equations = 0;
          idnum = `${A.chapters}`;
        }
      } else if (hdgn == 1) {
        A.sections++;
        A.subsections = 0;
        A.subsubsections = 0;
        if(name=='h'){
          idnum = `${A.chapters}.${A.sections}`;
        }else{
          idnum = `${A.sections}`;
        }
      } else if (hdgn == 2) {
        A.subsections++;
        A.subsubsections = 0;
        if(name=='h'){
          idnum = `${A.chapters}.${A.sections}.${A.subsections}`;
        }else{
          idnum = `${A.sections}.${A.subsections}`;
        }
      } else {
        A.subsubsections++;
        if(name=='h'){
          idnum = `${A.chapters}.${A.sections}.${A.subsections}.${A.subsubsections}`;
        }else{
          idnum = `${A.sections}.${A.subsections}.${A.subsubsections}`;
        }
      }
      block.idnum = idnum;
    } else if (sig == 'MATH' && islabeled) {
      A.equations++;
      if(name=='h'){
        idnum = `${A.chapters}-${A.equations}`;
      }else{
        idnum = `${A.equations}`;
      }
      if (block.more && block.more.length) {
        block.more.forEach(x => {
          A.equations++;
          if(name=='h'){
            idnum = `${A.chapters}-${A.equations}`;
          }else{
            idnum = `${A.equations}`;
          }
          x.idnum = idnum;
        })
      }
      block.idnum = idnum;
    } else if (floatname && floatname.toLowerCase() == 'figure' && islabeled) {
      A.figures++;
      if(name=='h'){
        idnum = `${A.chapters}-${A.figures}`;
      }else{
        idnum = `${A.figures}`;
      }
      block.idnum = idnum;
    } else if (floatname && floatname.toLowerCase() == 'table' && islabeled) {
      A.tables++;
      if(name=='h'){
        idnum = `${A.chapters}-${A.tables}`;
      }else{
        idnum = `${A.tables}`;
      }
      block.idnum = idnum;
    } else if (floatname && floatname.toLowerCase() == 'listing' && islabeled){
      A.listings++;
      if(name=='h'){
        idnum = `${A.chapters}-${A.listings}`;
      }else{
        idnum = `${A.listings}`;
      }
      block.idnum = idnum;
    }
  }
  do_part(block) {
    var { text, idnum } = block;
    idnum=idnum||'';
    var o = [];
    var text = this.escape(text);
    if(this.conf('partpage')){
      var s=this.conf('part').split('\t');
      var s=s.map(x => x.replace(/\$\{text\}/g,text));
      var s=s.map(x => x.replace(/\$\{i\}/g,x=>this.to_i_letter(idnum)));
      var s=s.map(x => x.replace(/\$\{I\}/g,x=>this.to_I_letter(idnum)));
      var s=s.map(x => x.replace(/\$\{a\}/g,x=>this.to_a_letter(idnum)));
      var s=s.map(x => x.replace(/\$\{A\}/g,x=>this.to_A_letter(idnum)));
      var s=s.map(x => x.replace(/\$\{1\}/g,x=>this.to_1_letter(idnum)));
      var s=s.join('\n');
      o.push(s);
    }else{
      idnum = this.to_I_letter(idnum);
      o.push(`<h1 ${this.to_attr(block)} > <small> Part ${idnum} </small> <br/> ${text} </h1>`);
    }
    o.push('');
    block.html = o.join('\n');
  }

  do_hdgs(block) {
    var {id,row1,row2,sig,name,subn,hdgn,text,idnum} = block;
    var o = [];
    var text = this.escape(text);
    ///note that subn and hdgn guarenteed to be integers
    if(subn === undefined){
      var level = hdgn;
    }else{
      var level = subn + hdgn;
    }
    idnum = idnum||'';
    if(name=='part'){
      o.push(`<h2 ${this.to_attr(block)} >Part ${idnum}</h2>`);
      o.push(`<h1>${text}</h1>`);
    } 
    else if(level==0) {
      o.push(`<h1 ${this.to_attr(block)} >${idnum} ${text}</h1>`);
    } 
    else if(level==1) {
      o.push(`<h2 ${this.to_attr(block)} >${idnum} ${text}</h2>`);
    } 
    else if(level==2) {
      o.push(`<h3 ${this.to_attr(block)} >${idnum} ${text}</h3>`);
    } 
    else {
      o.push(`<h4 ${this.to_attr(block)} >${idnum} ${text}</h4>`);
    }
    o.push('');
    block.html = o.join('\n');
  }
  do_dlst(block) {
    var {id,row1,row2,sig,items,para} = block;
    var o = []; 
    const dtstyle=`text-indent:-${this.conf('step')}em;margin-left:${this.conf('step')}em;`;
    o.push(`<dl ${this.to_attr(block)} >`);
    var bull = '&#x2022;';
    for (var item of items) {
      var {key,text,type,rb,rt} = item;
      if(type=='text'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`<div style='${dtstyle}'>${bull} <strong>${key}</strong>  ${text}</div>`);
      }else if(type=='rmap'){
        key = `${rb}${String.fromCharCode('0xb7')}${rt}`;
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`<div style='${dtstyle}'>${bull} <strong>${key}</strong>  ${text}</div>`);
      }else if(type=='math'){
        key = this.to_inlinemath(key);
        text = this.unmask(text);
        o.push(`<div style='${dtstyle}'>${bull} ${key}  ${text}</div>`);
      }else if(type=='ruby'){
        text = this.unmask(text);
        if(rb&&rt){
          o.push(`<div style='${dtstyle}'>${bull} <ruby><rb>${rb}</rb><rt>${rt}</rt></ruby>  ${text}</div>`);
        } else {
          o.push(`<div style='${dtstyle}'>${bull} ${key}  ${text}</div>`);
        }
      }else if(type=='quot'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`<div style='${dtstyle}'>${bull} <q>${key}</q>  ${text}</div>`);
      }else if(type=='var'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`<div style='${dtstyle}'>${bull} <var>${key}</var>  ${text}</div>`);
      }else if(type=='code'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`<div style='${dtstyle}'>${bull} <code>${key}</code>  ${text}</div>`);
      }
    }
    o.push('</dl>');
    o.push('');
    block.html = o.join('\n');
  }
  do_hlst(block) {
    var {id,row1,row2,sig,items} = block;
    var o = []; 
    o.push(`<dl ${this.to_attr(block)} >`);
    for (var item of items) {
      var {key,text} = item;
      key = this.unmask(key);
      text = this.unmask(text);
      o.push(`<dt><strong>${key}</strong></dt>`);
      if(text){
        o.push(`<dd>${text}</dd>`);
      }
    }
    o.push('</dl>');
    o.push('');
    block.html = o.join('\n');
  }
  do_plst(block) {
    ///NOTE: cannot place a <p> around the <ul>. 
    var {items,isbroad} = block;
    var o = []; 
    var count=0;
    for (var item of items) {
      var {bull,bullet,value,text} = item;
      text = text || '';
      text = this.unmask(text);
      if(isbroad){
        text=`<p>${text}</p>`;
      }
      switch (bull) {
        case 'OL': {
          if(count==0){
            count++;
            o.push(`<ol ${this.to_attr(block)} style='${this.to_lstyle(block)}'><li value='${value}'>${text}`);
          }else{
            o.push(`<ol style='${this.to_lstyle(block)}'><li value='${value}'>${text}`);
          }
          break;
        }
        case 'UL': {
          if(count==0){
            count++;
            o.push(`<ul ${this.to_attr(block)} style='${this.to_lstyle(block)}'><li value='${value}'>${text}`);
          }else{
            o.push(`<ul style='${this.to_lstyle(block)}'><li value='${value}'>${text}`);
          }
          break;
        }
        case 'LI': {
          o.push(`</li><li value='${value}'>${text}`);
          break;
        }
        case '/OL': {
          if(bullet){
            o.push(`</li></ol></li><li value='${value}'>${text}`);
          }else{
            o.push('</li></ol>');
          }
          break;
        }
        case '/UL': {
          if(bullet){
            o.push(`</li></ul></li><li value='${value}'>${text}`);
          }else{
            o.push('</li></ul>');
          }
          break;
        }
      }
    }
    o.push('');
    block.html = o.join('\n');
  }
  do_prog(block) {
    var {id,row1,row2,sig,lines,caption,label} = block;
    var o = []; 
    var s = [];
    var linenum = 0;
    var lines = lines.map( x => this.escape_with_nbsp(x) );
    var lines = lines.map( x => `<tr><td>${++linenum}</td><td>&#160;</td><td style='white-space:pre'>${x}</td></tr>`);
    var text = lines.join('\n');
    var text = `<table border='0' style='border-collapse:collapse;'>${text}</table>`;
    o.push(`<figure ${this.to_attr(block)} >`);
    if(this.caption_text){
      o.push(`<figcaption ${this.caption_text} </figcaption>`);
    }
    o.push(text);
    o.push('</figure>');
    o.push('');
    block.html = o.join('\n');
  } 
  do_llst(block) {
    var { lines, floatname, caption, idnum, islabeled } = block;
    var o = [];
    var s = [];
    lines=lines||[];
    var text = lines;
    var linenum = 0;
    var d = lines.map((x, i) => {
      var line = x;
      var lineno = `${i + 1}`;
      var lineno = `<small style='position:absolute;right:100%;text-align:right;display:inline-block;padding-right:1em;'> ${lineno}</small>`;
      var line = this.escape(line);
      var wholeline = `${lineno}${line}`;
      wholeline = `<code style='white-space:pre;position:relative;'>${wholeline}</code>`;
      return (`${wholeline}`);
    });
    var text = d.join('<br/>');
    text = `<div>${text}</div>`;
    o.push(`<figure ${this.to_attr(block)} >`);
    if (islabeled) {
      o.push(this.to_caption_text(floatname, idnum, caption));
    }
    o.push(text);
    o.push('</figure>');
    o.push('');
    block.html = o.join('\n');
  } 
  do_vbtm(block){
    var { lines } = block;
    var o = [];
    lines=lines||[];
    var lines = lines.map((x) => {
      var line = this.escape_with_nbsp(line);
      return (`${line}`);
    });
    var text = lines.join('\n');
    o.push(`<pre ${this.to_attr(block)} >${text}</pre>`);
  }
  do_samp(block) {
    var {id,row1,row2,sig,lines,parser} = block;
    lines=lines||[];
    var o = []; 
    var lines = lines.map( x => this.escape_with_nbsp(x) );
    var text = lines.join('\n');
    o.push(`<pre ${this.to_attr(block)} style='margin-left:${this.conf('step')}em;'>${text}</pre>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_pass(block) {
    var {id,row1,row2,sig,lines,parser} = block;
    lines=lines||[];
    var o = []; 
    var lines = lines.map( x => this.escape(x) );
    var lines = lines.map( x => this.rubify(x) ); 
    var text = lines.join('<br/>\n');
    o.push(`<p ${this.to_attr(block)} style='margin-left:${this.conf('step')}em;'>${text}</p>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_hrle(block) {
    var {id,row1,row2,sig,text} = block;
    var o = []; 
    text = this.unmask(text);
    o.push(`<hr ${this.to_attr(block)} style='text-align:center' />`);
    o.push('');
    block.html = o.join('\n');
  }
  do_text(block) {
    var {id,row1,row2,sig,leadn,lead,text} = block;
    var o = []; 
    const indent = '&#160;'.repeat(5);
    if (leadn && leadn>0) {
      lead = this.escape(lead);
      text = this.unmask(text);
      if (leadn === 1) {
        text = `<strong>${lead}</strong> &#160; ${text}`;
        this.textblockcount = 0;
      }
      else if (leadn === 2) {
        text = `<strong><i>${lead}</i></strong> &#160; ${text}`;
        this.textblockcount = 0;
      } 
      else {
        text = `${indent}<strong><i>${lead}</i></strong> &#160; ${text}`;
      }
    } else {
      text = this.unmask(text);
    }
    /// watch out for "standalone"
    if (leadn && leadn==1) {
      var left=`0`;
    } else if (leadn && leadn==2) {
      var left=`0`;
    } else if (leadn) {
      var left=`0`;
    }else{
      var left='0';
    }
    ///output to 'o'
    o.push(`<p ${this.to_attr(block)} >${text}</p>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_pict(block) {
    var {id,row1,row2,sig,opts,images,floatname,caption,idnum,islabeled} = block;
    opts=opts||{};
    images=images||[];
    var d = [];
    var imgsrcs = [];
    var n = this.assert_int(opts.grid,1,1);
    var m = Math.ceil(images.length/n);
    var imgs = images.map( img => {
      const {src,sub} = img;
      var imgsrc = `./${src}`;///THIS is the URL that is assigned to <img src=...>
      var imgid='';
      if (1){          
        var {imgsrc} = this.to_request_image(imgsrc);
        console.log('imgsrc=',imgsrc.slice(0,40),'imgid=',imgid);
      }
      img = {src,imgsrc,imgid,sub};
      imgsrcs.push(src);
      this.imgs.push(src);
      return img;
    });
    var mypp = imgs.map( img => {
      var {src,imgsrc,imgid,sub} = img;
      var img_style = 'width:100%;';
      if(opts && opts.frame){
        img_style += 'border:1px solid;';
      }
      var td_style = `text-align:center;vertical-align:bottom;width:${100/n}%;`;
      var img = `<td style='${td_style}'> <img id='imgid${imgid}' style='${img_style}' src='${imgsrc}' alt='${src}'/> </td>`;
      var sub_text = this.unmask(sub);
      var tdstyle = 'text-align:center;vertical-align:top;';
      var sub = `<td style='${tdstyle}'> ${sub_text} </td>`;
      return {img,sub};
    });
    d.push(`<table border='0' style='width:100%;'>`);
    while(mypp.length){
      var pp = mypp.slice(0,n);
      mypp = mypp.slice(n);
      var imgs = pp.map(x => x.img);
      var subs = pp.map(x => x.sub);
      while(imgs.length < n) { imgs.push(''); }
      while(subs.length < n) { subs.push(''); }
      d.push(`<tr>${imgs.join(' ')}</tr>`);
      d.push(`<tr>${subs.join(' ')}</tr>`);
    }
    d.push(`</table>`);
    var text = d.join('\n'); 
    var o = [];
    o.push(`<figure ${this.to_attr(block)} >`);
    if(islabeled){
      o.push(this.to_caption_text(floatname,idnum,caption));
    }
    o.push(text);
    o.push('</figure>');
    o.push('');

    ///block.imgsrcs is a list of images that will be read by epub generation
    /// to know the external list of image file to pack them into EPUB archieve
    block.imgsrcs = imgsrcs;
    block.html = o.join('\n');
  }
  do_quot(block) {
    var {id,row1,row2,sig,text} = block;
    text = this.unmask(text);
    var lq = String.fromCharCode('0x201C');
    var rq = String.fromCharCode('0x201D');
    text = `${lq}${text}${rq}`;
    var o = [];
    o.push(`<blockquote ${this.to_attr(block)} style='margin-left:${this.conf('step')}em;right-margin:0;${this.xstyle}'>`);
    o.push(text);
    o.push(`</blockquote>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_tabu(block){
    var {id,row1,row2,sig,cols} = block;
    var o = []; 
    var ncols = cols.length;
    var nrows = 0;
    var s = [];
    cols.forEach(x => {
      var n = x.length;
      nrows = Math.max(n,nrows);
    });
    for(var j=0; j<nrows; ++j){
      var pp = cols.map(x => x[j]||'');
      var n = pp.length;
      var ww = Array(n);
      ww.fill(1);
      ww = this.ww_to_hundred(ww);
      pp = pp.map((x,i) => `<td style='padding:0 8pt 0 0'>${x}</td>`);
      var p = pp.join('');
      var p = `<tr>${p}</tr>`;
      s.push(p);
    }
    var text = s.join('\n');
    var text = `<table border='0' style='${this.to_mstyle(block)};border-collapse:collapse;'>${text}</table>`;
    o.push(`<dl ${this.to_attr(block)}>`);
    o.push(text);
    o.push(`</dl>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_tabr(block){
    var {id,row1,row2,sig,cols,caption,label} = block;
    cols=cols||[];
    var o = []; 
    var hlines = this.string_to_array('t m b');
    var vlines = this.string_to_array('');
    var t = 1;
    var h = 6;
    var ncols = cols.length;
    var nrows = 0;
    var s = [];
    /// find out the longest rows
    cols.forEach(x => {
      var n = x ? x.length : 0;
      nrows = Math.max(n,nrows);
    });
    /// pp is a list columns of row j
    for(var j=0; j<nrows; ++j){
      var pp = cols.map(x => x[j]||'');
      var n = pp.length;
      var ww = Array(n);
      ww.fill(1);
      ww = this.ww_to_hundred(ww);
      if(j==0){
        /// it is possible to be multiple lines
        pp = pp.map(x => x.split('\\\\'));
        pp = pp.map(row => row.map(x => this.unmask(x)));
        pp = pp.map(row => row.join('<br/>'));
      }else{
        pp = pp.map(x => this.unmask(x));
      }
      pp = pp.map((x,i) => `<${j==0?'th':'td'} style='text-align:left;vertical-align:top;\
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
    text = `<table border='0' style='border-collapse:collapse;'>${text}</table>`;
    o.push(`<figure ${this.to_attr(block)} >`);
    if(this.caption_text){
      o.push(`<figcaption ${this.caption_text} </figcaption>`);
    }
    o.push(text);
    o.push(`</figure>`);
    o.push('');
    block.html = o.join('\n');
  } 
  do_long(block){
    var {id,row1,row2,sig,rows,ww} = block;
    var o = []; 
    var maxj = ww.length;
    var hlines = this.string_to_array('t m b r');
    var vlines = this.string_to_array('*');
    var t = 1;
    var h = 6;
    rows = rows.map ( row => row.map(x => this.unmask(x)));
    ww = this.ww_to_hundred(ww);
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
    text = `<table border='0' style='border-collapse:collapse;width:100%;'>${text}</table>`;
    o.push(`<dl ${this.to_attr(block)} >`);
    o.push(text);
    o.push(`</dl>`);
    o.push('');
    block.html = o.join('\n');
  } 
  do_tabb(block){
    var {sig,cols} = block;
    var o = []; 
    var ncols = cols.length;
    var nrows = 0;
    cols.forEach(x => {
      var n = x.length;
      nrows = Math.max(n,nrows);
    });
    var ww = '1'.repeat(ncols).split('').map(x => parseInt(x));
    ww = this.ww_to_hundred(ww);
    var d = [];
    d.push(`<tbody>`);
    for (var j=0; j<nrows; ++j) {
      var pp= cols.map(x => x[j]||'');
      pp = pp.map(x => this.unmask(x));
      pp = pp.map((x,i) => `<td style='width:${ww[i]}%'> ${x} </td>`);
      d.push(`<tr>${pp.join(' ')}</tr>`);
    }
    d.push(`</tbody>`);
    var text = d.join('\n');
    text = `<table border='0' style='border-collapse:collapse;width:100%;'>${text}</table>`;
    o.push(`<dl ${this.to_attr(block)} >`);
    o.push(text);
    o.push(`</dl>`);
    o.push('');
    block.html = o.join('\n');
  } 
  do_diag(block){
    var {id,row1,row2,sig,notes,lines,idnum,floatname,caption,label,islabeled} = block;
    var o = []; 
    lines=lines||[];
    var {s,vw,vh} = this.diagram.to_diagram(lines,notes);
    var text = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' fill='currentColor' stroke='currentColor' viewBox='0 0 ${vw} ${vh}' style='width:100%; ' >${s}</svg>`;
    //var text = `<table border='0' style='width:100%;'><tr><td style='width:100%'>${text}</td></tr></table>`;
    //let buff = Buffer.from(text);
    //var base64data = buff.toString('base64');
    //text = `<img alt='diagram' src='data:image/svg+xml;base64,${base64data}' />`;
    //text = `<img alt='diagram' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(text)}" />`;
    if(islabeled){          
      o.push(`<figure ${this.to_attr(block)} >`);
      o.push(`<figcaption ${this.to_caption_text(floatname,idnum,caption)} </figcaption>`);
    }else{
      o.push(`<p ${this.to_attr(block)} >`);
    }
    o.push(text);
    if(islabeled){
      o.push('</figure>');
    }else{
      o.push('</p>');
    }
    o.push('');
    block.html = o.join('\n');
  }
  do_math(block) {
    var {id,row1,row2,sig,math,label,islabeled,wide,idnum,more} = block;
    var o = []; 
    var data = this.make_math_svg(math,label,islabeled,idnum,more,wide);
    var text = data.join('\n');
    text = `<table border='0' style='width:100%;'>${text}</table>`;
    o.push(`<figure ${this.to_attr(block)} >`);
    o.push(text);
    o.push('</figure>');
    o.push('');
    block.html = o.join('\n');
  }
  do_frmd(block) {
    var {id,row1,row2,sig,lines} = block;
    var o = []; 
    lines=lines||[];
    var {s, w, h} = this.to_framed_svg(lines);
    // if (1) {
    //   var text = `<img style='width:100%;max-width:${vw}px;outline:1px solid;padding:3px;box-sizing:;' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(s)}" />`;
    // } else {
    //   var text = `<img style='width:100%;max-width:${vw}px;' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(s)}" />`;
    // }
    var text = `<div>${s}</div>`;
    o.push(`<figure ${this.to_attr(block)} >`);
    if(this.caption_text){
      o.push(`<figcaption > ${this.caption_text} </figcaption>`);
    }
    o.push(text);
    o.push('</figure>');
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

  smooth (unsafe) {

    return this.smooth_for_var(unsafe);

    ///
    /// Returns a safe string suitable for HTML
    ///

    unsafe = ''+unsafe; /// force it to be a string when it can be a interger
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/⁻¹/g,"<sup><small>-1</small></sup>")
         .replace(/⁻²/g,"<sup><small>-2</small></sup>")
         .replace(/⁻³/g,"<sup><small>-3</small></sup>")
         .replace(/¹/g,"<sup><small>1</small></sup>")
         .replace(/²/g,"<sup><small>2</small></sup>")
         .replace(/³/g,"<sup><small>3</small></sup>");

  }

  smooth_for_var(unsafe) {
    /// escape the string for dialog and others, such that these
    /// texts are to be part of a SVG-TEXT element, thus any HTML markup
    /// such as <sup>, <sub> are not allowed.
    unsafe = '' + unsafe; /// force it to be a string when it can be a interger
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/⁻¹/g, "&#x207b;&#x00B9;")
      .replace(/⁻²/g, "&#x207b;&#x00B2;")                  
      .replace(/⁻³/g, "&#x207b;&#x00B3;")                  
      .replace(/¹/g,  "&#x00B9;")
      .replace(/²/g,  "&#x00B2;")
      .replace(/³/g,  "&#x00B3;")
      .replace(/(?<!\S)([A-Za-z])\^(\d)(?!\S)/g, (match,p1,p2) => {
          switch(p2){//superscript 0-9
            case '0': return  `${p1}&#x2070;`; 
            case '1': return  `${p1}&#x00B9;`; 
            case '2': return  `${p1}&#x00B2;`; 
            case '3': return  `${p1}&#x00B3;`; 
            case '4': return  `${p1}&#x2074;`; 
            case '5': return  `${p1}&#x2075;`; 
            case '6': return  `${p1}&#x2076;`; 
            case '7': return  `${p1}&#x2077;`; 
            case '8': return  `${p1}&#x2078;`; 
            case '9': return  `${p1}&#x2079;`; 
            default: return p2;
          }
      })
      .replace(/(?<!\S)([A-Za-z])_(\d)(?!\S)/g, (match,p1,p2) => {
          switch(p2){//subscript 0-9
            case '0': return `${p1}&#x2080;`;
            case '1': return `${p1}&#x2081;`;
            case '2': return `${p1}&#x2082;`;
            case '3': return `${p1}&#x2083;`;
            case '4': return `${p1}&#x2084;`;
            case '5': return `${p1}&#x2085;`;
            case '6': return `${p1}&#x2086;`;
            case '7': return `${p1}&#x2087;`;
            case '8': return `${p1}&#x2088;`;
            case '9': return `${p1}&#x2089;`;
            default: return p2;
          }
      })
      .replace(/(?<!\S)\\(dot|ddot|bar|mathring|hat|check|grave|acute|breve|tilde)\{([A-Za-z])\}(?!\S)/, (match,p1,p2) => {
          switch(p1){//'dot', 'ddot', 'bar', ...
            case 'dot':      return `${p2}&#x0307;`;
            case 'ddot':     return `${p2}&#x0308;`;
            case 'bar':      return `${p2}&#x0305;`;
            case 'mathring': return `${p2}&#x030A;`;
            case 'hat':      return `${p2}&#x0302;`;
            case 'check':    return `${p2}&#x030C;`;
            case 'grave':    return `${p2}&#x0300;`;
            case 'acute':    return `${p2}&#x0301;`;
            case 'breve':    return `${p2}&#x0306;`;
            case 'tilde':    return `${p2}&#x0303;`;
            default: return p2;
          }
      })
  }

  polish(s,fs,monospace) {
    if(s){
      var opts = [];
      if(fs){
        opts.push(`font-size:${fs}em`);
      }
      if(monospace){
        opts.push('font-family:monospace');
      }
      if(opts.length>0){
        var style = opts.join(';');
        s = `<span style='${style}'>${s}</span>`;
      }
    }
    return s;
  }

  escape (text) {
    var text = this.smooth(text);
    return text;
  }

  /// escape normally, however, if the string
  /// is empty then return '&#160;'
  escape_with_nbsp (text) {
    var text = this.smooth(text);
    if(!text) {
      text = '&#160;';
    }
    return text;
  }

  do_ruby (rb,rt) {
    var s = this.to_ruby_item(rb,rt);
    return s;
  }

  do_ref (sig,label,floatname,idnum,refid,id,chapters){
    if(sig=='HDGS'){
      var secsign = String.fromCharCode(0xA7);
      return `<a href='#${id}'>${secsign}${idnum}</a>`;
    }
    else if(sig=='MATH'){
      var secsign = String.fromCharCode(0xA7);
      return `<a href='#${id}'>${secsign}(${idnum})</a>`;
    }
    if(floatname){
      var secsign = String.fromCharCode(0xA7);
      return `<a href='#${id}'>${floatname}&#160;${secsign}${idnum}</a>`;
    }
    return `<tt><s>${label}</s></tt>`;
  }

  do_img (src) {
    var pp = src.split(';');
    var src = pp[0];
    var width = pp[1];
    var height = pp[2];
    this.imgs.push(src);
    var imgsrc = `./${src}`;///THIS is the URL that is assigned to <img src=...>
    var imgid = '';
    if(1){
      var { imgsrc } = this.to_request_image(imgsrc);
      console.log('imgsrc=', imgsrc.slice(0,40), 'imgid=', imgid);
    }
    if(width&&height){
      return  `<img style='width:${width}mm;height:${height}mm;' src='${imgsrc}' id='${imgid}' />`;
    }else if(width){
      return  `<img style='width:${width}mm;' src='${imgsrc}' id='${imgid}' />`;
    }else if(height){
      return  `<img style='height:${height}mm;' src='${imgsrc}' id='${imgid}' />`;
    }else{
      return  `<img src='${imgsrc}' id='${imgid}' />`;
    }
  }

  do_vbarchart (cnt) {
    var {s,w,h} = this.to_svg_vbarchart(cnt);
    var s =`<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' style='border:1px solid currentColor; padding:2pt' width='${w}mm' height='${h}mm' fill='currentColor' stroke='currentColor' >${s}</svg>`;
    return s;
  }

  do_xyplot (cnt) {
    var {s,w,h} = this.to_svg_xyplot(cnt);
    var s =`<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' style='border:1px solid currentColor; padding:2pt' width='${w}mm' height='${h}mm' fill='currentColor' stroke='currentColor' >${s}</svg>`;
    return s;
  }

  do_colorbox (cnt) {
    var {s,w,h} = this.to_svg_colorbox(cnt);
    var s =`<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' style='border:1px solid currentColor; padding:2pt' width='${w}mm' height='${h}mm' fill='currentColor' stroke='currentColor' >${s}</svg>`;
    return s;
  }

  do_subsup(cnt, cnt2, cnt3) {
    if(cnt2&&cnt3){
      var s= `${cnt}<sub>${cnt2}</sub><sup>${cnt3}</sup>`;
    }
    else if(cnt2){
      var s= `${cnt}<sub>${cnt2}</sub>`;
    }
    else if(cnt3){
      var s= `${cnt}<sup>${cnt3}</sup>`;
    }
    else{
      var s= cnt;
    }
    return s;
  }

  do_sqrt (cnt) {
    return `&#x221A;<span style='text-decoration:overline'>${cnt}</span>`;
  }

  do_cbrt (cnt) {
    return `&#x221B;<span style='text-decoration:overline'>${cnt}</span>`;
  }

  do_qdrt (cnt) {
    return `&#x221C;<span style='text-decoration:overline'>${cnt}</span>`;
  }

  do_sfrac (cnt,cnt2) {
    return `<sup>${cnt}</sup>&#x2044;<sub>${cnt2}</sub>`;
  }

  do_dot(cnt){
    return `${cnt}&#x0307;`
  }
  do_ddot(cnt){
    return `${cnt}&#x0308;`
  }
  do_bar(cnt){
    return `${cnt}&#x0305;`
  }
  do_mathring(cnt){
    return `${cnt}&#x030A;`
  }
  do_hat(cnt){
    return `${cnt}&#x0302;`
  }
  do_check(cnt){
    return `${cnt}&#x030C;`
  }
  do_grave(cnt){
    return `${cnt}&#x0300;`
  }
  do_acute(cnt){
    return `${cnt}&#x0301;`
  }
  do_breve(cnt){
    return `${cnt}&#x0306;`
  }
  do_tilde(cnt){
    return `${cnt}&#x0303;`
  }
  do_overline (cnt) {
    if(0){
    var pp = cnt.split('');
    pp = pp.map(x => `${x}&#x0305;`);
    var text = pp.join('');
    text = `<tt>${text}</tt>`;
    return text;
    }
    return `<span style='text-decoration:overline'>${cnt}</span>`;
  }

  to_inlinemath (str,dstyle) {  
    var {s} = this.to_math_svg(str,dstyle);
    if(dstyle){
      s = `<span style='display:block;text-align:center;'>${s}</span>`;
    }
    return s;
  }

  do_uri(href) {
    return `<a href='${href}'>${href}</a>`
  }

  to_symbol(cnt){
    return this.tokenizer.to_symbol(cnt,'html');
  }

  to_backslash(){
    return `\\`;
  }


  to_style(type, text) {

    type = type || '';
    switch (type) {
      case 'code': {
        text = text.trim();
        return `<code>${text}</code>`
        break;
      }
      case 'em': {
        text = text.trim();
        return `<i>${text}</i>`
        break;
      }
      case 'strong': {
        text = text.trim();
        return `<b>${text}</b>`
        break;
      }
      case 'overstrike': {
        text = text.trim();
        return `<s>${text}</s>`
        break;
      }
      case 'var': {
        text = text.trim();
        return `<var>${text}</var>`
        break;
      }
      default: {
        return `<span>${text}</span>`
        break;
      }
    }
  }


  do_style (type, text) {

    type = type || '';
    switch (type) {
      case 'code': {
        text = text.trim();
        return `<code>${this.escape(text)}</code>`
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
      case 'var': {
        text = text.trim();
        return `<var>${this.smooth_for_var(text)}</var>`
        break;
      }
      default: {
        return `<span>${this.escape(text)}</span>`
        break;
      }
    }
  }

  to_framed_svg (para, isinline) {

    /// ...draw using a 10pt font

    var mpara = 80;
    var npara = para.length;

    /// if mpara is too small, set to be at least 65 characters long
    var verbminwidth = 80;
    if (mpara < verbminwidth) {
      mpara = verbminwidth;
    }

    //var width = `${2*(mpara+2)}mm`;
    //var height = `${(npara+3)*10}pt`;
    
    var w = (mpara) * 6.00;
    var h = (npara) * 10;
    var fontsize = 10; //pt
    var extra_dy = 0.75;
    if(1){
      let o = [];
      o.push( `<text style='font-family:monospace;white-space:pre;font-size:${fontsize}pt;' text-anchor='start' x='0' y='0' textLength='${w}pt' lengthAdjust='spacing' >` );
      for (var i=0; i < npara; ++i) {
        let s = para[i];
        while (s.length < mpara) {
          s += ' ';
        }
        s = this.escape(s);
        s = this.replace_all_blanks_with(s,'&#160;');
        var x = 0;
        o.push( `<tspan y='${(i+extra_dy)*10}pt' x='0'>${s}</tspan>` );
      }
      o.push( `</text>`);
      var s = o.join('\n');
    }
    if(isinline){
      var s = `<svg xmlns='http://www.w3.org/2000/svg' fill='currentColor' stroke='currentColor' viewBox='0 0 ${w * 1.333} ${h * 1.333}' style='width:100%;outline:1px solid;padding:1px;box-sizing;border-box;'> ${s} </svg>`;
      return {s};
    } else {
      //var s = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w * 1.333} ${h * 1.333}' > ${s} </svg>`;
      //var s = ` <img style='width:100%;outline:1px solid;padding:1px;' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(s)}" /> `;
      var s = `<svg xmlns='http://www.w3.org/2000/svg' fill='currentColor' stroke='currentColor' viewBox='0 0 ${w * 1.333} ${h * 1.333}' style='width:100%;outline:1px solid;padding:1px;box-sizing;border-box;'> ${s} </svg>`;

      return {s};
    }
  }

  to_ruby_item (base, top, desc) {
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
      desc = this.smooth(desc);
      o = `<abbr title='${desc}'>${o}</abbr>`;
    }
    return o;
  }

  svg_array_to_svg(d){

    if(d.length==1){
      return d[0];
    }

    ///figure out max_w and max_shiftdist
    var max_shiftdist = d.reduce((acc,x) => Math.max(acc,x.shiftdist),0);

    var dx = 0;
    var dy = 0;
    d.forEach( (x,i) => {
        var {s,w,h,shiftdist} = x;
        var dist = max_shiftdist - shiftdist;
        var math_style = `left:${dist}pt;position:relative;text-align:left;padding:${this.mathpadding}pt 0;`;
        if(i > 0){
          //1pt spacing
          dy += 1;
        }
        if(1){
          var s = `<svg y='${dy}pt' x='${dist}pt'>${s}</svg>`;
        }else{
          //let xdist = this.to_em_from_pt(dist); 
          //let ydist = this.to_em_from_pt(dy); 
          //var s = `<svg y='${ydist}em' x='${xdist}em'>${s}</svg>`;
        }
        dy += h;
        x.dist = dist;
        x.s = s;
        x.w = dist + w;
    });

    ///merge defs
    var defs = d.reduce( (acc,x) => acc.concat(x.defs), [] );

    ///return the info of the bigger SVG
    var w = d.reduce((acc, x) => Math.max(acc, x.w), 0);
    var shiftdist = max_shiftdist;
    var h = dy;
    var s = d.reduce((acc, x) => acc += x.s, '');
    return {s,w,h,shiftdist,defs};
  }

  to_outer_svg(s,w,h,mid,defs){
  
    mid = mid||'0';
    var vw = w*1.333;
    var vh = h*1.333;
    //var [W,H,MID] = this.to_math_width_height(w,h,mid);
    var VA = this.to_math_vertical_align(w,h,mid);
    var opt = '';
    opt += ` xmlns = 'http://www.w3.org/2000/svg'`;
    opt += ` xmlns:xlink='http://www.w3.org/1999/xlink'`
    opt += ` width='${w}pt' height='${h}pt' mid='${mid}pt'`
    opt += ` fill='currentColor' stroke='currentColor'`
    opt += ` viewBox='0 0 ${vw} ${vh}'`;
    opt += ` style='vertical-align:${VA}em;'`;
    var s = `<svg ${opt}> <defs>${defs.join('\n')}</defs> ${s} </svg>`;
    return s;
  }

  // translate the w/h from pt->em so that it scales with font size changes in EPUB
  to_em_from_pt(len){
    ///convert from pt to em
    len /= this.tokenizer.fs;
    return len;
  }

  // translate the w/h from pt->em so that it scales with font size changes in EPUB
  to_math_width_height(w,h,mid){
    ///convert from pt to em
    w /= this.tokenizer.fs;
    h /= this.tokenizer.fs;
    mid /= this.tokenizer.fs;
    return [w,h,mid];
  }

  to_math_vertical_align(w,h,mid){//numbers are fractions of "em"
    var W   = w / this.tokenizer.fs;
    var H   = h / this.tokenizer.fs;
    var MID = mid / this.tokenizer.fs;
    var descent = (1 - this.tokenizer.dy);
    var va = -descent-(H-1)/2;
    va -= H/2 - MID;
    return va;
  }

  to_math_svg(line,dstyle){
    var s = '';
    var w = 0;
    var h = 0;
    var shiftdist = 0;
    line = line.trim();
    if(!line){
      return {s,w,h,shiftdist};
    }
    this.tokenizer.fs = this.conf('mathfontsizept');
    var {s,w,h,mid,shiftdist,defs} = this.tokenizer.to_math_svg(line,dstyle);
    var vw = w*1.333;
    var vh = h*1.333;
    //var s = this.to_outer_svg(s,w,h,mid,defs);
    //note: the returned 's' has already had the 'outer' layer
    return {s,w,h,mid,shiftdist};
  }

  make_line_svg(math,label,islabeled,idnum,wide){
    this.tokenizer.fs = this.conf('mathfontsizept');
    var d = this.tokenizer.to_math_svg_array(math);
    d = d.filter(x => (x.w > 0));
    var {s,w,h,mid,shiftdist,defs} = this.svg_array_to_svg(d);
    s = this.to_outer_svg(s,w,h,mid,defs);
    return {s,w,h,mid,shiftdist,defs,label,idnum};
  }

  make_math_svg(math,label,islabeled,idnum,more,wide){
    var data = [];
    var line = this.make_line_svg(math,label,islabeled,idnum,wide);
    data.push(line);
    if(more&&more.length){
      for(let k=0; k < more.length; k++){
        let x = more[k];
        var line = this.make_line_svg(x.math,x.label,islabeled,x.idnum,wide);
        data.push(line);
      }
    }

    /// filter out empty ones
    data = data.filter(x => (x.w>0)?true:false);

    ///figure out max_w and max_shiftdist
    var max_w = 0;
    var max_shiftdist = 0;
    data.forEach( x => {
        var {w,shiftdist} = x;
        max_w = Math.max(max_w,w);
        max_shiftdist = Math.max(max_shiftdist,shiftdist);
    });

    var gather=1

    if(gather){///always a gather
      var data = data.map( x => {
          var {s,w,label,idnum} = x;
          var dist = (max_w - w)/2;
          if(idnum){
            var idnum_text = `(${idnum})`;
          }else{
            var idnum_text = '';
          }
          //dist = this.to_em_from_pt(dist); 
          //var math_style = `left:${dist}pt;position:relative;text-align:left;padding:${this.mathpadding}pt 0;`;
          var math_style = `text-align:center;padding:${this.mathpadding}pt 0;`;
          var idnum_style = `text-align:right;`;
          return (`<td style='${math_style}'>${s}</td><td style='${idnum_style}'>${idnum_text}</td>`);
      });
      var data = data.map(x => `<tr>${x}</tr>`);
    }else{
      var data = data.map( x => {
          var {s,w,h,shiftdist,label,idnum} = x;
          var dist = max_shiftdist - shiftdist;
          if(idnum){
            var idnum_text = `(${idnum})`;
          }else{
            var idnum_text = '';
          }
          //dist = this.to_em_from_pt(dist); 
          var math_style = `left:${dist}pt;position:relative;text-align:left;padding:${this.mathpadding}pt 0;`;
          var idnum_style = `text-align:right;`;
          return (`<td style='${math_style}'>${s}</td><td style='${idnum_style}'>${idnum_text}</td>`);
      });
      var data = data.map(x => `<tr>${x}</tr>`);
    }
    return data;
  }

  to_nav_style(){
    return '';
    var nav_opts = [];
    nav_opts.push('font-size:0.76rem');
    nav_opts.push('position:absolute');
    nav_opts.push(`left:${this.conf('width')+2*this.conf('margin')+2}mm`);
    nav_opts.push(`top:${this.conf('margin')}mm`)
    return nav_opts.join(';');
  }

  to_page_style(){
    var main_opts = [];
    main_opts.push(`background-color:white`);
    main_opts.push(`margin:${this.conf('margin')}mm`);
    main_opts.push(`width:${this.conf('width')}mm`);
    return main_opts.join(';');
  }

  to_html_document() {
    var configlines = this.to_config_lines();
    var configlines = configlines.map(x => `<!-- ${x} -->`);
    var htmlines = this.parser.blocks.map(x => x.html);
    var mytitle = this.conf('title');
    var myauthor = this.conf('author');
    mytitle = this.escape(mytitle);
    myauthor = this.escape(myauthor);
    var data = `\
<!DOCTYPE html>
<html>
${configlines.join('\n')}
<head>
<meta charset="utf-8" />
<style>
${this.conf('css')}
</style>
</head>
<body>
<title>${mytitle}</title>
<h1>${mytitle}</h1>
<address>${myauthor}</address>
<nav style='${this.to_nav_style()}'>
</nav>
<main style='${this.to_page_style()}'>
${htmlines.join('\n')}
</main>
</body>
</html>
`;
    return data;
  }

  to_xhtml_document() {
    var configlines = this.to_config_lines();
    var configlines = configlines.map(x => `<!-- ${x} -->`);
    var htmlines = this.parser.blocks.map(x => x.html);
    var mytitle = this.conf('title');
    var myauthor = this.conf('author');
    mytitle = this.escape(mytitle);
    myauthor = this.escape(myauthor);
    var mytoc = this.conf('toc')?this.to_toc():'';
    var data = `\
<?xml version='1.0' encoding='UTF-8'?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>
<head>
<meta http-equiv='default-style' content='text/html' charset='utf-8'/>
<meta name='viewport' content='width=device-width, initial-scale=1.0'/>
<style>
${this.conf('css')}
</style>
</head>
<body>
<title>${mytitle}</title>
<h1>${mytitle}</h1>
<address>${myauthor}</address>
<nav style='${this.to_nav_style()}'>
${mytoc}
</nav>
<main style='${this.to_page_style()}'>
${htmlines.join('\n')}
</main>
</body>
</html>
`;
    return data;
  }

  to_toc(){
    var items = this.parser.blocks.map(x => {
      var {id,sig,part,name,text,idnum} = x; 
      text = this.escape(text);
      if(sig=='HDGS'){
        if(name=='part'){
          return `<li><a href='#${id}'>Part ${idnum} ${text}</a></li>`;
        }else{ 
          return `<li><a href='#${id}'>${idnum} ${text}</a></li>`;
        }
      } else {
        return '';
      }
    });
    items = items.filter(x => x?true:false);
    return `<ol style='list-style-type:none;'> ${items.join('\n')} </ol>`;
  }

  to_attr(block){
    let {id,sig,idnum,subf,row1,row2} = block;
    id=id||'';
    sig=sig||'';
    idnum=idnum||'';
    subf=subf||'';
    row1=row1||'0';
    row2=row2||'0';
    var htmlattrs = [];
    htmlattrs.push(`id='${id}'`);
    htmlattrs.push(`sig='${sig}'`);
    htmlattrs.push(`idnum='${idnum}'`);
    htmlattrs.push(`subf='${subf}'`);
    htmlattrs.push(`rows='${row1} ${row2}'`);
    return htmlattrs.join(' ');
  }

  to_lstyle(block){
    return `padding-left:${this.conf('step')}em;list-style-position:outside;`;
  }

  to_mstyle(block){
    return `margin-left:${this.conf('step')}em`;
  }

  to_caption_text(floatname,idnum,caption){
    return `<strong>${floatname} ${idnum}</strong> &#160; ${this.unmask(caption)}`;
  }

  to_subfig_num(j) {
    return const_subfignums[j];
  }

  to_part_num(j) {
    ///The first part is 1, not zero
    return const_partnums[j];
  }

  to_request_image(imgsrc) {
    var imgid = '';
    return {imgsrc, imgid};
  }

  to_colors(color){
    return this.diagram.to_colors(color);
  }
}

module.exports = { NitrilePreviewHtml };
