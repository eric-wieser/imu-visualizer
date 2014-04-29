var serialport = require("serialport");

// 3D code partially grabbed from http://dev.opera.com/articles/view/porting-3d-graphics-to-the-web-webgl-intro-part-2/

var angularVelocityToQuat = function(av, dt) {
  var l = av.length() * dt;
  var gyroQuat = new THREE.Quaternion();
  gyroQuat.setFromAxisAngle(new THREE.Vector3().copy(av).normalize(), l);
  return gyroQuat;
};
var angularVelocityTodQuat = function(av) {
  var l = av.length() * dt;
  var gyroQuat = new THREE.Quaternion();
  gyroQuat.setFromAxisAngle(new THREE.Vector3().copy(av).normalize(), l);
  return gyroQuat;
};

document.addEventListener('DOMContentLoaded', function() {
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight;
    var FLOOR = 0;

    var container;

    var camera, scene;
    var webglRenderer;

    var zmesh, geometry;

    var mouseX = 0, mouseY = 0;
    var mousemoveX = 0, mousemoveY = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    init();
    animate();

    function init() {

      var closeEl=document.querySelector(".close");
      if (closeEl) {
        closeEl.addEventListener('click', function() {
          window.close();
        });
      };

      container = document.createElement( 'div' );
      document.body.appendChild( container );

      // camera
      camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 100000 );
      camera.position.x = 50;
      camera.position.y = 50;
      camera.position.z = 50;
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      //scene
      scene = new THREE.Scene();
      scene.matrix = new THREE.Matrix4(
        0, 1, 0, 0,
        0, 0, 1, 0,
        1, 0, 0, 0,
        0, 0, 0, 1
      );

      // lights
      var ambient = new THREE.AmbientLight( 0xffffff );
      scene.add( ambient );

      // more lights
      var directionalLight = new THREE.DirectionalLight( 0xffeedd );
      directionalLight.position.set( 0, -70, 100 ).normalize();
      scene.add( directionalLight );

      // renderer
      webglRenderer = new THREE.WebGLRenderer();
      webglRenderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
      webglRenderer.domElement.style.position = "relative";
      container.appendChild( webglRenderer.domElement );

      var all = new THREE.Object3D();

      // direction (normalized), origin, length, color(hex)
      var origin = new THREE.Vector3(0, 0, 0);
      var gyroArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1,  0xffff00, 5, 5);
      var accArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1,  0xff00ff, 5, 5);
      all.add(gyroArrow);
      all.add(accArrow);

      // var cube = new THREE.Mesh( new THREE.CubeGeometry( 30, 10, 40 ), new THREE.MeshNormalMaterial() );
      // zmesh = cube;
      // scene.add( zmesh );

      // The X axis is red. The Y axis is green. The Z axis is blue.
      var axisHelper = new THREE.AxisHelper( 50 );
      all.add( axisHelper );

      var conn = new serialport.SerialPort("COM5", {
        baudrate: 115200,
        parser: serialport.parsers.readline("\n")
      });

      scene.add(all);

      conn.on('error', console.error.bind(console));
      conn.on("open", function () {
        console.log('open');
        conn.on('data', function(data) {
          try {
            data = JSON.parse(data);
          } catch(e) {
            console.error(e);
            return;
          }
          var gyro = new THREE.Vector3(data.a[0], data.a[1], data.a[2]);
          var gyroQuat = angularVelocityToQuat(gyro, 0.05);

          all.quaternion.multiply(gyroQuat);

          var acc = new THREE.Vector3(data.b[0], data.b[1], data.b[2]);
          console.log(scene.quaternion);

          accArrow.setLength(acc.length()*5);
          accArrow.setDirection(acc.normalize());

          gyroArrow.setLength(gyro.length()*50);
          gyroArrow.setDirection(gyro.normalize());
        });
      });
    }

    function animate() {
      requestAnimationFrame( animate );
      render();
    }

    function render() {
      webglRenderer.render( scene, camera );
    }

});

