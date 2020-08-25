'use babel';

const { NitrilePreviewHtml } = require('./nitrile-preview-html');

class NitrilePreviewSlide extends NitrilePreviewHtml {

  constructor(parser) {
    super(parser);
    this.frames = 0;
    this.ending = '';
  }
  do_starttranslate(){
  }
  do_endtranslate(){
    if(this.frames){
      var o = [];
      o.push(`</div>`);
      this.ending = o.join('\n');
    }
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
  to_slide_document() {
    //var htmlines = this.parser.blocks.map(x => x.html);
    var tops = this.to_tops(this.parser.blocks);
    var popups = this.to_html_popups(tops);
    var html = this.to_html(tops);
    var data = `\
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>

  .slide {
    display: none;
    border:1px solid;
    min-width:5in;
    min-height:3.78in;
  }

  .slide.active {
    display: block;
  }

</style>
<script>

var slides = []; 
var popup = null;
var index = 0;
window.addEventListener('load', function () {

  slides = document.querySelectorAll('.slide'); // Get an array of slides
  popup = document.querySelector('select#popup');  

  slides[index].classList.add('active');  
    
});

var nextslide = () => {
  if(slides.length){
    slides[index].classList.remove('active');
    
    //Go over each slide incrementing the index
    index++;
    
    // If you go over all slides, restart the index to show the first slide and start again
    if (index >= slides.length) index = slides.length-1; 
    
    slides[index].classList.add('active');
    popup.selectedIndex = index;
  }
};

var prevslide = () => {
  if(slides.length){
    slides[index].classList.remove('active');
    
    //Go over each slide incrementing the index
    index--;
    
    // If you go over all slides, restart the index to show the first slide and start again
    if (index < 0) index = 0;  
    
    slides[index].classList.add('active');
    popup.selectedIndex = index;
  }
};

var popupslide = (val) => {
  var slide = document.querySelector('#'+val+'.slide');
  if(slide && slides.length){
    slides[index].classList.remove('active');
  
    for(let i=0; slide && i < slides.length; ++i){
      let one = slides[i];
      if(one === slide){
        index = i;
        break;
      }   
    }   
    slides[index].classList.add('active');
  }
};

</script>
</head>
<body>
<main style='${this.to_page_style()}'>
${html}
</main>
<div style='display:static'>
<button onclick='prevslide()'>&#x25C2; prev</button>
<button onclick='nextslide()'>next &#x25B8;</button>
<select id='popup' onchange='popupslide(this.value)'>
${popups}
</select>
</div>
</body>
</html>
`;
    return data;
  }
  to_tops(blocks){
    var tops = [];
    var o = null;
    for(let block of blocks){
      let {sig,hdgn} = block;
      if(sig=='FRNT'){
        tops.push(block);
        continue;
      }
      if(sig=='HDGS' && hdgn==1){
        o = [];
        tops.push(o);
        o.push(block);
        continue;
      }
      if(o){
        o.push(block);
      }
    }
    tops = tops.map( o => {
      if(Array.isArray(o)){
        o = this.to_solutions(o);        
      }
      return o;
    })
    return tops;
  } 
  to_solutions(blocks){
    var tops = [];
    var o = tops;
    for(let block of blocks){
      let {sig,hdgn} = block;
      if(sig=='HDGS' && hdgn==2){
        o = [];
        tops.push(o);
        o.push(block);
        continue;
      }
      o.push(block);
    }
    return tops;
  }
  to_html_popups(tops){
    let d = [];
    tops.forEach((o,i) => {
      if(Array.isArray(o)){
        let t = o[0];
        let idnum = t.idnum||'';
        d.push(`<option value='slide${idnum}'>${idnum} ${this.unmask(t.text)}</option>`);
      }
      if(o.sig=='FRNT'){
        d.push(`<option value='frontmatter'>Intro</option>`);
      }
    });
    return d.join('\n');
  }
  to_html(tops){
    let d = [];
    tops.forEach((o,i) => {
      if(Array.isArray(o)){
        let data = this.to_html_frame(o);
        d.push(data);
      }
      if(o.sig=='FRNT'){
        let data = this.to_frontmatter(o);
        d.push(data);
      }
    });
    return d.join('\n');
  }
  to_html_frame(tops){
    let my = tops.shift();
    my.idnum = my.idnum||'';
    let d = [];
    d.push(`<div id='slide${my.idnum}' class='slide'>`);
    d.push(my.html);
    tops.forEach((o,i) => {
      if(Array.isArray(o)){
        var data = this.to_html_solution(o);
        d.push(data);
      }else{
        d.push(o.html);
      }
    });
    d.push(`</div>`);
    return d.join('\n');
  }
  to_html_solution(tops){
    let my = tops.shift();
    let d = [];
    d.push(`<button style='display:block' onclick="document.getElementById('${my.idnum}').hidden^=true">${this.unmask(my.text)}</button>`);
    d.push(`<div hidden='true' id='${my.idnum}'>`);
    tops.forEach(o => {
      d.push(o.html);
    });
    d.push(`</div>`);
    return d.join('\n');
  }
  to_frontmatter(block){
    let title = '';
    let subtitle = '';
    let institute = '';
    let author = '';
    if(block && block.sig=='FRNT'){
      for(let t of block.data){
        let [key,val] = t;
        if(key=='title'){
          title = val;
        }
        if(key=='subtitle'){
          subtitle = val;
        }
        if(key=='author'){
          author = val;
        }
        if(key=='institute'){
          institute = val;
        }
      }
    }
    let data = `<div id='frontmatter' class='slide'>
    <h2 style='text-align:center'>${this.unmask(title)}</h2>
    <p style='text-align:center'>${this.unmask(subtitle)}</p>
    <p style='text-align:center'>${this.unmask(author)}</p>
    <p style='text-align:center;font-style=SmallCap'>${this.unmask(institute)}</p>
    </div>
    `
    return data;
  }
}
module.exports = { NitrilePreviewSlide };