'use babel';

const JSZip = require('jszip');
const path = require('path');
const utils = require('./nitrile-preview-utils');

class NitrilePreviewEpub {
 
  constructor () {

    this.zip = new JSZip();
    this.sections = [];
    this.toc = '';
    this.contents = [];
    this.images = [];
    this.title = '';
    this.author = '';
  }

  async generateAsync (title,author,htmls,chaps,imageidmap,imagemap,isarticle,dirname) {

    /// add the entire HTML, this will
    /// be scanned and break down into separate files
    /// based on the chapters.

    this.title = title;
    this.author = author;

console.log(htmls);
console.log(chaps);

    /// add titlepage.xhtml to this.contents

    this.contents.push(['titlepage','titlepage.xhtml','application/xhtml+xml',`\
<p style='font-size:175%; text-align:center; margin:1em 0; ' >${this.title}</p>
<p style='font-size:125%; text-align:center; margin:1em 0; ' >${this.author}</p>
`]);

    /// add PNG files to this.images 

    var it = imageidmap.keys();
    var item = it.next();
    while (!item.done) {
      var src = item.value;
      var imgid = imageidmap.get(src);
console.log('src='+src);
console.log('imgid='+imgid);
      if (imagemap.has(imgid)) {
        var imgbuff = imagemap.get(imgid);
      } else {
        var fsrc = (path.join(dirname,src));
        console.log(`loading image from HD: ${fsrc}`);
        var imgbuff = await utils.readImageFileAsync(fsrc);
      }
      this.images.push([`image${imgid}`,src,'image/png',imgbuff]);
      item = it.next();
    }
      
    /// genenerate contents

    if (isarticle) {

      /// built this.toc  

      var sections = [];
      for (var i=0; i < chaps.length; ++i) {
        let chap = chaps[i];
        let [heading,id,text,pos] = chap;
        if (heading === 'SECTION') {
          sections.push([id,text]);
        }
      }
      this.contents.push(['content','content.xhtml','application/xhtml+xml',htmls.join('\n')]);
      this.toc = sections.map(x => `<li><a href='content.xhtml#${x[0]}'>${x[1]}</a></li>`).join('\n');
      this.toc = `<ol style='list-style-type:none;' epub:type='list'> ${this.toc} </ol>`;
    } else {

      /// for BOOK contents, we need to split each chapter into its own file, and also 
      /// each PART into its own file as well.

      var parts_count = 0;
      var chapters_count = 0;
      var chapters = [];
      var tocs = [];
      for (let i=1; i < chaps.length; ++i) {
        let i0 = i-1;
        let i1 = i;
        let chap0 = chaps[i0];
        let chap1 = chaps[i1];
        let [heading0,id0,text0,pos0] = chap0;
        let [heading1,id1,text1,pos1] = chap1;
        this.contents.push([`content${i0}`,`content${i0}.xhtml`,'application/xhtml+xml',htmls.slice(pos0,pos1).join('\n')]);
        tocs.push([i0,text0]);
      }
      /// the last one
      let i0 = chaps.length-1;
      let chap0 = chaps[i0];
      let [heading0,id0,text0,pos0] = chap0;
      this.contents.push([`content${i0}`,`content${i0}.xhtml`,'application/xhtml+xml',htmls.slice(pos0).join('\n')]);
      tocs.push([i0,text0]);

      /// now construct the this.toc 
      this.toc = tocs.map(x => `<li><a href='content${x[0]}.xhtml'>${x[1]}</a></li>`).join('\n');
      this.toc = `<ol style='list-style-type:none;' epub:type='list'> ${this.toc} </ol>`;
    }
    
    /// generate META-INF/container.xml

    this.zip.file('META-INF/container.xml',`\
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

    this.zip.file('mimetype',`\
application/epub+zip
`);

    /// generate toc.xhtml
    this.zip.file('toc.xhtml',`\
<?xml version='1.0' encoding='UTF-8'?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>
<head>
<meta http-equiv='default-style' content='text/html' charset='utf-8'/>
<link href='style.css' rel='stylesheet' type='text/css'/>
</head>
<body>
<nav epub:type='toc'>
<h1>Contents</h1>
${this.toc}
</nav>
</body>
</html>
`);

    /// add content*.xhtml files to zip

    for (var content of this.contents) {
      let [id,href,mediatype,data] = content;
      this.zip.file(href,`\
<?xml version='1.0' encoding='UTF-8'?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>
<head>
<meta http-equiv='default-style' content='text/html' charset='utf-8'/>
<link href='style.css' rel='stylesheet' type='text/css'/>
</head>
<body>
${data}
</body>
</html>
`);
    }


    /// add all image*.png files to zip

    for (var image of this.images) {
      let [id,href,mediatype,imgdata] = image;
      this.zip.file(href,imgdata);
    }

    /// generate style.css

    this.zip.file('style.css','');

    /// generate a unique id to be set for 'pub-id'

    let uniqueId = Math.random().toString(36).substring(2) + Date.now().toString(36);

    /// generate package.opf

    this.zip.file('package.opf',`\
<?xml version='1.0' encoding='UTF-8'?>
<package xmlns='http://www.idpf.org/2007/opf' version='3.0' xml:lang='en' unique-identifier='pub-id'>
<metadata xmlns:dc='http://purl.org/dc/elements/1.1/'>
<dc:identifier id='pub-id'>${uniqueId}</dc:identifier>
<dc:language>en</dc:language>
<dc:title id='title'>${this.title}</dc:title>
<dc:subject> </dc:subject>
<dc:creator>${this.author}</dc:creator>
</metadata>
<manifest>
<item id='toc' properties='nav' href='toc.xhtml' media-type='application/xhtml+xml'/>
<item id='stylesheet' href='style.css' media-type='text/css'/>
${this.contents.map(x => `<item id='${x[0]}' href='${x[1]}' media-type='${x[2]}' />`).join('\n')}
${this.images.map(x => `<item id='${x[0]}' href='${x[1]}' media-type='${x[2]}' />`).join('\n')}
</manifest>
<spine>
${this.contents.map(x => `<itemref idref='${x[0]}' />`).join('\n')}
</spine>
</package>
`);

    return await this.zip.generateAsync({type: 'nodebuffer'});
  }

}

module.exports = { NitrilePreviewEpub };
