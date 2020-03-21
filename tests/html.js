const { NitrilePreviewHtml } = require('/Users/james/github/nitrile-preview/lib/nitrile-preview-html');
const utils = require('/Users/james/github/nitrile-preview/lib/nitrile-preview-utils');

const fname = '/Users/james/github/nitrile-preview/utils/test-od.md';

utils.readFileAsync(fname).then(
     out => {
          const parser = new NitrilePreviewHtml();
          const [main, flags] = parser.toFlow(out.split('\n'), 0, fname);
          const config = parser.toConfig(flags);
          console.log(main);
          console.log(config);
          parser.translateHtml(main,config);
     });
