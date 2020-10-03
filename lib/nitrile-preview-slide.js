'use babel';

const { NitrilePreviewHtml } = require('./nitrile-preview-html');

class NitrilePreviewSlide extends NitrilePreviewHtml {

  constructor(parser) {
    super(parser);
    this.frames = 0;
    this.ending = '';
  }
  do_starttranslate(){
    super.do_starttranslate();
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
  to_plst_ispacked(){
    return 1;
  }
  to_slide_document() {
    //var htmlines = this.parser.blocks.map(x => x.html);
    var tops = this.to_tops(this.parser.blocks);
    var display = 'none';
    var margintop = '0';
    var marginbottom = '0';
    var fontsize = this.conf('slide.font-size','12pt');
    if(1){
      var the_slides = [];
      var html = this.to_html(tops,the_slides);
      var display = 'block';
      var margintop = '1em';
      var marginbottom = '1em';
    }else{
      var the_slides = [];
      var html = this.to_html(tops,the_slides);
      var popups = this.to_html_popups(the_slides);
    }
    var data = `\
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${this.unmask(this.conf('title'))}</title>
<style>

  @media print {
    section {page-break-after: always;}
  }

  table {
    border-collapse:collapse;
  }

  .slide {
    font-family:${this.conf('slide.font-family')};
    font-size:${fontsize};
    display: ${display};
    margin-top: ${margintop};
    margin-bottom: ${marginbottom};
    border:3px solid;
    padding:10px 10px 10px 24px;
    min-width:128mm;
    max-width:128mm;
    min-height:96mm;
  }

  .slide.active {
    display: block;
  }

  .slide .frametitle {
    margin-left:-14px;
    margin-top:0;
    margin-bottom:0.5em;
    font-size:1.2em;
  }

  .slide .framebody {
    margin-left:1em;
  }

  .slide ul {
    padding-left: 28px;
  }

  .slide ol {
    padding-left: 28px;
  }

  .slide blockquote {
    margin-left: 20px;
    margin-right: 0;
  }

  .slide ul.PLST.TOP {
    list-style: none;
    position: relative;
    padding-left: 28px;
  }

  .slide ol.PLST.TOP {
    padding-left: 28px;
  }

  .slide ul.PLST.TOP > li:before {
    content: "\\25BA";
    position: absolute;
    display: inline-block;
    right: 100%;
    transform: translate(21px,0);
  }

  .slide ul.PLST.TOP > li {
    margin: 0.3em 0;
  }

  .slide ol.PLST.TOP > li {
    margin: 0.3em 0;
  }

  .slide dl.PLST.TOP > dt {
    margin-top: 0.3em;
    margin-bottom: 0.3em;
  }

  .slide p,ul,ol,dl,blockquote,figure {
    margin-top: 0.3em;
    margin-bottom: 0.3em;
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
<main>
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
  to_html_popups(the_slides){
    let d = [];
    the_slides.forEach(({id,idnum,title},i) => {
      d.push(`<option value='slide${id}'>${idnum} ${title}</option>`);
    });
    return d.join('\n');
  }
  to_html(tops,the_slides){
    let d = [];
    tops.forEach((o,i) => {
      if(Array.isArray(o)){
        let data = this.to_html_frame(o,the_slides);
        d.push(data);
      }
      if(o.sig=='FRNT'){
        let data = this.to_frontmatter_frame(o,the_slides);
        d.push(data);
      }
    });
    return d.join('\n');
  }
  to_html_frame(tops,the_slides){
    let my = tops.shift();
    my.idnum = my.idnum||'';
    let d = [];
    let w = [];
    let all = [];
    let mid = my.idnum;
    let mtitle = this.unmask(my.title);
    //d.push(`<h2 class='frametitle'>${mid} ${mtitle}</h2>`);
    tops.forEach((o,i) => {
      if(Array.isArray(o)){
        var data = this.to_html_solution(o);
        w.push(data);
      }else{
        d.push(o.html);
      }
    });
    if(d.length==0){
      ///multiple choices
      ///main-slide
      all.push(`<section id='slide${mid}' class='slide'>`);
      all.push(`<h2 class='frametitle'>${mid} ${mtitle}</h2>`);
      all.push(`<p class='TEXT'>`);
      w.forEach(({title,body},i) => {
        all.push(`<div>`);
        all.push(`&#x2610; ${title}`);
        all.push(`</div>`);
      });
      all.push(`</p>`);
      all.push(`</section>`);
      all.push('');
      the_slides.push({id:mid,idnum:my.idnum,title:mtitle});
      ///child-slides
      w.forEach(({title,body},i) => {
        let sid = `${mid}-${i}`;
        let stitle = `${mtitle} (${title})`;
        all.push(`<section id='slide${sid}' class='slide'>`);
        all.push(`<h2 class='frametitle'>${mid} ${stitle}</h2>`);
        all.push(d.join('\n'));
        all.push(`<p class='TEXT'>`);
        all.push(`&#x2611; ${title}`);
        all.push(`</p>`);
        all.push(body.join('\n'));
        all.push('</section>');
        all.push('');
        the_slides.push({id:sid,idnum:my.idnum,title:stitle});
      })
    }else{
      ///multiple solutions
      ///main-slide
      all.push(`<section id='slide${mid}' class='slide'>`);
      all.push(`<h2 class='frametitle'>${mid} ${mtitle}</h2>`);
      all.push(d.join('\n'));///main-slide body text
      all.push(`<p class='TEXT'>`);
      w.forEach(({ title, body }, i) => {
        all.push(`<div>`);
        all.push(`&#x2610; ${title}`);
        all.push(`</div>`);
      });
      all.push(`</p>`);
      all.push('</section>');
      all.push('');
      the_slides.push({id:mid,idnum:my.idnum,title:mtitle});
      ///child-slides
      w.forEach(({title,body},i) => {
        let sid = `${mid}-${i}`;
        let stitle = `${mtitle} (${title})`;
        all.push(`<section id='slide${sid}' class='slide'>`);
        all.push(`<h2 class='frametitle'>${mid} ${stitle}</h2>`);
        all.push(d.join('\n'));///main-slide body text
        all.push(`<p class='TEXT'>`);
        all.push(`&#x2611; ${title}`);
        all.push(`</p>`);
        all.push(body.join('\n'));
        all.push('</section>');
        all.push('');
        the_slides.push({id:sid,idnum:my.idnum,title:stitle});
      });
    }
    return all.join('\n');
  }
  to_html_solution(tops) {
    let my = tops.shift();
    let body = [];
    //let title = `${this.unmask(my.title)} <button onclick="document.getElementById('${my.idnum}').hidden^=true">&#x2026;</button>`;
    let title = `${this.unmask(my.title)}`;
    tops.forEach(o => {
      body.push(o.html);
    });
    return { title, body };
  }
  _to_html_frame_interactive(tops){
    let my = tops.shift();
    my.idnum = my.idnum||'';
    let d = [];
    let w = [];
    let all = [];
    d.push(`<h2 class='frametitle'>${my.idnum} ${this.unmask(my.title)}</h2>`);
    tops.forEach((o,i) => {
      if(Array.isArray(o)){
        var data = this.to_html_solution(o);
        w.push(data);
      }else{
        d.push(o.html);
      }
    });
    if(d.length==1){
      ///multiple choices
      all.push(`<div id='slide${my.idnum}' class='slide'>`);
      all.push(d.join('\n'));
      all.push(`<ul>`);
      w.forEach(({title,body},i) => {
        all.push(`<li>`);
        all.push(title);
        all.push(body.join('\n'));
        all.push(`</li>`);
      });
      all.push(`</ul>`);
      all.push(`</div>`);
      all.push('');
    }else{
      ///multiple solutions
      all.push(`<div id='slide${my.idnum}' class='slide'>`);
      all.push(d.join('\n'));
      w.forEach(({ title, body }, i) => {
        all.push(`<div>${title}</div>`);
        all.push(body.join('\n'));
      });
      all.push(`</div>`);
      all.push('');
    }
    return all.join('\n');
  }
  _to_html_solution_interactive(tops){
    let my = tops.shift();
    let d = [];
    //let title = `${this.unmask(my.title)} <button onclick="document.getElementById('${my.idnum}').hidden^=true">&#x2026;</button>`;
    let title = ` <button shown='false' onclick="document.getElementById('${my.idnum}').hidden^=true, this.shown^=true, this.innerHTML=this.shown?'&#x25BE;':'&#x25B8;'">&#x25B8;</button> ${this.unmask(my.title)}`;
    d.push(`<div hidden='true' id='${my.idnum}'>`);
    tops.forEach(o => {
      d.push(o.html);
    });
    d.push(`</div>`);
    let body = d;
    return {title,body};
  }
  to_frontmatter_frame(block,the_slides){
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
    let data = `<section id='frontmatter' class='slide'>
    <p style='text-align:center;font-weight:bold;font-size:1.5em'>${this.unmask(title)}</p>
    <p style='text-align:center'>${this.unmask(subtitle)}</p>
    <p style='text-align:center'>${this.unmask(author)}</p>
    <p style='text-align:center;font-variant:small-caps'>${this.unmask(institute)}</p>
    </section>
    `;
    the_slides.push({id:'frontmatter',idnum:'',title:'Intro'});
    return data;
  }
}
module.exports = { NitrilePreviewSlide };
