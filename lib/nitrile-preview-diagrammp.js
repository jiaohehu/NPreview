'use babel';

const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');
const { arcpath } = require('./nitrile-preview-arcpath');

class NitrilePreviewDiagramMP extends NitrilePreviewDiagram {

  constructor(parser,notes) {
    super(parser,notes);
    this.re_unit = /^(\d+)mm$/;
    this.re_inlinemath = /^\`\`(.*)\`\`$/;
  }
  
  do_setup() {
  }

  do_finalize(s) {
    var o = [];
    /// these items needs to be constracted after all
    /// previous p's have been processed because it needs
    /// to be dependant on some of the command line options
    /// settings such as width and height.
    ///var ym = this.height;
    ///var xm = this.width;
    ///var a1 = `pu := \\mpdim{\\linewidth}/${xm};`;
    ///var a2 = `u := ${this.unit}mm;`;///this.unit is always in mm
    ///var a3 = `ratio := pu/u;`;
    ///var a4 = `picture wheel;`;
    ///var a5 = `wheel := image(`;
    ///var a6 = `for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`;
    ///var a7 = `for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`;
    ///o.push(a1, a2, a3, a4, a5, a6, a7);
    var ym = this.height;
    var xm = this.width;
    if (this.config.grid && this.config.grid=='boxed') {
      o.push(`for i=0 step ${ym} until ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor black; endfor;`);
      o.push(`for i=0 step ${xm} until ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor black; endfor;`);
    } else if (this.config.grid && this.config.grid=='none') {
      o.push(`for i=0 step ${ym} until ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor white; endfor;`);
      o.push(`for i=0 step ${xm} until ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor white; endfor;`);
    } else {
      o.push(`for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`);
      o.push(`for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`);
    }
    o.push(this.do_reset());
    o.push(s);
    var s = o.join('\n');
    return {s};
  }

  do_comment(s) {
    s = s.replace(/\-\-/g,'');
    s = s.replace(/\\/g,'\\\\');
    return `% <-- ${s} -->`;
  }

  do_drawarc(my_opt,txt,coords) {
    var o = [];
    for (var i = 1; this.valid(coords, i - 1) && this.valid(coords, i); ++i) {
      var z0 = this.point(coords, i - 1);
      var z1 = this.point(coords, i);
      z0 = this.local(z0);
      z1 = this.local(z1);
      var X1 = z0[0];
      var Y1 = z0[1];
      var X2 = z1[0];
      var Y2 = z1[1];
      var Rx = this.xradius;
      var Ry = this.yradius;
      var Phi = this.rotation;
      if (this.sweepflag) {
        ///NOTE: note that the arcpath() always assumes anti-clockwise. So if we are
        ///drawing clockwise we just need to swap the starting and end point
        ///for X1/Y1 and X2/Y2
        ///this.sweepflag=1: clockwise
        ///this.sweepflag=0: anti-clockwise
        var tmp = X1; X1 = X2; X2 = tmp;
        var tmp = Y1; Y1 = Y2; Y2 = tmp;
      } 
      var [Cx, Cy, Rx, Ry] = arcpath(X1, Y1, X2, Y2, Rx, Ry, Phi, this.bigarcflag);
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
      if (this.sweepflag) {
        o.push(`draw subpath (${ang2 / 45},${ang1 / 45}) of fullcircle xscaled(${2 * Rx}) yscaled(${2 * Ry}) rotated(${Phi}) scaled(u) shifted(${Cx}*u,${Cy}*u);`);
      } else {
        o.push(`draw subpath (${ang1 / 45},${ang2 / 45}) of fullcircle xscaled(${2 * Rx}) yscaled(${2 * Ry}) rotated(${Phi}) scaled(u) shifted(${Cx}*u,${Cy}*u);`);
      }
    }
    return o.join('\n');
  }
  
  nolineflag() {
    ///NOTE: return 'true' if current setting of this.linesize expresses
    ///that a line should be drawn. A line drawing is inhibited when
    ///this.linesize is set to a number 0. But the default setting is
    ///a string that is empty, which means a default line width
    ///and the line should be drawn.
    if (typeof this.linesize === 'number' && this.linesize === 0) {
      return true;
    }
    return false;
  }

  do_drawcontrolpoints(opt,txt,coords) {
    var s = [];
    ///NOTE: the dotsize attribute could be an empty string
    var dm = this.dotsizes();
    var r = dm/2; 
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
        s.push(`fill unitsquare scaled(${dm}) shifted(${-r},${-r}) shifted(${x}*u,${y}*u) ${this.dotcolors()};`);
        if (typeof x0 === 'number' && typeof y0 === 'number') {
          s.push(`fill unitsquare scaled(${dm}) shifted(${-r},${-r}) shifted(${x0}*u,${y0}*u) ${this.dotcolors()};`);
          x0 = null;
          y0 = null;
        }
        s.push(`fill fullcircle scaled(${dm}) shifted(${i3}*u,${i4}*u) ${this.dotcolors()};`);
        s.push(`fill fullcircle scaled(${dm}) shifted(${i5}*u,${i6}*u) ${this.dotcolors()};`);
      } if (join==='Q') {
        var i3 = this.localx(z0[3]);
        var i4 = this.localy(z0[4]);
        s.push(`fill unitsquare scaled(${dm}) shifted(${-r},${-r}) shifted(${x}*u,${y}*u) ${this.dotcolors()};`);
        if (typeof x0 === 'number' && typeof y0 === 'number') {
          s.push(`fill unitsquare scaled(${dm}) shifted(${-r},${-r}) shifted(${x0}*u,${y0}*u) ${this.dotcolors()};`);
          x0 = null;
          y0 = null;
        }
        s.push(`fill fullcircle scaled(${dm}) shifted(${i3}*u,${i4}*u) ${this.dotcolors()};`);
      } else {
        x0 = x;
        y0 = y;
      }
    }
    return s.join('\n');
  }

  do_drawline(opt,txt,coords) {
    var o = [];
    var str = this.coordsToMetaPost(coords,true);
    if (!str) {
      o.push(`%***ERROR: empty output for instruction: ${this.line}`);
    } else {
      var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
      var withshifted = `shifted(${this.refx},${this.refy})`;
      var ss = str.split('\n');
      for (str of ss) {
        if (this.fillcolor) {
          o.push(`fill (${str}--cycle) ${withscaled} ${withshifted} scaled(u) ${this.fills()};`);
        }
        if (!this.nolineflag()) {
          o.push(`draw (${str}) ${withscaled} ${withshifted} scaled(u) ${this.draws()};`);
        }
      }
    }
    return o.join('\n');
  }

  do_line(opt,txt,coords) {
    var o = [];
    var str = this.coordsToMetaPost(coords,true);
    if (!str) {
      o.push(`%***ERR: empty output for instruction: ${this.line}`);
    } else {
      var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
      var withshifted = `shifted(${this.refx},${this.refy})`;
      var ss = str.split('\n');
      for (str of ss) {
        o.push(`draw (${str}) ${withscaled} ${withshifted} scaled(u) ${this.draws()};`);
      }
    }
    return o.join('\n');
  }

  do_area(opt,txt,coords) {
    var o = [];
    var str = this.coordsToMetaPost(coords,true);
    if (!str) {
      o.push(`%***ERR: empty output for instruction: ${this.line}`);
    } else {
      var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
      var withshifted = `shifted(${this.refx},${this.refy})`;
      var ss = str.split('\n');
      for (str of ss) {
        o.push(`fill (${str}--cycle) ${withscaled} ${withshifted} scaled(u) ${this.fills()};`);
      }
    }
    return o.join('\n');
  }

  do_fill(opt,txt,coords) {
    var o = [];
    var str = this.coordsToMetaPost(coords,true);
    if (!str) {
      o.push(`%***ERR: empty output for instruction: ${this.line}`);
    } else {
      var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
      var withshifted = `shifted(${this.refx},${this.refy})`;
      var ss = str.split('\n');
      for (str of ss) {
        o.push(`fill (${str}--cycle) ${withscaled} ${withshifted} scaled(u) ${this.fills()};`);
        o.push(`draw (${str}--cycle) ${withscaled} ${withshifted} scaled(u) ${this.draws()};`);
      }
    }
    return o.join('\n');
  }

  do_arrow(opt,txt,coords) {
    var o = [];
    var str = this.coordsToMetaPost(coords);
    if (!str) {
      o.push(`%***ERROR: empty output for instruction: ${this.line}`);
    } else {
      var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
      var withshifted = `shifted(${this.refx},${this.refy})`;
      o.push(`drawarrow (${str}) ${withscaled} ${withshifted} scaled(u) ${this.draws()};`);
    }
    return o.join('\n');
  }

  do_revarrow(opt,txt,coords) {
    var o = [];
    var str = this.coordsToMetaPost(coords);
    if (!str) {
      o.push(`%***ERROR: empty output for instruction: ${this.line}`);
    } else {
      var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
      var withshifted = `shifted(${this.refx},${this.refy})`;
      o.push(`drawarrow reverse(${str}) ${withscaled} ${withshifted} scaled(u) ${this.draws()};`);
    }
    return o.join('\n');
  }

  do_dblarrow(opt,txt,coords) {
    var o = [];
    var str = this.coordsToMetaPost(coords);
    if (!str) {
      o.push(`%***ERROR: empty output for instruction: ${this.line}`);
    } else {
      var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
      var withshifted = `shifted(${this.refx},${this.refy})`;
      o.push(`drawdblarrow (${str}) ${withscaled} ${withshifted} scaled(u) ${this.draws()};`);
    }
    return o.join('\n');
  }

  do_drawarrow(opt,txt,coords) {
    var o = [];
    var str = this.coordsToMetaPost(coords);
    if (!str) {
      o.push(`%***ERROR: empty output for instruction: ${this.line}`);
    } else {
      var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
      var withshifted = `shifted(${this.refx},${this.refy})`;
      o.push(`drawarrow (${str}) ${withscaled} ${withshifted} scaled(u) ${this.draws()};`);
    }
    return o.join('\n');
  }

  do_drawrevarrow(opt,txt,coords) {
    var o = [];
    var str = this.coordsToMetaPost(coords);
    if (!str) {
      o.push(`%***ERROR: empty output for instruction: ${this.line}`);
    } else {
      var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
      var withshifted = `shifted(${this.refx},${this.refy})`;
      o.push(`drawarrow reverse(${str}) ${withscaled} ${withshifted} scaled(u) ${this.draws()};`);
    }
    return o.join('\n');
  }

  do_drawdblarrow(opt,txt,coords) {
    var o = [];
    var str = this.coordsToMetaPost(coords);
    if (!str) {
      o.push(`%***ERROR: empty output for instruction: ${this.line}`);
    } else {
      var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
      var withshifted = `shifted(${this.refx},${this.refy})`;
      o.push(`drawdblarrow (${str}) ${withscaled} ${withshifted} scaled(u) ${this.draws()};`);
    }
    return o.join('\n');
  }

  do_dot(dot_opt,txt,coords) {
    var o = [];
    for (var i = 0; i < coords.length    ; i++) {
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      z0 = this.local(z0);
      var x = z0[0];
      var y = z0[1];
      ///***NOTE that drawdot cannot use shifted or scaled command
      ///   because there is no path before it
      o.push(`fill fullcircle scaled(${this.dotsizes()}) shifted(${x}*u,${y}*u) ${this.dotcolors()};`);
    }
    return o.join('\n');
  }

  do_rhombus(opt,txt,coords) {
    var mypath = `(0,0.5)--(0.5,1)--(1,0.5)--(0.5,0)--cycle`;
    var f = this.readParamsStyle(txt);
    var w = this.assertFloat(f.w,3,0,this.MAX);
    var h = this.assertFloat(f.h,2,0,this.MAX);
    return this.my_shape(opt,coords,mypath,1,1,w,h);
  }

  do_trapezoid(opt,txt,coords) {
    var mypath = `(0,0)--(1,0)--(0.6,1)--(0.2,1)--cycle;`;
    var f = this.readParamsStyle(txt);
    var w = this.assertFloat(f.w,3,0,this.MAX);
    var h = this.assertFloat(f.h,2,0,this.MAX);
    return this.my_shape(opt,coords,mypath,1,1,w,h);
  }

  do_rect(opt,txt,coords) {
    var mypath = `(0,0)--(1,0)--(1,1)--(0,1)--cycle;`;
    var f = this.readParamsStyle(txt);
    var w = this.assertFloat(f.w,3,0,this.MAX);
    var h = this.assertFloat(f.h,2,0,this.MAX);
    return this.my_shape(opt,coords,mypath,1,1,w,h);
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
    var mypath = `(0,0) [h:${sw}] [l:${sl},1] [h:${-sw}] [l:-${sl},-1] cycle`;
    return this.my_shape(opt,coords,mypath,1,1,w,h);
  }

  do_rrect(opt,txt,coords) {
    var mypath = `(0.2,0) [h:0.6] [c:0.2,0,0.2,0,0.2,0.2] [v:0.6] [c:0,0.2,0,0.2,-0.2,0.2] [h:-0.6] [c:-0.2,0,-0.2,0,-0.2,-0.2] [v:-0.6] [c:0,-0.2,0,-0.2,0.2,-0.2] cycle`;
    var f = this.readParamsStyle(txt);
    var w = this.assertFloat(f.w,3,0,this.MAX);
    var h = this.assertFloat(f.h,2,0,this.MAX);
    return this.my_shape(opt,coords,mypath,1,1,w,h);
  }

  do_label(opt,label,coords){
    ///NOTE: that the 'opt' has already been checked and converted to valid '.rt','.lft'
    ///values. However, it might contain '.ctr'. 
    var o = [];
    var all_labels = label.split('\\\\');
    var all_labels = all_labels.map(x => x.trim());
    var withcolor = '';
    if (this.fontcolor) {
      var withcolor = `withcolor ${this.to_colors(this.fontcolor)}`;
    }
    var label_alignment = opt;
    if (opt === '.ctr') {
      label_alignment = '';
    }
    var t0 = 'unassigned';
    for (var i = 0; this.valid(coords, i); ++i) {
      var z0 = this.point(coords, i);
      var z0 = this.local(z0);
      var x = z0[0];
      var y = z0[1];
      var t = all_labels[i];
      if (!t) {
        t = t0;
      } else {
        t0 = t;
      }
      var tex_label = this.to_tex_label(t);
      o.push(`label${label_alignment} (${tex_label}, (${x}*u,${y}*u)) ${withcolor};`);
    }
    return o.join('\n');
  }

  to_tex_label(text){
    text = text.toString();
    var v;
    if ((v=this.re_inlinemath.exec(text))!==null) {
      var s = this.parser.math_diag(v[1]);
    } else {
      var s = this.parser.escape_diag(text);
    }
    return `btex ${s} etex`;
  }

  fontsizes() {
    return this.parser.mpfontsize(this.fontsize);
  }

  to_colors(color) {
    if (!color) {
      return 'black';
    } 
    else if (Array.isArray(color)) {
      return `(${this.fix(color[0]/255)},${this.fix(color[1]/255)},${this.fix(color[2]/255)})`;
    } 
    else if (typeof color === 'string') {
      /// such as '\mpcolor{pink}' for latex or \MPcolor{pink} for contex
      return this.parser.to_mpcolor(color);
    } 
    else {
      return 'black';
    }
  }

  ticks() {
    var s = [];
    if (this.tickcolor) {
      s.push(`with color ${this.to_colors(this.tickcolor)}`);
    } 
    if (typeof this.ticksize === 'number') {
      s.push(`withpen pensquare scaled ${this.ticksize}`);
    }
    return s.join(' ');
  }

  do_tick(tick_opt,txt,coords) {
    var o = [];
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      z0 = this.local(z0);
      var x = z0[0];
      var y = z0[1];
      var len = this.tickprotrude;
      if (tick_opt === '.top') {
        o.push(`draw ((${x},${y}) -- (${x},${this.fix(y + len)})) scaled(u) ${this.ticks()};`);
      } else if (tick_opt === '.bot') {
        o.push(`draw ((${x},${y}) -- (${x},${this.fix(y - len)})) scaled(u) ${this.ticks()};`);
      } else if (tick_opt === '.rt') {
        o.push(`draw ((${x},${y}) -- (${this.fix(x + len)},${y})) scaled(u) ${this.ticks()};`);
      } else if (tick_opt === '.lft') {
        o.push(`draw ((${x},${y}) -- (${this.fix(x - len)},${y})) scaled(u) ${this.ticks()};`);
      }
    }
    return o.join('\n');
  }

  do_apple(opt,txt,coords) {
    var mypath = '(.5,.7)..(.25,.85)..(0,.4)..(.5,0)..(1.0,.5)..(.8,.9)..(.5,.7)--(.5,.7)..(.6,1.0)..(.3,1.1)--(.3,1.1)..(.4,1.0)..(.5,.7)--cycle';
    return this.my_shape(opt,coords,mypath,1,1,1,1);
  }

  do_basket(opt,txt,coords) {
    var mypath = '(0.3,0)--(2.6,0)..(2.8,1)..(3,2)--(3,2)..(1.5,1.5)..(0,2)--(0,2)..(0.2,1)..(0.3,0)--cycle';
    return this.my_shape(opt,coords,mypath,3,2,1,1);
  }

  do_crate(opt,txt,coords) {
    var mypath = '(4,2)--(0,2)--(0,0)--(4,0)--(4,2)--(0,2)--(1,3)--(5,3)--(4,2)--(4,0)--(5,1)--(5,3)--(4,2)--cycle';
    return this.my_shape(opt,coords,mypath,5,3,1,1);
  }

  do_brick(opt,txt,coords) {
    var mypath = '(0,0)--(1,0)--(1,0.5)--(0,0.5)--cycle';
    return this.my_shape(opt,coords,mypath,1,0.5,1,1);
  }

  do_radical(opt,txt,coords) {
    var radicallength = 4;
    if (opt) {
      var opt = opt.slice(1);
      var opt = parseInt(opt);
      if (Number.isFinite(opt)){
        radicallength = opt;
      }
    }
    var mypath = `(${radicallength},0)--(0,0)--(0,-2)--(-0.25,-1.5)--(-0.5,-1.75)`;
    return this.my_shape('',coords,mypath,1,0.5,1,1);
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
      var p = this.localcoords(p);
      var str = this.coordsToMetaPost(p);
      if (!str) {
        s.push(`%***ERROR: empty output for instruction: ${this.line}`);
      } else {
        if (this.fillcolor) {
          s.push(`fill (${str}--cycle) scaled(u) ${this.fills()};`);
        }
        if (!this.nolineflag()) {
          s.push(`draw (${str}) scaled(u) ${this.draws()};`);
        }
      }
      var label = all_labels[i];
      label = label||'';
      if (label) {
        var withcolor = '';
        if (this.fontcolor) {
          var withcolor = `withcolor ${this.to_colors(this.fontcolor)}`;
        }
        var labelx = this.localx(x);
        var labely = this.localy(y);
        var tex_label = this.to_tex_label(label);
        s.push(`label (${tex_label}, (${labelx}*u,${labely}*u)) ${withcolor};`);
      }
    }
    return s.join('\n');
  }

  do_protractor(opt,txt,coords) {
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
    var s = [];
    paths.forEach(path => s.push(this.my_shape('',coords,path,w,h,1,1)));
    return s.join('\n');
  }

  do_updnprotractor(opt,txt,coords) {
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
    var s = [];
    paths.forEach(path => s.push(this.my_shape('',coords,path,w,h,1,1)));
    return s.join('\n');
  }

  do_circle(opt,txt,coords) {
    if(!opt) opt='.draw';
    var f = this.readParamsStyle(txt);
    var radius = f.r ? parseFloat(f.r) : 1;
    var o = [];
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      z0 = this.local(z0);
      var x = z0[0];
      var y = z0[1];
      if(f.start && f.stop){
        var angle1 = parseFloat(f.start);
        var angle2 = parseFloat(f.stop);
        var x1 =  Math.cos(angle1 / 180 * Math.PI);
        var y1 =  Math.sin(angle1 / 180 * Math.PI);
        var x2 =  Math.cos(angle2 / 180 * Math.PI);
        var y2 =  Math.sin(angle2 / 180 * Math.PI);
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
        var xm =  Math.cos(my_angle / 180 * Math.PI);
        var ym =  Math.sin(my_angle / 180 * Math.PI);
        x1 = this.fix(x1);
        y1 = this.fix(y1);
        x2 = this.fix(x2);
        y2 = this.fix(y2);
        xm = this.fix(xm);
        ym = this.fix(ym);
        if (opt==='.area'){   
          o.push(`fill ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--(0,0)--cycle) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
        } else if(opt==='.fill'){
          o.push(`fill ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--(0,0)--cycle) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
          o.push(`draw ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--(0,0)--cycle) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
        } else {
          o.push(`draw ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--(0,0)--cycle) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
        }
      } else {
        //fullcircle
        if (opt==='.area'){
          o.push(`fill fullcircle scaled(${radius*2}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
        } else if(opt==='.fill'){
          o.push(`fill fullcircle scaled(${radius*2}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
          o.push(`draw fullcircle scaled(${radius*2}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
        } else {
          o.push(`draw fullcircle scaled(${radius*2}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
        }
      } 
    }
    return o.join('\n');
  }

  do_chord(circle_opt,txt,coords) {
    var o = [];
    var f = this.readParamsStyle(txt);
    var radius = f.r ? parseFloat(f.r) : 1;
    var angle1 = parseFloat(f.start);           
    var angle2 = parseFloat(f.stop);           
    for (var i = 0; i < coords.length; i++) {
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      z0 = this.local(z0);
      var x = z0[0];
      var y = z0[1];
      if(Number.isFinite(radius) && Number.isFinite(angle1) && Number.isFinite(angle2)){
        var x1 =  Math.cos(angle1 / 180 * Math.PI);
        var y1 =  Math.sin(angle1 / 180 * Math.PI);
        var x2 =  Math.cos(angle2 / 180 * Math.PI);
        var y2 =  Math.sin(angle2 / 180 * Math.PI);
        x1 = this.fix(x1);
        y1 = this.fix(y1);
        x2 = this.fix(x2);
        y2 = this.fix(y2);
        radius = this.fix(radius);
        o.push(`draw ((${x1},${y1})--(${x2},${y2})) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
      } 
    }
    return o.join('\n');
  }

  do_arc(circle_opt,txt,coords) {
    var o = [];
    var f = this.readParamsStyle(txt);
    var radius = f.r ? parseFloat(f.r) : 1;
    var angle1 = parseFloat(f.start);           
    var angle2 = parseFloat(f.stop);           
    for (var i = 0; i < coords.length; i++) {
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      z0 = this.local(z0);
      var x = z0[0];
      var y = z0[1];
      if(Number.isFinite(radius) && Number.isFinite(angle1) && Number.isFinite(angle2)){
        var x1 =  Math.cos(angle1 / 180 * Math.PI);
        var y1 =  Math.sin(angle1 / 180 * Math.PI);
        var x2 =  Math.cos(angle2 / 180 * Math.PI);
        var y2 =  Math.sin(angle2 / 180 * Math.PI);
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
        var xm =  Math.cos(my_angle / 180 * Math.PI);
        var ym =  Math.sin(my_angle / 180 * Math.PI);
        x1 = this.fix(x1);
        y1 = this.fix(y1);
        x2 = this.fix(x2);
        y2 = this.fix(y2);
        xm = this.fix(xm);
        ym = this.fix(ym);
        radius = this.fix(radius);
        o.push(`draw ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
      } 
    }
    return o.join('\n');
  }

  do_cseg(opt,txt,coords) {
    var o = [];
    var f = this.readParamsStyle(txt);
    var radius = f.r ? parseFloat(f.r) : 1;
    var angle1 = parseFloat(f.start);           
    var angle2 = parseFloat(f.stop);           
    for (var i = 0; i < coords.length; i++) {
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      z0 = this.local(z0);
      var x = z0[0];
      var y = z0[1];
      if(Number.isFinite(radius) && Number.isFinite(angle1) && Number.isFinite(angle2)){
        var x1 =  Math.cos(angle1 / 180 * Math.PI);
        var y1 =  Math.sin(angle1 / 180 * Math.PI);
        var x2 =  Math.cos(angle2 / 180 * Math.PI);
        var y2 =  Math.sin(angle2 / 180 * Math.PI);
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
        var xm =  Math.cos(my_angle / 180 * Math.PI);
        var ym =  Math.sin(my_angle / 180 * Math.PI);
        x1 = this.fix(x1);
        y1 = this.fix(y1);
        x2 = this.fix(x2);
        y2 = this.fix(y2);
        xm = this.fix(xm);
        ym = this.fix(ym);
        if (opt=='.area'){      
          o.push(`fill ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--cycle) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
        } else if (opt=='.fill'){      
          o.push(`fill ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--cycle) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
          o.push(`draw ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--cycle) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
        } else {
          o.push(`draw ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--cycle) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
        }
      }
    }
    return o.join('\n');
  }

  localcoords(coords) {
    var s = [];
    for( let [x,y,join,x1,y1,x2,y2,Rx,Ry,angle,bigarcflag,sweepflag] of coords ) {
      if (join=='cycle'||join=='nan') {
        s.push([x,y,join,x1,y1,x2,y2,Rx,Ry,angle,bigarcflag,sweepflag]);
      } else {
        x = this.localx(x);
        y = this.localy(y);
        x1 = this.localx(x1);
        y1 = this.localy(y1);
        x2 = this.localx(x2);
        y2 = this.localy(y2);
        s.push([x,y,join,x1,y1,x2,y2,Rx,Ry,angle,bigarcflag,sweepflag]);
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

  do_anglearc(anglearc_opt,txt,coords) {
    var o = [];
    var f = this.readParamsStyle(txt);
    var r = this.assertFloat(f.r,0.75,0,this.MAX);
    var r2 = this.assertFloat(f.r2,1.50,0,this.MAX);
    var label = this.toString(f.label,'');
    var z0 = this.point(coords, 0);
    var z1 = this.point(coords, 1);
    var z2 = this.point(coords, 2);
    z0 = this.local(z0);
    z1 = this.local(z1);
    z2 = this.local(z2);
    var x = z0[0];
    var y = z0[1];
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
    if (anglearc_opt === '') {
      o.push(`draw subpath (${ang1 / 45},${ang2 / 45}) of fullcircle scaled(u) scaled(${r+r}) shifted(${x}*u,${y}*u);`);
    } else if (anglearc_opt === '.sq') {
      o.push(`draw subpath (0,4) of unitsquare rotated(${ang1}) scaled(u) scaled(${r*0.75}) shifted(${x}*u,${y}*u);`);
    }
    if (label) {
      var withcolor = '';
      if (this.fontcolor) {
        var withcolor = `withcolor ${this.to_colors(this.fontcolor)}`;
      }
      var ang = ang1 + angledelta / 2;
      if (ang > 360) {
        ang -= 360;
      }
      var labelx = (r2) * Math.cos(ang / 180 * Math.PI);
      var labely = (r2) * Math.sin(ang / 180 * Math.PI);
      var tex_label = this.to_tex_label(label);
      o.push(`label (${tex_label}, (${labelx}*u,${labely}*u)) shifted(${x}*u,${y}*u) ${withcolor};`);
    }
    return o.join('\n');
  }

  do_reset() {
    var o = [];
    o.push(`linecap := ${this.linecaps()};`);
    o.push(`linejoin := ${this.linejoins()};`);
    return o.join('\n');
  }

  do_set(key) {
    var o = [];
    if (key === 'linecap') {
      o.push(`linecap := ${this.linecaps()};`);
    }
    else if (key === 'linejoin') {
      o.push(`linejoin := ${this.linejoins()};`);
    }
    return o.join('\n');
  }

  coordsToMetaPost(coords,multi=false) {
    ///***NOTE: returns [str,bad_vars]
    ///***NOTE: i.e: (1,2)..(2,3)--cycle
    /// pt[0]: [1,2,'','','']
    /// pt[1]: [2,3,'..','','']
    /// pt[2]: ['cycle','','--','','']
    var o = [];
    var iscycle = 0;
    var x0 = 0;//previous point
    var y0 = 0;
    var isnewseg = 0;
    for (var i in coords) {
      var pt = coords[i];
      var x = pt[0];/// we will do fix down below
      var y = pt[1];///
      var join = pt[2];
      ///doing some fixes
      join = join || '';
      if (i == 0) {
        o.push(`(${this.fix(x)},${this.fix(y)})`);
        x0 = x;
        y0 = y;
        continue;
      }
      else if (multi && isnewseg == 1) {
        isnewseg = 0;
        o.push('\n');
        o.push(`(${this.fix(x)},${this.fix(y)})`);
        x0 = x;
        y0 = y;
        continue;
      }
      else if (join == 'C') {
        let p1x = pt[3];/// CUBIC BEZIER curve controlpoint 1x
        let p1y = pt[4];/// CUBIC BEZIER curve controlpoint 1y
        let p2x = pt[5];/// CUBIC BEZIER curve controlpoint 2x
        let p2y = pt[6];/// CUBIC BEZIER curve controlpoint 2y
        var bezier = `..controls(${this.fix(p1x)},${this.fix(p1y)})and(${this.fix(p2x)},${this.fix(p2y)})..`;
        o.push(`${bezier}(${this.fix(x)},${this.fix(y)})`);
        x0 = x;
        y0 = y;
      }
      else if (join == 'Q') {
        let p1x_ = pt[3];/// QUADRILATIC BEZIER curve controlpoint 1x
        let p1y_ = pt[4];/// QUADRILATIC BEZIER curve controlpoint 1y
        let [C0,C1,C2,C3] = this.quadrilaticToCubic([x0,y0],[p1x_,p1y_],[x,y]);
        let p1x = C1[0];
        let p1y = C1[1];
        let p2x = C2[0];
        let p2y = C2[1];
        var bezier = `..controls(${this.fix(p1x)},${this.fix(p1y)})and(${this.fix(p2x)},${this.fix(p2y)})..`;
        o.push(`${bezier}(${this.fix(x)},${this.fix(y)})`);
        x0 = x;
        y0 = y;
      }
      else if (join == 'A') {
        var X1 = x0;
        var Y1 = y0;
        var X2 = x;
        var Y2 = y;
        var Rx         = pt[7];       
        var Ry         = pt[8];       
        var Phi        = pt[9];        
        var bigarcflag = pt[10];        
        var sweepflag  = pt[11];        
        if (sweepflag) {
          ///NOTE: note that the arcpath() always assumes anti-clockwise. So if we are
          ///drawing clockwise we just need to swap the starting and end point
          ///for X1/Y1 and X2/Y2
          ///this.sweepflag=1: clockwise
          ///this.sweepflag=0: anti-clockwise
          var tmp = X1; X1 = X2; X2 = tmp;
          var tmp = Y1; Y1 = Y2; Y2 = tmp;
        } 
        var [Cx, Cy, Rx, Ry] = arcpath(X1, Y1, X2, Y2, Rx, Ry, Phi, bigarcflag);
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
        if (sweepflag) {
          o.push(`--(subpath (${ang2 / 45},${ang1 / 45}) of fullcircle xscaled(${this.fix(2*Rx)}) yscaled(${this.fix(2*Ry)}) rotated(${Phi}) shifted(${this.fix(Cx)},${this.fix(Cy)}))`);
        } else {
          o.push(`--(subpath (${ang1 / 45},${ang2 / 45}) of fullcircle xscaled(${this.fix(2*Rx)}) yscaled(${this.fix(2*Ry)}) rotated(${Phi}) shifted(${this.fix(Cx)},${this.fix(Cy)}))`);
        }
        x0 = x;
        y0 = y;
      }
      else if (multi && join == 'nan') {
        isnewseg = 1;
        continue;
      }
      else if (!multi && join == 'nan') {
        ///NOTE: ignore it!
        continue;
      }
      else if (join == 'cycle') {
        ///NOTE: cycle
        iscycle = 1;
        o.push(`--cycle`);
        break;
      }
      else {
        ///NOTE: line
        o.push(`--(${this.fix(x)},${this.fix(y)})`);
        x0 = x;
        y0 = y;
      }
    }
    return o.join('');
  }

  fills() {
    var s = [];
    if (this.fillcolor) {
      s.push(`withcolor ${this.to_colors(this.fillcolor)}`);
    } else {
      s.push(`withcolor ${this.to_colors('black')}`);
    }
    return s.join(' ');
  }

  draws() {
    var s = [];
    if (this.linedashed) {
      s.push(`dashed ${this.linedashed}`);
    }
    if (typeof this.linesize === 'number') {
      s.push(`withpen pencircle scaled ${this.linesize}`);
    }
    if (this.linecolor) {
      s.push(`withcolor ${this.to_colors(this.linecolor)}`);
    }
    return s.join(' ');
  }

  linecaps() {
    if (this.linecap === 'butt') {
      return 'butt';
    } else if (this.linecap === 'round') {
      return 'rounded';
    } else if (this.linecap === 'square') {
      return 'squared';
    }
    return '';
  }
  
  linejoins() {
    if (this.linejoin === 'miter') {
      return 'mitered';
    } else if (this.linejoin === 'round') {
      return 'rounded';
    } else if (this.linejoin === 'bevel') {
      return 'beveled';
    }
    return '';
  }
  
  dots() {
    var s = [];
    if (this.dotcolor) {
      s.push(`withcolor ${this.to_colors(this.dotcolor)}`);
    }
    if (typeof this.dotsize === 'number') {
      s.push(`withpen pencircle scaled ${this.dotsize*0.75}pt`);
    } else {
      s.push(`withpen pencircle scaled ${5*0.75}pt`);
    }
    return s.join(' ');
  }

  dotsizes() {
    if (typeof this.dotsize === 'number') {
      var v =(this.dotsize*0.75);
      v = this.fix(v);
      return v;
    } else {
      var v =(5*0.75);
      v = this.fix(v);
      return v;
    }
  }

  dotcolors() {
    var s = [];
    if (this.dotcolor) {
      s.push(`withcolor ${this.to_colors(this.dotcolor)}`);
    }
    return s.join(' ');
  }

  my_shape(align,coords,mypath,w,h,sx,sy) {     
    var s = [];
    var p0 = this.readCoordsLine(mypath);
    var mypathes = this.coordsToMetaPost(p0,true);
    var mypath_ss = mypathes.split('\n');
    var hw = w/2;
    var hh = h/2;
    var myshifted = '';
    if (align === '.top') {
      myshifted = `shifted(${-hw},0)`;
    } else if (align === '.bot') {
      myshifted = `shifted(${-hw},${-h})`;
    } else if (align === '.rt') {
      myshifted = `shifted(0,${-hh})`;
    } else if (align === '.lft') {
      myshifted = `shifted(${-w},${-hh})`;
    } else if (align === '.ctr') {
      myshifted = `shifted(${-hw},${-hh})`;
    } else if (align === '.urt') {
      myshifted = `shifted(0,0)`;
    } else if (align === '.ulft') {
      myshifted = `shifted(${-w},0)`;
    } else if (align === '.lrt') {
      myshifted = `shifted(0,${-h})`;
    } else if (align === '.llft') {
      myshifted = `shifted(${-w},${-h})`;
    }
    for (var i = 0; i < coords.length;     i++) {
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      z0 = this.local(z0);
      var x = z0[0];
      var y = z0[1];
      if (this.fillcolor) {
        for( var mypath of mypath_ss ) {
          if (mypath) {
            s.push(`fill (${mypath}--cycle) ${myshifted} xscaled(${sx}) yscaled(${sy}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
          }
        }
      }
      if (!this.nolineflag()) {
        for( var mypath of mypath_ss ) {
          if (mypath) {
            s.push(`draw (${mypath}) ${myshifted} xscaled(${sx}) yscaled(${sy}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
          }
        }
      }
    }
    return s.join('\n');
  }

  local(pt) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   global coords.
    ///
    var x = pt[0];
    var y = pt[1];
    x *= this.refsx;
    y *= this.refsy;
    x += this.refx;
    y += this.refy;
    x = this.fix(x);
    y = this.fix(y);
    return [x, y];
  }

  localx(x) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   global coords.
    ///
    x *= this.refsx;
    x += this.refx;
    x = this.fix(x);
    return x;
  }

  localy(y) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   global coords.
    ///
    y *= this.refsy;
    y += this.refy;
    y = this.fix(y);
    return y;
  }

  withrefs() {
    return `xscaled(${this.refsx}) yscaled(${this.refsy}) shifted(${this.refx},${this.refy}) scaled(u)`;
  }

  withtextcolors() {
    var withcolor = '';
    if (this.fontcolor) {
      var withcolor = `withcolor ${this.to_colors(this.fontcolor)}`;
    }
    return withcolor;
  }

  do_p_path(points,p,g){
    var d = [];
    for(var i=0; i < points.length; i+=2){
      var x = this.fix(points[i]);
      var y = this.fix(points[i+1]);
      if(i==0){
        d.push(`(${x},${y})`);
      }else{
        d.push(`(${x},${y})`);
      }
    }
    if(p.cycle){
      d.push('cycle');
    }
    var mypath = d.join('--');
    var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
    var withshifted = `shifted(${this.refx},${this.refy})`;
    if(p.arrowstart && p.arrowend){
      return(`drawdblarrow (${mypath}) ${withscaled} ${withshifted} scaled(u) ${this.to_draws(g)};`);
    }else if(p.arrowstart){
      return(`drawarrow reverse(${mypath}) ${withscaled} ${withshifted} scaled(u) ${this.to_draws(g)};`);
    }else if(p.arrowend){
      return(`drawarrow (${mypath}) ${withscaled} ${withshifted} scaled(u) ${this.to_draws(g)};`);
    }else{
      return(`draw (${mypath}) ${withscaled} ${withshifted} scaled(u) ${this.to_draws(g)};`);
    }
  }

  do_p_rect(x,y,w,h,g){
    var mypath = `(${x},${y})--(${x+w},${y})--(${x+w},${y+h})--(${x},${y+h})--cycle`;
    var o = [];
    var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
    var withshifted = `shifted(${this.refx},${this.refy})`;
    if (g.fillcolor) {
      o.push(`fill (${mypath}) ${withscaled} ${withshifted} scaled(u) ${this.to_fills(g)};`);
    }
    if (!g.linesize || g.linesize != 0){
      o.push(`draw (${mypath}) ${withscaled} ${withshifted} scaled(u) ${this.to_draws(g)};`);
    }
    return o.join('\n');
  }

  do_p_hbar(x,y,g){
    var o = [];
    var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
    var withshifted = `shifted(${this.refx},${this.refy})`;
    if(g.barlength){
      var dx = g.barlength;
    } else {
      var dx = this.def_barlength;
    }
    var mypath = `(${x},${y})--(${x+dx},${y})`;
    o.push(`draw (${mypath}) ${withscaled} ${withshifted} scaled(u) ${this.to_draws(g)};`);
    return o.join('\n');
  }

  do_p_vbar(x,y,g){
    var o = [];
    var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
    var withshifted = `shifted(${this.refx},${this.refy})`;
    if(g.barlength){
      var dy = g.barlength;
    } else {
      var dy = this.def_barlength;
    }
    var mypath = `(${x},${y})--(${x},${y+dy})`;
    o.push(`draw (${mypath}) ${withscaled} ${withshifted} scaled(u) ${this.to_draws(g)};`);
    return o.join('\n');
  }

  do_p_label(x,y,g){
    var o = [];
    x = this.localx(x);
    y = this.localy(y);
    var t = g.label||'';
    var a = g.anchor||'';
    if(a.length){
      a = `.${a}`;
    }
    var tex_label = this.to_tex_label(t);
    return(`label${a} (${tex_label}, (${x}*u,${y}*u)) ${this.to_texts(g)};`);
  }

  to_draws(g) {
    var o = [];
    if (g.linedashed) {
      o.push(`dashed evenly`);
    }
    if (g.linesize) {
      var d = parseFloat(g.linesize);
      if(Number.isFinite(d)){
        o.push(`withpen pencircle scaled ${d}`);
      }
    }
    if (g.linecolor) {
      o.push(`withcolor ${this.to_colors(g.linecolor)}`);
    }
    return o.join(' ');
  }

  to_fills(g) {
    var o = [];
    if (g.fillcolor) {
      o.push(`withcolor ${this.to_colors(g.fillcolor)}`);
    } else {
      o.push(`withcolor ${this.to_colors('black')}`);
    }
    return o.join(' ');
  }

  to_texts(g) {
    var withcolor = '';
    if (g.fontcolor) {
      var withcolor = `withcolor ${this.to_colors(g.fontcolor)}`;
    }
    return withcolor;
  }

  do_p_ellipse(x,y,Rx,Ry,angle,g){
    var o = [];
    /// x,y,angle,rx,ry
    var x1 = x + Rx * Math.cos(angle/180*Math.PI);
    var y1 = y + Rx * Math.sin(angle/180*Math.PI);
    var x2 = x - Rx * Math.cos(angle/180*Math.PI);
    var y2 = y - Rx * Math.sin(angle/180*Math.PI);
    x1 = this.localx(x1);
    y1 = this.localy(y1);
    x2 = this.localx(x2);
    y2 = this.localy(y2);
    ///GETTING ready to compute the 
    var X1 = x1;
    var Y1 = y1;
    var X2 = x2;
    var Y2 = y2;
    var Phi = angle;
    var Cx = x;
    var Cy = y;
    ///THE following steps are to calculate the ang1/ang2 which is the perimetric angle
    ///which is needed for the 'subpath' of MP
    var lambda1 = Math.atan2(Y1 - Cy, X1 - Cx);
    var lambda2 = Math.atan2(Y2 - Cy, X2 - Cx);
    lambda2 -= Phi / 180 * Math.PI;
    lambda1 -= Phi / 180 * Math.PI;
    var tao1 = Math.atan2(Math.sin(lambda1) / Ry, Math.cos(lambda1) / Rx);
    var tao2 = Math.atan2(Math.sin(lambda2) / Ry, Math.cos(lambda2) / Rx);
    var ang1 = this.to360(tao1 / Math.PI * 180);
    var ang2 = this.to360(tao2 / Math.PI * 180);
    if (ang2 < ang1) { ang2 += 360; }
    //s.push(`--(subpath (${ang1 / 45},${ang2 / 45}) of fullcircle xscaled(${this.fix(2*Rx)}) yscaled(${this.fix(2*Ry)}) rotated(${Phi}) shifted(${this.fix(Cx)},${this.fix(Cy)}))`);
    //s.push(`--(subpath (${ang2 / 45},${ang1 / 45}) of fullcircle xscaled(${this.fix(2*Rx)}) yscaled(${this.fix(2*Ry)}) rotated(${Phi}) shifted(${this.fix(Cx)},${this.fix(Cy)}))`);
    if (g.fillcolor) {
      o.push(`fill fullcircle xscaled(${this.fix(2*Rx)}) yscaled(${this.fix(2*Ry)}) rotated(${Phi}) shifted(${Cx},${Cy}) ${this.withrefs()} ${this.to_fills(g)};`);
    }
    if (!g.linesize || g.linesize != 0){
      o.push(`draw fullcircle xscaled(${this.fix(2*Rx)}) yscaled(${this.fix(2*Ry)}) rotated(${Phi}) shifted(${Cx},${Cy}) ${this.withrefs()} ${this.to_draws(g)};`);
    }
    return o.join('\n'); 
  }

  do_p_dot(x,y,g){
    var x = this.localx(x);    
    var y = this.localy(y);    
    ///***NOTE that drawdot cannot use shifted or scaled command
    ///   because there is no path before it
    return(`fill fullcircle scaled(${this.to_dotsize_diameter(g)}) shifted(${x}*u,${y}*u) ${this.to_dotcolors(g)};`);
  }

  to_dotsize_diameter(g) {
    if (g.dotsize) {
      var d = parseFloat(g.dotsize);
      if(Number.isFinite(d)){
        var v = d*0.75;//to pt
        v = this.fix(v);
        return v;
      }
    } 
    var v =(5*0.75);
    v = this.fix(v);
    return v;
  }

  to_dotcolors(g){
    if (g.dotcolor) {
      return(`withcolor ${this.to_colors(g.dotcolor)}`);
    }
    return '';
  }

  do_p_arc(x,y,r,a1,a2,g){
    var o = [];
    var x1 = x + r*Math.cos(a1/180*Math.PI); 
    var y1 = y + r*Math.sin(a1/180*Math.PI); 
    var x2 = x + r*Math.cos(a2/180*Math.PI); 
    var y2 = y + r*Math.sin(a2/180*Math.PI); 
    var Rx = r;
    var Ry = r;
    var Phi = 0;
    var Cx = x;
    var Cy = y;
    var ang1 = a1;
    var ang2 = a2;
    var mypath = `(subpath (${ang1 / 45},${ang2 / 45}) of fullcircle xscaled(${this.fix(2*Rx)}) yscaled(${this.fix(2*Ry)}) rotated(${Phi}) shifted(${this.fix(Cx)},${this.fix(Cy)}))`;
    var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
    var withshifted = `shifted(${this.refx},${this.refy})`;
    if (g.fillcolor) {
      o.push(`fill (${mypath}) ${withscaled} ${withshifted} scaled(u) ${this.to_fills(g)};`);
    }
    if (!g.linesize || g.linesize != 0){
      o.push(`draw (${mypath}) ${withscaled} ${withshifted} scaled(u) ${this.to_draws(g)};`);
    }
    return o.join('\n');
  }
}

class NitrilePreviewDiagramMF extends NitrilePreviewDiagramMP {

  constructor(parser,notes) {
    super(parser,notes);
  }
  
  ///redefine the 'to_text_label' method because MetaFun has changed its
  ///syntax
  to_tex_label(text){
    text = text.toString();
    var v;
    if ((v=this.re_inlinemath.exec(text))!==null) {
      var s = this.parser.math_diag(v[1]);
    } else {
      var s = this.parser.escape_diag(text);
    }
    return `"${s}"`;
  }

}

module.exports = { NitrilePreviewDiagramMP, NitrilePreviewDiagramMF };
