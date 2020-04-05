const { NitrilePreviewContex } = require('../lib/nitrile-preview-contex');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

utils.readFileAsync(fname).then(
     out => {
          const parser = new NitrilePreviewContex();
          const [main, config] = parser.toFlow(out.split('\n'),fname);
          parser.idenBlocks(main,config);
          parser.translateBlocks(main,config);
          var texlines = main.map(x=>x.latex);
          console.log(texlines.join('\n'));
     });
