'use babel';

const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');

class NitrilePreviewDiagramSVG extends NitrilePreviewDiagram {

  constructor(parser) {
    super(parser);
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
    for( let {opt,cmd,txt,coords} of this.commands ) {
      switch(cmd) {
        case 'drawline':
          o.push(this.drawline(opt,txt,coords));
          break;
        case 'drawdot':
          o.push(this.drawdot(opt,txt,coords));
          break;
        case 'label':
          o.push(this.drawlabel(opt,txt,coords));
          break;
        default:
          console.log(`unknown command encounted in NitrilePreviewDiagramSVG: ${cmd}`)
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

  colors(color) {
    if (!color) {
      return 'none';
    } 
    else if (Array.isArray(color)) {
      return `rgb(${color[0]},${color[1]},${color[2]})`;
    } 
    else if (typeof color === 'string') {
      return color;
    } 
    else {
      return 'none';
    }
  }

  texts() {
    var s = [];
    if (this.fontsize) {
      s.push(`font-size='${this.fontsize}'`);
    } 
    if (this.fontcolor) {
      s.push(`fill='${this.colors(this.fontcolor)}'`);
    }
    return s.join(' ');
  }

  fills() {
    var s = [];
    if (this.fillcolor) {
      s.push(`fill='${this.colors(this.fillcolor)}'`);
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
      s.push(`stroke='${this.colors(this.linecolor)}'`);
    } else {
      s.push(`stroke='black'`);
    }
    return s.join(' ');
  }
  
  dots() {
    var s = [];
    if (this.dotcolor) {
      s.push(`fill='${this.colors(this.dotcolor)}'`);
    } else {
      s.push(`fill='black'`);
    }
    return s.join(' ');
  }

  drawline(opt,txt,coords) {
    var o=[];
    var d = this.coordsToD(coords);
    return `<path d='${d}' ${this.strokes()} ${this.fills()}/>`;
  }

  drawdot(opt,txt,coords) {
    var s = [];
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = this.localx(z0[0]);
      var y = this.localy(z0[1]);
      s.push(`<circle cx='${x}' cy='${y}' r='${this.dotsize/2}' ${this.dots()}/>`);
    }
    return s.join('\n');
  }

  drawlabel(opt,txt,coords){
    var s = [];
    var all_labels = txt.split('\\\\');
    var all_labels = all_labels.map(x => x.trim());
    var t0 = 'assigned';
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = this.localx(z0[0]);
      var y = this.localy(z0[1]);
      var t = all_labels[i];
      if (!t) {
        t = t0;
      } else {
        t0 = t;
      }
      console.log('james: opt=',opt);
      t = this.parser.unmask(t);
      if (opt==='.lrt') {
        s.push(`<text text-anchor='start'  ${this.texts()} x='${x}' y='${y}' dx='1ex'  dy='1.3em'>${t}</text>`);
      } else if (opt==='.bot') {
        s.push(`<text text-anchor='middle' ${this.texts()} x='${x}' y='${y}'           dy='1.3em'>${t}</text>`);
      } else if (opt==='.llft') {
        s.push(`<text text-anchor='end'    ${this.texts()} x='${x}' y='${y}' dx='-1ex' dy='1.3em'>${t}</text>`);
      } else if (opt==='.urt') {
        s.push(`<text text-anchor='start'  ${this.texts()} x='${x}' y='${y}' dx='1ex'  dy='-0.7em'>${t}</text>`);
      } else if (opt==='.top') {
        s.push(`<text text-anchor='middle' ${this.texts()} x='${x}' y='${y}'           dy='-0.7em'>${t}</text>`);
      } else if (opt==='.ulft') {
        s.push(`<text text-anchor='end'    ${this.texts()} x='${x}' y='${y}' dx='-1ex' dy='-0.7em'>${t}</text>`);
      } else if (opt==='.rt') {
        s.push(`<text text-anchor='start'  ${this.texts()} x='${x}' y='${y}' dx='1ex'  dy='0.3em'>${t}</text>`);
      } else if (opt==='.lft') {
        s.push(`<text text-anchor='end'    ${this.texts()} x='${x}' y='${y}' dx='-1ex' dy='0.3em'>${t}</text>`);
      } else {
        s.push(`<text text-anchor='middle' ${this.texts()} x='${x}' y='${y}'           dy='0.3em'>${t}</text>`);
      }
    }
    return s.join('\n');
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
