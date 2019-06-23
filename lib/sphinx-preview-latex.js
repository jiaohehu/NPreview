'use babel';

import SphinxPreviewParser from './sphinx-preview-parser';

class SphinxPreviewLatex extends SphinxPreviewParser {

  constructor() {
    super();
  }

  /*
  Return a string that is the HTML
  */
  toTEXT (lines) {
    var blocks = this.toBLOCKS(lines);
    for (block of blocks) {
      const [id,row1,row2,type,n,para] = block;
      console.log(`id(${id}) row1(${row1}) row2(${row2}),type(${type}),n(${n}),para(${para})`);
    }
    return 'james';
  }

}

export default {

  toTEXT (lines) {
    var parser = new SphinxPreviewLatex();
    return parser.toTEXT(lines);
  }
}
