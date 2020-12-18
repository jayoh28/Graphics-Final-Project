//  import * as THREE from 'https://threejs.org/build/three.js';
 import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.114/build/three.module.js";
 import { OrbitControls } from   'https://unpkg.com/three@0.120.0/examples/jsm/controls/OrbitControls.js';
import * as dat from 'https://unpkg.com/three@0.120.0/examples/jsm/libs/dat.gui.module.js';



let sceneArray =[
    {
        Sunny: 0,
        Cloudy: 1,
        Rain: 2,
        Snow: 3,
        Night: 4,
        // Animation: 5
    }
];

let sceneArrayString = [
    'Sunny',
    'Cloudy',
    'Rain',
    'Snow',
    'Night',
    // 'Animation'
];

let gui;
let cameraControls;
let id;
let scene1;
let scene, camera, renderer, ambient, hemiLight, directionalLight, cloudParticles = [], flash, rain, rainGeo, rainCount = 15000;
let rainDrop, rainMaterial, loader, cloudGeo, cloudMaterial, cloud;
let controls2;
let rainParticles =[];
let textMap;
let sun;
let cloud2;
let snow, snowCount = 10000, snowDrop, snowGeo, snowMaterial;
let snowParticles =[];
let moonLight;
const textureSize = 64.0;
let myMusic, snowMusic, morningMusic, nightMusic;
let playAnimationBool =false;
let soundVolume;
let Sound;
let snowSpeed;
let start;
let sunnySet;
let cloudSet;
let rainSet;
let snowSet;
let nightSet;
    ///////////////////////////////////////////////////////////////////////////////////

    //Change Scenes
    function changeScenes( value ) {
        console.log("scene:" + sceneArrayString[value] );
        cancelAnimationFrame( id );
        
        switch ( value ) {
            case "0":
                stopAnimation();
                setSceneSunny();
                stopMusic();
                stopSnowMusic();
                stopNightMusic();
                playMorningMusic();
                break;
            case "1":
                stopAnimation();
                setSceneCloudy();
                stopMusic();
                stopSnowMusic();
                stopNightMusic();
                stopMorningMusic();
                break;
            case '2':
                stopAnimation();
                setSceneRain();
                stopSnowMusic();
                stopNightMusic();
                stopMorningMusic();
                playMusic();

                break;
            case '3':
                stopAnimation();
                setSceneSnow();
                stopMusic();
                stopNightMusic();
                stopMorningMusic();
                playSnowMusic();
                break;
            case '4':
                stopAnimation();
                setSceneNight();
                stopMusic();
                stopSnowMusic();
                stopMorningMusic();
                playNightMusic();
                break;
            case '5':
                stopAnimation();
                stopMusic();
                stopSnowMusic();
                stopMorningMusic();
                stopNightMusic();
                sunnySet = false;
                cloudSet = false;
                rainSet = false;
                snowSet = false;
                nightSet = false;
                playAnimation();
                doAnimate();
                break;

        }
    }

    //attempt on combining the scenes together, but it is too laggy atm.
    function doAnimate() {
        start = Date.now();
        do {
            if ((Date.now() - start) < 20000 && sunnySet == false) {
                setSceneSunny();
                sunnySet = true;
                console.log((Date.now() - start));
            }
            else if (((Date.now() - start) > 20000) && ((Date.now() - start) < 40000) && cloudSet == false) {
                cancelAnimationFrame( id );
                console.log((Date.now() - start));
                setSceneCloudy();
                cloudSet = true;
            }
            else if ((Date.now() - start) > 40000 && (Date.now() - start) < 60000 && rainSet == false) {
                cancelAnimationFrame( id );
                console.log((Date.now() - start));
                setSceneRain();
                rainSet = true;
            }
            else if ((Date.now() - start) > 60000 && (Date.now() - start) < 80000 && snowSet == false) {
                cancelAnimationFrame( id );
                console.log((Date.now() - start));
                setSceneSnow();
                snowSet = true;
            }
            else if ((Date.now() - start) > 80000 && (Date.now() - start) < 100000 && nightSet == false) {
                cancelAnimationFrame( id );
                console.log((Date.now() - start));
                setSceneNight();
                nightSet = true;
            }
        } while (playAnimationBool == true);
    }


    function playAnimation() {
        playAnimationBool =true;
    }

    function stopAnimation() {
        playAnimationBool = false;
    }

    // function createCameraControls() {
    //     camera = new THREE.PerspectiveCamera(60,window.innerWidth / window.innerHeight, 1, 1000);
    //     camera.position.z = 1;
    //     cameraControls = new OrbitControls( camera, renderer.domElement );
    //     // cameraControls.target.set(-5, 20, 10);
    //     // cameraControls.update();
    // }

    //Controls
    function addControls( controlObject ) {
        gui = new dat.GUI();
        gui.add(controlObject, 'scenes', sceneArray[0]).onChange(changeScenes);
        gui.add(controlObject, "Darkness", 0, 6).step(1).listen();
        gui.add(controlObject, "Cloudy", 0, 25).step(1).listen();
        gui.add(controlObject, "Sound", 0.0, 1.0).step(0.1).listen();
        let RainFolder = gui.addFolder("Rain");
        // RainFolder.open();
        RainFolder.add(controlObject, "rainCount", 0, 15000).step(10).listen();
        RainFolder.add(controlObject, "Lightning", 0, 2).step(0.1).listen();
        let SnowFolder = gui.addFolder("Snow");
        // SnowFolder.open();
        SnowFolder.add(controlObject, "snowCount", 0, 10000).step(10).listen();
        SnowFolder.add(controlObject, "snowSpeed", 0.0, 2.0).step(0.1).listen();

        // RainFolder.add(controlObject, "RainDropSize" , 0.1, 10.0).step(0.1);    
    }
    
    class Controller {
        constructor(scene, controller) {
            
            this.controller = controller; 

            this.scenes = 0;
            this.rainCount = 15000;
            this.snowCount = 5000;
            this.Lightning = 1.0;
            this.Darkness = 2.0;
            this.Cloudy = 20;
            this.Sound = 0.5;
            this.snowSpeed =1.0;

            // this.RainDropSize = 10;
            // available data for the instantiations of the function
        }
    }

    //Camera
    function setCamera() {
        camera = new THREE.PerspectiveCamera(60,window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 20;
        camera.rotation.x = 1.16;
        camera.rotation.y = -0.12;
        camera.rotation.z = 0.27;
    }

    //Lights
    function setLights() {
        ambient = new THREE.AmbientLight(0x555555);
        ambient.intensity = 3;
        directionalLight = new THREE.DirectionalLight(0xffeedd);
        directionalLight.position.set(0,0,1);
        moonLight = new THREE.PointLight(0xffffff, 2.0, 600);

    }

    //Lights for Sunny
    function setLightsSunny() {
        ambient = new THREE.AmbientLight(0xC4DEF3);
        ambient.intensity = 3;
        // hemiLight = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 0.6 );
        directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set(0,0,1);
        sun = new THREE.PointLight(0xffffff, 1, 1000);
    }

    //Lightning
    function setFlash() {
        flash = new THREE.PointLight(0x062d89, 30, 500 ,1.7);
        flash.position.set(200,300,100);
    }

    //raindrops
    function createRain() {
        rainGeo = new THREE.Geometry();
        for(let i=0;i<rainCount;i++) {
            rainDrop = new THREE.Vector3(
                Math.random() * 400 -200,
                Math.random() * 500 - 250,
                Math.random() * 400 - 200
            );
            rainDrop.velocity = 0;
            rainGeo.vertices.push(rainDrop);

            rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true
            });
        rain = new THREE.Points(rainGeo,rainMaterial);
        rainParticles.push(rain);
        }
    }

    //snowflake
    const drawRadialGradation = (ctx, canvasRadius, canvasW, canvasH) => {
        ctx.save();
        const gradient = ctx.createRadialGradient(canvasRadius,canvasRadius,0,canvasRadius,canvasRadius,canvasRadius);
        gradient.addColorStop(0, 'rgba(255,255,255,1.0)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,canvasW,canvasH);
        ctx.restore();
    }
//snowflake
    const getTexture = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const diameter = textureSize;
        canvas.width = diameter;
        canvas.height = diameter;
        const canvasRadius = diameter / 2;

        /* gradation circle
        ------------------------ */
        drawRadialGradation(ctx, canvasRadius, canvas.width, canvas.height);

        /* snow crystal
        ------------------------ */
        // drawSnowCrystal(ctx, canvasRadius);

        const texture = new THREE.Texture(canvas);
        //texture.minFilter = THREE.NearestFilter;
        texture.type = THREE.FloatType;
        texture.needsUpdate = true;
        return texture;
    }

    //Snow
    function createSnow() {
        snowGeo = new THREE.Geometry();
        for(let i=0;i<snowCount;i++) {
            snowDrop = new THREE.Vector3(
                Math.random() * 400 -200,
                Math.random() * 500 + 100,
                Math.random() * 400 - 200
            );
            snowDrop.velocity = 0;
            snowGeo.vertices.push(snowDrop);

            snowMaterial = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 1.0+ 1.5 * Math.random(),
                transparent: true,
                vertexColors: false,
                fog: true,
                depthWrite: false,
                map: getTexture()

            });
            snow = new THREE.Points(snowGeo,snowMaterial);
            snowParticles.push(snow);
        }
    }

    //Clouds
    function createClouds() {
        cloudGeo = new THREE.PlaneBufferGeometry(400,400);

        loader = new THREE.TextureLoader();
        textMap = loader.load("smoke.png");
        cloudMaterial = new THREE.MeshLambertMaterial(
            {
                map: textMap,
                transparent: true
            }
        );

        cloud = new THREE.Mesh(cloudGeo,cloudMaterial);
            cloud.position.set(
                Math.random()*800 -400,
                500,
                Math.random()*500 - 450
            );
            cloud.rotation.x = 1.16;
            cloud.rotation.y = -0.12;
            cloud.rotation.z = Math.random()*360;
            cloud.material.opacity = 0.6;
    }

    function createClouds2() {
        let cloudGeo2 = new THREE.PlaneBufferGeometry(400,400);

        loader = new THREE.TextureLoader();
        textMap = loader.load("cloud.png");
        let cloudMaterial2 = new THREE.MeshLambertMaterial(
            {
                map: textMap,
                transparent: true
            }
        );

        cloud2 = new THREE.Mesh(cloudGeo2,cloudMaterial2);
        cloud2.position.set(
            Math.random()*800 -400,
            500,
            Math.random()*500 - 450
        );
        cloud2.rotation.x = 1.16;
        cloud2.rotation.y = -0.12;
        cloud2.rotation.z = Math.random()*360;
        cloud2.material.opacity = 0.6;
    }

    function setSceneSunny() {
        console.log("scene = sunny");
        cloudParticles= [];
        snowParticles= [];
        scene1 = new THREE.Scene();


        setCamera();
        setLightsSunny();
        setFlash();
        createRain();
        createSnow();
        // sky = new Sky();
        // sun = new THREE.Vector3();
        // scene1.add(sky);
        scene1.add(ambient);
        scene1.add(directionalLight);
        scene1.add(sun);
        // scene1.add(hemiLight);

        // scene1.fog = new THREE.FogExp2(0x11111f, 0.002);
        // renderer.setClearColor(scene1.fog.color);

        for(let p=0; p<25; p++) {
            createClouds();
            cloudParticles.push(cloud);
            scene1.add(cloud);
        }
        renderer.setClearColor (0x64ACE3, 1);
        renderer.alpha =true;

        // let sphereMaterial = new THREE.MeshNormalMaterial();
        // let sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
        // let newSphere = new THREE.Mesh( sphereGeometry, sphereMaterial);
        // newSphere.position.set( 2, 10, 10);
        // scene1.add(newSphere);

        scene = scene1;
        controls2[0].rainCount =0;
        controls2[0].Lightning = 0  ;
        controls2[0].Darkness = 6;
        controls2[0].Cloudy = 5;
        controls2[0].snowCount = 0;
        controls2[0].snowSpeed = 0;
        animate();
    }

    function setSceneCloudy() {
        console.log("scene = cloudy");
        cloudParticles= [];
        snowParticles= [];
        scene1 = new THREE.Scene();

        setCamera();
        setLights();
        setFlash();
        createRain();
        createSnow();
        scene1.add(ambient);
        // scene1.add(directionalLight);
        scene1.add(flash);
        scene1.add(rain);

        scene1.fog = new THREE.FogExp2(0x212172, 0.0013);
        renderer.setClearColor(scene1.fog.color);
        renderer.setClearColor (0x064E8E    , 1);

        for(let p=0; p<25; p++) {
            createClouds();
            cloudParticles.push(cloud);
            scene1.add(cloud);
        }

        scene = scene1;
        controls2[0].rainCount =0;
        controls2[0].Lightning = 0;
        controls2[0].Darkness = 5;
        controls2[0].Cloudy = 20;
        controls2[0].snowCount = 0;
        controls2[0].snowSpeed = 0;

        animate();
    }
    function setSceneRain() {
        cloudParticles= [];
        snowParticles= [];
        scene1 = new THREE.Scene();

        setCamera();
        setLights();
        setFlash();
        createRain();
        createSnow();
        scene1.add(ambient);
        scene1.add(directionalLight);
        scene1.add(flash);
        scene1.add(rain);

        scene1.fog = new THREE.FogExp2(0x11111f, 0.002);
        renderer.setClearColor(scene1.fog.color);

        for(let p=0; p<25; p++) {
            createClouds();
            cloudParticles.push(cloud);
            scene1.add(cloud);
        }

        scene = scene1;
        controls2[0].rainCount =15000;
        controls2[0].Lightning = 1.5;
        controls2[0].Darkness = 3;
        controls2[0].Cloudy = 25;
        controls2[0].snowCount = 0;
        controls2[0].snowSpeed = 0;
        animate();
    }

    function setSceneSnow() {
        cloudParticles= [];
        snowParticles= [];
        scene1 = new THREE.Scene();

        setCamera();
        setLights();
        setFlash();
        createSnow();
        createRain();
        scene1.add(ambient);
        scene1.add(directionalLight);
        scene1.add(flash);
        scene1.add(snow);

        scene1.fog = new THREE.FogExp2(0x11111f, 0.002);
        renderer.setClearColor(scene1.fog.color);

        for(let p=0; p<25; p++) {
            createClouds();
            cloudParticles.push(cloud);
            scene1.add(cloud);
        }

        scene = scene1;
        controls2[0].snowCount =4000;
        controls2[0].rainCount =0;
        controls2[0].Lightning = 0;
        controls2[0].Darkness = 6;
        controls2[0].Cloudy = 17;
        controls2[0].snowSpeed = 1.0;
        animate();
}

    function setSceneNight() {
        snowParticles= [];
        cloudParticles= [];
        scene1 = new THREE.Scene();

        setCamera();
        setLights();
        setFlash();
        createSnow();
        createRain();
        scene1.add(ambient);
        directionalLight.intensity = 6;
        scene1.add(directionalLight);
        scene1.add(flash);
        moonLight.position.set(0, 1, 0);
        moonLight.intensity = 10;
        scene1.add(moonLight);

        scene1.fog = new THREE.FogExp2(0x11111f, 0.002);
        renderer.setClearColor(0x041424);

        for(let p=0; p<25; p++) {
            createClouds();
            cloudParticles.push(cloud);
            scene1.add(cloud);
        }

        scene = scene1;
        controls2[0].rainCount =0;
        controls2[0].Lightning = 0;
        controls2[0].Darkness = 6;
        controls2[0].Cloudy = 14;
        controls2[0].snowCount = 0;
        controls2[0].snowSpeed = 0;
        animate();
    }

    function playMusic() {
        myMusic.play();
        myMusic.muted = false;
    }

    function stopMusic() {
        myMusic.pause();
        myMusic.muted = true;
    }

    function playSnowMusic() {
        snowMusic.play();
        snowMusic.muted = false;
    }

    function stopSnowMusic() {
        snowMusic.pause();
        snowMusic.muted = true;
    }
    function playMorningMusic() {
        morningMusic.play();
        morningMusic.muted = false;
    }

    function stopMorningMusic() {
        morningMusic.pause();
        morningMusic.muted = true;
    }
    function playNightMusic() {
        nightMusic.play();
        nightMusic.muted = false;
    }

    function stopNightMusic() {
        nightMusic.pause();
        nightMusic.muted = true;
    }

    function setInterval() {
        document.getElementById('difference').innerHTML = Date.now() - start;
    }

    function init() {
        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor (0x64ACE3, 1);
        document.body.appendChild(renderer.domElement);

        controls2 = [];
        controls2.push(new Controller(scene,0) );
        addControls( controls2[0] );

        setSceneSunny();

        start = Date.now();


        // createCameraControls();

//         // create an AudioListener and add it to the camera
//         const listener = new THREE.AudioListener();
//         camera.add( listener );
//
// // create a global audio source
//         const sound = new THREE.Audio( listener );
//
// // load a sound and set it as the Audio object's buffer
//         const audioLoader = new THREE.AudioLoader();
//         audioLoader.load( 'https://www.soundjay.com/nature/sounds/rain-01.mp3', function( buffer ) {
//             sound.setBuffer( buffer );
//             sound.setLoop( true );
//             sound.setVolume( 0.5 );
//             sound.play();
//         });
        myMusic= document.getElementById("music");
        snowMusic= document.getElementById("snow");
        morningMusic= document.getElementById("morning");
        nightMusic= document.getElementById("night");




    }

    function animate() {

        cloudParticles.forEach(p => {
        p.rotation.z -=0.001;
        });

        //change sound volume
        document.getElementById("music").volume =controls2[0].Sound;
        document.getElementById("snow").volume =controls2[0].Sound;
        document.getElementById("morning").volume =controls2[0].Sound;
        document.getElementById("night").volume =controls2[0].Sound;

        if(controls2[0].scenes == 2 ) {
            rainGeo.vertices.forEach(p => {
                p.velocity -= 0.1 + Math.random() * 0.1;
                p.y += p.velocity;
                if (p.y < -180) {
                    p.y = 300;
                    p.velocity = 0;
                }
            });
        }

        if(controls2[0].scenes == 3) {
            snowGeo.vertices.forEach(p => {
                // p.velocity -= 0.001 + Math.random() * 0.002;
                // p.y += p.velocity;
                p.y += -(0.03 + Math.random()*0.5)*controls2[0].snowSpeed;
                if (p.y < -180) {
                    p.y = 300;
                    p.velocity = 0;
                }
            });
            snowGeo.verticesNeedUpdate = true;
        }

        // console.log(controls2[0].rainCount);
        
        //change rainDrop Count
        for(let i=0; i< 15000-controls2[0].rainCount; i++) {
            rainGeo.vertices[i].x = 1000;
            rainGeo.vertices[i].y = 3000;
            rainGeo.vertices[i].z = 2000;
        // rainParticles[i].rainMaterial.size = controls2[0].RainDropSize;
        }
        for(let i=(15000-controls2[0].rainCount); i<15000; i++) {
            if(rainGeo.vertices[i].y> 2000){
                rainGeo.vertices[i].x = Math.random() * 400 -200;
                rainGeo.vertices[i].y = Math.random() * 3500-250;
                rainGeo.vertices[i].z = Math.random() * 400 - 200;  
                rainGeo.vertices[i].velocity =0;

                // rainParticles[i].rainMaterial.size = controls2[0].RainDropSize;

            }             
        };

        //change snowDrop Count
        if (controls2[0].scenes == 3) {
            for (let i = 0; i < 10000 - controls2[0].snowCount; i++) {
                snowGeo.vertices[i].x = 1000;
                snowGeo.vertices[i].y = 3000;
                snowGeo.vertices[i].z = 2000;
                // rainParticles[i].rainMaterial.size = controls2[0].RainDropSize;
            }
            for (let i = (10000 - controls2[0].snowCount); i < 10000; i++) {
                if (snowGeo.vertices[i].y > 2000) {
                    snowGeo.vertices[i].x = Math.random() * 400 - 200;
                    snowGeo.vertices[i].y = Math.random() * 3500 - 250;
                    snowGeo.vertices[i].z = Math.random() * 400 - 200;
                    snowGeo.vertices[i].velocity = 0;

                    // rainParticles[i].rainMaterial.size = controls2[0].RainDropSize;

                }
            }
            ;
        }

        // console.log(rainParticles[0].rainMaterial.size);
        
        rainGeo.verticesNeedUpdate = true;
        rainMaterial.needsUpdate = true;
        snowGeo.verticesNeedUpdate = true;

        rain.rotation.y +=0.002;

        // Change Number of Clouds
        for(let i=0; i< 25-controls2[0].Cloudy; i++) {
            // cloudParticles[i].x = -10000;
            // cloudParticles[i].y = -10000;
            // cloudParticles[i].z = -10000;
            cloudParticles[i].position.set(-10000, -10000, -10000);
        }
        
        for(let i=(25-controls2[0].Cloudy); i<25; i++) {
            if(cloudParticles[i].position.y< -2000){
                cloudParticles[i].position.set(
                    Math.random()*800 -400,
                    500,
                    Math.random()*500 - 450
                )
            }   
            
        };

        // for (let i=0; i<25; i++) {
        //     console.log(cloudParticles[i].position.y);
        // }


        if(Math.random() > (0.93-controls2[0].Lightning/10) || flash.power > (100*controls2[0].Lightning)) {
            if(flash.power < 100*controls2[0].Lightning) {
                flash.position.set (
                    Math.random()*400,
                    300 + Math.random() *200,
                    100
                );
            }
            flash.power = (50 + Math.random() * 500)*controls2[0].Lightning;
        }
        flash.decay = 2.5-(controls2[0].Lightning)*0.8;
        
        ambient.intensity = controls2[0].Darkness;
        
        id = requestAnimationFrame(animate);
        renderer.render(scene, camera);
    
    }

    init();