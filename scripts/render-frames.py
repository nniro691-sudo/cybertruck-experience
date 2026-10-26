import bpy,math,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'intermediate/one1-studio.blend'))
s=bpy.context.scene;s.render.resolution_x=1024;s.render.resolution_y=640;s.cycles.samples=4;s.render.image_settings.file_format='WEBP';s.render.image_settings.quality=88;s.cycles.use_persistent_data=True
s.world.node_tree.nodes.get('Background').inputs[0].default_value=(.004,.005,.004,1)
car=bpy.data.objects['ONE1'];wire=bpy.data.objects['GOLD_WIREFRAME'];cam=s.camera
bpy.context.view_layer.objects.active=wire;wire.select_set(True)
dec=wire.modifiers.new('Structural lines','DECIMATE');dec.ratio=.035;bpy.ops.object.modifier_apply(modifier=dec.name)
wire.data.materials[0].node_tree.nodes.get('Emission').inputs[1].default_value=.7
ghost_controls=[]
for m in car.data.materials:
 if not m or not m.use_nodes:continue
 nt=m.node_tree;out=next((n for n in nt.nodes if n.type=='OUTPUT_MATERIAL'),None)
 if not out or not out.inputs['Surface'].links:continue
 src=out.inputs['Surface'].links[0].from_socket;mix=nt.nodes.new('ShaderNodeMixShader');tr=nt.nodes.new('ShaderNodeBsdfTransparent');nt.links.new(src,mix.inputs[1]);nt.links.new(tr.outputs[0],mix.inputs[2]);nt.links.new(mix.outputs[0],out.inputs['Surface']);ghost_controls.append(mix.inputs[0])
for m in car.data.materials:
 if m and 'Window' in m.name:
  bs=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
  if bs:
   for l in list(m.node_tree.links):
    if l.to_socket in [bs.inputs['Base Color'],bs.inputs['Alpha']]:m.node_tree.links.remove(l)
   bs.inputs['Base Color'].default_value=(.008,.012,.01,1);bs.inputs['Alpha'].default_value=1;bs.inputs['Roughness'].default_value=.22;bs.inputs['Metallic'].default_value=.45
shots=[([0,1.45,8.7],[0,.55,0]),([6,2.35,6.3],[0,.65,0]),([2.35,1.15,3.05],[.62,.72,1.5]),([3.5,.85,2.1],[1,.42,1.25]),([7.7,2.25,.1],[0,.6,0]),([6.25,2.8,6.6],[0,.6,0]),([-5.8,2.1,6.8],[0,.62,0])]
def conv(a):return Vector((a[0],-a[2],a[1]))
def render(p,t,path,gold=False):
 if os.path.exists(path):return
 cam.location=conv(p);cam.rotation_euler=(conv(t)-cam.location).to_track_quat('-Z','Y').to_euler();wire.hide_render=not gold;car.hide_render=False;
 for ctl in ghost_controls:ctl.default_value=.92 if gold else 0
 s.render.filepath=path;bpy.ops.render.render(write_still=True)
root=str(ROOT/'public/assets/frames');os.makedirs(root,exist_ok=True)
# keyframes first so every chapter is immediately testable
order=list(range(0,97,16))+[i for i in range(97) if i%16]
for i in order:
 p=i/16;idx=min(5,int(p));k=min(1,p-idx);k=k*k*(3-2*k);a,b=shots[idx],shots[idx+1];pos=[a[0][j]*(1-k)+b[0][j]*k for j in range(3)];tar=[a[1][j]*(1-k)+b[1][j]*k for j in range(3)];render(pos,tar,f'{root}/f{i:03d}.webp',3.65<p<4.8);print('FRAME',i,flush=True)
for mode in ['orbit','gold']:
 for i in range(0,48,2):
  a=math.pi/4+2*math.pi*i/48;render([math.sin(a)*8.7,2.45,math.cos(a)*8.7],[0,.6,0],f'{root}/{mode}{i:03d}.webp',mode=='gold');print(mode,i,flush=True)
