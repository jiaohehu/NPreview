'use babel';

const JSZip = require('jszip');

class NitrilePreviewEpub {
 
  constructor () {

    this.zip = new JSZip();
    this.sections = [];
    this.toc = '';
    this.contents = [];
    this.title = '';
    this.author = '';
  }

  setContents (title,author,htmls,chaps,isarticle) {

    /// add the entire HTML, this will
    /// be scanned and break down into separate files
    /// based on the chapters.

    this.title = title;
    this.author = author;

console.error(htmls);
console.error(chaps);

    /// generate the titlepage 
    this.contents.push(['titlepage','titlepage.xhtml','application/xhtml+xml',`\
<p style='font-size:175%; text-align:center; margin:1em 0; ' >${this.title}</p>
<p style='font-size:125%; text-align:center; margin:1em 0; ' >${this.author}</p>
`]);


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
    }
    
  }

  async generateAsync() {

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

    /// generate mimetype 

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

    /// generate all content*.xhtml files
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

    /// generate style.css
    this.zip.file('style.css','');

    /// generate a unique id
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
