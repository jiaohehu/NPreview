'use babel';

const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');

class NitrilePreviewDiagramSVG extends NitrilePreviewDiagram {

  constructor(parser) {
    super(parser);
    this.re_unit = /^(\d+)mm$/;
    this.re_inlinemath = /^\`\`(.*)\`\`$/;
    this.tokenizer = new NitrilePreviewTokenizer();
  }
  
  do_setup () {
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
    this.vw = vw;
    this.vh = vh;
  }

  do_finalize(s) {
    var o = [];
    ///GENERATE grids
    var x1 = 0;
    var y1 = 0;
    var x2 = 0;
    var y2 = 0;
    var u = this.u;
    var vw = this.vw;
    var vh = this.vh;
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
    o.push('<defs>');
    o.push(`<marker id='markerArrow' markerWidth='13' markerHeight='13' refX='10' refY='6' orient='auto'> <path d='M2,4 L2,8 L10,6 z' stroke='context-stroke' fill='context-stroke'/> </marker>`);
    o.push(`<marker id='startArrow' markerWidth='13' markerHeight='13' refX='3' refY='6' orient='auto'> <path d='M11,4 L11,8 L3,6 z' stroke='context-stroke' fill='context-stroke'/> </marker>`);
    o.push('</defs>');
    o.push(s);    
    return [o.join('\n'),vw,vh];
  }

  do_comment(s) {
    s = this.parser.escape(s);
    return `<!-- ${s} -->`;
  }

  do_grid () {
    var s = [];
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
      s.push(`<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke='rgb(230,230,230)'/>`);
    }
    for (var y = 0; y <= this.height; y++) {
      y1 = y * u;
      y2 = y * u;
      x1 = 0;
      x2 = this.width * u;
      s.push(`<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke='rgb(230,230,230)'/>`);
    }
    return s.join('\n');
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
    } else {
      s.push(`font-size='12pt'`);
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

  do_drawline(opt,txt,coords) {
    var o=[];
    var d = this.coordsToD(coords);
    return `<path d='${d}' ${this.strokes()} ${this.fills()}/>`;
  }

  do_drawarrow(opt,txt,coords) {
    var o=[];
    var d = this.coordsToD(coords);
    return `<path d='${d}' ${this.strokes()} ${this.fills()} marker-end='url(#markerArrow)'/>`;
  }

  do_drawrevarrow(opt,txt,coords) {
    var o=[];
    var d = this.coordsToD(coords);
    return `<path d='${d}' ${this.strokes()} ${this.fills()} marker-start='url(#startArrow)'/>`;
  }

  do_drawdblarrow(opt,txt,coords) {
    var o=[];
    var d = this.coordsToD(coords);
    return `<path d='${d}' ${this.strokes()} ${this.fills()} marker-start='url(#startArrow)' marker-end='url(#markerArrow)'/>`;
  }

  do_dot(opt,txt,coords) {
    var s = [];
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = this.localx(z0[0]);
      var y = this.localy(z0[1]);
      s.push(`<circle cx='${x}' cy='${y}' r='${this.dotsize/2}' ${this.dots()}/>`);
    }
    return s.join('\n');
  }

  do_rcard(opt,txt,coords) {
    var s = [];
    var rectw = this.rectw*this.u;
    var recth = this.recth*this.u;
    var rx = this.fix(0.2*rectw);
    var dx = this.fix(0.6*rectw);
    var ry = this.fix(0.2*recth);
    var dy = this.fix(0.6*recth);
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = this.localx(z0[0]);
      var y = this.localy(z0[1]);
      s.push(`<path d='M${x+rx},${y} h${dx} q${rx},${0},${rx},${-ry} v${-dy} q${0},${-ry},${-rx},${-ry} h${-dx} q${-rx},${0},${-rx},${ry} v${dy} q${rx},${0},${rx},${ry} z' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_rrect(opt,txt,coords) {
    var s = [];
    var rectw = this.rectw*this.u;
    var recth = this.recth*this.u;
    var rx = this.fix(0.2*rectw);
    var dx = this.fix(0.6*rectw);
    var ry = this.fix(0.2*recth);
    var dy = this.fix(0.6*recth);
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = this.localx(z0[0]);
      var y = this.localy(z0[1]);
      s.push(`<path d='M${x+rx},${y} h${dx} q${rx},${0},${rx},${-ry} v${-dy} q${0},${-ry},${-rx},${-ry} h${-dx} q${-rx},${0},${-rx},${ry} v${dy} q${0},${ry},${rx},${ry} z' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_label(opt,txt,coords){
    var v = null;
    var s = [];
    var all_labels = txt.split('\\\\');
    var all_labels = all_labels.map(x => x.trim());
    var t0 = 'assigned';
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      console.log('james: do_label: z0=',z0);
      var x = this.localx(z0[0]);
      var y = this.localy(z0[1]);
      var t = all_labels[i];
      if (!t) {
        t = t0;
      } else {
        t0 = t;
      }
      console.log('james: opt=',opt);
      if ((v=this.re_inlinemath.exec(t))!==null) {
        var [w_,h_,defs_,s_] = this.tokenizer.toDiagramSvg(v[1]);
        ///NOTE: the w_ and h_ are always in the unit of pt
        var w = w_*1.3333;
        var h = h_*1.3333;
        var gap = 6;
        if (opt==='.lrt') {
          x += gap;
          y += gap;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (opt==='.bot') {
          s.push(`<text text-anchor='middle' ${this.texts()} x='${x}' y='${y}'           dy='1.3em'>${t}</text>`);
        } else if (opt==='.llft') {
          x -= w;
          x -= gap;
          y += gap;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (opt==='.urt') {
          y -= h;
          x += gap;
          y -= gap;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (opt==='.top') {
          s.push(`<text text-anchor='middle' ${this.texts()} x='${x}' y='${y}'           dy='-0.7em'>${t}</text>`);
        } else if (opt==='.ulft') {
          x -= w;
          x -= gap;
          y -= h;
          y -= gap;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (opt==='.rt') {
          s.push(`<text text-anchor='start'  ${this.texts()} x='${x}' y='${y}' dx='1ex'  dy='0.3em'>${t}</text>`);
        } else if (opt==='.lft') {
          s.push(`<text text-anchor='end'    ${this.texts()} x='${x}' y='${y}' dx='-1ex' dy='0.3em'>${t}</text>`);
        } else {
          x -= w/2;
          y -= h/2;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        }
      } else {
        t = this.parser.escape(t);
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
    }
    return s.join('\n');
  }

  ticks() {
    var s = [];
    if (this.tickcolor) {
      s.push(`stroke='${this.colors(this.tickcolor)}'`);
    } else {
      s.push(`stroke='black'`);
    }
    if (this.tickwidth) {
      s.push(`stroke-width='${this.tickwidth}'`);
    }
    return s.join(' ');
  }

  do_tick(opt,txt,coords) {
    var s = [];
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = this.localx(z0[0]);
      var y = this.localy(z0[1]);
      var len = this.fix(this.tickprotrude*this.u);
      if (opt === '.top') {
        s.push(`<line x1='${x}' y1='${y}' x2='${x}' y2='${y - len}' ${this.ticks()}/>`);
      } else if (opt === '.bot') {
        s.push(`<line x1='${x}' y1='${y}' x2='${x}' y2='${y + len}' ${this.ticks()}/>`);
      } else if (opt === '.rt') {
        s.push(`<line x1='${x}' y1='${y}' x2='${x + len}' y2='${y}' ${this.ticks()}/>`);
      } else if (opt === '.lft') {
        s.push(`<line x1='${x}' y1='${y}' x2='${x - len}' y2='${y}' ${this.ticks()}/>`);
      }
    }
    return s.join('\n');
  }

  do_apple(opt,txt,coords) {
    var s = [];
    var mypath = '(.5,.7)..(.25,.85)..(0,.4)..(.5,0)..(1.0,.5)..(.8,.9)..(.5,.7)--(.5,.7)..(.6,1.0)..(.3,1.1)--(.3,1.1)..(.4,1.0)..(.5,.7)--()';
    var p0 = this.readCoordsLine(null,mypath);
    var w = 1;
    var h = 1;
    var hw = 0.5;
    var hh = 0.5;
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = (z0[0]);
      var y = (z0[1]);
      if (opt === '.top') {
        var p = this.shiftcoords(p0,-hw,0);
      } else if (opt === '.bot') {
        var p = this.shiftcoords(p0,-hw,-h);
      } else if (opt === '.rt') {
        var p = this.shiftcoords(p0,0,-hh);
      } else if (opt === '.lft') {
        var p = this.shiftcoords(p0,-w,-hh);
      } else if (opt === '.urt') {
        var p = this.shiftcoords(p0,0,0);
      } else if (opt === '.lrt') {
        var p = this.shiftcoords(p0,0,-h);
      } else if (opt === '.ulft') {
        var p = this.shiftcoords(p0,-w,0);
      } else if (opt === '.llft') {
        var p = this.shiftcoords(p0,-w,-h);
      } else {
        var p = this.shiftcoords(p0,-hw,-hh);
      }
      var p = this.shiftcoords(p,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_basket(opt,txt,coords) {
    var s = [];
    var mypath = '(0.3,0)--(2.6,0)..(2.8,1)..(3,2)--(3,2)..(1.5,1.5)..(0,2)--(0,2)..(0.2,1)..(0.3,0)--()';
    var p0 = this.readCoordsLine(null,mypath);
    var w = 3;
    var h = 2;
    var hw = 1.5;
    var hh = 1;
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = (z0[0]);
      var y = (z0[1]);
      if (opt === '.top') {
        var p = this.shiftcoords(p0,-hw,0);
      } else if (opt === '.bot') {
        var p = this.shiftcoords(p0,-hw,-h);
      } else if (opt === '.rt') {
        var p = this.shiftcoords(p0,0,-hh);
      } else if (opt === '.lft') {
        var p = this.shiftcoords(p0,-w,-hh);
      } else if (opt === '.urt') {
        var p = this.shiftcoords(p0,0,0);
      } else if (opt === '.lrt') {
        var p = this.shiftcoords(p0,0,-h);
      } else if (opt === '.ulft') {
        var p = this.shiftcoords(p0,-w,0);
      } else if (opt === '.llft') {
        var p = this.shiftcoords(p0,-w,-h);
      } else {
        var p = this.shiftcoords(p0,-hw,-hh);
      }
      var p = this.shiftcoords(p,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_crate(opt,txt,coords) {
    var s = [];
    var mypath = '(3,2)--(0,2)--(0,0)--(3,0)--(3,2)--(0,2)--(1,3)--(4,3)--(3,2)--(3,0)--(4,1)--(4,3)--(3,2)--()';
    var p0 = this.readCoordsLine(null,mypath);
    var w = 4;
    var h = 3;
    var hw = 2;
    var hh = 1.5;
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = (z0[0]);
      var y = (z0[1]);
      if (opt === '.top') {
        var p = this.shiftcoords(p0,-hw,0);
      } else if (opt === '.bot') {
        var p = this.shiftcoords(p0,-hw,-h);
      } else if (opt === '.rt') {
        var p = this.shiftcoords(p0,0,-hh);
      } else if (opt === '.lft') {
        var p = this.shiftcoords(p0,-w,-hh);
      } else if (opt === '.urt') {
        var p = this.shiftcoords(p0,0,0);
      } else if (opt === '.lrt') {
        var p = this.shiftcoords(p0,0,-h);
      } else if (opt === '.ulft') {
        var p = this.shiftcoords(p0,-w,0);
      } else if (opt === '.llft') {
        var p = this.shiftcoords(p0,-w,-h);
      } else {
        var p = this.shiftcoords(p0,-hw,-hh);
      }
      var p = this.shiftcoords(p,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  localcoords(coords) {
    var s = [];
    for( let [x,y,join,x1,y1,x2,y2] of coords ) {
      if (join=='cycle'||join=='nan') {
        s.push([x,y,join,x1,y1,x2,y2]);
      } else {
        x = this.localx(x);
        y = this.localx(y);
        x1 = this.localx(x1);
        y1 = this.localx(y1);
        x2 = this.localx(x2);
        y2 = this.localx(y2);
        s.push([x,y,join,x1,y1,x2,y2]);
      }
    }
    return s;
  }

  scalecoords(coords,scalar) {
    var s = [];
    for( let [x,y,join,x1,y1,x2,y2] of coords ) {
      if (join=='cycle'||join=='nan') {
        s.push([x,y,join,x1,y1,x2,y2]);
      } else {
        x *= scalar;
        y *= scalar;
        x1 *= scalar;
        y1 *= scalar;
        x2 *= scalar;
        y2 *= scalar;
        s.push([x,y,join,x1,y1,x2,y2]);
      }
    }
    return s;
  }

  shiftcoords(coords,dx,dy) {
    var s = [];
    for( let [x,y,join,x1,y1,x2,y2] of coords ) {
      if (join=='cycle'||join=='nan') {
        s.push([x,y,join,x1,y1,x2,y2]);
      } else {
        x += dx;
        y += dy;
        x1 += dx;
        y1 += dy;
        x2 += dx;
        y2 += dy;
        s.push([x,y,join,x1,y1,x2,y2]);
      }
    }
    return s;
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
