AFRAME.registerComponent('tweeter', {
  schema: {
    a: { type: "number", default: 5 },
    b: { type: "number", default: 4 },
    t: { type: "string" },
    // offset: { type: 'number' },
    count: { type: "number", default: 1 },
    speed: { type: "number", default: 1 },
    liked: { type: "boolean", default: false },
    // state: { type: "string" },
    angle: { type: "number", default: 0 },
    height: { type: "number", default: 1.5 },
    initialY: { type: 'number', default: -8.0 },
    hmargin: { type: "number", default: 0.2 },
    vmargin: { type: "number", default: 1 },
    images: { type: "selectorAll", default: [] },
    state: { type: 'string', default: "orbit" },
    previous: { type: "string" },
    next: { type: "string" },
    startTime: { type: "number" },
    loggedIn: { default: false },
  },
  init: function () {
    // console.log('tweet created', this.data);
    const scene = document.querySelector('a-scene');
    const t = this.data.t;
    const a = 5, b = 5;
    // console.log(t);
    // this.el.id = `tweet-${t.id}`;

    this.el.classList.add('tweet');

    let width = 0;
    for (let idx in t.images) {
      // console.log(idx);
      const image = document.createElement('a-image');
      const _width = t.images[idx].width / t.images[idx].height;
      if (_width > width) width = _width;
      image.setAttribute('src', t.images[idx].url);
      image.setAttribute('height', 1);
      image.setAttribute('width', width);

      image.classList.add('hoverable');

      image.object3D.position.set(0, 0, idx / 4);

      this.el.appendChild(image);

      this.data.images.push(image);
    }

    // this.data.liked = this.data.t.like
    const like = document.createElement('a-entity');
    like.classList.add('like', 'hoverable');

    like.setAttribute('obj-model', { obj: '#heart-icon' });
    like.object3D.scale.set(0.05, 0.05, 0.05);
    like.object3D.position.set(width / 2 + 0.04, -0.3, 0.2);
    like.setAttribute('material', 'transparent', true);
    like.setAttribute('material', 'color', '#fff');
    like.setAttribute('material', 'opacity', 0.6);

    const closeButton = document.createElement('a-entity');
    like.classList.add('close-button');

    like.setAttribute('obj-model', { obj: '#heart-icon' });
    like.object3D.scale.set(0.05, 0.05, 0.05);
    like.object3D.position.set(0, -0.3, 0.2);
    like.setAttribute('material', 'transparent', true);
    like.setAttribute('material', 'color', '#fff');
    like.setAttribute('material', 'opacity', 0.6);

    // like.setAttribute('animation__click', { property: 'material.color', from: '#fff', to: '#f00', startEvents: 'click', dir: 'alternate' });
    like.setAttribute('animation__mouseenter', { property: 'rotation', to: '0 720 0', loop: 'true', startEvents: 'mouseenter' });
    like.setAttribute('animation__mouseleave', { property: 'rotation', to: '0 0 0', loop: 0, startEvents: 'mouseleave' });

    // <a-plane material="src:#canvas1; alphaTest: .9; side: double;" height="2" width="20" position="0 1.5 -2.2">
    // </a-plane>
    const captionCanvas = document.createElement('canvas');
    const captionCanvasId = this.data.t.id + '-caption';
    const assets = document.querySelector('a-assets');

    captionCanvas.id = captionCanvasId;
    captionCanvas.setAttribute('width', 2000);
    captionCanvas.setAttribute('height', 1200);
    assets.appendChild(captionCanvas);

    const caption = document.createElement('a-plane');
    caption.setAttribute('width', 2);
    caption.setAttribute('height', 1.2);
    caption.object3D.position.set(0, -1.2, 0);

    this.el.appendChild(caption);

    const ctx = captionCanvas.getContext("2d");

    ctx.beginPath();
    ctx.rect(0, 0, 2000, 1200);
    ctx.fillStyle = "rgba(0,0,0,0.89)"; // "#222";
    ctx.fill();
    // ctx.beginPath();
    // this.ctx.rect(40, 40, 150, 100);
    // this.ctx.fillStyle = "blue";
    // this.ctx.fill();
    // let string = "長濱ねるちゃん\n可愛い～";
    const string = this.data.t.text;

    const fontSize = 48;

    ctx.font = fontSize + "px Segoe UI, Helvetica, serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    let lines = string.split("\n");
    for (let l = 0; l < lines.length; l++) {
      ctx.fillText(lines[l], 1024, (l + 1) * (fontSize + 4));
    }

    this.el.setAttribute('tweeter', {liked: this.data.t.liked});

    // <a-plane material="src:#canvas1; alphaTest: .9; side: double;" height="2" width="20" position="0 1.5 -2.2">
    // </a-plane>

    caption.setAttribute('material', {
      'src': '#' + captionCanvasId,
      alphaTest: .9,
      side: 'double',
    });

    scene.addEventListener('loginstatechanged', (ev) => {
      this.el.setAttribute('tweeter', 'loggedIn', ev.detail.loggedIn);
    })

    this.el.addEventListener('animationcomplete__selecting', (ev) => {
      console.log('selection complete');
      this.el.setAttribute('tweeter', {state: 'selected'});
    });

    this.el.addEventListener('animationcomplete__unselecting', (ev) => {
      console.log('unselection complete');
      this.el.setAttribute('tweeter', 'state', 'orbit');
    });

    this.el.addEventListener('click', (ev) => {
      // console.log(ev);
      if (ev.target.classList.contains('like')) return;
      if (this.data.state === 'orbit') {
        console.log('data state selecting', ev);
        this.el.setAttribute('tweeter', 'state', 'selecting');
        // this.el.setAttribute('tweeter.state', 'selected');
      }

      if (this.data.state === 'selected') {
        console.log('data state unselecting', ev);
        this.el.setAttribute('tweeter', 'state', 'unselecting');
        // this.el.setAttribute('tweeter.state', 'selected');
      }

      this.onStateUpdated();
    });

    like.addEventListener('click', (ev) => {
      // this.el.setAttribute('liked', !this.data.liked);
      console.log('clicked', this.data.t);
      this.el.emit('like', { id: this.data.t.id });
      this.el.setAttribute('tweeter', 'liked', !this.data.liked);
      if (this.data.liked) {
        like.setAttribute('animation', { property: 'material.color', to: '#f00', dur: 100 });
      } else {
        like.setAttribute('animation', { property: 'material.color', to: '#fff', dur: 100 });
      }
      ev.stopPropagation();
    });

    // like.setAttribute('width', .2);
    like.classList.add('hoverable');

    // if (Math.random() < 0.2) {
    //   like.setAttribute('material', 'color', 'red');
    // }

    this.el.appendChild(like);

    const tweetEntities = scene.getElementsByClassName('tweet');

    if (tweetEntities.length) {

      const prevEntity = tweetEntities[tweetEntities.length - 1]; // scene.getElementsByClassName(`tweet-${prevTweetId}`);
      const prevAngle = prevEntity.getAttribute('tweeter').angle;
      const prevWidth = 2; // Number(prevEntity.getElementsByTagName('a-image')[0].getAttribute('width'));
      // console.log('prevWidth', prevWidth);
      // console.log('prevAngle', prevAngle);
      this.el.setAttribute('tweeter', 'angle', ((new Date().getTime() - this.data.startTime) / 1000) * this.data.speed + this.data.count * 36 + 360 * (prevWidth) / (Math.PI * (a + b) / 2));
      // console.log(this.data.angle);
    } else {
      // this.el.object3D.position.set(0, this.data.initialY, 0);
    }


    // entity.setAttribute('tweeter', attrs);
    this.el.setAttribute('look-at', '#lookat-target');

    // console.log(this.el.object3D.position);
  },
  tick: function (time, timeDelta) {
    if (this.data.previous && this.data.previous.length) {
      // console.log('previous', this.data.previous);
      const previous = document.querySelector('#' + this.data.previous);
      const prevAngle = previous.angle;
      let additional = 0;
      for (let img in previous.images) {
        const add = img.width / 30 * 360;
        if (add > additional) additional = add;
      }
      // const prevWidth = this.data.previous.width;
      this.el.setAttribute('tweeter', 'angle', prevAngle + additional);
    } else {
      //this.data.ely += timeDelta / 1000 * this.data.speed;
      // console.log(timeDelta);
      this.el.setAttribute('tweeter', 'angle', this.data.angle + (timeDelta / 1000) * this.data.speed);
      // console.log(this.data.angle);
    }

    if (this.data.state === 'orbit') {
      const elx = Math.cos((Math.PI * this.data.angle / 180)) * this.data.a;
      const ely = Math.sin((Math.PI * this.data.angle / 180)) * this.data.b;
      const elz = this.data.initialY + this.data.angle / 360 * (this.data.height + this.data.vmargin);

      this.el.object3D.position.set(
        elx,
        elz,
        ely
      );
    }

    // this.el.setAttribute('animation__position', {property: 'position', to: `${elx} ${elz} ${ely}`, dur: 10});

    // console.log('angle', this.el.object3D.position);
  },
  update: function (oldData) {
    // console.log('update', oldData);
    // if(this.data.liked !== oldData.liked) {
    // console.log('like status changed');
    // const like = this.el.querySelector('.like');
    // if(this.data.liked) {
    //   like.setAttribute('animation', { property: 'material.color', to: '#f00'});
    // } else {
    //   like.setAttribute('animation', { property: 'material.color', to: '#fff'});
    // }
    // }
    if (oldData.state !== this.data.state) {
      this.onStateUpdated();
    }

    // if(oldData.loggedIn !== this.data.loggedIn) {
    const like = this.el.querySelector('.like');
    // console.log(like);
    if (this.data.loggedIn) {
      // console.log('logged in update received');
      like.setAttribute('material', 'opacity', 0.6);
      like.classList.add('hoverable');
    } else {
      like.setAttribute('material', 'opacity', 0);
      like.classList.remove('hoverable');
    }
    // }
  },
  onStateUpdated: function () {
    if (this.data.state === 'selecting') {
      console.log('selecting', this);
      const dialogPosition = document.querySelector('.dialog-position');
      
      dialogPosition.object3D.updateMatrixWorld(true);
      const target = new THREE.Vector3(0, 0, 3);
      // set from matrix position necessary for immersive mode
      // ref: https://github.com/mrdoob/three.js/issues/18448#issuecomment-577339080
      target.setFromMatrixPosition(dialogPosition.object3D.matrixWorld);
      this.el.setAttribute('animation__selecting', { property: 'position', to: `${target.x} ${target.y} ${target.z}`, dur: 1000, easing: 'easeInElastic' });
    }

    if (this.data.state === 'unselecting') {
      const elx = Math.cos((Math.PI * this.data.angle / 180)) * this.data.a;
      const ely = Math.sin((Math.PI * this.data.angle / 180)) * this.data.b;
      const elz = this.data.initialY + this.data.angle / 360 * (this.data.height + this.data.vmargin);

      this.el.setAttribute('animation__unselecting', { property: 'position', to: `${elx} ${elz} ${ely}`, dur: 200 });
    }
  }
});