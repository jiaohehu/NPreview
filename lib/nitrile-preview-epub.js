'use babel';

const JSZip = require('jszip');

class NitrilePreviewEpub {
 
  constructor () {

    this.zip = new JSZip();
    this.sections = [];
    this.toc = '';
    this.contents = [];
  }

  setContents (htmls,chaps,isarticle) {

    /// add the entire HTML, this will
    /// be scanned and break down into separate files
    /// based on the chapters.

console.error(htmls);
console.error(chaps);

    if (isarticle) {
      var sections = [];
      var contents = [];
      for (var i=0; i < chaps.length; ++i) {
        let chap = chaps[i];
        let [heading,id,text,pos] = chap;
        if (heading === 'SECTION') {
          sections.push([id,text]);
        }
      }
      this.zip.file('content.xhtml',htmls.join('\n'));
      contents.push(['content','content.xhtml','application/xhtml+xml',htmls.join('\n')]);
      this.toc = sections.map(x => `<li><a href='content.xhtml#${x[0]}'>${x[1]}</a></li>`).join('\n');
      this.toc = `<ol style='list-style-type:none;' epub:type='list'> ${this.toc} </ol>`;
      this.contents = contents;
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
<body xmlns:epub='http://www.idpf.org/2007/ops'>
${data}
</body>
</html>
`);
    }

    /// generate style.css
    this.zip.file('style.css','');

    /// generate package.opf
    this.zip.file('package.opf',`\
<?xml version='1.0' encoding='UTF-8'?>
<package xmlns='http://www.idpf.org/2007/opf' version='3.0' xml:lang='en' unique-identifier='pub-id'>
<metadata xmlns:dc='http://purl.org/dc/elements/1.1/'>
<dc:identifier id='pub-id'>Unassigned</dc:identifier>
<dc:language>en</dc:language>
<dc:title id='title'>Learning Japanese</dc:title>
<dc:subject>Language</dc:subject>
<dc:creator>James Yu</dc:creator>
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
