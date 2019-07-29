'use babel';

const JSZip = require('jszip');

class NitrilePreviewEpub {
 
  constructor () {

    this.zip = new JSZip();
  }

  start () {

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

    this.zip.file('mimetype',`\
application/epub+zip
`);

  }

  setElement (element,isarticle) {

    /// add the entire HTML, this will
    /// be scanned and break down into separate files
    /// based on the chapters.
    
    while (element) {
      //console.log(element);
      var nodeName = ''+element.nodeName;
      var className = ''+element.className;
      var idName = ''+element.id;
      var innerHTML = ''+element.innerHTML;
    
      console.log(`${nodeName}, ${className}, ${idName}, ${innerHTML}`);

      element = element.nextElementSibling;
    }

  }

}

module.exports = { NitrilePreviewEpub };
