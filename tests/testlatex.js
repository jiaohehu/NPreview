const { NitrilePreviewLatex } = require('../lib/nitrile-preview-latex');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

utils.readFileAsync(fname).then(
     out => {
          const parser = new NitrilePreviewLatex();
          const [main, config] = parser.toFlow(out.split('\n'), 0, fname);
          const all = parser.idenBlocks(main, config);
          console.log(main);
          console.log(config);
          var o = parser.translateLatex(main,config);
          var out = o.join('\n');
          console.log(out);
     });
