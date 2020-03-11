'use babel';

const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');

class NitrilePreviewDiagramSVG extends NitrilePreviewDiagram {

  constructor() {
    super();
    this.re_unit = /^(\d+)mm$/;
    this.process = {};
    this.process.drawline = this.drawline;
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
    this.u = u;
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
    for( let {cmd,txt,coords} of this.commands ) {
      switch(cmd) {
        case 'drawline':
          o.push(this.drawline(txt,coords));
          break;
        default:
          break;
      }
    }

    return [o.join('\n'),vw,vh];
  }

  localx(x) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   global coords.
    ///
    x *= this.refsx;
    x += this.refx;
    x *= this.u;
    x = this.fix(x);
    return x;
  }

  localy(y) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   global coords.
    ///
    y *= this.refsy;
    y += this.refy;
    y = this.height-y;
    y *= this.u;
    y = this.fix(y);
    return y;
  }

  toColor(color) {
    if (!color) {
      return 'black';
    } 
    else if (Array.isArray(color)) {
      return `rgb(${color[0]},${color[1]},${color[2]})`;
    } 
    else if (typeof color === 'string') {
      return color;
    } 
    else {
      return 'black';
    }
  }

  fills() {
    var s = [];
    if (this.fillcolor) {
      s.push(`fill='${this.toColor(this.fillcolor)}'`);
    } else {
      s.push(`fill='none'`)
    }
    return s.join(' ');
  }

  strokes() {
    var s = [];
    if (this.linedashed === 'evenly') {
      s.push(`stroke-dasharray='4'`);
    } else if (this.linedahsed === 'withdots') {
      s.push(`stroke-dasharray='2 2'`);
    }
    if (this.linewidth) {
      s.push(`stroke-width='${this.linewidth}'`);
    }
    if (this.linecolor) {
      s.push(`stroke='${this.toColor(this.linecolor)}'`);
    } else {
      s.push(`stroke='black'`);
    }
    return s.join(' ');
  }

  dots() {
    var s = [];
    if (this.dotcolor) {
      s.push(`withcolor ${this.dotcolor}`);
    }
    return s.join(' ');
  }

  drawline(txt,coords) {
    var o=[];
    var d = this.coordsToD(coords);
    return `<path d='${d}' ${this.strokes()} ${this.fills()}/>`;
  }

  drawdot(txt,coords) {
    for (var i = 0; this.valid(coords, i); i++) {
      z0 = this.point(coords, i);
      z0 = this.local(z0);
      var x = z0[0];
      var y = z0[1];
      if (dot_opt === '') {
        var withcolor = (this.dotcolor) ? `withcolor ${this.dotcolor}` : '';
        var withpen = `withpen pencircle scaled ${this.dotsize}`;
        ///***NOTE that drawdot cannot use shifted or scaled command
        ///   because there is no path before it
        o.push(`drawdot (${x}*u,${y}*u) ${withpen} ${withcolor};`);
      }
    }

  }

  coordsToD(coords, needcycle = false) {
    ///***NOTE: returns [str,bad_vars]
    ///***NOTE: i.e: (1,2)..(2,3)--cycle
    /// pt[0]: [1,2,'','','']
    /// pt[1]: [2,3,'..','','']
    /// pt[2]: ['cycle','','--','','']
    var o = [];
    var iscycle = 0;
    var x0 = null;
    var y0 = null;
    var u = this.u;
    for (var i in coords) {
      var pt = coords[i];
      console.log('james: coordsToD: pt=',pt);
      var x = this.localx(pt[0]);
      var y = this.localy(pt[1]);
      var join = pt[2];
      var p1x = this.localx(pt[3]);/// CUBIC BEZIER curve controlpoint 1x
      var p1y = this.localy(pt[4]);/// CUBIC BEZIER curve controlpoint 1y
      var p2x = this.localx(pt[5]);/// CUBIC BEZIER curve controlpoint 2x
      var p2y = this.localy(pt[6]);/// CUBIC BEZIER curve controlpoint 2y
      ///doing some fixes
      join = join || '';
      if (i == 0) {
        join = '';
      }
      ///In case we have a CUBIC BEZIER curve, then pt1 and pt2 are the control points
      if (i == 0) {
        o.push(`M${x},${y}`);
      }
      else if (join == '..') {
        o.push(`C${p1x},${p1y},${p2x},${p2y},${x},${y}`);
      }
      else if (join == 'cycle') {
        iscycle = 1;
        o.push(`z`);
        break;
      }
      else {
        o.push(`L${x},${y}`);
      }
    }
    if (needcycle && !iscycle) {
      o.push('z');
    }
    return o.join(' ');
  }

}

module.exports = { NitrilePreviewDiagramSVG };
