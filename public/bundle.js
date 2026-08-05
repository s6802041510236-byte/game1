// src/game/Game.js
import * as THREE5 from "three";

// src/game/Environment.js
import * as THREE from "three";
var Environment = class {
  constructor(scene) {
    this.scene = scene;
    this.worldSize = 200;
    this.initSkyAndFog();
    this.initLighting();
    this.createGround();
    this.generateScenery();
  }
  initSkyAndFog() {
    this.skyColors = [
      new THREE.Color(8900331),
      // Day (Level 1)
      new THREE.Color(16747586),
      // Sunset (Level 2)
      new THREE.Color(1644912)
      // Night (Level 3)
    ];
    this.fogColors = [
      new THREE.Color(8900331),
      new THREE.Color(14445377),
      new THREE.Color(1644912)
    ];
    this.scene.background = this.skyColors[0];
    this.scene.fog = new THREE.Fog(this.fogColors[0], 20, 100);
    this.currentLevel = 1;
  }
  setLevel(level) {
    if (level < 1) level = 1;
    if (level > 3) level = 3;
    if (this.currentLevel !== level) {
      this.currentLevel = level;
      this.scene.background = this.skyColors[level - 1];
      this.scene.fog.color = this.fogColors[level - 1];
    }
  }
  initLighting() {
    const ambientLight = new THREE.AmbientLight(16777215, 0.4);
    this.scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(16768426, 1.2);
    sunLight.position.set(100, 50, -50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 250;
    const d = 100;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.scene.add(sunLight);
  }
  createGround() {
    const textureLoader = new THREE.TextureLoader();
    const grassTex = textureLoader.load("./public/textures/grass.jpg");
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(50, 50);
    const groundGeo = new THREE.PlaneGeometry(this.worldSize, this.worldSize);
    const groundMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }
  generateScenery() {
    this.colliders = [];
    const treeCount = 60;
    const buildingCount = 20;
    const rockCount = 30;
    for (let i = 0; i < treeCount; i++) {
      this.createRandomTree();
    }
    for (let i = 0; i < buildingCount; i++) {
      this.createRandomBuilding();
    }
    for (let i = 0; i < rockCount; i++) {
      this.createRandomRock();
    }
  }
  createRandomTree() {
    const x = (Math.random() - 0.5) * (this.worldSize - 20);
    const z = (Math.random() - 0.5) * (this.worldSize - 20);
    if (Math.abs(x) < 10 && Math.abs(z) < 10) return;
    const textureLoader = new THREE.TextureLoader();
    const barkTex = textureLoader.load("./public/textures/bark.jpg");
    barkTex.wrapS = THREE.RepeatWrapping;
    barkTex.wrapT = THREE.RepeatWrapping;
    barkTex.repeat.set(1, 2);
    const treeGroup = new THREE.Group();
    const trunkHeight = 2 + Math.random() * 2;
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.7, trunkHeight, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ map: barkTex });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    treeGroup.add(trunk);
    const leavesSize = 2 + Math.random() * 2;
    const leavesGeo = new THREE.BoxGeometry(leavesSize, leavesSize, leavesSize);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 3046706 });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = trunkHeight + leavesSize / 2 - 0.5;
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    treeGroup.add(leaves);
    treeGroup.position.set(x, 0, z);
    this.scene.add(treeGroup);
    treeGroup.updateMatrixWorld(true);
    const collider = new THREE.Box3().setFromObject(trunk);
    this.colliders.push(collider);
  }
  createRandomRock() {
    const x = (Math.random() - 0.5) * (this.worldSize - 20);
    const z = (Math.random() - 0.5) * (this.worldSize - 20);
    if (Math.abs(x) < 10 && Math.abs(z) < 10) return;
    const textureLoader = new THREE.TextureLoader();
    const rockTex = textureLoader.load("./public/textures/rock.jpg");
    rockTex.wrapS = THREE.RepeatWrapping;
    rockTex.wrapT = THREE.RepeatWrapping;
    rockTex.repeat.set(2, 2);
    const radius = 1 + Math.random() * 2;
    const rockGeo = new THREE.DodecahedronGeometry(radius, 1);
    const rockMat = new THREE.MeshStandardMaterial({ map: rockTex, roughness: 0.9 });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(x, radius * 0.5, z);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rock.castShadow = true;
    rock.receiveShadow = true;
    this.scene.add(rock);
    rock.updateMatrixWorld(true);
    const collider = new THREE.Box3().setFromObject(rock);
    this.colliders.push(collider);
  }
  createRandomBuilding() {
    const x = (Math.random() - 0.5) * (this.worldSize - 40);
    const z = (Math.random() - 0.5) * (this.worldSize - 40);
    if (Math.abs(x) < 15 && Math.abs(z) < 15) return;
    const width = 4 + Math.random() * 6;
    const depth = 4 + Math.random() * 6;
    const height = 10 + Math.random() * 20;
    const buildingGeo = new THREE.BoxGeometry(width, height, depth);
    const colors = [10395294, 6323595, 11583173, 7901340];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const buildingMat = new THREE.MeshStandardMaterial({ color });
    const building = new THREE.Mesh(buildingGeo, buildingMat);
    building.position.set(x, height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;
    this.scene.add(building);
    building.updateMatrixWorld(true);
    const collider = new THREE.Box3().setFromObject(building);
    this.colliders.push(collider);
  }
  spawnPortal(position, level) {
    this.removePortal();
    const portalColor = level === 1 ? 65535 : 16755200;
    const portalGeo = new THREE.TorusGeometry(2, 0.4, 16, 100);
    const portalMat = new THREE.MeshBasicMaterial({
      color: portalColor,
      transparent: true,
      opacity: 0.8
    });
    this.portal = new THREE.Mesh(portalGeo, portalMat);
    this.portal.position.copy(position);
    this.portal.position.y = 2;
    this.scene.add(this.portal);
    this.portalLight = new THREE.PointLight(portalColor, 2, 10);
    this.portal.add(this.portalLight);
    return this.portal;
  }
  removePortal() {
    if (this.portal) {
      this.scene.remove(this.portal);
      this.portal.geometry.dispose();
      this.portal.material.dispose();
      this.portal = null;
    }
  }
  update(delta) {
    if (this.portal) {
      this.portal.rotation.y += delta;
      this.portal.rotation.z += delta * 0.5;
      const scale = 1 + Math.sin(Date.now() * 3e-3) * 0.1;
      this.portal.scale.set(scale, scale, scale);
    }
  }
};

// src/game/Player.js
import * as THREE2 from "three";
var Player = class {
  constructor(scene, camera, environment) {
    this.scene = scene;
    this.camera = camera;
    this.environment = environment;
    this.position = new THREE2.Vector3(0, 0, 0);
    this.velocity = new THREE2.Vector3(0, 0, 0);
    this.direction = new THREE2.Vector3(0, 0, -1);
    this.speed = 10;
    this.rotationSpeed = 3;
    this.keys = { forward: false, backward: false, left: false, right: false };
    this.isPointerLocked = false;
    this.yaw = 0;
    this.pitch = 0;
    this.walkTime = 0;
    this.isAttacking = false;
    this.isSkillJ = false;
    this.isUltimate = false;
    this.ultimateTimer = 0;
    this.attackTimer = 0;
    this.attackDuration = 0.3;
    this.attackBox = new THREE2.Box3();
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.invincibleDuration = 2;
    this.cdJ = 0;
    this.cdK = 0;
    this.cdShift = 0;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 0.2;
    this.particles = [];
    this.createMesh();
    this.initNameTag("Player 1");
    this.setupInputs();
  }
  createMesh() {
    this.mesh = new THREE2.Group();
    this.mesh.position.copy(this.position);
    this.modelGroup = new THREE2.Group();
    this.mesh.add(this.modelGroup);
    const furMat = new THREE2.MeshStandardMaterial({ color: 13808780 });
    const cloakMat = new THREE2.MeshStandardMaterial({ color: 4873507 });
    const darkMat = new THREE2.MeshStandardMaterial({ color: 4073251 });
    const bodyGeo = new THREE2.BoxGeometry(1, 1.2, 0.8);
    const body = new THREE2.Mesh(bodyGeo, cloakMat);
    body.position.y = 1.4;
    body.castShadow = true;
    this.modelGroup.add(body);
    const headGeo = new THREE2.BoxGeometry(0.8, 0.8, 0.8);
    const head = new THREE2.Mesh(headGeo, furMat);
    head.position.y = 2.4;
    head.castShadow = true;
    this.modelGroup.add(head);
    const earGeo = new THREE2.BoxGeometry(0.3, 0.3, 0.1);
    const leftEar = new THREE2.Mesh(earGeo, furMat);
    leftEar.position.set(-0.3, 2.9, 0);
    leftEar.rotation.z = Math.PI / 4;
    this.modelGroup.add(leftEar);
    const rightEar = new THREE2.Mesh(earGeo, furMat);
    rightEar.position.set(0.3, 2.9, 0);
    rightEar.rotation.z = -Math.PI / 4;
    this.modelGroup.add(rightEar);
    const tailGeo = new THREE2.BoxGeometry(0.2, 0.8, 0.2);
    const tail = new THREE2.Mesh(tailGeo, furMat);
    tail.position.set(0, 1, 0.5);
    tail.rotation.x = Math.PI / 6;
    this.modelGroup.add(tail);
    const legGeo = new THREE2.BoxGeometry(0.4, 0.8, 0.4);
    this.leftLeg = new THREE2.Mesh(legGeo, darkMat);
    this.leftLeg.position.set(-0.3, 0.4, 0);
    this.leftLeg.castShadow = true;
    this.modelGroup.add(this.leftLeg);
    this.rightLeg = new THREE2.Mesh(legGeo, darkMat);
    this.rightLeg.position.set(0.3, 0.4, 0);
    this.rightLeg.castShadow = true;
    this.modelGroup.add(this.rightLeg);
    const armGeo = new THREE2.BoxGeometry(0.3, 0.8, 0.3);
    this.leftArm = new THREE2.Mesh(armGeo, cloakMat);
    this.leftArm.position.set(-0.7, 1.4, 0);
    this.leftArm.castShadow = true;
    this.modelGroup.add(this.leftArm);
    this.rightArm = new THREE2.Mesh(armGeo, cloakMat);
    this.rightArm.position.set(0.7, 1.4, 0);
    this.rightArm.castShadow = true;
    this.modelGroup.add(this.rightArm);
    const swordGroup = new THREE2.Group();
    const handleGeo = new THREE2.BoxGeometry(0.1, 0.4, 0.1);
    const handleMat = new THREE2.MeshStandardMaterial({ color: 6111287 });
    const handle = new THREE2.Mesh(handleGeo, handleMat);
    handle.position.y = -0.2;
    swordGroup.add(handle);
    const guardGeo = new THREE2.BoxGeometry(0.4, 0.1, 0.2);
    const guardMat = new THREE2.MeshStandardMaterial({ color: 12632256 });
    const guard = new THREE2.Mesh(guardGeo, guardMat);
    guard.position.y = 0;
    swordGroup.add(guard);
    const bladeGeo = new THREE2.BoxGeometry(0.2, 1.2, 0.05);
    const bladeMat = new THREE2.MeshStandardMaterial({ color: 14737632, metalness: 0.8, roughness: 0.2 });
    const blade = new THREE2.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.65;
    blade.castShadow = true;
    swordGroup.add(blade);
    this.sword = swordGroup;
    this.sword.rotation.x = Math.PI / 2;
    this.sword.position.set(0, -0.4, 0.4);
    this.rightArm.add(this.sword);
    this.scene.add(this.mesh);
    this.cameraPivot = new THREE2.Object3D();
    this.cameraPivot.position.set(0, 2, 0);
    this.mesh.add(this.cameraPivot);
    this.camera.position.set(0, 1, 5);
    this.cameraPivot.add(this.camera);
    this.camera.lookAt(0, 1.6, 0);
  }
  initNameTag(name) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, 128, 32);
    const texture = new THREE2.CanvasTexture(canvas);
    const material = new THREE2.SpriteMaterial({ map: texture, transparent: true });
    this.nameTag = new THREE2.Sprite(material);
    this.nameTag.scale.set(3, 0.75, 1);
    this.nameTag.position.y = 2.5;
    this.mesh.add(this.nameTag);
  }
  setupInputs() {
    window.addEventListener("keydown", (e) => this.onKey(e, true));
    window.addEventListener("keyup", (e) => this.onKey(e, false));
    const container = document.getElementById("game-container");
    container.addEventListener("click", () => {
      if (!this.isPointerLocked) {
        document.body.requestPointerLock();
      } else {
        this.triggerAttack();
      }
    });
    window.addEventListener("mousedown", () => {
      if (this.isPointerLocked) this.triggerAttack();
    });
    document.addEventListener("pointerlockchange", () => {
      this.isPointerLocked = document.pointerLockElement === document.body;
      const crosshair = document.getElementById("crosshair");
      if (this.isPointerLocked) {
        crosshair.classList.remove("hidden");
      } else {
        crosshair.classList.add("hidden");
      }
    });
    document.addEventListener("mousemove", (e) => this.onMouseMove(e));
    let touchStartX = 0;
    let touchStartY = 0;
    container.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      this.keys.forward = true;
    }, { passive: true });
    container.addEventListener("touchmove", (e) => {
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      this.yaw -= dx * 5e-3;
      this.pitch -= dy * 5e-3;
      this.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.pitch));
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    container.addEventListener("touchend", () => {
      this.keys.forward = false;
    }, { passive: true });
    window.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "KeyW":
          this.keys.forward = true;
          break;
        case "KeyS":
          this.keys.backward = true;
          break;
        case "KeyA":
          this.keys.left = true;
          break;
        case "KeyD":
          this.keys.right = true;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          this.triggerDash();
          break;
        case "KeyJ":
          this.triggerSkillJ();
          break;
        case "KeyK":
          this.triggerSkillK();
          break;
      }
    });
  }
  onKey(event, isDown) {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        this.keys.forward = isDown;
        break;
      case "KeyS":
      case "ArrowDown":
        this.keys.backward = isDown;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.keys.left = isDown;
        break;
      case "KeyD":
      case "ArrowRight":
        this.keys.right = isDown;
        break;
    }
  }
  onMouseMove(event) {
    if (!this.isPointerLocked) return;
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    const sensitivity = 2e-3;
    this.yaw -= movementX * sensitivity;
    this.pitch -= movementY * sensitivity;
    this.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.pitch));
  }
  triggerAttack() {
    if (!this.isAttacking && !this.isUltimate) {
      this.isAttacking = true;
      this.isSkillJ = false;
      this.attackTimer = 0;
      this.rightArm.rotation.x = -Math.PI / 2;
    }
  }
  triggerSkillJ() {
    if (this.cdJ <= 0 && !this.isAttacking && !this.isUltimate) {
      this.isAttacking = true;
      this.isSkillJ = true;
      this.attackTimer = 0;
      this.cdJ = 5;
      this.rightArm.rotation.x = -Math.PI / 2;
      this.leftArm.rotation.x = -Math.PI / 2;
      const clawVFX = new THREE2.Group();
      const mat = new THREE2.MeshBasicMaterial({ color: 16776960, transparent: true, opacity: 0.8 });
      for (let i = 0; i < 3; i++) {
        const mesh = new THREE2.Mesh(new THREE2.BoxGeometry(0.1, 2, 0.1), mat);
        mesh.position.set(i * 0.5 - 0.5, 0, 0);
        mesh.rotation.z = Math.PI / 4;
        clawVFX.add(mesh);
      }
      const forward = new THREE2.Vector3(0, 0, -1).applyEuler(new THREE2.Euler(0, this.yaw, 0));
      clawVFX.position.copy(this.position).addScaledVector(forward, 1.5);
      clawVFX.position.y = 1.5;
      clawVFX.rotation.y = this.yaw;
      this.scene.add(clawVFX);
      this.particles.push({ mesh: clawVFX, life: 0.3, maxLife: 0.3, type: "fade" });
    }
  }
  triggerSkillK() {
    if (this.cdK <= 0 && !this.isUltimate) {
      this.isUltimate = true;
      this.ultimateTimer = 0;
      this.cdK = 20;
      this.isAttacking = false;
      this.rightArm.rotation.x = -Math.PI / 2;
      const auraGeo = new THREE2.TorusGeometry(1, 0.2, 8, 24);
      const auraMat = new THREE2.MeshBasicMaterial({ color: 11141375, transparent: true, opacity: 0.8 });
      const aura = new THREE2.Mesh(auraGeo, auraMat);
      aura.position.copy(this.position);
      aura.position.y = 0.5;
      aura.rotation.x = Math.PI / 2;
      this.scene.add(aura);
      this.particles.push({ mesh: aura, life: 1, maxLife: 1, type: "expand" });
    }
  }
  triggerDash() {
    if (this.cdShift <= 0 && !this.isDashing) {
      this.isDashing = true;
      this.dashTimer = 0;
      this.cdShift = 2;
    }
  }
  updateCooldownUI(id, cd) {
    const overlay = document.getElementById(`cd-${id}`);
    const text = document.getElementById(`cd-${id}-text`);
    if (overlay) {
      if (cd > 0) {
        overlay.classList.remove("hidden");
        if (text) text.innerText = Math.ceil(cd);
      } else {
        overlay.classList.add("hidden");
      }
    }
  }
  update(delta) {
    this.mesh.rotation.y = this.yaw;
    this.cameraPivot.rotation.x = this.pitch;
    const moveDir = new THREE2.Vector3();
    if (this.keys.forward) moveDir.z -= 1;
    if (this.keys.backward) moveDir.z += 1;
    if (this.keys.left) moveDir.x -= 1;
    if (this.keys.right) moveDir.x += 1;
    if (this.isDashing && moveDir.lengthSq() < 0.01) {
      moveDir.z = -1;
    }
    moveDir.normalize();
    let currentSpeed = this.speed;
    if (this.isDashing) {
      currentSpeed = this.speed * 3.5;
      this.dashTimer += delta;
      if (this.dashTimer >= this.dashDuration) {
        this.isDashing = false;
      }
      if (Math.random() > 0.5) {
        const trailGeo = new THREE2.BoxGeometry(0.5, 0.5, 0.5);
        const trailMat = new THREE2.MeshBasicMaterial({ color: 43775, transparent: true, opacity: 0.5 });
        const trail = new THREE2.Mesh(trailGeo, trailMat);
        trail.position.copy(this.position);
        trail.position.y = 1;
        trail.position.x += (Math.random() - 0.5) * 0.5;
        trail.position.z += (Math.random() - 0.5) * 0.5;
        this.scene.add(trail);
        this.particles.push({ mesh: trail, life: 0.2, maxLife: 0.2, type: "shrink" });
      }
    }
    moveDir.applyEuler(new THREE2.Euler(0, this.yaw, 0));
    let isMoving = moveDir.lengthSq() > 0.01 || this.isDashing;
    if (isMoving) {
      const nextPosX = this.position.clone();
      nextPosX.x += moveDir.x * currentSpeed * delta;
      const nextPosZ = this.position.clone();
      nextPosZ.z += moveDir.z * currentSpeed * delta;
      let canMoveX = true;
      let canMoveZ = true;
      const boxX = new THREE2.Box3().setFromCenterAndSize(nextPosX, new THREE2.Vector3(1, 2, 1));
      const boxZ = new THREE2.Box3().setFromCenterAndSize(nextPosZ, new THREE2.Vector3(1, 2, 1));
      if (this.environment && this.environment.colliders) {
        boxX.expandByScalar(0.2);
        boxZ.expandByScalar(0.2);
        for (let box of this.environment.colliders) {
          if (boxX.intersectsBox(box)) canMoveX = false;
          if (boxZ.intersectsBox(box)) canMoveZ = false;
        }
      }
      if (nextPosX.x < -98 || nextPosX.x > 98) canMoveX = false;
      if (nextPosZ.z < -98 || nextPosZ.z > 98) canMoveZ = false;
      if (canMoveX) this.position.x = nextPosX.x;
      if (canMoveZ) this.position.z = nextPosZ.z;
      if (!this.isAttacking) {
        this.walkTime += delta * 15;
        const swing = Math.sin(this.walkTime);
        this.leftLeg.rotation.x = swing * 0.5;
        this.rightLeg.rotation.x = -swing * 0.5;
        this.leftArm.rotation.x = -swing * 0.5;
        this.rightArm.rotation.x = swing * 0.5;
      }
    } else if (!this.isAttacking && !this.isUltimate) {
      this.walkTime = 0;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = 0;
      this.rightArm.rotation.x = 0;
    }
    if (this.isUltimate) {
      this.ultimateTimer += delta;
      const duration = 1;
      this.modelGroup.rotation.y += Math.PI * 8 * delta;
      this.rightArm.rotation.x = -Math.PI / 2;
      if (this.ultimateTimer >= duration) {
        this.isUltimate = false;
        this.rightArm.rotation.x = 0;
        this.modelGroup.rotation.y = 0;
      }
    }
    if (this.isAttacking) {
      this.attackTimer += delta;
      const progress = this.attackTimer / this.attackDuration;
      this.rightArm.rotation.x = -Math.PI / 2 + progress * Math.PI * 0.8;
      if (this.isSkillJ) {
        this.leftArm.rotation.x = -Math.PI / 2 + progress * Math.PI * 0.8;
      }
      const attackCenter = this.position.clone();
      const forward = new THREE2.Vector3(0, 0, -1).applyEuler(new THREE2.Euler(0, this.yaw, 0));
      attackCenter.addScaledVector(forward, 1.5);
      const boxSize = this.isSkillJ ? new THREE2.Vector3(4, 2, 4) : new THREE2.Vector3(2, 2, 2);
      this.attackBox.setFromCenterAndSize(attackCenter, boxSize);
      if (this.attackTimer >= this.attackDuration) {
        this.isAttacking = false;
        this.isSkillJ = false;
        this.rightArm.rotation.x = 0;
        this.leftArm.rotation.x = 0;
        this.attackBox.makeEmpty();
      }
    } else {
      this.attackBox.makeEmpty();
    }
    if (this.cdJ > 0) this.cdJ -= delta;
    if (this.cdK > 0) this.cdK -= delta;
    if (this.cdShift > 0) this.cdShift -= delta;
    this.updateCooldownUI("j", this.cdJ);
    this.updateCooldownUI("k", this.cdK);
    this.updateCooldownUI("shift", this.cdShift);
    if (this.isInvincible) {
      this.invincibleTimer += delta;
      this.mesh.visible = Math.floor(this.invincibleTimer * 10) % 2 === 0;
      if (this.invincibleTimer >= this.invincibleDuration) {
        this.isInvincible = false;
        this.mesh.visible = true;
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.life -= delta;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }
      const progress = p.life / p.maxLife;
      if (p.type === "fade") {
        p.mesh.children.forEach((c) => c.material.opacity = progress * 0.8);
      } else if (p.type === "expand") {
        const scale = 1 + (1 - progress) * 10;
        p.mesh.scale.set(scale, scale, scale);
        p.mesh.material.opacity = progress * 0.8;
      } else if (p.type === "shrink") {
        p.mesh.scale.setScalar(progress);
        p.mesh.material.opacity = progress * 0.5;
      }
    }
    this.position.y = 0;
    this.mesh.position.copy(this.position);
  }
};

// src/game/EnemyManager.js
import * as THREE3 from "three";
var EnemyManager = class {
  constructor(scene, player, onPlayerHit, onEnemyKilled) {
    this.scene = scene;
    this.player = player;
    this.onPlayerHit = onPlayerHit;
    this.onEnemyKilled = onEnemyKilled;
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = 8;
    this.maxEnemies = 5;
    this.furMat = new THREE3.MeshStandardMaterial({ color: 2232627 });
    this.armorMat = new THREE3.MeshStandardMaterial({ color: 1118481, metalness: 0.5, roughness: 0.5 });
    this.eyeMat = new THREE3.MeshStandardMaterial({ color: 13369599, emissive: 13369599, emissiveIntensity: 0.8 });
    this.weaponMat = new THREE3.MeshStandardMaterial({ color: 5592405, metalness: 0.8 });
    this.bossFurMat = new THREE3.MeshStandardMaterial({ color: 13369344 });
    this.bossArmorMat = new THREE3.MeshStandardMaterial({ color: 3342336, metalness: 0.6, roughness: 0.4 });
    this.bossEyeMat = new THREE3.MeshStandardMaterial({ color: 16755200, emissive: 16755200, emissiveIntensity: 1 });
    this.bossWeaponMat = new THREE3.MeshStandardMaterial({ color: 8912896, metalness: 0.9 });
    this.spawnEnemy();
    this.spawnEnemy();
  }
  createVoraxMesh(isBoss = false) {
    const mesh = new THREE3.Group();
    const fur = isBoss ? this.bossFurMat : this.furMat;
    const armor = isBoss ? this.bossArmorMat : this.armorMat;
    const eye = isBoss ? this.bossEyeMat : this.eyeMat;
    const weapon = isBoss ? this.bossWeaponMat : this.weaponMat;
    const bodyGeo = new THREE3.BoxGeometry(1, 1.2, 0.8);
    const body = new THREE3.Mesh(bodyGeo, armor);
    body.position.y = 1.4;
    body.castShadow = true;
    mesh.add(body);
    const headGeo = new THREE3.BoxGeometry(0.8, 0.8, 0.8);
    const head = new THREE3.Mesh(headGeo, fur);
    head.position.y = 2.4;
    head.castShadow = true;
    mesh.add(head);
    const eyeGeo = new THREE3.BoxGeometry(0.2, 0.1, 0.1);
    const leftEye = new THREE3.Mesh(eyeGeo, eye);
    leftEye.position.set(-0.2, 2.5, -0.4);
    mesh.add(leftEye);
    const rightEye = new THREE3.Mesh(eyeGeo, eye);
    rightEye.position.set(0.2, 2.5, -0.4);
    mesh.add(rightEye);
    const earGeo = new THREE3.BoxGeometry(0.3, 0.3, 0.1);
    const leftEar = new THREE3.Mesh(earGeo, fur);
    leftEar.position.set(-0.3, 2.9, 0);
    leftEar.rotation.z = Math.PI / 4;
    mesh.add(leftEar);
    const rightEar = new THREE3.Mesh(earGeo, fur);
    rightEar.position.set(0.3, 2.9, 0);
    rightEar.rotation.z = -Math.PI / 4;
    mesh.add(rightEar);
    const legGeo = new THREE3.BoxGeometry(0.4, 0.8, 0.4);
    const leftLeg = new THREE3.Mesh(legGeo, armor);
    leftLeg.position.set(-0.3, 0.4, 0);
    leftLeg.castShadow = true;
    mesh.add(leftLeg);
    mesh.userData.leftLeg = leftLeg;
    const rightLeg = new THREE3.Mesh(legGeo, armor);
    rightLeg.position.set(0.3, 0.4, 0);
    rightLeg.castShadow = true;
    mesh.add(rightLeg);
    mesh.userData.rightLeg = rightLeg;
    const armGeo = new THREE3.BoxGeometry(0.3, 0.8, 0.3);
    const leftArm = new THREE3.Mesh(armGeo, armor);
    leftArm.position.set(-0.7, 1.4, 0);
    leftArm.castShadow = true;
    mesh.add(leftArm);
    mesh.userData.leftArm = leftArm;
    const rightArm = new THREE3.Mesh(armGeo, armor);
    rightArm.position.set(0.7, 1.4, 0);
    rightArm.castShadow = true;
    mesh.add(rightArm);
    mesh.userData.rightArm = rightArm;
    const scytheGroup = new THREE3.Group();
    const handleGeo = new THREE3.BoxGeometry(0.1, 2, 0.1);
    const handle = new THREE3.Mesh(handleGeo, armor);
    scytheGroup.add(handle);
    const bladeGeo = new THREE3.BoxGeometry(0.8, 0.2, 0.05);
    const blade = new THREE3.Mesh(bladeGeo, weapon);
    blade.position.set(0.4, 0.9, 0);
    scytheGroup.add(blade);
    scytheGroup.rotation.x = Math.PI / 4;
    scytheGroup.position.set(0, -0.2, -0.6);
    rightArm.add(scytheGroup);
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    mesh.userData.hpCanvas = canvas;
    mesh.userData.hpCtx = ctx;
    const texture = new THREE3.CanvasTexture(canvas);
    const spriteMat = new THREE3.SpriteMaterial({ map: texture, transparent: true });
    const hpSprite = new THREE3.Sprite(spriteMat);
    hpSprite.scale.set(3, 0.75, 1);
    hpSprite.position.y = 3.5;
    mesh.add(hpSprite);
    mesh.userData.hpSprite = hpSprite;
    mesh.userData.hpTexture = texture;
    if (isBoss) {
      mesh.scale.set(2.5, 2.5, 2.5);
    }
    return mesh;
  }
  updateHealthBar(enemy) {
    const ctx = enemy.userData.hpCtx;
    ctx.clearRect(0, 0, 128, 32);
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, 128, 32);
    const hpPercent = enemy.userData.hp / enemy.userData.maxHp;
    ctx.fillStyle = hpPercent > 0.4 ? "#22c55e" : "#ef4444";
    ctx.fillRect(2, 2, 124 * hpPercent, 28);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 128, 32);
    enemy.userData.hpTexture.needsUpdate = true;
  }
  spawnEnemy() {
    if (this.enemies.length >= this.maxEnemies) return;
    const isBoss = Math.random() < 0.2;
    const enemy = this.createVoraxMesh(isBoss);
    let angle = Math.random() * Math.PI * 2;
    let distance = 20 + Math.random() * 20;
    enemy.position.x = this.player.position.x + Math.cos(angle) * distance;
    enemy.position.z = this.player.position.z + Math.sin(angle) * distance;
    enemy.position.y = 0;
    const hp = isBoss ? 15 : 3;
    enemy.userData.isBoss = isBoss;
    enemy.userData.maxHp = hp;
    enemy.userData.hp = hp;
    enemy.userData.isDead = false;
    enemy.userData.walkTime = Math.random() * 10;
    enemy.userData.knockback = new THREE3.Vector3();
    enemy.userData.iFrames = 0;
    this.updateHealthBar(enemy);
    this.scene.add(enemy);
    this.enemies.push(enemy);
  }
  update(delta) {
    this.spawnTimer += delta;
    if (this.spawnTimer > this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }
    const speed = 4;
    const playerPos = this.player.position;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.userData.isDead) continue;
      if (enemy.userData.iFrames > 0) {
        enemy.userData.iFrames -= delta;
        enemy.visible = Math.floor(enemy.userData.iFrames * 20) % 2 === 0;
        if (enemy.userData.iFrames <= 0) enemy.visible = true;
      }
      const direction = new THREE3.Vector3();
      direction.subVectors(playerPos, enemy.position);
      direction.y = 0;
      const dist = direction.length();
      const hitDistance = enemy.userData.isBoss ? 2.5 : 1.2;
      const enemySpeed = enemy.userData.isBoss ? speed * 0.7 : speed;
      if (enemy.userData.knockback.lengthSq() > 0.01) {
        enemy.position.addScaledVector(enemy.userData.knockback, delta);
        enemy.userData.knockback.lerp(new THREE3.Vector3(0, 0, 0), 10 * delta);
      } else if (dist > hitDistance) {
        direction.normalize();
        enemy.position.addScaledVector(direction, enemySpeed * delta);
        enemy.lookAt(playerPos.x, enemy.position.y, playerPos.z);
        enemy.rotateY(Math.PI);
        enemy.userData.walkTime += delta * 15 * (enemy.userData.isBoss ? 0.7 : 1);
        const swing = Math.sin(enemy.userData.walkTime);
        enemy.userData.leftLeg.rotation.x = swing * 0.5;
        enemy.userData.rightLeg.rotation.x = -swing * 0.5;
        enemy.userData.leftArm.rotation.x = -swing * 0.5;
        enemy.userData.rightArm.rotation.x = swing * 0.5;
      } else {
        if (this.onPlayerHit) {
          this.onPlayerHit();
        }
      }
      if (this.player.isUltimate && enemy.userData.iFrames <= 0) {
        if (dist < 8) {
          enemy.userData.hp -= 3;
          this.updateHealthBar(enemy);
          enemy.userData.iFrames = 1;
          const kbDir = new THREE3.Vector3().subVectors(enemy.position, playerPos).normalize();
          kbDir.y = 0;
          enemy.userData.knockback.copy(kbDir).multiplyScalar(30);
          if (enemy.userData.hp <= 0) {
            this.killEnemy(enemy, i);
            continue;
          }
        }
      }
      if (this.player.isAttacking && enemy.userData.iFrames <= 0) {
        const enemyBox = new THREE3.Box3().setFromObject(enemy);
        if (this.player.attackBox.intersectsBox(enemyBox)) {
          enemy.userData.hp -= 1;
          this.updateHealthBar(enemy);
          enemy.userData.iFrames = 0.5;
          const kbDir = new THREE3.Vector3().subVectors(enemy.position, playerPos).normalize();
          kbDir.y = 0;
          const kbForce = enemy.userData.isBoss ? 5 : 15;
          enemy.userData.knockback.copy(kbDir).multiplyScalar(kbForce);
          if (enemy.userData.hp <= 0) {
            this.killEnemy(enemy, i);
          }
        }
      }
    }
  }
  killEnemy(enemy, index) {
    enemy.userData.isDead = true;
    const flyDir = new THREE3.Vector3(
      (Math.random() - 0.5) * 10,
      15,
      (Math.random() - 0.5) * 10
    );
    let rotSpeed = (Math.random() - 0.5) * 20;
    const startTime = Date.now();
    const animateDeath = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1e3;
      if (elapsed > 1) {
        this.scene.remove(enemy);
        return;
      }
      enemy.position.addScaledVector(flyDir, 0.016);
      enemy.rotation.x += rotSpeed * 0.016;
      enemy.rotation.y += rotSpeed * 0.016;
      requestAnimationFrame(animateDeath);
    };
    animateDeath();
    this.enemies.splice(index, 1);
    if (this.onEnemyKilled) {
      const score = enemy.userData.isBoss ? 50 : 5;
      this.onEnemyKilled(score);
    }
  }
  reset() {
    for (let enemy of this.enemies) {
      this.scene.remove(enemy);
    }
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnEnemy();
    this.spawnEnemy();
  }
};

// src/game/QuizManager.js
import * as THREE4 from "three";

// src/data/questions.js
var questions_default = [
  {
    "id": 1,
    "category": "HTML",
    "score": 100,
    "question": "\u0E41\u0E17\u0E47\u0E01\u0E43\u0E14\u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E41\u0E2A\u0E14\u0E07\u0E23\u0E39\u0E1B\u0E20\u0E32\u0E1E\u0E43\u0E19 HTML?",
    "type": "choice",
    "options": ["<img>", "<picture>", "<image>", "<src>"],
    "answer": 0,
    "explanation": "\u0E41\u0E17\u0E47\u0E01 <img> \u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E41\u0E2A\u0E14\u0E07\u0E23\u0E39\u0E1B\u0E20\u0E32\u0E1E\u0E43\u0E19\u0E2B\u0E19\u0E49\u0E32\u0E40\u0E27\u0E47\u0E1A HTML \u0E42\u0E14\u0E22\u0E15\u0E49\u0E2D\u0E07\u0E23\u0E30\u0E1A\u0E38\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E17\u0E35\u0E48\u0E21\u0E32\u0E1C\u0E48\u0E32\u0E19\u0E41\u0E2D\u0E15\u0E17\u0E23\u0E34\u0E1A\u0E34\u0E27\u0E15\u0E4C src"
  },
  {
    "id": 2,
    "category": "CSS",
    "score": 100,
    "question": "CSS \u0E22\u0E48\u0E2D\u0E21\u0E32\u0E08\u0E32\u0E01\u0E2D\u0E30\u0E44\u0E23?",
    "type": "choice",
    "options": ["Cascading Style Sheets", "Creative Style System", "Computer Style Sheet", "Colorful Style Sheets"],
    "answer": 0,
    "explanation": "CSS \u0E22\u0E48\u0E2D\u0E21\u0E32\u0E08\u0E32\u0E01 Cascading Style Sheets \u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E15\u0E01\u0E41\u0E15\u0E48\u0E07\u0E41\u0E25\u0E30\u0E08\u0E31\u0E14\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E40\u0E27\u0E47\u0E1A HTML"
  },
  {
    "id": 3,
    "category": "CSS",
    "score": 100,
    "question": "\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E43\u0E14\u0E43\u0E0A\u0E49\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E2A\u0E35\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23\u0E43\u0E19 CSS?",
    "type": "choice",
    "options": ["font-color", "color", "text-color", "text-style"],
    "answer": 1,
    "explanation": "\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07 color \u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E2A\u0E35\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23\u0E43\u0E19 CSS"
  },
  {
    "id": 4,
    "category": "JS",
    "score": 150,
    "question": "\u0E02\u0E49\u0E2D\u0E43\u0E14\u0E04\u0E37\u0E2D\u0E27\u0E34\u0E18\u0E35\u0E1B\u0E23\u0E30\u0E01\u0E32\u0E28\u0E15\u0E31\u0E27\u0E41\u0E1B\u0E23\u0E43\u0E19 JavaScript \u0E17\u0E35\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E04\u0E48\u0E32\u0E44\u0E14\u0E49?",
    "type": "choice",
    "options": ["let", "const", "variable", "string"],
    "answer": 0,
    "explanation": "let \u0E43\u0E0A\u0E49\u0E1B\u0E23\u0E30\u0E01\u0E32\u0E28\u0E15\u0E31\u0E27\u0E41\u0E1B\u0E23\u0E17\u0E35\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E04\u0E48\u0E32\u0E44\u0E14\u0E49 \u0E2A\u0E48\u0E27\u0E19 const \u0E43\u0E0A\u0E49\u0E1B\u0E23\u0E30\u0E01\u0E32\u0E28\u0E04\u0E48\u0E32\u0E04\u0E07\u0E17\u0E35\u0E48\u0E17\u0E35\u0E48\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E04\u0E48\u0E32\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49"
  },
  {
    "id": 5,
    "category": "HTML",
    "score": 100,
    "question": "\u0E41\u0E17\u0E47\u0E01\u0E43\u0E14\u0E43\u0E0A\u0E49\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E25\u0E34\u0E07\u0E01\u0E4C (Hyperlink) \u0E43\u0E19 HTML?",
    "type": "choice",
    "options": ["<link>", "<a>", "<href>", "<url>"],
    "answer": 1,
    "explanation": "\u0E41\u0E17\u0E47\u0E01 <a> (Anchor) \u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E25\u0E34\u0E07\u0E01\u0E4C \u0E42\u0E14\u0E22\u0E43\u0E0A\u0E49\u0E41\u0E2D\u0E15\u0E17\u0E23\u0E34\u0E1A\u0E34\u0E27\u0E15\u0E4C href \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E30\u0E1A\u0E38 URL \u0E1B\u0E25\u0E32\u0E22\u0E17\u0E32\u0E07"
  },
  {
    "id": 6,
    "category": "HTML",
    "score": 100,
    "question": "\u0E2B\u0E32\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E2B\u0E31\u0E27\u0E02\u0E49\u0E2D\u0E02\u0E19\u0E32\u0E14\u0E43\u0E2B\u0E0D\u0E48\u0E17\u0E35\u0E48\u0E2A\u0E38\u0E14 \u0E15\u0E49\u0E2D\u0E07\u0E43\u0E0A\u0E49\u0E41\u0E17\u0E47\u0E01\u0E43\u0E14?",
    "type": "choice",
    "options": ["<head>", "<title>", "<h1>", "<h6>"],
    "answer": 2,
    "explanation": "\u0E41\u0E17\u0E47\u0E01 <h1> \u0E04\u0E37\u0E2D\u0E41\u0E17\u0E47\u0E01\u0E2B\u0E31\u0E27\u0E02\u0E49\u0E2D (Heading) \u0E17\u0E35\u0E48\u0E21\u0E35\u0E02\u0E19\u0E32\u0E14\u0E43\u0E2B\u0E0D\u0E48\u0E17\u0E35\u0E48\u0E2A\u0E38\u0E14\u0E41\u0E25\u0E30\u0E21\u0E35\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E33\u0E04\u0E31\u0E0D\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14\u0E43\u0E19\u0E2B\u0E19\u0E49\u0E32\u0E40\u0E27\u0E47\u0E1A"
  },
  {
    "id": 7,
    "category": "CSS",
    "score": 150,
    "question": "\u0E2A\u0E31\u0E0D\u0E25\u0E31\u0E01\u0E29\u0E13\u0E4C\u0E43\u0E14\u0E43\u0E19 CSS \u0E17\u0E35\u0E48\u0E43\u0E0A\u0E49\u0E40\u0E25\u0E37\u0E2D\u0E01 ID (Id Selector)?",
    "type": "choice",
    "options": [".", "#", "*", "@"],
    "answer": 1,
    "explanation": "\u0E2A\u0E31\u0E0D\u0E25\u0E31\u0E01\u0E29\u0E13\u0E4C # \u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07\u0E16\u0E36\u0E07 ID \u0E40\u0E0A\u0E48\u0E19 #my-id \u0E2A\u0E48\u0E27\u0E19 . \u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A Class"
  },
  {
    "id": 8,
    "category": "JS",
    "score": 100,
    "question": "\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E43\u0E14\u0E43\u0E19 JS \u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E41\u0E2A\u0E14\u0E07\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19 (Popup) \u0E1A\u0E19\u0E2B\u0E19\u0E49\u0E32\u0E40\u0E27\u0E47\u0E1A?",
    "type": "choice",
    "options": ["console.log()", "document.write()", "alert()", "popup()"],
    "answer": 2,
    "explanation": "alert() \u0E43\u0E0A\u0E49\u0E41\u0E2A\u0E14\u0E07\u0E2B\u0E19\u0E49\u0E32\u0E15\u0E48\u0E32\u0E07\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E41\u0E1A\u0E1A Popup \u0E1A\u0E19\u0E40\u0E1A\u0E23\u0E32\u0E27\u0E4C\u0E40\u0E0B\u0E2D\u0E23\u0E4C"
  },
  {
    "id": 9,
    "category": "HTML",
    "score": 100,
    "question": "HTML \u0E22\u0E48\u0E2D\u0E21\u0E32\u0E08\u0E32\u0E01\u0E2D\u0E30\u0E44\u0E23?",
    "type": "choice",
    "options": ["Hyper Text Markup Language", "Hyperlinks and Text Markup Language", "Home Tool Markup Language", "Hyper Tool Multi Language"],
    "answer": 0,
    "explanation": "HTML \u0E22\u0E48\u0E2D\u0E21\u0E32\u0E08\u0E32\u0E01 Hyper Text Markup Language \u0E40\u0E1B\u0E47\u0E19\u0E20\u0E32\u0E29\u0E32\u0E2B\u0E25\u0E31\u0E01\u0E17\u0E35\u0E48\u0E43\u0E0A\u0E49\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E42\u0E04\u0E23\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E2B\u0E19\u0E49\u0E32\u0E40\u0E27\u0E47\u0E1A"
  },
  {
    "id": 10,
    "category": "CSS",
    "score": 150,
    "question": "\u0E2B\u0E32\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E1E\u0E37\u0E49\u0E19\u0E2B\u0E25\u0E31\u0E07\u0E43\u0E2B\u0E49\u0E2B\u0E19\u0E49\u0E32\u0E40\u0E27\u0E47\u0E1A\u0E43\u0E19 CSS \u0E15\u0E49\u0E2D\u0E07\u0E43\u0E0A\u0E49\u0E04\u0E38\u0E13\u0E2A\u0E21\u0E1A\u0E31\u0E15\u0E34\u0E43\u0E14?",
    "type": "choice",
    "options": ["color", "bg-color", "background-color", "background-image"],
    "answer": 2,
    "explanation": "background-color \u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E2A\u0E35\u0E1E\u0E37\u0E49\u0E19\u0E2B\u0E25\u0E31\u0E07\u0E02\u0E2D\u0E07\u0E2D\u0E07\u0E04\u0E4C\u0E1B\u0E23\u0E30\u0E01\u0E2D\u0E1A\u0E43\u0E19\u0E2B\u0E19\u0E49\u0E32\u0E40\u0E27\u0E47\u0E1A"
  },
  {
    "id": 11,
    "category": "JS",
    "score": 100,
    "question": "\u0E02\u0E49\u0E2D\u0E43\u0E14\u0E04\u0E37\u0E2D Data Type \u0E1E\u0E37\u0E49\u0E19\u0E10\u0E32\u0E19\u0E43\u0E19 JavaScript?",
    "type": "choice",
    "options": ["String", "Number", "Boolean", "\u0E16\u0E39\u0E01\u0E17\u0E38\u0E01\u0E02\u0E49\u0E2D"],
    "answer": 3,
    "explanation": "String, Number, \u0E41\u0E25\u0E30 Boolean \u0E25\u0E49\u0E27\u0E19\u0E40\u0E1B\u0E47\u0E19\u0E0A\u0E19\u0E34\u0E14\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 (Data Type) \u0E1E\u0E37\u0E49\u0E19\u0E10\u0E32\u0E19\u0E43\u0E19 JavaScript"
  },
  {
    "id": 12,
    "category": "HTML",
    "score": 100,
    "question": "\u0E41\u0E17\u0E47\u0E01\u0E43\u0E14\u0E43\u0E0A\u0E49\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E41\u0E1A\u0E1A\u0E21\u0E35\u0E25\u0E33\u0E14\u0E31\u0E1A (\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02) \u0E43\u0E19 HTML?",
    "type": "choice",
    "options": ["<ul>", "<ol>", "<li>", "<list>"],
    "answer": 1,
    "explanation": "<ol> (Ordered List) \u0E43\u0E0A\u0E49\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E41\u0E1A\u0E1A\u0E21\u0E35\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E01\u0E33\u0E01\u0E31\u0E1A \u0E2A\u0E48\u0E27\u0E19 <ul> \u0E43\u0E0A\u0E49\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E41\u0E1A\u0E1A\u0E08\u0E38\u0E14 Bullet"
  },
  {
    "id": 13,
    "category": "CSS",
    "score": 150,
    "question": "\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07 CSS \u0E43\u0E14\u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E17\u0E33\u0E43\u0E2B\u0E49\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E2D\u0E22\u0E39\u0E48\u0E01\u0E36\u0E48\u0E07\u0E01\u0E25\u0E32\u0E07?",
    "type": "choice",
    "options": ["text-align: center;", "align: center;", "center: true;", "margin: auto;"],
    "answer": 0,
    "explanation": "text-align: center; \u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E08\u0E31\u0E14\u0E43\u0E2B\u0E49\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E19\u0E37\u0E49\u0E2D\u0E2B\u0E32\u0E20\u0E32\u0E22\u0E43\u0E19\u0E2D\u0E22\u0E39\u0E48\u0E01\u0E36\u0E48\u0E07\u0E01\u0E25\u0E32\u0E07"
  },
  {
    "id": 14,
    "category": "JS",
    "score": 100,
    "question": "\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E2B\u0E21\u0E32\u0E22\u0E43\u0E14\u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E40\u0E02\u0E35\u0E22\u0E19\u0E04\u0E2D\u0E21\u0E40\u0E21\u0E19\u0E15\u0E4C\u0E41\u0E1A\u0E1A\u0E1A\u0E23\u0E23\u0E17\u0E31\u0E14\u0E40\u0E14\u0E35\u0E22\u0E27\u0E43\u0E19 JavaScript?",
    "type": "choice",
    "options": ["<!-- -->", "/* */", "//", "#"],
    "answer": 2,
    "explanation": "\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E2B\u0E21\u0E32\u0E22 // \u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E40\u0E02\u0E35\u0E22\u0E19\u0E04\u0E2D\u0E21\u0E40\u0E21\u0E19\u0E15\u0E4C (\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E2B\u0E15\u0E38) \u0E41\u0E1A\u0E1A\u0E1A\u0E23\u0E23\u0E17\u0E31\u0E14\u0E40\u0E14\u0E35\u0E22\u0E27\u0E43\u0E19 JavaScript"
  },
  {
    "id": 15,
    "category": "JS",
    "score": 150,
    "question": "\u0E40\u0E2B\u0E15\u0E38\u0E01\u0E32\u0E23\u0E13\u0E4C (Event) \u0E43\u0E14\u0E08\u0E30\u0E40\u0E01\u0E34\u0E14\u0E02\u0E36\u0E49\u0E19\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E04\u0E25\u0E34\u0E01\u0E17\u0E35\u0E48\u0E1B\u0E38\u0E48\u0E21?",
    "type": "choice",
    "options": ["onchange", "onmouseover", "onclick", "onmouseclick"],
    "answer": 2,
    "explanation": "\u0E40\u0E2B\u0E15\u0E38\u0E01\u0E32\u0E23\u0E13\u0E4C onclick \u0E08\u0E30\u0E16\u0E39\u0E01\u0E40\u0E23\u0E35\u0E22\u0E01\u0E43\u0E0A\u0E49 (Trigger) \u0E40\u0E21\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E04\u0E25\u0E34\u0E01\u0E40\u0E21\u0E32\u0E2A\u0E4C\u0E17\u0E35\u0E48\u0E2D\u0E07\u0E04\u0E4C\u0E1B\u0E23\u0E30\u0E01\u0E2D\u0E1A\u0E19\u0E31\u0E49\u0E19\u0E46"
  }
];

// src/game/QuizManager.js
var QuizManager = class {
  constructor(scene, player, uiManager) {
    this.scene = scene;
    this.player = player;
    this.ui = uiManager;
    this.allQuestions = questions_default;
    this.activeQuestions = [];
    this.boxes = [];
    this.boxGeo = new THREE4.BoxGeometry(1.5, 1.5, 1.5);
    this.boxMat = new THREE4.MeshStandardMaterial({
      color: 16436245,
      // Yellow
      emissive: 16436245,
      emissiveIntensity: 0.5
    });
    this.currentQuestionIndex = 0;
    this.isQuizActive = false;
    this.quizContainer = document.getElementById("quiz-container");
  }
  startNewGame() {
    this.activeQuestions = [...this.allQuestions].sort(() => 0.5 - Math.random()).slice(0, 15);
    this.ui.playerData.maxProgress = 15;
    this.ui.playerData.progress = 0;
    this.ui.playerData.correctCount = 0;
    this.ui.playerData.wrongCount = 0;
    this.ui.updateHUD();
    this.spawnBoxes();
  }
  spawnBoxes() {
    for (let box of this.boxes) {
      this.scene.remove(box);
    }
    this.boxes = [];
    this.spawnSingleBox();
    this.spawnSingleBox();
    this.spawnSingleBox();
  }
  spawnSingleBox() {
    if (this.boxes.length + this.ui.playerData.progress >= this.activeQuestions.length) {
      return;
    }
    const box = new THREE4.Mesh(this.boxGeo, this.boxMat);
    let angle = Math.random() * Math.PI * 2;
    let distance = 15 + Math.random() * 30;
    box.position.x = this.player.position.x + Math.cos(angle) * distance;
    box.position.z = this.player.position.z + Math.sin(angle) * distance;
    box.position.y = 1.5;
    box.userData = {
      baseY: 1.5,
      time: Math.random() * 10,
      questionData: this.activeQuestions[this.boxes.length + this.ui.playerData.progress]
    };
    this.scene.add(box);
    this.boxes.push(box);
  }
  update(delta) {
    if (this.isQuizActive) return;
    for (let i = this.boxes.length - 1; i >= 0; i--) {
      const box = this.boxes[i];
      box.userData.time += delta * 2;
      box.position.y = box.userData.baseY + Math.sin(box.userData.time) * 0.5;
      box.rotation.x += delta;
      box.rotation.y += delta;
      const dist = this.player.position.distanceTo(box.position);
      if (dist < 2) {
        const qData = box.userData.questionData;
        this.scene.remove(box);
        this.boxes.splice(i, 1);
        this.triggerQuiz(qData);
        break;
      }
    }
  }
  triggerQuiz(questionData) {
    this.isQuizActive = true;
    this.gameWasRunning = this.ui.game.isRunning;
    this.ui.game.isRunning = false;
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    this.ui.showPage("quiz");
    this.renderQuestion(questionData);
  }
  escapeHTML(str) {
    return str.replace(
      /[&<>'"]/g,
      (tag) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      })[tag] || tag
    );
  }
  renderQuestion(qData) {
    const safeQuestion = this.escapeHTML(qData.question);
    let html = `
            <div class="flex justify-between items-center mb-6">
                <span class="bg-cyan-900 text-cyan-300 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">${qData.category}</span>
                <span class="text-yellow-400 font-bold">${qData.score} Points</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-bold text-white mb-8 text-center leading-relaxed font-['Outfit']">${safeQuestion}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="quiz-options">
        `;
    qData.options.forEach((opt, idx) => {
      const safeOpt = this.escapeHTML(opt);
      html += `<button class="quiz-opt-btn p-4 bg-gray-800 border-2 border-gray-700 text-white font-semibold rounded-xl hover:bg-gray-700 hover:border-cyan-400 transition-all text-left text-lg focus:outline-none" data-idx="${idx}">${safeOpt}</button>`;
    });
    html += `</div>
            <div id="quiz-feedback" class="mt-8 hidden flex-col items-center text-center">
                <h3 id="feedback-title" class="text-3xl font-black mb-2"></h3>
                <p id="feedback-desc" class="text-gray-300 text-lg mb-6 max-w-xl leading-relaxed"></p>
                <button id="btn-quiz-continue" class="px-10 py-3 bg-cyan-500 text-gray-900 font-bold rounded-lg hover:bg-cyan-400 transition-all text-xl shadow-[0_0_15px_rgba(34,211,238,0.5)]">\u0E17\u0E33\u0E20\u0E32\u0E23\u0E01\u0E34\u0E08\u0E15\u0E48\u0E2D</button>
            </div>
        `;
    this.quizContainer.innerHTML = html;
    const btns = this.quizContainer.querySelectorAll(".quiz-opt-btn");
    btns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (this.quizContainer.querySelector("#quiz-feedback").classList.contains("hidden") === false) return;
        const chosenIdx = parseInt(e.currentTarget.getAttribute("data-idx"));
        this.handleAnswer(qData, chosenIdx, btns, e.currentTarget);
      });
    });
  }
  handleAnswer(qData, chosenIdx, allBtns, clickedBtn) {
    const isCorrect = chosenIdx === qData.answer;
    allBtns.forEach((b) => b.classList.add("opacity-50", "cursor-not-allowed"));
    clickedBtn.classList.remove("opacity-50");
    const feedback = this.quizContainer.querySelector("#quiz-feedback");
    const feedbackTitle = this.quizContainer.querySelector("#feedback-title");
    const feedbackDesc = this.quizContainer.querySelector("#feedback-desc");
    feedback.classList.remove("hidden");
    feedback.classList.add("flex");
    if (isCorrect) {
      clickedBtn.classList.replace("border-gray-700", "border-green-500");
      clickedBtn.classList.replace("bg-gray-800", "bg-green-900/50");
      feedbackTitle.innerText = "\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07! \u{1F389}";
      feedbackTitle.className = "text-3xl font-black mb-2 text-green-400";
      feedbackDesc.innerText = qData.explanation;
      this.ui.playerData.score += qData.score;
      this.ui.playerData.correctCount++;
    } else {
      clickedBtn.classList.replace("border-gray-700", "border-red-500");
      clickedBtn.classList.replace("bg-gray-800", "bg-red-900/50");
      allBtns[qData.answer].classList.remove("opacity-50");
      allBtns[qData.answer].classList.replace("border-gray-700", "border-green-500");
      allBtns[qData.answer].classList.replace("bg-gray-800", "bg-green-900/50");
      feedbackTitle.innerText = "\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14! \u274C";
      feedbackTitle.className = "text-3xl font-black mb-2 text-red-500";
      const safeAnswer = this.escapeHTML(qData.options[qData.answer]);
      feedbackDesc.innerHTML = `<strong class="text-white">\u0E04\u0E33\u0E15\u0E2D\u0E1A\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E04\u0E37\u0E2D: ${safeAnswer}</strong><br><br>${this.escapeHTML(qData.explanation)}`;
      this.ui.playerData.lives -= 1;
      this.ui.playerData.wrongCount++;
    }
    this.ui.playerData.progress++;
    this.ui.updateHUD();
    document.getElementById("btn-quiz-continue").addEventListener("click", () => {
      this.resumeGame();
    });
  }
  resumeGame() {
    this.ui.showPage("gameHud");
    this.isQuizActive = false;
    this.ui.game.isRunning = true;
    const p = this.ui.playerData.progress;
    if (this.ui.playerData.lives <= 0) {
      this.ui.game.gameOver();
    } else if (p >= this.ui.playerData.maxProgress) {
      this.ui.game.isRunning = false;
      this.ui.showResult(true);
    } else if (p === 5 || p === 10) {
      const currentLevel = p === 5 ? 1 : 2;
      this.ui.game.environment.spawnPortal(new THREE4.Vector3(0, 0, 0), currentLevel);
    } else {
      if (this.boxes.length < 3) {
        this.spawnSingleBox();
      }
    }
  }
  onLevelUp() {
    while (this.boxes.length < 3) {
      this.spawnSingleBox();
    }
  }
};

// src/game/Game.js
var Game = class {
  constructor(container) {
    this.container = container;
    this.clock = new THREE5.Clock();
    this.isGameOver = false;
    this.isRunning = false;
    this.init();
  }
  init() {
    this.scene = new THREE5.Scene();
    this.camera = new THREE5.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e3);
    this.renderer = new THREE5.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE5.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
    this.environment = new Environment(this.scene);
    this.player = new Player(this.scene, this.camera, this.environment);
    this.enemyManager = new EnemyManager(
      this.scene,
      this.player,
      () => this.onPlayerHit(),
      (pts) => this.addScore(pts)
    );
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }
  setUI(uiManager) {
    this.ui = uiManager;
    this.quizManager = new QuizManager(this.scene, this.player, this.ui);
  }
  start(playerName) {
    this.isGameOver = false;
    if (this.player) {
      this.player.position.set(0, 0, 0);
      this.player.velocity.set(0, 0, 0);
      this.player.initNameTag(playerName);
    }
    if (this.enemyManager) {
      this.enemyManager.reset();
    }
    if (this.quizManager) {
      this.quizManager.startNewGame();
    }
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }
  gameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    if (this.ui) {
      this.ui.showGameOver();
    }
  }
  onPlayerHit() {
    if (!this.player || this.player.isInvincible || this.isGameOver || !this.isRunning) return;
    this.player.isInvincible = true;
    this.player.invincibleTimer = 0;
    if (this.ui) {
      this.ui.playerData.lives -= 1;
      this.ui.updateHUD();
      const uiLayer = document.getElementById("ui-layer");
      const flash = document.createElement("div");
      flash.className = "absolute inset-0 bg-red-500/50 pointer-events-none z-50 transition-opacity duration-300";
      uiLayer.appendChild(flash);
      setTimeout(() => {
        flash.style.opacity = "0";
        setTimeout(() => flash.remove(), 300);
      }, 100);
      if (this.ui.playerData.lives <= 0) {
        this.gameOver();
      }
    }
  }
  addScore(points) {
    if (this.ui && this.ui.playerData) {
      this.ui.playerData.score += points;
      this.ui.updateHUD();
    }
  }
  restart() {
    this.isGameOver = false;
    const gameOverScreen = document.getElementById("game-over-screen");
    if (gameOverScreen) {
      gameOverScreen.classList.add("hidden");
    }
    this.player.position.set(0, 0, 0);
    this.player.velocity.set(0, 0, 0);
    this.enemyManager.reset();
  }
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    const delta = this.clock.getDelta();
    if (this.isRunning && !this.isGameOver) {
      if (this.player) {
        this.player.update(delta);
      }
      if (this.enemyManager) {
        this.enemyManager.update(delta);
      }
      if (this.quizManager) {
        this.quizManager.update(delta);
      }
      if (this.environment) {
        this.environment.update(delta);
        if (this.environment.portal) {
          const dist = this.player.position.distanceTo(this.environment.portal.position);
          if (dist < 2) {
            this.enterPortal();
          }
        }
      }
    }
    this.renderer.render(this.scene, this.camera);
  }
  enterPortal() {
    const uiLayer = document.getElementById("ui-layer");
    const flash = document.createElement("div");
    const newLevel = this.environment.currentLevel + 1;
    flash.className = "absolute inset-0 bg-white pointer-events-none z-50 transition-opacity duration-1000 flex items-center justify-center";
    flash.innerHTML = `<h1 class="text-6xl md:text-8xl font-black text-black drop-shadow-lg tracking-widest uppercase">LEVEL ${newLevel}</h1>`;
    uiLayer.appendChild(flash);
    this.environment.removePortal();
    this.environment.setLevel(newLevel);
    this.player.position.set(0, 0, 0);
    this.player.velocity.set(0, 0, 0);
    this.enemyManager.reset();
    this.quizManager.onLevelUp();
    setTimeout(() => {
      flash.style.opacity = "0";
      setTimeout(() => flash.remove(), 1e3);
    }, 1500);
  }
};

// src/ui/UIManager.js
var UIManager = class {
  constructor(game) {
    this.game = game;
    this.pages = {
      start: document.getElementById("page-start"),
      login: document.getElementById("page-login"),
      register: document.getElementById("page-register"),
      tutorial: document.getElementById("page-tutorial"),
      gameHud: document.getElementById("page-game-hud"),
      quiz: document.getElementById("page-quiz"),
      result: document.getElementById("page-result"),
      gameOver: document.getElementById("game-over-screen"),
      dashboard: document.getElementById("page-dashboard")
    };
    this.inputs = {
      id: document.getElementById("input-id"),
      name: document.getElementById("input-name"),
      class: document.getElementById("input-class"),
      nickname: document.getElementById("input-nickname"),
      password: document.getElementById("input-password"),
      loginId: document.getElementById("login-id"),
      loginPassword: document.getElementById("login-password")
    };
    this.playerData = {
      id: "",
      name: "",
      class: "",
      nickname: "Player",
      score: 0,
      lives: 3,
      progress: 0,
      maxProgress: 10,
      startTime: 0,
      endTime: 0
    };
    this.setupEventListeners();
    this.updateAuthUI();
  }
  updateAuthUI() {
    const sessionStr = localStorage.getItem("cyberVoxelSession");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session && session.id) {
        document.getElementById("guest-buttons").classList.add("hidden");
        document.getElementById("user-buttons").classList.remove("hidden");
        document.getElementById("start-welcome-name").innerText = session.nickname;
        this.playerData.id = session.id;
        this.playerData.name = session.name;
        this.playerData.class = session.class;
        this.playerData.nickname = session.nickname;
        return;
      }
    }
    document.getElementById("guest-buttons").classList.remove("hidden");
    document.getElementById("user-buttons").classList.add("hidden");
  }
  setupEventListeners() {
    document.getElementById("btn-goto-login")?.addEventListener("click", () => {
      this.showPage("login");
    });
    document.getElementById("btn-goto-register")?.addEventListener("click", () => {
      this.showPage("register");
    });
    document.getElementById("btn-start-game-direct")?.addEventListener("click", () => {
      this.startGame();
    });
    document.getElementById("btn-logout")?.addEventListener("click", () => {
      this.doLogout();
    });
    document.getElementById("btn-goto-tutorial")?.addEventListener("click", () => {
      this.showPage("tutorial");
    });
    document.getElementById("btn-goto-dashboard")?.addEventListener("click", () => {
      this.updateDashboard();
      this.showPage("dashboard");
    });
    document.getElementById("btn-dash-back")?.addEventListener("click", () => {
      this.updateAuthUI();
      this.showPage("start");
    });
    document.getElementById("btn-back-to-start-from-login")?.addEventListener("click", () => {
      this.showPage("start");
    });
    document.getElementById("btn-do-login")?.addEventListener("click", () => {
      this.doLogin();
    });
    document.getElementById("btn-back-to-start")?.addEventListener("click", () => {
      this.showPage("start");
    });
    document.getElementById("btn-start-game")?.addEventListener("click", () => {
      this.registerUser();
    });
    document.getElementById("btn-tutorial-back")?.addEventListener("click", () => {
      this.updateAuthUI();
      this.showPage("start");
    });
    document.getElementById("btn-result-restart")?.addEventListener("click", () => {
      this.startGame();
    });
    document.getElementById("btn-result-home")?.addEventListener("click", () => {
      this.updateAuthUI();
      this.showPage("start");
    });
  }
  showPage(pageName) {
    for (let key in this.pages) {
      if (this.pages[key]) {
        this.pages[key].classList.add("hidden");
      }
    }
    if (this.pages[pageName]) {
      this.pages[pageName].classList.remove("hidden");
    }
  }
  doLogin() {
    const id = this.inputs.loginId.value.trim();
    const password = this.inputs.loginPassword.value.trim();
    const errorEl = document.getElementById("login-error");
    if (!id || !password) {
      errorEl.classList.remove("hidden");
      errorEl.innerText = "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E23\u0E2D\u0E01\u0E44\u0E2D\u0E14\u0E35\u0E41\u0E25\u0E30\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19!";
      return;
    }
    let users = JSON.parse(localStorage.getItem("cyberVoxelUsers") || "[]");
    const user = users.find((u) => u.id === id && u.password === password);
    if (user) {
      errorEl.classList.add("hidden");
      localStorage.setItem("cyberVoxelSession", JSON.stringify({
        id: user.id,
        name: user.name,
        class: user.class,
        nickname: user.nickname
      }));
      this.inputs.loginId.value = "";
      this.inputs.loginPassword.value = "";
      this.updateAuthUI();
      this.showPage("start");
    } else {
      errorEl.classList.remove("hidden");
      errorEl.innerText = "\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E2B\u0E23\u0E37\u0E2D\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07!";
    }
  }
  doLogout() {
    localStorage.removeItem("cyberVoxelSession");
    this.updateAuthUI();
  }
  registerUser() {
    const id = this.inputs.id.value.trim();
    const name = this.inputs.name.value.trim();
    const cls = this.inputs.class.value.trim();
    const nickname = this.inputs.nickname.value.trim();
    const password = this.inputs.password.value.trim();
    const errorEl = document.getElementById("register-error");
    const successEl = document.getElementById("register-success");
    if (!id || !name || !cls || !nickname || !password) {
      errorEl.classList.remove("hidden");
      errorEl.innerText = "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E23\u0E2D\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E43\u0E2B\u0E49\u0E04\u0E23\u0E1A\u0E16\u0E49\u0E27\u0E19!";
      return;
    }
    let users = JSON.parse(localStorage.getItem("cyberVoxelUsers") || "[]");
    if (users.find((u) => u.id === id)) {
      errorEl.classList.remove("hidden");
      errorEl.innerText = "\u0E44\u0E2D\u0E14\u0E35\u0E19\u0E35\u0E49\u0E21\u0E35\u0E04\u0E19\u0E43\u0E0A\u0E49\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E44\u0E1B\u0E41\u0E25\u0E49\u0E27!";
      return;
    }
    errorEl.classList.add("hidden");
    successEl.classList.remove("hidden");
    const newUser = { id, name, class: cls, nickname, password };
    users.push(newUser);
    localStorage.setItem("cyberVoxelUsers", JSON.stringify(users));
    localStorage.setItem("cyberVoxelSession", JSON.stringify({
      id: newUser.id,
      name: newUser.name,
      class: newUser.class,
      nickname: newUser.nickname
    }));
    setTimeout(() => {
      successEl.classList.add("hidden");
      this.updateAuthUI();
      this.showPage("start");
    }, 1500);
  }
  startGame() {
    this.showPage("gameHud");
    this.playerData.score = 0;
    this.playerData.lives = 3;
    this.playerData.progress = 0;
    this.playerData.startTime = Date.now();
    this.updateHUD();
    if (this.game) {
      this.game.start(this.playerData.nickname);
    }
  }
  updateHUD() {
    const livesEl = document.getElementById("hud-lives");
    if (livesEl) {
      livesEl.innerText = "\u2764\uFE0F".repeat(this.playerData.lives);
    }
    const scoreEl = document.getElementById("hud-score");
    if (scoreEl) {
      scoreEl.innerText = this.playerData.score;
    }
    const progressText = document.getElementById("hud-progress-text");
    const progressBar = document.getElementById("hud-progress-bar");
    if (progressText && progressBar) {
      progressText.innerText = `${this.playerData.progress}/${this.playerData.maxProgress}`;
      const percent = this.playerData.progress / this.playerData.maxProgress * 100;
      progressBar.style.width = `${percent}%`;
    }
  }
  showGameOver() {
    this.showResult(false);
  }
  showResult(isVictory) {
    this.playerData.endTime = Date.now();
    this.showPage("result");
    const timeTakenMs = this.playerData.endTime - this.playerData.startTime;
    const minutes = Math.floor(timeTakenMs / 6e4);
    const seconds = Math.floor(timeTakenMs % 6e4 / 1e3);
    document.getElementById("result-title").innerText = isVictory ? "MISSION COMPLETE" : "MISSION FAILED";
    document.getElementById("result-title").className = isVictory ? "text-6xl font-black text-cyan-400 mb-2 font-['Outfit'] drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" : "text-6xl font-black text-red-500 mb-2 font-['Outfit'] drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]";
    document.getElementById("result-player-name").innerText = this.playerData.name;
    document.getElementById("result-score").innerText = this.playerData.score;
    document.getElementById("result-time").innerText = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} \u0E19\u0E32\u0E17\u0E35`;
    let badge = "\u{1F949} \u0E1C\u0E39\u0E49\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19 (Bronze)";
    let percentage = Math.round(this.playerData.correctCount / this.playerData.maxProgress * 100);
    if (percentage >= 70) badge = "\u{1F948} \u0E19\u0E31\u0E01\u0E41\u0E01\u0E49\u0E1B\u0E31\u0E0D\u0E2B\u0E32 (Silver)";
    if (percentage >= 90) badge = "\u{1F947} \u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D (Gold)";
    document.getElementById("result-badge").innerText = badge;
    document.getElementById("result-percent").innerText = `${percentage}%`;
    document.getElementById("result-correct").innerText = `${this.playerData.correctCount} \u0E02\u0E49\u0E2D`;
    document.getElementById("result-wrong").innerText = `${this.playerData.wrongCount} \u0E02\u0E49\u0E2D`;
    this.playerData.badge = badge;
    this.saveData();
  }
  saveData() {
    let leaderboard = JSON.parse(localStorage.getItem("cyberVoxelLeaderboard") || "[]");
    leaderboard.push(this.playerData);
    localStorage.setItem("cyberVoxelLeaderboard", JSON.stringify(leaderboard));
    const appsScriptUrl = "https://script.google.com/macros/s/AKfycbzW6c8GP05l2ptmi-buYhP7AH2W__SpBJdnOXiIkWEjXVMD58wik4O8wPFWwu4N-14I/exec";
    fetch(appsScriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(this.playerData)
    }).then(() => console.log("Data sent to Google Sheets (no-cors)")).catch((err) => console.error("Failed to send data", err));
  }
  updateDashboard() {
    let leaderboard = JSON.parse(localStorage.getItem("cyberVoxelLeaderboard") || "[]");
    document.getElementById("dash-total-players").innerText = leaderboard.length;
    if (leaderboard.length === 0) {
      document.getElementById("dash-avg-score").innerText = 0;
      document.getElementById("dash-max-score").innerText = 0;
      document.getElementById("dash-min-score").innerText = 0;
      document.getElementById("dash-leaderboard-body").innerHTML = `<tr><td colspan="4" class="py-4 text-center text-gray-500">\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E40\u0E25\u0E48\u0E19</td></tr>`;
      return;
    }
    let totalScore = 0;
    let maxScore = -1;
    let minScore = 999999;
    leaderboard.sort((a, b) => b.score - a.score);
    let html = "";
    leaderboard.forEach((p, idx) => {
      totalScore += p.score;
      if (p.score > maxScore) maxScore = p.score;
      if (p.score < minScore) minScore = p.score;
      html += `
                <tr class="border-b border-gray-800">
                  <td class="py-2">${idx + 1}</td>
                  <td class="py-2">${p.nickname}</td>
                  <td class="py-2 text-yellow-400 font-bold">${p.score}</td>
                  <td class="py-2">${p.badge}</td>
                </tr>
            `;
    });
    document.getElementById("dash-avg-score").innerText = Math.round(totalScore / leaderboard.length);
    document.getElementById("dash-max-score").innerText = maxScore;
    document.getElementById("dash-min-score").innerText = minScore;
    document.getElementById("dash-leaderboard-body").innerHTML = html;
  }
};

// src/main.js
window.addEventListener("error", (event) => {
  document.body.innerHTML += `<div style="color: red; font-family: sans-serif; padding: 20px; background: white; z-index: 9999; position: absolute; top:0; left:0;"><h1>Global Error</h1><pre>${event.error?.stack || event.message}</pre></div>`;
});
document.addEventListener("DOMContentLoaded", () => {
  try {
    const container = document.getElementById("game-container");
    const game = new Game(container);
    const ui = new UIManager(game);
    game.setUI(ui);
    ui.showPage("start");
    window.game = game;
    window.ui = ui;
  } catch (error) {
    console.error(error);
    document.body.innerHTML = `<div style="color: red; font-family: sans-serif; padding: 20px; background: white; z-index: 9999; position: absolute; top:0; left:0;"><h1>Error</h1><pre>${error.stack}</pre></div>`;
  }
});
