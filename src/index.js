import "./styles.scss";

console.log("hello world!");

require("regenerator-runtime/runtime");
require('aframe');
require('aframe-extras/dist/aframe-extras.controls');
require('aframe-extras/dist/aframe-extras.loaders');
require('aframe-state-component');
require('aframe-look-at-component');
require('aframe-super-keyboard');
// require('aframe-stats-in-vr-component')

require('./tweeter');

const io = require('socket.io-client');

AFRAME.registerState({
  initialState: {
    tweets: [],
    loggedIn: false,
  },

  handlers: {
    enemyMoved: function (state, action) {
      state.enemyPosition = action.newPosition;
    },
    addTweets: function (state, action) {
      state.tweets = state.tweets.concat(action.tweets);
    }
  },
});

AFRAME.registerComponent("kitsune", {
  dependencies: ['tweet'],
  init: async function () {
    this.canvas = document.getElementById("canvas1");
    this.ctx = this.canvas.getContext("2d");

    this.ctx.beginPath();
    this.ctx.rect(0, 0, 2048, 512);
    this.ctx.fillStyle = "rgba(0,0,0,0.89)"; // "#222";
    this.ctx.fill();
    // this.ctx.beginPath();
    // this.ctx.rect(40, 40, 150, 100);
    // this.ctx.fillStyle = "blue";
    // this.ctx.fill();
    // let string = "長濱ねるちゃん\n可愛い～";
    let string = '#babymetal_fanart';

    let fontSize = 28;

    this.ctx.font = fontSize + "px Segoe UI, Helvetica, serif";
    this.ctx.fillStyle = "#f00";
    this.ctx.textAlign = "center";
    let lines = string.split("\n");
    for (let l = 0; l < lines.length; l++) {
      this.ctx.fillText(lines[l], 1024, fontSize + 4 + l * (fontSize + 4));
    }

    window.addEventListener("gamepadconnected", function (e) {
      console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
      this.gamepadCheck();
    });
    window.addEventListener("gamepaddisconnected", function (e) {
      console.log("Gamepad disconnected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
    });

    const lookAt = document.querySelector('#lookat-target');
    lookAt.object3D.onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
      // your code here
      // const camera = document.querySelector('[camera]');
      this.position.setFromMatrixPosition(camera.matrixWorld);
    };

    // const assets = document.querySelector('a-assets');
    // const unliked = document.createElement('a-asset-item');
    // unliked.id = 'unliked-icon';
    // unliked.setAttribute('src', unlikedIcon);
    // assets.appendChild(unliked);
  },
  gamepadCheck: function () {
    const camera = document.querySelector('.gaze-cursor');
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < length; i++) {
      if (gamepads[i] !== null) {
        camera.removeAttribute('cursor');
      }
      return;
    }

    camera.setAttribute('cursor', { fuseTimeout: 1000 });
  }
});

AFRAME.registerComponent('login-button', {
  schema: {
    loggedIn: { default: false }, // TODO modularize
    username: { type: 'string' },
  },
  init: function () {
    const scene = document.querySelector('a-scene');
    this.el.addEventListener('click', (ev) => {
      console.log('login clicked');
      if (this.data.loggedIn) {
        logout();
      } else {
        auth();
      }
    });
    // scene.addEventListener('loginstatechanged', ev => {
    //   this.el.setAttribute('login-button', 'loggedIn', ev.detail.loggedIn);
    // });
  },
  update: function (oldData) {
    if (this.data.loggedIn) {
      this.setText(`Username:\n ${this.data.username}\n Logout`, 18);
    } else {
      this.setText('Login');
    }
  },
  setText: function (string, size) {
    this.canvas = document.querySelector('#login-button-canvas');
    // console.log('init login button', this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    this.ctx.rect(0, 0, 200, 100);
    this.ctx.fillStyle = "rgba(0,0,0,0.89)"; // "#222";
    // this.ctx.fill();

    let fontSize = size || 36;

    this.ctx.font = 'bold ' + fontSize + "px Segoe UI, Helvetica, serif";
    this.ctx.fillStyle = "#fff";
    this.ctx.textAlign = "center";
    let lines = string.split("\n");
    for (let l = 0; l < lines.length; l++) {
      this.ctx.fillText(lines[l], 100, fontSize + 4 + l * (fontSize + 4));
    }

  },
});

AFRAME.registerComponent("ellipse-positioning", {
  schema: {
    a: { type: "number" },
    b: { type: "number" },
    angle: { type: "number" },
    height: { type: "number" },
    negX: { type: "boolean", default: false },
    negY: { type: "boolean", default: false },
    speed: { type: "number", default: 3.0 },
    state: { type: "string" }
  },
  init: function () {
    console.log("init positioning", this.data.ely);

    // this.data.elx = ellipseX(this.data.ely, this.data.a, this.data.b, this.data.negX);
    // this.el.object3D.position.set(
    //   this.data.elx,
    //   0,
    //   this.data.ely
    // );

    console.log("init", this);
  },
  tick: function (time, timeDelta) {

    //this.data.ely += timeDelta / 1000 * this.data.speed;
    const elx = Math.cos((Math.PI * this.data.angle / 180) + Math.PI / 180 * (time / 1000) * this.data.speed) * this.data.a; //ellipseX(this.data.ely, this.data.a, this.data.b, this.data.negX);
    const ely = Math.sin((Math.PI * this.data.angle / 180) + Math.PI / 180 * (time / 1000) * this.data.speed) * this.data.b;

    this.el.object3D.position.set(
      elx,
      this.data.height,
      ely
    );
    // console.log('angle', this.data.angle);
  },
  update: function (prev) {

  }
});

// Component to change to a sequential color on click.
AFRAME.registerComponent("cursor-listener", {
  init: function () {
    var lastIndex = -1;
    // var COLORS = ['red', 'green', 'blue'];
    this.el.addEventListener("mouseenter", function (evt) {
      // lastIndex = (lastIndex + 1) % COLORS.length;
      this.setAttribute("material", "opacity", "0.5");
      // console.log('I was clicked at: ', evt.detail.intersection.point);
    });

    this.el.addEventListener("mouseleave", function (evt) {
      // lastIndex = (lastIndex + 1) % COLORS.length;
      this.setAttribute("material", "opacity", "1.0");
      // console.log('I was clicked at: ', evt.detail.intersection.point);
    });
  }
});

// const ela = 10;
// const elb = 2;

// function ellipseX(elY, ela, elb, neg) {
//   // this function is in 2 dimensions
//   return (
//     Math.sqrt(
//       Math.pow(ela, 2) * (1 - Math.pow(elY, 2) / Math.pow(elb, 2))
//     ) * (neg ? -1 : 1)
//   );
// }



const socket = io('https://petewarrior.com', { 'path': '/bmfsvr/socket.io' });

var count = 0;
var startTime = new Date().getTime();
var lastEntity = null;
const tweets = [];

let loggedIn = false;

// const socket = this.socket;

socket.on('connect', () => {
  console.log('connected');

  const oauth_token = window.localStorage.getItem('oauth_token');
  const oauth_token_secret = window.localStorage.getItem('oauth_token_secret');
  const username = window.localStorage.getItem('screen_name');
  const scene = document.querySelector('a-scene');

  const loginButton = document.querySelector('#login-button');

  if (oauth_token && oauth_token_secret) {
    socket.emit('login', { 'oauth_token': oauth_token, 'oauth_token_secret': oauth_token_secret }, (ev) => {
      console.log('login', ev);
      if (ev.success) {
        loggedIn = true;
        scene.emit('loginstatechanged', { loggedIn: true });
        loginButton.setAttribute('login-button', { loggedIn: true, username: username });
        // const tweets = document.querySelectorAll('.tweet');
        // console.log(tweets);
        // for(let t of tweets) {
        //   t.setAttribute('tweeter.loggedIn', true);
        //   console.log(t);
        // }

      }
    });
  } else {
    socket.emit('anonymous', (ev) => {
      console.log(ev);
    });
  }
  // window.localStorage.setItem('screen_name', data.screen_name);
  // window.localStorage.setItem('user_id', data.user_id);
});

socket.on('allTweet', (tweet) => {
  // console.log(tweet);

  tweet = tweet.filter((t) => {
    return t.images && t.images.length;
  })

  console.log('init', tweet);
  // AFRAME.scenes[0].emit('addTweets', { tweets: tweet });

  const scene = document.querySelector('a-scene');
  tweet.forEach((t, idx, tweet) => {
    count++;
    const entity = document.createElement('a-entity');
    entity.id = `tweet-${t.id}`;
    entity.setAttribute('tweeter', { t: t, count: count, startTime: startTime, loggedIn: loggedIn });

    // TODO change this since init() is asynchronous
    // if (lastEntity) {
    //   console.log('lastid', lastEntity.id);
    //   console.log('id', entity.id);
    //   entity.setAttribute('tweeter', {'previous': lastEntity.id});
    //   lastEntity.setAttribute('tweeter', {'next': entity.id});
    // }

    entity.addEventListener('like', function (ev) {
      console.log(ev);

      if (loggedIn) {
        socket.emit('like', ev.detail.id, (evt) => {
          console.log(evt);
        });
      }
    });

    lastEntity = entity;

    scene.appendChild(entity);
  });
});


// auth
function auth() {
  socket.emit('auth', (res) => {
    if (res.success) {
      const token = res.requestToken;
      const loginWindow = window.open(`https://api.twitter.com/oauth/authorize?oauth_token=${token}`, '_blank');
      console.log('login window', loginWindow);

      window.addEventListener('message', (ev) => {
        // window.localStorage.setItem('')
        console.log(ev);
        if (ev.origin === 'https://petewarrior.com') {
          const data = ev.data;
          console.log(data);
          window.localStorage.setItem('oauth_token', data.oauth_token);
          window.localStorage.setItem('oauth_token_secret', data.oauth_token_secret);
          window.localStorage.setItem('screen_name', data.screen_name);
          window.localStorage.setItem('user_id', data.user_id);
          loggedIn = true;
          window.location.reload();
        }
      });
    } else {
      console.log('auth request failed');
    }
  });
}

function logout() {
  socket.emit('logout', (res) => {
    console.log('logout', res);
    window.localStorage.removeItem('oauth_token');
    window.localStorage.removeItem('oauth_token_secret');
    window.localStorage.removeItem('screen_name');
    window.localStorage.removeItem('user_id');
    loggedIn = false;
  });
}