'use babel';

const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');
const { arcpath } = require('./nitrile-preview-arcpath');

class NitrilePreviewDiagramMP extends NitrilePreviewDiagram {

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
    o.push('linecap := butt;');
    o.push(s);
    o.push(`);`);
    o.push(`draw wheel scaled(ratio);`);
    return [o.join('\n')];
  }

  do_comment(s) {
    return `% <-- ${this.parser.escape(s)} -->`;
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
      o.push(`drawdot (${x}*u,${y}*u) ${this.dots()};`);
    }
    return o.join('\n');
  }

  do_rhombus(opt,txt,coords) {
    var mypath = `(0,0.5)--(0.5,1)--(1,0.5)--(0.5,0)--cycle`;
    return this.my_shape(opt,coords,mypath,1,1,this.rectw,this.recth);
  }

  do_trapezoid(opt,txt,coords) {
    var mypath = `(0,0)--(1,0)--(0.6,1)--(0.2,1)--(0,0)--();`;
    return this.my_shape(opt,coords,mypath,1,1,this.rectw,this.recth);
  }

  do_rect(opt,txt,coords) {
    var mypath = `(0,0)--(1,0)--(1,1)--(0,1)--(0,0)--();`;
    return this.my_shape(opt,coords,mypath,1,1,this.rectw,this.recth);
  }

  do_parallelgram(opt,txt,coords) {
    var s = [];
    var w = this.rectw;
    var h = this.recth;
    var hw = w/2;
    var hh = h/2;
    var sl = (this.slant);
    var sw = (1-this.slant);
    var mypath = `(0,0) [h:${sw}] [l:${sl},1] [h:${-sw}] [l:-${sl},-1] ()`;
    return this.my_shape(opt,coords,mypath,1,1,this.rectw,this.recth);
  }

  do_rrect(opt,txt,coords) {
    var mypath = `(0.2,0) [h:0.6] [c:0.2,0,0.2,0,0.2,0.2] [v:0.6] [c:0,0.2,0,0.2,-0.2,0.2] [h:-0.6] [c:-0.2,0,-0.2,0,-0.2,-0.2] [v:-0.6] [c:0,-0.2,0,-0.2,0.2,-0.2] ()`;
    return this.my_shape(opt,coords,mypath,1,1,this.rectw,this.recth);
  }

  do_label(opt,label,coords){
    ///NOTE: that the 'opt' has already been checked and converted to valid '.rt','.lft'
    ///values. However, it might contain '.ctr'. 
    var o = [];
    var all_labels = label.split('\\\\');
    var all_labels = all_labels.map(x => x.trim());
    var withcolor = '';
    if (this.fontcolor) {
      var withcolor = `withcolor ${this.colors(this.fontcolor)}`;
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
      var tex_label = this.parser.unmask(t);
      if (this.fontsize) {
        tex_label = `\\fontsize{${this.fix2(0.75*this.fontsize)}pt}{${this.fix2(0.75*this.fontsize)}pt}\\selectfont{}${tex_label}`;
      }
      o.push(`label${label_alignment} (btex {${tex_label}} etex, (${x}*u,${y}*u)) ${withcolor};`);
    }
    return o.join('\n');
  }

  colors(str) {
    return `\\mpcolor{${str}}`;
  }

  ticks() {
    var s = [];
    if (this.tickcolor) {
      s.push(`with color ${this.colors(this.tickcolor)}`);
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
    var mypath = '(.5,.7)..(.25,.85)..(0,.4)..(.5,0)..(1.0,.5)..(.8,.9)..(.5,.7)--(.5,.7)..(.6,1.0)..(.3,1.1)--(.3,1.1)..(.4,1.0)..(.5,.7)--()';
    return this.my_shape(opt,coords,mypath,1,1,1,1);
  }

  do_basket(opt,txt,coords) {
    var mypath = '(0.3,0)--(2.6,0)..(2.8,1)..(3,2)--(3,2)..(1.5,1.5)..(0,2)--(0,2)..(0.2,1)..(0.3,0)--()';
    return this.my_shape(opt,coords,mypath,3,2,1,1);
  }

  do_crate(opt,txt,coords) {
    var mypath = '(3,2)--(0,2)--(0,0)--(3,0)--(3,2)--(0,2)--(1,3)--(4,3)--(3,2)--(3,0)--(4,1)--(4,3)--(3,2)--()';
    return this.my_shape(opt,coords,mypath,4,3,1,1);
  }

  do_brick(opt,txt,coords) {
    var mypath = '(0,0)--(1,0)--(1,0.5)--(0,0.5)--(0,0)--()';
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

  do_protractor(opt,txt,coords) {
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
    var s = [];
    paths.forEach(path => s.push(this.my_shape('',coords,path,w,h,1,1)));
    return s.join('\n');
  }

  do_circle(circle_opt,txt,coords) {
    var o = [];
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      z0 = this.local(z0);
      var x = z0[0];
      var y = z0[1];
      if (circle_opt === '') {
        if (this.fillcolor) {
          o.push(`fill fullcircle scaled(${this.radius*2}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
        }
        if (!this.nolineflag()) {
          o.push(`draw fullcircle scaled(${this.radius*2}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
        }
      } else if (circle_opt === '.chord') {
        var x1 =  Math.cos(this.angle1 / 180 * Math.PI);
        var y1 =  Math.sin(this.angle1 / 180 * Math.PI);
        var x2 =  Math.cos(this.angle2 / 180 * Math.PI);
        var y2 =  Math.sin(this.angle2 / 180 * Math.PI);
        x1 = this.fix(x1);
        y1 = this.fix(y1);
        x2 = this.fix(x2);
        y2 = this.fix(y2);
        o.push(`draw ((${x1},${y1})--(${x2},${y2})) scaled(${this.radius}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
      } else if (circle_opt === '.arc') {
        var x1 =  Math.cos(this.angle1 / 180 * Math.PI);
        var y1 =  Math.sin(this.angle1 / 180 * Math.PI);
        var x2 =  Math.cos(this.angle2 / 180 * Math.PI);
        var y2 =  Math.sin(this.angle2 / 180 * Math.PI);
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
        var xm =  Math.cos(my_angle / 180 * Math.PI);
        var ym =  Math.sin(my_angle / 180 * Math.PI);
        x1 = this.fix(x1);
        y1 = this.fix(y1);
        x2 = this.fix(x2);
        y2 = this.fix(y2);
        xm = this.fix(xm);
        ym = this.fix(ym);
        o.push(`draw ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})) scaled(${this.radius}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
      } else if (circle_opt === '.cseg') {
        var x1 =  Math.cos(this.angle1 / 180 * Math.PI);
        var y1 =  Math.sin(this.angle1 / 180 * Math.PI);
        var x2 =  Math.cos(this.angle2 / 180 * Math.PI);
        var y2 =  Math.sin(this.angle2 / 180 * Math.PI);
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
        var xm =  Math.cos(my_angle / 180 * Math.PI);
        var ym =  Math.sin(my_angle / 180 * Math.PI);
        x1 = this.fix(x1);
        y1 = this.fix(y1);
        x2 = this.fix(x2);
        y2 = this.fix(y2);
        xm = this.fix(xm);
        ym = this.fix(ym);
        if (this.fillcolor) {
          o.push(`fill ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--cycle) scaled(${this.radius}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
        }
        if (!this.nolineflag()) {
          o.push(`draw ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--cycle) scaled(${this.radius}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
        }
      }
    }
    return o.join('\n');
  }

  do_halfcircle(circle_opt,txt,coords) {
    var o = [];
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      z0 = this.local(z0);
      var x = z0[0];
      var y = z0[1];
      if (circle_opt === '.top' ||
        circle_opt === '.bot' ||
        circle_opt === '.rt' ||
        circle_opt === '.lft') {
        var rot = 0;
        if (circle_opt === '.bot') { rot = 180; }
        if (circle_opt === '.rt') { rot = 270; }
        if (circle_opt === '.lft') { rot = 90; }
        if (this.fillcolor) {
          o.push(`fill (halfcircle--cycle) rotated(${rot}) scaled(${this.radius*2}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
        }
        if (!this.nolineflag()) {
          o.push(`draw (halfcircle--cycle) rotated(${rot}) scaled(${this.radius*2}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
        }
      } 
    }
    return o.join('\n');
  }

  do_quadrant(circle_opt,txt,coords) {
    var o = [];
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      z0 = this.local(z0);
      var x = z0[0];
      var y = z0[1];
      if (circle_opt === '.q1' ||
        circle_opt === '.q2' ||
        circle_opt === '.q3' ||
        circle_opt === '.q4') {
        var rot = circle_opt.slice(2);
        var rot = parseInt(rot);
        var rot = rot - 1;
        var rot = rot * 90;
        if (this.fillcolor) {
          o.push(`fill (quartercircle--(0,0)--cycle) rotated(${rot}) scaled(${this.radius*2}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
        }
        if (!this.nolineflag()) {
          o.push(`draw (quartercircle--(0,0)--cycle) rotated(${rot}) scaled(${this.radius*2}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
        }
      } 
    }
    return o.join('\n');
  }

  do_octant(circle_opt,txt,coords) {
    var o = [];
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      z0 = this.local(z0);
      var x = z0[0];
      var y = z0[1];
      if (circle_opt === '.o1' ||
        circle_opt === '.o2' ||
        circle_opt === '.o3' ||
        circle_opt === '.o4' ||
        circle_opt === '.o5' ||
        circle_opt === '.o6' ||
        circle_opt === '.o7' ||
        circle_opt === '.o8') {
        var rot = circle_opt.slice(2);
        var rot = parseInt(rot);
        var rot = rot - 1;
        var rot = rot * 45;
        if (!this.has_octantcircle) {
          o.push('path octantcircle; octantcircle := (0.5,0)..(0.4619395,0.1913415)..(0.35355,0.35355);');
          this.has_octantcircle = 1;
        }
        if (this.fillcolor) {
          o.push(`fill (octantcircle--(0,0)--cycle) rotated(${rot}) scaled(${this.radius*2}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
        }
        if (!this.nolineflag()) {
          o.push(`draw (octantcircle--(0,0)--cycle) rotated(${rot}) scaled(${this.radius*2}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
        }
      } 
    }
    return o.join('\n');
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

  do_drawanglearc(anglearc_opt,label,coords) {
    var o = [];
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
    var r = this.anglearcradius;
    if (anglearc_opt === '') {
      o.push(`draw subpath (${ang1 / 45},${ang2 / 45}) of fullcircle scaled(u) scaled(${r+r}) shifted(${x}*u,${y}*u);`);
    } else if (anglearc_opt === '.sq') {
      o.push(`draw subpath (0,4) of unitsquare rotated(${ang1}) scaled(u) scaled(${r*0.75}) shifted(${x}*u,${y}*u);`);
    }
    if (label) {
      var tex_label = this.parser.unmask(label);
      if (this.fontsize) {
        tex_label = `\\fontsize{${this.fix2(0.75*this.fontsize)}pt}{${this.fix2(0.75*this.fontsize)}pt}\\selectfont{}${tex_label}`;
      }
      var withcolor = '';
      if (this.fontcolor) {
        var withcolor = `withcolor ${this.colors(this.fontcolor)}`;
      }
      var ang = ang1 + angledelta / 2;
      if (ang > 360) {
        ang -= 360;
      }
      var labelx = (r+this.anglearclabeloffset) * Math.cos(ang / 180 * Math.PI);
      var labely = (r+this.anglearclabeloffset) * Math.sin(ang / 180 * Math.PI);
      o.push(`label (btex {${tex_label}} etex, (${labelx}*u,${labely}*u)) shifted(${x}*u,${y}*u) ${withcolor};`);
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
      else if (join == 'A') {
        var X1 = x0;
        var Y1 = y0;
        var X2 = x;
        var Y2 = y;
        var Rx         = pt[3];       
        var Ry         = pt[4];       
        var Phi        = pt[5];        
        var bigarcflag = pt[6];        
        var sweepflag  = pt[7];        
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
      s.push(`withcolor ${this.colors(this.fillcolor)}`);
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
      s.push(`withcolor ${this.colors(this.linecolor)}`);
    }
    return s.join(' ');
  }

  dots() {
    var s = [];
    if (this.dotcolor) {
      s.push(`withcolor ${this.colors(this.dotcolor)}`);
    }
    if (typeof this.dotsize === 'number') {
      s.push(`withpen pencircle scaled ${this.dotsize*0.75}pt`);
    } else {
      s.push(`withpen pencircle scaled ${5*0.75}pt`);
    }
    return s.join(' ');
  }

  my_shape(align,coords,mypath,w,h,sx,sy) {     
    var s = [];
    var p0 = this.readCoordsLine(mypath);
    var mypath = this.coordsToMetaPost(p0);
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
    for (var i = 0; this.valid(coords, i); i++) {
      var z0 = this.point(coords, i);
      z0 = this.local(z0);
      var x = z0[0];
      var y = z0[1];
      if (this.fillcolor) {
        s.push(`fill (${mypath}--cycle) ${myshifted} xscaled(${sx}) yscaled(${sy}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
      }
      if (!this.nolineflag()) {
        s.push(`draw (${mypath}) ${myshifted} xscaled(${sx}) yscaled(${sy}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
      }
    }
    return s.join('\n');
  }

}

module.exports = { NitrilePreviewDiagramMP };
