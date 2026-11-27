/* Paper Build mascot "Pia": an original student character in a flat vector style.
   mascot(pose) returns an SVG string. Poses: point, thumbs, cheer, sad, think. */
(function () {
  var INK = '#2b2520', SKIN = '#f6cfb0', SKIN2 = '#eab896', HAIR = '#3a2620', HAIR2 = '#563628',
      TOP = '#f2a65a', TOP2 = '#e08b3e', SHIRT = '#fffaf0', PANTS = '#3f5a7a', SHOE = '#2b2520',
      CHEEK = '#f39a86', PAPER = '#fffdf7', ORANGE = '#f47a3c', TEAR = '#8cb8e3', LENS = '#ffffff';
  var W = 'stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';

  /* a sleeve from shoulder through elbow to wrist, with outline */
  function sleeve(pts) {
    var d = 'M' + pts.map(function (p) { return p.join(' '); }).join(' L');
    return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="' + TOP + '" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function cuff(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="7.5" fill="' + TOP2 + '" ' + W + '/>'; }
  function hand(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 7.5) + '" fill="' + SKIN + '" ' + W + '/>'; }
  function palmUp(x, y) {
    return '<path d="M' + (x - 9) + ' ' + y + ' Q' + x + ' ' + (y + 9) + ' ' + (x + 13) + ' ' + (y - 1) + ' Q' + (x + 16) + ' ' + (y - 5) + ' ' + (x + 11) + ' ' + (y - 6) +
      ' L' + (x - 2) + ' ' + (y - 4) + ' Q' + (x - 9) + ' ' + (y - 5) + ' ' + (x - 9) + ' ' + y + ' Z" fill="' + SKIN + '" ' + W + '/>';
  }
  function thumbUp(x, y) {
    return '<rect x="' + (x - 9) + '" y="' + (y - 7) + '" width="18" height="15" rx="6" fill="' + SKIN + '" ' + W + '/>' +
      '<path d="M' + (x - 5) + ' ' + (y - 7) + ' Q' + (x - 6) + ' ' + (y - 20) + ' ' + (x + 1) + ' ' + (y - 21) + ' Q' + (x + 4) + ' ' + (y - 19) + ' ' + (x + 3) + ' ' + (y - 7) + '" fill="' + SKIN + '" ' + W + '/>';
  }
  function paper(x, y, rot) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' +
      '<path d="M-15 -20 H9 L15 -14 V20 H-15 Z" fill="' + PAPER + '" ' + W + '/>' +
      '<path d="M9 -20 V-14 H15" fill="#eadfc8" ' + W + '/>' +
      '<path d="M-10 -12 H2" stroke="' + ORANGE + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M-10 -4 H10 M-10 3 H10 M-10 10 H4" stroke="#d6ccb6" stroke-width="2.4" stroke-linecap="round"/></g>';
  }
  function legs() {
    return '<path d="M84 196 L82 236 M116 196 L118 236" stroke="' + INK + '" stroke-width="17" stroke-linecap="round"/>' +
      '<path d="M84 196 L82 236 M116 196 L118 236" stroke="' + PANTS + '" stroke-width="12.5" stroke-linecap="round"/>' +
      '<path d="M70 242 Q70 233 80 233 H88 Q91 240 88 244 H72 Q70 244 70 242 Z" fill="' + SHOE + '"/>' +
      '<path d="M130 242 Q130 233 120 233 H112 Q109 240 112 244 H128 Q130 244 130 242 Z" fill="' + SHOE + '"/>';
  }
  function torso() {
    return '<path d="M62 150 Q64 128 84 124 H116 Q136 128 138 150 L140 200 Q100 210 60 200 Z" fill="' + TOP + '" ' + W + '/>' +
      '<path d="M60 194 Q100 204 140 194 L140 200 Q100 210 60 200 Z" fill="' + TOP2 + '" ' + W + '/>' +
      '<path d="M88 124 L100 140 L112 124 Z" fill="' + SHIRT + '" ' + W + '/>' +
      '<path d="M100 140 V190" stroke="' + TOP2 + '" stroke-width="2.4" stroke-dasharray="1 8" stroke-linecap="round"/>' +
      '<rect x="92" y="108" width="16" height="18" rx="5" fill="' + SKIN2 + '"/>';
  }
  function hairBack() {
    return '<path d="M64 86 Q60 40 100 38 Q140 40 136 86 Q138 112 128 122 L72 122 Q62 112 64 86 Z" fill="' + HAIR + '" ' + W + '/>';
  }
  function braid() {
    var s = '', y = 112;
    for (var i = 0; i < 5; i++) { s += '<ellipse cx="' + (131 + i * 1.2) + '" cy="' + (y + i * 11) + '" rx="8" ry="7" fill="' + HAIR + '" ' + W + '/>'; }
    return s + '<path d="M128 168 L138 168" stroke="' + ORANGE + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M130 171 Q133 182 129 186 M136 171 Q137 181 140 184" stroke="' + HAIR + '" stroke-width="4" stroke-linecap="round" fill="none"/>';
  }
  function head(p) {
    var tilt = p === 'sad' ? ' transform="rotate(-6 100 110)"' : p === 'think' ? ' transform="rotate(5 100 110)"' : '';
    var eyes, brows, mouth, extra = '';
    if (p === 'cheer') {
      eyes = '<path d="M80 84 Q86 78 92 84 M108 84 Q114 78 120 84" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
      brows = '<path d="M79 70 Q86 66 92 69 M108 69 Q114 66 121 70" fill="none" stroke="' + HAIR + '" stroke-width="2.8" stroke-linecap="round"/>';
      mouth = '<path d="M89 96 Q100 112 111 96 Z" fill="#b8392b" ' + W + '/><path d="M94 104 Q100 108 106 104" stroke="#f08a74" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    } else if (p === 'sad') {
      eyes = '<ellipse cx="86" cy="86" rx="3" ry="3.6" fill="' + INK + '"/><ellipse cx="114" cy="86" rx="3" ry="3.6" fill="' + INK + '"/>';
      brows = '<path d="M79 76 L92 72 M121 76 L108 72" stroke="' + HAIR + '" stroke-width="2.8" stroke-linecap="round"/>';
      mouth = '<path d="M92 104 Q100 98 108 104" fill="none" stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round"/>';
      extra = '<path class="tear" d="M119 92 Q123 100 119 103 Q115 100 119 92 Z" fill="' + TEAR + '" stroke="' + INK + '" stroke-width="1.6"/>';
    } else if (p === 'think') {
      eyes = '<ellipse cx="88" cy="83" rx="3" ry="3.8" fill="' + INK + '"/><ellipse cx="116" cy="83" rx="3" ry="3.8" fill="' + INK + '"/>';
      brows = '<path d="M80 72 Q86 70 92 72 M108 68 Q114 65 121 68" fill="none" stroke="' + HAIR + '" stroke-width="2.8" stroke-linecap="round"/>';
      mouth = '<path d="M94 101 Q100 99 106 102" fill="none" stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round"/>';
    } else {
      eyes = '<ellipse cx="86" cy="84" rx="3" ry="3.8" fill="' + INK + '"/><ellipse cx="114" cy="84" rx="3" ry="3.8" fill="' + INK + '"/>';
      brows = '<path d="M79 72 Q86 68 92 71 M108 71 Q114 68 121 72" fill="none" stroke="' + HAIR + '" stroke-width="2.8" stroke-linecap="round"/>';
      mouth = p === 'thumbs'
        ? '<path d="M89 97 Q100 110 111 97 Z" fill="#b8392b" ' + W + '/>'
        : '<path d="M90 98 Q100 107 110 98" fill="none" stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round"/>';
    }
    var glasses = '<circle cx="86" cy="84" r="9" fill="' + LENS + '" fill-opacity=".25" ' + W + '/><circle cx="114" cy="84" r="9" fill="' + LENS + '" fill-opacity=".25" ' + W + '/>' +
      '<path d="M95 84 Q100 80 105 84" fill="none" ' + W + '/>';
    return '<g class="hd"' + tilt + '>' +
      '<ellipse cx="68" cy="88" rx="5" ry="7" fill="' + SKIN + '" ' + W + '/><ellipse cx="132" cy="88" rx="5" ry="7" fill="' + SKIN + '" ' + W + '/>' +
      '<path d="M68 82 Q68 50 100 50 Q132 50 132 82 Q132 116 100 116 Q68 116 68 82 Z" fill="' + SKIN + '" ' + W + '/>' +
      '<path d="M66 80 Q64 44 100 42 Q138 42 134 80 Q126 62 108 60 Q96 70 72 72 Z" fill="' + HAIR + '" ' + W + '/>' +
      '<path d="M84 52 Q100 46 116 54" stroke="' + HAIR2 + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="78" cy="97" r="5.5" fill="' + CHEEK + '" opacity=".7"/><circle cx="122" cy="97" r="5.5" fill="' + CHEEK + '" opacity=".7"/>' +
      brows + eyes + glasses + '<path d="M100 88 Q98 93 101 94" fill="none" stroke="' + SKIN2 + '" stroke-width="2.4" stroke-linecap="round"/>' + mouth + extra + '</g>';
  }
  function arms(p) {
    switch (p) {
      case 'cheer':
        return '<g class="ml">' + sleeve([[70, 138], [50, 112], [42, 80]]) + cuff(42, 76) + hand(41, 66) + '</g>' +
          '<g class="mr">' + sleeve([[130, 138], [150, 112], [158, 80]]) + cuff(158, 76) + hand(159, 66) + '</g>';
      case 'point':
        return '<g class="ml">' + sleeve([[70, 142], [52, 172], [34, 166]]) + cuff(32, 165) + palmUp(20, 162) + '</g>' +
          sleeve([[130, 142], [140, 176], [122, 182]]) + paper(124, 168, -8) + hand(122, 182);
      case 'thumbs':
        return sleeve([[70, 142], [64, 176], [78, 184]]) + paper(84, 172, 6) + hand(80, 186) +
          '<g class="mr">' + sleeve([[130, 142], [156, 168], [160, 138]]) + cuff(160, 132) + thumbUp(160, 120) + '</g>';
      case 'sad':
        return sleeve([[70, 142], [70, 176], [92, 192]]) + sleeve([[130, 142], [130, 176], [108, 192]]) + hand(96, 194) + hand(104, 194);
      case 'think':
        return sleeve([[70, 142], [64, 176], [78, 184]]) + paper(84, 172, 6) + hand(80, 186) +
          '<g class="mr">' + sleeve([[130, 142], [142, 172], [114, 124]]) + hand(110, 116, 8) + '</g>';
      default:
        return sleeve([[70, 142], [64, 180]]) + hand(64, 186) + sleeve([[130, 142], [136, 180]]) + hand(136, 186);
    }
  }
  function bubble() {
    return '<g class="q"><circle cx="166" cy="42" r="17" fill="#fffcf5" ' + W + '/>' +
      '<text x="166" y="50" text-anchor="middle" font-family="Georgia,serif" font-size="24" font-weight="700" fill="' + ORANGE + '">?</text>' +
      '<circle cx="148" cy="62" r="4" fill="#fffcf5" ' + W + '/></g>';
  }
  function confetti() {
    var c = ['#f47a3c', '#8cb8e3', '#b4c47e', '#ecd97a', '#bcaee6', '#e98fa6'], s = '';
    var pts = [[16, 30], [40, 14], [70, 8], [128, 8], [160, 14], [186, 30], [10, 70], [190, 72], [26, 48], [174, 50], [100, 4], [56, 26], [146, 26]];
    pts.forEach(function (p, i) {
      var col = c[i % c.length], d = (i % 5) * 0.12;
      s += i % 3 === 0
        ? '<circle class="cf" style="animation-delay:' + d + 's" cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" fill="' + col + '"/>'
        : '<rect class="cf" style="animation-delay:' + d + 's" x="' + p[0] + '" y="' + p[1] + '" width="7" height="4" rx="1" fill="' + col + '" transform="rotate(' + (i * 37 % 90) + ' ' + p[0] + ' ' + p[1] + ')"/>';
    });
    return '<g class="cfs">' + s + '</g>';
  }
  window.mascot = function (pose, label) {
    var p = pose || 'point';
    var body = '<g class="mb">' +
      '<ellipse cx="100" cy="246" rx="46" ry="6" fill="rgba(0,0,0,.08)"/>' +
      hairBack() + legs() + torso() + braid() + head(p) + arms(p) + '</g>';
    return '<svg class="mascot m-' + p + '" viewBox="0 0 200 252" role="img" aria-label="' + (label || 'Pia, the Paper Build mascot') + '">' +
      (p === 'cheer' ? confetti() : '') + (p === 'think' ? bubble() : '') + body + '</svg>';
  };
})();
