import * as THREE from 'three';

export class Player {
    constructor(scene, camera, environment) {
        this.scene = scene;
        this.camera = camera;
        this.environment = environment;
        
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.direction = new THREE.Vector3(0, 0, -1);
        
        this.speed = 10;
        this.rotationSpeed = 3;
        
        // Input state
        this.keys = { forward: false, backward: false, left: false, right: false };
        this.isPointerLocked = false;
        
        // Physics/Rotation
        this.yaw = 0;
        this.pitch = 0;

        this.walkTime = 0;
        
        // Combat
        this.isAttacking = false;
        this.isSkillJ = false;
        this.isUltimate = false;
        this.ultimateTimer = 0;
        
        this.attackTimer = 0;
        this.attackDuration = 0.3;
        this.attackBox = new THREE.Box3();
        
        this.isInvincible = false;
        this.invincibleTimer = 0;
        this.invincibleDuration = 2.0;
        
        // Cooldowns
        this.cdJ = 0;
        this.cdK = 0;
        this.cdShift = 0;
        
        // Dash
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashDuration = 0.2;
        
        // VFX
        this.particles = [];

        this.createMesh();
        this.initNameTag('Player 1');
        this.setupInputs();
    }

    createMesh() {
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);
        
        this.modelGroup = new THREE.Group();
        this.mesh.add(this.modelGroup);

        // Materials (Cat & Cloak)
        const furMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c }); // Tan/Cat color
        const cloakMat = new THREE.MeshStandardMaterial({ color: 0x4a5d23 }); // Green cloak
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 }); // Boots/Belt
        
        // Body (Cloak)
        const bodyGeo = new THREE.BoxGeometry(1, 1.2, 0.8);
        const body = new THREE.Mesh(bodyGeo, cloakMat);
        body.position.y = 1.4;
        body.castShadow = true;
        this.modelGroup.add(body);

        // Head (Cat)
        const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const head = new THREE.Mesh(headGeo, furMat);
        head.position.y = 2.4;
        head.castShadow = true;
        this.modelGroup.add(head);
        
        // Ears
        const earGeo = new THREE.BoxGeometry(0.3, 0.3, 0.1);
        const leftEar = new THREE.Mesh(earGeo, furMat);
        leftEar.position.set(-0.3, 2.9, 0);
        leftEar.rotation.z = Math.PI / 4;
        this.modelGroup.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeo, furMat);
        rightEar.position.set(0.3, 2.9, 0);
        rightEar.rotation.z = -Math.PI / 4;
        this.modelGroup.add(rightEar);
        
        // Tail
        const tailGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
        const tail = new THREE.Mesh(tailGeo, furMat);
        tail.position.set(0, 1.0, 0.5);
        tail.rotation.x = Math.PI / 6;
        this.modelGroup.add(tail);

        // Legs (Boots)
        const legGeo = new THREE.BoxGeometry(0.4, 0.8, 0.4);
        this.leftLeg = new THREE.Mesh(legGeo, darkMat);
        this.leftLeg.position.set(-0.3, 0.4, 0);
        this.leftLeg.castShadow = true;
        this.modelGroup.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(legGeo, darkMat);
        this.rightLeg.position.set(0.3, 0.4, 0);
        this.rightLeg.castShadow = true;
        this.modelGroup.add(this.rightLeg);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        this.leftArm = new THREE.Mesh(armGeo, cloakMat);
        this.leftArm.position.set(-0.7, 1.4, 0);
        this.leftArm.castShadow = true;
        this.modelGroup.add(this.leftArm);

        this.rightArm = new THREE.Mesh(armGeo, cloakMat);
        this.rightArm.position.set(0.7, 1.4, 0);
        this.rightArm.castShadow = true;
        this.modelGroup.add(this.rightArm);
        
        // Sword (attached to right arm)
        const swordGroup = new THREE.Group();
        
        const handleGeo = new THREE.BoxGeometry(0.1, 0.4, 0.1);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.position.y = -0.2;
        swordGroup.add(handle);
        
        const guardGeo = new THREE.BoxGeometry(0.4, 0.1, 0.2);
        const guardMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0 });
        const guard = new THREE.Mesh(guardGeo, guardMat);
        guard.position.y = 0;
        swordGroup.add(guard);
        
        const bladeGeo = new THREE.BoxGeometry(0.2, 1.2, 0.05);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.8, roughness: 0.2 });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.y = 0.65;
        blade.castShadow = true;
        swordGroup.add(blade);
        
        this.sword = swordGroup;
        // Adjust initial sword rotation to point forward
        this.sword.rotation.x = Math.PI / 2;
        this.sword.position.set(0, -0.4, 0.4);
        
        this.rightArm.add(this.sword);

        this.scene.add(this.mesh);

        // Camera Pivot (Third Person)
        this.cameraPivot = new THREE.Object3D();
        this.cameraPivot.position.set(0, 2, 0); // At head level
        this.mesh.add(this.cameraPivot);

        this.camera.position.set(0, 1, 5); // Behind and slightly up
        this.cameraPivot.add(this.camera);
        this.camera.lookAt(0, 1.6, 0);
    }

    initNameTag(name) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, 128, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        this.nameTag = new THREE.Sprite(material);
        this.nameTag.scale.set(3, 0.75, 1);
        this.nameTag.position.y = 2.5;
        this.mesh.add(this.nameTag);
    }

    setupInputs() {
        // Keyboard
        window.addEventListener('keydown', (e) => this.onKey(e, true));
        window.addEventListener('keyup', (e) => this.onKey(e, false));

        // Pointer Lock (Mouse)
        const container = document.getElementById('game-container');
        container.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                document.body.requestPointerLock();
            } else {
                // If locked, click is an attack
                this.triggerAttack();
            }
        });

        // Add mousedown for attack if not locked
        window.addEventListener('mousedown', () => {
            if (this.isPointerLocked) this.triggerAttack();
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === document.body;
            const crosshair = document.getElementById('crosshair');
            if (this.isPointerLocked) {
                crosshair.classList.remove('hidden');
            } else {
                crosshair.classList.add('hidden');
            }
        });

        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Simple Touch for mobile (Forward/Look)
        let touchStartX = 0;
        let touchStartY = 0;
        container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            this.keys.forward = true;
        }, {passive: true});
        
        container.addEventListener('touchmove', (e) => {
            const dx = e.touches[0].clientX - touchStartX;
            const dy = e.touches[0].clientY - touchStartY;
            this.yaw -= dx * 0.005;
            this.pitch -= dy * 0.005; // Reverted back to -=
            
            // Clamp pitch to avoid flipping
            this.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.pitch));
            
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, {passive: true});
        
        container.addEventListener('touchend', () => {
            this.keys.forward = false;
        }, {passive: true});
        // Keyboard
        window.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'KeyW': this.keys.forward = true; break;
                case 'KeyS': this.keys.backward = true; break;
                case 'KeyA': this.keys.left = true; break;
                case 'KeyD': this.keys.right = true; break;
                case 'ShiftLeft': 
                case 'ShiftRight':
                    this.triggerDash();
                    break;
                case 'KeyJ':
                    this.triggerSkillJ();
                    break;
                case 'KeyK':
                    this.triggerSkillK();
                    break;
            }
        });
    }

    onKey(event, isDown) {
        switch (event.code) {
            case 'KeyW': case 'ArrowUp': this.keys.forward = isDown; break;
            case 'KeyS': case 'ArrowDown': this.keys.backward = isDown; break;
            case 'KeyA': case 'ArrowLeft': this.keys.left = isDown; break;
            case 'KeyD': case 'ArrowRight': this.keys.right = isDown; break;
        }
    }

    onMouseMove(event) {
        if (!this.isPointerLocked) return;
        
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        const sensitivity = 0.002;
        this.yaw -= movementX * sensitivity;
        this.pitch -= movementY * sensitivity; // Reverted back to -= so Mouse UP -> Looks UP

        // Clamp pitch to avoid flipping
        this.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.pitch));
    }

    triggerAttack() {
        if (!this.isAttacking && !this.isUltimate) {
            this.isAttacking = true;
            this.isSkillJ = false;
            this.attackTimer = 0;
            
            // Initial swing state
            this.rightArm.rotation.x = -Math.PI / 2; // Arm up
        }
    }
    
    triggerSkillJ() {
        if (this.cdJ <= 0 && !this.isAttacking && !this.isUltimate) {
            this.isAttacking = true;
            this.isSkillJ = true;
            this.attackTimer = 0;
            this.cdJ = 5; // 5 seconds cooldown
            
            this.rightArm.rotation.x = -Math.PI / 2;
            this.leftArm.rotation.x = -Math.PI / 2;
            
            // Claw VFX
            const clawVFX = new THREE.Group();
            const mat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.8 });
            for(let i=0; i<3; i++) {
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2, 0.1), mat);
                mesh.position.set(i*0.5 - 0.5, 0, 0);
                mesh.rotation.z = Math.PI / 4;
                clawVFX.add(mesh);
            }
            
            // Position in front of player
            const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, this.yaw, 0));
            clawVFX.position.copy(this.position).addScaledVector(forward, 1.5);
            clawVFX.position.y = 1.5;
            clawVFX.rotation.y = this.yaw;
            
            this.scene.add(clawVFX);
            this.particles.push({ mesh: clawVFX, life: 0.3, maxLife: 0.3, type: 'fade' });
        }
    }
    
    triggerSkillK() {
        if (this.cdK <= 0 && !this.isUltimate) {
            this.isUltimate = true;
            this.ultimateTimer = 0;
            this.cdK = 20; // 20 seconds cooldown
            this.isAttacking = false;
            
            // Spin animation prep
            this.rightArm.rotation.x = -Math.PI / 2;
            
            // Ultimate VFX
            const auraGeo = new THREE.TorusGeometry(1, 0.2, 8, 24);
            const auraMat = new THREE.MeshBasicMaterial({ color: 0xaa00ff, transparent: true, opacity: 0.8 });
            const aura = new THREE.Mesh(auraGeo, auraMat);
            aura.position.copy(this.position);
            aura.position.y = 0.5;
            aura.rotation.x = Math.PI / 2;
            this.scene.add(aura);
            this.particles.push({ mesh: aura, life: 1.0, maxLife: 1.0, type: 'expand' });
        }
    }
    
    triggerDash() {
        if (this.cdShift <= 0 && !this.isDashing) {
            this.isDashing = true;
            this.dashTimer = 0;
            this.cdShift = 2; // 2 seconds cooldown
        }
    }

    updateCooldownUI(id, cd) {
        const overlay = document.getElementById(`cd-${id}`);
        const text = document.getElementById(`cd-${id}-text`);
        if (overlay) {
            if (cd > 0) {
                overlay.classList.remove('hidden');
                if (text) text.innerText = Math.ceil(cd);
            } else {
                overlay.classList.add('hidden');
            }
        }
    }

    update(delta) {
        // Handle rotation
        this.mesh.rotation.y = this.yaw;
        this.cameraPivot.rotation.x = this.pitch;

        // Handle movement
        const moveDir = new THREE.Vector3();
        if (this.keys.forward) moveDir.z -= 1;
        if (this.keys.backward) moveDir.z += 1;
        if (this.keys.left) moveDir.x -= 1;
        if (this.keys.right) moveDir.x += 1;

        if (this.isDashing && moveDir.lengthSq() < 0.01) {
            // Default dash forward if no keys pressed
            moveDir.z = -1;
        }

        moveDir.normalize();
        let currentSpeed = this.speed;
        
        // Dash Logic
        if (this.isDashing) {
            currentSpeed = this.speed * 3.5;
            this.dashTimer += delta;
            if (this.dashTimer >= this.dashDuration) {
                this.isDashing = false;
            }
            
            // Dash VFX (Trail)
            if (Math.random() > 0.5) {
                const trailGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                const trailMat = new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.5 });
                const trail = new THREE.Mesh(trailGeo, trailMat);
                trail.position.copy(this.position);
                trail.position.y = 1.0;
                trail.position.x += (Math.random() - 0.5) * 0.5;
                trail.position.z += (Math.random() - 0.5) * 0.5;
                this.scene.add(trail);
                this.particles.push({ mesh: trail, life: 0.2, maxLife: 0.2, type: 'shrink' });
            }
        }
        
        // Apply rotation to movement direction
        moveDir.applyEuler(new THREE.Euler(0, this.yaw, 0));

        let isMoving = moveDir.lengthSq() > 0.01 || this.isDashing;

        if (isMoving) {
            // Collision Detection with Environment
            const nextPosX = this.position.clone();
            nextPosX.x += moveDir.x * currentSpeed * delta;
            
            const nextPosZ = this.position.clone();
            nextPosZ.z += moveDir.z * currentSpeed * delta;

            let canMoveX = true;
            let canMoveZ = true;

            const boxX = new THREE.Box3().setFromCenterAndSize(nextPosX, new THREE.Vector3(1, 2, 1));
            const boxZ = new THREE.Box3().setFromCenterAndSize(nextPosZ, new THREE.Vector3(1, 2, 1));

            if (this.environment && this.environment.colliders) {
                // Expand bounds slightly to avoid getting stuck
                boxX.expandByScalar(0.2);
                boxZ.expandByScalar(0.2);
                
                for (let box of this.environment.colliders) {
                    if (boxX.intersectsBox(box)) canMoveX = false;
                    if (boxZ.intersectsBox(box)) canMoveZ = false;
                }
            }
            
            // World Bounds (-100 to 100)
            if (nextPosX.x < -98 || nextPosX.x > 98) canMoveX = false;
            if (nextPosZ.z < -98 || nextPosZ.z > 98) canMoveZ = false;

            if (canMoveX) this.position.x = nextPosX.x;
            if (canMoveZ) this.position.z = nextPosZ.z;

            // Walking Animation (only if not attacking)
            if (!this.isAttacking) {
                this.walkTime += delta * 15;
                const swing = Math.sin(this.walkTime);
                
                this.leftLeg.rotation.x = swing * 0.5;
                this.rightLeg.rotation.x = -swing * 0.5;
                this.leftArm.rotation.x = -swing * 0.5;
                this.rightArm.rotation.x = swing * 0.5;
            }
        } else if (!this.isAttacking && !this.isUltimate) {
            // Reset limbs
            this.walkTime = 0;
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
            this.leftArm.rotation.x = 0;
            this.rightArm.rotation.x = 0;
        }

        // Ultimate (K) Animation
        if (this.isUltimate) {
            this.ultimateTimer += delta;
            const duration = 1.0;
            
            // Spin around rapidly
            this.modelGroup.rotation.y += Math.PI * 8 * delta; 
            this.rightArm.rotation.x = -Math.PI / 2; // Keep sword up
            
            // Bounding box for AOE is handled in EnemyManager checking isUltimate
            
            if (this.ultimateTimer >= duration) {
                this.isUltimate = false;
                this.rightArm.rotation.x = 0;
                this.modelGroup.rotation.y = 0; // reset rotation
            }
        }

        // Attack Animation & Logic
        if (this.isAttacking) {
            this.attackTimer += delta;
            
            // Swing from -PI/2 to PI/4
            const progress = this.attackTimer / this.attackDuration;
            this.rightArm.rotation.x = -Math.PI/2 + (progress * Math.PI * 0.8);
            
            if (this.isSkillJ) {
                this.leftArm.rotation.x = -Math.PI/2 + (progress * Math.PI * 0.8);
            }
            
            // Calculate Attack Hitbox (in front of player)
            const attackCenter = this.position.clone();
            const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, this.yaw, 0));
            attackCenter.addScaledVector(forward, 1.5);
            
            const boxSize = this.isSkillJ ? new THREE.Vector3(4, 2, 4) : new THREE.Vector3(2, 2, 2);
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
        
        // Update Cooldowns
        if (this.cdJ > 0) this.cdJ -= delta;
        if (this.cdK > 0) this.cdK -= delta;
        if (this.cdShift > 0) this.cdShift -= delta;
        
        this.updateCooldownUI('j', this.cdJ);
        this.updateCooldownUI('k', this.cdK);
        this.updateCooldownUI('shift', this.cdShift);
        
        // I-Frames Logic
        if (this.isInvincible) {
            this.invincibleTimer += delta;
            
            // Blinking effect
            this.mesh.visible = Math.floor(this.invincibleTimer * 10) % 2 === 0;
            
            if (this.invincibleTimer >= this.invincibleDuration) {
                this.isInvincible = false;
                this.mesh.visible = true;
            }
        }
        
        // Process Particles (VFX)
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.life -= delta;
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
                continue;
            }
            
            const progress = p.life / p.maxLife;
            if (p.type === 'fade') {
                p.mesh.children.forEach(c => c.material.opacity = progress * 0.8);
            } else if (p.type === 'expand') {
                const scale = 1 + (1 - progress) * 10;
                p.mesh.scale.set(scale, scale, scale);
                p.mesh.material.opacity = progress * 0.8;
            } else if (p.type === 'shrink') {
                p.mesh.scale.setScalar(progress);
                p.mesh.material.opacity = progress * 0.5;
            }
        }

        // Keep above ground
        this.position.y = 0;
        
        this.mesh.position.copy(this.position);
    }
}
