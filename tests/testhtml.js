const { NitrilePreviewHtml } = require('../lib/nitrile-preview-html');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

utils.readFileAsync(fname).then(
     out => {
          const parser = new NitrilePreviewHtml();
          const [main, flags] = parser.toFlow(out.split('\n'), 0, fname);
          const config = parser.toConfig(flags);
          const all = parser.idenBlocks(main,config);
          console.log(all);
          console.log(config);
          var o = parser.translateHtml(main,config);
          var out = o.join('\n');
          console.log(out);
     });
