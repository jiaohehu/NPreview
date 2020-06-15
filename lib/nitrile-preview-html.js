'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');
const { NitrilePreviewDiagramSVG } = require('./nitrile-preview-diagramsvg');
const { NitrilePreviewAutonum } = require('./nitrile-preview-autonum');
const utils = require('./nitrile-preview-utils');
const entjson = require('./nitrile-preview-entity.json');

class NitrilePreviewHtml extends NitrilePreviewParser {

  constructor(name='HTML') {
    super(name);
    this.tokenizer = new NitrilePreviewTokenizer(this);
    this.view = null; /// this is a NitrilePreviewView object
    this.mathmargin = 3;
    this.mathpadding = 2;
    this.imgid = 1;
  }

  setView (view) {
    this.view = view;
  }

  do_hdgs(block) {
    var {id,row1,row2,sig,name,level,hdgn,text,dept,subfname} = block;
    var o = [];
    var text = this.escape(text);
    if(name=='part'){
      o.push(`<h1 ${this.toATTR(block)} >Part ${dept} &#160; ${text}</h1>`);
    } 
    else if(name=='h'&&level==0) {
      o.push(`<h1 ${this.toATTR(block)} >${text}</h1>`);
    } 
    else if(name=='h'&&level==1) {
      o.push(`<h2 ${this.toATTR(block)} >${dept} &#160; ${text}</h2>`);
    } 
    else if(name=='h'&&level==2) {
      o.push(`<h3 ${this.toATTR(block)} >${dept} &#160; ${text}</h3>`);
    } 
    else if(name=='h'&&level==3) {
      o.push(`<h4 ${this.toATTR(block)} >${dept} &#160; ${text}</h4>`);
    } 
    else {
      o.push(`<h4 ${this.toATTR(block)} >${dept} &#160; ${text}</h4>`);
    }
    o.push('');
    block.html = o.join('\n');
  }
  do_dlst(block) {
    var {id,row1,row2,sig,items,para,dept,base,subrow} = block;
    var o = []; 
    const dtstyle=`text-indent:-${this.conf('step')}em;margin-left:${this.conf('step')}em;`;
    o.push(`<dl ${this.toATTR(block)} >`);
    for (var item of items) {
      var {key,text,type,rb,rt} = item;
      if(type=='text'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`<dt style='${dtstyle}'><strong>${key}</strong> &#160; ${text}</dt>`);
      }else if(type=='math'){
        key = this.inlinemath(key);
        text = this.unmask(text);
        o.push(`<dt style='${dtstyle}'>&#x2022; &#160; ${key} &#160; ${text}</dt>`);
      }else if(type=='ruby'){
        text = this.unmask(text);
        if(rb&&rt){
          o.push(`<dt style='${dtstyle}'>&#x2022; &#160; <ruby><rb>${rb}</rb><rt>${rt}</rt></ruby> &#160; ${text}</dt>`);
        } else {
          o.push(`<dt style='${dtstyle}'>&#x2022; &#160; ${key} &#160; ${text}</dt>`);
        }
      }else if(type=='quot'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`<dt style='${dtstyle}'>&#x2022; &#160; <q>${key}</q> &#160; ${text}</dt>`);
      }else if(type=='emph'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`<dt style='${dtstyle}'>&#x2022; &#160; <em>${key}</em> &#160; ${text}</dt>`);
      }else if(type=='code'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`<dt style='${dtstyle}'>&#x2022; &#160; <code>${key}</code> &#160; ${text}</dt>`);
      }
    }
    o.push('</dl>');
    o.push('');
    block.html = o.join('\n');
  }
  do_nlst(block){
    var o = [];
    var {id,row1,row2,sig,items,para,base,subrow,subfname} = block;
    o.push(`<ol ${this.toATTR(block)} style='${this.toLSTYLE(block)};'>`);
    for (var item of items) {
      var {type,bull,text,body} = item;
      if(type=='nlst'){
        text = this.unmask(text);
        text = `<li value='${bull}'>${text}</li>`;
        o.push(`<p>${text}</p>`);
        o.push('');
      }else if(type=='samp'){
        body = body.map( x => this.escapeBR(x) );
        text = body.join('\n');
        o.push(`<pre class='nicode'>${text}</pre>`);
        o.push('');
      }else if(type=='pass'){
        body = body.map( x => this.escape(x) );
        body = body.map( x => this.rubify(x) );
        text = body.join('<br/>\n');
        o.push(`<p>${text}</p>`);
        o.push('');
      }else if(type=='text'){
        text = this.unmask(text);
        o.push(`<p>${text}</p>`);
        o.push('');
      }
    }
    o.push(`</ol>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_hlst(block) {
    var {id,row1,row2,sig,items,para,dept,base,subrow} = block;
    var o = []; 
    o.push(`<dl ${this.toATTR(block)} >`);
    var keys = items;
    keys = keys.map( x => this.unmask(x) );
    for (var key of keys) {
      o.push(`<dt><strong>${key}</strong></dt>`);
    }
    o.push('</dl>');
    o.push('');
    block.html = o.join('\n');
  }
  do_plst(block) {
    ///NOTE: cannot place a <p> around the <ul>. 
    var {id,row1,row2,sig,items} = block;
    var o = []; 
    var count=0;
    for (var item of items) {
      var {bull,bullet,value,text,dt,sep} = item;
      bullet = bullet || '';
      text = text || '';
      text = this.unmask(text);
      if(dt){
        dt = this.escape(dt);
        sep = this.escape(sep);
        sep = ' &#160; ';
        text = `<em>${dt}</em>${sep}${text}`;
      }
      switch (bull) {
        case 'OL': {
          if(count==0){
            count++;
            o.push(`<ol ${this.toATTR(block)} style='${this.toLSTYLE(block)}'><li value='${value}'>${text}`);
          }else{
            o.push(`<ol style='${STYLE}'><li value='${value}'>${text}`);
          }
          break;
        }
        case 'UL': {
          if(count==0){
            count++;
            o.push(`<ul ${this.toATTR(block)} style='${this.toLSTYLE(block)}'><li value='${value}'>${text}`);
          }else{
            o.push(`<ul style='${STYLE}'><li value='${value}'>${text}`);
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
  do_verb(block) {
    var {id,row1,row2,sig,body,caption,label} = block;
    var o = []; 
    var s = [];
    var text = body;
    var linenum = 0;
    body = body.map( x => this.escapeBR(x) );
    body = body.map( x => `<tr><td>${++linenum}</td><td>&#160;</td><td style='white-space:pre'>${x}</td></tr>`);
    text = body.join('\n');
    text = `<table class='niprog' border='0' style='border-collapse:collapse;'>${text}</table>`;
    o.push(`<figure ${this.toATTR(block)} >`);
    if(this.floatname){
      o.push(`<figcaption class='nicaption'> ${this.caption_text} </figcaption>`);
    }
    o.push(text);
    o.push('</figure>');
    o.push('');
    block.html = o.join('\n');
  } 
  do_samp(block) {
    var {id,row1,row2,sig,body,parser} = block;
    var o = []; 
    var body = body.map( x => this.escapeBR(x) );
    var text = body.join('\n');
    o.push(`<pre class='nicode' ${this.toATTR(block)} style='margin-left:${this.conf('step')}em;'>${text}</pre>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_pass(block) {
    var {id,row1,row2,sig,body,parser} = block;
    var o = []; 
    var body = body.map( x => this.escape(x) );
    var body = body.map( x => this.rubify(x) ); 
    var text = body.join('<br/>\n');
    o.push(`<p ${this.toATTR(block)} style='margin-left:${this.conf('step')}em;'>${text}</p>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_hrle(block) {
    var {id,row1,row2,sig,text,subfname} = block;
    var o = []; 
    text = this.unmask(text);
    o.push(`<p ${this.toATTR(block)} style='text-align:center'>${text}</p>`);
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
    o.push(`<p ${this.toATTR(block)} >${text}</p>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_pict(block) {
    var {id,row1,row2,sig,rows,caption,label,para,dept,base,subrow} = block;
    var s = [];
    var imgsrcs = [];
    for(var blk of rows){
      let {mode, images} = blk;
      var n = images.length;
      var imgs = images.map( img => {
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
      var pp = imgs.map( img => {
        const {src,imgsrc,imgid} = img;
        let img_style = 'width:100%;';
        if(mode && mode.frame){
          img_style += 'border:1px solid;';
        }
        let td_style = 'text-align:center;vertical-align:bottom;width:${100/n}%;';
        return(`<td style='${td_style}'> <img id='nitrileimg-${imgid}' style='${img_style}' src='${imgsrc}' alt='${src}'/> </td>`);
      });
      var qq = imgs.map( img => {
        const {sub} = img;
        var sub_text = this.unmask(sub);
        let tdstyle = 'text-align:center;vertical-align:top;';
        return(`<td class='nicaption' style='${tdstyle}'> ${sub_text} </td>`);
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

    var text = s.join('\n'); 
    var o = [];
    o.push(`<figure ${this.toATTR(block)} >`);
    if(this.floatname){
      o.push(`<figcaption class='nicaption' > ${this.caption_text} </figcaption>`);
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
    o.push(`<blockquote ${this.toATTR(block)} style='margin-left:${this.conf('step')}em;right-margin:0;${this.xstyle}'>`);
    o.push(text);
    o.push(`</blockquote>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_csvd(block){
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
      ww = this.wwToHundred(ww);
      pp = pp.map((x,i) => `<td>${x}</td>`);
      var p = pp.join('<td>&#160;&#160;&#160;&#160;&#160;&#160;</td>');
      var p = `<tr>${p}</tr>`;
      s.push(p);
    }
    var text = s.join('\n');
    var text = `<table ${this.toATTR(block)} class='niprog' border='0' style='border-collapse:collapse;'>${text}</table>`;
    //o.push(`<figure ${this.toATTR(block)} >`);
    o.push(text);
    //o.push('</figure>');
    o.push('');
    block.html = o.join('\n');
  }
  do_tabr(block){
    /// extrac cols and place them into s
    var {id,row1,row2,sig,cols,caption,label} = block;
    var o = []; 
    var hlines = this.toArray('t m b');
    var vlines = this.toArray('');
    var t = 1;
    var h = 6;
    var ncols = cols.length;
    var nrows = 0;
    var s = [];
    /// find out the longest rows
    cols.forEach(x => {
      var n = x.length;
      nrows = Math.max(n,nrows);
    });
    /// pp is a list columns of row j
    for(var j=0; j<nrows; ++j){
      var pp = cols.map(x => x[j]||'');
      var n = pp.length;
      var ww = Array(n);
      ww.fill(1);
      ww = this.wwToHundred(ww);
      if(j==0){
        /// it is possible to be multiple lines
        pp = pp.map(x => x.split('\\\\'));
        pp = pp.map(row => row.map(x => this.unmask(x)));
        pp = pp.map(row => row.join('<br/>'));
        //pp = pp.map(x => `<span class='nitabb'>${x}</span>`);
      }else{
        //pp = pp.map(x => `<span class='nitabb'>${x}</span>`);
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
    text = `<table class='nitabb' border='0' style='border-collapse:collapse;'>${text}</table>`;
    o.push(`<figure ${this.toATTR(block)} >`);
    if(this.floatname){
      o.push(`<figcaption class='nicaption' > ${this.caption_text} </figcaption>`);
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
    var hlines = this.toArray('t m b r');
    var vlines = this.toArray('*');
    var t = 1;
    var h = 6;
    rows = rows.map ( row => row.map(x => this.unmask(x)));
    //rows = rows.map ( row => row.map(x => `<span class='nitabb'>${x}</span>`));
    ww = this.wwToHundred(ww);
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
    text = `<table ${this.toATTR(block)} class='nitabb' border='0' style='border-collapse:collapse;width:100%;'>${text}</table>`;
    //o.push(`<p ${this.toATTR(block)} >`);
    o.push(text);
    //o.push(`</p>`);
    o.push('');
    block.html = o.join('\n');
  } 
  do_shor(block){
    var {id,row1,row2,sig,rows,ww} = block;
    var o = []; 
    var maxj = ww.length;
    var hlines = this.toArray('t m b r');
    var vlines = this.toArray('*');
    var t = 0;
    var h = 0;
    rows = rows.map ( row => row.map(x => this.unmask(x)));
    //rows = rows.map ( row => row.map(x => `<span class='nitabb'>${x}</span>`));
    ww = this.wwToHundred(ww);
    var s = [];
    s.push(`<tbody>`);
    var n = rows.length;
    for (var j=0; j < rows.length; ++j) {
      var row = rows[j];
      var row = row.map((x,i) => `<td style=''> ${x} </td>`);
      s.push(`<tr>${row.join('<td> &#160; </td>')}</tr>`);
    }
    s.push(`</tbody>`);
    var text = s.join('\n');
    text = `<table ${this.toATTR(block)} class='nitabb' border='0' style='border-collapse:collapse;'>${text}</table>`;
    //o.push(`<p ${this.toATTR(block)} >`);
    o.push(text);
    //o.push(`</p>`);
    o.push('');
    block.html = o.join('\n');
  } 
  do_diag(block){
    var {id,row1,row2,sig,body,label,parser,subfname} = block;
    var o = []; 
    var {s,vw,vh} = new NitrilePreviewDiagramSVG(this,parser.notes,this.tokenizer).toDiagram(body);
    var text = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' fill='currentColor' stroke='currentColor' viewBox='0 0 ${vw} ${vh}' style='width:100%;outline:1px solid;box-sizing;border-box;' >${s}</svg>`;
    //var text = `<table border='0' style='width:100%;'><tr><td style='width:100%'>${text}</td></tr></table>`;
    //let buff = Buffer.from(text);
    //var base64data = buff.toString('base64');
    //text = `<img alt='diagram' src='data:image/svg+xml;base64,${base64data}' />`;
    //text = `<img alt='diagram' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(text)}" />`;
    subfname = subfname||'';
    subfname = subfname.replace(/\-/g,'~');
    o.push(`<figure ${this.toATTR(block)} >`);
    if(this.floatname){
      o.push(`<figcaption class='nicaption' > ${this.caption_text} </figcaption>`);
    }
    o.push(text);
    o.push('</figure>');
    o.push('');
    block.html = o.join('\n');
  }
  do_math(block) {
    var {id,row1,row2,sig,math,label,gather,idnum,more} = block;
    var o = []; 
    var data = this.make_math_svg(math,label,idnum,more,gather);
    var text = data.join('\n');
    text = `<table border='0' style='width:100%;'>${text}</table>`;
    o.push(`<figure ${this.toATTR(block)} >`);
    o.push(text);
    o.push('</figure>');
    o.push('');
    block.html = o.join('\n');
  }
  do_frmd(block) {
    var {id,row1,row2,sig,body} = block;
    var o = []; 
    var {s, w, h} = this.to_framed_svg(body);
    // if (1) {
    //   var text = `<img style='width:100%;max-width:${vw}px;outline:1px solid;padding:3px;box-sizing:;' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(s)}" />`;
    // } else {
    //   var text = `<img style='width:100%;max-width:${vw}px;' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(s)}" />`;
    // }
    o.push(`<figure ${this.toATTR(block)} >`);
    if(this.floatname){
      var { s } = this.to_framed_svg(body);
      var text = `<img style='width:100%;max-width:${w}pt;outline:1px solid;padding:2pt' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(s)}" />`;
      o.push(`<figcaption class='nicaption' > ${this.caption_text} </figcaption>`);
      o.push(s);
    }else{
      var {s} = this.to_framed_svg(body,true);//inline
      o.push(s);
    }
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

  escapeBR (text) {
    var text = this.smooth(text);
    if(!text) {
      text = '&#160;';
    }
    return text;
  }

  ruby (rb,rt) {
    var s = this.to_ruby_item(rb,rt);
    return s;
  }

  ref (str) {
    for (var j=0; j < this.blocks.length; ++j) {
      var block = this.blocks[j];
      var {id,sig,label,floatname,saveas,idnum,more} = block;
      label = label||'';
      if(sig=='MATH'){
        if( str.localeCompare(label)===0) {
          return `<a class='REF' href='${saveas}#${id}'>${floatname}.${idnum}</a>`;
          break;
        }
        if(more&&more.length){
          for(let k=0; k < more.length; k++){
            let x = more[k];
            if(str.localeCompare(x.label)===0){
              return `<a class='REF' href='${saveas}#${id}'>${floatname}.${x.idnum}</a>`;
              break;
            }
          }
        }
      } else if(sig=='HDGS'){
        if( str.localeCompare(label)===0) {
          var secsign = String.fromCharCode(0xA7);
          return `<a class='REF' href='${saveas}#${id}'>${secsign}${idnum}</a>`;
          break;
        }
      } else {
        if( str.localeCompare(label)===0) {
          return `<a class='REF' href='${saveas}#${id}'>${floatname}.${idnum}</a>`;
          break;
        }
      }
    }
    return `<tt><s>${this.escape(str)}</s></tt>`;
  }

  inlinemath (str,cssfontrate) {  
    var {s} = this.to_math_svg(str,false,cssfontrate);
    return s;
  }

  displaymath (str) {
    var { s } = this.to_math_svg(str,true);
    return s;
  }

  uri(href) {
    return `<a class='URI' href='${href}'>${href}</a>`
  }

  style (type, text) {

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
      default: {
        return `<span>${this.escape(text)}</span>`
        break;
      }
    }
  }

  to_framed_svg (para, isinline) {

    /// ...draw using a 10pt font

    var mpara = this.getParaMaxWidth(para);
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
        s = this.replaceAllBlanks(s,'&#160;');
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
        var s = `<svg y='${dy}pt' x='${dist}pt'>${s}</svg>`;
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

  svg_array_to_dl(d,gather){

    ///figure out max_w and max_shiftdist
    var max_w = 0;
    var max_shiftdist = 0;
    d.forEach( x => {
        var {w,shiftdist} = x;
        max_w = Math.max(max_w,w);
        max_shiftdist = Math.max(max_shiftdist,shiftdist);
    });

    ///convert each line to <td>
    if(gather){
      d = d.map( x => {
          var {s,h,w} = x;
          var dist = (max_w - w);
          var math_style = `left:${dist}pt;position:relative;text-align:left;padding:${this.mathpadding}pt 0;`;
          return (`<dt style='${math_style}'>${s}</dt>`);
      });
    }else{
      d = d.map( x => {
          var {s,w,h,shiftdist} = x;
          var dist = max_shiftdist - shiftdist;
          var math_style = `left:${dist}pt;position:relative;text-align:left;padding:${this.mathpadding}pt 0;`;
          return (`<dt style='${math_style}'>${s}</dt>`);
      });
    }
    d = d.join('\n');
    var s = `<dl style='padding:${this.mathpadding}pt 0;'>${d}</dl>`;
    var w = max_w;
    var shiftdist = max_shiftdist;
    return {s,w,shiftdist};
  }

  to_outer_svg(s,w,h,mid,defs){
  
    var vw = w*1.333;
    var vh = h*1.333;
    var [W,H,MID] = this.to_math_width_height(w,h,mid);
    var VA = this.to_math_vertical_align(H,MID);
    var opt = '';
    opt += ` xmlns = 'http://www.w3.org/2000/svg'`;
    opt += ` xmlns:xlink='http://www.w3.org/1999/xlink'`
    opt += ` width='${W}em' height='${H}em' mid='${MID}em'`
    opt += ` fill='currentColor' stroke='currentColor'`
    opt += ` viewBox='0 0 ${vw} ${vh}'`;
    opt += ` style='vertical-align:${VA}em;'`;
    var s = `<svg class='nisvg' ${opt}> <defs>${defs.join('\n')}</defs> ${s} </svg>`;
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

  to_math_vertical_align(H,MID){//numbers are fractions of "em"
    var descent = (1 - this.tokenizer.dy);
    var va = -descent-(H-1)/2;
    va -= H/2 - MID;
    return va;
  }

  to_math_svg(line,isdisplaymath,cssfontrate){
    var s = '';
    var w = 0;
    var h = 0;
    var shiftdist = 0;
    line = line.trim();
    if(!line){
      return {s,w,h,shiftdist};
    }
    var {s,w,h,mid,shiftdist,defs} = this.tokenizer.toMathSvg(line,isdisplaymath);
    var vw = w*1.333;
    var vh = h*1.333;
    if (cssfontrate) {
      var rate = parseFloat(cssfontrate);
      if (Number.isFinite(rate) && rate != 1.0) {
        w *= rate;
        h *= rate;
        mid *= rate;
        shiftdist *= rate;
      }
    }
    var s = this.to_outer_svg(s,w,h,mid,defs);
    return {s,w,h,mid,shiftdist};
  }

  make_line_svg(math,label,idnum,gather){
    var d = this.tokenizer.toMathSvgArray(math,true);
    d = d.filter(x => (x.w > 0));
    var {s,w,h,mid,shiftdist,defs} = this.svg_array_to_svg(d);
    s = this.to_outer_svg(s,w,h,mid,defs);
    return {s,w,h,mid,shiftdist,defs,label,idnum};
  }

  make_math_svg(math,label,idnum,more,gather){
    var data = [];
    var line = this.make_line_svg(math,label,idnum,gather);
    data.push(line);
    if(more&&more.length){
      for(let k=0; k < more.length; k++){
        let x = more[k];
        var line = this.make_line_svg(x.math,x.label,x.idnum,gather);
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

    if(1){///always a gather
      var data = data.map( x => {
          var {s,w,label,idnum} = x;
          var dist = (max_w - w)/2;
          if(idnum){
            var idnum_text = `(${idnum})`;
          }else{
            var idnum_text = '';
          }
          dist = this.to_em_from_pt(dist); 
          var math_style = `left:${dist}em;position:relative;text-align:left;padding:${this.mathpadding}pt 0;`;
          var idnum_style = `text-align:right;`;
          return (`<td style='${math_style}'>${s}</td><td class='nicaption' style='${idnum_style}'>${idnum_text}</td>`);
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
          dist = this.to_em_from_pt(dist); 
          var math_style = `left:${dist}em;position:relative;text-align:left;padding:${this.mathpadding}pt 0;`;
          var idnum_style = `text-align:right;`;
          return (`<td style='${math_style}'>${s}</td><td style='${idnum_style}'>${idnum_text}</td>`);
      });
      var data = data.map(x => `<tr>${x}</tr>`);
    }
    return data;
  }

  toNavStyle(){
    var nav_opts = [];
    nav_opts.push('font-size:0.76rem');
    nav_opts.push('position:absolute');
    nav_opts.push(`left:${this.conf('width')+2*this.conf('margin')+2}mm`);
    nav_opts.push(`top:${this.conf('margin')}mm`)
    return nav_opts.join(';');
  }

  toPageStyle(){
    var main_opts = [];
    main_opts.push(`background-color:white`);
    main_opts.push(`margin:${this.conf('margin')}mm`);
    main_opts.push(`width:${this.conf('width')}mm`);
    main_opts.push(`font-size:${this.conf('bodyfontsizept')}pt`);
    return main_opts.join(';');
  }

  toHtmlDocument() {
    var htmlines = this.blocks.map(x => x.html);
    var mylines = this.toConfigLines();
    var mylines = mylines.map(x => `<!-- ${x} -->`);
    var mytitle = this.conf('title');
    var myauthor = this.conf('author');
    mytitle = this.escape(mytitle);
    myauthor = this.escape(myauthor);
    var data = `\
<!DOCTYPE html>
<html>
${mylines.join('\n')}
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
<nav style='${this.toNavStyle()}'>
</nav>
<main style='${this.toPageStyle()}'>
${htmlines.join('\n')}
</main>
</body>
</html>
`;
    return data;
  }

  toXhtmlDocument() {
    var htmlines = this.blocks.map(x => x.html);
    var mylines = this.toConfigLines();
    var mylines = mylines.map(x => `<!-- ${x} -->`);
    var mytitle = this.conf('title');
    var myauthor = this.conf('author');
    mytitle = this.escape(mytitle);
    myauthor = this.escape(myauthor);
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
<body class='nitrile-preview'>
<title>${mytitle}</title>
<h1>${mytitle}</h1>
<address>${myauthor}</address>
<nav style='${this.toNavStyle()}'>
${this.toTOC()}
</nav>
<main style='${this.toPageStyle()}'>
${htmlines.join('\n')}
</main>
</body>
</html>
`;
    return data;
  }

  toTOC(){
    var items = this.blocks.map(x => {
      let {id,sig,part,dept,text} = x; 
      text = this.escape(text);
      if(sig=='HDGS' && part){
        text = this.escape(part);
        return `<li><a href='#${id}'>Part ${dept} ${text}</a></li>`;
      } else if(sig=='HDGS'){
        return `<li><a href='#${id}'>${dept} ${text}</a></li>`;
      } else {
        return '';
      }
    });
    items = items.filter(x => x?true:false);
    return `<ol style='list-style-type:none;white-space:nowrap;'> ${items.join('\n')} </ol>`;
  }

  toATTR(block){
    let {id,sig,dept,subfname,row1,row2} = block;
    id=id||'';
    sig=sig||'';
    dept=dept||'';
    subfname=subfname||'';
    row1=row1||'0';
    row2=row2||'0';
    var htmlattrs = [];
    htmlattrs.push(`id='${id}'`);
    htmlattrs.push(`sig='${sig}'`);
    htmlattrs.push(`dept='${dept}'`);
    htmlattrs.push(`fname='${subfname}'`);
    htmlattrs.push(`rows='${row1} ${row2}'`);
    return htmlattrs.join(' ');
  }

  toLSTYLE(block){
    return `padding-left:${this.conf('step')}em;list-style-position:outside;`;
  }

}

module.exports = { NitrilePreviewHtml };
