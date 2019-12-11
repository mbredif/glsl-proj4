import parse from 'proj4/lib/parseCode'
import ellipsoid from 'proj4/lib/constants/Ellipsoid'
import derive from 'proj4/lib/deriveConstants'

import gnom from './gnom';
import aea from './aea';
import geocent from './geocent';
import tmerc from './tmerc';
import lcc from './lcc';

function glsl_proj(name, strOrProj) {
  var p = strOrProj.projName ? strOrProj : parse(strOrProj);
  var e = ellipsoid[p.ellps || p.datumCode || 'WGS84'] || {};
  if (e && p) e = derive.sphere(e.a, e.b, e.rf, p.ellps, p.sphere);
  var proj = null;
  if (p.projName === 'gnom') {
    proj = new gnom(p, e);
  } else if (p.projName === 'aea') {
    proj = new aea(p, e);
  } else if (p.projName === 'geocent') {
    proj = new geocent(p, e);
  } else if (p.projName === 'tmerc') {
    proj = new tmerc(p, e);
  } else if (p.projName === 'lcc') {
    proj = new lcc(p, e);
  } else return null;

  const uniforms = {};
  Object.keys(proj).forEach(function (key) {
    uniforms[name+'.'+key] = proj[key]
  })
  return {
    proj: p,
    glsl: proj.glsl,
    uniforms
  }
}

glsl_proj.gnom = gnom;
glsl_proj.aea = aea;
glsl_proj.geocent = geocent;
glsl_proj.tmerc = tmerc;
glsl_proj.lcc = lcc;

export default glsl_proj;
