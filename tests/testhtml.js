const { NitrilePreviewHtml } = require('../lib/nitrile-preview-html');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

utils.readFileAsync(fname).then(
     out => {
          var lines = out.split('\n');
          const parser = new NitrilePreviewHtml();
          parser.readFromLines(lines,fname);
          parser.idenBlocks();
          parser.translateBlocks();
          var main = parser.blocks;
          var htmls = main.map(x=>x.html);
          console.log(htmls.join('\n'));
     });
