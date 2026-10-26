import bpy, math, os, sys, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
(ROOT/"qa").mkdir(exist_ok=True)
(ROOT/"intermediate").mkdir(exist_ok=True)
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/assets/one1.glb'))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();car=bpy.context.object;car.name='ONE1'
world=car.matrix_world.copy();car.parent=None;car.matrix_world=world
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
pts=[car.matrix_world@Vector(v) for v in car.bound_box];mn=Vector([min(v[i] for v in pts) for i in range(3)]);mx=Vector([max(v[i] for v in pts) for i in range(3)])
center=(mn+mx)/2;scale=5/max(mx-mn)
car.location-=Vector((center.x,center.y,mn.z));car.scale*=scale;car.location*=scale
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
print('CAR BOUNDS',car.dimensions[:],flush=True)
# Restrained dark graphite paint, preserve the original textures and materials.
for m in car.data.materials:
 if not m or not m.use_nodes:continue
 bs=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
 if not bs:continue
 if 'Paint' in m.name:
  bs.inputs['Base Color'].default_value=(.055,.064,.059,1);bs.inputs['Metallic'].default_value=.8;bs.inputs['Roughness'].default_value=.24
 if 'Coloured' in m.name:
  for l in list(m.node_tree.links):
   if l.to_socket==bs.inputs['Base Color']:m.node_tree.links.remove(l)
  bs.inputs['Base Color'].default_value=(.25,.14,.04,1);bs.inputs['Metallic'].default_value=.65;bs.inputs['Roughness'].default_value=.28
# a second genuine model for wireframe visualisation
wire=car.copy();wire.data=car.data.copy();bpy.context.collection.objects.link(wire);wire.name='GOLD_WIREFRAME';wire.hide_render=True
wm=bpy.data.materials.new('Gold wire');wm.use_nodes=True;n=wm.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');mix=n.new('ShaderNodeMixShader');trans=n.new('ShaderNodeBsdfTransparent');em=n.new('ShaderNodeEmission');em.inputs[0].default_value=(.8,.43,.12,1);em.inputs[1].default_value=1.2;wf=n.new('ShaderNodeWireframe');wf.use_pixel_size=True;wf.inputs[0].default_value=.5
wm.node_tree.links.new(wf.outputs[0],mix.inputs[0]);wm.node_tree.links.new(trans.outputs[0],mix.inputs[1]);wm.node_tree.links.new(em.outputs[0],mix.inputs[2]);wm.node_tree.links.new(mix.outputs[0],out.inputs['Surface']);wire.data.materials.clear();wire.data.materials.append(wm)
for p in wire.data.polygons:p.material_index=0
bpy.ops.mesh.primitive_plane_add(size=2000,location=(0,0,-.015));floor=bpy.context.object;mat=bpy.data.materials.new('Charcoal studio');mat.diffuse_color=(.025,.029,.026,1);mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.025,.029,.026,1);bs.inputs['Roughness'].default_value=.29;bs.inputs['Metallic'].default_value=.25;floor.data.materials.append(mat)
def area(name,pos,power,size,color=(1,1,1),sy=None):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='RECTANGLE';d.size=size;d.size_y=sy or size;obj=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(obj);obj.location=pos;obj.rotation_euler=(Vector((0,0,.5))-obj.location).to_track_quat('-Z','Y').to_euler()
area('Overhead softbox',(0,0,6),750,7,sy=3)
area('Key softbox',(4,-4,4),650,6,sy=2)
area('Warm rim',(-4,3,3),950,5,(1,.80,.55),2)
area('Front strip',(-3,-4,2.8),400,4,(.8,.88,1),1.5)
scene=bpy.context.scene;scene.world.use_nodes=True;scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.025,.029,.026,1);scene.world.node_tree.nodes.get('Background').inputs[1].default_value=.5
scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=True;scene.cycles.use_persistent_data=True;scene.cycles.max_bounces=4;scene.cycles.diffuse_bounces=2;scene.cycles.glossy_bounces=2;scene.render.threads_mode='FIXED';scene.render.threads=8
scene.render.resolution_x=1280;scene.render.resolution_y=800;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.4
camdata=bpy.data.cameras.new('Camera');cam=bpy.data.objects.new('Camera',camdata);bpy.context.collection.objects.link(cam);scene.camera=cam;camdata.lens=46;camdata.sensor_fit='VERTICAL';camdata.sensor_height=24
shots=[([0,1.45,8.7],[0,.55,0]),([6,2.35,6.3],[0,.65,0]),([2.35,1.15,3.05],[.62,.72,1.5]),([3.5,.85,2.1],[1,.42,1.25]),([7.7,2.25,.1],[0,.6,0]),([6.25,2.8,6.6],[0,.6,0]),([-5.8,2.1,6.8],[0,.62,0])]
def conv(a):return Vector((a[0],-a[2],a[1]))
def setcam(p,t):
 cam.location=conv(p);cam.rotation_euler=(conv(t)-cam.location).to_track_quat('-Z','Y').to_euler()
setcam(*shots[1]);scene.render.filepath=str(ROOT/'qa/render-test.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'intermediate/one1-studio.blend'))
