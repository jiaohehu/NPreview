'use babel';

const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');

class NitrilePreviewDiagramSVG extends NitrilePreviewDiagram {

  constructor() {
    super();
    this.re_unit = /^(\d+)mm$/;
  }
  
  finalize() {
    var o = [];
    /// generate viewBox
    var v = null;
    if ((v=this.re_unit.exec(this.unit))) {
      var u = 3.78*parseFloat(v[1]);
      var vw = u*this.width;
      var vh = u*this.height;
    } else {
      var u = 3.78*4;///4mm grid
      var vw = u*this.width;
      var vh = u*this.height;
    }
    ///GENERATE grids
    var x1 = 0;
    var y1 = 0;
    var x2 = 0;
    var y2 = 0;
    for (var x = 0; x <= this.width; x++) {
      x1 = x * u;
      x2 = x * u;
      y1 = 0;
      y2 = this.height * u;
      o.push(`<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke='rgb(230,230,230)'/>`);
    }
    for (var y = 0; y <= this.height; y++) {
      y1 = y * u;
      y2 = y * u;
      x1 = 0;
      x2 = this.width * u;
      o.push(`<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke='rgb(230,230,230)'/>`);
    }

    for( var cmd of this.commands ) {
      
    }

    return [o.join('\n'),vw,vh];
  }
}

module.exports = { NitrilePreviewDiagramSVG };