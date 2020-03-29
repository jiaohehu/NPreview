const { NitrilePreviewHtml } = require('../lib/nitrile-preview-html');
const utils = require('../lib/nitrile-preview-utils');

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

utils.readFileAsync(fname).then(
     out => {
          const parser = new NitrilePreviewHtml();
          const [main, config] = parser.toFlow(out.split('\n'), 0, fname);
          parser.idenBlocks(main,config);
          parser.translateBlocks(main,config);
          var htmls = main.map(x=>x.html);
          console.log(htmls.join('\n'));
     });
