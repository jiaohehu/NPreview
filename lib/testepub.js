const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewEpub } = require('./nitrile-preview-epub');
const utils = require('./nitrile-preview-utils');
const path = require('path');

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
          var htmls = parser.translateHtml(main,config);
          var chaps = parser.chaps;
          let title = config.ALL.title ? config.ALL.title : 'Untitled';
          let author = config.ALL.author ? config.ALL.author : '';
          var epub = new NitrilePreviewEpub();
          var imagemap = new Map();///empty imagemap
          var dirname = path.dirname(fname);
          epub.generateAsync(parser,parser.escape(title),parser.escape(author),htmls,chaps,imagemap,config,dirname).then( x => {
            console.log('finished');
          }).catch( x => console.log(x) );
          
     });
