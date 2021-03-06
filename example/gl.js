import wrapREGL from 'regl';
import cameraREGL from 'regl-camera'
import proj from '../src';
import mesh from './hawaii.json';

const regl = wrapREGL();
var camera = cameraREGL(regl, { distance: 10 })

var proj_aea = proj('aea', '+proj=aea +lat_1=16 +lat_2=24 +lat_0=19 +lon_0=-157 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs')
var proj_lcc = proj('lcc', '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')
var proj_geocent = proj('geocent', '+proj=geocent +datum=WGS84 +units=m +no_defs')
var proj_gnom = proj('gnom', '+proj=gnom +lat_0=90 +lon_0=0 +x_0=6300000 +y_0=6300000 +ellps=WGS84 +datum=WGS84 +units=m +no_defs')
var proj_tmerc = proj('tmerc', '+proj=tmerc +lat_0=20 +lon_0=136 +k=0.9999 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')
console.log(proj_aea);
console.log(proj_lcc);
console.log(proj_geocent);
console.log(proj_gnom);
console.log(proj_tmerc);
console.log(proj);

var draw = regl({
  frag: `
    precision mediump float;
    void main () {
      gl_FragColor = vec4(0.5,0.5,0.5,1);
    }
  `,
  vert: "precision mediump float;\n" +
    proj_aea.glsl.all +
    proj_geocent.glsl.all +
    proj_lcc.glsl.all +
    proj_tmerc.glsl.all +
    proj_gnom.glsl.all +
    `
    uniform aea_t aea;
    uniform geocent_t geocent;
    uniform lcc_t lcc;
    uniform tmerc_t tmerc;
    uniform gnom_t gnom;
    uniform float aspect;
    attribute vec2 position;
    void main () {
      const float pi = 3.141592653589793;
      vec3 p = vec3(position * pi / 180., 0.);

      p = proj_inverse(aea, proj_forward(aea, p));
      p = proj_inverse(geocent, proj_forward(geocent, p));
      p = proj_inverse(gnom, proj_forward(gnom, p));
      p = proj_inverse(lcc, proj_forward(lcc, p));
      p = proj_inverse(tmerc, proj_forward(tmerc, p));

      p = proj_forward(aea, p);
      gl_Position = vec4(p*1e-6*vec3(1,aspect,1),1);
    }
  `,
  attributes: {
    position: mesh.positions
  },
  uniforms: Object.assign(
    proj_aea.uniforms,
    proj_geocent.uniforms,
    proj_gnom.uniforms,
    proj_lcc.uniforms,
    proj_tmerc.uniforms,
    { aspect: function (context) { return context.viewportWidth / context.viewportHeight } }
  ),
  elements: mesh.cells
})
regl.frame(function () {
  regl.clear({ color: [1,1,1,1], depth: true });
  draw();
})
