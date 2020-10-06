'use babel';

const { NitrilePreviewTranslator } = require('./nitrile-preview-translator');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');
const { NitrilePreviewDiagramSVG } = require('./nitrile-preview-diagramsvg');
const { NitrilePreviewFramedSVG } = require('./nitrile-preview-framedsvg');
const const_partnums = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'IIX', 'IX', 'X'];
const const_subfignums = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

class NitrilePreviewHtml extends NitrilePreviewTranslator {

  constructor(parser) {
    super(parser);
    this.name='HTML';
    this.tokenizer = new NitrilePreviewTokenizer(this);
    this.diagram = new NitrilePreviewDiagramSVG(this);
    this.framed = new NitrilePreviewFramedSVG(this);
    this.mathmargin = 3;
    this.mathpadding = 2;
    this.imgid = 1;
    this.imgs = [];
    this.my_diagram_ss_maps = new Map();
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
    var { sig, hdgn, subn, name, style, parser } = block;
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
    } else if (block && block.style && block.style.floatname) {   
      if(!A.floats.has(block.style.floatname)){
        A.floats.set(block.style.floatname,0);
      }
      idnum = A.floats.get(block.style.floatname);
      idnum += 1;
      A.floats.set(block.style.floatname,idnum);
      block.style.idnum = idnum;
      block.style.idtext = block.style.floatname;
    }
  }
  do_PART(block) {
    var { title, style } = block;
    let idnum=style.idnum||'';
    var o = [];
    o.push(this.to_info(block));
    var title = this.unmask(title);
    if(this.conf('html.partpage')){
      var s=this.conf('html.part').split('\t');
      var s=s.map(x => x.replace(/\$\{text\}/g,title));
      var s=s.map(x => x.replace(/\$\{i\}/g,x=>this.to_i_letter(idnum)));
      var s=s.map(x => x.replace(/\$\{I\}/g,x=>this.to_I_letter(idnum)));
      var s=s.map(x => x.replace(/\$\{a\}/g,x=>this.to_a_letter(idnum)));
      var s=s.map(x => x.replace(/\$\{A\}/g,x=>this.to_A_letter(idnum)));
      var s=s.map(x => x.replace(/\$\{1\}/g,x=>this.to_1_letter(idnum)));
      var s=s.join('\n');
      o.push(s);
    }else{
      idnum = this.to_I_letter(idnum);
      o.push(`<h1 > <small> Part ${idnum} </small> <br/> ${title} </h1>`);
    }
    o.push('');
    block.html = o.join('\n');
  }
  do_HDGS(block) {
    let {hdgn,title,style} = block;
    var o = [];
    o.push(this.to_info(block));
    title = this.unmask(title);
    let chnum = style.chnum||'';
    let idnum = style.idnum||'';
    if(chnum){
      idnum = chnum + '.' + idnum;
    }
    ///note that subn and hdgn guarenteed to be integers
    if(hdgn==0) {
      o.push(`<h1 >${idnum} ${title}</h1>`);
    } 
    else if(hdgn==1) {
      o.push(`<h2 >${idnum} ${title}</h2>`);
    } 
    else if(hdgn==2) {
      o.push(`<h3 >${idnum} ${title}</h3>`);
    } 
    else {
      o.push(`<h4 >${idnum} ${title}</h4>`);
    }
    o.push('');
    block.html = o.join('\n');
  }
  do_PLST(block) {
    ///NOTE: cannot place a <p> around the <ul>. 
    var {items} = block;
    var o = []; 
    o.push(this.to_info(block));
    var count=0;
    const gap = '&#x2003;';
    for (var item of items) {
      var {bull,bullet,value,text,dl,ds,more} = item;
      text = text || '';
      let extra_text = '';
      if(more && more.length){
        more.forEach((plitem) => {
          let {lines} = plitem;
          extra_text += `<div class='PLST'>${this.untext(lines)}</div>`;
        });
      }
      switch (bull) {
        case 'OL': {
          let postfix = count ? '' : 'TOP';
          o.push(`<ol class='PLST ${postfix}'>`);
          count++;
          break;
        }
        case 'UL': {
          let postfix = count ? '' : 'TOP';
          o.push(`<ul class='PLST ${postfix}'>`);
          count++;
          break;
        }
        case 'DL': {
          let postfix = count ? '' : 'TOP';
          o.push(`<dl class='PLST ${postfix}'>`);
          count++;
          break;
        }
        case 'LI': {
          if(dl){
            let dt = dl.dt;
            let dd = dl.dd;
            dt = this.polish(dt);
            dd = this.unmask(dd);
            o.push(`<dt class='PLST'>${dt}</dt><dd class='PLST'>${dd}${extra_text}</dd>`);
          }
          else if(ds){
            let { keys, cat, desc } = ds;
            desc = this.unmask(desc);
            keys = keys.map((key) => {
              key = this.polish(key);
              if (cat == 'quoted') {
                key = `'<tt><strong>${key}</strong></tt>'`;
              }
              else {
                key = `<strong>${key}</strong>`;
              }
              return key;
            });
            let text = `${keys.join(', ')}${gap}${desc}`;
            o.push(`<li class='PLST'>${text}${extra_text}</li>`);
          }else{
            text = this.unmask(text);
            o.push(`<li class='PLST' value='${value}'>${text}${extra_text}</li>`);
          }
          break;
        }
        case '/OL': {
          o.push(`</ol>`);
          count--;
          break;
        }
        case '/UL': {
          o.push(`</ul>`);
          count--;
          break;
        }
        case '/DL': {
          o.push(`</dl>`);
          count--;
          break;
        }
      }
    }
    o.push('');
    block.html = o.join('\n');
  }
  do_SAMP(block) {
    var {id,row1,row2,sig,body,parser} = block;
    var o = []; 
    o.push(this.to_info(block));
    body = body.map(x => this.polish(x));
    var text = body.join('<br/>');
    o.push(`<blockquote class='SAMP'><pre style='margin:0'>${text}</pre></blockquote>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_HRLE(block) {
    var {id,row1,row2,sig,text} = block;
    var o = []; 
    o.push(this.to_info(block));
    text = this.unmask(text);
    o.push(`<hr class='HRLE' style='text-align:center' />`);
    o.push('');
    block.html = o.join('\n');
  }
  do_PRIM(block) {
    var {hdgn,title,body} = block;
    var o = []; 
    o.push(this.to_info(block));
    const indent = '&#160;'.repeat(5);
    title = this.unmask(title);
    let s0 = body[0]||'';
    let text = this.unmask(body.join('\n'));
    if (hdgn === 1) {
      text = `<strong>${title}</strong> ${s0 ? '' : '&#160;'} ${text}`;
      this.textblockcount = 0;
    }
    else if (hdgn === 2) {
      text = `<strong><i>${title}</i></strong> ${s0 ? '':'&#160;'} ${text}`;
      this.textblockcount = 0;
    } 
    else {
      text = `${indent}<strong><i>${title}</i></strong> ${s0 ? '':'&#160;'} ${text}`;
    }
    o.push(`<p class='PRIM'>${text}</p>`);
    o.push('');
    block.html = o.join('\n');
  }
  do_TEXT(block) {
    var {body,nspace} = block;
    var o = []; 
    o.push(this.to_info(block));
    let text = this.untext(body);
    if(nspace){
      o.push(`<blockquote class='TEXT'>${text}</blockquote>`);
    }else{
      o.push(`<p class='TEXT'>${text}</p>`);
    }
    o.push('');
    block.html = o.join('\n');
  }
  do_FLOA(block) {
    switch(block.floatname){
      case 'Figure': {
        block.html = this.untext(block.body,block.style);
        break;
      }
      case 'Table': {
        block.html = this.untext(block.body,block.style);
        break;
      }
      case 'Equation': {
        let text = this.untext(block.body,block.style);
        let step = this.to_conf_step();
        let mynum = `(${block.style.idnum})`;
        if(block.style.chnum){
          mynum = `(${block.style.chnum}.${block.style.idnum})`;
        }
        let os = '';
        os = `<div style='position:relative;'><div style='position:absolute;top:50%;transform:translate(0,-50%);'>${mynum}</div><div style='margin-left:${step}em;text-align:center;'>${text}</div></div>`;
        text = os;
        block.html = text;
        break;
      }
      case 'Vocabulary': {
        let itms = this.ss_to_vocabulary_itms(block.body,block.style,block.parser.rmap);
        itms.forEach(p => {
          p.text = this.unmask(p.raw);
        });
        var text = this.itms_to_itemized(itms,block.style);
        text = `<p class='VOCB'>${text}</p>`;
        block.html = text;
        break;
      }
      case 'Listing': {
        var d = block.body.map((x, i) => {
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
        if(1){
          let o = [];
          o.push(`<figure id='${block.id}'>`);
          o.push(this.to_caption_text(block.style.idtext,block.style.chnum,block.style.idnum,block.style.caption));
          o.push(text);
          o.push('</figure>');
          text = o.join('\n');
        }
        block.html = text;
        break;
      }
    }
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
            case 'c': return  `${p1}${T1}#x1D9C;`;
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
  polish_verb(unsafe){
    ///needed by the translator
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
  to_ruby (g) {
    let {rb,rt} = g;
    var s = this.phrase_to_ruby(rb,rt);
    return s;
  }
  phrase_to_ref (cnt){
    if(this.ref_map && this.ref_map.has(cnt)){      
      let g = this.ref_map.get(cnt);
      var secsign = String.fromCharCode(0xA7);
      if(g.idtext){
        if(g.chnum){
          return `<a href='#${g.id}'>${g.idtext}&#160;${secsign}${g.chnum}.${g.idnum}</a>`;
        }else{
          return `<a href='#${g.id}'>${g.idtext}&#160;${secsign}${g.idnum}</a>`;
        }
      }else{
        if(g.chnum){
          return `<a href='#${id}'>Section&#160;${secsign}${g.chnum}.${g.idnum}</a>`;  
        }else{
          return `<a href='#${id}'>Section&#160;${secsign}${g.idnum}</a>`;
        }
      }
    }
    return `<mark><tt>${cnt}</tt></mark>`
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
  to_uri(g) {
    return `<a href='${g.href}'>${g.href}</a>`
  }
  fence_to_diagram(ss,style){
    if(style.load){
      let name0 = style.load;
      if(this.my_diagram_ss_maps.has(name0)){
        let ss0 = this.my_diagram_ss_maps.get(name0);
        ss = ss0.concat(ss);
      }
    }
    if(style.save){
      this.my_diagram_ss_maps.set(style.save,ss);
    }
    var { s, width, height } = this.diagram.to_diagram(ss,style);
    let css_style = [];
    css_style.push(`vertical-align:top`);
    css_style.push(`width:${width}`);
    css_style.push(`height:${height}`);
    if (style.zoom) {
      css_style.push(`zoom:${style.zoom}`);
    }
    if(style && style.float){
      let f = (style.float=='left')?'left':'right';
      css_style.push(`float:${f}`);
    }
    s = `<img alt='diagram' style='${css_style.join(';')}' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(s)}" />`;
    return s;
  }
  fence_to_framed(ss, style) {
    var { s } = this.framed.to_framed(ss,'100%');
    return s;
  }
  fence_to_math(ss, style) {
    var line = this.make_line_svg(ss.join('\n'),style);
    var text = line.s;
    return text;
  }
  phrase_to_img(g) {
    var src = g.src;
    var width = this.string_to_html_length(g.width);
    var height = this.string_to_html_length(g.height);
    this.imgs.push(src);
    var imgsrc = `./${src}`;///THIS is the URL that is assigned to <img src=...>
    var imgid = '';
    if (1) {
      var { imgsrc } = this.to_request_image(imgsrc);
      console.log('imgsrc=', imgsrc.slice(0, 40), 'imgid=', imgid);
    }
    if (width && height) {
      return `<img style='width:${width};height:${height};' src='${imgsrc}' id='${imgid}' />`;
    } else if (width) {
      return `<img style='width:${width};' src='${imgsrc}' id='${imgid}' />`;
    } else if (height) {
      return `<img style='height:${height};' src='${imgsrc}' id='${imgid}' />`;
    } else {
      return `<img src='${imgsrc}' id='${imgid}' />`;
    }
  }
  para_to_plaintext(ss, style) {
    let text = ss.join('\n');
    text = this.unmask(text, style);
    return (`<div>${text}</div>`);
  }
  fence_to_tabulate(ss, style) {
    let rows = this.ss_to_tabulate_rows(ss,style);
    rows = rows.map((ss) => ss.map(s => {
      s = this.unmask(s);
      return s;
    }));
    let text = this.rows_to_tabulate(rows, style, 0);
    if(style.floatname=='Table'){
      let o = [];      
      o.push(`<figure >`);
      o.push(this.to_caption_text(style.idtext, style.chnum, style.idnum, style.caption));
      o.push(text);
      o.push('</figure>');
      text = o.join('\n');
    }
    return text;
  }
  para_to_longtable(ss, style) {
    let rows = this.ss_to_tabulate_rows(ss,style);
    rows = rows.map((ss) => ss.map(s => {
      s = this.unmask(s);
      return s;
    }));
    let text = this.rows_to_tabulate(rows,style,1);
    if (style.floatname == 'Table') {
      let o = [];
      o.push(`<figure >`);
      o.push(this.to_caption_text(style.idtext, style.chnum, style.idnum, style.caption));
      o.push(text);
      o.push('</figure>');
      text = o.join('\n');
    }
    return text;
  }
  para_to_multi(ss,style){
    let itms = this.para_to_multi_itms(ss);
    itms = itms.map(s => {
      s = this.unmask(s);
      return s;
    });    
    let text = this.itms_to_multi(itms,style);
    return text;
  }
  para_to_itemized(ss,style) {
    let itms = this.para_to_itemized_itms(ss);
    itms = itms.map(p => {
      let text = p.text;
      text = this.unmask(text);
      p.text = text;
      return p;
    });
    let text = this.itms_to_itemized(itms,style);
    return text;
  }
  para_to_blockquote(ss) {
    let text = ss.join('\n').trim();
    text = this.unmask(text);
    var lq = `<q>`;
    var rq = `</q>`;
    return `${lq}<i>${text}</i>${rq}`;
  }
  para_to_imgrid(ss,style){
    let itms = this.para_to_imgrid_itms(ss,style);
    itms.forEach(p => {
      p.sub = this.unmask(p.sub);
    })
    var text = this.imgrid_to_htmltable(itms,style);
    if(style.floatname=='Figure'){
      let o = [];
      o.push(`<figure >`);
      o.push(this.to_caption_text(style.idtext, style.chnum, style.idnum, style.caption));
      o.push(text);
      o.push('</figure>');
      text = o.join('\n');
    }
    return text;
  }
  to_br() {
    let text = '<br/>';
    return text;
  }
  to_vspace(g){
    return `<span style='display:block;height:${g.length}'></span>`;
  }
  to_hspace(g){
    return `<span style='display:inline-block;width:${g.length}'></span>`;
  }
  to_typeface(text,type) {

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
  phrase_to_ruby (base, top) {
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

  _to_outer_svg(s,w,h,mid,defs,fs,dy){
  
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

  to_outer_svg(s,w,h,mid,defs,fs,dy,type){
    ///type:='\\pipe' or '\\math'
    mid = mid||'0';
    var vw = w*1.333;
    var vh = h*1.333;
    //var [W,H,MID] = this.to_math_width_height(w,h,mid);
    var opt = '';
    if(type=='\\math'){
      var VA = this.to_math_vertical_align(w,h,mid,fs,dy);
      opt += ` xmlns = 'http://www.w3.org/2000/svg'`;
      opt += ` xmlns:xlink='http://www.w3.org/1999/xlink'`
      opt += ` width='${w/fs}em' height='${h/fs}em'`
      opt += ` style='vertical-align:${VA}em;'`;
      opt += ` fill='currentColor' stroke='currentColor'`
    } else if(type=='Equation'){
      opt += ` xmlns = 'http://www.w3.org/2000/svg'`;
      opt += ` xmlns:xlink='http://www.w3.org/1999/xlink'`
      opt += ` width='${w/fs}em' height='${h/fs}em'`
      opt += ` style='vertical-align:text-top;'`;
      opt += ` fill='currentColor' stroke='currentColor'`
    } else if(type=='make_line_svg'){
      opt += ` xmlns = 'http://www.w3.org/2000/svg'`;
      opt += ` xmlns:xlink='http://www.w3.org/1999/xlink'`
      opt += ` width='${w/fs}em' height='${h/fs}em'`
      opt += ` style='vertical-align:top;'`;
      opt += ` fill='currentColor' stroke='currentColor'`
    } else {
      opt += ` width='${vw}' height='${vh}'`
    }
    opt += ` mid='${mid*1.333}'`
    opt += ` viewBox='0 0 ${vw} ${vh}'`;
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
  make_line_svg(math,style){
    let type = (style.floatname=='Equation')?'Equation':'make_line_svg';
    var fontsize = this.to_mathfontsize();
    var d = this.tokenizer.to_svgmath_array(math,fontsize);
    d = d.filter(x => (x.w > 0));
    var {s,w,h,mid,shiftdist,defs} = this.svg_array_to_svg(d);
    s = this.to_outer_svg(s,w,h,mid,defs,this.tokenizer.fs,0,type);
    return {s,w,h,mid,shiftdist,defs};
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

  two_integers_to_range_string(start,end){
    ///return a list of integers separated by a space from start to end-1
    start = parseInt(start);
    end = parseInt(end);
    var d = [];
    if(Number.isFinite(start)&&Number.isFinite(end)){
      if(end > start){
        for(let i=start; i < end; ++i){
          d.push(i);
          if(d.length > 2048){
            break;
          }
        }
      }
      if(end < start){
        for(let i=start; i > end; --i){
          d.push(i);
          if(d.length > 2048){
            break;
          }
        }
      }
    }
    return d.join(' ');
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
    htmlattrs.push(`rows='${this.two_integers_to_range_string(row1,row2)}'`);
    return htmlattrs.join(' ');
  }

  to_lstyle(block){
    return `padding-left:${this.to_conf_step()}em;list-style-position:outside;`;
  }

  to_mstyle(block){
    return `margin-left:${this.to_conf_step()}em`;
  }

  to_caption_text(idtext,chnum,idnum,caption){
    if(chnum){
      return `<figcaption><strong>${idtext} ${chnum}.${idnum}</strong> &#160; ${this.unmask(caption)}</figcaption>`;  
    }else{
      return `<figcaption><strong>${idtext} ${idnum}</strong> &#160; ${this.unmask(caption)}</figcaption>`;
    }
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
  cols_to_tabu(cols){
    var nrows = 0;
    cols.forEach(ss => {
      let n = ss.length;
      nrows = Math.max(n,nrows);
    })
    var d = [];
    for(var j=0; j<nrows; ++j){
      var pp = cols.map(x => x[j]||'')
      pp = pp.map((x,i) => `<td>${x}</td>`);
      let gap = `<td style='width:1em'></td>`;
      var p = pp.join(gap);
      var p = `<tr>${p}</tr>`;
      d.push(p);
    }
    var text = d.join('\n');
    var text = `<table border='0'>${text}</table>`;
    return text;
  }
  rows_to_tabulate(rows,style,islongtable){
    var border = style.border||0;
    var ncols = rows.length ? rows[0].length : 1;
    var nrows = rows.length;
    if (islongtable) {
      var frs = this.string_to_frac(style.fr, ncols, 0);
      var frs = frs.map(x => `${x * 100}%`);
    } else {
      var frs = this.string_to_frac(style.fr, ncols, 0);
      var frs = frs.map(x => '');
    }
    var d = [];
    if(border==1){
      for (var j = 0; j < nrows; ++j) {
        var pp = rows[j];
        if (this.pp_is_hline(pp)) {
          d.push(`<tr><td style='' colspan='${ncols}'></td></tr>`);
          continue;
        }
        pp = pp.map((x, i) => `<td style='width:${frs[i]};padding:0 0.5em;border:1px solid;'>${x}</td>`);
        var p = pp.join('');
        var p = `<tr>${p}</tr>`;
        d.push(p);
      }
    }else if(border==2){
      ///only the top/bottom/left/right lines
      for (var j = 0; j < nrows; ++j) {
        var pp = rows[j];
        if (this.pp_is_hline(pp)) {
          d.push(`<tr><td style='border-top:1px solid;border-bottom:1px solid;' colspan='${ncols}'></td></tr>`);
          continue;
        }
        let border_top = (j == 0) ? '1px solid' : '';
        let border_bot = (j == nrows-1) ? '1px solid' : '';
        pp = pp.map((x, i) => {
          if(i==0){
            return `<td style='width:${frs[i]};padding:0 0.5em;border-left:1px solid;border-top:${border_top};border-bottom:${border_bot}'>${x}</td>`;
          }else if(i==pp.length-1){
            return `<td style='width:${frs[i]};padding:0 0.5em;border-right:1px solid;border-top:${border_top};border-bottom:${border_bot}'>${x}</td>`;
          }else{
            return `<td style='width:${frs[i]};padding:0 0.5em;border-top:${border_top};border-bottom:${border_bot}'>${x}</td>`;
          }
        });
        var p = pp.join('');
        var p = `<tr>${p}</tr>`;
        d.push(p);
      }
    }else if(border==3){
      ///only the top/bottom lines
      for (var j = 0; j < nrows; ++j) {
        var pp = rows[j];
        if (this.pp_is_hline(pp)) {
          d.push(`<tr><td style='border-top:1px solid;border-bottom:1px solid;' colspan='${ncols + ncols - 1}'></td></tr>`);
          continue;
        }
        let border_top = (j == 0) ? '1px solid' : '';
        let border_bot = (j == nrows - 1) ? '1px solid' : '';
        pp = pp.map((x, i) => `<td style='width:${frs[i]};padding:0;border-top:${border_top};border-bottom:${border_bot};'>${x}</td>`);
        let gap = `<td style='padding:0 1em;border-top:${border_top};border-bottom:${border_bot};'></td>`;
        var p = pp.join(gap);
        var p = `<tr>${p}</tr>`;
        d.push(p);
      }
    }else{///border=0
      let border_top = '';
      for (var j = 0; j < nrows; ++j) {
        var pp = rows[j];
        if (this.pp_is_hline(pp)) {
          border_top = '1px solid';
          continue;
        }
        pp = pp.map((x, i) => `<td style='width:${frs[i]};padding:0;border-top:${border_top};'>${x}</td>`);
        let gap = `<td style='padding:0 1em;border-top:${border_top};'></td>`;
        var p = pp.join(gap);
        var p = `<tr>${p}</tr>`;
        border_top = '';
        d.push(p);
      }
    }
    var text = d.join('\n');
    var css_style = [];
    if(islongtable){
      css_style.push('display:block');///always inline-block so that it can be placed side-by-side
    }else{
      css_style.push('display:inline-block');///always inline-block so that it can be placed side-by-side
    }
    if(style.float){
      var float = (style.float == 'left') ? 'left' : 'right';
      css_style.push(`float:${float}`)
    }
    if(style.zoom){
      css_style.push(`zoom:${style.zoom*100}%`)
    }
    css_style = css_style.join(';');
    var text = `<table style='${css_style}' border='0'>${text}</table>`;
    return text;
  }
  rows_to_multi(rows,style){
    var ncols = rows.length && rows[0].length;
    var nrows = rows.length;
    var n = ncols;
    var w = (1 - (0.02 * (n - 1))) / n;
    var gap = 0.02;
    var frs = this.string_to_frs(style.fr,n);
    var d = [];
    for(let j=0; j < nrows; ++j){
      let pp = rows[j];
      pp = pp.slice(0,n);//no longer than ncols
      d.push('<tr>');
      pp.forEach((text, i) => {
        let fr = frs[i];
        d.push(`<td style='width:${fr*w*100}%'>`);
        d.push(text);
        d.push(`</td>`);
        if(i<n-1){
          d.push(`<td style='width:${gap*100}%'></td>`);
        }
      });
      d.push('</tr>');
    }
    var text = d.join('\n');
    var text = `<table border='0' style='width:100%'>${text}</table>`;
    return text;
  }
  itms_to_multi(itms,style){
    var n = parseInt(style.n)||1;
    var fr = style.fr||'';
    var border = style.border||0;
    var glue = this.glue_to_vspace(style.glue);
    //var w = (1 - (0.02 * (n - 1))) / n;
    //var gap = 0.02;
    if(border==1){
      var frs = this.string_to_frac(fr,n,0);
      var d = [];
      for(let j=0; j < itms.length; j+=n){
        let pp = itms.slice(j,j+n);///could be shorter than n
        d.push('<tr>');
        pp.forEach((text, i) => {
          let fr = frs[i];
          d.push(`<td style='padding:${glue}pt 0.5em;width:${fr*100}%'>`);
          d.push(text);
          d.push(`</td>`);
        });
        d.push('</tr>');
      }
      var text = d.join('\n');
      var text = `<table border='${border}' style='width:100%'>${text}</table>`;
    }else{
      var gap = 0.02;
      var frs = this.string_to_frac(fr, n, gap);
      var d = [];
      for (let j = 0; j < itms.length; j += n) {
        let pp = itms.slice(j, j + n);///could be shorter than n
        d.push('<tr>');
        pp.forEach((text, i) => {
          let fr = frs[i];
          d.push(`<td style='padding:${glue}pt 0;width:${fr * 100}%'>`);
          d.push(text);
          d.push(`</td>`);
          d.push(`<td style='width:${gap*100}%'></td>`);
        });
        if(pp.length){
          d.pop();
        }
        d.push('</tr>');
      }
      var text = d.join('\n');
      var text = `<table border='${border}' style='width:100%'>${text}</table>`;
    }
    return text;
  }
  _itms_to_multi(itms,style){
    var n = parseInt(style.n)||1;
    var fr = style.fr||'';
    var border = style.border||0;
    var w = (1 - (0.02 * (n - 1))) / n;
    var gap = 0.02;
    var frs = this.string_to_frs(fr,n);
    var d = [];
    for(let j=0; j < itms.length; j+=n){
      let pp = itms.slice(j,j+n);///could be shorter than n
      d.push('<tr>');
      pp.forEach((text, i) => {
        let fr = frs[i];
        d.push(`<td style='width:${fr*w*100}%'>`);
        d.push(text);
        d.push(`</td>`);
        if(i<n-1){
          d.push(`<td style='width:${gap*100}%'></td>`);
        }
      });
      d.push('</tr>');
    }
    var text = d.join('\n');
    var text = `<table border='${border}' style='width:100%'>${text}</table>`;
    return text;
  }
  cols_to_multi(cols){
    var n = cols.length;
    var w = (1 - (0.02 * (n - 1))) / n;
    var gap = 0.02;
    var d = [];
    cols.forEach((text, i) => {
      d.push(`<td style='width:${w*100}%'>`);
      d.push(text);
      d.push(`</td>`);
      if(i<n-1){
        d.push(`<td style='width:${gap*100}%'></td>`);
      }
    });
    var text = d.join('\n');
    var text = `<tr>${text}</tr>`;
    var text = `<table border='0' style='width:100%'>${text}</table>`;
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
      text = this.unmask(t,styleext);
      o.push(`<li>  <strong>${key}</strong>  ${text}</li>`);
    }
    return o.join('\n');
  }
  string_to_css_width(str){
    return str;
  }
  itms_to_itemized(itms,style){
    var n = parseInt(style.n)||1;
    if(itms.length && itms[0].bull=='OL'){
      let pp = itms.map(p => {
        if(p.type=='A'){
          return `<li class='PARA' type='A' value='${p.value}'>${p.text}</li>`;
        }
        if(p.type=='a'){
          return `<li class='PARA' type='a' value='${p.value}'>${p.text}</li>`;
        }
        if(typeof p.value == 'number'){
          return `<li class='PARA' value='${p.value}'>${p.text}</li>`  
        }
        return `<li class='PARA'>${p.text}</li>`
      });
      if (n && n > 1) {
        return this.pp_to_multi_itemized(pp, style, 'ol')
      }
      return `<ol class='PARA' style='margin:0'>${pp.join('\n')}</ol>`;
    }
    if (itms.length) {
      let pp = itms.map(p => `<li>${p.text}</li>`);
      if (n && n > 1) {
        return this.pp_to_multi_itemized(pp, style, 'ul')
      }
      return `<ul class='PARA' style='margin:0'>${pp.join('\n')}</ul>`;
    }
    return `<ul class='PARA' style='margin:0'><li></li></ul>`;
  }
  to_plst_ispacked(){
    return 0;
  }
  pp_to_multi_itemized(itms,style,name){
    var fr = style.fr||'';
    var n = style.n||1;
    var d = [];
    var m = Math.floor(itms.length / n);
    var z = itms.length - n * m;
    var k = z ? (m + 1) : (m);
    var w = (1 - (0.02 * (n - 1))) / n;
    var gap = 0.02;
    var frs = this.string_to_frs(fr, n);
    d.push(`<table border='0' style='width:100%'><tr>`);
    for (let j = 0,i=0; j < itms.length; i+=1,j+=k) {
      var pp = itms.slice(j, j + k);
      let fr = frs[i];
      d.push(`<td style='vertical-align:top;width:${fr*w*100}%'><${name} class='PARA' style='margin:0'>\n${pp.join('\n')}\n</${name}></td>`);
      if (i < n - 1) {
        d.push(`<td style='width:${gap * 100}%'></td>`);
      }
    }
    d.push(`</tr></table>`);
    return d.join('\n')
  }
  imgrid_to_htmltable(itms,style) {
    var frame = style.frame||0;
    var n = parseInt(style.n)||1;
    var d = [];
    var imgsrcs = [];
    var wd = (100 - 2*(n-1))/n;
    var span = `<span style='width:2%;display:inline-block;'></span>`;
    var itms = itms.map( img => {
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
    var mypp = itms.map( img => {
      var {src,imgsrc,imgid,sub} = img;
      var img_style = `width:${wd}%;`;
      if(frame){
        img_style += 'border:1px solid;';
      }
      var td_style = `text-align:center;vertical-align:bottom;width:${100/n}%;`;
      var img = `<img id='imgid${imgid}' style='${img_style}' src='${imgsrc}' alt='${src}'/>`;
      var sub_text = sub;
      var tdstyle = `display:inline-block;text-align:center;vertical-align:top;width:${wd}%;`;
      var sub = `<span style='${tdstyle}'>${sub_text}</span>`;
      return {img,sub};
    });
    while(mypp.length){
      var pp = mypp.slice(0,n);
      mypp = mypp.slice(n);
      var itms = pp.map(x => x.img);
      var subs = pp.map(x => x.sub);
      d.push(`${itms.join(span)}`);
      d.push(`${subs.join(span)}`);
    }
    var text = d.join('\n'); 
    var text = `<div style='white-space:pre'>${text}</div>`;
    return text;
  }
  itms_to_longtable(itms, style) {
    var fr = style.fr||'';
    var hline = style.hline||'';
    var glue = style.glue||'';
    var n = parseInt(style.n)||1;
    var floatname = floatname || '';
    var label = label || '';
    var caption = caption || '';
    var fr = fr || '';
    var glue = glue || '';
    var hline = hline || 0;
    var d = [];
    var w = (1 - (0.02 * (n - 1))) / n;
    var gap = 0.02;
    var frs = this.string_to_frs(fr, n);
    var hlines = this.string_to_array('t m b r');
    var vlines = this.string_to_array('*');
    var t = 1;
    var h = 6;
    frs = this.ww_to_hundred(frs);
    var d = [];
    var header = itms.slice(0, n);//pp could be shorter than n
    var header = header.map((x, i) => `<th style='text-align:left;vertical-align:top;\
padding:${t}pt ${h}pt;\
${'width:' + frs[i] + '%;'}\
${(vlines.indexOf(`${i}`) >= 0 || vlines.indexOf('*') >= 0) ? 'border-left:1px solid;' : ''}\
${(vlines.indexOf(`${i + 1}`) >= 0 || vlines.indexOf('*') >= 0) ? 'border-right:1px solid;' : ''}\
${hlines.indexOf('t') >= 0 ? 'border-top:1px solid;' : ''}\
${hlines.indexOf('m') >= 0 ? 'border-bottom:1px solid;' : ''} '>${x}</th>`);
    d.push(`<thead>`);
    d.push(`<tr>${header.join('')}</tr>`);
    d.push(`</thead>`);
    d.push(`<tbody>`);
    for (var k=0, j = n; j < itms.length; j+=n, k++) {
      var pp = itms.slice(j, j + n);//pp could be shorter than n
      var pp = pp.map((x, i) => `<td style='text-align:left;vertical-align:top;\
padding:${t}pt ${h}pt;\
${'width:' + frs[i] + '%;'}\
${(vlines.indexOf(`${i}`) >= 0 || vlines.indexOf('*') >= 0) ? 'border-left:1px solid;' : ''}\
${(vlines.indexOf(`${i + 1}`) >= 0 || vlines.indexOf('*') >= 0) ? 'border-right:1px solid;' : ''}\
${k == 0 && hlines.indexOf('m') >= 0 ? 'border-top:1px solid;' : ''}\
${k > 0 && hlines.indexOf('r') >= 0 ? 'border-top:1px solid;' : ''}\
${j+n >= itms.length && hlines.indexOf('b') >= 0 ? 'border-bottom:1px solid;' : ''} '>${x}</td>`);
      d.push(`<tr>${pp.join('')}</tr>`);
    }
    d.push(`</tbody>`);
    var text = d.join('\n');
    text = `<table border='0' style='border-collapse:collapse;width:100%;'>${text}</table>`;
    return text;
  } 
  itms_to_cols(itms,style) {
    var n = parseInt(style.n)||1;
    var n = n || 1;
    var m = Math.floor(itms.length / n);
    var z = itms.length - n * m;
    var k = z ? (m + 1) : (m);
    var cols = [];
    for (var j = 0; j < itms.length; j += k) {
      var pp = itms.slice(j, j + k);
      cols.push(pp);
    }
    var d = [];
    for (var j = 0; j < k; ++j) {
      var pp = cols.map(x => x[j] || '');
      pp = pp.map((x, i) => `<td>${x}</td>`);
      let gap = `<td style='width:1em'></td>`;
      var p = pp.join(gap);
      var p = `<tr>${p}</tr>`;
      d.push(p);
    }
    var text = d.join('\n');
    var text = `<table border='0'>${text}</table>`;
    return text;
  }
  itms_to_rows(itms,style) {
    var n = parseInt(style.n)||1;
    var n = n || 1;
    var rows = [];
    var k = 0;
    for (var j=0; j < itms.length; j++) {
      let p = itms[j];
      if(this.p_is_hline(p)){
        rows.push('-'.repeat(n).split(''));
        k = 0;
        continue;
      }
      if(k==0){
        rows.push([p]);
      }else{
        let pp = rows.pop();
        pp.push(p);
        rows.push(pp);
      }
      k++;
      k %= n;
    }
    var d = [];
    for (var j = 0; j < rows.length; ++j) {
      var pp = rows[j];
      if (this.pp_is_hline(pp)) {
        d.push(`<tr><td style='border-top:1px solid' colspan='${2*n-1}'></td></tr>`);
        continue;
      }
      pp = pp.map((x, i) => `<td>${x}</td>`);
      let gap = `<td style='width:1em'></td>`;
      var p = pp.join(gap);
      var p = `<tr>${p}</tr>`;
      d.push(p);
    }
    var text = d.join('\n');
    var text = `<table border='0'>${text}</table>`;
    return text;
  }
  string_to_html_length(s) {
    /// take an input string that is 100% and convert it to '\textwidth'.
    /// take an input string that is 50% and convert it to '0.5\textwidth'.
    /// take an input string that is 10cm and returns "10cm"
    if (!s) {
      return '';
    }
    var re = /^(.*)\%$/;
    if (re.test(s)) {
      return s;
    }
    var re = /^(.*)(mm|cm|in|pt)$/;
    if (re.test(s)) {
      return s;
    }
    var num = parseFloat(s);
    if (Number.isFinite(num)) {
      return `${num.toFixed(3)}mm`;
    }
    return '';
  }
  to_info(block){
    return `<span ${this.to_attr(block)}></span>`;
  }
  glue_to_vspace(glue){
    var glue = parseInt(glue) || 0;
    return glue;
  }
}

module.exports = { NitrilePreviewHtml };
