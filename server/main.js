// https://discourse.threejs.org/t/third-person-controller-with-keyboard-joystick-no-mouse/53433

import * as THREE from "three";

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// general setup, boring, skip to the next comment

console.clear( );

var scene = new THREE.Scene();
    scene.background = new THREE.Color( 'gainsboro' );

var camera = new THREE.PerspectiveCamera( 30, innerWidth/innerHeight );
    camera.position.set( 0, 100, 100 );

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

const grid = new THREE.GridHelper( 200, 100, 0x000000, 0x000000 );
				grid.material.opacity = 0.2;
				grid.material.transparent = true;
				scene.add( grid );




// next comment


const CAMERA_DISTANCE = 10,
			CAMERA_ALTITUDE = 3,
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

		const loader = new GLTFLoader();
		loader.load( 'models/Soldier.glb', function ( gltf ) {
			// gltf.scene.scale.set(0.01, 0.01, 0.01);
			cat = gltf.scene;
			scene.add( cat );

			const animations = gltf.animations;
			mixer = new THREE.AnimationMixer( model );
			walkAction = mixer.clipAction( animations[ 3 ] );
			walkAction.play();

			activateAllActions();

			animate();


		} );


scene.add(  tail1, tail2, tail3 );




function animationLoop( t )
{
		// process keys
		
		if( keyHash.ArrowUp || keyHash.ArrowLeft || keyHash.ArrowRight || keyHash.ArrowDown )
		{
				catSpeed = 1;
				catDir.subVectors( cat.position, camera.position ).y = 0;
			
				if( keyHash.ArrowDown )	catDir.applyAxisAngle( AXIS_Y, Math.PI );
				else
				if( keyHash.ArrowLeft )	catDir.applyAxisAngle( AXIS_Y, 1.4 );
				else
				if( keyHash.ArrowRight ) catDir.applyAxisAngle( AXIS_Y, -1.4 );
			
				catDir.normalize( );
		}
		else
				catSpeed *= 0.99;

	
		cat.position.addScaledVector( catDir, catSpeed*0.1 );
		cat.rotation.y = lerpAngle( cat.rotation.y, Math.atan2( catDir.x, catDir.z ) + Math.PI, 0.06 );

		tail1.position.lerp( cat.position, 0.05 );	
		tail2.position.lerp( tail1.position, 0.01 );	
		tail3.position.lerp( tail2.position, 0.01 );	
		camera.position.lerp( tail3.position, 0.01 );
	
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

renderer.setAnimationLoop( animationLoop );



