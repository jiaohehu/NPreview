const { NitrilePreviewContex } = require('../lib/nitrile-preview-contex');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

utils.readFileAsync(fname).then(
     out => {
          const parser = new NitrilePreviewContex();
          parser.readFromFile(fname);
          parser.idenBlocks();
          parser.translateBlocks();
          var main = parser.blocks;
          var texlines = main.map(x=>x.latex);
          console.log(texlines.join('\n'));
     });
