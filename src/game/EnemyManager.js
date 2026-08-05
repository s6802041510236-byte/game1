import * as THREE from 'three';

export class EnemyManager {
    constructor(scene, player, onPlayerHit, onEnemyKilled) {
        this.scene = scene;
        this.player = player;
        this.onPlayerHit = onPlayerHit;
        this.onEnemyKilled = onEnemyKilled;
        
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = 8; // Spawn a new enemy every 8 seconds
        
        this.maxEnemies = 5;

        // VORAX Materials
        this.furMat = new THREE.MeshStandardMaterial({ color: 0x221133 }); // Dark purple/black
        this.armorMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.5, roughness: 0.5 }); // Black armor
        this.eyeMat = new THREE.MeshStandardMaterial({ color: 0xcc00ff, emissive: 0xcc00ff, emissiveIntensity: 0.8 }); // Glowing purple eyes
        this.weaponMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8 }); // Scythe blade
        
        // Boss Materials
        this.bossFurMat = new THREE.MeshStandardMaterial({ color: 0xcc0000 }); // Red
        this.bossArmorMat = new THREE.MeshStandardMaterial({ color: 0x330000, metalness: 0.6, roughness: 0.4 }); // Dark red armor
        this.bossEyeMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 1.0 }); // Yellow/Orange eyes
        this.bossWeaponMat = new THREE.MeshStandardMaterial({ color: 0x880000, metalness: 0.9 }); // Blood scythe
        
        this.spawnEnemy();
        this.spawnEnemy();
    }

    createVoraxMesh(isBoss = false) {
        const mesh = new THREE.Group();
        
        const fur = isBoss ? this.bossFurMat : this.furMat;
        const armor = isBoss ? this.bossArmorMat : this.armorMat;
        const eye = isBoss ? this.bossEyeMat : this.eyeMat;
        const weapon = isBoss ? this.bossWeaponMat : this.weaponMat;

        // Body (Armor)
        const bodyGeo = new THREE.BoxGeometry(1, 1.2, 0.8);
        const body = new THREE.Mesh(bodyGeo, armor);
        body.position.y = 1.4;
        body.castShadow = true;
        mesh.add(body);

        // Head
        const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const head = new THREE.Mesh(headGeo, fur);
        head.position.y = 2.4;
        head.castShadow = true;
        mesh.add(head);
        
        // Eyes
        const eyeGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        const leftEye = new THREE.Mesh(eyeGeo, eye);
        leftEye.position.set(-0.2, 2.5, -0.4);
        mesh.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeo, eye);
        rightEye.position.set(0.2, 2.5, -0.4);
        mesh.add(rightEye);

        // Ears
        const earGeo = new THREE.BoxGeometry(0.3, 0.3, 0.1);
        const leftEar = new THREE.Mesh(earGeo, fur);
        leftEar.position.set(-0.3, 2.9, 0);
        leftEar.rotation.z = Math.PI / 4;
        mesh.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeo, fur);
        rightEar.position.set(0.3, 2.9, 0);
        rightEar.rotation.z = -Math.PI / 4;
        mesh.add(rightEar);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.4, 0.8, 0.4);
        const leftLeg = new THREE.Mesh(legGeo, armor);
        leftLeg.position.set(-0.3, 0.4, 0);
        leftLeg.castShadow = true;
        mesh.add(leftLeg);
        mesh.userData.leftLeg = leftLeg;

        const rightLeg = new THREE.Mesh(legGeo, armor);
        rightLeg.position.set(0.3, 0.4, 0);
        rightLeg.castShadow = true;
        mesh.add(rightLeg);
        mesh.userData.rightLeg = rightLeg;

        // Arms
        const armGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        const leftArm = new THREE.Mesh(armGeo, armor);
        leftArm.position.set(-0.7, 1.4, 0);
        leftArm.castShadow = true;
        mesh.add(leftArm);
        mesh.userData.leftArm = leftArm;

        const rightArm = new THREE.Mesh(armGeo, armor);
        rightArm.position.set(0.7, 1.4, 0);
        rightArm.castShadow = true;
        mesh.add(rightArm);
        mesh.userData.rightArm = rightArm;

        // Scythe
        const scytheGroup = new THREE.Group();
        
        const handleGeo = new THREE.BoxGeometry(0.1, 2.0, 0.1);
        const handle = new THREE.Mesh(handleGeo, armor);
        scytheGroup.add(handle);
        
        const bladeGeo = new THREE.BoxGeometry(0.8, 0.2, 0.05);
        const blade = new THREE.Mesh(bladeGeo, weapon);
        blade.position.set(0.4, 0.9, 0);
        scytheGroup.add(blade);
        
        scytheGroup.rotation.x = Math.PI / 4;
        scytheGroup.position.set(0, -0.2, -0.6);
        rightArm.add(scytheGroup);

        // Health Bar UI
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        mesh.userData.hpCanvas = canvas;
        mesh.userData.hpCtx = ctx;
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const hpSprite = new THREE.Sprite(spriteMat);
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
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, 128, 32);
        
        // Health
        const hpPercent = enemy.userData.hp / enemy.userData.maxHp;
        ctx.fillStyle = hpPercent > 0.4 ? '#22c55e' : '#ef4444'; // Green or Red
        ctx.fillRect(2, 2, 124 * hpPercent, 28);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, 128, 32);
        
        enemy.userData.hpTexture.needsUpdate = true;
    }

    spawnEnemy() {
        if (this.enemies.length >= this.maxEnemies) return;
        
        // 20% chance to spawn boss, or if score is high enough (mock random)
        const isBoss = Math.random() < 0.2;

        const enemy = this.createVoraxMesh(isBoss);
        
        // Spawn randomly around the player but not too close
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
        enemy.userData.knockback = new THREE.Vector3();
        enemy.userData.iFrames = 0; // Enemy i-frames
        
        this.updateHealthBar(enemy);
        
        this.scene.add(enemy);
        this.enemies.push(enemy);
    }

    update(delta) {
        // Spawning logic
        this.spawnTimer += delta;
        if (this.spawnTimer > this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnEnemy();
        }

        const speed = 4.0;
        const playerPos = this.player.position;

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (enemy.userData.isDead) continue;
            
            // Decrease I-frames
            if (enemy.userData.iFrames > 0) {
                enemy.userData.iFrames -= delta;
                enemy.visible = Math.floor(enemy.userData.iFrames * 20) % 2 === 0;
                if (enemy.userData.iFrames <= 0) enemy.visible = true;
            }

            // Move towards player
            const direction = new THREE.Vector3();
            direction.subVectors(playerPos, enemy.position);
            direction.y = 0; // Ignore height difference
            const dist = direction.length();
            
            const hitDistance = enemy.userData.isBoss ? 2.5 : 1.2;
            const enemySpeed = enemy.userData.isBoss ? speed * 0.7 : speed;
            
            // Apply knockback if any
            if (enemy.userData.knockback.lengthSq() > 0.01) {
                enemy.position.addScaledVector(enemy.userData.knockback, delta);
                enemy.userData.knockback.lerp(new THREE.Vector3(0,0,0), 10 * delta); // Friction
            } else if (dist > hitDistance) {
                direction.normalize();
                enemy.position.addScaledVector(direction, enemySpeed * delta);
                // Look at player
                enemy.lookAt(playerPos.x, enemy.position.y, playerPos.z);
                // Since the model's face (eyes) are on the -Z axis, we need to flip it 180 degrees
                enemy.rotateY(Math.PI);

                // Walk animation
                enemy.userData.walkTime += delta * 15 * (enemy.userData.isBoss ? 0.7 : 1.0);
                const swing = Math.sin(enemy.userData.walkTime);
                enemy.userData.leftLeg.rotation.x = swing * 0.5;
                enemy.userData.rightLeg.rotation.x = -swing * 0.5;
                enemy.userData.leftArm.rotation.x = -swing * 0.5;
                enemy.userData.rightArm.rotation.x = swing * 0.5;
            } else {
                // Close enough to hit player
                if (this.onPlayerHit) {
                    this.onPlayerHit();
                }
            }

            // Check hit from Player Ultimate (K)
            if (this.player.isUltimate && enemy.userData.iFrames <= 0) {
                if (dist < 8.0) { // AOE radius
                    enemy.userData.hp -= 3; // Instant kill or heavy damage
                    this.updateHealthBar(enemy);
                    enemy.userData.iFrames = 1.0;
                    
                    // Heavy Knockback
                    const kbDir = new THREE.Vector3().subVectors(enemy.position, playerPos).normalize();
                    kbDir.y = 0;
                    enemy.userData.knockback.copy(kbDir).multiplyScalar(30);
                    
                    if (enemy.userData.hp <= 0) {
                        this.killEnemy(enemy, i);
                        continue; // Skip further checks for this enemy
                    }
                }
            }

            // Check hit from Player Sword / Claw (J)
            if (this.player.isAttacking && enemy.userData.iFrames <= 0) {
                const enemyBox = new THREE.Box3().setFromObject(enemy);
                if (this.player.attackBox.intersectsBox(enemyBox)) {
                    // Enemy got hit!
                    enemy.userData.hp -= 1;
                    this.updateHealthBar(enemy);
                    enemy.userData.iFrames = 0.5; // Half second invulnerability
                    
                    // Knockback
                    const kbDir = new THREE.Vector3().subVectors(enemy.position, playerPos).normalize();
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
        
        // Death animation / Fly away
        const flyDir = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            15,
            (Math.random() - 0.5) * 10
        );
        
        let rotSpeed = (Math.random() - 0.5) * 20;
        
        const startTime = Date.now();
        const animateDeath = () => {
            const now = Date.now();
            const elapsed = (now - startTime) / 1000;
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
        
        // Give player score for killing enemy
        if (this.onEnemyKilled) {
             const score = enemy.userData.isBoss ? 50 : 5;
             this.onEnemyKilled(score);
        }
    }

    reset() {
        // Clear all enemies
        for (let enemy of this.enemies) {
            this.scene.remove(enemy);
        }
        this.enemies = [];
        this.spawnTimer = 0;
        
        this.spawnEnemy();
        this.spawnEnemy();
    }
}
