function flipCoin(){

    let pos = {x: 0, y: 2, z: 0};
	let angVel = {x: getRandomVel(), y: getRandomVel(), z: getRandomVel()};
	let linVel = {x: 0, y: 20, z: 0 };
    let quat = {x: getRandomOrnt(), y: getRandomOrnt(), z: getRandomOrnt(), w: 1};
	let mass = 1;

	let coin = rigidBodies[0].userData.physicsBody;

	// restart motion state
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );

    let motionState = new Ammo.btDefaultMotionState( transform );

	coin.setMotionState( motionState );
	coin.setAngularVelocity( new Ammo.btVector3( angVel.x, angVel.y, angVel.z ) );
	coin.setLinearVelocity( new Ammo.btVector3( linVel.x, linVel.y, linVel.z ) );

}

let physicsWorld, scene, camera, renderer, rigidBodies = [], tmpTrans = null

// Initialize Ammo Physics
Ammo().then(start)

function start (){

    tmpTrans = new Ammo.btTransform();

    setupPhysicsWorld();
    setupGraphics();

    createPlane();
    createCoin();


    renderFrame();

}


function setupPhysicsWorld(){

    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -20, 0));

}


function setupGraphics(){
	canvas = document.querySelector('#c');

    //create clock for timing
    clock = new THREE.Clock();

	// Setup Scene
	let bgColor = 0xFCFCFC;
    scene = new THREE.Scene();
    scene.background = new THREE.Color( bgColor );
	scene.fog = new THREE.Fog( bgColor, 50, 60);

	// Setup Camera
	let fov = 20;
	let near = 0.1;
	let far = 100;
    camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, near, far );
    camera.position.set( 0, 20, 40 );
    camera.lookAt(new THREE.Vector3(0, 0, 0));

	// Setup Orbital Controls
	controls = new THREE.OrbitControls(camera, canvas);
	controls.target.set(0,5,0);
	controls.maxPolarAngle = Math.PI/2;
	controls.update();

    // Setup HemisphereLight
	let skyColor = 0xFFFFFF;
	let groundColor = 0xB97A20;
	let intensity = 1;
    let hemiLight = new THREE.HemisphereLight( skyColor, groundColor, intensity );
    scene.add( hemiLight );

    // Setup DirectionalLight
    let dirLight = new THREE.DirectionalLight( 0xffffff , 1);
    dirLight.position.set( 50, 30, 2 );
    scene.add( dirLight );
	scene.add( dirLight.target );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    let d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 13500;

    // Enable antialiasing
    renderer = new THREE.WebGLRenderer( { canvas, antialias: true } );
    // Setting Pixel Ratio
    renderer.setClearColor( 0x90D7EC, 1 );
    renderer.setPixelRatio( window.devicePixelRatio );
    // Setting window's size
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;

}

// Create a Plane geometry in the middle
function createPlane(){
        
	let loader = new THREE.TextureLoader();
    let pos = {x: 0, y: 0, z: 0};
	let planeSize = 100;
    let scale = {x: 50, y: 2, z: 50};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

	// Setup Plane's Texture
	let texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.magFilter = THREE.NearestFilter;
	let repeats = planeSize / 2;
	texture.repeat.set(repeats, repeats);

    // setting up plane's object with texture
	let planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
	let planeMat = new THREE.MeshPhongMaterial({
		map: texture,
		side: THREE.DoubleSide,
	})
	let plane = new THREE.Mesh(planeGeo, planeMat);
	plane.rotation.x = Math.PI * -.5;

	plane.receiveShadow = true;

	scene.add(plane)

	// Setting plane's physics
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );

    let motionState = new Ammo.btDefaultMotionState( transform );

    // Setup collision box
	let colShape = new Ammo.btBoxShape( new Ammo.btVector3( planeSize * .5, 0, planeSize * .5  )  );
    colShape.setMargin( 0.5 );

    // Setup plane's physical properties
    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    // Setup plane as a new rigid body.
    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    physicsWorld.addRigidBody( body );
}

function getRandomVel(){
	return 10+Math.random() * 2;
}

function getRandomOrnt(){
	return Math.random() * 90;
}

function createCoin(){
        
    let pos = {x: 0, y: 3, z: 0};
	let angVel = {x: getRandomVel(), y: getRandomVel(), z: getRandomVel()};
	let linVel = {x: 0, y: 20, z: 0 };
    let quat = {x: getRandomOrnt(), y: getRandomOrnt(), z: getRandomOrnt(), w: 1};
	let radius = 2;
	// orginal size of the coin: 2.7586400508880615 x 2.7586400508880615 x 0.4469519853591919
	// new size of the coin: 2 x 2 x 0.5
	let resize = {x: 0.02544085799, y: 0.02544085799, z: 0.06066047147};
    let mass = 1;
	let textureLoader = new THREE.TextureLoader();

	// setting up physical properties
    let transform = new Ammo.btTransform();

    transform.setIdentity();

    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );

    let motionState = new Ammo.btDefaultMotionState( transform );

	let colShape = new Ammo.btBoxShape( new Ammo.btVector3( 1, 1, .125 )  );
    colShape.setMargin( 0.5 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

	body.setDamping( 0.8, 0 );

	body.setAngularVelocity( new Ammo.btVector3( angVel.x, angVel.y, angVel.z ) );


    physicsWorld.addRigidBody( body );

    // Import 3D model of the coin
	let mtlLoader = new THREE.MTLLoader();
	mtlLoader.load('./coin/Coin.mtl', (mtl) => {

		// setup materials 
		mtl.preload();
		let color = {r:0.902, g:0.643, b:0.161}
		mtl.materials.wire_204204204.color = color;
		mtl.materials.wire_204204204.shininess = 100;

		// setup 3D mesh
		let objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(mtl);
		objLoader.load('./coin/Coin.obj', (coin) => {
			coin.scale.set(resize.x, resize.y, resize.z);
			coin.position.set(pos.x, pos.y, pos.z);

			let bbox = new THREE.Box3().setFromObject(coin);
			console.log(bbox.getSize());
			
			coin.castShadow = true;

			scene.add(coin);
			rigidBodies.push(coin);

			// hide loading image
			loading = document.querySelector('.loading-container');
			loading.classList.add("makeInvisible");

			// show button after the coin is loaded
			coinBtn = document.querySelector('#coinBtn');
			coinBtn.classList.add("makeVisible");

			// Apply rigidBodies physical properties
			coin.userData.physicsBody = body;
			body.setAngularVelocity( new Ammo.btVector3( angVel.x, angVel.y, angVel.z ) );
			body.setLinearVelocity( new Ammo.btVector3( linVel.x, linVel.y, linVel.z ) );
		})
	})
        
}

function renderFrame(){

    let deltaTime = clock.getDelta();

    updatePhysics( deltaTime );

    renderer.render( scene, camera );

    requestAnimationFrame( renderFrame );

}

function updatePhysics( deltaTime ){

    physicsWorld.stepSimulation( deltaTime, 10 );

    for ( let i = 0; i < rigidBodies.length; i++ ) {
        let objThree = rigidBodies[ i ];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState();
        if ( ms ) {

            ms.getWorldTransform( tmpTrans );
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

        }
    }

}

  window.addEventListener('resize', onWindowResize, false);
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }
