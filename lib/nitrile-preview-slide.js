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
  do_part(block) {
  }
  do_hdgs(block) {
    var {id,row1,row2,sig,hdgn,subn,name,text,idnum,parser} = block;
    var o = [];
    var text = this.unmask(text);
    idnum=idnum||'';
    if(hdgn==0){
      o.push('');
      o.push(`<h1 ${this.to_attr(block)} >${idnum} ${text}</h1>`);
      block.html = o.join('\n');
    }
    else if(hdgn==1){
      idnum = idnum||'';
      if(this.frames==1){
        o.push(`</div>`);
      }
      o.push('');
      o.push(`<div class='slide'>`);
      o.push(`<h2 ${this.to_attr(block)} >${idnum} ${text}</h2>`);
      this.frames = 1;
      block.html = o.join('\n');
    }
  }
  to_slide_document() {
    var htmlines = this.parser.blocks.map(x => x.html);
    var mytitle = this.conf('general.title');
    var myauthor = this.conf('general.author');
    mytitle = this.unmask(mytitle);
    myauthor = this.unmask(myauthor);
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

</script>
</head>
<body>
<title>${mytitle}</title>
<h1>${mytitle}</h1>
<address>${myauthor}</address>
<nav style='${this.to_nav_style()}'>
</nav>
<main style='${this.to_page_style()}'>
${htmlines.join('\n')}
${this.ending}
</main>
<div style='display:static'>
<button onclick='prevslide()'>&#x25C2; prev</button>
<button onclick='nextslide()'>next &#x25B8;</button>
</div>
</body>
</html>
`;
    return data;
  }
}
module.exports = { NitrilePreviewSlide };
