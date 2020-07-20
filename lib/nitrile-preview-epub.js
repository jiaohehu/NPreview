'use babel';

const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const utils = require('./nitrile-preview-utils');
const JSZip = require('jszip');
const path = require('path');

class NitrilePreviewEpub extends NitrilePreviewHtml {

  constructor() {
    super('EPUB');
    this.isepub = 1;
  }

  async to_epub_document_async () {

    var this_zip = new JSZip();
    var this_toc = '';
    var this_contents = [];
    var this_images = [];

    var blocks = this.xblocks;
    var config = this.xconfig;
    var stylesheet = [];

    var mytitle = this.xconfig.title;
    var myauthor = this.xconfig.author;

    ///get the stylesheet from 'css' property
    stylesheet = this.xconfig.css;

    /// create an unique image map
    var imgid = 0;
    var imageidmap = new Map();
    this.imgs.forEach(src => {
      imageidmap.set(src,imgid++);
      console.log(src);
    });
  
    /// add the entire HTML, this will
    /// be scanned and break down into separate files
    /// based on the chapters.

    /// add titlepage.xhtml to this_contents
    if(mytitle){
      var htmls = [];
      htmls.push(`<p style='font-size:175%; text-align:center; margin:1em 0; ' >${mytitle}</p>`);
      htmls.push(`<p style='font-size:125%; text-align:center; margin:1em 0; ' >${myauthor}</p>`);
      this_contents.push(['titlepage','titlepage.xhtml','application/xhtml+xml',htmls]);
      /// Add PNG files to 'this_images'...
    }

    var imagemap = new Map();///TODO: need to remove it later
    var it = imageidmap.keys();
    var item = it.next();
    while (!item.done) {
      var src = item.value;
      var imgid = imageidmap.get(src);
      if (imagemap.has(src)) {
        var [imgbuff,mime] = imagemap.get(src);
      } else {
        //var fsrc = (path.join(dirname,src));
        var fsrc = src;
        try {
          var [imgbuff,mime] = await utils.readImageFileAsync(fsrc);
        } catch (e) {
          console.log(e.toString());
          var imgbuff = Buffer.alloc(0);
          mime = '';
        }
      }
      this_images.push([`image${imgid}`,src,mime,imgbuff]);
      item = it.next();
    }

    var toptocs = [];
    var tocs = toptocs;
    var saveas_p = '';
    var htmls = [];
    var content_p = [];
    /// iterates through all chapters (or parts)
    for (var block of blocks) {
      let {saveas,sig,hdgn,dept,name,level,title,refid,html} = block;
console.log('sig=',sig,'hdgn=',hdgn,'dept=',dept,'name=',name,'level=',level,'title=',title,'saveas=',saveas,'html=',html);
      title = this.escape(title);
      if (saveas && saveas.localeCompare(saveas_p)!==0) {
        saveas_p = saveas;
        htmls = [];
        htmls.push(html);
        content_p = [`${refid}`,`${saveas}`,'application/xhtml+xml',htmls];
        this_contents.push(content_p);
        if (sig=='HDGS') {
          if(name=='part') {
            title = `Part ${dept} ${title}`;
            tocs = [];
            toptocs.push(tocs);
            tocs.push({saveas,title});
          } else {
            title = `${dept} ${title}`;
            tocs.push({saveas,title});
          }
        } 
      } else {
        htmls.push(html);
      }
    }

    ///NEED to take care of the case there there are no chapters
    if (this_contents.length === 0) {
      this_contents.push([`content0`, `content0.xhtml`, 'application/xhtml+xml', htmls]);
      ///NOTE: no 'tocs' entries
    } 

    /// now construct the this_toc
    this_toc = this.build_toc(toptocs); 
console.log(this_toc);
  
    /// generate META-INF/container.xml

    this_zip.file('META-INF/container.xml',`\
<?xml version='1.0' encoding='utf-8'?>
<container xmlns='urn:oasis:names:tc:opendocument:xmlns:container'
version='1.0'>
<rootfiles>
<rootfile full-path='package.opf'
media-type='application/oebps-package+xml'/>
</rootfiles>
</container>
`);

    /// generate 'mimetype' file

    this_zip.file('mimetype',`\
application/epub+zip
`);

    /// generate toc.xhtml
    this_zip.file('toc.xhtml',`\
<?xml version='1.0' encoding='UTF-8'?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>
<head>
<meta http-equiv='default-style' content='text/html' charset='utf-8'/>
<link href='style.css' rel='stylesheet' type='text/css'/>
</head>
<body>
<nav epub:type='toc'>
<h1>Contents</h1>
${this_toc}
</nav>
</body>
</html>
`);

    /// add content*.xhtml files to zip

    for (var content of this_contents) {
      var [id,href,mediatype,htmls] = content;
      this_zip.file(href,`\
<?xml version='1.0' encoding='UTF-8'?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>
<head>
<meta http-equiv='default-style' content='text/html' charset='utf-8'/>
<link href='style.css' rel='stylesheet' type='text/css'/>
</head>
<body>
${htmls.join('\n')}
</body>
</html>
`);
    }


    /// add all image*.png files to zip

    for (var image of this_images) {
      let [id,href,mediatype,imgdata] = image;
      this_zip.file(href,imgdata);
    }

    /// generate style.css

    this_zip.file('style.css',stylesheet);
    console.log(stylesheet);

    /// generate a unique id to be set for 'pub-id'

    let uniqueId = Math.random().toString(36).substring(2) + Date.now().toString(36);

    /// generate package.opf

    this_zip.file('package.opf',`\
<?xml version='1.0' encoding='UTF-8'?>
<package xmlns='http://www.idpf.org/2007/opf' version='3.0' xml:lang='en' unique-identifier='pub-id'>
<metadata xmlns:dc='http://purl.org/dc/elements/1.1/'>
<dc:identifier id='pub-id'>${uniqueId}</dc:identifier>
<dc:language>en</dc:language>
<dc:title id='title'>${mytitle||'Untitled'}</dc:title>
<dc:subject> </dc:subject>
<dc:creator>${myauthor}</dc:creator>
</metadata>
<manifest>
<item id='toc' properties='nav' href='toc.xhtml' media-type='application/xhtml+xml'/>
<item id='stylesheet' href='style.css' media-type='text/css'/>
${this_contents.map(x => `<item id='${x[0]}' href='${x[1]}' media-type='${x[2]}' />`).join('\n')}
${this_images.map(x => `<item id='${x[0]}' href='${x[1]}' media-type='${x[2]}' />`).join('\n')}
</manifest>
<spine>
${this_contents.map(x => `<itemref idref='${x[0]}' />`).join('\n')}
</spine>
</package>
`);

    return await this_zip.generateAsync({type: 'nodebuffer'});
  }

  build_toc(tocs){
    tocs = tocs.map(x => {
      if(Array.isArray(x)){
        ///the first one is part, it needs to stay at the toplist
        var x0 = x.shift();
        var nl = this.build_toc(x);
        return `<li><a href='${x0.saveas}'>${x0.title}</a>${nl}</li>`;
      }
      return `<li><a href='${x.saveas}'>${x.title}</a></li>`;
    })
    tocs = tocs.join('\n');
    tocs = `<ol style='list-style-type:none;' epub:type='list'>\n ${tocs} \n</ol>`;
    return tocs;
  }

  svg_to_img(text){
    text = `<img alt='diagram' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(text)}" />`;
    return text;
  }

}

module.exports = { NitrilePreviewEpub };
