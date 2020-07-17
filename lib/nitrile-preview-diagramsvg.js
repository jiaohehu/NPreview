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
    if(this.config.grid && this.config.grid == 'boxed'){
      for (var x = 0; x <= this.width; x+=this.width) {
        x1 = x * u;
        x2 = x * u;
        y1 = 0;
        y2 = this.height * u;
        o.push(`<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke-opacity='0.10' stroke='inherit'/>`);
      }
      for (var y = 0; y <= this.height; y+=this.height) {
        y1 = y * u;
        y2 = y * u;
        x1 = 0;
        x2 = this.width * u;
        o.push(`<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke-opacity='0.10' stroke='inherit'/>`);
      }
    }else if(this.config.grid && this.config.grid == 'none'){
    }else{
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
    x *= this.refs;
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
    y *= this.refs;
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
    else if (typeof color === 'string' && color[0] == '#') {
      color = color.slice(1);
      return this.webrgb_to_svgrgb_s(color);
    }
    else if (typeof color === 'string') {
      return color;
    } 
    else {
      return 'none';
    }
  }

  to_textdraws(g) {
    var s = [];
    if (g.fontcolor) {
      s.push(`fill='${this.to_colors(g.fontcolor)}'`);
    }
    s.push(`stroke='none'`);
    return s.join(' ');
  }

  to_linecaps(s) {
    if (s === 'butt') {
      return 'butt';
    } else if (s === 'round') {
      return 'round';
    } else if (s === 'square') {
      return 'square';
    }
    return '';
  }
  
  to_linejoins(s) {
    if (s === 'miter') {
      return 'miter';
    } else if (s === 'round') {
      return 'round';
    } else if (s === 'bevel') {
      return 'bevel';
    }
    return '';
  }
  
  do_drawarc(opt,txt,g,coords){
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
      s.push(`<path d='${d}' ${this.to_drawonlys(g)} />`);
    }
    return s.join('\n');
  }

  do_drawcontrolpoints(opt,txt,g,coords){    
    var s = [];
    ///NOTE: the dotsize attribute could be an empty string
    var r = this.to_dotsize_radius(g);
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
        s.push(`<circle cx='${i3}' cy='${i4}' r='${r}' ${this.to_dots(g)}/>`);
        s.push(`<circle cx='${i5}' cy='${i6}' r='${r}' ${this.to_dots(g)}/>`);
        s.push(`<rect x='${x-r}' y='${y-r}' width='${r+r}' height='${r+r}' ${this.to_dots(g)}/>`);
        if (typeof x0 === 'number' && typeof y0 === 'number') {
          s.push(`<rect x='${x0-r}' y='${y0-r}' width='${r+r}' height='${r+r}' ${this.to_dots(g)}/>`);
          x0 = null;
          y0 = null;
        }
      } if (join==='Q') {
        var i3 = this.localx(z0[3]);
        var i4 = this.localy(z0[4]);
        s.push(`<circle cx='${i3}' cy='${i4}' r='${r}' ${this.to_dots(g)}/>`);
        s.push(`<rect x='${x-r}' y='${y-r}' width='${r+r}' height='${r+r}' ${this.to_dots(g)}/>`);
        if (typeof x0 === 'number' && typeof y0 === 'number') {
          s.push(`<rect x='${x0-r}' y='${y0-r}' width='${r+r}' height='${r+r}' ${this.to_dots(g)}/>`);
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

  do_rcard(opt,txt,g,coords){
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
      s.push(`<path d='M${x+rx},${y} h${dx} q${rx},${0},${rx},${-ry} v${-dy} q${0},${-ry},${-rx},${-ry} h${-dx} q${-rx},${0},${-rx},${ry} v${dy} q${rx},${0},${rx},${ry} z' ${this.to_filldraws(g)} />`);
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

  do_box(opt,txt,g,coords){   
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
      s.push(`<path d='${d}' ${this.to_filldraws(g)} />`);
      ///draw label
      var x = this.localx(x);
      var y = this.localy(y);
      var label = all_labels[i];
      label = label||'';
      if (label) {
        s.push(this.drawtext(x,y,label,'ctr',g));
      }
    }
    return s.join('\n');
  }

  do_protractor(opt,txt,g,coords) {
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
        s.push(`<path d='${d}' ${this.to_drawonlys(g)} />`);
      }
    }
    return s.join('\n');
  }

  do_updnprotractor(opt,txt,g,coords) {
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
        s.push(`<path d='${d}' ${this.to_drawonlys(g)} />`);
      }
    }
    return s.join('\n');
  }

  do_radical(opt,txt,g,coords){
    var s = [];
    var radicallength = 4;
    if (opt) {
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
      s.push(`<path d='${d}' ${this.to_drawonlys(g)} />`);
    }
    return s.join('\n');
  }

  do_circle(opt,txt,g,coords){
    var s = [];
    var radius = this.assertFloat(g.r,1);
    for (var i = 0; i < coords.length; i++){
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = (z0[0]);
      var y = (z0[1]);
      if(1){
        //fullcircle
        var cx = this.localx(x);
        var cy = this.localy(y);
        var r = this.localdist(radius);
        s.push(`<circle cx='${cx}' cy='${cy}' r='${r}' ${this.to_filldraws(g)} />`);
      }
    }
    return s.join('\n');
  }

  do_pie(opt,txt,g,coords){
    var s = [];
    var radius = this.assertFloat(g.r,1);
    var angle1 = this.assertFloat(g.a1,0);       
    var angle2 = this.assertFloat(g.a2,45);       
    for (var i = 0; i < coords.length; i++){
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = (z0[0]);
      var y = (z0[1]);
      if(1){
        //pie       
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
        s.push(`<path d='M ${x} ${y} L ${x1} ${y1} A ${r} ${r} 0 ${bigflag} 0 ${x2} ${y2} Z' ${this.to_filldraws(g)} />`);
      } 
    }
    return s.join('\n');
  }

  do_chord(opt,txt,g,coords){
    var s = [];
    var radius = this.assertFloat(g.r,1);
    var angle1 = this.assertFloat(g.a1,0);       
    var angle2 = this.assertFloat(g.a2,45);       
    for (var i = 0; i < coords.length; i++){
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = (z0[0]);
      var y = (z0[1]);
      if(1){
        //chord
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
        s.push(`<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' ${this.to_drawonlys(g)} />`);
      } 
    }
    return s.join('\n');
  }

  do_arc(opt,txt,g,coords){
    var s = [];
    var radius = this.assertFloat(g.r,1);
    var angle1 = this.assertFloat(g.a1,0);
    var angle2 = this.assertFloat(g.a2,45);
    for (var i = 0; i < coords.length; i++){
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = (z0[0]);
      var y = (z0[1]);
      if(1){
        //arc  
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
        s.push(`<path d='M ${x1} ${y1} A ${r} ${r} 0 ${bigflag} 0 ${x2} ${y2}' ${this.to_drawonlys(g)} />`);
      }
    }
    return s.join('\n');
  }

  do_cseg(opt,txt,g,coords){
    var s = [];
    var radius = this.assertFloat(g.r,1);
    var angle1 = this.assertFloat(g.a1,0);
    var angle2 = this.assertFloat(g.a2,45);
    for (var i = 0; i < coords.length; i++){
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = (z0[0]);
      var y = (z0[1]);
      if(1){
        //cseg
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
        s.push(`<path d='M ${x1} ${y1} A ${r} ${r} 0 ${bigflag} 0 ${x2} ${y2} Z' ${this.to_filldraws(g)} />`);
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
      else if (join == 'cycle') {
        o.push(`z`);
        if(multi){
          isnewseg = 1;
          continue;
        }else{
          break;
        }
      }
      else if (join == 'nan') {
        if(multi){
          isnewseg = 1;
        }
        continue;
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
      else {
        o.push(`L${x},${y}`);
        x0 = x;
        y0 = y;
      }
    }
    return o.join(' ');
  }

  do_drawanglearc(opt,txt,g,coords){   
    var s = [];
    var r = this.assertFloat(g.r,0.75,0,this.MAX);
    var r2 = this.assertFloat(g.r2,1.50,0,this.MAX);
    var label = txt;
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
    if (opt==='sq') {
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
      s.push(`<path d='${d}' ${this.to_drawonlys(g)} />`);
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
      s.push(`<path d='${d}' ${this.to_drawonlys(g)} />`);
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
      s.push(this.drawtext(labelx,labely,label,'ctr',g));
    }
    return s.join('\n');
  }

  do_reset() {
    return '';
  }

  drawtext(x,y,label,justi,g) {
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
    } else {
      //treat it as 'urt'
      dx = +gapx;
      dy = -gapy;
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
      } else {
        ///treat it as 'urt'
        y -= vh;
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
      } else {
        anchor = 'start', dy='-0.2em';
      }
      d.push(`<text font-size='${this.parser.config.HTML.diagfontsizept}pt' text-anchor='${anchor}' ${this.to_textdraws(g)} x='${x}' y='${y}' dy='${dy}'>${label}</text>`);
    }
    return d.join('\n');
  }

  p_path(coords,p,g){
    var d = this.coordsToD(coords,true);
    var x = [];
    if(p.arrowstart){
      x.push(`marker-start='url(#startArrow)'`);
    }
    if(p.arrowend){
      x.push(`marker-end='url(#markerArrow)'`);
    }
    return(`<path d='${d}' ${this.to_filldraws(g)} ${x.join(' ')}/>`);
  }

  p_dot(x,y,g){
    var r = this.to_dotsize_radius(g);
    var o = [];
    var x = this.localx(x);
    var y = this.localy(y);
    o.push(`<circle cx='${x}' cy='${y}' r='${r}' ${this.to_dots(g)}/>`);
    return o.join('\n');
  }

  p_rect(x,y,w,h,g){
    var o = [];
    var x = this.localx(x);
    var y = this.localy(y);
    var w = this.localdist(w);
    var h = this.localdist(h);
    y = y - h;
    o.push(`<rect x='${x}' y='${y}' width='${w}' height='${h}' ${this.to_filldraws(g)} />`);
    return o.join('\n');
  }

  p_hbar(x,y,g){
    var o = [];
    var x = parseFloat(x);
    var y = parseFloat(y);
    var X = this.localx(x);
    var Y = this.localy(y);
    var dx = this.barlength;
    var x2 = x + dx;
    var X2 = this.localx(x2);
    var Y2 = this.localy(y);
    o.push(`<line x1='${X}' y1='${Y}' x2='${X2}' y2='${Y2}' ${this.to_drawonlys(g)}/>`);
    return o.join('\n');
  }

  p_vbar(x,y,g){
    var o = [];
    var x = parseFloat(x);
    var y = parseFloat(y);
    var X = this.localx(x);
    var Y = this.localy(y);
    var dy = this.barlength;
    var X2 = this.localx(x);
    var Y2 = this.localy(y+dy);
    o.push(`<line x1='${X}' y1='${Y}' x2='${X2}' y2='${Y2}' ${this.to_drawonlys(g)}/>`);
    return o.join('\n');
  }

  p_label(x,y,txt,a,g){
    var X = this.localx(x);
    var Y = this.localy(y);
    return this.drawtext(X,Y,txt,a,g);
  }

  to_drawonlys(g) {
    g = g||{};
    var o = [];
    if (g.linedashed) {
      o.push(`stroke-dasharray='2'`);
    } else if (g.linedashed === 'withdots') {
      o.push(`stroke-dasharray='1 1'`);
    }
    if (g.linesize) {
      let linesize = parseFloat(g.linesize);
      if(Number.isFinite(linesize)){
        o.push(`stroke-width='${linesize*1.333}'`);
      }
    }
    if (g.linecolor) {
      o.push(`stroke='${this.to_colors(g.linecolor)}'`);
    } else {
      o.push(`stroke='inherit'`);
    }
    if (g.linecap) {
      o.push(`stroke-linecap='${this.to_linecaps(g.linecap)}'`);
    } 
    if (g.linejoin) {
      o.push(`stroke-linejoin='${this.to_linejoins(g.linejoin)}'`);
    } 
    o.push(`fill='none'`);
    return o.join(' ');
  }

  to_filldraws(g) {
    g = g||{};
    var o = [];
    if (g.linedashed) {
      o.push(`stroke-dasharray='2'`);
    } else if (g.linedashed === 'withdots') {
      o.push(`stroke-dasharray='1 1'`);
    }
    if (g.linesize) {
      let linesize = parseFloat(g.linesize);
      if(Number.isFinite(linesize)){
        o.push(`stroke-width='${linesize*1.333}'`);
      }
    }
    if (g.linecolor) {
      o.push(`stroke='${this.to_colors(g.linecolor)}'`);
    } else {
      o.push(`stroke='inherit'`);
    }
    if (g.linecap) {
      o.push(`stroke-linecap='${this.to_linecaps(g.linecap)}'`);
    } 
    if (g.linejoin) {
      o.push(`stroke-linejoin='${this.to_linejoins(g.linejoin)}'`);
    } 
    if (g.fillcolor) {
      o.push(`fill='${this.to_colors(g.fillcolor)}'`);
    } else {
      o.push(`fill='none'`)
    }
    return o.join(' ');
  }

  to_fillonlys(g) {
    g = g||{};
    var o = [];
    if (g.fillcolor) {
      o.push(`fill='${this.to_colors(g.fillcolor)}'`);
    } else {
      o.push(`fill='inherit'`)
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

  to_texts(g) {
    var o = [];
    if (g.fontcolor) {
      o.push(`fill='${this.to_colors(g.fontcolor)}'`);
    }
    o.push(`stroke='none'`);
    return o.join(' ');
  }

  p_ellipse(x,y,Rx,Ry,angle,g){
    var o = [];
    var x1 = x + Rx * Math.cos(angle/180*Math.PI);
    var y1 = y + Rx * Math.sin(angle/180*Math.PI);
    var x2 = x - Rx * Math.cos(angle/180*Math.PI);
    var y2 = y - Rx * Math.sin(angle/180*Math.PI);
    x1 = this.localx(x1);
    y1 = this.localy(y1);
    x2 = this.localx(x2);
    y2 = this.localy(y2);
    Rx = this.localdist(Rx);
    Ry = this.localdist(Ry);
    o.push(`<path d='M${x1},${y1} A${Rx},${Ry},${-angle},1,0,${x2},${y2}' ${this.to_filldraws(g)} />`);//anti-clockwise
    o.push(`<path d='M${x1},${y1} A${Rx},${Ry},${-angle},1,1,${x2},${y2}' ${this.to_filldraws(g)} />`);//clockwise
    return o.join('\n');
  }

  to_dotsize_radius(g){
    if(g.dotsize){
      var d = parseFloat(g.dotsize);
      if(Number.isFinite(d)){
        return d/2;
      }
    } 
    return 5/2;
  }

  p_arc(x,y,r,a1,a2,g){
    var x1 = x + r*Math.cos(a1/180*Math.PI); 
    var y1 = y + r*Math.sin(a1/180*Math.PI); 
    var x2 = x + r*Math.cos(a2/180*Math.PI); 
    var y2 = y + r*Math.sin(a2/180*Math.PI); 
    x1 = this.localx(x1);
    y1 = this.localy(y1);
    x2 = this.localx(x2);
    y2 = this.localy(y2);
    r = this.localdist(r);
    if (a2-a1 < 180) {
      return(`<path d='M${x1},${y1} A${r},${r},0,0,0,${x2},${y2}' ${this.to_drawonlys(g)} />`);
    } else {
      return(`<path d='M${x1},${y1} A${r},${r},0,1,0,${x2},${y2}' ${this.to_drawonlys(g)} />`);
    }
  }

  p_shape(x,y,p,g){
    var sx = this.assertFloat(g.sx,1);
    var sy = this.assertFloat(g.sy,1);
    var p = this.scalecoords(p, sx, sy);//refs
    var p = this.shiftcoords(p, x, y);//refx,refy
    var d = this.coordsToD(p,true);
    return(`<path d='${d}' ${this.to_filldraws(g)} />`);
  }

  webrgb_to_svgrgb_s(s){
    // convert a string such as EFD to rgb(93%,100%,87%)
    // will truncate to 2 decimal places
    // convert a string such as E0F0D0 to (93%,100%,87%)
    if(s.length==6){
      var r = s.substr(0,2); r = parseInt(`0x${r}`); r /= 255;
      var g = s.substr(2,2); g = parseInt(`0x${g}`); g /= 255;
      var b = s.substr(4,2); b = parseInt(`0x${b}`); b /= 255;
    }else if(s.length==3){
      var r = s.substr(0,1); r = parseInt(`0x${r}`); r /= 15;
      var g = s.substr(1,1); g = parseInt(`0x${g}`); g /= 15;
      var b = s.substr(2,1); b = parseInt(`0x${b}`); b /= 15;
    } else {
      var r = 1;
      var g = 1;
      var b = 1;
    }
    r *= 100;
    g *= 100;
    b *= 100;
    r = this.fix0(r);;
    g = this.fix0(g);;
    b = this.fix0(b);;
    return `rgb(${r}%,${g}%,${b}%)`;
  }
}

module.exports = { NitrilePreviewDiagramSVG };
