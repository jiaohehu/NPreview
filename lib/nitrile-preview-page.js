'use babel';

const { NitrilePreviewHtml } = require('./nitrile-preview-html');

class NitrilePreviewPage extends NitrilePreviewHtml {

  constructor(parser) {
    super(parser);
    this.pagecount = 0;
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
    var { sig, hdgn } = block;
    /// generate css ID
    A.id++;
    block.id = A.id;
    let id = block.id;
    /// generate 'idnum'
    if (sig == 'PART') {
      A.parts++;
      let idnum = A.parts;
      block.style.idnum = idnum;
    }else if (sig == 'HDGS') {
      let idnum;
      if (hdgn == 0) {
        A.chapters++;
        A.sections = 0;
        A.subsections = 0;
        A.subsubsections = 0;
        A.floats.clear();
        idnum = `${A.chapters}`;
      } else if (hdgn == 1) {
        A.sections++;
        A.subsections = 0;
        A.subsubsections = 0;
        idnum = `${A.sections}`;
      } else if (hdgn == 2) {
        A.subsections++;
        A.subsubsections = 0;
        idnum = `${A.sections}.${A.subsections}`;
      } else {
        A.subsubsections++;
        idnum = `${A.sections}.${A.subsections}.${A.subsubsections}`;
      }
      let chnum = A.chapters;
      let partnum = A.parts;
      block.style.idnum = idnum;
      block.style.chnum = chnum;
      block.style.partnum = partnum;
      this.ref_map.set(block.style.label,{id,idnum,chnum});
    } else if (block && block.style && block.style.floatname) {
      if (!A.floats.has(block.style.floatname)) {
        A.floats.set(block.style.floatname, 0);
      }
      let idtext = block.style.floatname;
      let partnum = A.parts;
      let chnum = A.chapters;
      let idnum = A.floats.get(block.style.floatname);
      idnum += 1;
      A.floats.set(block.style.floatname, idnum);
      block.style.idnum = idnum;
      block.style.idtext = idtext;
      block.style.chnum = chnum;
      block.style.partnum = partnum;
      this.ref_map.set(block.style.label,{id,idnum,chnum,idtext});
    } else {
      let partnum = A.parts;
      let chnum = A.chapters;
      if(block.style){
        block.style.chnum = chnum;
        block.style.partnum = partnum;
      }
    }
  }
  to_plst_ispacked(){
    return 1;
  }
  to_page_document() {
    ///do translate
    this.ref_map.clear();
    let A = {};
    this.parser.blocks.forEach(block => {
      this.do_identify(block,A);
    })
    this.parser.blocks.forEach(block => {
      switch (block.sig) {
        case 'PART': this.do_PART(block); break;
        case 'HDGS': this.do_HDGS(block); break;
        case 'SAMP': this.do_SAMP(block); break;
        case 'PRIM': this.do_PRIM(block); break;
        case 'TEXT': this.do_TEXT(block); break;
        case 'PLST': this.do_PLST(block); break;
        case 'HRLE': this.do_HRLE(block); break;
        case 'FLOA': this.do_FLOA(block); break;
        default: break;
      }
    });
    //putting them together
    var the_pages = [];
    var top = this.to_top(this.parser.blocks);
    var html = this.to_html_top(top,the_pages);
    var display = 'none';
    var margintop = '0';
    var marginbottom = '0';
    var fontfamily = this.conf('page.font-family','sans-serif');
    var fontsize = this.conf('page.font-size','12pt');
    var display = 'block';
    var margintop = '1em';
    var marginbottom = '1em';
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

  .page {
    font-family:${fontfamily};
    font-size:${fontsize};
    display: ${display};
    margin-top: ${margintop};
    margin-bottom: ${marginbottom};
    border:3px solid;
    padding:1in 1in 1in 1in;
    min-width:8.5in;
    max-width:8.5in;
    min-height:96mm;
    box-sizing: border-box;
  }

  .page.active {
    display: block;
  }

  .page .frametitle {
    margin-left:-14px;
    margin-top:0;
    margin-bottom:0.5em;
    font-size:1.2em;
  }

  .page .framebody {
    margin-left:1em;
  }

  .page ul {
    padding-left: 28px;
  }

  .page ol {
    padding-left: 28px;
  }

  .page blockquote {
    margin-left: 20px;
    margin-right: 0;
  }

  .page ul.PLST {
    padding-left: 28px;
  }

  .page ol.PLST {
    padding-left: 28px;
  }

  .page ul.PLST > li {
    margin: 0.5em 0;
  }

  .page ol.PLST.TOP > li {
    margin: 0.5em 0;
  }

  .page dl.PLST.TOP > dt {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }

  .page p,ul,ol,dl,blockquote,figure {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }

</style>
</head>
<body>
<main>
${html}
</main>
</body>
</html>
`;
    return data;
  }
  to_top(blocks){
    var top = [];
    var o = null;
    var pagecount=0;
    for(let block of blocks){
      let {sig,hdgn} = block;
      if(sig=='FRNT'){
        ///ignore for now
        continue;
      }
      if(sig=='PART'){
        ///ignore for now
        continue;
      }
      if(sig=='HDGS' && hdgn==0){
        pagecount++;
        o = [];
        top.push(o);
        o.push(block);
        continue;
      }
      if(o){
        o.push(block);
      }else{
        top.push(block);
      }
    }
    this.pagecount = pagecount;
    return top;
  } 
  to_html_top(top,the_pages){
    let d = [];
    if(this.pagecount){
      top.forEach((o,i) => {
        if(Array.isArray(o)){
          let data = this.to_html_page(o,the_pages,1);
          d.push(data);
        }
      });
    }else{
      ///treat the entire top as a single page
      let data = this.to_html_page(top,the_pages,0)
      d.push(data);
    }
    return d.join('\n');
  }
  to_html_page(top,the_pages,hastitle){
    let rid = '';
    let rtitle = '';
    if(hastitle){
      let my = top.shift();
      let idnum = my.style.idnum||'';
      rid = idnum;
      rtitle = this.unmask(my.title);
    }
    let all = [];
    all.push(`<section id='page${rid}' class='page'>`);
    all.push(`<h2 class='pagetitle'>${rid} ${rtitle}</h2>`);
    all.push(`${top.map(x=>x.html).join('\n')}`);
    all.push(`</section>`);  
    the_pages.push({id:rid,title:rtitle});
    return all.join('\n');
  }
  to_frontmatter_frame(block,the_pages){
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
    the_pages.push({id:'frontmatter',idnum:'',title:'Intro'});
    return data;
  }
}
module.exports = { NitrilePreviewPage };
