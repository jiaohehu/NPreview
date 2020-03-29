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

  async generateAsync (parser,title,author,blocks,imagemap,config,dirname) {

    var htmls = blocks.map(x => x.html);
    var imgsrcs = blocks.map(x => x.imgsrcs);

    /// filter out empty image srcs
    var imgsrcs = imgsrcs.filter(x => x&&x.length>0);

    /// create an unique image map
    var imgid = 0;
    var imageidmap = new Map();
    imgsrcs.forEach(x => {
      x.forEach(src => {
        imageidmap.set(src,imgid++);
      });
    });

    /// add the entire HTML, this will
    /// be scanned and break down into separate files
    /// based on the chapters.

    this.title = title;
    this.author = author;

///console.log(htmls);

    /// add titlepage.xhtml to this.contents
    var htmls = [];
    htmls.push(`<p style='font-size:175%; text-align:center; margin:1em 0; ' >${this.title}</p>`);
    htmls.push(`<p style='font-size:125%; text-align:center; margin:1em 0; ' >${this.author}</p>`);
    this.contents.push(['titlepage','titlepage.xhtml','application/xhtml+xml',htmls]);
    /// Add PNG files to 'this.images'...

    var it = imageidmap.keys();
    var item = it.next();
    while (!item.done) {
      var src = item.value;
      var imgid = imageidmap.get(src);
///console.log('src='+src);
///console.log('imgid='+imgid);
      if (imagemap.has(src)) {
        var [imgbuff,mime] = imagemap.get(src);
      } else {
        var fsrc = (path.join(dirname,src));
        ///console.log(`loading image from HD: ${fsrc}`);
        var [imgbuff,mime] = await utils.readImageFileAsync(fsrc);
      }
      this.images.push([`image${imgid}`,src,mime,imgbuff]);
      item = it.next();
    }

    var tocs = [];
    var saveas_p = '';
    var htmls = [];
    var content_p = [];
    /// iterates through all chapters (or parts)
    for (var block of blocks) {
      let {saveas,dept,title,refid,html} = block;
      if (saveas && saveas.localeCompare(saveas_p)!==0) {
        saveas_p = saveas;
        htmls = [];
        htmls.push(html);
        content_p = [`${refid}`,`${saveas}`,'application/xhtml+xml',htmls];
        this.contents.push(content_p);
        tocs.push([saveas,'',`${dept} ${title}`]);
      } else {
        htmls.push(html);
      }
    }

    ///NEED to take care of the case there there are no chapters
    if (this.contents.length === 0) {
      this.contents.push([`content0`, `content0.xhtml`, 'application/xhtml+xml', htmls]);
      ///NOTE: no 'tocs' entries
    } 

    /// now construct the this.toc
    this.toc = tocs.map(x => `<li><a href='${x[0]}'>${x[1]}${x[2]}</a></li>`).join('\n');
    this.toc = `<ol style='list-style-type:none;' epub:type='list'> ${this.toc} </ol>`;
  
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
      var [id,href,mediatype,htmls] = content;
      this.zip.file(href,`\
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

    for (var image of this.images) {
      let [id,href,mediatype,imgdata] = image;
      this.zip.file(href,imgdata);
    }

    /// generate style.css

    this.zip.file('style.css',parser.stylesheet);

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
