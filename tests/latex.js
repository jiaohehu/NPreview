const { NitrilePreviewLatex } = require('/Users/james/github/nitrile-preview/lib/nitrile-preview-latex');
const utils = require('/Users/james/github/nitrile-preview/lib/nitrile-preview-utils');

const fname = '/Users/james/github/nitrile-preview/tests/test-bezier2.md';

utils.readFileAsync(fname).then(
     out => {
          const parser = new NitrilePreviewLatex();
          const [main, flags] = parser.toFlow(out.split('\n'), 0, fname);
          const config = parser.toConfig(flags);
          console.log(main);
          console.log(config);
     });
