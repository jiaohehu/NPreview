'use babel';

const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');
const { arcpath } = require('./nitrile-preview-arcpath');

class NitrilePreviewDiagramSVG extends NitrilePreviewDiagram {

  constructor(parser,notes,tokenizer) {
    super(parser,notes);
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
      o.push(`<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke-opacity='0.10' stroke='inherit'/>`);
    }
    for (var y = 0; y <= this.height; y++) {
      y1 = y * u;
      y2 = y * u;
      x1 = 0;
      x2 = this.width * u;
      o.push(`<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke-opacity='0.10' stroke='inherit'/>`);
    }
    o.push('<defs>');
    o.push(`<marker id='markerArrow' markerWidth='3' markerHeight='4' refX='3' refY='2' orient='auto'> <path d='M0,0 L3,2 L0,4 z' stroke='none' fill='context-stroke'/> </marker>`);
    o.push(`<marker id='startArrow'  markerWidth='3' markerHeight='4' refX='0' refY='2' orient='auto'> <path d='M3,0 L3,4 L0,2 z' stroke='none' fill='context-stroke'/> </marker>`);
    o.push('</defs>');
    o.push(s);    
    var s = o.join('\n');
    return {s,vw,vh};
  }

  do_comment(s) {
    s = s.replace(/\-\-/g,'');
    s = s.replace(/\\/g,'\\\\');
    s = this.parser.smooth(s);
    return `<!-- ${s} -->`;
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

  to_colors(color) {
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
    /*
    if (this.fontsize) {
      s.push(`font-size='${this.fix2(0.75*this.fontsize)}pt'`);
    } else {
      s.push(`font-size='12pt'`);
    }
    */
    if (this.fontcolor) {
      s.push(`fill='${this.to_colors(this.fontcolor)}'`);
    }
    s.push(`stroke='none'`);
    return s.join(' ');
  }

  def_fills() {
    var s = [];
    if (this.fillcolor) {
      s.push(`fill='${this.to_colors(this.fillcolor)}'`);
    } else {
      s.push(`fill='inherit'`)
    }
    return s.join(' ');
  }

  fills() {
    var s = [];
    if (this.fillcolor) {
      s.push(`fill='${this.to_colors(this.fillcolor)}'`);
    } else {
      s.push(`fill='none'`)
    }
    return s.join(' ');
  }

  def_strokes() {
    var s = [];
    if (this.linedashed === 'evenly') {
      s.push(`stroke-dasharray='2'`);
    } else if (this.linedashed === 'withdots') {
      s.push(`stroke-dasharray='1 1'`);
    }
    if (typeof this.linesize === 'number') {
      if(this.linesize==0){
      }else{
        s.push(`stroke-width='${this.linesize}'`);
      }
    }
    if (this.linecolor) {
      s.push(`stroke='${this.to_colors(this.linecolor)}'`);
    } else {
      s.push(`stroke='inherit'`);
    }
    if (this.linecap) {
      s.push(`stroke-linecap='${this.linecaps(this.linecap)}'`);
    } 
    if (this.linejoin) {
      s.push(`stroke-linejoin='${this.linejoins(this.linejoin)}'`);
    } 
    
    return s.join(' ');
  }

  strokes() {
    var s = [];
    if (this.linedashed === 'evenly') {
      s.push(`stroke-dasharray='2'`);
    } else if (this.linedashed === 'withdots') {
      s.push(`stroke-dasharray='1 1'`);
    }
    if (typeof this.linesize === 'number') {
      s.push(`stroke-width='${this.linesize}'`);
    }
    if (this.linecolor) {
      s.push(`stroke='${this.to_colors(this.linecolor)}'`);
    } else {
      s.push(`stroke='inherit'`);
    }
    if (this.linecap) {
      s.push(`stroke-linecap='${this.linecaps(this.linecap)}'`);
    } 
    if (this.linejoin) {
      s.push(`stroke-linejoin='${this.linejoins(this.linejoin)}'`);
    } 
    
    return s.join(' ');
  }

  linecaps(s) {
    if (s === 'butt') {
      return 'butt';
    } else if (s === 'round') {
      return 'round';
    } else if (s === 'square') {
      return 'square';
    }
    return '';
  }
  
  linejoins(s) {
    if (s === 'miter') {
      return 'miter';
    } else if (s === 'round') {
      return 'round';
    } else if (s === 'bevel') {
      return 'bevel';
    }
    return '';
  }
  
  dots() {
    var s = [];
    if (this.dotcolor) {
      s.push(`fill='${this.to_colors(this.dotcolor)}'`);
    } else {
      s.push(`fill='inherit'`);
    }
    s.push(`stroke='none'`);
    return s.join(' ');
  }

  do_drawarc(opt,txt,coords) {
    ///this functionality has been incorporated into 'line' , with [a:Rx,Ry,Phi,bigf,sweepf,X1,Y1]
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

  do_line(opt,txt,coords) {
    var o=[];
    var d = this.coordsToD(coords,true);
    var dd = d.split('\n');
    for (d of dd) {
      o.push( `<path d='${d}' ${this.def_strokes()} fill='none' />` );
    }
    return o.join('\n');
  }

  do_area(opt,txt,coords) {
    var o=[];
    var d = this.coordsToD(coords,true);
    var dd = d.split('\n');
    for (d of dd) {
      o.push( `<path d='${d}' stroke='none' ${this.def_fills()} />` );
    }
    return o.join('\n');
  }

  do_fill(opt,txt,coords) {
    var o=[];
    var d = this.coordsToD(coords,true);
    var dd = d.split('\n');
    for (d of dd) {
      o.push( `<path d='${d}' ${this.def_strokes()} ${this.def_fills()} />` );
    }
    return o.join('\n');
  }

  do_arrow(opt,txt,coords) {
    var o=[];
    var d = this.coordsToD(coords);
    return `<path d='${d}' ${this.def_strokes()} fill='none' marker-end='url(#markerArrow)'/>`;
  }

  do_revarrow(opt,txt,coords) {
    var o=[];
    var d = this.coordsToD(coords);
    return `<path d='${d}' ${this.def_strokes()} fill='none' marker-start='url(#startArrow)'/>`;
  }

  do_dblarrow(opt,txt,coords) {
    var o=[];
    var d = this.coordsToD(coords);
    return `<path d='${d}' ${this.def_strokes()} fill='none' marker-start='url(#startArrow)' marker-end='url(#markerArrow)'/>`;
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
    var f = this.readParamsStyle(txt);
    var w = this.assertFloat(f.w,3,0,this.MAX);
    var h = this.assertFloat(f.h,2,0,this.MAX);
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
    var path = `(0,0)--(1,0)--(0.6,1)--(0.2,1)--cycle;`;
    var p0 = this.readCoordsLine(path);
    var f = this.readParamsStyle(txt);
    var w = this.assertFloat(f.w,3,0,this.MAX);
    var h = this.assertFloat(f.h,2,0,this.MAX);
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
    var path = `(0,0)--(1,0)--(1,1)--(0,1)--cycle;`;
    var p0 = this.readCoordsLine(path);
    var f = this.readParamsStyle(txt);
    var w = this.assertFloat(f.w,3,0,this.MAX);
    var h = this.assertFloat(f.h,2,0,this.MAX);
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
    var f = this.readParamsStyle(txt);
    var w = this.assertFloat(f.w,3,0,this.MAX);
    var h = this.assertFloat(f.h,2,0,this.MAX);
    var sl = this.assertFloat(f.sl,0.3,0,1);
    var hw = w/2;
    var hh = h/2;
    var sw = (1-sl);
    var path = `(0,0) [h:${sw}] [l:${sl},1] [h:${-sw}] [l:-${sl},-1] cycle`;
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
    var path = `(0.2,0) [h:0.6] [c:0.2,0,0.2,0,0.2,0.2] [v:0.6] [c:0,0.2,0,0.2,-0.2,0.2] [h:-0.6] [c:-0.2,0,-0.2,0,-0.2,-0.2] [v:-0.6] [c:0,-0.2,0,-0.2,0.2,-0.2] cycle`;
    var p0 = this.readCoordsLine(path);
    var f = this.readParamsStyle(txt);
    var w = this.assertFloat(f.w,3,0,this.MAX);
    var h = this.assertFloat(f.h,2,0,this.MAX);
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
    var t0 = '';
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      var [x,y] = z0;
      var x = this.localx(x);
      var y = this.localy(y);
      var t = all_labels[i];
      if (!t) {
        t = t0;
      } else {
        t0 = t;
      }
      s.push(this.drawtext(x,y,t,opt.slice(1)));
    }
    return s.join('\n');
  }

  ticks() {
    var s = [];
    if (this.tickcolor) {
      s.push(`stroke='${this.to_colors(this.tickcolor)}'`);
    } else {
      s.push(`stroke='inherit'`);
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
    var mypath = '(.5,.7)..(.25,.85)..(0,.4)..(.5,0)..(1.0,.5)..(.8,.9)..(.5,.7)--(.5,.7)..(.6,1.0)..(.3,1.1)--(.3,1.1)..(.4,1.0)..(.5,.7)--cycle';
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
    var mypath = '(0.3,0)--(2.6,0)..(2.8,1)..(3,2)--(3,2)..(1.5,1.5)..(0,2)--(0,2)..(0.2,1)..(0.3,0)--cycle';
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
    var mypath = '(4,2)--(0,2)--(0,0)--(4,0)--(4,2)--(0,2)--(1,3)--(5,3)--(4,2)--(4,0)--(5,1)--(5,3)--(4,2)--cycle';
    var p0 = this.readCoordsLine(mypath);
    var w = 5;
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

  do_box(opt,txt,coords) {
    var s = [];
    var boxlength = 4;
    var re = /(\d)x(\d)/;
    w = 2;
    h = 2;
    if (opt) {
      var v = re.exec(opt);
      if (v) {
        var w = parseInt(v[1]);
        var h = parseInt(v[2]);
      } 
    }
    var hw = w/2;
    var hh = h/2;
    var mypath = `(${-hw},${-hh})--(${hw},${-hh})--(${hw},${hh})--(${-hw},${hh})--cycle)`;
    var p0 = this.readCoordsLine(mypath);
    var all_labels = txt.split('\\\\');
    var all_labels = all_labels.map(x => x.trim());
    for (var i = 0; i < coords.length    ; i++) {
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = (z0[0]);
      var y = (z0[1]);
      var p = this.shiftcoords(p0,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()} />`);
      ///draw label
      var x = this.localx(x);
      var y = this.localy(y);
      var label = all_labels[i];
      label = label||'';
      if (label) {
        s.push(this.drawtext(x,y,label,'ctr'));
      }
    }
    return s.join('\n');
  }

  do_brick(opt,txt,coords) {
    var s = [];
    var mypath = '(0,0)--(1,0)--(1,0.5)--(0,0.5)--cycle';
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
    paths.push('(-3.5, 0)--(-0.1,0)..(0,0.1)..(0.1,0)--(3.5, 0)..(0, 3.5)..(-3.5, 0)--cycle ');
    paths.push('(-2.5100, 0.8500)--(2.5100, 0.8500)..(0, 2.65)..(-2.5100, 0.8500)--cycle ');
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

  do_updnprotractor(opt,txt,coords) {
    var s = [];
    var paths = [];
    paths.push('(-3.5, 0)--(-0.1,0)..(0,-0.1)..(0.1,0)--(3.5, 0)..(0,-3.5)..(-3.5, 0)--cycle ');
    paths.push('(-2.5100,-0.8500)--(2.5100,-0.8500)..(0,-2.65)..(-2.5100,-0.8500)--cycle ');
    paths.push('( 3.4468, -0.6078)-- ( 3.0529, -0.5383)) ');
    paths.push('( 3.2889, -1.1971)-- ( 2.9130, -1.0603)) ');
    paths.push('( 3.0311, -1.7500)-- ( 2.6847, -1.5500)) ');
    paths.push('( 2.6812, -2.2498)-- ( 2.3747, -1.9926)) ');
    paths.push('( 2.2498, -2.6812)-- ( 1.9926, -2.3747)) ');
    paths.push('( 1.7500, -3.0311)-- ( 1.5500, -2.6847)) ');
    paths.push('( 1.1971, -3.2889)-- ( 1.0603, -2.9130)) ');
    paths.push('( 0.6078, -3.4468)-- ( 0.5383, -3.0529)) ');
    paths.push('( 0.0000, -3.5000)-- ( 0.0000, -3.1000)) ');
    paths.push('(-3.4468, -0.6078)-- (-3.0529, -0.5383)) ');
    paths.push('(-3.2889, -1.1971)-- (-2.9130, -1.0603)) ');
    paths.push('(-3.0311, -1.7500)-- (-2.6847, -1.5500)) ');
    paths.push('(-2.6812, -2.2498)-- (-2.3747, -1.9926)) ');
    paths.push('(-2.2498, -2.6812)-- (-1.9926, -2.3747)) ');
    paths.push('(-1.7500, -3.0311)-- (-1.5500, -2.6847)) ');
    paths.push('(-1.1971, -3.2889)-- (-1.0603, -2.9130)) ');
    paths.push('(-0.6078, -3.4468)-- (-0.5383, -3.0529)) ');
    paths.push('( 0.0000, -0.1000)-- ( 0.0000, -0.8500)) ');
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
    var f = this.readParamsStyle(txt);
    if (opt==='.fill') {
      var drawopt = `${this.def_strokes()} ${this.def_fills()}`
    } else if (opt==='.area') {
      var drawopt = `stroke='none' ${this.def_fills()}`;
    } else {
      var drawopt = `${this.def_strokes()} fill='none'`;
    }
    var radius = f.r?parseFloat(f.r):1;
    var angle1 = parseFloat(f.start);       
    var angle2 = parseFloat(f.stop);       
    for (var i = 0; i < coords.length; i++){
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = (z0[0]);
      var y = (z0[1]);
      if(Number.isFinite(radius) && Number.isFinite(angle1) && Number.isFinite(angle2)){
        var angle1 = parseFloat(f.start);       
        var angle2 = parseFloat(f.stop);       
        var x1 = x + radius * Math.cos(angle1 / 180 * Math.PI);
        var y1 = y + radius * Math.sin(angle1 / 180 * Math.PI);
        var x2 = x + radius * Math.cos(angle2 / 180 * Math.PI);
        var y2 = y + radius * Math.sin(angle2 / 180 * Math.PI);
        var diff = angle2 - angle1;
        if(diff < 0) diff += 360;
        else if(diff > 360) diff -= 360;
        if (diff > 180) {
          var bigflag = 1;
        } else {
          var bigflag = 0;
        }
        var x = this.localx(x);
        var y = this.localy(y);
        var x1 = this.localx(x1);
        var y1 = this.localy(y1);
        var x2 = this.localx(x2);
        var y2 = this.localy(y2);
        var r = this.localdist(radius);
        // part of a circle
        s.push(`<path d='M ${x} ${y} L ${x1} ${y1} A ${r} ${r} 0 ${bigflag} 0 ${x2} ${y2} Z' ${drawopt} />`);
      } else if (Number.isFinite(radius)){
        //fullcircle
        var cx = this.localx(x);
        var cy = this.localy(y);
        var r = this.localdist(radius);
        s.push(`<circle cx='${cx}' cy='${cy}' r='${r}' ${drawopt} />`);
      }
    }
    return s.join('\n');
  }

  do_chord(opt,txt,coords) {
    var s = [];
    var drawopt = `${this.def_strokes()} fill='none'`;
    var f = this.readParamsStyle(txt);
    var radius = f.r?parseFloat(f.r):1;
    var angle1 = parseFloat(f.start);       
    var angle2 = parseFloat(f.stop);       
    for (var i = 0; i < coords.length; i++){
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = (z0[0]);
      var y = (z0[1]);
      if(Number.isFinite(radius) && Number.isFinite(angle1) && Number.isFinite(angle2)){
        var x1 = x + radius * Math.cos(angle1 / 180 * Math.PI);
        var y1 = y + radius * Math.sin(angle1 / 180 * Math.PI);
        var x2 = x + radius * Math.cos(angle2 / 180 * Math.PI);
        var y2 = y + radius * Math.sin(angle2 / 180 * Math.PI);
        var diff = angle2 - angle1;
        if(diff < 0) diff += 360;
        else if(diff > 360) diff -= 360;
        if (diff > 180) {
          var bigflag = 1;
        } else {
          var bigflag = 0;
        }
        var x = this.localx(x);
        var y = this.localy(y);
        var x1 = this.localx(x1);
        var y1 = this.localy(y1);
        var x2 = this.localx(x2);
        var y2 = this.localy(y2);
        var r = this.localdist(radius);
        s.push(`<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' ${drawopt} />`);
      } 
    }
    return s.join('\n');
  }

  do_arc(opt,txt,coords) {
    var s = [];
    var f = this.readParamsStyle(txt);
    var drawopt = `${this.def_strokes()} fill='none'`;
    var radius = f.r?parseFloat(f.r):1;
    var angle1 = parseFloat(f.start);
    var angle2 = parseFloat(f.stop);
    for (var i = 0; i < coords.length; i++){
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = (z0[0]);
      var y = (z0[1]);
      if(Number.isFinite(radius) && Number.isFinite(angle1) && Number.isFinite(angle2)){
        var x1 = x + radius * Math.cos(angle1 / 180 * Math.PI);
        var y1 = y + radius * Math.sin(angle1 / 180 * Math.PI);
        var x2 = x + radius * Math.cos(angle2 / 180 * Math.PI);
        var y2 = y + radius * Math.sin(angle2 / 180 * Math.PI);
        var diff = angle2 - angle1;
        if(diff < 0) diff += 360;
        else if(diff > 360) diff -= 360;
        if (diff > 180) {
          var bigflag = 1;
        } else {
          var bigflag = 0;
        }
        var x = this.localx(x);
        var y = this.localy(y);
        var x1 = this.localx(x1);
        var y1 = this.localy(y1);
        var x2 = this.localx(x2);
        var y2 = this.localy(y2);
        var r = this.localdist(radius);
        s.push(`<path d='M ${x1} ${y1} A ${r} ${r} 0 ${bigflag} 0 ${x2} ${y2}' ${drawopt} />`);
      }
    }
    return s.join('\n');
  }

  do_cseg(opt,txt,coords) {
    var s = [];
    if (opt==='.fill') {
      var drawopt = `${this.def_strokes()} ${this.def_fills()}`
    } else if (opt==='.area') {
      var drawopt = `stroke='none' ${this.def_fills()}`;
    } else {
      var drawopt = `${this.def_strokes()} fill='none'`;
    }
    var f = this.readParamsStyle(txt);
    var radius = f.r?parseFloat(f.r):1;
    var angle1 = parseFloat(f.start);
    var angle2 = parseFloat(f.stop);
    for (var i = 0; i < coords.length; i++){
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = (z0[0]);
      var y = (z0[1]);
      if(Number.isFinite(radius) && Number.isFinite(angle1) && Number.isFinite(angle2)){
        var x1 = x + radius * Math.cos(angle1 / 180 * Math.PI);
        var y1 = y + radius * Math.sin(angle1 / 180 * Math.PI);
        var x2 = x + radius * Math.cos(angle2 / 180 * Math.PI);
        var y2 = y + radius * Math.sin(angle2 / 180 * Math.PI);
        var diff = angle2 - angle1;
        if(diff < 0) diff += 360;
        else if(diff > 360) diff -= 360;
        if (diff > 180) {
          var bigflag = 1;
        } else {
          var bigflag = 0;
        }
        var x = this.localx(x);
        var y = this.localy(y);
        var x1 = this.localx(x1);
        var y1 = this.localy(y1);
        var x2 = this.localx(x2);
        var y2 = this.localy(y2);
        var r = this.localdist(radius);
        s.push(`<path d='M ${x1} ${y1} A ${r} ${r} 0 ${bigflag} 0 ${x2} ${y2} Z' ${drawopt} />`);
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
        var Rx         = this.localdist(pt[7]);       
        var Ry         = this.localdist(pt[8]);      
        var Phi        = pt[9];        
        var bigarcflag = pt[10];        
        var sweepflag  = pt[11];        
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

  do_anglearc(opt,txt,coords) {
    var s = [];
    var f = this.readParamsStyle(txt);
    var r = this.assertFloat(f.r,0.75,0,this.MAX);
    var r2 = this.assertFloat(f.r2,1.50,0,this.MAX);
    var label = this.toString(f.label,'');
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
      var labelx = this.localx(labelx);
      var labely = this.localy(labely);
      s.push(this.drawtext(labelx,labely,label,'ctr'));
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

      case 'xtick':
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
          s.push(`<line x1='${x}' y1='${y}' x2='${x}' y2='${y+3.78}' ${this.strokes()} fill='none' />`);
          s.push(`<text text-anchor='middle' ${this.texts()} x='${x}' y='${y+3.78}' dy='0.8em'>${t}</text>`);
        }
        break;

      case 'ytick':
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
          s.push(`<line x1='${x}' y1='${y}' x2='${x-3.78}' y2='${y}' ${this.strokes()} fill='none' />`);
          s.push(`<text text-anchor='end' ${this.texts()} x='${x-3.78}' y='${y}' dy='0.3em'>${t}</text>`);
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

      case 'ellipse':
        /// x,y,angle,rx,ry
        var x     = this.assertFloat(floats[0],0);
        var y     = this.assertFloat(floats[1],0);
        var Rx    = this.assertFloat(floats[2],2);
        var Ry    = this.assertFloat(floats[3],1);
        var angle = this.assertFloat(floats[4],0);
        if (Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(angle)&&Number.isFinite(Rx)&&Number.isFinite(Ry)){
          var x1 = x + Rx * Math.cos(angle/180*Math.PI);
          var y1 = y + Rx * Math.sin(angle/180*Math.PI);
          var x2 = x - Rx * Math.cos(angle/180*Math.PI);
          var y2 = y - Rx * Math.sin(angle/180*Math.PI);
          x1 /= A.xgrid;
          y1 /= A.ygrid;
          x1 += A.xorigin;
          y1 += A.yorigin;
          x1 = this.localx(x1);
          y1 = this.localy(y1);
          x2 /= A.xgrid;
          y2 /= A.ygrid;
          x2 += A.xorigin;
          y2 += A.yorigin;
          x2 = this.localx(x2);
          y2 = this.localy(y2);
          Rx /= A.xgrid;
          Ry /= A.ygrid;
          Rx = this.localdist(Rx);
          Ry = this.localdist(Ry);
          s.push(`<path d='M${x1},${y1} A${Rx},${Ry},${-angle},1,0,${x2},${y2}' ${this.strokes()} ${this.fills()}/>`);//anti-clockwise
          s.push(`<path d='M${x1},${y1} A${Rx},${Ry},${-angle},1,1,${x2},${y2}' ${this.strokes()} ${this.fills()}/>`);//clockwise
        }
        break;

      case 'line':
        var d = '';
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
            if (j==0) {
              d = `M${x},${y}`;
            } else {
              d += ` L${x},${y}`;
            }
            s.push(`<path d='${d}' ${this.strokes()} fill='none'/>`);
          }
        }
        break;

      case 'arrow':
        var d = '';
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
            if (j==0) {
              d = `M${x},${y}`;
            } else {
              d += ` L${x},${y}`;
            }
            s.push(`<path d='${d}' ${this.strokes()} fill='none' marker-end='url(#markerArrow)'/>`);
          }
        }
        break;

      case 'text' :
        var labels = this.label.split('\\\\');
        var justis = this.justi.split('\\\\');
        for( var j=0,n=0; j < floats.length; j+=2,n++ ) {
          var x = floats[j];
          var y = floats[j+1];
          if (Number.isFinite(x)&&Number.isFinite(y)){
            x /= A.xgrid;
            y /= A.ygrid;
            x += A.xorigin;
            y += A.yorigin;
            x = this.localx(x);
            y = this.localy(y);
            var label = (n<labels.length)?labels[n]:labels[labels.length-1];
            var justi = (n<justis.length)?justis[n]:justis[justis.length-1];
            s.push(this.drawtext(x,y,label,justi));
          }
        }
        break;

      case 'arc' :
        /// cartesian arc x y r ang1 ang2
        var x     = this.assertFloat(floats[0],0);
        var y     = this.assertFloat(floats[1],0);
        var r     = this.assertFloat(floats[2],1);
        var a1    = this.assertFloat(floats[3],0);
        var a2    = this.assertFloat(floats[4],45);
        if(Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(r)&&Number.isFinite(a1)&&Number.isFinite(a2)){
          var x1 = x + r*Math.cos(a1/180*Math.PI); 
          var y1 = x + r*Math.sin(a1/180*Math.PI); 
          var x2 = x + r*Math.cos(a2/180*Math.PI); 
          var y2 = x + r*Math.sin(a2/180*Math.PI); 
          x1 /= A.xgrid;
          y1 /= A.ygrid;
          x1 += A.xorigin;
          y1 += A.yorigin;
          x2 /= A.xgrid;
          y2 /= A.ygrid;
          x2 += A.xorigin;
          y2 += A.yorigin;
          x1 = this.localx(x1);
          y1 = this.localy(y1);
          x2 = this.localx(x2);
          y2 = this.localy(y2);
          r = this.localdist(r);
          if (a2-a1 < 180) {
            s.push(`<path d='M${x1},${y1} A${r},${r},0,0,0,${x2},${y2}' ${this.strokes()} fill='none'/>`);
          } else {
            s.push(`<path d='M${x1},${y1} A${r},${r},0,1,0,${x2},${y2}' ${this.strokes()} fill='none'/>`);
          }
        }
        break;

      default:
        break;
    }
    
    return s.join('\n');
  }

  drawtext(x,y,label,justi) {
    /// (x,y) is the SVG-coordinates. 
    /// (label) is a string, it will be math if it is surrounded by double-backtick,
    /// such as ``\sqrt{2}``, otherwise it will be a normal text
    /// (justi) is a string such as "ctr", "urt", "top", etc.
    /// For math string it is: "<svg...></svg>", for normal string it is "<text.../>"
    ///
    /// figure out dx/dy first, this is taken from current settings of labelgapx/labelgapy
    var gapx = this.labelgapx;
    var gapy = this.labelgapy;
    var dx = 0;
    var dy = 0;
    if (justi==='lrt') {
      dx = +gapx;///NOTE:these are in SVG COORD where +y goes downwards
      dy = +gapy;
    } else if (justi==='bot') {
      dy = +gapy;
    } else if (justi==='llft') {
      dx = -gapx;
      dy = +gapy;
    } else if (justi==='urt') {
      dx = +gapx;
      dy = -gapy;
    } else if (justi==='top') {
      dy = -gapy;
    } else if (justi==='ulft') {
      dx = -gapx;
      dy = -gapy;
    } else if (justi==='rt') {
      dx = +gapx;
    } else if (justi==='lft') {
      dx = -gapx;
    } else if (justi==='ctr') {
    }
    x += dx;
    y += dy;
    ///is it inline math or text?
    var d = [];
    var v;
    if ((v=this.re_inlinemath.exec(label))!==null) {
      var {s,w,h,defs} = this.tokenizer.toDiagMathSvg(v[1]);
      var vw = w*1.3333;///convert to px
      var vh = h*1.3333;///convert to px
      if (justi==='lrt') {
      } else if (justi==='bot') {
        x -= vw/2;
      } else if (justi==='llft') {
        x -= vw;
      } else if (justi==='urt') {
        y -= vh;
      } else if (justi==='top') {
        x -= vw/2;
        y -= vh;
      } else if (justi==='ulft') {
        x -= vw;
        y -= vh;
      } else if (justi==='rt') {
        y -= vh/2;
      } else if (justi==='lft') {
        x -= vw;
        y -= vh/2;
      } else if (justi==='ctr') {
        x -= vw/2;
        y -= vh/2;
      }
      d.push(`<svg x='${x}' y='${y}' width='${vw}' height='${vh}' fill='inherit' stroke='inherit' viewBox='0 0 ${vw} ${vh}'><defs>${defs.join('\n')}</defs>${s}</svg>`);
    } else {
      label = this.parser.smooth(label);
      var anchor = 'middle', dy='0.3em';
      if (justi==='lrt') {
        anchor = 'start', dy='0.8em';
      } else if (justi==='bot') {
        anchor = 'middle', dy='0.8em';
      } else if (justi==='llft') {
        anchor = 'end', dy='0.8em';
      } else if (justi==='urt') {
        anchor = 'start', dy='-0.2em';
      } else if (justi==='top') {
        anchor = 'middle', dy='-0.2em';
      } else if (justi==='ulft') {
        anchor = 'end', dy='-0.2em';
      } else if (justi==='rt') {
        anchor = 'start', dy='0.3em';
      } else if (justi==='lft') {
        anchor = 'end', dy='0.3em';
      } else if (justi==='ctr') {
        anchor = 'middle', dy='0.3em';
      }
      d.push(`<text font-size='${this.parser.config.HTML.diagfontsizept}pt' text-anchor='${anchor}' ${this.texts()} x='${x}' y='${y}' dy='${dy}'>${label}</text>`);
    }
    return d.join('\n');
  }

  do_p_path(points,isclosed,g){
    var d = [];
    for(var i=0; i < points.length; i+=2){
      var x = points[i];
      var y = points[i+1];
      var x = this.localx(x);
      var y = this.localy(y);
      if(i==0){
        d.push(`M${x},${y}`);
      }else{
        d.push(`L${x},${y}`);
      }
    }
    if(isclosed){
      d.push('z');
    }
    d = d.join(' ');
    return(`<path d='${d}' ${this.to_strokes(g)} ${this.to_fills(g)} />`);
  }

  do_p_dots(points,g){
    if (typeof this.dotsize === 'number') {
      var r = this.dotsize/2;
    } else {
      var r = 5/2;
    }
    var o = [];
    for(var i=0; i < points.length; i+=2){
      var x = points[i];
      var y = points[i+1];
      var x = this.localx(x);
      var y = this.localy(y);
      o.push(`<circle cx='${x}' cy='${y}' r='${r}' ${this.to_dots(g)}/>`);
    }
    return o.join('\n');
  }

  do_p_rect(x,y,w,h,g){
    var o = [];
    var x = this.localx(x);
    var y = this.localy(y);
    var w = this.localdist(w);
    var h = this.localdist(h);
    y = y - h;
    o.push(`<rect x='${x}' y='${y}' width='${w}' height='${h}' ${this.to_strokes(g)} ${this.to_fills(g)}/>`);
    return o.join('\n');
  }

  to_strokes(g) {
    g = g||{};
    var o = [];
    if (g.linedashed === 'evenly') {
      o.push(`stroke-dasharray='2'`);
    } else if (g.linedashed === 'withdots') {
      o.push(`stroke-dasharray='1 1'`);
    }
    if (typeof g.linesize === 'number') {
      o.push(`stroke-width='${this.linesize}'`);
    }
    if (g.linecolor) {
      o.push(`stroke='${this.to_colors(g.linecolor)}'`);
    } else {
      o.push(`stroke='inherit'`);
    }
    if (g.linecap) {
      o.push(`stroke-linecap='${g.linecaps(g.linecap)}'`);
    } 
    if (g.linejoin) {
      o.push(`stroke-linejoin='${this.linejoins()}'`);
    } 
    return o.join(' ');
  }

  to_fills(g) {
    g = g||{};
    var o = [];
    if (g.fillcolor) {
      o.push(`fill='${this.to_colors(g.fillcolor)}'`);
    } else {
      o.push(`fill='none'`)
    }
    return o.join(' ');
  }

  to_dots(g){
    g = g||{};
    var o = [];
    if (g.dotcolor) {
      o.push(`fill='${this.to_colors(g.dotcolor)}'`);
    } else {
      o.push(`fill='inherit'`);
    }
    o.push(`stroke='none'`);
    return o.join(' ');
  }
}

module.exports = { NitrilePreviewDiagramSVG };
