
var settings = require('../settings')
  , shaders = require('../shaders')
  , debug = require('debug')('renderer:3d:materials')

module.exports = Materials;

function Materials(renderer){
  debug('new')
  this.globalTimeUniform = { type: "f", value: 0 };
  this.paddle = new THREE.MeshPhongMaterial({shading: THREE.FlatShading, color:0xffffff});
  this.arenaSideFaces = new THREE.MeshFaceMaterial();
  this.centerLine = new THREE.MeshLambertMaterial({color:0xe5e4c6, side:THREE.DoubleSide})
  this.arenaTransMaterial = createArenaTransMaterial();
  this.arenaBorder = new THREE.MeshLambertMaterial({color:0xe5e4c6})
  this.arenaSideMaterials = createArenaSideMaterials(this.arenaBorder);
  this.arenaGrid = createArenaGrid(renderer)
  this.reflectionBox = new THREE.MeshBasicMaterial({color:0x000000, side:THREE.DoubleSide})
  this.playerACube = createCubeMaterial()
  this.playerBCube = createCubeMaterial()
  
  this.localVideoTexture = createTexture("videoInput");
  this.remoteVideoTexture = createTexture("remoteInput");
  //this.remoteVideo = new THREE.MeshLambertMaterial({map:this.remoteVideoTexture}) 
  this.paddleSetupBox = createPaddleSetupBox(this.localVideoTexture); 
  this.emptyVideo = new THREE.MeshLambertMaterial({color:0x000000})
  this.cpu = createCPUMaterial();

  this.terrainShadow = createShadow()
  this.treeBranches = new THREE.MeshLambertMaterial({color:0x0e64bb,shading: THREE.FlatShading});
  this.treeTrunk = new THREE.MeshLambertMaterial({color:0x0c5ea7,shading: THREE.FlatShading})
  this.icon = createIconMaterial(this.globalTimeUniform)

  this.genericAnimal = createAnimalMaterial(); 

}

Materials.prototype.update = function(world){
  var tex = this.localVideoTexture;
  if( tex && tex.image.readyState === tex.image.HAVE_ENOUGH_DATA )
    tex.needsUpdate = true;

  tex = this.remoteVideoTexture;
  if( tex && tex.image.readyState === tex.image.HAVE_ENOUGH_DATA ) {
    tex.needsUpdate = true;
  }

  // update eyes
  if( world.pucks.length ){
    var p = world.pucks[0].current
     // , u = this.cpuCube[4].uniforms;
   // u.mouse.value.x = p.x;
   // u.mouse.value.y = p.y;
   //u.time.value += 0.01;
  }

  // update arena score
  // (using hits.length because it gets reset at 3)

  this.arenaGrid.uniforms.points.value.x = world.players.a.hits.length;
  this.arenaGrid.uniforms.points.value.y = world.players.b.hits.length;

  // update global shader time
  this.globalTimeUniform.value += 0.03;

  // arena colors
  // TODO move this to level change or settings change
  if( this.arenaTransMaterial.color.getHex() != settings.data.arenaColor) {
    this.arenaTransMaterial.color.setHex( settings.data.arenaColor );
    this.arenaSideMaterials[0].color.setHex( settings.data.arenaColor );
  }
}


function createArenaGrid(renderer){
  var gridTexture = THREE.ImageUtils.loadTexture( "images/grid.png" );
  gridTexture.mapping = THREE.UVMapping;
  gridTexture.anisotropy = renderer.renderer.getMaxAnisotropy();
  gridTexture.minFilter = gridTexture.magFilter = THREE.LinearMipMapLinearFilter;
  gridTexture.wrapS = gridTexture.wrapT = THREE.RepeatWrapping;

  var digitsTexture = THREE.ImageUtils.loadTexture( "images/grid_nr3.png" );
  gridTexture.anisotropy = renderer.renderer.getMaxAnisotropy();
  digitsTexture.minFilter = digitsTexture.magFilter = THREE.LinearMipMapLinearFilter;

  return new THREE.ShaderMaterial({
    depthWrite: false,
    transparent: true,
    uniforms: {
      points: { type: "v2", value: new THREE.Vector2(0,0)},
      tGrid: { type: "t", value: gridTexture},
      tDigits: { type: "t", value: digitsTexture},
      scale: { type: "v2", value: new THREE.Vector2(settings.data.arenaColumns , 26 ) }
    },
    vertexShader: shaders.simple_vs,
    fragmentShader: shaders.arena_fs
  });
}

function createArenaTransMaterial(){
  return new THREE.MeshLambertMaterial({
    color: settings.data.arenaColor, 
    opacity:0.8,
    transparent:true,
    depthWrite:false
  })
}

function createArenaSideMaterials(arenaSideMaterialWhite){
  var arenaSideMaterialColor = new THREE.MeshLambertMaterial({color:settings.data.arenaColor}); 
  return [
    arenaSideMaterialColor, // Left side
    arenaSideMaterialWhite, // Right side
    arenaSideMaterialWhite, // Top side
    arenaSideMaterialWhite, // Bottom side
    arenaSideMaterialWhite, // Front side
    arenaSideMaterialWhite  // Back side
  ]
}

function createCubeMaterial(){
  var front
    , side = new THREE.MeshLambertMaterial({color:0xe5e4c6})
    , front = new THREE.MeshLambertMaterial({color:0x000000}); 

  return [
    side,   // Left side
    side,   // Right side
    side,   // Top side
    side,   // Bottom side
    front,  // Front side
    side    // Back side
  ]
}

function createCPUMaterial() {
  return new THREE.ShaderMaterial({
      transparent: false,
      uniforms:  {
        time: { type: "f", value:0},
        resolution: { type: "v2", value:new THREE.Vector3(640,320)},
        mouse: { type: "v2", value:new THREE.Vector3(0.5,0.5)}
      },
      vertexShader: shaders.simple_vs,
      fragmentShader: shaders.cpu_fs
    })
}

function createPaddleSetupBox( localVideoMaterial){
  var side = new THREE.MeshLambertMaterial({color:0x0e3d74});

 var camMat = new THREE.ShaderMaterial({
    uniforms:  {
      tCamera: {type:"t",value: localVideoMaterial}
    },
    vertexShader: shaders.simple_vs,
    fragmentShader: shaders.camera_fs
  });


 // var camMat = new THREE.MeshLambertMaterial({color:0x0e3d74});
  return [
    side,   // Left side
    side,   // Right side
    side,   // Top side
    side,   // Bottom side
    camMat,  // Front side
    side    // Back side
  ]
}

function createTexture(element){
  var texture = new THREE.Texture(document.getElementById(element));
  texture.generateMipmaps = false;
  return texture;
}

function createShadow(){
  return new THREE.MeshBasicMaterial({
    depthWrite:false,
    transparent:true, 
    blending:THREE.MultiplyBlending, 
    depthTest: true, 
    map:THREE.ImageUtils.loadTexture("images/radial_gradient_white.png")
  })
}


function createIconMaterial(timeUniform){
  return new THREE.ShaderMaterial({
    transparent:false,
    uniforms:  {
      color: { type: "c", value: new THREE.Color('#ff0000') },
      time: timeUniform
    },
    vertexShader: shaders.extraicon_vs,
    fragmentShader: shaders.extraicon_fs,
    blending: THREE.AdditiveBlending,
    wireframe:false
  });
}

function createAnimalMaterial(){

  var animalTexture = THREE.ImageUtils.loadTexture("images/tex_animals.jpg");

  return new THREE.MeshLambertMaterial({ 
    map:animalTexture,
    ambient: 0x076fc8, specular: 0x222222, shininess: 20
    
  })


}