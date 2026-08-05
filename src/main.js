import './style.css'
import { Game } from './game/Game.js'
import { UIManager } from './ui/UIManager.js'

window.addEventListener('error', (event) => {
  document.body.innerHTML += `<div style="color: red; font-family: sans-serif; padding: 20px; background: white; z-index: 9999; position: absolute; top:0; left:0;"><h1>Global Error</h1><pre>${event.error?.stack || event.message}</pre></div>`;
});

document.addEventListener('DOMContentLoaded', () => {
  try {
    const container = document.getElementById('game-container');
    const game = new Game(container);
    const ui = new UIManager(game);
    
    // Link UI to Game so Game can trigger Game Over / Result screens
    game.setUI(ui);
    
    // Default to Start page
    ui.showPage('start');
    
    window.game = game;
    window.ui = ui;
  } catch (error) {
    console.error(error);
    document.body.innerHTML = `<div style="color: red; font-family: sans-serif; padding: 20px; background: white; z-index: 9999; position: absolute; top:0; left:0;"><h1>Error</h1><pre>${error.stack}</pre></div>`;
  }
});

