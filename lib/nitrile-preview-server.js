const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewEpub } = require('./nitrile-preview-epub');
const { NitrilePreviewNode } = require('./nitrile-preview-node');
const utils = require('./nitrile-preview-utils');
const fs = require('fs');
const express = require('express');
const path = require('path');

class NitrilePreviewServer {

  constructor() {
    this.parser = new NitrilePreviewHtml();
    this.node = new NitrilePreviewNode();
  }

  run() {
    var express = require('express');
    var app = express();
    app.route('/Books').get(function(req,res)
    {
      res.send("Harry Potter, Gone With the Wind");
    });
    app.route('/Students').get(function(req,res)
    {
      res.send("James, Jane, Joe");
    });
    app.get('/*.md',(req,res) => {
      /// the 'req.url' is going to be '/my.md'
      var url = req.url;/// -> '/my.md'
      var fname = path.join('.',url);/// -> 'my.md'
      console.log(fname);
      //res.send('Welcome to my web portal');
      this.node.toAll(fname,this.parser).then(([all,config]) => {
            console.log(all);
            var data = this.tohtml(all,config);
            res.send(data);
          }).catch(x => {
            console.log(x);
            res.send(x);
          });
    });
    var server=app.listen(9004,function() {});
  }

  tohtml(all,config) {
    /// blocks
    //var [all,config] = await this.node.toAll(this.fname,this.parser);
    /// translate
    var htmls = this.parser.translateHtml(all,config);
    /// get TOC
    var toc = this.node.getXHtmlToc(config.ALL.isReport,chaps);
    /// construct the final HTML file
    let title = config.ALL.title ? config.ALL.title : 'Untitled'
    let author = config.ALL.author ? config.ALL.author : ''
    let geometry_text = this.parser.toPageCssStyleText(config);
    let data = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
</head>
<body class='nitrile-preview'>
<div class='PAGE' style='${geometry_text}' >

<p class='TITLE' style='${this.parser.titlecssstyle}' >
${this.parser.escape(title)}
</p>

<p class='AUTHOR' style='${this.parser.authorcssstyle}' >
${this.parser.escape(author)}
</p>

<p class='DATE' style='${this.parser.datecssstyle}' >
${this.parser.escape(new Date().toLocaleDateString())}
</p>

<nav style='position:absolute; top:0; left:21.5cm;'>
${toc}
</nav>

<main>
${htmls.join('\n')}
</main>

</div>
</body>
</html>`;

    /// return the content of the file
    return data;
  }

}

module.exports = { NitrilePreviewServer };

/*
var server = new NitrilePreviewServer();
server.run();
*/

