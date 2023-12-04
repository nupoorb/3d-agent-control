// https://discourse.threejs.org/t/third-person-controller-with-keyboard-joystick-no-mouse/53433

import * as THREE from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';


// general setup, boring, skip to the next comment

console.clear( );

var scene = new THREE.Scene();
    scene.background = new THREE.Color( 'gainsboro' );

var camera = new THREE.PerspectiveCamera( 45, innerWidth/innerHeight );
    camera.position.set( 0, 130, 90 );

var renderer = new THREE.WebGLRenderer( {antialias: true} );
    renderer.setSize( innerWidth, innerHeight );
    document.body.appendChild( renderer.domElement );
			
window.addEventListener( "resize", (event) => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix( );
    renderer.setSize( innerWidth, innerHeight );
});


// lights

	const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
	hemiLight.position.set( 0, 20, 0 );
	scene.add( hemiLight );

	const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
	dirLight.position.set( 0, 20, 10 );
	scene.add( dirLight );

// ground

// a procedurally generated texture grid

const grid = new THREE.GridHelper( 200, 200, 0x000000, 0x000000 );
				grid.material.opacity = 0.2;
				grid.material.transparent = true;
				scene.add( grid );




// next comment


const CAMERA_DISTANCE = 12,
			CAMERA_ALTITUDE = 2.5,
			AXIS_Y = new THREE.Vector3( 0, 1, 0 );


// capture key events
var keyHash = {};

window.addEventListener( 'keydown', (event) => keyHash[event.key] = true );
window.addEventListener( 'keyup', (event) => keyHash[event.key] = false );


// lerping angles need adjusting of cw/ccw lerp direction

function lerpAngle( a, b, k )
{
		if( a-b > Math.PI ) b += 2*Math.PI;
		if( b-a > Math.PI ) a += 2*Math.PI;
			
		return THREE.MathUtils.lerp( a, b, k ) % (2*Math.PI);
}


// create a cat and its tail

var catSpeed = 0,
		catDir = new THREE.Vector3( 0, 0, -1 ),
		cat = new THREE.Mesh(
						new THREE.BoxGeometry( 1, 3, 0.5 ),
						new THREE.MeshNormalMaterial()
					),
		tail1 = new THREE.Mesh(
							new THREE.SphereGeometry(0.08),
							new THREE.MeshNormalMaterial()
					),
		tail2 = new THREE.Mesh(
			new THREE.SphereGeometry(0.05),
			new THREE.MeshNormalMaterial()
	),
		tail3 = new THREE.Mesh(
			new THREE.SphereGeometry(0.02),
			new THREE.MeshNormalMaterial()
	);

var blobs = [];

var gamePoints = 5;
var blobRad = 0.4

for(var i = 0; i<gamePoints; i++){
	blobs[i] = new THREE.Mesh(
		new THREE.SphereGeometry(blobRad),
		new THREE.MeshBasicMaterial({ color: 0xff0000 })
	)
}
		var mixer;
		const loader = new GLTFLoader();
		// const loader = new OBJLoader();
		loader.load( 'models/car1.glb', function ( gltf ) {
			//  gltf.scene.scale.set(0.2, 0.2, 0.2);
			
			cat = gltf.scene;
			scene.add( cat );

			mixer = new THREE.AnimationMixer( cat );
			var action = mixer.clipAction( gltf.animations[ 1 ] );
			action.play();


		} );


// scene.add(tail1, tail2, tail3);

blobs.forEach((data)=>scene.add(data));

var blobs_position_x= [];
var blobs_position_y= [];
for(var i = 0; i<gamePoints;i++){
	blobs_position_x[i] = Math.floor(Math.random() * 20);
	blobs_position_y[i] = Math.floor(Math.random() * 20);
}

var x_val = 0, y_val = 0, z_val = 0;
var X_val = 0, Y_val = 0, Z_val = 0;

const Buttons = document.getElementById("Button");
Buttons.onclick = function StartAnimation()
{
	const outputString = document.getElementById("output").innerHTML;
	var vals = outputString.split(",")
	// console.log(parseFloat(vals[0]));
	X_val = parseFloat(vals[0] || 0); 
	Y_val = parseFloat(vals[1] || 0); 
	Z_val = parseFloat(vals[2] || 0);
renderer.setAnimationLoop( animationLoop );
	animate();
}


function animationLoop( t )
{
		// process keys
		// cat.rotation.y = Math.PI;

		const outputString = document.getElementById("output").innerHTML;
		var vals = outputString.split(",")
		// console.log(parseFloat(vals[0]));
		x_val = parseFloat(vals[0] || 0); 
		y_val = parseFloat(vals[1] || 0); 
		z_val = parseFloat(vals[2] || 0);



		catSpeed = 1/2 * (Y_val-y_val);
		catDir.subVectors( cat.position, camera.position ).y = 0;
		catDir.applyAxisAngle( AXIS_Y, 1/2 * (X_val-x_val) );
		catDir.normalize();
		
		// if( keyHash.ArrowUp || keyHash.ArrowLeft || keyHash.ArrowRight || keyHash.ArrowDown )
		// {
		// 		catSpeed = 1;
				
		// 		if( keyHash.ArrowDown )	
		// 		else
		// 		if( keyHash.ArrowLeft )	catDir.applyAxisAngle( AXIS_Y, 1.4 );
		// 		else
		// 		if( keyHash.ArrowRight ) catDir.applyAxisAngle( AXIS_Y, -1.4 );
			
		// 		catDir.normalize( );
		// }
		// else
		// 		catSpeed *= 0.99;

	
		cat.position.addScaledVector( catDir, catSpeed*0.1 );
		cat.rotation.y = lerpAngle( cat.rotation.y, Math.atan2( catDir.x, catDir.z ), 0.06 );

		
		tail1.position.lerp( cat.position, 0.05 );	
		tail2.position.lerp( tail1.position, 0.03 );	
		tail3.position.lerp( tail2.position, 0.03 );	
		camera.position.lerp( tail3.position, 0.03 );

		for(var i = 0; i<gamePoints;i++){
			
			blobs[i].position.x = blobs_position_x[i];
			blobs[i].position.z = blobs_position_y[i];
			if(Math.abs(cat.position.x-blobs[i].position.x)<blobRad && Math.abs(cat.position.z-blobs[i].position.z)<blobRad){
				blobs[i].position.y = 3;
				// console.log(cat.position.x-blobs[i].position.x);
			}
		}
	
		// set camera position
		camera.position.sub( cat.position );
		camera.position.y = 0;
		camera.position.setLength( CAMERA_DISTANCE );
		camera.position.y = CAMERA_ALTITUDE;
		camera.position.add( cat.position );
	
		// set camera orientation
	  	camera.lookAt( cat.position );

    renderer.render( scene, camera );
}


    


const clock = new THREE.Clock()

function animate() {
    requestAnimationFrame(animate)

    // controls.update()

    // if (modelReady) mixer.update(clock.getDelta())

    // render()

    // stats.update()
}



