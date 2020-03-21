const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const utils = require('./nitrile-preview-utils');
const fname = '../tests/test-od.md';

utils.readFileAsync(fname).then(
     out => {
          const parser = new NitrilePreviewHtml();
          const [main, flags] = parser.toFlow(out.split('\n'), 0, fname);
          const config = parser.toConfig(flags);
          console.log(main);
          console.log(config);
          parser.translateHtml(main,config);
     });
