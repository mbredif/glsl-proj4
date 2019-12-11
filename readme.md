# glsl-proj4

proj4 implementation for glsl

implemented projections:

* aea - [albers equal area](http://proj4.org/projections/aea.html)
* geocent - [geocentric (ecef) coordinates](https://en.wikipedia.org/wiki/ECEF)
* gnom - [gnomic projection](http://proj4.org/projections/gnom.html)
* lcc - [lambert conformal conic](http://proj4.org/projections/lcc.html)
* tmerc - [transverse mercator](http://proj4.org/projections/tmerc.html)

# example

``` js

import { default as proj } from '../src';
var regl = require('regl')()
var camera = require('regl-camera')(regl, { distance: 10 })
var proj_aea = proj('aea', '+proj=aea +lat_1=16 +lat_2=24 +lat_0=19 +lon_0=-157 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs')
var mesh = require('./hawaii.json')
var draw = regl({
  frag: `
    precision mediump float;
    void main () {
      gl_FragColor = vec4(0.5,0.5,0.5,1);
    }
  `,
  vert: "precision mediump float;\n" +
    proj_aea.glsl() +
    `
    uniform aea_t aea;
    uniform float aspect;
    attribute vec2 position;
    void main () {
      const float pi = 3.141592653589793;
      vec3 p = vec3(position * pi / 180., 0.);
      p = proj_forward(aea, p);
      gl_Position = vec4(p*1e-6*vec3(1,aspect,1),1);
    }
  `,
  attributes: {
    position: mesh.positions
  },
  uniforms: Object.assign(
    proj_aea.uniforms,
    { aspect: function (context) { return context.viewportWidth / context.viewportHeight } }
  ),
  elements: mesh.cells
})
regl.frame(function () {
  regl.clear({ color: [1,1,1,1], depth: true });
  draw();
})
```

# javascript api

``` js
var proj = require('glsl-proj4')
```

## var p = proj(name, strOrProj)

Create a glsl-proj4 instance `p`, named `name`, from a proj4js instance (or its proj4 string) `strOrProj`.

## p.uniforms

Return the uniform values. You can pass this object as a struct uniform

## p.glsl.all, p.glsl.forward, p.glsl.inverse, p.glsl.type

`p.glsl` is a per-projection type static dictionnary, which provides glsl code as strings to be included in the shaders.
`p.glsl.type` contains only the glsl type for the projection.
`p.glsl.forward` contains the glsl type definition and the forward functions.
`p.glsl.inverse` contains the glsl type definition and the inverse functions.
`p.glsl.all` contains everything : the glsl type definition, the foward and the inverse functions.

These dictionnaries are also available statically as `proj.aea.glsl`, `proj.geocent.glsl`, `proj.gnom.glsl`, `proj.lcc.glsl` and `proj.tmerc.glsl`.

## p.proj

The proj4js instance.

# glsl api

```
vec3 proj_foward (aea_t t, vec2 p);
vec3 proj_foward (aea_t t, vec3 p);
vec3 proj_foward (geocent_t t, vec2 p);
vec3 proj_foward (geocent_t t, vec3 p);
vec3 proj_foward (gnom_t t, vec2 p);
vec3 proj_foward (gnom_t t, vec3 p);
vec3 proj_foward (lcc_t t, vec2 p);
vec3 proj_foward (lcc_t t, vec3 p);
vec3 proj_foward (tmerc_t t, vec2 p);
vec3 proj_foward (tmerc_t t, vec3 p);

vec3 proj_inverse (aea_t t, vec2 p);
vec3 proj_inverse (aea_t t, vec3 p);
vec3 proj_inverse (geocent_t t, vec3 p);
vec3 proj_inverse (gnom_t t, vec2 p);
vec3 proj_inverse (gnom_t t, vec3 p);
vec3 proj_inverse (lcc_t t, vec2 p);
vec3 proj_inverse (lcc_t t, vec3 p);
vec3 proj_inverse (tmerc_t t, vec2 p);
vec3 proj_inverse (tmerc_t t, vec3 p);
```

Note that `proj_inverse` has no 2 dimensional `geocent` version, as the purpose would be unclear.

## vec3 proj_foward([proj_t] t, vec3 pt)

Forward project `pt` using the parameters from `t`.

## vec3 proj_foward([proj_t] t, vec2 pt)

Forward project `pt` using the parameters from `t` with an altitude of 0.

## vec3 proj_inverse([proj_t] t, vec3 pt)

Inverse project `pt` using the parameters from `t`.

## vec3 proj_inverse([proj_t] t, vec2 pt)

Inverse project `pt` using the parameters from `t` and an altitude of 0.

# install

```
npm install mbredif/glsl-proj4
```

# license

BSD

This library is a fork of the glslify-based project
[substack/proj4js](https://github.com/substack/proj4js).

Parts of this library were adapted from
[proj4js](https://github.com/proj4js/proj4js).
