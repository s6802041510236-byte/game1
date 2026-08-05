import * as THREE from 'three';

export class Environment {
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
            new THREE.Color(0x87CEEB), // Day (Level 1)
            new THREE.Color(0xff8c42), // Sunset (Level 2)
            new THREE.Color(0x191970)  // Night (Level 3)
        ];
        this.fogColors = [
            new THREE.Color(0x87CEEB),
            new THREE.Color(0xdc6b41),
            new THREE.Color(0x191970)
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
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Directional light (Sun)
        const sunLight = new THREE.DirectionalLight(0xffddaa, 1.2);
        sunLight.position.set(100, 50, -50);
        sunLight.castShadow = true;
        
        // Shadow map settings
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
        const grassTex = textureLoader.load('textures/grass.jpg');
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
        const rockCount = 30; // Added rocks

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
        const barkTex = textureLoader.load('textures/bark.jpg');
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
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.y = trunkHeight + leavesSize / 2 - 0.5;
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        treeGroup.add(leaves);

        treeGroup.position.set(x, 0, z);
        this.scene.add(treeGroup);
        
        // Add Collider (Update world matrix first to get accurate box)
        treeGroup.updateMatrixWorld(true);
        const collider = new THREE.Box3().setFromObject(trunk);
        this.colliders.push(collider);
    }

    createRandomRock() {
        const x = (Math.random() - 0.5) * (this.worldSize - 20);
        const z = (Math.random() - 0.5) * (this.worldSize - 20);
        
        if (Math.abs(x) < 10 && Math.abs(z) < 10) return;

        const textureLoader = new THREE.TextureLoader();
        const rockTex = textureLoader.load('textures/rock.jpg');
        rockTex.wrapS = THREE.RepeatWrapping;
        rockTex.wrapT = THREE.RepeatWrapping;
        rockTex.repeat.set(2, 2);

        const radius = 1 + Math.random() * 2;
        const rockGeo = new THREE.DodecahedronGeometry(radius, 1);
        const rockMat = new THREE.MeshStandardMaterial({ map: rockTex, roughness: 0.9 });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        
        rock.position.set(x, radius * 0.5, z);
        // Random rotation
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

        // Keep center clear for player spawn
        if (Math.abs(x) < 15 && Math.abs(z) < 15) return;

        const width = 4 + Math.random() * 6;
        const depth = 4 + Math.random() * 6;
        const height = 10 + Math.random() * 20;

        const buildingGeo = new THREE.BoxGeometry(width, height, depth);
        
        // Randomize building color slightly
        const colors = [0x9e9e9e, 0x607d8b, 0xb0bec5, 0x78909c];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const buildingMat = new THREE.MeshStandardMaterial({ color });
        
        const building = new THREE.Mesh(buildingGeo, buildingMat);
        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        
        this.scene.add(building);
        
        // Add Collider
        building.updateMatrixWorld(true);
        const collider = new THREE.Box3().setFromObject(building);
        this.colliders.push(collider);
    }

    spawnPortal(position, level) {
        this.removePortal();

        const portalColor = level === 1 ? 0x00ffff : 0xffaa00;
        
        const portalGeo = new THREE.TorusGeometry(2, 0.4, 16, 100);
        const portalMat = new THREE.MeshBasicMaterial({ 
            color: portalColor,
            transparent: true,
            opacity: 0.8
        });
        
        this.portal = new THREE.Mesh(portalGeo, portalMat);
        this.portal.position.copy(position);
        this.portal.position.y = 2; // Hover slightly
        this.scene.add(this.portal);
        
        // Add point light
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
            
            // Pulse effect
            const scale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
            this.portal.scale.set(scale, scale, scale);
        }
    }
}
