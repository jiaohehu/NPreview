const { NitrilePreviewNode } = require ('/Users/james/github/nitrile-preview/lib/nitrile-preview-node'); 
new NitrilePreviewNode().toLatex('/Users/james/github/nitrile-preview/utils/test-dt.md')
     .then(f => console.log(f)).catch(err => console.log(err));


