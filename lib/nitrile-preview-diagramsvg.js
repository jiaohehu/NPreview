'use babel';

const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');
const { arcpath } = require('./nitrile-preview-arcpath');

class NitrilePreviewDiagramSVG extends NitrilePreviewDiagram {

  constructor(parser,tokenizer) {
    super(parser);
    this.tokenizer = tokenizer;
    this.re_unit = /^(\d+)mm$/;
    this.re_inlinemath = /^\`\`(.*)\`\`$/;
  }
  
  do_setup () {
    /// generate viewBox
    var v = null;
    var u = 3.78*this.unit;///this.unit is always in mm
    var vw = u*this.width;
    var vh = u*this.height;
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
    s = s.replace(/\-\-/g,'');
    s = s.replace(/\\/g,'\\\\');
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

  localline(x1,y1,x2,y2) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   SVG coords.
    ///
    x1 = this.localx(x1);
    y1 = this.localy(y1);
    x2 = this.localx(x2);
    y2 = this.localy(y2);
    return [x1,y1,x2,y2];
  }

  localx(x) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   SVG coords.
    ///
    x *= this.refsx;
    x += this.refx;
    x *= this.u;
    x = this.fix(x);
    return x;
  }

  localdist(x) {
    x *= this.u;
    x = this.fix(x);
    return x;
  }

  localy(y) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   SVG coords.
    ///
    y *= this.refsy;
    y += this.refy;
    y = this.height-y;
    y *= this.u;
    y = this.fix(y);
    return y;
  }

  localpt(pt) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   SVG coords.
    ///
    let [x,y] = pt;;
    x = this.localx(x);
    y = this.localy(y);
    return [x,y];
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
      s.push(`font-size='${this.fix2(0.75*this.fontsize)}pt'`);
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
    if (typeof this.linesize === 'number') {
      s.push(`stroke-width='${this.linesize}'`);
    }
    if (this.linecolor) {
      s.push(`stroke='${this.colors(this.linecolor)}'`);
    } else {
      s.push(`stroke='black'`);
    }
    if (this.linecap) {
      s.push(`stroke-linecap='${this.linecaps()}'`);
    } 
    if (this.linejoin) {
      s.push(`stroke-linejoin='${this.linejoins()}'`);
    } 
    
    return s.join(' ');
  }

  linecaps() {
    if (this.linecap === 'butt') {
      return 'butt';
    } else if (this.linecap === 'round') {
      return 'round';
    } else if (this.linecap === 'square') {
      return 'square';
    }
    return '';
  }
  
  linejoins() {
    if (this.linejoin === 'miter') {
      return 'miter';
    } else if (this.linejoin === 'round') {
      return 'round';
    } else if (this.linejoin === 'bevel') {
      return 'bevel';
    }
    return '';
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

  do_drawarc(opt,txt,coords) {
    var s = [];
    for (var i = 1; this.valid(coords, i - 1) && this.valid(coords, i); ++i) {
      var z0 = this.point(coords, i - 1);
      var z1 = this.point(coords, i);
      var X1 = z0[0];
      var Y1 = z0[1];
      var X2 = z1[0];
      var Y2 = z1[1];
      var Rx = this.xradius;
      var Ry = this.yradius;
      var Phi = this.rotation;
      ///NOTE: we need to switch X1/Y1 and X2/Y2 position
      /// so that X1 is always on the left hand side of X2
      if (0 && X1 > X2) {
        var tmp = X1; X1 = X2; X2 = tmp;
        var tmp = Y1; Y1 = Y2; Y2 = tmp;
      }
      if (this.position == 'top') {
        if (this.bigarcflag) {
          var [Cx, Cy, Rx, Ry] = arcpath(X1, Y1, X2, Y2, Rx, Ry, Phi, 0);
          if (Number.isFinite(Cx) && Number.isFinite(Cy)) {
            var lambda2 = Math.atan2(Y1 - Cy, X1 - Cx);
            var lambda1 = Math.atan2(Y2 - Cy, X2 - Cx);
            lambda2 -= Phi / 180 * Math.PI;
            lambda1 -= Phi / 180 * Math.PI;
            var tao1 = Math.atan2(Math.sin(lambda1) / Ry, Math.cos(lambda1) / Rx);
            var tao2 = Math.atan2(Math.sin(lambda2) / Ry, Math.cos(lambda2) / Rx);
            var ang1 = this.to360(tao1 / Math.PI * 180);
            var ang2 = this.to360(tao2 / Math.PI * 180);
            if (ang2 < ang1) { ang2 += 360; }
          }
        } else {
          var [Cx, Cy, Rx, Ry] = arcpath(X1, Y1, X2, Y2, Rx, Ry, Phi, 1);
          if (Number.isFinite(Cx) && Number.isFinite(Cy)) {
            var lambda2 = Math.atan2(Y1 - Cy, X1 - Cx);
            var lambda1 = Math.atan2(Y2 - Cy, X2 - Cx);
            lambda2 -= Phi / 180 * Math.PI;
            lambda1 -= Phi / 180 * Math.PI;
            var tao1 = Math.atan2(Math.sin(lambda1) / Ry, Math.cos(lambda1) / Rx);
            var tao2 = Math.atan2(Math.sin(lambda2) / Ry, Math.cos(lambda2) / Rx);
            var ang1 = this.to360(tao1 / Math.PI * 180);
            var ang2 = this.to360(tao2 / Math.PI * 180);
            if (ang2 < ang1) { ang2 += 360; }
          }
        }
      } else {
        if (this.bigarcflag) {
          var [Cx, Cy, Rx, Ry] = arcpath(X1, Y1, X2, Y2, Rx, Ry, Phi, 1);
          if (Number.isFinite(Cx) && Number.isFinite(Cy)) {
            var lambda1 = Math.atan2(Y1 - Cy, X1 - Cx);
            var lambda2 = Math.atan2(Y2 - Cy, X2 - Cx);
            lambda2 -= Phi / 180 * Math.PI;
            lambda1 -= Phi / 180 * Math.PI;
            var tao1 = Math.atan2(Math.sin(lambda1) / Ry, Math.cos(lambda1) / Rx);
            var tao2 = Math.atan2(Math.sin(lambda2) / Ry, Math.cos(lambda2) / Rx);
            var ang1 = this.to360(tao1 / Math.PI * 180);
            var ang2 = this.to360(tao2 / Math.PI * 180);
            if (ang2 < ang1) { ang2 += 360; }
          }
        } else {
          var [Cx, Cy, Rx, Ry] = arcpath(X1, Y1, X2, Y2, Rx, Ry, Phi, 0);
          if (Number.isFinite(Cx) && Number.isFinite(Cy)) {
            var lambda1 = Math.atan2(Y1 - Cy, X1 - Cx);
            var lambda2 = Math.atan2(Y2 - Cy, X2 - Cx);
            lambda2 -= Phi / 180 * Math.PI;
            lambda1 -= Phi / 180 * Math.PI;
            var tao1 = Math.atan2(Math.sin(lambda1) / Ry, Math.cos(lambda1) / Rx);
            var tao2 = Math.atan2(Math.sin(lambda2) / Ry, Math.cos(lambda2) / Rx);
            var ang1 = this.to360(tao1 / Math.PI * 180);
            var ang2 = this.to360(tao2 / Math.PI * 180);
            if (ang2 < ang1) { ang2 += 360; }
          }
        }
      }
      //console.log('do_drawarc: tao1=',ang1);
      //console.log('do_drawarc: tao2=',ang2);
      //console.log('do_drawarc: Cx=',Cx);
      //console.log('do_drawarc: Cy=',Cy);
      //console.log('do_drawarc: Rx=',Rx);
      //console.log('do_drawarc: Ry=',Ry);
      //console.log('do_drawarc: Phi=',Phi);
      ///NOTE: need to draw an arc 
      var points = [];
      var ds = [];
      var z0 = this.point(coords, 0);
      var x = z0[0];
      var y = z0[1];
      var bigarcflag = (this.bigarcflag)?1:0;
      var sweepflag = (this.sweepflag)?1:0;///1-clockwise;1-anticlockwise;
      ///NOTE: that X1 is always at the left hand side of X2, and
      ///we are always drawing from X1->X2. Thus, if the curve is at the top
      ///then we are drawing clockwise, thus sweepflag 1.
      ///The rotation is that the positive angle rotates clockwise.
      ///The rotation angle is always in DEGRESS
      if (1) {
        ds.push(`M${this.localx(X1)},${this.localy(Y1)}`);
      }
      if (1) {
        ds.push(`A${this.localdist(Rx)},${this.localdist(Ry)},${-Phi},${bigarcflag},${sweepflag},${this.localx(X2)},${this.localy(Y2)}`);
      }
      var d = ds.join(' ');
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_drawcontrolpoints(opt,txt,coords) {
    var s = [];
    ///NOTE: the dotsize attribute could be an empty string
    if (typeof this.dotsize === 'number') {
      var r = this.dotsize/2;
    } else {
      var r = 5/2;
    }
    var x0 = null;
    var y0 = null;
    for (var i = 0; i < coords.length    ; i++) {
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = this.localx(z0[0]);
      var y = this.localy(z0[1]);
      var join = z0[2];
      if (join==='C') {
        var i3 = this.localx(z0[3]);
        var i4 = this.localy(z0[4]);
        var i5 = this.localx(z0[5]);
        var i6 = this.localy(z0[6]);
        s.push(`<circle cx='${i3}' cy='${i4}' r='${r}' ${this.dots()}/>`);
        s.push(`<circle cx='${i5}' cy='${i6}' r='${r}' ${this.dots()}/>`);
        s.push(`<rect x='${x-r}' y='${y-r}' width='${r+r}' height='${r+r}' ${this.dots()}/>`);
        if (typeof x0 === 'number' && typeof y0 === 'number') {
          s.push(`<rect x='${x0-r}' y='${y0-r}' width='${r+r}' height='${r+r}' ${this.dots()}/>`);
          x0 = null;
          y0 = null;
        }
      } if (join==='Q') {
        var i3 = this.localx(z0[3]);
        var i4 = this.localy(z0[4]);
        s.push(`<circle cx='${i3}' cy='${i4}' r='${r}' ${this.dots()}/>`);
        s.push(`<rect x='${x-r}' y='${y-r}' width='${r+r}' height='${r+r}' ${this.dots()}/>`);
        if (typeof x0 === 'number' && typeof y0 === 'number') {
          s.push(`<rect x='${x0-r}' y='${y0-r}' width='${r+r}' height='${r+r}' ${this.dots()}/>`);
          x0 = null;
          y0 = null;
        }
      } else {
        x0 = x;
        y0 = y;
      }
    }
    return s.join('\n');
  }

  do_drawline(opt,txt,coords) {
    var o=[];
    var d = this.coordsToD(coords,true);
    var dd = d.split('\n');
    for (d of dd) {
      o.push( `<path d='${d}' ${this.strokes()} ${this.fills()}/>` );
    }
    return o.join('\n');
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
    ///NOTE: the dotsize attribute could be an empty string
    if (typeof this.dotsize === 'number') {
      var r = this.dotsize/2;
    } else {
      var r = 5/2;
    }
    for (var i = 0; i < coords.length    ; i++) {
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = this.localx(z0[0]);
      var y = this.localy(z0[1]);
      s.push(`<circle cx='${x}' cy='${y}' r='${r}' ${this.dots()}/>`);
    }
    return s.join('\n');
  }

  do_rcard(opt,txt,coords) {
    var s = [];
    var w = w*this.u;
    var h = h*this.u;
    var rx = this.fix(0.2*w);
    var dx = this.fix(0.6*w);
    var ry = this.fix(0.2*h);
    var dy = this.fix(0.6*h);
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = this.localx(z0[0]);
      var y = this.localy(z0[1]);
      s.push(`<path d='M${x+rx},${y} h${dx} q${rx},${0},${rx},${-ry} v${-dy} q${0},${-ry},${-rx},${-ry} h${-dx} q${-rx},${0},${-rx},${ry} v${dy} q${rx},${0},${rx},${ry} z' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_rhombus(opt,txt,coords) {
    var s = [];
    var path = `(0,0.5)--(0.5,1)--(1,0.5)--(0.5,0)--cycle`;
    var p0 = this.readCoordsLine(path);
    var f = this.readParamsLine(txt);
    var w = this.assertFloat(f[0],3,0,this.MAX);
    var h = this.assertFloat(f[1],2,0,this.MAX);
    var hw = w/2;
    var hh = h/2;
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
      } else if (opt === '.ctr') {
        var p = this.shiftcoords(p0,-hw,-hh);
      }
      var p = this.scalecoords(p,w,h);
      var p = this.shiftcoords(p,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_trapezoid(opt,txt,coords) {
    var s = [];
    var path = `(0,0)--(1,0)--(0.6,1)--(0.2,1)--(0,0)--();`;
    var p0 = this.readCoordsLine(path);
    var f = this.readParamsLine(txt);
    var w = this.assertFloat(f[0],3,0,this.MAX);
    var h = this.assertFloat(f[1],2,0,this.MAX);
    var hw = w/2;
    var hh = h/2;
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
      } else if (opt === '.ctr') {
        var p = this.shiftcoords(p0,-hw,-hh);
      }
      var p = this.scalecoords(p,w,h);
      var p = this.shiftcoords(p,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_rect(opt,txt,coords) {
    var s = [];
    var path = `(0,0)--(1,0)--(1,1)--(0,1)--(0,0)--();`;
    var p0 = this.readCoordsLine(path);
    var f = this.readParamsLine(txt);
    var w = this.assertFloat(f[0],3,0,this.MAX);
    var h = this.assertFloat(f[1],2,0,this.MAX);
    var hw = w/2;
    var hh = h/2;
    for (var i = 0; i < coords.length    ; i++) {
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
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
      } else if (opt === '.ctr') {
        var p = this.shiftcoords(p0,-hw,-hh);
      }
      var p = this.scalecoords(p,w,h);
      var p = this.shiftcoords(p,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_parallelgram(opt,txt,coords) {
    var s = [];
    var f = this.readParamsLine(txt);
    var w = this.assertFloat(f[0],3,0,this.MAX);
    var h = this.assertFloat(f[1],2,0,this.MAX);
    var sl = this.assertFloat(f[2],0.3,0,1);
    var hw = w/2;
    var hh = h/2;
    var sw = (1-sl);
    var path = `(0,0) [h:${sw}] [l:${sl},1] [h:${-sw}] [l:-${sl},-1] ()`;
    var p0 = this.readCoordsLine(path);
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
      } else if (opt === '.ctr') {
        var p = this.shiftcoords(p0,-hw,-hh);
      }
      var p = this.scalecoords(p,w,h);
      var p = this.shiftcoords(p,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_rrect(opt,txt,coords) {
    var s = [];
    var path = `(0.2,0) [h:0.6] [c:0.2,0,0.2,0,0.2,0.2] [v:0.6] [c:0,0.2,0,0.2,-0.2,0.2] [h:-0.6] [c:-0.2,0,-0.2,0,-0.2,-0.2] [v:-0.6] [c:0,-0.2,0,-0.2,0.2,-0.2] ()`;
    var p0 = this.readCoordsLine(path);
    var f = this.readParamsLine(txt);
    var w = this.assertFloat(f[0],3,0,this.MAX);
    var h = this.assertFloat(f[1],2,0,this.MAX);
    var hw = w/2;
    var hh = h/2;
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
      } else if (opt === '.ctr') {
        var p = this.shiftcoords(p0,-hw,-hh);
      }
      var p = this.scalecoords(p,w,h);
      var p = this.shiftcoords(p,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_label(opt,txt,coords){
    var v = null;
    var s = [];
    var all_labels = txt.split('\\\\');
    var all_labels = all_labels.map(x => x.trim());
    var t0 = 'unassigned';
    var dx = 0;
    var dy = 0;
    var gapx = this.labelgapx;//default 2px gap between the point and the text
    var gapy = this.labelgapy;//default 2px gap between the point and the text
    if (opt==='.lrt') {
      dx = +gapx;///NOTE:these are in SVG COORD where +y goes downwards
      dy = +gapy;
    } else if (opt==='.bot') {
      dy = +gapy;
    } else if (opt==='.llft') {
      dx = -gapx;
      dy = +gapy;
    } else if (opt==='.urt') {
      dx = +gapx;
      dy = -gapy;
    } else if (opt==='.top') {
      dy = -gapy;
    } else if (opt==='.ulft') {
      dx = -gapx;
      dy = -gapy;
    } else if (opt==='.rt') {
      dx = +gapx;
    } else if (opt==='.lft') {
      dx = -gapx;
    } else if (opt==='.ctr') {
    }
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var [x,y] = z0;
      var x = this.localx(x);
      var y = this.localy(y);
      x = x + dx; 
      y = y + dy; 
      var t = all_labels[i];
      if (!t) {
        t = t0;
      } else {
        t0 = t;
      }
      if ((v=this.re_inlinemath.exec(t))!==null) {
        var [w_,h_,defs_,s_] = this.tokenizer.toDiagramSvg(v[1]);
        ///NOTE: the w_ and h_ are always in the unit of pt
        ///NOTE: Shink the svg if the current font size is smaller than 12pt
        if(this.fontsize) {
          var rate = (this.fontsize*0.75)/12.0;
          var nw_ = w_ * rate;///shrink or enlarge
          var nh_ = h_ * rate;///in pt
          var w = nw_*1.333333;///to px
          var h = nh_*1.333333;///to px
        } else {
          nw_ = w_
          nh_ = h_
          var w = nw_*1.333333;///to px
          var h = nh_*1.333333;///to px
        }
        if (opt==='.lrt') {
        } else if (opt==='.bot') {
          x -= w/2;
        } else if (opt==='.llft') {
          x -= w;
        } else if (opt==='.urt') {
          y -= h;
        } else if (opt==='.top') {
          x -= w/2;
          y -= h;
        } else if (opt==='.ulft') {
          x -= w;
          y -= h;
        } else if (opt==='.rt') {
          y -= h/2;
        } else if (opt==='.lft') {
          x -= w;
          y -= h/2;
        } else if (opt==='.ctr') {
          x -= w/2;
          y -= h/2;
        }
        s.push(`<svg x='${x}' y='${y}' width='${nw_}pt' height='${nh_}pt' viewBox='0 0 ${w_*1.3333} ${h_*1.3333}'>${defs_}${s_}</svg>`);
      } else {
        t = this.parser.escape(t);
        if (opt==='.lrt') {
          s.push(`<text text-anchor='start'  ${this.texts()} x='${x}' y='${y}'           dy='0.8em'>${t}</text>`);
        } else if (opt==='.bot') {
          s.push(`<text text-anchor='middle' ${this.texts()} x='${x}' y='${y}'           dy='0.8em'>${t}</text>`);
        } else if (opt==='.llft') {
          s.push(`<text text-anchor='end'    ${this.texts()} x='${x}' y='${y}'           dy='0.8em'>${t}</text>`);
        } else if (opt==='.urt') {
          s.push(`<text text-anchor='start'  ${this.texts()} x='${x}' y='${y}'           dy='-0.2em'>${t}</text>`);
        } else if (opt==='.top') {
          s.push(`<text text-anchor='middle' ${this.texts()} x='${x}' y='${y}'           dy='-0.2em'>${t}</text>`);
        } else if (opt==='.ulft') {
          s.push(`<text text-anchor='end'    ${this.texts()} x='${x}' y='${y}'           dy='-0.2em'>${t}</text>`);
        } else if (opt==='.rt') {
          s.push(`<text text-anchor='start'  ${this.texts()} x='${x}' y='${y}'           dy='0.3em'>${t}</text>`);
        } else if (opt==='.lft') {
          s.push(`<text text-anchor='end'    ${this.texts()} x='${x}' y='${y}'           dy='0.3em'>${t}</text>`);
        } else if (opt==='.ctr') {
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
    if (this.ticksize) {
      s.push(`stroke-width='${this.ticksize}'`);
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
    var p0 = this.readCoordsLine(mypath);
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
      } else if (opt === '.ctr') {
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
    var p0 = this.readCoordsLine(mypath);
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
      } else if (opt === '.ctr') {
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
    var p0 = this.readCoordsLine(mypath);
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
      } else if (opt === '.ctr') {
        var p = this.shiftcoords(p0,-hw,-hh);
      }
      var p = this.shiftcoords(p,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_radical(opt,txt,coords) {
    var s = [];
    var radicallength = 4;
    if (opt) {
      var opt = opt.slice(1);
      var opt = parseInt(opt);
      if (Number.isFinite(opt)){
        radicallength = opt;
      }
    }
    var mypath = `(${radicallength},0)--(0,0)--(0,-2)--(-0.25,-1.5)--(-0.5,-1.75)`;
    var p0 = this.readCoordsLine(mypath);
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = (z0[0]);
      var y = (z0[1]);
      var p = this.shiftcoords(p0,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} fill='none'    />`);
    }
    return s.join('\n');
  }

  do_brick(opt,txt,coords) {
    var s = [];
    var mypath = '(0,0)--(1,0)--(1,0.5)--(0,0.5)--(0,0)--()';
    var p0 = this.readCoordsLine(mypath);
    var w = 1;
    var h = 0.5;
    var hw = w/2;
    var hh = h/2;
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
      } else if (opt === '.ctr') {
        var p = this.shiftcoords(p0,-hw,-hh);
      }
      var p = this.shiftcoords(p,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_protractor(opt,txt,coords) {
    var s = [];
    var paths = [];
    paths.push('(-3.5, 0)--(-0.1,0)..(0,0.1)..(0.1,0)--(3.5, 0)..(0, 3.5)..(-3.5, 0)--() ');
    paths.push('(-2.5100, 0.8500)--(2.5100, 0.8500)..(0, 2.65)..(-2.5100, 0.8500)--() ');
    paths.push('(3.4468,  0.6078)-- (3.0529,  0.5383)) ');
    paths.push('(3.2889,  1.1971)-- (2.9130,  1.0603)) ');
    paths.push('(3.0311,  1.7500)-- (2.6847,  1.5500)) ');
    paths.push('(2.6812,  2.2498)-- (2.3747,  1.9926)) ');
    paths.push('(2.2498,  2.6812)-- (1.9926,  2.3747)) ');
    paths.push('(1.7500,  3.0311)-- (1.5500,  2.6847)) ');
    paths.push('(1.1971,  3.2889)-- (1.0603,  2.9130)) ');
    paths.push('(0.6078,  3.4468)-- (0.5383,  3.0529)) ');
    paths.push('(0.0000,  3.5000)-- (0.0000,  3.1000)) ');
    paths.push('(-3.4468, 0.6078)-- (-3.0529, 0.5383)) ');
    paths.push('(-3.2889, 1.1971)-- (-2.9130, 1.0603)) ');
    paths.push('(-3.0311, 1.7500)-- (-2.6847, 1.5500)) ');
    paths.push('(-2.6812, 2.2498)-- (-2.3747, 1.9926)) ');
    paths.push('(-2.2498, 2.6812)-- (-1.9926, 2.3747)) ');
    paths.push('(-1.7500, 3.0311)-- (-1.5500, 2.6847)) ');
    paths.push('(-1.1971, 3.2889)-- (-1.0603, 2.9130)) ');
    paths.push('(-0.6078, 3.4468)-- (-0.5383, 3.0529)) ');
    paths.push('(0.0000,  0.1000)-- (0.0000,  0.8500)) ');
    var w = 7;
    var h = 3.5;
    var hw = w/2;
    var hh = h/2;
    for (var mypath of paths) {
      var p0 = this.readCoordsLine(mypath);
      for (var i = 0; this.valid(coords, i); i++) {
        var z0 = this.point(coords, i);
        var x = (z0[0]);
        var y = (z0[1]);
        var p = p0;
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} fill='none'/>`);
      }
    }
    return s.join('\n');
  }

  do_circle(opt,txt,coords) {
    var s = [];
    var f = this.readParamsLine(txt);
    var radius = this.assertFloat(f[0],1,0,this.MAX);
    var angle1 = this.assertFloat(f[1],0,-this.MAX,this.MAX);
    var angle2 = this.assertFloat(f[2],45,-this.MAX,this.MAX);
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = (z0[0]);
      var y = (z0[1]);
      if (opt==='') {
        var cx = this.localx(x);
        var cy = this.localy(y);
        var r = this.localdist(radius);
        s.push(`<circle cx='${cx}' cy='${cy}' r='${r}' ${this.strokes()} ${this.fills()}/>`);
      } else if (opt === '.chord') {
        var x1 = x + radius * Math.cos(angle1 / 180 * Math.PI);
        var y1 = y + radius * Math.sin(angle1 / 180 * Math.PI);
        var x2 = x + radius * Math.cos(angle2 / 180 * Math.PI);
        var y2 = y + radius * Math.sin(angle2 / 180 * Math.PI);
        [x1,y1,x2,y2] = this.localline(x1,y1,x2,y2);
        s.push(`<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' ${this.strokes()}/>`);
      } else if (opt === '.arc') {
        var x1 = x + radius * Math.cos(angle1 / 180 * Math.PI);
        var y1 = y + radius * Math.sin(angle1 / 180 * Math.PI);
        var x2 = x + radius * Math.cos(angle2 / 180 * Math.PI);
        var y2 = y + radius * Math.sin(angle2 / 180 * Math.PI);
        if (angle2 >= angle1) {
          var my_angle = angle2 - angle1;
          var my_angle = angle1 + my_angle / 2;
        } else {
          var my_angle = angle2 - angle1 + 360;
          var my_angle = angle1 + my_angle / 2;
          if (my_angle > 360) {
            my_angle -= 360;
          }
        }
        var xm = x + radius   * Math.cos(my_angle / 180 * Math.PI);
        var ym = y + radius   * Math.sin(my_angle / 180 * Math.PI);
        var path = `(${x1},${y1})..(${xm},${ym})..(${x2},${y2})`;
        var p = this.readCoordsLine(path);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} fill='none'/>`);
      } else if (opt === '.cseg') {
        var x1 = x + radius   * Math.cos(angle1 / 180 * Math.PI);
        var y1 = y + radius   * Math.sin(angle1 / 180 * Math.PI);
        var x2 = x + radius   * Math.cos(angle2 / 180 * Math.PI);
        var y2 = y + radius   * Math.sin(angle2 / 180 * Math.PI);
        if (angle2 >= angle1) {
          var my_angle = angle2 - angle1;
          var my_angle = angle1 + my_angle / 2;
        } else {
          var my_angle = angle2 - angle1 + 360;
          var my_angle = angle1 + my_angle / 2;
          if (my_angle > 360) {
            my_angle -= 360;
          }
        }
        var xm = x + radius   * Math.cos(my_angle / 180 * Math.PI);
        var ym = y + radius   * Math.sin(my_angle / 180 * Math.PI);
        var path = `(${x1},${y1})..(${xm},${ym})..(${x2},${y2})--(${x1},${y1})--())`;
        var p = this.readCoordsLine(path);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
    }
    return s.join('\n');
  }

  do_halfcircle(opt,txt,coords) {
    var s = [];
    var f = this.readParamsLine(txt);
    var r = this.assertFloat(f[0],1,0,this.MAX);
    var path='(1,0)..(0,1)..(-1,0)--(1,0)--() ';
    var p0 = this.readCoordsLine(path);
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = (z0[0]);
      var y = (z0[1]);
      if (opt==='.bot') {
        var p = this.rotatecoords(p0,180);
        var p = this.scalecoords(p,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
      else if (opt==='.rt') {
        var p = this.rotatecoords(p0,270);
        var p = this.scalecoords(p,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
      else if (opt==='.lft') {
        var p = this.rotatecoords(p0,90);
        var p = this.scalecoords(p,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
      else {
        var p = this.scalecoords(p0,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      } 
    }
    return s.join('\n');
  }

  do_quadrant(opt,txt,coords) {
    var s = [];
    var f = this.readParamsLine(txt);
    var r = this.assertFloat(f[0],1,0,this.MAX);
    var path='(1,0)..(0.7071067812,0.7071067812)..(0,1)--(0,0)--(1,0)--() ';
    var p0 = this.readCoordsLine(path);
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = (z0[0]);
      var y = (z0[1]);
      if (opt==='.q2') {
        var p = this.rotatecoords(p0,90);
        var p = this.scalecoords(p,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
      else if (opt==='.q3') {
        var p = this.rotatecoords(p0,180);
        var p = this.scalecoords(p,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
      else if (opt==='.q4') {
        var p = this.rotatecoords(p0,270);
        var p = this.scalecoords(p,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
      else {
        var p = this.scalecoords(p0,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      } 
    }
    return s.join('\n');
  }

  do_octant(opt,txt,coords) {
    var s = [];
    var f = this.readParamsLine(txt);
    var r = this.assertFloat(f[0],1,0,this.MAX);
    var path='(1,0)..(0.9238795325112867,0.3826834323650898)..(0.7071067811865475,0.7071067811865475)--(0,0)--(1,0)--() ';
    var p0 = this.readCoordsLine(path);
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var x = (z0[0]);
      var y = (z0[1]);
      if (opt==='.o2') {
        var p = this.rotatecoords(p0,45);
        var p = this.scalecoords(p,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
      else if (opt==='.o3') {
        var p = this.rotatecoords(p0,90);
        var p = this.scalecoords(p,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
      else if (opt==='.o4') {
        var p = this.rotatecoords(p0,135);
        var p = this.scalecoords(p,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
      else if (opt==='.o5') {
        var p = this.rotatecoords(p0,180);
        var p = this.scalecoords(p,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
      else if (opt==='.o6') {
        var p = this.rotatecoords(p0,225);
        var p = this.scalecoords(p,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
      else if (opt==='.o7') {
        var p = this.rotatecoords(p0,270);
        var p = this.scalecoords(p,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
      else if (opt==='.o8') {
        var p = this.rotatecoords(p0,315);
        var p = this.scalecoords(p,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
      else {
        var p = this.scalecoords(p0,r,r);
        var p = this.shiftcoords(p,x,y);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      } 
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

  scalecoords(coords,scalarx,scalary) {
    var s = [];
    for( let [x,y,join,x1,y1,x2,y2] of coords ) {
      if (join=='cycle'||join=='nan') {
        s.push([x,y,join,x1,y1,x2,y2]);
      } else {
        x *= scalarx;
        y *= scalary;
        x1 *= scalarx;
        y1 *= scalary;
        x2 *= scalarx;
        y2 *= scalary;
        s.push([x,y,join,x1,y1,x2,y2]);
      }
    }
    return s;
  }

  rotatecoords(coords,ang_deg) {
    var s = [];
    var costheta = Math.cos(ang_deg/180*Math.PI);
    var sintheta = Math.sin(ang_deg/180*Math.PI);
    for( let [x,y,join,x1,y1,x2,y2] of coords ) {
      if (join=='cycle'||join=='nan') {
        s.push([x,y,join,x1,y1,x2,y2]);
      } else {
        var _x   =   x*costheta -   y*sintheta;
        var _y   =   x*sintheta +   y*costheta;
        var _x1  =  x1*costheta -  y1*sintheta;
        var _y1  =  x1*sintheta +  y1*costheta;
        var _x2  =  x2*costheta -  y2*sintheta;
        var _y2  =  x2*sintheta +  y2*costheta;
        s.push([_x,_y,join,_x1,_y1,_x2,_y2]);
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

  coordsToD(coords,multi=false) {
    ///***NOTE: returns [str,bad_vars]
    ///***NOTE: i.e: (1,2)..(2,3)--cycle
    /// pt[0]: [1,2,'','','']
    /// pt[1]: [2,3,'..','','']
    /// pt[2]: ['cycle','','--','','']
    var o = [];
    var x0 = 0;///last point
    var y0 = 0;
    var u = this.u;
    var isnewseg = 0;
    for (var i in coords) {
      var pt = coords[i];
      var x = this.localx(pt[0]);///NOTE:becomes SVG coords
      var y = this.localy(pt[1]);
      var join = pt[2];
      var p1x = this.localx(pt[3]);/// CUBIC BEZIER curve controlpoint 1x
      var p1y = this.localy(pt[4]);/// CUBIC BEZIER curve controlpoint 1y
      var p2x = this.localx(pt[5]);/// CUBIC BEZIER curve controlpoint 2x
      var p2y = this.localy(pt[6]);/// CUBIC BEZIER curve controlpoint 2y
      ///In case we have a CUBIC BEZIER curve, then pt1 and pt2 are the control points
      if (i == 0) {
        o.push(`M${x},${y}`);
        x0 = x;
        y0 = y;
      }
      else if (multi && isnewseg == 1) {
        isnewseg = 0;
        o.push('\n');
        o.push(`M${x},${y}`);
        x0 = x;
        y0 = y;
      }
      else if (join == 'C') {
        o.push(`C${p1x},${p1y},${p2x},${p2y},${x},${y}`);
        x0 = x;
        y0 = y;
      }
      else if (join == 'Q') {
        o.push(`Q${p1x},${p1y},${x},${y}`);
        x0 = x;
        y0 = y;
      }
      else if (join == 'A') {
        var Rx         = this.localdist(pt[3]);       
        var Ry         = this.localdist(pt[4]);      
        var Phi        = pt[5];        
        var bigarcflag = pt[6];        
        var sweepflag  = pt[7];        
        o.push(`A${Rx},${Ry},${-Phi},${bigarcflag},${sweepflag},${x},${y}`);
        x0 = x;
        y0 = y;
      }
      else if (join == 'cycle') {
        o.push(`z`);
        break;
      }
      else if (join == 'nan') {
        isnewseg = 1;
        continue;
      }
      else {
        o.push(`L${x},${y}`);
        x0 = x;
        y0 = y;
      }
    }
    return o.join(' ');
  }

  do_drawanglearc(opt,txt,coords) {
    var s = [];
    var f = this.readParamsLine(txt);
    var r = this.assertFloat(f[0],0.75,0,this.MAX);
    var r2 = this.assertFloat(f[1],1.50,0,this.MAX);
    var label = this.toString(f[2],'');
    var z0 = this.point(coords, 0);
    var z1 = this.point(coords, 1);
    var z2 = this.point(coords, 2);
    var x0 = z0[0];
    var y0 = z0[1];
    var dx1 = z1[0] - z0[0];
    var dy1 = z1[1] - z0[1];
    var dx2 = z2[0] - z0[0];
    var dy2 = z2[1] - z0[1];
    var ang1 = Math.atan2(dy1, dx1) / Math.PI * 180;
    var ang2 = Math.atan2(dy2, dx2) / Math.PI * 180;
    if (ang1 < 0) { ang1 += 360; }
    if (ang2 < 0) { ang2 += 360; }
    if (ang2 < ang1) { ang2 += 360; }
    var angledelta = ang2 - ang1;
    if (opt==='.sq') {
      ///NOTE: to make the square inscribes the arc
      var x1 = x0 + 0.75*r * Math.cos(ang1 / 180 * Math.PI);
      var y1 = y0 + 0.75*r * Math.sin(ang1 / 180 * Math.PI);
      var x2 = x0 + 0.75*r * Math.cos(ang2 / 180 * Math.PI);
      var y2 = y0 + 0.75*r * Math.sin(ang2 / 180 * Math.PI);
      var xm = x0 + r * Math.cos((ang1+angledelta/2) / 180 * Math.PI);
      var ym = y0 + r * Math.sin((ang1+angledelta/2) / 180 * Math.PI);
      var path = `(${x1},${y1})--(${xm},${ym})--(${x2},${y2})`;
      var p = this.readCoordsLine(path);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} fill='none'/>`);
    } else {
      var x1 = x0 + r * Math.cos(ang1 / 180 * Math.PI);
      var y1 = y0 + r * Math.sin(ang1 / 180 * Math.PI);
      var x2 = x0 + r * Math.cos(ang2 / 180 * Math.PI);
      var y2 = y0 + r * Math.sin(ang2 / 180 * Math.PI);
      var xm = x0 + r * Math.cos((ang1+angledelta/2) / 180 * Math.PI);
      var ym = y0 + r * Math.sin((ang1+angledelta/2) / 180 * Math.PI);
      var path = `(${x1},${y1})..(${xm},${ym})..(${x2},${y2})`;
      var p = this.readCoordsLine(path);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} fill='none'/>`);
    }
    if (label) {
      var ang = ang1+angledelta/2;
      if (ang > 360) {
        ang -= 360;
      }
      var labelx = x0 + (r2) * Math.cos(ang / 180 * Math.PI);
      var labely = y0 + (r2) * Math.sin(ang / 180 * Math.PI);
      var pos = '';
      if (0) {
        if (ang < 22.5) {
          pos = '.rt';
        } else if (ang >= 22.5 && ang < 67.5) {
          pos = '.urt';
        } else if (ang >= 67.5 && ang < 112.5) {
          pos = '.top';
        } else if (ang >= 112.5 && ang < 157.5) {
          pos = '.ulft';
        } else if (ang >= 157.5 && ang < 202.5) {
          pos = '.lft';
        } else if (ang >= 202.5 && ang < 247.5) {
          pos = '.llft';
        } else if (ang >= 247.5 && ang < 292.5) {
          pos = '.bot';
        } else if (ang >= 292.5 && ang < 337.5) {
          pos = '.lrt';
        } else {
          pos = '.rt';
        }
      }
      pos = '.ctr';
      var x = this.localx(labelx);
      var y = this.localy(labely);
      var v;
      if ((v=this.re_inlinemath.exec(label))!==null) {
        var [w_,h_,defs_,s_] = this.tokenizer.toDiagramSvg(v[1]);
        ///NOTE: the w_ and h_ are always in the unit of pt
        var w = w_*1.3333;
        var h = h_*1.3333;
        if (pos==='.lrt') {
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.bot') {
          x -= w/2;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.llft') {
          x -= w;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.urt') {
          y -= h;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.top') {
          x -= w/2;
          y -= h;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.ulft') {
          x -= w;
          y -= h;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.rt') {
          y -= h/2;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.lft') {
          x -= w;
          y -= h/2;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.ctr') {
          x -= w/2;
          y -= h/2;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        }
      } else {
        var t = this.parser.escape(label);
        if (pos==='.lrt') {
          s.push(`<text text-anchor='start'  ${this.texts()} x='${x}' y='${y}' dx='2'    dy='0.8em'>${t}</text>`);
        } else if (pos==='.bot') {
          s.push(`<text text-anchor='middle' ${this.texts()} x='${x}' y='${y}'           dy='0.8em'>${t}</text>`);
        } else if (pos==='.llft') {
          s.push(`<text text-anchor='end'    ${this.texts()} x='${x}' y='${y}' dx='-2'   dy='0.8em'>${t}</text>`);
        } else if (pos==='.urt') {
          s.push(`<text text-anchor='start'  ${this.texts()} x='${x}' y='${y}' dx='2'    dy='-0.2em'>${t}</text>`);
        } else if (pos==='.top') {
          s.push(`<text text-anchor='middle' ${this.texts()} x='${x}' y='${y}'           dy='-0.2em'>${t}</text>`);
        } else if (pos==='.ulft') {
          s.push(`<text text-anchor='end'    ${this.texts()} x='${x}' y='${y}' dx='-2'   dy='-0.2em'>${t}</text>`);
        } else if (pos==='.rt') {
          s.push(`<text text-anchor='start'  ${this.texts()} x='${x}' y='${y}' dx='2'    dy='0.3em'>${t}</text>`);
        } else if (pos==='.lft') {
          s.push(`<text text-anchor='end'    ${this.texts()} x='${x}' y='${y}' dx='-2'   dy='0.3em'>${t}</text>`);
        } else if (pos==='.ctr') {
          s.push(`<text text-anchor='middle' ${this.texts()} x='${x}' y='${y}'           dy='0.3em'>${t}</text>`);
        }
      }
    }
    return s.join('\n');
  }

  do_reset() {
    return '';
  }

  do_set(key) {
    return '';
  }

  do_cartesian(opt,act,floats) {
    var s = [];
    var id = opt.slice(1);
    if (!this.cartesians[id]) {
      this.cartesians[id] = {};
      var A = this.cartesians[id];
      A.xorigin = 0;
      A.yorigin = 0;
      A.xgrid = 1;
      A.ygrid = 1;
    }
    var A = this.cartesians[id];
    switch( act ) {
      case 'setup':
        A.xorigin = this.assertFloat(floats[0],0,0,this.MAX);
        A.yorigin = this.assertFloat(floats[1],0,0,this.MAX);
        A.xgrid = this.assertFloat(floats[2],1,0.001,this.MAX);
        A.ygrid = this.assertFloat(floats[3],1,0.001,this.MAX);
        break;
       
      case 'xaxis':
        var x1 = this.assertFloat(floats[0],0);
        var x2 = this.assertFloat(floats[1],0);
        x1 /= A.xgrid;
        x2 /= A.xgrid;
        x1 += A.xorigin;
        x2 += A.xorigin;
        var y1 = A.yorigin;
        var y2 = A.yorigin;
        x1 = this.localx(x1);
        x2 = this.localx(x2);
        y1 = this.localy(y1);
        y2 = this.localy(y2);
        s.push(`<path d='M${x1},${y1} L${x2},${y2}' ${this.strokes()} ${this.fills()} marker-start='url(#startArrow)' marker-end='url(#markerArrow)'/>`);
        break;

      case 'yaxis':
        var y1 = this.assertFloat(floats[0],0);
        var y2 = this.assertFloat(floats[1],0);
        var ystep = this.assertFloat(floats[2],0);
        y1 /= A.ygrid;
        y2 /= A.ygrid;
        y1 += A.yorigin;
        y2 += A.yorigin;
        var x1 = A.xorigin;
        var x2 = A.xorigin;
        y1 = this.localy(y1);
        y2 = this.localy(y2);
        x1 = this.localx(x1);
        x2 = this.localx(x2);
        s.push(`<path d='M${x1},${y1} L${x2},${y2}' ${this.strokes()} ${this.fills()} marker-start='url(#startArrow)' marker-end='url(#markerArrow)'/>`);
        break;

      case 'xticks':
        for (var j=0; j < floats.length; ++j) {
          var x = floats[j];
          var y = 0;
          x /= A.xgrid;
          y /= A.ygrid;
          x += A.xorigin;
          y += A.yorigin;
          x = this.localx(x);
          y = this.localy(y);
          ///var dy = +this.labelgapy;
          var t = floats[j];
          s.push(`<line x1='${x}' y1='${y}' x2='${x}' y2='${y+3}' ${this.strokes()} fill='none' />`);
          s.push(`<text text-anchor='middle' ${this.texts()} x='${x}' y='${y+3+1}' dy='0.8em'>${t}</text>`);
        }
        break;

      case 'yticks':
        for (var j=0; j < floats.length; ++j) {
          var y = floats[j];
          var x = 0;
          x /= A.xgrid;
          y /= A.ygrid;
          x += A.xorigin;
          y += A.yorigin;
          x = this.localx(x);
          y = this.localy(y);
          ///var dy = +this.labelgapy;
          ///var dx = -this.labelgapx;
          var t = floats[j];
          s.push(`<line x1='${x}' y1='${y}' x2='${x-3}' y2='${y}' ${this.strokes()} fill='none' />`);
          s.push(`<text text-anchor='end' ${this.texts()} x='${x-3-1}' y='${y}' dy='0.3em'>${t}</text>`);
        }
        break;

      case 'curve':
        var mypathdd = [];
        for( var j=0; j < floats.length; j+=2 ) {
          var x = floats[j];
          var y = floats[j+1];
          if (Number.isFinite(x)&&Number.isFinite(y)){
            x /= A.xgrid;
            y /= A.ygrid;
            x += A.xorigin;
            y += A.yorigin;
            mypathdd.push(`(${x},${y})`);
          }
        }
        var mypath = mypathdd.join('..');
        var p = this.readCoordsLine(mypath);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
        break;

      case 'plot':
        if (typeof this.dotsize === 'number') {
          var r = this.dotsize/2;
        } else {
          var r = 5/2;
        }
        for( var j=0; j < floats.length; j+=2 ) {
          var x = floats[j];
          var y = floats[j+1];
          if (Number.isFinite(x)&&Number.isFinite(y)){
            x /= A.xgrid;
            y /= A.ygrid;
            x += A.xorigin;
            y += A.yorigin;
            x = this.localx(x);
            y = this.localy(y);
            s.push(`<circle cx='${x}' cy='${y}' r='${r}' ${this.dots()}/>`);
          }
        }
        break;

      default:
        break;
    }
    
    return s.join('\n');
  }


}

module.exports = { NitrilePreviewDiagramSVG };
