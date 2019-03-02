import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import API, { getLanterns, promiseHandler } from '../../utils/API';
import io from 'socket.io-client';
import * as THREE from 'three';
import { SpriteText2D, textAlign } from 'three-text2d';
import * as TWEEN from '@tweenjs/tween.js';
import random from 'canvas-sketch-util/random';
// import { lerp, pingPong, inverseLerp } from 'canvas-sketch-util/math';
import * as OBJLoader from 'three-obj-loader';
OBJLoader(THREE);

// const OrbitControls = require('three-orbit-controls')(THREE);

const socket = io(process.env.SOCKETURL);

const styles = {
  position: 'absolute',
  zIndex: 9999,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%'
};

class MainView extends Component {
  state = {
    isMobile: false,
    lanterns: [],
    meshes: []
  };

  componentDidMount() {
    this.mobileCheck();
    this.initSocket();
    this.initThreeScene();
  }

  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }

  mobileCheck = () => {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      this.setState({
        isMobile: true
      });
    }
  };

  initSocket = () => {
    socket.on('connect', () => {
      socket.on('new lantern', data => {
        console.log(data);
        this.createLantern(data);
        const lanterns = [...this.state.lanterns, data];
        this.setState({ lanterns });
      });
    });
  };

  initThreeScene = () => {
    this.meshes = [];
    this.time = 0;
    this.mesh = '';
    this.center = new THREE.Vector3(0, 0, 0);
    this.THREE = THREE;
    this.cameraFocused = false;
    this.selectedCube = '';
    this.font = '';
    this.relativeCameraOffset = new THREE.Vector3(0, 0.5, 1);

    const width = window.innerWidth;
    const height = window.innerHeight;
    //ADD SCENE
    this.scene = new this.THREE.Scene();

    this.camera = new this.THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0.5, 9);
    this.camera.lookAt(this.scene.position);

    //ADD RENDERER
    this.renderer = new this.THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    this.textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.material = new THREE.MeshStandardMaterial({
      opacity: 1,
      roughness: 0.5,
      transparent: false,
      metalness: 0,
      emissive: '#C9AF5B',
      emissiveIntensity: 0.2
    });

    const fontLoader = new THREE.FontLoader();
    fontLoader.load('/assets/fonts/Quicksand_Medium_Regular.json', font => {
      console.log(font);
      this.font = font;
    });

    this.model = new this.THREE.OBJLoader().load('/assets/models/lantern.obj', object => {
      // For any meshes in the model, add our material.
      object.traverse(node => {
        if (node.isMesh) node.material = this.material;
      });

      this.mesh = object;
      this.mesh.scale.set(0.02, 0.02, 0.02);
      // this.createLantern({ name: 'one' });
      // this.createLantern({ name: 'two' });
      // this.createLantern({ name: 'three' });
      setInterval(this.pickLantern, 60000);
    });

    // for perspective
    this.scene.add(new THREE.GridHelper(15, 20));

    const light = new THREE.DirectionalLight('red', 1);
    light.position.set(2, 0, 2);
    this.scene.add(light);

    const ambientlight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientlight);

    const spotLight = new THREE.SpotLight();
    spotLight.position.set(0, 80, 30);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    // remove this
    // const axesHelper = new THREE.AxesHelper(5);
    // this.scene.add(axesHelper);

    this.start();
    this.loadLanterns();
  };

  toRadians = angle => angle * (Math.PI / 180);
  toDegrees = angle => angle * (180 / Math.PI);

  // create new lantern
  createLantern = lanternInfo => {
    console.log(lanternInfo);
    const parent = new THREE.Group();
    parent.name = lanternInfo.displayName;
    this.scene.add(parent);
    const lantern = this.mesh.clone();
    parent.position.set(random.range(-5, 5), -8, random.range(0, 4));
    lantern.castShadow = true;
    lantern.receiveShadow = true;

    // parent.userData = {
    //   user: 'Strato Doumanis',
    //   message:
    //     'Carles beard Echo Park tote bag bitters twee tousled single-origin coffee pickled letterpress chillwave PBR&B Tumblr swag ennui'
    // };

    parent.originalPosition = parent.position.clone();

    const textGeometry = new THREE.TextGeometry(lanternInfo.message, {
      font: this.font,
      size: 9,
      height: 1
    });
    const textMesh = new THREE.Mesh(textGeometry, this.textMaterial);
    textMesh.scale.set(0.007, 0.007, 0.007);
    textMesh.translateX(0.25);
    textMesh.translateY(0.1);
    textMesh.material.opacity = 0;
    textMesh.material.alphaTest = 0.1;

    parent.add(textMesh);

    const position = parent.position;
    this.target = { x: parent.position.x, y: 30, z: parent.position.z };
    const tween = new TWEEN.Tween(position).to(this.target, random.range(80000, 120000));

    const zRotation = this.toRadians(random.range(0, 13));
    const tweenTimer = random.rangeFloor(4000, 10000);
    const tween2 = new TWEEN.Tween(lantern.rotation).to({ z: -0.02 }, tweenTimer).easing(TWEEN.Easing.Quintic.InOut);

    const tween3 = new TWEEN.Tween(lantern.rotation).to({ z: 0.02 }, tweenTimer).easing(TWEEN.Easing.Quintic.InOut);

    tween2.chain(tween3);
    tween3.chain(tween2);

    tween.onUpdate(function() {
      // lantern.rotation.x += 0.0008;
      lantern.rotation.y += 0.009;
    });

    tween.repeat(Infinity);

    parent.add(lantern);
    tween.start();
    tween2.start();

    this.meshes.push(lanternInfo.displayName);
  };

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

  stop = () => {
    cancelAnimationFrame(this.frameId);
  };

  animate = () => {
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
    TWEEN.update();
    if (this.selectedLantern) {
      if (this.cameraFocused) {
        this.camera.lookAt(this.selectedLantern.position);
        // this.camera.rotation.x += 0.02;
        // this.camera.position.x += .02;
        this.camera.position.y = this.selectedLantern.position.y;
      }
      if (this.selectedLantern.position.y >= this.camera.position.y) {
        /*  const cameraOffset = this.relativeCameraOffset.applyMatrix4(this.selectedLantern.matrixWorld);
        this.camera.position.y = cameraOffset.y; */
        // this.camera.lookAt(this.selectedLantern.position);
        // this.camera.rotation.x += 0.02;
      }
    }
  };

  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
  };

  pickLantern = () => {
    console.log(this.selectedLantern);

    if (this.selectedLantern) {
      console.log('lantern active already');
      return setTimeout(this.pickLantern, 15000);
    }

    let lanternName = this.meshes[Math.floor(Math.random() * this.meshes.length)];
    this.selectedLantern = this.scene.getObjectByName(lanternName);
    console.log(this.selectedLantern.position);
    if (!this.selectedLantern || this.selectedLantern.position.y >= 10) {
      this.selectedLantern = '';
      return setTimeout(this.pickLantern, 5000);
    }
    this.displayLantern();
  };

  displayLantern = () => {
    console.log(this.selectedLantern);

    const easing = TWEEN.Easing.Linear.None;

    const setRotation = new TWEEN.Tween(this.camera.rotation).to({ x: 0, y: 0, z: 0 }, 6000).easing(easing);
    const setPosition = new TWEEN.Tween(this.camera.position).to({ x: 0, y: 0.5, z: 9 }, 6000).easing(easing);

    this.selectedLantern.children[0].material.opacity = 1;
    // new TWEEN.Tween(this.selectedLantern.children[0].material.opacity).to(1, 1500).start();

    new TWEEN.Tween(this.camera.position)
      .to(
        {
          z: this.selectedLantern.position.z + 2.5,
          x: this.selectedLantern.position.x,
          y: this.selectedLantern.position.y + 10
        },
        8000
      )
      .easing(easing)
      .onUpdate(() => {
        // this.camera.lookAt(this.selectedLantern.position);
      })
      .onComplete(() => {
        this.cameraFocused = true;
        // new TWEEN.Tween(this.camera.rotation.x).to(this.camera.rotation.x + 3, 1000).start();
        setTimeout(() => {
          console.log(this);
          setPosition.start();
          setRotation.start();
          this.selectedLantern = '';
          console.log(this.selectedLantern);
          // setTimeout(this.pickLantern, 36000);
        }, 15000);
      })
      .start();
  };

  loadLanterns = () => {
    console.log('hi');
    API.getLanterns()
      .then(res => {
        console.log(res.data);
        let i = 0;
        let intervalId = setInterval(() => {
          if (res.data.length === i) {
            return clearInterval(intervalId);
          }
          this.createLantern(res.data[i]);
          i++;
        });
      })
      .catch(err => console.log(err));
  };

  render() {
    if (this.state.isMobile) {
      return <Redirect to="/send" />;
    }

    return (
      <Fragment>
        <div
          style={{ minWidth: '100vh', minHeight: '100vh', ...styles }}
          ref={mount => {
            this.mount = mount;
          }}
        />
        <h2 className="header-CTA">
          Submit a message of hope, inspiration, or observation to light your lantern <br />
          <small>Go to lanterns.tv</small>{' '}
        </h2>
      </Fragment>
    );
  }
}

export default MainView;
