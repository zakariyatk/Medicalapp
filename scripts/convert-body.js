// Usage: node scripts/convert-body.js <model.obj> src/components/three/bodyMesh.ts
const fs=require('fs');const [input,output]=process.argv.slice(2);if(!input||!output){console.error('Usage: node scripts/convert-body.js <model.obj> <out.ts>');process.exit(1);}
const t=fs.readFileSync(input,'utf8');const V=[],F=[];
for(const l of t.split('\n')){if(l.startsWith('v ')){const [,x,y,z]=l.split(/\s+/);V.push([+x,+y,+z]);}
 else if(l.startsWith('f ')){const idx=l.trim().split(/\s+/).slice(1).map(p=>parseInt(p.split('/')[0],10)-1);for(let i=1;i+1<idx.length;i++)F.push(idx[0],idx[i],idx[i+1]);}}
let minY=Infinity,maxY=-Infinity;for(const v of V){minY=Math.min(minY,v[1]);maxY=Math.max(maxY,v[1]);}
const s=1.78/(maxY-minY);const P=V.map(([x,y,z])=>[x*s,(y-minY)*s,z*s+0.015]);
const lo=[0,1,2].map(i=>Math.min(...P.map(p=>p[i]))),hi=[0,1,2].map(i=>Math.max(...P.map(p=>p[i])));
const pos=new Uint16Array(P.length*3);P.forEach((p,k)=>{for(let i=0;i<3;i++)pos[k*3+i]=Math.round((p[i]-lo[i])/(hi[i]-lo[i])*65535);});
const idx=new Uint16Array(F);
const b64=a=>Buffer.from(a.buffer).toString('base64');
const r=n=>+n.toFixed(5);
const out=`// Generated from the body model uploaded by the project owner
// (Co-the-nguoi-3D.obj, a Blender 2.81 export whose mesh is named "BaseSpiderMan").
// Confirm the model's licence allows use in the app before release.
//
// Scaled to 1.78 m tall, feet at y = 0, facing +z. Positions are quantized to 16 bits per axis
// between BOUNDS.min and BOUNDS.max; indices are triangles. Regenerate with scripts/convert-body.js.
export const VERTEX_COUNT = ${P.length};
export const BOUNDS = { min: [${lo.map(r)}], max: [${hi.map(r)}] } as const;
export const POSITIONS_B64 =
  "${b64(pos)}";
export const INDICES_B64 =
  "${b64(idx)}";
`;
fs.writeFileSync(output,out);console.log(P.length,'verts',F.length/3,'tris',(out.length/1024).toFixed(0)+'KB');
