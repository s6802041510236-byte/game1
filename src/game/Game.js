import * as THREE from 'three';
import { Environment } from './Environment.js';
import { Player } from './Player.js';
import { EnemyManager } from './EnemyManager.js';
import { QuizManager } from './QuizManager.js';

export class Game {
    constructor(container) {
        this.container = container;
        this.clock = new THREE.Clock();
        this.isGameOver = false;
        this.isRunning = false;
        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Environment (Part 1)
        this.environment = new Environment(this.scene);
        
        // Player (Part 2)
        this.player = new Player(this.scene, this.camera, this.environment);

        // Enemies (Part 3)
        this.enemyManager = new EnemyManager(
            this.scene, 
            this.player, 
            () => this.onPlayerHit(),
            (pts) => this.addScore(pts)
        );

        // Resize Event
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    
    setUI(uiManager) {
        this.ui = uiManager;
        
        // Quiz Manager (Part 5)
        this.quizManager = new QuizManager(this.scene, this.player, this.ui);
    }
    
    start(playerName) {
        this.isGameOver = false;
        
        // Reset Player position and name
        if (this.player) {
            this.player.position.set(0, 0, 0);
            this.player.velocity.set(0, 0, 0);
            // Replace Name Tag
            this.player.initNameTag(playerName);
        }
        
        // Reset Enemies
        if (this.enemyManager) {
            this.enemyManager.reset();
        }
        
        // Start Quiz
        if (this.quizManager) {
            this.quizManager.startNewGame();
        }
        
        // Ensure rendering loop is running
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }
    
    gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        // Unlock pointer
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        
        if (this.ui) {
            this.ui.showGameOver();
        }
    }
    
    onPlayerHit() {
        if (!this.player || this.player.isInvincible || this.isGameOver || !this.isRunning) return;
        
        // Grant i-frames
        this.player.isInvincible = true;
        this.player.invincibleTimer = 0;
        
        if (this.ui) {
            this.ui.playerData.lives -= 1;
            this.ui.updateHUD();
            
            // Screen flash red effect
            const uiLayer = document.getElementById('ui-layer');
            const flash = document.createElement('div');
            flash.className = 'absolute inset-0 bg-red-500/50 pointer-events-none z-50 transition-opacity duration-300';
            uiLayer.appendChild(flash);
            setTimeout(() => {
                flash.style.opacity = '0';
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
        
        // Hide Game Over UI
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
        
        // Reset Player position
        this.player.position.set(0, 0, 0);
        this.player.velocity.set(0, 0, 0);
        
        // Reset Enemies
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
            // Update logic
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
                
                // Check Portal collision
                if (this.environment.portal) {
                    const dist = this.player.position.distanceTo(this.environment.portal.position);
                    if (dist < 2.0) {
                        this.enterPortal();
                    }
                }
            }
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    enterPortal() {
        // Flash screen white
        const uiLayer = document.getElementById('ui-layer');
        const flash = document.createElement('div');
        const newLevel = this.environment.currentLevel + 1;
        flash.className = 'absolute inset-0 bg-white pointer-events-none z-50 transition-opacity duration-1000 flex items-center justify-center';
        flash.innerHTML = `<h1 class="text-6xl md:text-8xl font-black text-black drop-shadow-lg tracking-widest uppercase">LEVEL ${newLevel}</h1>`;
        uiLayer.appendChild(flash);
        
        // Remove portal
        this.environment.removePortal();
        
        // Level up
        this.environment.setLevel(newLevel);
        
        // Reset player pos
        this.player.position.set(0, 0, 0);
        this.player.velocity.set(0, 0, 0);
        
        // Reset enemies
        this.enemyManager.reset();
        
        // Resume QuizManager
        this.quizManager.onLevelUp();
        
        // Fade out flash
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => flash.remove(), 1000);
        }, 1500);
    }
}
