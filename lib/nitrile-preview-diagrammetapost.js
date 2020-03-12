'use babel';

const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');
const { arcpath } = require('./nitrile-preview-arcpath');

class NitrilePreviewDiagramMETAPOST extends NitrilePreviewDiagram {

  constructor(parser) {
    super(parser);
    this.re_unit = /^(\d+)mm$/;
    this.re_inlinemath = /^\`\`(.*)\`\`$/;
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
    ///now we need to add new items at the beginning
    /// these items needs to be constracted after all
    /// previous p's have been processed because it needs
    /// to be dependant on some of the command line options
    /// settings such as width and height.
    var ym = this.height;
    var xm = this.width;
    var a1 = `pu := \\mpdim{\\linewidth}/${xm};`;
    var a2 = `u := ${this.unit};`;
    var a3 = `ratio := pu/u;`;
    var a4 = `picture wheel;`;
    var a5 = `wheel := image(`;
    var a6 = `for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`;
    var a7 = `for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`;
    o.push(a1, a2, a3, a4, a5, a6, a7);
    if (this.config.grid) {
      var ym = this.height;
      var xm = this.width;
      var a8 = `for i=0 step 5 until ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .8white; endfor;`;
      var a9 = `for i=0 step 5 until ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .8white; endfor;`;
      var a10 = `for i=0 step 10 until ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .7white; endfor;`;
      var a11 = `for i=0 step 10 until ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .7white; endfor;`;
      o.push(a8, a9, a10, a11);
    }
    o.push(s);
    o.push(`);`);
    o.push(`draw wheel scaled(ratio);`);
    return [o.join('\n')];
  }

  do_comment(s) {
    return `% <-- ${s} -->`;
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
      if (X1 > X2) {
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
      //console.log('james: drawarc: tao1=',ang1);
      //console.log('james: drawarc: tao2=',ang2);
      //console.log('james: drawarc: Cx=',Cx);
      //console.log('james: drawarc: Cy=',Cy);
      //console.log('james: drawarc: Rx=',Rx);
      //console.log('james: drawarc: Ry=',Ry);
      //console.log('james: drawarc: Phi=',Phi);
      ///NOTE: need to draw an arc 
      var points = [];
      var ds = [];
      var z0 = this.point(coords, 0);
      var x = z0[0];
      var y = z0[1];
      var bigarcflag = (this.bigarcflag)?1:0;
      var sweepflag = (this.position=='top')?1:0;///1-clockwise;1-anticlockwise;
      ///NOTE: that X1 is always at the left hand side of X2, and
      ///we are always drawing from X1->X2. Thus, if the curve is at the top
      ///then we are drawing clockwise, thus sweepflag 1.
      ///The rotation is that the positive angle rotates clockwise.
      ///The rotation angle is always in DEGRESS
      if (1) {
        ds.push(`M${this.localx(X1)},${this.localy(Y1)}`);
      }
      if (1) {
        ds.push(`A${this.localdist(Rx)},${this.localdist(Ry)},-${Phi},${bigarcflag},${sweepflag},${this.localx(X2)},${this.localy(Y2)}`);
      }
      var d = ds.join(' ');
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
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

  do_rhombus(opt,txt,coords) {
    var s = [];
    var path = `(0,0.5)--(0.5,1)--(1,0.5)--(0.5,0)--cycle`;
    var p0 = this.readCoordsLine(null,path);
    var w = this.rectw;
    var h = this.recth;
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
      var p = this.scalecoords(p,this.rectw,this.recth);
      var p = this.shiftcoords(p,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_trapezoid(opt,txt,coords) {
    var s = [];
    var path = `(0,0)--(1,0)--(0.6,1)--(0.2,1)--(0,0)--();`;
    var p0 = this.readCoordsLine(null,path);
    var w = this.rectw;
    var h = this.recth;
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
      var p = this.scalecoords(p,this.rectw,this.recth);
      var p = this.shiftcoords(p,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_rect(opt,txt,coords) {
    var s = [];
    var path = `(0,0)--(1,0)--(1,1)--(0,1)--(0,0)--();`;
    var p0 = this.readCoordsLine(null,path);
    var w = this.rectw;
    var h = this.recth;
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
      var p = this.scalecoords(p,this.rectw,this.recth);
      var p = this.shiftcoords(p,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_parallelgram(opt,txt,coords) {
    var s = [];
    var w = this.rectw;
    var h = this.recth;
    var hw = w/2;
    var hh = h/2;
    var sl = (this.slant);
    var sw = (1-this.slant);
    var path = `(0,0) [h:${sw}] [l:${sl},1] [h:${-sw}] [l:-${sl},-1] ()`;
    var p0 = this.readCoordsLine(null,path);
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
      var p = this.scalecoords(p,this.rectw,this.recth);
      var p = this.shiftcoords(p,x,y);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
    }
    return s.join('\n');
  }

  do_rrect(opt,txt,coords) {
    var s = [];
    var path = `(0.2,0) [h:0.6] [c:0.2,0,0.2,0,0.2,0.2] [v:0.6] [c:0,0.2,0,0.2,-0.2,0.2] [h:-0.6] [c:-0.2,0,-0.2,0,-0.2,-0.2] [v:-0.6] [c:0,-0.2,0,-0.2,0.2,-0.2] ()`;
    var p0 = this.readCoordsLine(null,path);
    var w = this.rectw;
    var h = this.recth;
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
      var p = this.scalecoords(p,this.rectw,this.recth);
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
        var gap = 2;
        if (opt==='.lrt') {
          x += gap;
          y += gap;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (opt==='.bot') {
          x -= w/2;
          y += gap;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
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
          x -= w/2;
          y -= h;
          y -= gap;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (opt==='.ulft') {
          x -= w;
          x -= gap;
          y -= h;
          y -= gap;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (opt==='.rt') {
          x += gap;
          y -= h/2;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (opt==='.lft') {
          x -= w;
          x -= gap;
          y -= h/2;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (opt==='.ctr') {
          x -= w/2;
          y -= h/2;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        }
      } else {
        t = this.parser.escape(t);
        if (opt==='.lrt') {
          s.push(`<text text-anchor='start'  ${this.texts()} x='${x}' y='${y}' dx='2'    dy='0.8em'>${t}</text>`);
        } else if (opt==='.bot') {
          s.push(`<text text-anchor='middle' ${this.texts()} x='${x}' y='${y}'           dy='0.8em'>${t}</text>`);
        } else if (opt==='.llft') {
          s.push(`<text text-anchor='end'    ${this.texts()} x='${x}' y='${y}' dx='-2'   dy='0.8em'>${t}</text>`);
        } else if (opt==='.urt') {
          s.push(`<text text-anchor='start'  ${this.texts()} x='${x}' y='${y}' dx='2'    dy='-0.2em'>${t}</text>`);
        } else if (opt==='.top') {
          s.push(`<text text-anchor='middle' ${this.texts()} x='${x}' y='${y}'           dy='-0.2em'>${t}</text>`);
        } else if (opt==='.ulft') {
          s.push(`<text text-anchor='end'    ${this.texts()} x='${x}' y='${y}' dx='-2'   dy='-0.2em'>${t}</text>`);
        } else if (opt==='.rt') {
          s.push(`<text text-anchor='start'  ${this.texts()} x='${x}' y='${y}' dx='2'    dy='0.3em'>${t}</text>`);
        } else if (opt==='.lft') {
          s.push(`<text text-anchor='end'    ${this.texts()} x='${x}' y='${y}' dx='-2'   dy='0.3em'>${t}</text>`);
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
    var mypath = this.coordsToMetaPost(p0);
    var w = 1;
    var h = 1;
    var hw = 0.5;
    var hh = 0.5;
    var myshifted = '';
    if (opt === '.top') {
      myshifted = 'shifted(-hw,0)';
    } else if (opt === '.bot') {
      myshifted = 'shifted(-hw,-h)';
    } else if (opt === '.rt') {
      myshifted = 'shifted(0,-hh)';
    } else if (opt === '.lft') {
      myshifted = 'shifted(-w,-hh)';
    } else if (opt === '.ctr') {
      myshifted = 'shifted(-hw,-hh)';
    } else if (opt === '.urt') {
      myshifted = 'shifted(0,0)';
    } else if (opt === '.ulft') {
      myshifted = 'shifted(-w,0)';
    } else if (opt === '.lrt') {
      myshifted = 'shifted(0,-h)';
    } else if (opt === '.llft') {
      myshifted = 'shifted(-w,-h)';
    }
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      z0 = this.torefpt(z0);
      var x = z0[0];
      var y = z0[1];
      if (this.fillcolor) {
        s.push(`fill (${mypath}) ${myshifted} shifted(${x},${y}) scaled(u) ${this.fills()};`);
      }
      if (this.linewidth !== '0') {
        s.push(`draw (${mypath}) ${myshifted} shifted(${x},${y}) scaled(u) ${this.draws()};`);
      }
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
    var mypath = `(${this.radicallength},0)--(0,0)--(0,-2)--(-0.25,-1.5)--(-0.5,-1.75)`;
    var p0 = this.readCoordsLine(null,mypath);
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
    var p0 = this.readCoordsLine(null,mypath);
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
      var p0 = this.readCoordsLine(null,mypath);
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
    var radius = this.diameter/2;
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
        var x1 = x + radius * Math.cos(this.angle1 / 180 * Math.PI);
        var y1 = y + radius * Math.sin(this.angle1 / 180 * Math.PI);
        var x2 = x + radius * Math.cos(this.angle2 / 180 * Math.PI);
        var y2 = y + radius * Math.sin(this.angle2 / 180 * Math.PI);
        [x1,y1,x2,y2] = this.localline(x1,y1,x2,y2);
        s.push(`<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' ${this.strokes()}/>`);
      } else if (opt === '.arc') {
        var x1 = x + radius * Math.cos(this.angle1 / 180 * Math.PI);
        var y1 = y + radius * Math.sin(this.angle1 / 180 * Math.PI);
        var x2 = x + radius * Math.cos(this.angle2 / 180 * Math.PI);
        var y2 = y + radius * Math.sin(this.angle2 / 180 * Math.PI);
        if (this.angle2 >= this.angle1) {
          var my_angle = this.angle2 - this.angle1;
          var my_angle = this.angle1 + my_angle / 2;
        } else {
          var my_angle = this.angle2 - this.angle1 + 360;
          var my_angle = this.angle1 + my_angle / 2;
          if (my_angle > 360) {
            my_angle -= 360;
          }
        }
        var xm = x + radius   * Math.cos(my_angle / 180 * Math.PI);
        var ym = y + radius   * Math.sin(my_angle / 180 * Math.PI);
        var path = `(${x1},${y1})..(${xm},${ym})..(${x2},${y2})`;
        var p = this.readCoordsLine(null,path);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} fill='none'/>`);
      } else if (opt === '.cseg') {
        var x1 = x + radius   * Math.cos(this.angle1 / 180 * Math.PI);
        var y1 = y + radius   * Math.sin(this.angle1 / 180 * Math.PI);
        var x2 = x + radius   * Math.cos(this.angle2 / 180 * Math.PI);
        var y2 = y + radius   * Math.sin(this.angle2 / 180 * Math.PI);
        if (this.angle2 >= this.angle1) {
          var my_angle = this.angle2 - this.angle1;
          var my_angle = this.angle1 + my_angle / 2;
        } else {
          var my_angle = this.angle2 - this.angle1 + 360;
          var my_angle = this.angle1 + my_angle / 2;
          if (my_angle > 360) {
            my_angle -= 360;
          }
        }
        var xm = x + radius   * Math.cos(my_angle / 180 * Math.PI);
        var ym = y + radius   * Math.sin(my_angle / 180 * Math.PI);
        var path = `(${x1},${y1})..(${xm},${ym})..(${x2},${y2})--(${x1},${y1})--())`;
        var p = this.readCoordsLine(null,path);
        var d = this.coordsToD(p);
        s.push(`<path d='${d}' ${this.strokes()} ${this.fills()}/>`);
      }
    }
    return s.join('\n');
  }

  do_halfcircle(opt,txt,coords) {
    var s = [];
    var r = (this.diameter/2);
    var path='(1,0)..(0,1)..(-1,0)--(1,0)--() ';
    var p0 = this.readCoordsLine(null,path);
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
    var r = (this.diameter/2);
    var path='(1,0)..(0.7071067812,0.7071067812)..(0,1)--(0,0)--(1,0)--() ';
    var p0 = this.readCoordsLine(null,path);
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
    var r = (this.diameter/2);
    var path='(1,0)..(0.9238795325112867,0.3826834323650898)..(0.7071067811865475,0.7071067811865475)--(0,0)--(1,0)--() ';
    var p0 = this.readCoordsLine(null,path);
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

  coordsToD(coords) {
    ///***NOTE: returns [str,bad_vars]
    ///***NOTE: i.e: (1,2)..(2,3)--cycle
    /// pt[0]: [1,2,'','','']
    /// pt[1]: [2,3,'..','','']
    /// pt[2]: ['cycle','','--','','']
    var o = [];
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
      ///In case we have a CUBIC BEZIER curve, then pt1 and pt2 are the control points
      if (i == 0) {
        o.push(`M${x},${y}`);
      }
      else if (join == '..') {
        o.push(`C${p1x},${p1y},${p2x},${p2y},${x},${y}`);
      }
      else if (join == 'cycle') {
        o.push(`z`);
        break;
      }
      else if (join == 'nan') {
        continue;
      }
      else {
        o.push(`L${x},${y}`);
      }
    }
    return o.join(' ');
  }

  do_drawanglearc(opt,txt,coords) {
    var s = [];
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
    var radius = this.anglearcradius;
    var angledelta = ang2 - ang1;
    if (opt==='.sq') {
      ///NOTE: to make the square inscribes the arc
      var x1 = x0 + 0.7*radius * Math.cos(ang1 / 180 * Math.PI);
      var y1 = y0 + 0.7*radius * Math.sin(ang1 / 180 * Math.PI);
      var x2 = x0 + 0.7*radius * Math.cos(ang2 / 180 * Math.PI);
      var y2 = y0 + 0.7*radius * Math.sin(ang2 / 180 * Math.PI);
      var xm = x0 + radius * Math.cos((ang1+angledelta/2) / 180 * Math.PI);
      var ym = y0 + radius * Math.sin((ang1+angledelta/2) / 180 * Math.PI);
      var path = `(${x1},${y1})--(${xm},${ym})--(${x2},${y2})`;
      var p = this.readCoordsLine(null,path);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} fill='none'/>`);
    } else {
      var x1 = x0 + radius * Math.cos(ang1 / 180 * Math.PI);
      var y1 = y0 + radius * Math.sin(ang1 / 180 * Math.PI);
      var x2 = x0 + radius * Math.cos(ang2 / 180 * Math.PI);
      var y2 = y0 + radius * Math.sin(ang2 / 180 * Math.PI);
      var xm = x0 + radius * Math.cos((ang1+angledelta/2) / 180 * Math.PI);
      var ym = y0 + radius * Math.sin((ang1+angledelta/2) / 180 * Math.PI);
      var path = `(${x1},${y1})..(${xm},${ym})..(${x2},${y2})`;
      var p = this.readCoordsLine(null,path);
      var d = this.coordsToD(p);
      s.push(`<path d='${d}' ${this.strokes()} fill='none'/>`);
    }
    if (txt) {
      var ang = ang1+angledelta/2;
      if (ang > 360) {
        ang -= 360;
      }
      var labelx = x0 + (this.anglearclabeloffset+radius) * Math.cos(ang / 180 * Math.PI);
      var labely = y0 + (this.anglearclabeloffset+radius) * Math.sin(ang / 180 * Math.PI);
      console.log('james: drawanglearc: labelx=',labelx);
      console.log('james: drawanglearc: labely=',labely);
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
      console.log('james: drawanglearc: ang=',ang);
      console.log('james: drawanglearc: pos=',pos);
      var x = this.localx(labelx);
      var y = this.localy(labely);
      var v;
      if ((v=this.re_inlinemath.exec(txt))!==null) {
        var [w_,h_,defs_,s_] = this.tokenizer.toDiagramSvg(v[1]);
        ///NOTE: the w_ and h_ are always in the unit of pt
        var w = w_*1.3333;
        var h = h_*1.3333;
        var gap = 0;
        if (pos==='.lrt') {
          x += gap;
          y += gap;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.bot') {
          x -= w/2;
          y += gap;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.llft') {
          x -= w;
          x -= gap;
          y += gap;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.urt') {
          y -= h;
          x += gap;
          y -= gap;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.top') {
          x -= w/2;
          y -= h;
          y -= gap;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.ulft') {
          x -= w;
          x -= gap;
          y -= h;
          y -= gap;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.rt') {
          x += gap;
          y -= h/2;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.lft') {
          x -= w;
          x -= gap;
          y -= h/2;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        } else if (pos==='.ctr') {
          x -= w/2;
          y -= h/2;
          s.push(`<svg x='${x}' y='${y}' width='${w_}pt' height='${h_}pt'>${defs_}${s_}</svg>`);
        }
      } else {
        var t = this.parser.escape(txt);
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

  torefpt(pt) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   global coords.
    ///
    var x = pt[0];
    x *= this.refsx;
    x += this.refx;
    x = this.fix(x);

    var y = pt[1];
    y *= this.refsy;
    y += this.refy;
    y = this.fix(y);
    return [x, y];
  }

  torefx(x) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   global coords.
    ///
    x *= this.refsx;
    x += this.refx;
    x = this.fix(x);
    return x;
  }

  torefy(y) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   global coords.
    ///
    y *= this.refsy;
    y += this.refy;
    y = this.fix(y);
    return y;
  }

  coordsToMetaPost(coords) {
    ///***NOTE: returns [str,bad_vars]
    ///***NOTE: i.e: (1,2)..(2,3)--cycle
    /// pt[0]: [1,2,'','','']
    /// pt[1]: [2,3,'..','','']
    /// pt[2]: ['cycle','','--','','']
    var o = [];
    var iscycle = 0;
    var x0 = null;
    var y0 = null;
    for (var i in coords) {
      var pt = coords[i];
      var x = pt[0];/// cannot do fix here because x could be a string
      var y = pt[1];/// cannot do fix here because x could be a string
      if (x0 === null) { x0 = x; }
      if (y0 === null) { y0 = y; }
      var join = pt[2];
      var p1x = pt[3];/// CUBIC BEZIER curve controlpoint 1x
      var p1y = pt[4];/// CUBIC BEZIER curve controlpoint 1y
      var p2x = pt[5];/// CUBIC BEZIER curve controlpoint 2x
      var p2y = pt[6];/// CUBIC BEZIER curve controlpoint 2y
      ///doing some fixes
      join = join || '';
      if (i == 0) {
        join = '';
      }
      ///In case we have a CUBIC BEZIER curve, then pt1 and pt2 are the control points
      if (i == 0) {
        o.push(`(${this.fix(x)},${this.fix(y)})`);
      }
      else if (join == '..') {
        join = `..controls(${this.fix(p1x)},${this.fix(p1y)})and(${this.fix(p2x)},${this.fix(p2y)})..`;
        o.push(`${join}(${this.fix(x)},${this.fix(y)})`);
      }
      else if (join == 'nan') {
        ///NOTE: ignore it!
        continue;
      }
      else if (join == 'cycle') {
        iscycle = 1;
        o.push(`--cycle`);
        break;
      }
      else {
        o.push(`--(${this.fix(x)},${this.fix(y)})`);
      }
    }
    return o.join('');
  }

  fills() {
    var s = [];
    if (this.fillcolor) {
      s.push(`withcolor ${this.fillcolor}`);
    }
    return s.join(' ');
  }

  draws() {
    var s = [];
    if (this.linedashed) {
      s.push(`dashed ${this.linedashed}`);
    }
    if (this.linewidth) {
      s.push(`withpen pencircle scaled ${this.linewidth}`);
    }
    if (this.linecolor) {
      s.push(`withcolor ${this.linecolor}`);
    }
    return s.join(' ');
  }

  strokes() {
    var s = [];
    if (this.linecolor) {
      s.push(`withcolor ${this.linecolor}`);
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

}

module.exports = { NitrilePreviewDiagramMETAPOST };
