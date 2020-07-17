'use babel';

const { makeknots, mp_make_choices } = require('./nitrile-preview-mppath');
const global_pics = {};

const N_Max_Array = 256;
class NitrilePreviewDiagram {

  constructor(parser,notes) {
    this.parser = parser;
    this.notes = notes;
    this.MAX = 2048;
    this.MIN = 0.000001;
    /// regular expression
    this.re_word = /^[A-Za-z]\w*$/;
    this.re_commentline = /^\%/;
    this.re_viewport_command = /^viewport\s+(\d+)\s+(\d+)/;
    this.re_unit_command = /^unit\s+(.*)$/;
    this.re_config_command = /^config\s+(\w+)\s*(.*)$/;
    this.re_reset_command = /^reset/;
    this.re_set_command = /^set\s+([\w\-]+)\s*(.*)$/;
    this.re_def_command = /^def\s+([A-Za-z]\w*)\((.*?)\)\s*\=\s*(.*)$/;
    this.re_pic_command = /^pic\s+(.*)$/;
    this.re_exit_command = /^exit/;
    // path 
    this.re_path_command = /^path\s+(.*?)\s*\=\s*(.*)$/;
    // draw commands, dealing directly with a path
    this.re_draw_command = /^draw(\.\w+|)\s+(.*)$/;
    this.re_drawarrow_command = /^drawarrow(\.\w+|)\s+(.*)$/;
    this.re_drawrevarrow_command = /^drawrevarrow(\.\w+|)\s+(.*)$/;
    this.re_drawdblarrow_command = /^drawdblarrow(\.\w+|)\s+(.*)$/;
    this.re_drawcontrolpoints_command = /^drawcontrolpoints(\.\w+|)\s+(.*)$/;
    this.re_drawanglearc_command = /^drawanglearc(\.\w+|)\s+(.*)$/;
    // circular
    this.re_circle_command = /^circle(\.\w+|)\s+(.*)$/;
    this.re_pie_command = /^pie(\.\w+|)\s+(.*)$/;
    this.re_chord_command = /^chord(\.\w+|)\s+(.*)$/;
    this.re_arc_command = /^arc(\.\w+|)\s+(.*)$/;
    this.re_cseg_command = /^cseg(\.\w+|)\s+(.*)$/;
    // shapes
    this.re_shape_command = /^shape(\.\w+|)\s+(.*)$/;
    this.re_rect_command = /^rect(\.\w+|)\s+(.*)$/;
    this.re_rhombus_command = /^rhombus(\.\w+|)\s+(.*)$/;
    this.re_trapezoid_command = /^trapezoid(\.\w+|)\s+(.*)$/;
    this.re_parallelgram_command = /^parallelgram(\.\w+|)\s+(.*)$/;
    this.re_apple_command = /^apple(\.\w+|)\s+(.*)$/;
    this.re_rrect_command = /^rrect(\.\w+|)\s+(.*)$/;
    this.re_basket_command = /^basket(\.\w+|)\s+(.*)$/;
    this.re_crate_command = /^crate(\.\w+|)\s+(.*)$/;
    this.re_brick_command = /^brick(\.\w+|)\s+(.*)$/;
    // text label
    this.re_label_command = /^label(\.\w+|)\s+(.*)$/;
    // dot
    this.re_dot_command = /^dot(\.\w+|)\s+(.*)$/;
    this.re_hbar_command = /^hbar(\.\w+|)\s+(.*)$/;
    this.re_vbar_command = /^vbar(\.\w+|)\s+(.*)$/;
    // box
    this.re_box_command = /^box(\.\w+|)\s+(.*)$/;
    // special - need to go away
    this.re_radical_command = /^radical(\.\w+|)\s+(.*)$/;
    this.re_protractor_command = /^protractor(\.\w+|)\s+(.*)$/;
    this.re_updnprotractor_command = /^updnprotractor(\.\w+|)\s+(.*)$/;
    // scalar command - cartesian 
    this.re_cartesian_command = /^cartesian([\.\w]+|)\s+(.*)$/;
    // scalar command
    this.re_barchart_command = /^barchart([\.\w]+|)\s+(.*)$/;
    // RE
    this.re_pathfunc = /^\$(\w+)\((.*?)\)\s*(.*)$/;
    this.re_dashdot = /^(\-{2,}|\.{2,})\s*(.*)$/;
    this.re_variable_range = /^\*([A-Za-z]\w*)\[(.*?)\]\s*(.*)$/;
    this.re_variable_single = /^\*([A-Za-z]\w*|)\s*(.*)$/;
    this.re_movept = /^\@\((.*?)\)\s*(.*)$/;
    this.re_coord = /^\((.*?)\)\s*(.*)$/;
    this.re_cycle = /^(cycle)\s*(.*)$/;
    this.re_offset = /^\<(.*?)\>\s*(.*)$/;
    this.re_relative = /^\[(.*?)\]\s*(.*)$/;
    this.re_nonblanks = /^(\S+)\s*(.*)$/;
    this.re_label_arg = /\s*\{(.*)\}\s*(.*)$/;
    this.re_action_label = /\s*\"(.*?)\"\s*(.*)$/;
    this.re_action_style = /\s*\{(.*?)\}\s*(.*)$/;
    this.re_action_arg = /\s*(\w+)\s*(.*)$/;
    this.re_range = /^(\d+)\-(\d+)$/;
    this.re_scalar_func = /^([a-zA-Z]\w*)\(/;
    this.re_float_number = /^(\d*\.\d+|\d*\.|\d+)/;
    ///following is a map storing all the symbols
    this.variables = {};
    ///following stores the last array of coords
    /// note that each time an new array must be created
    /// because there might be existing symbols pointing at it
    this.lastcoords = [];
    /// set the viewport width and height and unit
    this.def_width = 25;  // the total number of grid units of the width
    this.def_height = 10; // the total number of grid units of the height
    this.def_unit = 5;  // the length each grid unit, always in mm
    this.width = this.def_width;  
    this.height = this.def_height; 
    this.unit = this.def_unit;  
    this.config = {}; // extra config stuff for the viewport
    this.commands = [];
    this.cartesians = {};
    this.barcharts = {};
    this.my_funcs = {};
    /// following are command options for drawing
    this.initSettings();
  }

  initSettings() {
    this.def_barlength = this.barlength = 0.25;
    this.def_refs = this.refs = 1;
    this.def_refx = this.refx = 0;
    this.def_refy = this.refy = 0;
    this.def_labelgapx = this.labelgapx = 3;
    this.def_labelgapy = this.labelgapy = 3;
  }

  toDiagram(para) {
    this.do_setup();
    for (var row = 0; row < para.length; row++) {
      var line = para[row];
      this.row = row;
      this.line = line;
      var exit_flag = this.parseLine(line);
      if (exit_flag) {
        break;
      }
    }
    ///remove empty output lines
    var o = this.commands;
    var o = o.filter(s => (s.length > 0)?true:false);
    return this.do_finalize(o.join('\n'));
  }

  assertInt(val, def_v, min, max) {
    if (!val) {
      return def_v;
    }
    val = parseInt(val);
    if (!Number.isFinite(val)) {
      return def_v;
    }
    if (val < min) {
      val = min;
    } else if (val > max) {
      val = max;
    }
    return val;
  }

  assertFloat(val, def_v, min=null, max=null) {
    val = parseFloat(val);
    if (!Number.isFinite(val)) {
      return def_v;
    }
    if (Number.isFinite(min)) {
      if (val < min) {
        val = min;
      }
    }
    if (Number.isFinite(max)) {
      if (val > max) {
        val = max;
      }
    }
    return val;
  }

  toAreaOp(v, def_v) {
    if (!v) {
      return def_v;
    }
    if (typeof v == 'string') {
      v = v.trim();
      if (!v) {
        return def_v;
      }
      if (v === 'filldraw') {
        return 0x11;
      }
      if (v === 'fill') {
        return 0x10;
      }
      if (v === 'draw') {
        return 0x10;
      }
    }
    return def_v;
  }

  toFloat(v, def_v) {
    if (!v) {
      return def_v;
    }
    if (typeof v == 'string') {
      v = v.trim();
      if (!v) {
        return def_v;
      }
    }
    return parseFloat(v);
  }

  toString(v, def_v) {
    if (!v) {
      return def_v;
    }
    if (typeof v == 'string') {
      v = v.trim();
      if (!v) {
        return def_v;
      }
      return v;
    }
    return '' + v;
  }

  fetchVariable(a) {

    ///***NOTE: this function should return a path, not a point!

    /// if it is null then we return an empty path
    if (!a) {
      this.commands.push(this.do_comment(`ERR:empty variable name, assuming (0,0)`));
      return [[0, 0]];
    }
    if (this.variables.hasOwnProperty(a)) {
      return this.variables[a];
    }
    if (a === '*') {
      return this.lastcoords;
    }
    return [[0, 0]];
  }

  /// this is called inside readCoordsLine()
  execFunction(line, fun_str, arg_str) {

    var ret_val = [];
    var args = arg_str.split(',');
    args = args.map(x => x.trim());
    switch (fun_str) {

      case 'mid':

        if (args.length == 2) {
          var coords1 = this.fetchVariable(args[0]);
          var coords2 = this.fetchVariable(args[1]);
          var fraction = 0.5;
        } else if (args.length == 3) {
          var coords1 = this.fetchVariable(args[0]);
          var coords2 = this.fetchVariable(args[1]);
          var fraction = parseFloat(args[2]);
        } else {
          ret_val.push([0, 0, 'nan']);
          break;
        }

        var z0 = this.point(coords1, 0);
        var z1 = this.point(coords2, 0);
        if (this.isvalidpt(z0) && this.isvalidpt(z1) && Number.isFinite(fraction)) {
          var z0x = parseFloat(z0[0]);
          var z0y = parseFloat(z0[1]);
          var z1x = parseFloat(z1[0]);
          var z1y = parseFloat(z1[1]);
          var ptx = z0x + (z1x - z0x) * fraction;
          var pty = z0y + (z1y - z0y) * fraction;
          ret_val.push([ptx, pty]);///always returns a single point
        } else {
          ret_val.push([0, 0, 'nan']);
        }
        break;

      case 'midpoint':

        if (args.length == 2) {
          var coords = this.fetchVariable(args[0]);
          var fraction = parseFloat(args[1]);
          if (coords && Number.isFinite(fraction)) {
            var z0 = this.point(coords, 0);
            var z1 = this.point(coords, 1);
            var z0x = parseFloat(z0[0]);
            var z0y = parseFloat(z0[1]);
            var z1x = parseFloat(z1[0]);
            var z1y = parseFloat(z1[1]);
            var ptx = z0x + (z1x - z0x) * fraction;
            var pty = z0y + (z1y - z0y) * fraction;
            ret_val.push([ptx, pty]);///always returns a single point
          }

        } else if (args.length == 1) {

          var coords = this.fetchVariable(args[0]);
          var z0 = this.point(coords, 0);
          var z1 = this.point(coords, 1);
          var z0x = parseFloat(z0[0]);
          var z0y = parseFloat(z0[1]);
          var z1x = parseFloat(z1[0]);
          var z1y = parseFloat(z1[1]);
          var midx = (z0x + z1x) * 0.5;
          var midy = (z0y + z1y) * 0.5;
          ret_val.push([midx, midy]);
        }
        break;

      case 'scatterpoints':

        if (args.length == 5) {
          var sx = parseFloat(args[0]);
          var sy = parseFloat(args[1]);
          var tx = parseFloat(args[2]);
          var ty = parseFloat(args[3]);
          var n = parseFloat(args[4]);
          if (Number.isFinite(sx) &&
            Number.isFinite(sy) &&
            Number.isFinite(tx) &&
            Number.isFinite(ty) &&
            Number.isFinite(n)) {

            if (n > N_Max_Array) {
              n = N_Max_Array;
            }
            var pt = [sx, sy, 0, '', ''];
            var dx = tx - sx;
            var dy = ty - sy;
            ret_val.push(pt);
            for (let i = 1; i < n; i++) {
              var frac = i / (n - 1);
              var px = sx + frac * dx;
              var py = sy + frac * dy;
              ret_val.push([px, py, 0, '', '']);
            }
          }
        }
        break;

      case 'shiftpoints':

        /// shiftpoints(a,0,-2)
        /// shiftpoints(a,2,-1)

        if (args.length == 3) {
          var coords = this.fetchVariable(args[0]);
          var dx = parseFloat(args[1]);
          var dy = parseFloat(args[2]);
          if (coords &&
            Number.isFinite(dx) &&
            Number.isFinite(dy)) {

            for (let i = 0; i < coords.length; i++) {
              var pt = this.point(coords, i);
              if (this.iscyclept(pt)) {
                ret_val.push([0, 0, 'cycle']);
              } else {
                var x = pt[0] + dx;
                var y = pt[1] + dy;
                ret_val.push([x, y, pt[2], pt[3], pt[4], pt[5], pt[6]]);
              }
            }
          }
        }
        break;

      case 'somepoints':

        /// somepoints(a,0,2) - all points between 0 and 2, including 0 and 2
        /// somepoints(a,3,5) - all points between 3 and 5, including 3 and 5
        /// somepoints(a,3)   - a single point in 3

        if (args.length == 3) {
          var coords = this.fetchVariable(args[0]);
          var j = parseFloat(args[1]);
          var k = parseFloat(args[2]);
        } else if (args.length == 2) {
          var coords = this.fetchVariable(args[0]);
          var j = parseFloat(args[1]);
          var k = parseFloat(args[1]);
        } else {
          break;
        }

        if (coords &&
          Number.isFinite(j) &&
          Number.isFinite(k)) {

          var i;
          if (k >= j) {
            for (i = j; i <= k && i >= 0 && i < coords.length; ++i) {
              var pt = this.point(coords, i);
              ret_val.push(pt);
            }
          } else {
            for (i = j; i >= k && i >= 0 && i < coords.length; --i) {
              var pt = this.point(coords, i);
              ret_val.push(pt);
            }
          }
        }
        break;

      case 'allpoints':

        /// allpoints(a,b,c) - all points from a,b,and c,

        for (var i in args) {
          var coords = this.fetchVariable(args[i]);
          if (coords) {
            for (var j in coords) {
              var pt = this.point(coords, j);
              ret_val.push(pt);
            }
          }
        }
        break;

      case 'lineintersect': {

        /// lineintersect(a,b) - 'a' for the first line and 'b' for the second line

        if (args.length == 2) {
          var coords0 = this.fetchVariable(args[0]);
          var coords1 = this.fetchVariable(args[1]);

          let p0 = this.point(coords0, 0);
          let p1 = this.point(coords0, 1);
          let q0 = this.point(coords1, 0);
          let q1 = this.point(coords1, 1);
          let [x, y] = this.computeLineIntersection(p0, p1, q0, q1);
          ///console.log('p0=',p0);
          ///console.log('p1=',p1);
          ///console.log('q0=',q0);
          ///console.log('q1=',q1);
          ///console.log('x=',x);
          ///console.log('y=',y);
          return [[x, y]];
        }

        break;
      }

      case 'linecircleintersect': {

        /// circlelineintersect(a,c,radius)
        ///
        ///  a - symbol: the line (two points)
        ///  c - symbol: circle center (one point)
        ///  radius - number: circle radius

        if (args.length == 3) {
          let [a, c, radius] = args;
          var coords0 = this.fetchVariable(a);
          let p0 = this.point(coords0, 0);
          let p1 = this.point(coords0, 1);
          let [A, B, C] = this.computeStandardLineForm(p0, p1);
          var coords0 = this.fetchVariable(c);
          let [x0, y0] = this.point(coords0, 0);
          // translate C to new coords
          C = C - A * x0 - B * y0;
          let rsq = radius * radius;
          let [x1, y1, x2, y2] = this.computeCircleLineIntersection(rsq, A, B, C);
          x1 += x0;
          x2 += x0;
          y1 += y0;
          y2 += y0;
          return [[x1, y1], [x2, y2]];///return a path of two points;
          ///note one or both might be Infinity of NaN
        }
        break;
      }

      default:
        break;

    }
    if (ret_val.length == 0) {
      return [[0, 0]];///a coordinate with a single point
    }
    return ret_val;
  }

  argsToCoords(args) {

    var pp = args.split(',');
    if (pp.length == 1) {
      var pp0 = pp[0];
      if (pp0[0] == '$') {
        pp0 = pp0.slice(1);
        if (this.variables.hasOwnProperty(pp0)) {
          return this.variables[pp0];
        }
      }
    }
    return [];
  }

  removeDot(v) {

    if (typeof v == 'string') {
      return v.slice(1);
    }
    return '';
  }

  assertAlign(v) {

    if (typeof v == 'string') {
      if (
        v.localeCompare('.ctr') == 0 ||
        v.localeCompare('.lft') == 0 ||
        v.localeCompare('.rt') == 0 ||
        v.localeCompare('.top') == 0 ||
        v.localeCompare('.bot') == 0 ||
        v.localeCompare('.ulft') == 0 ||
        v.localeCompare('.urt') == 0 ||
        v.localeCompare('.llft') == 0 ||
        v.localeCompare('.lrt') == 0) {
        return v.slice(1);
      }
    }
    return 'urt';
  }

  fix(v) {
    if (typeof v == 'number') {
    } else {
      v = parseFloat(v);
    }
    return parseFloat(v.toFixed(2));
  }

  fix0(v) {
    if (typeof v == 'number') {
    } else {
      v = parseFloat(v);
    }
    return parseFloat(v.toFixed(0));
  }

  fix2(v) {
    if (typeof v == 'number') {
    } else {
      v = parseFloat(v);
    }
    return parseFloat(v.toFixed(2));
  }

  iscyclept(pt) {
    if (Array.isArray(pt) && pt[2] == 'cycle') {
      return true;
    }
    return false;
  }

  valid(coords, i) {
    if (Array.isArray(coords) && i >= 0 &&
      i < coords.length && coords[i][2] !== 'cycle' &&
      coords[i][2] !== 'nan') {
      return true;
    }
    return false;
  }

  isvalidpt(pt) {
    if (Array.isArray(pt)) {
      if (typeof pt[2] === 'string') {
        if( pt[2] == 'cycle'|| pt[2] == 'nan') {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  point(coords, i) {
    /// * NOTE: This method is to return a point not yet scaled by
    ///   refx/refy/refs
    ///
    /// * NOTE: this method will always return a point. Albet the
    ///   the join will be set to 'nan'.
    ///
    if (!coords) {
      return [0, 0, 'nan'];
    }
    if (i < coords.length) {
      var pt = coords[i];
      return pt;
    } else {
      return [0, 0, 'nan'];
    }
  }

  readCoordsText(line) {
    var v;
    if ((v = this.re_label_arg.exec(line)) !== null) {
      var label = v[1].trim();
      line = v[2];
    } else {
      var label = '';
    }
    return [label,line];
  }

  readActionLabel(line) {
    var v;
    if ((v = this.re_action_label.exec(line)) !== null) {
      var txt = v[1];
      line = v[2];
    } else {
      var txt = '';
    }
    return [txt,line];
  }

  readActionStyle(line) {
    var v;
    if ((v = this.re_action_style.exec(line)) !== null) {
      var g = this.readParamsStyle(v[1].trim());
      line = v[2];
    } else {
      var g = {};
    }
    return [g,line];
  }

  readActionText(line) {
    var v;
    if ((v = this.re_action_arg.exec(line)) !== null) {
      var action = v[1].trim();
      line = v[2];
    } else {
      var action = '';
    }
    return [action,line];
  }

  readCoordsLine(line) {

    /// $midpoint(a)
    /// $somepoint(a,0.2)
    /// a
    /// b
    /// last
    /// (1,2) (3,4) (5,6) ...
    /// (1,2) (3) (4) ...
    /// (1,2) 3 (4,5) ...
    /// (1,2) 3 (4,5) ...
    /// (1,2) 3 [up:3] [down:4] [lft:3] [rt:5] [ulft:3] [urt:3] [llft:3] [lrt:5] (9,10) ...
    /// <3,1> (1,2)
    /// (1,2) 3 [angledist:10,4] (9,10) ()
    /// * (1,2) (3,4)
    /// *a (1,2) (3,4)
    /// *a..(1,2) (3,4)
    /// <0,1> *a..(1,2) (3,4)
    /// <0,1> *a..(1,2) (3,4) cycle

    /// The <3,4> is for setting an offset, for which all future
    /// coord points will be based on. Thus for the following we are adding
    /// points that are: (3,4) and (4,5)
    ///   <3,3> (0,1) (1,2)

    /// Note that the entire line is going to be
    /// either a function, a variable, or a
    /// list of coordinates.

    /// ***IMPORTANT***:
    /// If a function is detected, then the entire
    /// line is assumed to be of only that function;
    /// if a variable is detected, then the entire line
    /// if of that variable; if a list of numbers (with parenthesized
    /// pairs, then the entire line will be scanned for all literal
    /// points until something non-number is detected and then the scan
    /// stops.

    /// not that for the literal number input, each individual
    /// coordinate is considered to be either in pairs, in which case
    /// the parentheses must be detected. Of within the parenthesis
    /// only a single number is detected and there is no comma, then
    /// only the x/coordinate will be initialized to this number,
    /// and the y/coordinate will be reset to zero. If a number without
    /// parenthesis is detected then only the x-coordinate will be set
    /// that number, and the its y/coordinate is left to zero.

    /// (1,2) (3,4) (5,6) ...
    /// (1,2) (3) (4) ...
    /// (1,2) a (4,5) ...
    /// (1,2) a (4,5) ()
    /// (1,2) -- a .. (4,5) -- (4,4) -- ()

    var coords = [];
    var offsetx = 0;
    var offsety = 0;
    var lastpt = [0, 0];
    var dx = 0;
    var dy = 0;
    var x = 0;
    var y = 0;
    var v;
    var n = 0;
    var x1 = 0;//First control point for cubic
    var y1 = 0;//First control point for cubic
    var x2 = 0;//Second control point for cubic
    var y2 = 0;//Second control point for cubic
    var x3 = 0;//First control point for quadratic
    var y3 = 0;//First control point for quadratic
    var lastjoin = '';///'hobby','','cubic','quadrilatic','arcpath'
    var hobby_p = [];
    while (line.length) {

      if ((v = this.re_variable_range.exec(line)) !== null) {
        var d = v[1].trim();
        var range = v[2].trim();
        line = v[3];

        var symbol = d;
        if (symbol.length == 0) {
          var from = this.lastcoords;
        } else {
          var from = this.fetchVariable(symbol);
        }
        var indices = range.split(',');
        var join = '';
        for (var s of indices) {
          if (this.re_range.test(s)) {
            var v = this.re_range.exec(s);
            var i1 = parseInt(v[1]);
            var i2 = parseInt(v[2]);
            if (Number.isFinite(i1) && Number.isFinite(i2)) {
              for (var i = i1; i1 <= i2 && i <= i2; ++i) {
                [x, y, join] = this.point(from, i);
                if (join !== 'cycle' && join !== 'nan') {
                  x += offsetx;
                  y += offsety;
                  coords.push([x, y]);
                  lastpt[0] = x;
                  lastpt[1] = y;
                }
              }
              for (var i = i1; i1 > i2 && i >= i2; --i) {
                [x, y, join] = this.point(from, i);
                if (join !== 'cycle' && join !== 'nan') {
                  x += offsetx;
                  y += offsety;
                  coords.push([x, y]);
                  lastpt[0] = x;
                  lastpt[1] = y;
                }
              }
            }
          } else {
            var i = parseInt(s);
            if (Number.isFinite(i)) {
              [x, y, join] = this.point(from, i);
              if (join !== 'cycle' && join !== 'nan') {
                x += offsetx;
                y += offsety;
                coords.push([x, y]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
        }
        continue;

      } else if ((v = this.re_variable_single.exec(line)) !== null) {
        var d = v[1].trim();
        line = v[2];

        var symbol = d;
        if (symbol.length == 0) {
          var from = this.lastcoords;
        } else {
          var from = this.fetchVariable(symbol);
        }
        for (var i = 0; i < from.length; ++i) {
          ///***NOTE: must call point() so that it converts any variable
          ///   to real coords.;
          var pt = this.point(from, i);
          x = pt[0];
          y = pt[1];
          x += offsetx;
          y += offsety;
          coords.push([x, y, pt[2], pt[3], pt[4], pt[5], pt[6]]);
          lastpt[0] = x;
          lastpt[1] = y;
        }
        continue;

      }

      if ((v = this.re_pathfunc.exec(line)) !== null) {
        var raw = v[0];
        var d = v[1];
        var args = v[2];
        line = v[3];
        var ret_val = this.execFunction(raw, d, args);
        for (var i = 0; i < ret_val.length; ++i) {
          [x, y] = this.point(ret_val, i);
          x += offsetx;
          y += offsety;
          coords.push([x, y, '--']);
          lastpt[0] = x;
          lastpt[1] = y;
        }
        continue;
      }

      if ((v = this.re_movept.exec(line)) !== null) {
        var d = v[1].trim();
        line = v[2];
        d = d.split(',');
        d = d.map(x => x.trim());
        if (d.length == 2) {
          [x,y] = d;
          x = parseFloat(x);
          y = parseFloat(y);
          if (Number.isFinite(x)&&
            Number.isFinite(y)) {
            x += offsetx;
            y += offsety;
            lastpt[0] = x;
            lastpt[1] = y;
            coords.push([0, 0, 'nan']);
            coords.push([x, y]);
            lastjoin = '';
          }
        }
        continue;
      }

      if ((v = this.re_cycle.exec(line))!==null) {
        coords.push([0, 0, 'cycle']);
        line = v[2];
        //break;
        continue;
      }

      if ((v = this.re_coord.exec(line))!==null) {
        n++;
        var d = v[1].trim();
        line = v[2];
        d = d.split(',');
        d = d.map(x => x.trim());
        if (d.length < 2) {
          coords.push([0, 0, 'nan']);
          continue;
        }
        var d0 = d[0];
        var d1 = d[1];
        if (!d0) {
          x = lastpt[0];
        } else {
          x = parseFloat(d0);
          x += offsetx;
        }
        if (!d1) {
          y = lastpt[1];
        } else {
          y = parseFloat(d1);
          y += offsety;
        }
        if (Number.isFinite(x) && Number.isFinite(y)) {
          ///add in the offset; ***NOTE that offset should only
          ///be added for real coords, and not the relatives.
          if (lastjoin === 'hobby') {
            hobby_p.push([x, y]);
            var tension = 1;
            var knots = makeknots(hobby_p, tension, false);///nitrile-preview-mppath.js
            mp_make_choices(knots[0]);
            coords.push([x, y, '']);
            var i = coords.length - 3;
            for (var i = 1; i < knots.length; ++i) {
              var j = coords.length - knots.length + i;
              coords[j][2] = 'C';
              coords[j][3] = knots[i - 1].rx_pt;
              coords[j][4] = knots[i - 1].ry_pt;
              coords[j][5] = knots[i].lx_pt;
              coords[j][6] = knots[i].ly_pt;
            }
            lastjoin = 'hobby';///keep it as 'hobby' so that we can absorb more .. connectors
          } else {
            coords.push([x, y, '']);
            lastjoin = '';
          }
          lastpt[0] = x;
          lastpt[1] = y;
        }
        continue;
      }

      if ((v = this.re_offset.exec(line)) !== null) {
        n++;
        /// <1,2>, or <1,>, or <,2>
        var d = v[1].trim();
        line = v[2];
        if (!d) {
          continue; ///d is an empty string
        }
        d = d.split(',');
        d = d.map(x => x.trim());
        if (d.length == 2) {
          dx = parseFloat(d[0]);
          dy = parseFloat(d[1]);
          if (Number.isFinite(dx)) { offsetx += dx; }
          if (Number.isFinite(dy)) { offsety += dy; }
        }
        continue;
      }

      if ((v = this.re_relative.exec(line)) !== null) {
        n++;
        /// [angledist:angle,dist]
        /// [turnrt:angle,dist]
        /// [turnlft:angle,dist]
        /// [turn:angle,dist]
        /// [flip:dx,dy] /// flip the point to the other side of the line of the last two points
        /// [l:dx,dy] /// line
        /// [h:dx] /// line
        /// [v:dy] /// line
        /// [c:dx1,dy1,dx2,dy2,dx,dy]
        /// [s:dx2,dy2,dx,dy]
        /// [a:rx,ry,angle,bigarcflag,sweepflag,dx,dy]
        /// [q:dx1,dy1,dx,dy]
        /// [t:dx,dy]
        var d = v[1].trim();
        line = v[2];
        d = d.split(':');
        d = d.map(x => x.trim());
        if (d.length == 2) {
          var key = d[0];
          var val = d[1];
          if (key === 'angledist') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              var angle = parseFloat(val[0]);
              var dist = parseFloat(val[1]);
              dx = dist * Math.cos(angle / 180 * Math.PI);
              dy = dist * Math.sin(angle / 180 * Math.PI);
              if (!Number.isFinite(dx)) { dx = 0; }
              if (!Number.isFinite(dy)) { dy = 0; }
              x = lastpt[0] + dx;
              y = lastpt[1] + dy;
              lastjoin = '';
              coords.push([x, y, '', x1, y1, x2, y2]);
              lastpt[0] = x;
              lastpt[1] = y;
            }
          }
          else if (key === 'turn') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              var angle = parseFloat(val[0]);
              var lastangle = this.computeLastAngleDegree(coords);
              angle += lastangle;
              var dist = parseFloat(val[1]);
              dx = dist * Math.cos(angle / 180 * Math.PI);
              dy = dist * Math.sin(angle / 180 * Math.PI);
              if (!Number.isFinite(dx)) { dx = 0; }
              if (!Number.isFinite(dy)) { dy = 0; }
              x = lastpt[0] + dx;
              y = lastpt[1] + dy;
              lastjoin = '';
              coords.push([x, y, '', x1, y1, x2, y2]);
              lastpt[0] = x;
              lastpt[1] = y;
            }
          }
          else if (key === 'turnlft') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              var angle = parseFloat(val[0]);
              var lastangle = this.computeLastAngleDegree(coords);
              angle += lastangle;
              var dist = parseFloat(val[1]);
              dx = dist * Math.cos(angle / 180 * Math.PI);
              dy = dist * Math.sin(angle / 180 * Math.PI);
              if (!Number.isFinite(dx)) { dx = 0; }
              if (!Number.isFinite(dy)) { dy = 0; }
              x = lastpt[0] + dx;
              y = lastpt[1] + dy;
              lastjoin = '';
              coords.push([x, y, '', x1, y1, x2, y2]);
              lastpt[0] = x;
              lastpt[1] = y;
            }
          }
          else if (key === 'turnrt') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              var angle = parseFloat(val[0]);
              var lastangle = this.computeLastAngleDegree(coords);
              angle -= lastangle;
              var dist = parseFloat(val[1]);
              dx = dist * Math.cos(angle / 180 * Math.PI);
              dy = dist * Math.sin(angle / 180 * Math.PI);
              if (!Number.isFinite(dx)) { dx = 0; }
              if (!Number.isFinite(dy)) { dy = 0; }
              x = lastpt[0] + dx;
              y = lastpt[1] + dy;
              lastjoin = '';
              coords.push([x, y, '', x1, y1, x2, y2]);
              lastpt[0] = x;
              lastpt[1] = y;
            }
          }
          else if (key === 'flip') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              var tx = parseFloat(val[0]);
              var ty = parseFloat(val[1]);
              if (coords.length > 1 && Number.isFinite(tx) && Number.isFinite(ty)) {
                [dx, dy] = this.computeMirroredPointOffset(coords, tx, ty);
                if (Number.isFinite(dx) && Number.isFinite(dy)) {
                  x = tx + dx;
                  y = ty + dy;
                  lastjoin = '';
                  coords.push([x, y, '', x1, y1, x2, y2]);
                  lastpt[0] = x;
                  lastpt[1] = y;
                }
              }
            }
          }
          else if (key === 'l') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              dx = parseFloat(val[0]);
              dy = parseFloat(val[1]);
              if (Number.isFinite(dy) && Number.isFinite(dx)) {
                x = lastpt[0] + dx;
                y = lastpt[1] + dy;
                lastjoin = '';
                coords.push([x, y, '', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 'h') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 1) {
              dx = parseFloat(val[0]);
              dy = 0;
              if (Number.isFinite(dy) && Number.isFinite(dx)) {
                x = lastpt[0] + dx;
                y = lastpt[1] + dy;
                lastjoin = '';
                coords.push([x, y, '', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 'v') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 1) {
              dy = parseFloat(val[0]);
              dx = 0;
              if (Number.isFinite(dy) && Number.isFinite(dx)) {
                x = lastpt[0] + dx;
                y = lastpt[1] + dy;
                lastjoin = '';
                coords.push([x, y, '', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 'c') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 6) {
              x1 = lastpt[0] + parseFloat(val[0]);
              y1 = lastpt[1] + parseFloat(val[1]);
              x2 = lastpt[0] + parseFloat(val[2]);
              y2 = lastpt[1] + parseFloat(val[3]);
              x = lastpt[0] + parseFloat(val[4]);
              y = lastpt[1] + parseFloat(val[5]);
              if (Number.isFinite(x1) &&
                Number.isFinite(y1) &&
                Number.isFinite(x2) &&
                Number.isFinite(y2) &&
                Number.isFinite(x) &&
                Number.isFinite(y)) {
                lastjoin = 'cubic';
                coords.push([x, y, 'C', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 's') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 4) {
              if (lastjoin === 'quadrilatic') {
                [x1,y1] = this.MIRROR([x1,y1],lastpt);
              } else if (lastjoin === 'cubic') {
                [x1,y1] = this.MIRROR([x2,y2],lastpt);
              } else {
                [x1,y1] = lastpt;
              }
              x2 = lastpt[0] + parseFloat(val[0]);
              y2 = lastpt[1] + parseFloat(val[1]);
              x = lastpt[0] + parseFloat(val[2]);
              y = lastpt[1] + parseFloat(val[3]);
              if (Number.isFinite(x1) &&
                Number.isFinite(y1) &&
                Number.isFinite(x2) &&
                Number.isFinite(y2) &&
                Number.isFinite(x) &&
                Number.isFinite(y)) {
                lastjoin = 'cubic';
                coords.push([x, y, 'C', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 'a') {
          /// [a:rx,ry,angle,bigarcflag,sweepflag,dx,dy]
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 7) {
              let X1 = lastpt[0];
              let Y1 = lastpt[1];
              let X2 = lastpt[0] + parseFloat(val[5]);
              let Y2 = lastpt[1] + parseFloat(val[6]);
              let Rx = parseFloat(val[0]);
              let Ry = parseFloat(val[1]);
              let Phi = parseFloat(val[2]);
              let bigarcflag = parseInt(val[3]);
              let sweepflag = parseInt(val[4]);
              if (Number.isFinite(X1) &&
                  Number.isFinite(Y1) &&
                  Number.isFinite(X2) &&
                  Number.isFinite(Y2) &&
                  Number.isFinite(Rx) &&
                  Number.isFinite(Ry) &&
                  Number.isFinite(Phi) &&
                  Number.isFinite(bigarcflag) &&
                  Number.isFinite(sweepflag)) {
                lastjoin = 'arcpath';
                coords.push([X2, Y2, 'A', '','','','', Rx,Ry,Phi,bigarcflag,sweepflag]);
                lastpt[0] = X2;
                lastpt[1] = Y2;
              }
            }
          }
          else if (key === 'q') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 4) {
              x1 = lastpt[0] + parseFloat(val[0]);
              y1 = lastpt[1] + parseFloat(val[1]);
              x = lastpt[0] + parseFloat(val[2]);
              y = lastpt[1] + parseFloat(val[3]);
              if (Number.isFinite(x1) &&
                Number.isFinite(y1) &&
                Number.isFinite(x) &&
                Number.isFinite(y)) {
                ///NOTE: need to convert to cubic
                //let [C0,C1,C2,C3] = this.quadrilaticToCubic(lastpt,[x1,y1],[x,y]);
                coords.push([x, y, 'Q', x1, y1]);
                lastpt[0] = x;
                lastpt[1] = y;
                lastjoin = 'quadrilatic';
              }
            }
          }
          else if (key === 't') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              x = lastpt[0] + parseFloat(val[0]);
              y = lastpt[1] + parseFloat(val[1]);
              if (lastjoin === 'quadrilatic') {
                [x1,y1] = this.MIRROR([x1,y1],lastpt);
              } else if (lastjoin === 'cubic') {
                [x1,y1] = this.MIRROR([x2,y2],lastpt);
              } else {
                [x1,y1] = lastpt;
              }
              if (Number.isFinite(x1) &&
                Number.isFinite(y1) &&
                Number.isFinite(x) &&
                Number.isFinite(y)) {
                ///last control point for Q is saved as x1/y1, we need
                ///to mirror it again the lastpt
                ///NOTE: need to convert to cubic
                //let [C0,C1,C2,C3] = this.quadrilaticToCubic(lastpt,[x1,y1],[x,y]);
                coords.push([x, y, 'Q', x1, y1]);
                lastpt[0] = x;
                lastpt[1] = y;
                lastjoin = 'quadrilatic';
              }
            }
          }
        }
        continue;
      }

      if ((v = this.re_dashdot.exec(line)) !== null) {
        var d = v[1].trim();
        line = v[2];

        if (d === '..') {
          if (lastjoin !== 'hobby') {
            hobby_p = [];
            hobby_p.push([lastpt[0], lastpt[1]]);
            lastjoin = 'hobby';
          }
        } else {
          ///NOTE: it is a dash, which terminates it
          hobby_p = [];
          lastjoin = '';
        }

        continue;
      }

      ///***NOTE: it is important to get out of for-loop
      ///because we do not know how to skip to the next coord
      break;
    }

    ///NOTE: here we will call the latest addition which is to
    ///turn all continuous '..' MetaPost curve operation into
    ///..controls(x,y)and(x,y)..

    return coords;
  }

  _readFloatsLine(line) {

    /// 5 5 0.5 0.5
    var floats = line.split(' ');
    floats = floats.map( x => parseFloat(x) );
    floats = floats.filter( x => Number.isFinite(x) );
    return floats;
  }

  readFloatsLine(line) {

    /// 5 5 0.5 0.5
    var floats = [];
    line = line.trimLeft();
    var m;
    var re = /^(\S+)\s*(.*)$/;
    var v;
    while(line.length) {
      if(line.charCodeAt(0)==40){
        var [v,line] = this.extractNextExpr(line);
      }else{
        if((m=re.exec(line))!==null){
          v = m[1];
          v = parseFloat(v);
          line = m[2];
        }else{
          break;
        }
      }
      floats.push(v);
      line = line.trimLeft();
    }
    floats = floats.filter( x => Number.isFinite(x) );
    return floats;
  }

  computeAngleDegree(px, py, tx, ty) {
    var dx1 = tx - px;
    var dy1 = ty - py;
    var ang1 = Math.atan2(dy1, dx1) / Math.PI * 180;
    if (ang1 < 0) { ang1 += 360; }
    return ang1;
  }

  computeLastAngleDegree(coords) {
    var n = coords.length;
    if (n < 2) {
      return 0;
    }
    var sx = coords[n - 2][0];
    var sy = coords[n - 2][1];
    var px = coords[n - 1][0];
    var py = coords[n - 1][1];
    return this.computeAngleDegree(sx, sy, px, py);
  }

  computeMirroredPointOffset(coords, tx, ty) {
    /// This function is to compute the offset to a new point that is the
    /// mirror reflection of the current point (tx,ty) off the line formed
    /// by the last two points in the coords.
    var n = coords.length;
    if (n < 2) {
      return [tx, ty];
    }
    var sx = coords[n - 2][0];
    var sy = coords[n - 2][1];
    var px = coords[n - 1][0];
    var py = coords[n - 1][1];
    px -= sx;
    py -= sy;
    tx -= sx;
    ty -= sy;
    ///console.log('computeMirroredPointOffset: adjusted: tx=',tx,' ty=',ty);
    var magni = Math.sqrt(px * px + py * py);
    px /= magni;///unit vector
    py /= magni;///unit vector
    ///console.log('computeMirroredPointOffset: unit: px=',px,' py=',py);
    var dotprod = px * tx + py * ty;
    ///console.log('computeMirroredPointOffset: dotprod=',dotprod);
    var nx = dotprod * px;
    var ny = dotprod * py;
    ///console.log('computeMirroredPointOffset: nx=',nx,' ny=',ny);
    var dx = nx - tx;
    var dy = ny - ty;
    dx *= 2;
    dy *= 2;
    ///console.log('computeMirroredPointOffset: adjusted: dx=',dx,' dy=',dy);

    return [dx, dy];

  }

  computeLineIntersection(p0, p1, p2, p3) {
    /// this is to compute the intersection of two lines p0--p1 and p2--p3
    let [A1, B1, C1] = this.computeStandardLineForm(p0, p1);
    let [A2, B2, C2] = this.computeStandardLineForm(p2, p3);
    let y = (A1 * C2 - A2 * C1) / (A1 * B2 - A2 * B1);
    let x = (C1 * B2 - C2 * B1) / (A1 * B2 - A2 * B1);
    return [x, y];
  }

  computeStandardLineForm(p1, p2) {
    let [x1, y1] = p1;
    let [x2, y2] = p2;
    let A = y2 - y1;
    let B = x1 - x2;
    let C = A * x1 + B * y1;
    ///console.log('A=',A);
    ///console.log('B=',B);
    ///console.log('C=',C);
    return [A, B, C];
  }

  computeCircleLineIntersection(rsq, A, B, C) {
    ///return an array of four points: x1,y1,x2,y2
    let something = (A * A + B * B) * (B * B * rsq - C * C) + A * A * C * C;
    let x1 = (A * C + Math.sqrt(something)) / (A * A + B * B);
    let y1 = (C - A * x1) / B;
    let x2 = (A * C - Math.sqrt(something)) / (A * A + B * B);
    let y2 = (C - A * x2) / B;
    return [x1, y1, x2, y2];
  }

  assertColor(val, def_val) {
    ///such as 'red', 'rgb(200,100,123)'
    var re_colorrgb = /^rgb\((\d+)\,(\d+)\,(\d+)\)$/;
    var re_colorname = /^([A-Za-z]+)$/;
    var v = null;
    if (!val) {
      return def_val;
    }
    if ((v = re_colorrgb.exec(val)) !== null) {
      return [v[1],v[2],v[3]];
    } else if ((v = re_colorname.exec(val)) !== null) {
      return val;
    } else {
      return def_val;
    }
  }

  assertUnit(val) {
    var v = parseFloat(val);
    if (Number.isFinite(v)) {
      if (v < 1) {
        v = 1;
      }
      return v;
    } else {
      return this.def_unit;
    }
  }

  assertLength(val, def_val) {
    if (!val) {
      return def_val;
    }
    var re = /^([\d\.]+)(px|pt|mm|cm|in|)$/
    var v;
    if ((v = re.exec(val)) !== null) {
      var num = parseFloat(v[1]);
      if (!Number.isFinite(num)) {
        num = 0;
      }
      var unit = v[2];
      if (unit === '') {
        return num;
      }
      else if (unit === 'px') {
        return num;///SVG unit where 1px = 0.75pt
      }
      else if (unit==='pt'){
        return num*1.3333;
      }
      else if (unit==='mm'){
        return num*3.78;
      }
      else if (unit==='cm'){
        return num*37.8;
      }
      else if (unit==='in'){
        return num*96.0;
      }
      else {
        return num;
      }
    } else {
      return def_val;
    }
  }

  to360(val) {
    if (val < 0) {
      val += 360;
    } else if (val > 360) {
      val -= 360;
    }
    return val;
  }

  coordsToStr(coords) {
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
      ///doing some fixes
      join = join || '';
      if (i == 0) {
        join = '';
      }
      ///In case we have a CUBIC BEZIER curve, then pt1 and pt2 are the control points
      if (i == 0) {
        o.push(`(${this.fix(x)},${this.fix(y)})`);
      }
      else if (join == 'C') {
        var p1x = pt[3];/// CUBIC BEZIER curve controlpoint 1x
        var p1y = pt[4];/// CUBIC BEZIER curve controlpoint 1y
        var p2x = pt[5];/// CUBIC BEZIER curve controlpoint 2x
        var p2y = pt[6];/// CUBIC BEZIER curve controlpoint 2y
        o.push(`[C:${this.fix(p1x)},${this.fix(p1y)},${this.fix(p2x)},${this.fix(p2y)},${this.fix(x)},${this.fix(y)}]`);
      }
      else if (join == 'Q') {
        var p1x = pt[3];/// CUBIC BEZIER curve controlpoint 1x
        var p1y = pt[4];/// CUBIC BEZIER curve controlpoint 1y
        o.push(`[Q:${this.fix(p1x)},${this.fix(p1y)},${this.fix(x)},${this.fix(y)}]`);
      }
      else if (join == 'A') {
        var i3 = pt[7];/// Rx
        var i4 = pt[8];/// Ry
        var i5 = pt[9];/// angle
        var i6 = pt[10];/// bigarcflag
        var i7 = pt[11];/// sweepflag
        o.push(`[A:${this.fix(i3)},${this.fix(i4)},${this.fix(i5)},${this.fix(i6)},${this.fix(i7)},${this.fix(x)},${this.fix(y)}]`);
      }
      else if (join == 'cycle') {
        iscycle = 1;
        o.push(`()`);
        break;
      }
      else {
        o.push(`(${this.fix(x)},${this.fix(y)})`);
      }
    }
    return o.join(' ');
  }

  quadrilaticToCubic(P0,P1,P2) {
    var C0=[0,0];
    var C1=[0,0];
    var C2=[0,0];
    var C3=[0,0];
    C0 = this.PT(P0);
    C1 = this.AT(this.ST(1/3,P0), this.ST(2/3,P1));
    C2 = this.AT(this.ST(2/3,P1), this.ST(1/3,P2));
    C3 = this.PT(P2);
    return [C0,C1,C2,C3];
  }

  PT(v){
    return [v[0],v[1]];
  }
  ST(scalar,v){
    return [parseFloat(scalar)*parseFloat(v[0]),
            parseFloat(scalar)*parseFloat(v[1])];
  }
  AT(v,w){
    return [parseFloat(v[0])+parseFloat(w[0]),
            parseFloat(v[1])+parseFloat(w[1])];
  }
  MIRROR(p,c){
    ///c is the mirror
    ///p is the point on one side of the mirror
    ///RETURN; the mirror point of 'p' with respect to 'c'
    var dx = c[0] - p[0];
    var dy = c[1] - p[1];
    var x = c[0] + dx;
    var y = c[1] + dy;
    return [x,y];
  }

  readParamsLine(str) {
    var pp = str.split(',');
    var pp = pp.map( x => x.trim() );
    return pp;
  }

  readParamsStyle(str) {
    return this.parser.toStyle(str);
  }

  def_pic(para) {
    /// ```diagramdef
    /// apple
    /// drawline
    var n = 0;
    var name = '';
    var o = [];
    for( var s of para ) {
      s = s.trim();
      if (s.length === 0) {
        continue;
      }
      n++;
      if (n===1) {
        name = s;
        continue;
      }
      o.push(s);
    }
    global_pics[name] = o;
  }

  parseLine(line) {
    var coords = [];
    var v;
    this.commands.push(this.do_comment(line));
    if ((v = this.re_commentline.exec(line)) !== null) {
      return false;
    }
    if ((v = this.re_path_command.exec(line)) !== null) {
      var symbol = v[1];
      line = v[2];
      var coords = this.readCoordsLine(line, false);
      ///NOTE: for "[a,b,c]"
      var re = /^\[(.*)\]$/;
      if((v=re.exec(symbol))!==null){
        var segs = v[1].split(',');
        var segs = segs.map(x => x.trim());
        var seg = '';
        for (var i = 0; i < segs.length; ++i) {
          var seg = segs[i];
          if (this.re_word.test(seg)) {
            var pt = this.point(coords, i);
            if(this.isvalidpt(pt)){
              this.variables[seg] = [pt];
            } else {
              this.variables[seg] = [];
            }
            this.commands.push(this.do_comment(`saved ${seg}=${this.coordsToStr(this.variables[seg])}`));
          }
        } 
        ///last variable gets all the remaining pts
        if(this.re_word.test(seg)){
          for (var j=i; j < coords.length; ++j) {
            var pt = this.point(coords, j);
            if(this.isvalidpt(pt)){
              this.variables[seg].push(pt);
            }
          }
          this.commands.push(this.do_comment(`saved ${seg}=${this.coordsToStr(this.variables[seg])}`));
        }
      } else if (this.re_word.test(symbol)) {
        this.variables[symbol] = coords;
        this.commands.push(this.do_comment(`saved ${symbol}=${this.coordsToStr(this.variables[symbol])}`));
      } else {
        this.commands.push(this.do_comment(`${symbol} is not a valid variable`));
      }
      return false;
    }
    if ((v = this.re_viewport_command.exec(line)) !== null) {
      this.width = this.assertInt(v[1], 25, 10, 100);
      this.height = this.assertInt(v[2], 10, 4, 100);
      this.commands.push(this.do_comment(`width: ${this.width} height: ${this.height}`));
      this.do_setup();
      return false;
    }
    if ((v = this.re_unit_command.exec(line)) !== null) {
      this.unit = this.assertUnit(v[1]);
      this.commands.push(this.do_comment(`unit: ${this.unit}`));
      this.do_setup();
      return false;
    }
    if ((v = this.re_config_command.exec(line)) !== null) {
      var key = v[1];
      var val = v[2];
      this.config[key] = val;
      this.commands.push(this.do_comment(`config: ${key} ${val}`));
      this.do_setup();
      return false;
    }
    if ((v = this.re_exit_command.exec(line)) !== null) {
      return true;
    }
    if ((v = this.re_reset_command.exec(line)) !== null) {
      this.initSettings();
      this.commands.push(this.do_reset());
      return false;
    }
    if ((v = this.re_set_command.exec(line)) !== null) {
      var key = v[1];
      var val = v[2].trim();
      if (key === 'refx') {
        ///
        /// /3 - from left
        /// 3/ - from right
        ///
        if (val[0] === '/') { /// '/3'
          val = val.slice(1);
          val = this.assertFloat(val, this.def_refx, 0, this.width);
        } else if (val[val.length - 1] === '/') { /// '3/'
          val = val.slice(0, val.length - 1);
          val = this.width - this.assertFloat(val, this.def_refx, 0, this.width);
        } else {
          val = this.assertFloat(val, this.def_refx, 0, this.width);
        }
        this.refx = val;
      } ///such as 12.5
      else if (key === 'refy') {
        ///
        /// /3 - from top
        /// 3/ - from bottom
        ///
        ///if it is "/3" then it specifies a distance from the top side of the diagram
        if (val[0] === '/') { /// '/3'
          val = val.slice(1);
          val = this.height - this.assertFloat(val, this.def_refy, 0, this.height);
        } else if (val[val.length - 1] === '/') { /// '3/'
          val = val.slice(0, val.length - 1);
          val = this.assertFloat(val, this.def_refy, 0, this.height);
        } else {
          val = this.assertFloat(val, this.def_refy, 0, this.height);
        }
        this.refy = val;
      } ///such as 12.5
      else if (key === 'refs')      { this.refs      = this.assertFloat(val, this.def_refs, this.MIN, this.MAX); } ///such as 1
      else if (key === 'barlength') { this.barlength = this.assertFloat(val, this.def_barlength, this.MIN, this.MAX); } ///such as 0.25
      else if (key === 'labelgapx') { this.labelgapx = this.assertFloat(val, this.def_labelgapx, this.MIN, this.MAX); }///such as 3
      else if (key === 'labelgapy') { this.labelgapy = this.assertFloat(val, this.def_labelgapy, this.MIN, this.MAX); }///such as 3
      return false;
    }
    if ((v = this.re_def_command.exec(line)) !== null) {
      var f = {};
      f.name = v[1];
      f.args = v[2].split(',');
      f.expr = v[3];
      this.my_funcs[f.name] = f;
      return false;
    }
    ///NOTE: pic
    if ((v = this.re_pic_command.exec(line)) !== null) {
      let name = v[1];
      //let pic = global_pics[name];
      let pic = this.notes.get(name);
      if (pic) {
        pic = this.parser.join_backslashed_lines(pic);
        pic = this.parser.trim_left(pic);
        for (var s of pic) {
          var done = this.parseLine(s);
          if (done) {
            break;
          }
        }
      } else {
        this.commands.push(this.do_comment(`ERR:pic does not exist: ${name}`));
      }
      return false;
    }
    ///
    ///NOTE: *label* command
    ///
    if ((v = this.re_label_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_text(opt,txt,g,coords));
      this.lastcoords = coords;
      return false;
    }
    ///
    ///NOTE: all *shape* commands
    ///
    if ((v = this.re_apple_command.exec(line)) !== null) {
      var mypath = '(.5,.7)..(.25,.85)..(0,.4)..(.5,0)..(1.0,.5)..(.8,.9)..(.5,.7)--(.5,.7)..(.6,1.0)..(.3,1.1)--(.3,1.1)..(.4,1.0)..(.5,.7)--cycle';
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_shape(coords,1,1,mypath,g));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_basket_command.exec(line)) !== null) {
      var mypath = '(0.3,0)--(2.6,0)..(2.8,1)..(3,2)--(3,2)..(1.5,1.5)..(0,2)--(0,2)..(0.2,1)..(0.3,0)--cycle';
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_shape(coords,3,2,mypath,g));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_crate_command.exec(line)) !== null) {
      var mypath = '(4,2)--(0,2)--(0,0)--(4,0)--(4,2)--(0,2)--(1,3)--(5,3)--(4,2)--(4,0)--(5,1)--(5,3)--(4,2)--cycle';
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_shape(coords,5,3,mypath,g));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_parallelgram_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      var sl = this.assertFloat(g.sl,0.3,0,1);
      var sw = (1-sl);
      var mypath = `(0,0) [h:${sw}] [l:${sl},1] [h:${-sw}] [l:-${sl},-1] cycle`;
      this.commands.push(this.do_shape(coords,1,1,mypath,g));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_rhombus_command.exec(line)) !== null) {
      var mypath = `(0,0.5)--(0.5,1)--(1,0.5)--(0.5,0)--cycle`;
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_shape(coords,1,1,mypath,g));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_trapezoid_command.exec(line)) !== null) {
      var mypath = `(0,0)--(1,0)--(0.6,1)--(0.2,1)--cycle;`;
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_shape(coords,1,1,mypath,g));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_rect_command.exec(line)) !== null) {
      var mypath = `(0,0)--(1,0)--(1,1)--(0,1)--cycle;`;
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_shape(coords,1,1,mypath,g));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_rrect_command.exec(line)) !== null) {
      var mypath = `(0.2,0) [h:0.6] [c:0.2,0,0.2,0,0.2,0.2] [v:0.6] [c:0,0.2,0,0.2,-0.2,0.2] [h:-0.6] [c:-0.2,0,-0.2,0,-0.2,-0.2] [v:-0.6] [c:0,-0.2,0,-0.2,0.2,-0.2] cycle`;
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_shape(coords,1,1,mypath,g));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_brick_command.exec(line)) !== null) {
      var mypath = '(0,0)--(1,0)--(1,0.5)--(0,0.5)--cycle';
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_shape(coords,1,1,mypath,g));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_protractor_command.exec(line)) !== null) {
      var mypaths = [];
      mypaths.push('(-3.5, 0)--(-0.1,0)..(0,0.1)..(0.1,0)--(3.5, 0)..(0, 3.5)..(-3.5, 0)--cycle ');
      mypaths.push('(-2.5100, 0.8500)--(2.5100, 0.8500)..(0, 2.65)..(-2.5100, 0.8500)--cycle ');
      mypaths.push('(3.4468,  0.6078)-- (3.0529,  0.5383) ()');
      mypaths.push('(3.2889,  1.1971)-- (2.9130,  1.0603) ()');
      mypaths.push('(3.0311,  1.7500)-- (2.6847,  1.5500) ()');
      mypaths.push('(2.6812,  2.2498)-- (2.3747,  1.9926) ()');
      mypaths.push('(2.2498,  2.6812)-- (1.9926,  2.3747) ()');
      mypaths.push('(1.7500,  3.0311)-- (1.5500,  2.6847) ()');
      mypaths.push('(1.1971,  3.2889)-- (1.0603,  2.9130) ()');
      mypaths.push('(0.6078,  3.4468)-- (0.5383,  3.0529) ()');
      mypaths.push('(0.0000,  3.5000)-- (0.0000,  3.1000) ()');
      mypaths.push('(-3.4468, 0.6078)-- (-3.0529, 0.5383) ()');
      mypaths.push('(-3.2889, 1.1971)-- (-2.9130, 1.0603) ()');
      mypaths.push('(-3.0311, 1.7500)-- (-2.6847, 1.5500) ()');
      mypaths.push('(-2.6812, 2.2498)-- (-2.3747, 1.9926) ()');
      mypaths.push('(-2.2498, 2.6812)-- (-1.9926, 2.3747) ()');
      mypaths.push('(-1.7500, 3.0311)-- (-1.5500, 2.6847) ()');
      mypaths.push('(-1.1971, 3.2889)-- (-1.0603, 2.9130) ()');
      mypaths.push('(-0.6078, 3.4468)-- (-0.5383, 3.0529) ()');
      mypaths.push('(0.0000,  0.1000)-- (0.0000,  0.8500) ()');
      mypath = mypaths.join(' ');
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_shape(coords,1,1,mypath,g));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_updnprotractor_command.exec(line)) !== null) {
      var mypaths = [];
      mypaths.push('(-3.5, 0)--(-0.1,0)..(0,-0.1)..(0.1,0)--(3.5, 0)..(0,-3.5)..(-3.5, 0)--cycle ');
      mypaths.push('(-2.5100,-0.8500)--(2.5100,-0.8500)..(0,-2.65)..(-2.5100,-0.8500)--cycle ');
      mypaths.push('( 3.4468, -0.6078)-- ( 3.0529, -0.5383) ()');
      mypaths.push('( 3.2889, -1.1971)-- ( 2.9130, -1.0603) ()');
      mypaths.push('( 3.0311, -1.7500)-- ( 2.6847, -1.5500) ()');
      mypaths.push('( 2.6812, -2.2498)-- ( 2.3747, -1.9926) ()');
      mypaths.push('( 2.2498, -2.6812)-- ( 1.9926, -2.3747) ()');
      mypaths.push('( 1.7500, -3.0311)-- ( 1.5500, -2.6847) ()');
      mypaths.push('( 1.1971, -3.2889)-- ( 1.0603, -2.9130) ()');
      mypaths.push('( 0.6078, -3.4468)-- ( 0.5383, -3.0529) ()');
      mypaths.push('( 0.0000, -3.5000)-- ( 0.0000, -3.1000) ()');
      mypaths.push('(-3.4468, -0.6078)-- (-3.0529, -0.5383) ()');
      mypaths.push('(-3.2889, -1.1971)-- (-2.9130, -1.0603) ()');
      mypaths.push('(-3.0311, -1.7500)-- (-2.6847, -1.5500) ()');
      mypaths.push('(-2.6812, -2.2498)-- (-2.3747, -1.9926) ()');
      mypaths.push('(-2.2498, -2.6812)-- (-1.9926, -2.3747) ()');
      mypaths.push('(-1.7500, -3.0311)-- (-1.5500, -2.6847) ()');
      mypaths.push('(-1.1971, -3.2889)-- (-1.0603, -2.9130) ()');
      mypaths.push('(-0.6078, -3.4468)-- (-0.5383, -3.0529) ()');
      mypaths.push('( 0.0000, -0.1000)-- ( 0.0000, -0.8500) ()');
      mypath = mypaths.join(' ');
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_shape(coords,1,1,mypath,g));
      this.lastcoords = coords;
      return false;
    }
    ///
    ///NOTE: all *draw* commands, dealing directly with a path
    ///
    if ((v = this.re_drawcontrolpoints_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_drawcontrolpoints(opt,txt,g,coords));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_drawanglearc_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_drawanglearc(opt,txt,g,coords));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_draw_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.p_path(coords,{},g));              
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_drawarrow_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.p_path(coords,{arrowend:1},g));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_drawrevarrow_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      var p = {arrowstart:1};
      this.commands.push(this.p_path(coords,{arrowstart:1},g));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_drawdblarrow_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.p_path(coords,{arrowstart:1,arrowend:1},g));
      this.lastcoords = coords;
      return false;
    }
    ///
    ///NOTE: Following are *primitive* commands, multiple objects
    /// will be drawn on each one of the points on the path
    ///
    if ((v = this.re_circle_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_circle(opt,txt,g,coords));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_pie_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_pie(opt,txt,g,coords));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_chord_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_chord(opt,txt,g,coords));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_arc_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_arc(opt,txt,g,coords));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_cseg_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_cseg(opt,txt,g,coords));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_dot_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      for (var i = 0; i < coords.length    ; i++) {
        var z0 = this.point(coords, i);
        if (!this.isvalidpt(z0)) continue;
        var x = z0[0];
        var y = z0[1];
        this.commands.push(this.p_dot(x,y,g));
      }
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_hbar_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      for (var i = 0; i < coords.length    ; i++) {
        var z0 = this.point(coords, i);
        if (!this.isvalidpt(z0)) continue;
        var x = z0[0];
        var y = z0[1];
        this.commands.push(this.p_hbar(x,y,g));
      }
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_vbar_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      for (var i = 0; i < coords.length    ; i++) {
        var z0 = this.point(coords, i);
        if (!this.isvalidpt(z0)) continue;
        var x = z0[0];
        var y = z0[1];
        this.commands.push(this.p_vbar(x,y,g));
      }
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_radical_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_radical(opt,txt,g,coords));
      this.lastcoords = coords;
      return false;
    }
    if ((v = this.re_box_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_box(opt,txt,g,coords));
      this.lastcoords = coords;
      return false;
    }
    /*
    if ((v = this.re_updnprotractor_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.readCoordsLine(line);
      this.commands.push(this.do_updnprotractor(opt,txt,g,coords));
      this.lastcoords = coords;
      return false;
    }
    */
    ///
    /// Scalar commands   
    ///
    if ((v = this.re_cartesian_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var floats = this.readFloatsLine(line);
      this.commands.push(this.do_cartesian(opt,txt,g,floats));
      return false;
    }
    if ((v = this.re_barchart_command.exec(line)) !== null) {
      var opt = this.removeDot(v[1]);
      var line = v[2];
      var [txt,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var floats = this.readFloatsLine(line);
      this.commands.push(this.do_barchart(opt,txt,g,floats));
      return false;
    }
    if(line.length>0){
      this.commands.push(this.do_comment(`${line}`));
    }
    return false;
  }

  toLinecap(s) {
    s = s || 'butt';
    if (s === 'butt'||
        s === 'round'||
        s === 'square') {
      return s;
    }
    return 'butt';
  }

  toLinejoin(s) {
    s = s || 'miter';
    if (s === 'miter'||
        s === 'bevel'||
        s === 'round') {
      return s;
    }
    return 'miter';
  }

  toLinedashed(s) {
    s = s || '';
    if (s === ''||
        s === 'evenly'||
        s === 'withdots') {
      return s;
    }
    return '';
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

  extractNextExpr(s,g=null) {
    s = s.trimLeft();
    if (s.length===0) {
      return ['',''];
    }
    var v;
    if (s.charAt(0)==='(') {
      /// such as (30*cos(rad(45)))
      s = s.slice(1);
      s = s.trimLeft();
      var op = '';
      var arg1 = 0;
      for(var n=1; n > 0; ++n){
        var [a,s] = this.extractNextExpr(s,g);
        if (typeof a === 'number') {
          arg1 = this.execScalarOp(op,arg1,a);
          op = ''; /// it is important to clear op here
          continue;
        } 
        ///'a' is string such as '*', '+', ')'
        if (a === ')') {
          break;
        }
        if (a === '') {
          break;
        }
        op = a; ///store 'a' as the operator such as '*', '+', etc.
      }
      return [arg1,s];
    } 
    if ((v=this.re_scalar_func.exec(s))!==null) {
      var func_name = v[1];
      s = s.slice(v[0].length);
      var args = [];
      while(1){
        var [a,s] = this.extractNextExpr(s,g);
        if (typeof a === 'number') {
          args.push(a);
          continue;
        }
        if (a === ')'){
          break;
        }
        if (a === ''){
          break;
        }
      }
      var v = this.execScalarFunc(func_name,args);
      return [v,s];
    } 
    /// if this is a float
    if((v=this.re_float_number.exec(s))!==null){
      v = v[0];
      s = s.slice(v.length);
      return [parseFloat(v),s];
    }
    /// extract the next character from 's'
    var v = s.charAt(0);
    /// if this is a variable, then extract it from 'g'
    if (g && g.hasOwnProperty(v)){
      v = g[v];///replace it with the value
    }
    s = s.slice(1);
    return [v,s];
  }

  execScalarFunc(func_name,args) {
    switch(func_name) {
      case 'pow':
        return Math.pow(args[0],args[1]);
        break;
      case 'rad':
        return args[0]/180*Math.PI;
        break;
      case 'deg':
        return args[0]/Math.PI*180;
        break;
      case 'cos':
        return Math.cos(args[0]);
        break;
      case 'sin':
        return Math.sin(args[0]);
        break;
      case 'sqrt':
        return Math.sqrt(args[0]);
        break;
      case 'atan2':
        return Math.atan2(args[0],args[1]);
        break;
      default:
        break;
    }
    if (this.my_funcs.hasOwnProperty(func_name)) {
      var f = this.my_funcs[func_name];
      var g = {};
      for(var i=0; i < f.args.length; ++i){
        var arg = f.args[i];
        var v = args[i];
        g[arg] = v;
      }
      var myexpr = `(${f.expr})`;//such as '(4*0.5+3)'
      var [ret_val] = this.extractNextExpr(myexpr,g);
      return ret_val;
    }
    return NaN;
  }

  execScalarOp(op,arg1,arg2) {
    switch(op) {
      case '*':
        return parseFloat(arg1)*parseFloat(arg2);
        break;
      case '+':
        return parseFloat(arg1)+parseFloat(arg2);
        break;
      case '-':
        return parseFloat(arg1)-parseFloat(arg2);
        break;
      case '/':
        return parseFloat(arg1)/parseFloat(arg2);
        break;
      default:
        /// if the operator is not recognized simply returns the latest operand
        return arg2;
        break;
    }
  }

  do_barchart(opt,txt,g,floats) {
    var o = [];
    var id = 0;
    if (!this.barcharts[id]) {
      this.barcharts[id] = {};
      var A = this.barcharts[id];
      A.xorigin = 0;
      A.yorigin = 0;
      A.xwidth = 10;
      A.ywidth = 10;
      A.xrange = 100;
      A.yrange = 100;
    }
    var A = this.barcharts[id];
    var opts = opt.split('.');
    var cmd = opts[0];
    var subcmd = opts[1];
    switch( cmd ) {
      case 'setup'://BARCHART
        A.xorigin = this.assertFloat(floats[0],A.xorigin);
        A.yorigin = this.assertFloat(floats[1],A.yorigin);
        A.xwidth = this.assertFloat(floats[2],A.xwidth);
        A.ywidth = this.assertFloat(floats[3],A.ywidth);
        A.xrange = this.assertFloat(floats[4],A.xrange);
        A.yrange = this.assertFloat(floats[5],A.yrange);
        break;

      case 'bbox'://BARCHART
        var x1 = A.xorigin; 
        var y1 = A.yorigin;
        var x2 = A.xorigin + A.xwidth;
        var y2 = A.yorigin + A.ywidth;
        var mypath = `((${x1},${y1})--(${x2},${y1})--(${x2},${y2})--(${x1},${y2})--cycle`;
        var coords = this.readCoordsLine(mypath);
        o.push(this.p_path(coords,{},g));
        break;

      case 'vbar'://BARCHART
        for( var j=0; j < floats.length; j+=1 ) {
          var num = floats[j];
          if (Number.isFinite(num)){
            ///zero height bars are ignored
            if(num > 0){
              var x = A.xorigin + j*A.xwidth/A.xrange;
              var y = A.yorigin;
              var w = A.xwidth/A.xrange;
              var h = num*A.ywidth/A.yrange;
              o.push(this.p_rect(x,y,w,h,g));
            }
          }
        }
        break;

      case 'ytick'://BARCHART
        for( var j=0; j < floats.length; j+=1 ) {
          var num = floats[j];
          if (Number.isFinite(num)){
            var x = A.xorigin;
            var y = A.yorigin + num*A.ywidth/A.yrange;
            o.push(this.p_hbar(x,y,g));
            g.label = `${num}`;
            g.anchor = 'lft';
            if(Number.isFinite(x)&&Number.isFinite(y)){
              o.push(this.p_label(x,y,`${num}`,'lft',g));
            }
          }
        }
        break;

      case 'xtext'://BARCHART
        var ss = txt.split('\\\\');
        var ss = ss.map(x => x.trim());
        for( var j=0,i=0; j < floats.length; j+=1,i++ ) {
          var num = floats[j];
          if (Number.isFinite(num)){
            var x = A.xorigin + num*A.xwidth/A.xrange
            var y = A.yorigin;
            if(Number.isFinite(x)&&Number.isFinite(y)){
              o.push(this.p_label(x,y,ss[i]||'','bot',g));
            }
          }
        }
        break;

      default:
        break;
    }
    
    return o.join('\n');
  }

  do_cartesian(opt,txt,g,floats) {
    var o = [];
    var id = 0;
    if (!this.cartesians[id]) {
      this.cartesians[id] = {};
      var A = this.cartesians[id];
      A.xorigin = 0;
      A.yorigin = 0;
      A.grid = 1;
    }
    var A = this.cartesians[id];
    var ss = opt.split('.');
    var cmd = ss[0];
    var cmdopt = ss[1];
    switch( cmd ) {
      case 'setup'://CARTESIAN
        A.xorigin = this.assertFloat(floats[0],A.xorigin);    
        A.yorigin = this.assertFloat(floats[1],A.yorigin);    
        A.grid = this.assertFloat(floats[2],A.grid);  
        break;
       
      case 'xaxis'://DIAGRAM
        var x1 = this.assertFloat(floats[0],0);
        var x2 = this.assertFloat(floats[1],0);
        x1 /= A.grid;
        x2 /= A.grid;
        x1 += A.xorigin;
        x2 += A.xorigin;
        var y1 = A.yorigin;
        var y2 = A.yorigin;
        var mypath = `(${x1},${y1})--(${x2},${y2})`;
        var coords = this.readCoordsLine(mypath);
        o.push(this.p_path(coords,{arrowstart:1,arrowend:1},g));
        break;

      case 'yaxis'://DIAGRAM
        var y1 = this.assertFloat(floats[0],0);
        var y2 = this.assertFloat(floats[1],0);
        var ystep = this.assertFloat(floats[2],0);
        y1 /= A.grid;
        y2 /= A.grid;
        y1 += A.yorigin;
        y2 += A.yorigin;
        var x1 = A.xorigin;
        var x2 = A.xorigin;
        var mypath = `(${x1},${y1})--(${x2},${y2})`;
        var coords = this.readCoordsLine(mypath);
        o.push(this.p_path(coords,{arrowstart:1,arrowend:1},g));
        break;

      case 'xtick'://CARTESIAN
        for (var j=0; j < floats.length; ++j) {
          var num = floats[j];
          var x = A.xorigin + num/A.grid;
          var y = A.yorigin;
          o.push(this.p_vbar(x,y,g));
          if(Number.isFinite(x)&&Number.isFinite(y)){
            o.push(this.p_label(x,y,`${num}`,'bot',g));
          }
        }
        break;

      case 'ytick'://CARTESIAN
        for (var j=0; j < floats.length; ++j) {
          var num = floats[j];
          var x = A.xorigin;
          var y = A.yorigin + num/A.grid;
          o.push(this.p_hbar(x,y,g));
          if(Number.isFinite(x)&&Number.isFinite(y)){
            o.push(this.p_label(x,y,`${num}`,'lft',g));
          }
        }
        break;

      case 'ellipse'://CARTESIAN
        /// x,y,rx,ry,angle
        var x     = this.assertFloat(floats[0],0);
        var y     = this.assertFloat(floats[1],0);
        var Rx    = this.assertFloat(floats[2],2);
        var Ry    = this.assertFloat(floats[3],1);
        var angle = this.assertFloat(floats[4],0);
        Rx /= A.grid;
        Ry /= A.grid;
        x /= A.grid;
        y /= A.grid;
        x += A.xorigin;
        y += A.yorigin;
        o.push(this.p_ellipse(x,y,Rx,Ry,angle,g));
        break;

      case 'yplot'://CARTESIAN
        var f = g.f;
        //only the first three numbers are meaningful
        var min = this.assertFloat(floats[0],0);
        var max = this.assertFloat(floats[1],0);
        var n = this.assertFloat(floats[2],0);
        if(n<=0){
          n = (max-min)*10/A.grid;
        }
        for( var j=0; f && j <= n; j+=1 ) {
          var x = min; x += j/n * (max-min);
          var y = this.execScalarFunc(f,[x]);
          x /= A.grid;
          y /= A.grid;
          x += A.xorigin;
          y += A.yorigin;
          if(Number.isFinite(x)&&Number.isFinite(y)){
            o.push(this.p_dot(x,y,g));
          }
        }
        break;

      case 'xplot'://CARTESIAN
        var f = g.f;
        //only the first three numbers are meaningful
        var min = this.assertFloat(floats[0],0);
        var max = this.assertFloat(floats[1],0);
        var n = this.assertFloat(floats[2],0);
        if(n<=0){
          n = (max-min)*10/A.grid;
        }
        for( var j=0; f && j <= n; j+=1 ) {
          var y = min; y += j/n * (max-min);
          var x = this.execScalarFunc(f,[y]);
          x /= A.grid;
          y /= A.grid;
          x += A.xorigin;
          y += A.yorigin;
          if(Number.isFinite(x)&&Number.isFinite(y)){
            o.push(this.p_dot(x,y,g));
          }
        }
        break;

      case 'dot'://CARTESIAN
        for( var j=0; j < floats.length; j+=2 ) {
          var x = floats[j];
          var y = floats[j+1];
          x /= A.grid;
          y /= A.grid;
          x += A.xorigin;
          y += A.yorigin;
          if(Number.isFinite(x)&&Number.isFinite(y)){
            o.push(this.p_dot(x,y,g));
          }
        }
        break;

      case 'line'://CARTESIAN
        var coords = [];
        for( var j=0; j < floats.length; j+=2 ) {
          var x = floats[j];
          var y = floats[j+1];
          x /= A.grid;
          y /= A.grid;
          x += A.xorigin;
          y += A.yorigin;
          coords.push([x,y]);
        }
        o.push(this.p_path(coords,{},g));
        break;

      case 'arrow'://CARTESIAN
        var coords = [];
        for( var j=0; j < floats.length; j+=2 ) {
          var x = floats[j];
          var y = floats[j+1];
          x /= A.grid;
          y /= A.grid;
          x += A.xorigin;
          y += A.yorigin;
          d.push([x,y]);
        }
        o.push(this.p_path(coords,{arrowend:1},g));
        break;

      case 'text'://CARTESIAN
        var ss = txt.split('\\\\');
        var ss = ss.map(x => x.trim());
        for( var j=0,i=0; j < floats.length; j+=2,i++ ) {
          var x = floats[j];
          var y = floats[j+1];
          x /= A.grid;
          y /= A.grid;
          x += A.xorigin;
          y += A.yorigin;
          if(Number.isFinite(x)&&Number.isFinite(y)){
            o.push(this.p_label(x,y,ss[i]||'',cmdopt,g));
          }
        }
        break;

      case 'arc'://CARTESIAN
        /// cartesian arc x y r a1 a2
        var x     = this.assertFloat(floats[0],0);
        var y     = this.assertFloat(floats[1],0);
        var r     = this.assertFloat(floats[2],1);
        var a1    = this.assertFloat(floats[3],0);
        var a2    = this.assertFloat(floats[4],45);
        x /= A.grid;
        y /= A.grid;
        x += A.xorigin;
        y += A.yorigin;
        r /= A.grid;
        o.push(this.p_arc(x,y,r,a1,a2,g));
        break;

      default:
        break;
    }
    
    return o.join('\n');
  }

  do_text(opt,txt,g,coords){
    ///NOTE: that the 'opt' has already been checked and converted to valid '.rt','.lft'
    ///values. However, it might contain '.ctr'. 
    var o = [];
    var all_labels = txt.split('\\\\');
    var all_labels = all_labels.map(x => x.trim());
    var t0 = '';
    for (var i = 0; i < coords.length; ++i){
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = z0[0];
      var y = z0[1];
      var t = all_labels[i];
      if (!t) {
        t = t0;
      } else {
        t0 = t;
      }
      g.label = t;
      g.anchor = opt;
      o.push(this.p_label(x,y,t,opt,g));
    }
    return o.join('\n');
  }

  do_shape(coords,w,h,mypath,g){
    ///the w and h are not significant here, will be
    ///removed in the future, each shape is only
    ///shown in its native size, and will be scaled
    ///using the [sx:] and [sy:] factors of 'g'
    var o = [];
    var p = this.readCoordsLine(mypath);
    for (var i = 0; i < coords.length; i++) {
      var z0 = this.point(coords, i);
      if(!this.isvalidpt(z0)) continue;
      var x = z0[0];
      var y = z0[1];
      o.push(this.p_shape(x,y,p,g));
    }
    return o.join('\n');
  }

}

module.exports = { NitrilePreviewDiagram };
























