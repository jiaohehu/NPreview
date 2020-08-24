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
    var top = this.to_frames(this.parser.blocks);
    var popups = this.to_html_popups(top);
    var html = this.to_html(top);
    var frontmatter = this.to_frontmatter(this.parser.blocks[0]);
    var data = `\
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>

  .slide {
    display: none;
  }

  .slide.active {
    display: block;
  }

</style>
<script>

var slides = []; 
var index = 0;
window.addEventListener('load', function () {

  slides = document.querySelectorAll('.slide'); // Get an array of slides

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
${frontmatter}
${html}
</main>
<div style='display:static'>
<button onclick='prevslide()'>&#x25C2; prev</button>
<button onclick='nextslide()'>next &#x25B8;</button>
<select onchange='popupslide(this.value)'>
${popups}
</select>
</div>
</body>
</html>
`;
    return data;
  }
  to_frames(blocks){
    var top = [];
    var o = top;
    for(let block of blocks){
      let {sig,hdgn} = block;
      if(sig=='HDGS' && hdgn<=1){
        o = [];
        top.push(o);
        o.push(block);
        continue;
      }
      o.push(block);
    }
    top = top.map( o => {

      if(Array.isArray(o)){
        o = this.to_solutions(o);        
      }
      return o;
    })
    return top;
  } 
  to_solutions(blocks){
    var top = [];
    var o = top;
    for(let block of blocks){
      let {sig,hdgn} = block;
      if(sig=='HDGS' && hdgn==2){
        o = [];
        top.push(o);
        o.push(block);
        continue;
      }
      o.push(block);
    }
    return top;
  }
  to_html_popups(top){
    let d = [];
    top.forEach((o,i) => {
      if(Array.isArray(o)){
        let t = o[0];
        let idnum = t.idnum||'';
        d.push(`<option value='slide${idnum}'>${idnum} ${this.unmask(t.text)}</option>`);
      }
    });
    d.unshift(`<option value=''></option>`);
    return d.join('\n');
  }
  to_html(top){
    let d = [];
    top.forEach((o,i) => {
      if(Array.isArray(o)){
        let data = this.to_html_frame(o);
        d.push(data);
      }
    });
    return d.join('\n');
  }
  to_html_frame(top){
    let my = top.shift();
    my.idnum = my.idnum||'';
    let d = [];
    d.push(`<div id='slide${my.idnum}' class='slide'>`);
    d.push(my.html);
    top.forEach((o,i) => {
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
  to_html_solution(top){
    let my = top.shift();
    let d = [];
    d.push(`<button style='display:block' onclick="document.getElementById('${my.idnum}').hidden^=true">${this.unmask(my.text)}</button>`);
    d.push(`<div hidden='true' id='${my.idnum}'>`);
    top.forEach(o => {
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
    let data = `<div class='slide'>
    <h1 style='text-align:center'>${this.unmask(title)}</h1>
    <p style='text-align:center'>${this.unmask(subtitle)}</p>
    <p style='text-align:center'>${this.unmask(author)}</p>
    <p style='text-align:center;font-style=SmallCap'>${this.unmask(institute)}</p>
    </div>
    `
    return data;
  }
}
module.exports = { NitrilePreviewSlide };
