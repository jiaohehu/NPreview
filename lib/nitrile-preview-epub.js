'use babel';

const JSZip = require('jszip');

class NitrilePreviewEpub {
 
  constructor () {

    this.zip = new JSZip();
  }

  setContents (htmls,chaps,isarticle) {

    /// add the entire HTML, this will
    /// be scanned and break down into separate files
    /// based on the chapters.
  
    for (; element; element = element.nextElementSibling) {
      //console.log(element);
      var nodeName = ''+element.nodeName;
      var className = ''+element.className;
      var idName = ''+element.id;
      var outerHTML = ''+element.outerHTML;
      console.log(`${nodeName}, ${className}, ${idName}, ${outerHTML}`);
        
      switch (className) {
        case 'TITLE':
          break;
        case 'AUTHOR':
          break;
        case 'DATE':
          break;
        case 'SECTION':
          sections.push(idName);
          htmls.push(outerHTML);
          break;
        default: 
          htmls.push(outerHTML);
          break;
      };///end-switch
    };///end-for

    this.zip.file('content1.xhtml',htmls.join('\n'));
  }

  async generateAsync() {

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

    return await this.zip.generateAsync({type: 'nodebuffer'});
  }

}

module.exports = { NitrilePreviewEpub };
