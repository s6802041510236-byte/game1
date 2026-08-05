import * as THREE from 'three';
import questionsData from '../data/questions.js';

export class QuizManager {
    constructor(scene, player, uiManager) {
        this.scene = scene;
        this.player = player;
        this.ui = uiManager;
        
        this.allQuestions = questionsData;
        this.activeQuestions = [];
        this.boxes = [];
        
        this.boxGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        this.boxMat = new THREE.MeshStandardMaterial({ 
            color: 0xfacc15, // Yellow
            emissive: 0xfacc15,
            emissiveIntensity: 0.5
        });

        this.currentQuestionIndex = 0;
        this.isQuizActive = false;
        
        // Prepare DOM elements
        this.quizContainer = document.getElementById('quiz-container');
    }

    startNewGame() {
        // Pick 15 random questions
        this.activeQuestions = [...this.allQuestions]
            .sort(() => 0.5 - Math.random())
            .slice(0, 15);
            
        this.ui.playerData.maxProgress = 15;
        this.ui.playerData.progress = 0;
        this.ui.playerData.correctCount = 0;
        this.ui.playerData.wrongCount = 0;
        this.ui.updateHUD();
        
        this.spawnBoxes();
    }

    spawnBoxes() {
        // Remove old boxes
        for (let box of this.boxes) {
            this.scene.remove(box);
        }
        this.boxes = [];

        // Spawn new boxes based on progress
        // Only spawn 1 box at a time to force sequential answering, or spawn all?
        // Let's spawn 3 boxes around the map. When one is collected, spawn another until 10 are answered.
        this.spawnSingleBox();
        this.spawnSingleBox();
        this.spawnSingleBox();
    }
    
    spawnSingleBox() {
        if (this.boxes.length + this.ui.playerData.progress >= this.activeQuestions.length) {
            return; // No more questions to spawn
        }
        
        const box = new THREE.Mesh(this.boxGeo, this.boxMat);
        
        // Random position, far from player initially
        let angle = Math.random() * Math.PI * 2;
        let distance = 15 + Math.random() * 30;
        
        box.position.x = this.player.position.x + Math.cos(angle) * distance;
        box.position.z = this.player.position.z + Math.sin(angle) * distance;
        box.position.y = 1.5;
        
        // Add a floating animation data
        box.userData = {
            baseY: 1.5,
            time: Math.random() * 10,
            questionData: this.activeQuestions[this.boxes.length + this.ui.playerData.progress]
        };
        
        this.scene.add(box);
        this.boxes.push(box);
    }

    update(delta) {
        if (this.isQuizActive) return; // Pause game during quiz

        // Animate boxes and check collision
        for (let i = this.boxes.length - 1; i >= 0; i--) {
            const box = this.boxes[i];
            
            // Float & Rotate
            box.userData.time += delta * 2;
            box.position.y = box.userData.baseY + Math.sin(box.userData.time) * 0.5;
            box.rotation.x += delta;
            box.rotation.y += delta;
            
            // Collision with player
            const dist = this.player.position.distanceTo(box.position);
            if (dist < 2.0) {
                // Hit box!
                const qData = box.userData.questionData;
                this.scene.remove(box);
                this.boxes.splice(i, 1);
                
                this.triggerQuiz(qData);
                break; // Only trigger one at a time
            }
        }
    }

    triggerQuiz(questionData) {
        this.isQuizActive = true;
        this.gameWasRunning = this.ui.game.isRunning;
        this.ui.game.isRunning = false; // Pause 3D game update
        
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        
        this.ui.showPage('quiz');
        this.renderQuestion(questionData);
    }
    
    escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
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
                <button id="btn-quiz-continue" class="px-10 py-3 bg-cyan-500 text-gray-900 font-bold rounded-lg hover:bg-cyan-400 transition-all text-xl shadow-[0_0_15px_rgba(34,211,238,0.5)]">ทำภารกิจต่อ</button>
            </div>
        `;
        
        this.quizContainer.innerHTML = html;
        
        // Add listeners
        const btns = this.quizContainer.querySelectorAll('.quiz-opt-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.quizContainer.querySelector('#quiz-feedback').classList.contains('hidden') === false) return; // already answered
                
                const chosenIdx = parseInt(e.currentTarget.getAttribute('data-idx'));
                this.handleAnswer(qData, chosenIdx, btns, e.currentTarget);
            });
        });
    }

    handleAnswer(qData, chosenIdx, allBtns, clickedBtn) {
        const isCorrect = (chosenIdx === qData.answer);
        
        // Disable buttons
        allBtns.forEach(b => b.classList.add('opacity-50', 'cursor-not-allowed'));
        clickedBtn.classList.remove('opacity-50');
        
        const feedback = this.quizContainer.querySelector('#quiz-feedback');
        const feedbackTitle = this.quizContainer.querySelector('#feedback-title');
        const feedbackDesc = this.quizContainer.querySelector('#feedback-desc');
        
        feedback.classList.remove('hidden');
        feedback.classList.add('flex');
        
        if (isCorrect) {
            // Correct
            clickedBtn.classList.replace('border-gray-700', 'border-green-500');
            clickedBtn.classList.replace('bg-gray-800', 'bg-green-900/50');
            
            feedbackTitle.innerText = "ถูกต้อง! 🎉";
            feedbackTitle.className = "text-3xl font-black mb-2 text-green-400";
            feedbackDesc.innerText = qData.explanation;
            
            this.ui.playerData.score += qData.score;
            this.ui.playerData.correctCount++;
        } else {
            // Wrong
            clickedBtn.classList.replace('border-gray-700', 'border-red-500');
            clickedBtn.classList.replace('bg-gray-800', 'bg-red-900/50');
            
            // Highlight correct one
            allBtns[qData.answer].classList.remove('opacity-50');
            allBtns[qData.answer].classList.replace('border-gray-700', 'border-green-500');
            allBtns[qData.answer].classList.replace('bg-gray-800', 'bg-green-900/50');

            feedbackTitle.innerText = "ผิดพลาด! ❌";
            feedbackTitle.className = "text-3xl font-black mb-2 text-red-500";
            
            const safeAnswer = this.escapeHTML(qData.options[qData.answer]);
            feedbackDesc.innerHTML = `<strong class="text-white">คำตอบที่ถูกคือ: ${safeAnswer}</strong><br><br>${this.escapeHTML(qData.explanation)}`;
            
            this.ui.playerData.lives -= 1;
            this.ui.playerData.wrongCount++;
        }
        
        this.ui.playerData.progress++;
        this.ui.updateHUD();
        
        document.getElementById('btn-quiz-continue').addEventListener('click', () => {
            this.resumeGame();
        });
    }

    resumeGame() {
        this.ui.showPage('gameHud');
        this.isQuizActive = false;
        this.ui.game.isRunning = true;
        
        const p = this.ui.playerData.progress;
        
        if (this.ui.playerData.lives <= 0) {
            this.ui.game.gameOver();
        } else if (p >= this.ui.playerData.maxProgress) {
            // Victory
            this.ui.game.isRunning = false;
            this.ui.showResult(true); // true = victory
        } else if (p === 5 || p === 10) {
            // Spawn Portal instead of new boxes
            const currentLevel = p === 5 ? 1 : 2;
            this.ui.game.environment.spawnPortal(new THREE.Vector3(0, 0, 0), currentLevel);
        } else {
            // Spawn new box if needed to maintain 3
            if (this.boxes.length < 3) {
                this.spawnSingleBox();
            }
        }
    }

    onLevelUp() {
        // Called by Game.js after entering portal
        while (this.boxes.length < 3) {
            this.spawnSingleBox();
        }
    }
}
