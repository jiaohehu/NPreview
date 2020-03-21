const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const utils = require('./nitrile-preview-utils');
const fname = '../tests/test-od.md';

utils.readFileAsync(fname).then(
     out => {
          const parser = new NitrilePreviewLatex();
          const [main, flags] = parser.toFlow(out.split('\n'), 0, fname);
          const config = parser.toConfig(flags);
          console.log(main);
          console.log(config);
          parser.translateLatex(main,config);
     });
