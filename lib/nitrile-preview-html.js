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
  }
  do_starttranslate(){
  }
  do_endtranslate(){
  }
  do_identify(block, A) {
    if (!A.count) {
      A.count = 1;
      A.chapters = 0;
      A.sections = 0;
      A.subsections = 0;
      A.subsubsections = 0;
      A.parts = 0;
      A.id = 0;///ID for CSS
      A.floats = new Map();
    }
    var { sig, hdgn, subn, name, islabeled, floatname, parser } = block;
    subn = subn||0;
    name = name||'';
    /// generate css ID
    A.id++;
    block.id = A.id;
    /// generate 'idnum'
    if (sig == 'PART') {
      A.parts++;
      idnum = A.parts;
      block.idnum = idnum;
    }else if (sig == 'HDGS') {
      var level = +hdgn + subn;
      var idnum;
      if (level == 0) {
        if(name=='chapter'){
          A.chapters++;
          A.sections = 0;
          A.subsections = 0;
          A.subsubsections = 0;
          A.floats.clear();
          idnum = `${A.chapters}`;
        }
      } else if (level == 1) {
        A.sections++;
        A.subsections = 0;
        A.subsubsections = 0;
        if(A.chapters){
          idnum = `${A.chapters}.${A.sections}`;
        }else{
          idnum = `${A.sections}`;
        }
      } else if (level == 2) {
        A.subsections++;
        A.subsubsections = 0;
        if(A.chapters){
          idnum = `${A.chapters}.${A.sections}.${A.subsections}`;
        }else{
          idnum = `${A.sections}.${A.subsections}`;
        }
      } else {
        A.subsubsections++;
        if(A.chapters){
          idnum = `${A.chapters}.${A.sections}.${A.subsections}.${A.subsubsections}`;
        }else{
          idnum = `${A.sections}.${A.subsections}.${A.subsubsections}`;
        }
      }
      block.idnum = idnum;
    } else if (floatname && islabeled) {
      if(!A.floats.has(floatname)){
        A.floats.set(floatname,0);
      }
      if(block.more && block.more.length){
        block.more.forEach(x => {

          idnum = A.floats.get(floatname);
          idnum += 1;
          A.floats.set(floatname,idnum);
          if (A.chapters) {
            x.idnum = `${A.chapters}-${idnum}`;
          } else {
            x.idnum = `${idnum}`;
          }
        });
      }else{
        idnum = A.floats.get(floatname);
        idnum += 1;
        A.floats.set(floatname, idnum);
        if (A.chapters) {
          block.idnum = `${A.chapters}-${idnum}`;
        } else {
          block.idnum = `${idnum}`;
        }

      }
    }
  }
  do_part(block) {
    var { text, idnum } = block;
    idnum=idnum||'';
    var o = [];
    var text = this.unmask(text);
    if(this.conf('html.partpage')){
      var s=this.conf('html.part').split('\t');
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
    var {id,row1,row2,sig,hdgn,subn,name,text,idnum,parser} = block;
    var o = [];
    var text = this.unmask(text);
    ///note that subn and hdgn guarenteed to be integers
    subn = subn||0;
    var level = +hdgn+subn;
    idnum = idnum||'';
    if(level==0) {
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
  do_plst(block) {
    ///NOTE: cannot place a <p> around the <ul>. 
    var {items,isbroad} = block;
    var o = []; 
    var count=0;
    const gap = '&#x2003;';
    o.push(`<div ${this.to_attr(block)}>`);
    for (var item of items) {
      var {bull,bullet,value,text,dl,ds,more} = item;
      text = text || '';
      let extra_text = '';
      if(more && more.length){
        more.forEach((plitem) => {
          let {lines} = plitem;
          extra_text += `<p>${this.untext(lines.join('\n'))}</p>`;
        });
      }
      switch (bull) {
        case 'OL': {
          o.push(`<ol>`);
          break;
        }
        case 'UL': {
          o.push(`<ul>`);
          break;
        }
        case 'DL': {
          o.push(`<dl>`);
          break;
        }
        case 'LI': {
          if(dl){
            let dt = dl.dt;
            let dd = dl.dd;
            dt = this.polish(dt);
            dd = this.unmask(dd);
            if (isbroad) {
              o.push(`<dt>${dt}</dt><dd><p>${dd}</p>${extra_text}</dd>`);
            }else{
              o.push(`<dt>${dt}</dt><dd>${dd}</dd>`);
            }
          }
          else if(ds){
            let { keys, desc } = ds;
            desc = this.unmask(desc);
            keys = keys.map((key) => {
              let { word, cat, rb, rt } = key;
              if (cat == 'rmap') {
                word = `${rb}${String.fromCharCode('0xb7')}${rt}`;
                word = this.polish(word);
                word = `<strong>${word}</strong>`;
              }
              else if (cat == 'quoted') {
                word = this.polish(word);
                word = `<tt><strong>${word}</strong></tt>`;
              }
              else {
                word = this.polish(word);
                word = `<strong>${word}</strong>`;
              }
              return word;
            });
            let text = `${keys.join(',')}${gap}${desc}`;
            if(isbroad){
              o.push(`<li><p>${text}</p>${extra_text}</li>`);
            }else{
              o.push(`<li>${text}</li>`);
            }
          }else{
            text = this.unmask(text);
            if(isbroad){
              o.push(`<li value='${value}'><p>${text}</p>${extra_text}</li>`);
            }else{
              o.push(`<li value='${value}'>${text}</li>`);
            }
          }
          break;
        }
        case '/OL': {
          o.push(`</ol>`);
          break;
        }
        case '/UL': {
          o.push(`</ul>`);
          break;
        }
        case '/DL': {
          o.push(`</dl>`);
          break;
        }
      }
    }
    o.push('</div>');
    o.push('');
    block.html = o.join('\n');
  }
  do_prog(block) {
    var {id,row1,row2,sig,lines,floatname,idnum,caption,label,islabeled} = block;
    var o = []; 
    var s = [];
    var linenum = 0;
    var lines = lines.map( x => this.polish(x) );
    var lines = lines.map( x => (x)?x:`#160;`);
    var lines = lines.map( x => `<tr><td>${++linenum}</td><td>&#160;</td><td style='white-space:pre'>${x}</td></tr>`);
    var text = lines.join('\n');
    var text = `<table border='0' style='border-collapse:collapse;'>${text}</table>`;
    o.push(`<figure ${this.to_attr(block)} >`);
    if (islabeled) {
      o.push(this.to_caption_text(floatname, idnum, caption));
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
      var lineno = `<small style='position:absolute;right:100%;top:50%;transform:translateY(-50%);text-align:right;display:inline-block;padding-right:0.5em;'> ${lineno}</small>`;
      var line = this.polish(line);
      //var wholeline = `${lineno}${line}`;
      var wholeline = `${line}${lineno}`;
      wholeline = `<code style='white-space:pre;position:relative;'>${wholeline}</code>`;
      return (`${wholeline}`);
    });
    var text = d.join('<br/>\n');
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
  do_samp(block) {
    var {id,row1,row2,sig,lines,parser} = block;
    lines=lines||[];
    var o = []; 
    var text = this.to_verbatim(lines);
    if(this.conf('general.sample')=='1'){
      o.push(`<blockquote><pre ${this.to_attr(block)} >${text}</pre></blockquote>`);
    }else{
      o.push(`<pre ${this.to_attr(block)} >${text}</pre>`);
    }
    o.push('');
    block.html = o.join('\n');
  }
  do_pass(block) {
    var {id,row1,row2,sig,lines,parser} = block;
    lines=lines||[];
    var o = []; 
    var lines = lines.map( x => this.polish(x) );
    var lines = lines.map( x => this.rubify(x) ); 
    var text = lines.join('<br/>\n');
    o.push(`<p ${this.to_attr(block)} >${text}</p>`);
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
    var {leadn,lead,text,nspace} = block;
    var o = []; 
    const indent = '&#160;'.repeat(5);
    if (leadn && leadn>0) {
      lead = this.unmask(lead);
      text = this.unmask(text);
      if (leadn === 1) {
        text = `<strong>${lead}</strong>  ${text}`;
        this.textblockcount = 0;
      }
      else if (leadn === 2) {
        text = `<strong><i>${lead}</i></strong>  ${text}`;
        this.textblockcount = 0;
      } 
      else {
        text = `${indent}<strong><i>${lead}</i></strong>  ${text}`;
      }
      o.push(`<p ${this.to_attr(block)} >${text}</p>`);
      o.push('');

    } else {
      text = this.untext(text);
      if(nspace){
        o.push(`<blockquote ${this.to_attr(block)} >${text}</blockquote>`);
      }else{
        o.push(`<p ${this.to_attr(block)} >${text}</p>`);
      }
      o.push('');

    }
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
    var wd = (100 - 2*(n-1))/n;
    var span = `<span style='width:2%;display:inline-block;'></span>`;
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
      var img_style = `width:${wd}%;`;
      if(opts && opts.frame){
        img_style += 'border:1px solid;';
      }
      var td_style = `text-align:center;vertical-align:bottom;width:${100/n}%;`;
      var img = `<img id='imgid${imgid}' style='${img_style}' src='${imgsrc}' alt='${src}'/>`;
      var sub_text = this.unmask(sub);
      var tdstyle = `display:inline-block;text-align:center;vertical-align:top;width:${wd}%;`;
      var sub = `<span style='${tdstyle}'>${sub_text}</span>`;
      return {img,sub};
    });
    while(mypp.length){
      var pp = mypp.slice(0,n);
      mypp = mypp.slice(n);
      var imgs = pp.map(x => x.img);
      var subs = pp.map(x => x.sub);
      d.push(`${imgs.join(span)}`);
      d.push(`${subs.join(span)}`);
    }
    var text = d.join('\n'); 
    var text = `<div style='white-space:pre'>${text}</div>`;
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
    o.push(`<blockquote ${this.to_attr(block)} >`);
    o.push(text);
    o.push(`</blockquote>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_data(block){
    var {id,row1,row2,sig,rows,islabeled,floatname,idnum,caption} = block;
    rows = rows.map(pp => pp.map(x => this.polish(x)));
    var o = []; 
    var text = this.rows_to_table(rows);
    o.push(`<figure ${this.to_attr(block)} >`);
    if (islabeled) {
      o.push(this.to_caption_text(floatname, idnum, caption));
    }
    o.push(text);
    o.push('</figure>');
    block.html = o.join('\n');
  }
  do_tabr(block){
    var {id,row1,row2,sig,rows,floatname,idnum,caption,label,islabeled} = block;
    var o = []; 
    var hlines = this.string_to_array('t m b');
    var vlines = this.string_to_array('');
    var t = 1;
    var h = 6;
    var nrows = rows.length;
    var s = [];
    /// pp is a list columns of row j
    for(var j=0; j<rows.length; ++j){
      var pp = rows[j];
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
    if (islabeled) {
      o.push(this.to_caption_text(floatname, idnum, caption));
    }
    o.push(text);
    o.push(`</figure>`);
    o.push('');
    block.html = o.join('\n');
  } 
  do_long(block){
    var {id,row1,row2,sig,rows,ww,islabeled,floatname,idnum,caption} = block;
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
    header = header||[];
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
    o.push(`<figure ${this.to_attr(block)} >`);
    if (islabeled) {
      o.push(this.to_caption_text(floatname, idnum, caption));
    }
    o.push(text);
    o.push('</figure>');
    block.html = o.join('\n');
  } 
  do_para(block){
    var {sig,more} = block;
    var o = []; 
    var ncols = more.length;
    var nrows = 0;
    more.forEach(x => {
      var n = x.length;
      nrows = Math.max(n,nrows);
    });
    var ww = '1'.repeat(ncols).split('').map(x => parseInt(x));
    ww = this.ww_to_hundred(ww);
    var d = [];
    d.push(`<tbody>`);
    for (var j=0; j<nrows; ++j) {
      var pp= more.map(x => x[j]||'');
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
    var {id,row1,row2,sig,notes,lines,idnum,floatname,style,caption,label,islabeled} = block;
    var o = []; 
    lines=lines||[];
    var {s,vw,vh} = this.diagram.to_diagram(lines,notes);
    if(style.strict){
      var text = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' fill='currentColor' stroke='currentColor' width='${vw}' height='${vh}'>${s}</svg>`;
    }else{
      var text = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' fill='currentColor' stroke='currentColor' viewBox='0 0 ${vw} ${vh}' style='width:100%; ' >${s}</svg>`;
    }
    //var text = `<table border='0' style='width:100%;'><tr><td style='width:100%'>${text}</td></tr></table>`;
    //let buff = Buffer.from(text);
    //var base64data = buff.toString('base64');
    //text = `<img alt='diagram' src='data:image/svg+xml;base64,${base64data}' />`;
    //text = `<img alt='diagram' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(text)}" />`;
    o.push(`<figure ${this.to_attr(block)} >`);
    if (islabeled) {
      o.push(this.to_caption_text(floatname, idnum, caption));
    }
    o.push(text);
    o.push('</figure>');
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
  do_quat(block){
    this.do_math(block);
  }
  do_frmd(block) {
    var {id,row1,row2,floatname,idnum,caption,sig,lines,islabeled} = block;
    var o = []; 
    lines=lines||[];
    var {s, w, h} = this.do_frmd_svg(lines);
    // if (1) {
    //   var text = `<img style='width:100%;max-width:${vw}px;outline:1px solid;padding:3px;box-sizing:;' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(s)}" />`;
    // } else {
    //   var text = `<img style='width:100%;max-width:${vw}px;' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(s)}" />`;
    // }
    var text = `<div>${s}</div>`;
    o.push(`<figure ${this.to_attr(block)} >`);
    if (islabeled) {
      o.push(this.to_caption_text(floatname, idnum, caption));
    }
    o.push(text);
    o.push('</figure>');
    o.push('');
    block.html = o.join('\n');
  }
  do_frmd_svg (para, isinline) {

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
        s = this.polish(s);
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

    const T1 = String.fromCharCode(0x1);
    /// change string for dialog and others, such that these
    /// texts are to be part of a SVG-TEXT element, thus any HTML markup
    /// such as <sup>, <sub> are not allowed.
    unsafe = '' + unsafe; /// force it to be a string when it can be a interger
    unsafe = unsafe.replace(this.re_all_sups, (match,p1,p2) => {
          switch(p2){
            // I^1
            case '0': return  `${p1}${T1}#x2070;`; 
            case '1': return  `${p1}${T1}#x00B9;`; 
            case '2': return  `${p1}${T1}#x00B2;`; 
            case '3': return  `${p1}${T1}#x00B3;`; 
            case '4': return  `${p1}${T1}#x2074;`; 
            case '5': return  `${p1}${T1}#x2075;`; 
            case '6': return  `${p1}${T1}#x2076;`; 
            case '7': return  `${p1}${T1}#x2077;`; 
            case '8': return  `${p1}${T1}#x2078;`; 
            case '9': return  `${p1}${T1}#x2079;`; 
            case 'n': return  `${p1}${T1}#x207F;`; 
            case 'i': return  `${p1}${T1}#x2071;`; 
            default: return match;
          }
      })
    unsafe = unsafe.replace(this.re_all_subs, (match,p1,p2) => {
          switch(p2){
            // I_1
            case '0': return `${p1}${T1}#x2080;`;
            case '1': return `${p1}${T1}#x2081;`;
            case '2': return `${p1}${T1}#x2082;`;
            case '3': return `${p1}${T1}#x2083;`;
            case '4': return `${p1}${T1}#x2084;`;
            case '5': return `${p1}${T1}#x2085;`;
            case '6': return `${p1}${T1}#x2086;`;
            case '7': return `${p1}${T1}#x2087;`;
            case '8': return `${p1}${T1}#x2088;`;
            case '9': return `${p1}${T1}#x2089;`;
            case 'a': return `${p1}${T1}#x2090;`;
            case 'e': return `${p1}${T1}#x2091;`;
            case 'o': return `${p1}${T1}#x2092;`;
            case 'x': return `${p1}${T1}#x2093;`;
            case 'h': return `${p1}${T1}#x2095;`;
            case 'k': return `${p1}${T1}#x2096;`;
            case 'l': return `${p1}${T1}#x2097;`;
            case 'm': return `${p1}${T1}#x2098;`;
            case 'n': return `${p1}${T1}#x2099;`;
            case 'p': return `${p1}${T1}#x209A;`;
            case 's': return `${p1}${T1}#x209B;`;
            case 't': return `${p1}${T1}#x209C;`;
            default: return match;
          }
      })
    unsafe = unsafe.replace(this.re_all_diacritics, (match,p1,p2) => {
          // a~dot, a~ddot, a~bar ...
          switch(p2){
            case 'dot':      return `${p1}${T1}#x0307;`;
            case 'ddot':     return `${p1}${T1}#x0308;`;
            case 'bar':      return `${p1}${T1}#x0305;`;
            case 'mathring': return `${p1}${T1}#x030A;`;
            case 'hat':      return `${p1}${T1}#x0302;`;
            case 'check':    return `${p1}${T1}#x030C;`;
            case 'grave':    return `${p1}${T1}#x0300;`;
            case 'acute':    return `${p1}${T1}#x0301;`;
            case 'breve':    return `${p1}${T1}#x0306;`;
            case 'tilde':    return `${p1}${T1}#x0303;`;
            default: return match;
          }
      })
    unsafe = unsafe.replace(this.re_all_mathvariants, (match,p1,p2) => {
          // a~mathbb, a~mathbf, ...
          try{
            var v= this.tokenizer.get_mathvariant(p2,p1,'unicode');
            v = v.replace(/&/g,T1);
            return v;
          }catch(e){
            return match;
          }
      })
    unsafe = unsafe.replace(this.re_all_symbols, (match,p1) => {
          try{
            var v = this.tokenizer.get_html_symbol(p1);
            v = v.replace(/&/g,T1);
            return v;
          }catch(e){
            return match;
          }
      })
    unsafe = unsafe.replace(this.re_all_symbol_comments, (match,p1) => {
          try{
            var v = this.tokenizer.get_symbol_comment(p1);
            return v;
          }catch(e){
            return match;
          }
      })
    unsafe = unsafe.replace(/&/g, "&amp;")
    unsafe = unsafe.replace(/</g, "&lt;")
    unsafe = unsafe.replace(/>/g, "&gt;")
    unsafe = unsafe.replace(/"/g, "&quot;")
    unsafe = unsafe.replace(/⁻¹/g, "&#x207b;&#x00B9;")
    unsafe = unsafe.replace(/⁻²/g, "&#x207b;&#x00B2;")
    unsafe = unsafe.replace(/⁻³/g, "&#x207b;&#x00B3;")
    unsafe = unsafe.replace(/¹/g, "&#x00B9;")
    unsafe = unsafe.replace(/²/g, "&#x00B2;")
    unsafe = unsafe.replace(/³/g, "&#x00B3;")
    unsafe = unsafe.replace(/\01/g,'&');
    return unsafe;
  }

  polish_verb(unsafe) {
    return this.polish(unsafe);
  }

  polish(unsafe) {
    unsafe = unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
    return unsafe;
  }

  do_ruby (rb,rt) {
    var s = this.to_ruby_item(rb,rt);
    return s;
  }

  do_ref (sig,label,floatname,idnum,refid,id){
    var secsign = String.fromCharCode(0xA7);
    if(sig=='HDGS'){
      return `<a href='#${id}'>Section&#160;${secsign}${idnum}</a>`;
    }
    if(floatname){
      return `<a href='#${id}'>${floatname}&#160;${secsign}${idnum}</a>`;
    }
    return `<a href='#${id}'>${secsign}${idnum}</a>`;
  }

  do_img (g) {
    var src = g.data;
    var width = g.width;
    var height = g.height;
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
  do_dia (cnt) {
    var lines = cnt.split(';;');
    lines = lines.map(x => x.trim());
    this.diagram.is_dia = 1;
    var {s,vw,vh} = this.diagram.to_diagram(lines);
    this.diagram.is_dia = 0;
    var text = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' fill='currentColor' stroke='currentColor' width='${vw}' height='${vh}'>${s}</svg>`;
    return text;
  }

  do_vbarchart (g) {
    var {s,w,h} = this.diagram.to_svg_vbarchart(g);
    var s =`<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' style='border:1px solid currentColor; padding:2pt' width='${w}mm' height='${h}mm' fill='currentColor' stroke='currentColor' >${s}</svg>`;
    return s;
  }

  do_xyplot (cnt) {
    var {s,w,h} = this.diagram.to_svg_xyplot(cnt);
    var s =`<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' style='border:1px solid currentColor; padding:2pt' width='${w}mm' height='${h}mm' fill='currentColor' stroke='currentColor' >${s}</svg>`;
    return s;
  }

  do_colorbox (cnt) {
    var {s,w,h} = this.diagram.to_svg_colorbox(cnt);
    var s =`<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' style='border:1px solid currentColor; padding:2pt' width='${w}mm' height='${h}mm' fill='currentColor' stroke='currentColor' >${s}</svg>`;
    return s;
  }

  to_inlinemath (str,dstyle) {  
    var fontsize = this.to_mathfontsize();
    var {s} = this.to_svgmath(str,dstyle,fontsize);
    if(dstyle){
      s = `<span style='display:block;text-align:center;'>${s}</span>`;
    }
    return s;
  }

  do_uri(href) {
    return `<a href='${href}'>${href}</a>`
  }
  to_verbatim(ss){
    ss = ss.map(x => this.polish(x));
    return `<code style='white-space:pre-wrap'>${ss.join('<br/>')}</code>`;
  }
  to_verse(ss){
    ss = ss.map(x => this.polish(x));
    ss = ss.map(x => this.rubify(x));
    let text = ss.join('<br/>');
    return(`<div>${text}</div>`);
  }
  to_story(ss){
    let text = ss.join('\n');
    text = this.polish(text);
    text = this.rubify(text);
    return(`<div>${text}</div>`);
  }
  to_tabular(rows){
    rows = rows.map((ss) => ss.map(s => {
      s = this.polish(s);
      s = this.rubify(s);
      return s;
    }));
    let text = this.rows_to_table(rows);
    return text;
  }
  to_newline() {
    let text = '<br/>';
    return text;
  }
  to_style(text,type) {

    type = type || '';
    switch (type) {
      case 'verb': {
        return `<kbd style='white-space:pre'>${text}</kbd>`;
        break;
      }
      case 'code': {
        return `<code>${text}</code>`
        break;
      }
      case 'em': {
        return `<i>${text}</i>`
        break;
      }
      case 'b': {
        return `<b>${text}</b>`
        break;
      }
      case 'overstrike': {
        return `<s>${text}</s>`
        break;
      }
      case 'var': {
        return `<var>${text}</var>`
        break;
      }
      default: {
        return `<span>${text}</span>`
        break;
      }
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

  to_outer_svg(s,w,h,mid,defs,fs,dy){
  
    mid = mid||'0';
    var vw = w*1.333;
    var vh = h*1.333;
    //var [W,H,MID] = this.to_math_width_height(w,h,mid);
    var VA = this.to_math_vertical_align(w,h,mid,fs,dy);
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

  to_math_vertical_align(w,h,mid,fs,dy){
    var W   = w / fs;
    var H   = h / fs;
    var MID = mid / fs;
    var descent = (1 - dy);
    var va = -descent-(H-1)/2;
    va -= H/2 - MID;
    return va;
  }

  to_svgmath(line,dstyle,fontsize){
    var s = '';
    var w = 0;
    var h = 0;
    var shiftdist = 0;
    line = line.trim();
    if(!line){
      return {s,w,h,shiftdist};
    }
    var {s,w,h,mid,shiftdist,defs} = this.tokenizer.to_svgmath(line,dstyle,fontsize);
    //note: the returned 's' has already had the 'outer' layer
    return {s,w,h,mid,shiftdist};
  }

  make_line_svg(math,label,islabeled,idnum,wide){
    var fontsize = this.to_mathfontsize();
    var d = this.tokenizer.to_svgmath_array(math,fontsize);
    d = d.filter(x => (x.w > 0));
    var {s,w,h,mid,shiftdist,defs} = this.svg_array_to_svg(d);
    s = this.to_outer_svg(s,w,h,mid,defs);
    return {s,w,h,mid,shiftdist,defs,label,idnum};
  }

  make_math_svg(math,label,islabeled,idnum,more,wide){
    var data = [];
    //var line = this.make_line_svg(math,label,islabeled,idnum,wide);
    //data.push(line);
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
    nav_opts.push(`left:${this.to_conf_width()+2*this.to_conf_margin()+2}mm`);
    nav_opts.push(`top:${this.to_conf_margin()}mm`)
    return nav_opts.join(';');
  }

  to_page_style(){
    var fontsize = this.to_bodyfontsize();
    var main_opts = [];
    main_opts.push(`background-color:white`);
    main_opts.push(`font-size:${fontsize}pt`);
    main_opts.push(`margin:${this.to_conf_margin()}mm`);
    main_opts.push(`width:${this.to_conf_width()}mm`);
    return main_opts.join(';');
  }

  to_html_document() {
    var configlines = this.to_config_lines();
    var configlines = configlines.map(x => `<!-- ${x} -->`);
    var htmlines = this.parser.blocks.map(x => x.html);
    var mytitle = this.conf('general.title');
    var myauthor = this.conf('general.author');
    mytitle = this.unmask(mytitle);
    myauthor = this.unmask(myauthor);
    var data = `\
<!DOCTYPE html>
<html>
${configlines.join('\n')}
<head>
<meta charset="utf-8" />
<style>
${this.conf('html.css')}
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
    var mytitle = this.conf('general.title');
    var myauthor = this.conf('general.author');
    mytitle = this.unmask(mytitle);
    myauthor = this.unmask(myauthor);
    var mytoc = this.conf('html.toc')?this.to_toc():'';
    var data = `\
<?xml version='1.0' encoding='UTF-8'?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>
<head>
<meta http-equiv='default-style' content='text/html' charset='utf-8'/>
<meta name='viewport' content='width=device-width, initial-scale=1.0'/>
<style>
${this.conf('html.css')}
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
      text = this.unmask(text);
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
    return `padding-left:${this.to_conf_step()}em;list-style-position:outside;`;
  }

  to_mstyle(block){
    return `margin-left:${this.to_conf_step()}em`;
  }

  to_caption_text(floatname,idnum,caption){
    return `<figcaption><strong>${floatname} ${idnum}</strong> &#160; ${this.unmask(caption)}</figcaption>`;
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

  to_bodyfontsize(){
    return this.conf('html.bodyfontsize',12);
  }
  to_mathfontsize(){
    return this.conf('html.mathfontsize',12);
  }
  to_conf_step(){
    return this.conf('html.step',2);
  }
  to_conf_width(){
    return this.conf('html.width',130);
  }
  to_conf_margin(){
    return this.conf('html.margin',4);
  }
  rows_to_table(rows){
    var o = []; 
    var nrows = rows.length;
    var d = [];
    for(var j=0; j<nrows; ++j){
      var pp = rows[j];
      pp = pp.map((x,i) => `<td style='padding:0 8pt 0 0'>${x}</td>`);
      var p = pp.join('');
      var p = `<tr>${p}</tr>`;
      d.push(p);
    }
    var text = d.join('\n');
    var text = `<table border='0'>${text}</table>`;
    return text;
  }
  to_ds_text(ds){
    var o = [];
    var { key, text, type, rb, rt, quote } = ds;
    if (type == 'rmap') {
      key = `${rb}${String.fromCharCode('0xb7')}${rt}`;
      key = this.polish(key);
      text = this.unmask(text);
      o.push(`<li>  <strong>${key}</strong>  ${text}</li>`);
    }
    else if (type == 'quoted') {
      key = this.polish(key);
      key = `${quote}${key}${quote}`;
      text = this.unmask(text);
      o.push(`<li>  <tt><strong>${key}</strong></tt>  ${text}</li>`);
    }
    else {
      key = this.polish(key);
      text = this.unmask(text);
      o.push(`<li>  <strong>${key}</strong>  ${text}</li>`);
    }
    return o.join('\n');
  }
}

module.exports = { NitrilePreviewHtml };
