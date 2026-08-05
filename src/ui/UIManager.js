export class UIManager {
    constructor(game) {
        this.game = game; // Reference to main Game object
        
        // Pages
        this.pages = {
            start: document.getElementById('page-start'),
            login: document.getElementById('page-login'),
            register: document.getElementById('page-register'),
            tutorial: document.getElementById('page-tutorial'),
            gameHud: document.getElementById('page-game-hud'),
            quiz: document.getElementById('page-quiz'),
            result: document.getElementById('page-result'),
            gameOver: document.getElementById('game-over-screen'),
            dashboard: document.getElementById('page-dashboard')
        };

        // Inputs
        this.inputs = {
            id: document.getElementById('input-id'),
            name: document.getElementById('input-name'),
            class: document.getElementById('input-class'),
            nickname: document.getElementById('input-nickname'),
            password: document.getElementById('input-password'),
            loginId: document.getElementById('login-id'),
            loginPassword: document.getElementById('login-password')
        };
        
        // Player Data
        this.playerData = {
            id: '',
            name: '',
            class: '',
            nickname: 'Player',
            score: 0,
            lives: 3,
            progress: 0,
            maxProgress: 10,
            startTime: 0,
            endTime: 0
        };

        this.setupEventListeners();
        this.updateAuthUI(); // Check session on load
    }

    updateAuthUI() {
        const sessionStr = localStorage.getItem('cyberVoxelSession');
        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            if (session && session.id) {
                document.getElementById('guest-buttons').classList.add('hidden');
                document.getElementById('user-buttons').classList.remove('hidden');
                document.getElementById('start-welcome-name').innerText = session.nickname;
                
                // Load into playerData
                this.playerData.id = session.id;
                this.playerData.name = session.name;
                this.playerData.class = session.class;
                this.playerData.nickname = session.nickname;
                return;
            }
        }
        
        document.getElementById('guest-buttons').classList.remove('hidden');
        document.getElementById('user-buttons').classList.add('hidden');
    }

    setupEventListeners() {
        // Start Page Buttons
        document.getElementById('btn-goto-login')?.addEventListener('click', () => {
            this.showPage('login');
        });
        document.getElementById('btn-goto-register')?.addEventListener('click', () => {
            this.showPage('register');
        });
        document.getElementById('btn-start-game-direct')?.addEventListener('click', () => {
            this.startGame();
        });
        document.getElementById('btn-logout')?.addEventListener('click', () => {
            this.doLogout();
        });

        document.getElementById('btn-goto-tutorial')?.addEventListener('click', () => {
            this.showPage('tutorial');
        });
        document.getElementById('btn-goto-dashboard')?.addEventListener('click', () => {
            this.updateDashboard();
            this.showPage('dashboard');
        });
        
        document.getElementById('btn-dash-back')?.addEventListener('click', () => {
            this.updateAuthUI();
            this.showPage('start');
        });

        // Login Page Buttons
        document.getElementById('btn-back-to-start-from-login')?.addEventListener('click', () => {
            this.showPage('start');
        });
        document.getElementById('btn-do-login')?.addEventListener('click', () => {
            this.doLogin();
        });

        // Register Page Buttons
        document.getElementById('btn-back-to-start')?.addEventListener('click', () => {
            this.showPage('start');
        });
        document.getElementById('btn-start-game')?.addEventListener('click', () => {
            this.registerUser();
        });

        // Tutorial Page
        document.getElementById('btn-tutorial-back')?.addEventListener('click', () => {
            this.updateAuthUI();
            this.showPage('start');
        });
        
        // Result Page
        document.getElementById('btn-result-restart')?.addEventListener('click', () => {
            this.startGame(); // Starts immediately since session exists
        });
        document.getElementById('btn-result-home')?.addEventListener('click', () => {
            this.updateAuthUI();
            this.showPage('start');
        });
    }

    showPage(pageName) {
        // Hide all
        for (let key in this.pages) {
            if (this.pages[key]) {
                this.pages[key].classList.add('hidden');
            }
        }
        // Show target
        if (this.pages[pageName]) {
            this.pages[pageName].classList.remove('hidden');
        }
    }

    doLogin() {
        const id = this.inputs.loginId.value.trim();
        const password = this.inputs.loginPassword.value.trim();
        const errorEl = document.getElementById('login-error');

        if (!id || !password) {
            errorEl.classList.remove('hidden');
            errorEl.innerText = "กรุณากรอกไอดีและรหัสผ่าน!";
            return;
        }

        let users = JSON.parse(localStorage.getItem('cyberVoxelUsers') || '[]');
        const user = users.find(u => u.id === id && u.password === password);

        if (user) {
            errorEl.classList.add('hidden');
            // Create Session
            localStorage.setItem('cyberVoxelSession', JSON.stringify({
                id: user.id,
                name: user.name,
                class: user.class,
                nickname: user.nickname
            }));
            
            // Clear inputs
            this.inputs.loginId.value = '';
            this.inputs.loginPassword.value = '';
            
            this.updateAuthUI();
            this.showPage('start');
        } else {
            errorEl.classList.remove('hidden');
            errorEl.innerText = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!";
        }
    }

    doLogout() {
        localStorage.removeItem('cyberVoxelSession');
        this.updateAuthUI();
    }

    registerUser() {
        const id = this.inputs.id.value.trim();
        const name = this.inputs.name.value.trim();
        const cls = this.inputs.class.value.trim();
        const nickname = this.inputs.nickname.value.trim();
        const password = this.inputs.password.value.trim();
        const errorEl = document.getElementById('register-error');
        const successEl = document.getElementById('register-success');

        if (!id || !name || !cls || !nickname || !password) {
            errorEl.classList.remove('hidden');
            errorEl.innerText = "กรุณากรอกข้อมูลให้ครบถ้วน!";
            return;
        }

        let users = JSON.parse(localStorage.getItem('cyberVoxelUsers') || '[]');
        
        // Check duplicate
        if (users.find(u => u.id === id)) {
            errorEl.classList.remove('hidden');
            errorEl.innerText = "ไอดีนี้มีคนใช้สมัครไปแล้ว!";
            return;
        }

        errorEl.classList.add('hidden');
        successEl.classList.remove('hidden');

        // Register User
        const newUser = { id, name, class: cls, nickname, password };
        users.push(newUser);
        localStorage.setItem('cyberVoxelUsers', JSON.stringify(users));

        // Create Session
        localStorage.setItem('cyberVoxelSession', JSON.stringify({
            id: newUser.id,
            name: newUser.name,
            class: newUser.class,
            nickname: newUser.nickname
        }));

        setTimeout(() => {
            successEl.classList.add('hidden');
            this.updateAuthUI();
            this.showPage('start');
        }, 1500);
    }

    startGame() {
        this.showPage('gameHud');
        
        // Reset player stats
        this.playerData.score = 0;
        this.playerData.lives = 3;
        this.playerData.progress = 0;
        this.playerData.startTime = Date.now();
        
        this.updateHUD();

        // Tell Game engine to start
        if (this.game) {
            this.game.start(this.playerData.nickname);
        }
    }

    updateHUD() {
        // Lives
        const livesEl = document.getElementById('hud-lives');
        if (livesEl) {
            livesEl.innerText = '❤️'.repeat(this.playerData.lives);
        }
        
        // Score
        const scoreEl = document.getElementById('hud-score');
        if (scoreEl) {
            scoreEl.innerText = this.playerData.score;
        }
        
        // Progress
        const progressText = document.getElementById('hud-progress-text');
        const progressBar = document.getElementById('hud-progress-bar');
        if (progressText && progressBar) {
            progressText.innerText = `${this.playerData.progress}/${this.playerData.maxProgress}`;
            const percent = (this.playerData.progress / this.playerData.maxProgress) * 100;
            progressBar.style.width = `${percent}%`;
        }
    }

    showGameOver() {
        this.showResult(false);
    }
    
    showResult(isVictory) {
        this.playerData.endTime = Date.now();
        this.showPage('result');
        
        // Calculate stats
        const timeTakenMs = this.playerData.endTime - this.playerData.startTime;
        const minutes = Math.floor(timeTakenMs / 60000);
        const seconds = Math.floor((timeTakenMs % 60000) / 1000);
        
        document.getElementById('result-title').innerText = isVictory ? "MISSION COMPLETE" : "MISSION FAILED";
        document.getElementById('result-title').className = isVictory 
            ? "text-6xl font-black text-cyan-400 mb-2 font-['Outfit'] drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" 
            : "text-6xl font-black text-red-500 mb-2 font-['Outfit'] drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]";
            
        document.getElementById('result-player-name').innerText = this.playerData.name;
        document.getElementById('result-score').innerText = this.playerData.score;
        document.getElementById('result-time').innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} นาที`;
        
        // Badge Logic
        let badge = "🥉 ผู้เริ่มต้น (Bronze)";
        let percentage = Math.round((this.playerData.correctCount / this.playerData.maxProgress) * 100);
        if (percentage >= 70) badge = "🥈 นักแก้ปัญหา (Silver)";
        if (percentage >= 90) badge = "🥇 ผู้เชี่ยวชาญ (Gold)";
        document.getElementById('result-badge').innerText = badge;
        document.getElementById('result-percent').innerText = `${percentage}%`;
        document.getElementById('result-correct').innerText = `${this.playerData.correctCount} ข้อ`;
        document.getElementById('result-wrong').innerText = `${this.playerData.wrongCount} ข้อ`;
        
        this.playerData.badge = badge;
        
        // Save Data
        this.saveData();
    }
    
    saveData() {
        // 1. Local Storage
        let leaderboard = JSON.parse(localStorage.getItem('cyberVoxelLeaderboard') || '[]');
        leaderboard.push(this.playerData);
        localStorage.setItem('cyberVoxelLeaderboard', JSON.stringify(leaderboard));
        
        // 2. Google Sheets Apps Script
        const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbzW6c8GP05l2ptmi-buYhP7AH2W__SpBJdnOXiIkWEjXVMD58wik4O8wPFWwu4N-14I/exec';
        
        fetch(appsScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(this.playerData)
        }).then(() => console.log('Data sent to Google Sheets (no-cors)'))
          .catch(err => console.error('Failed to send data', err));
    }

    updateDashboard() {
        let leaderboard = JSON.parse(localStorage.getItem('cyberVoxelLeaderboard') || '[]');
        
        document.getElementById('dash-total-players').innerText = leaderboard.length;
        
        if (leaderboard.length === 0) {
            document.getElementById('dash-avg-score').innerText = 0;
            document.getElementById('dash-max-score').innerText = 0;
            document.getElementById('dash-min-score').innerText = 0;
            document.getElementById('dash-leaderboard-body').innerHTML = `<tr><td colspan="4" class="py-4 text-center text-gray-500">ยังไม่มีข้อมูลผู้เล่น</td></tr>`;
            return;
        }
        
        let totalScore = 0;
        let maxScore = -1;
        let minScore = 999999;
        
        // Sort by score descending
        leaderboard.sort((a, b) => b.score - a.score);
        
        let html = '';
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
        
        document.getElementById('dash-avg-score').innerText = Math.round(totalScore / leaderboard.length);
        document.getElementById('dash-max-score').innerText = maxScore;
        document.getElementById('dash-min-score').innerText = minScore;
        document.getElementById('dash-leaderboard-body').innerHTML = html;
    }
}
