# Game

<!DOCTYPE html>
<html>
<head>
    <title>Neon Dodge: Rocket Edition</title>
    <style>
        body { margin: 0; background: #000; overflow: hidden; font-family: 'Segoe UI', sans-serif; cursor: none; }
        canvas { display: block; }
        
        .overlay {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            text-align: center; color: white; background: rgba(0, 0, 0, 0.9);
            padding: 40px; border-radius: 20px; border: 2px solid #00f2ff;
            box-shadow: 0 0 40px rgba(0, 242, 255, 0.3); z-index: 10; min-width: 350px; cursor: default;
        }

        h1 { font-size: 42px; margin-top: 0; text-shadow: 0 0 15px #00f2ff; margin-bottom: 10px; }
        
        .instruction-grid { display: grid; grid-template-columns: auto 1fr; gap: 15px 20px; margin: 30px 0; text-align: left; align-items: center; }
        .key-icon { width: 30px; height: 30px; display: inline-block; border-radius: 4px; text-align: center; line-height: 30px; font-weight: bold;}
        .desc { font-size: 18px; }

        button {
            background: transparent; color: #00f2ff; border: 2px solid #00f2ff; padding: 15px 50px;
            font-size: 22px; cursor: pointer; border-radius: 50px;
            font-weight: 900; transition: 0.2s; margin-top: 20px; text-transform: uppercase;
            box-shadow: 0 0 15px rgba(0, 242, 255, 0.3);
        }
        button:hover { background: #00f2ff; color: #000; box-shadow: 0 0 30px rgba(0, 242, 255, 0.8); }
    </style>
</head>
<body>

    <div id="start-screen" class="overlay">
        <h1>NEON DODGE</h1>
        <p style="font-style: italic; color: #aaa;">Pilot the ship. Survive the fall.</p>
        <div class="instruction-grid">
            <div class="key-icon" style="background: #333;">🖱️</div><div class="desc">Move Mouse to Pilot</div>
            <div class="key-icon" style="background: #ff0055;">🛑</div><div class="desc">Avoid Red Pillars</div>
            <div class="key-icon" style="background: #00ff88; color: #000;">🛡️</div><div class="desc">Green = Shield</div>
            <div class="key-icon" style="background: #ffcc00; color: #000;">⏬</div><div class="desc">Gold = Shrink Ship</div>
        </div>
        <button onclick="startGame()">LAUNCH MISSION</button>
    </div>

    <div id="game-over-screen" class="overlay" style="display: none;">
        <h1 style="color: #ff0055; text-shadow: 0 0 15px #ff0055;">SHIP DESTROYED</h1>
        <p id="final-stats" style="font-size: 24px; margin: 30px 0;"></p>
        <button style="border-color: #ff0055; color: #ff0055; box-shadow: 0 0 15px rgba(255, 0, 85, 0.3);" 
                onmouseover="this.style.background='#ff0055'; this.style.color='#000';" 
                onmouseout="this.style.background='transparent'; this.style.color='#ff0055';"
                onclick="startGame()">RELAUNCH</button>
    </div>

    <canvas id="gameCanvas"></canvas>

<script>
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const finalStats = document.getElementById("final-stats");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let player, obstacles, powerups, score, isPlaying, gameSpeed;
let highscore = localStorage.getItem("neonDodgeHighscore") || 0;

function startGame() {
    startScreen.style.display = "none";
    gameOverScreen.style.display = "none";
    
    player = { 
        x: canvas.width / 2, y: canvas.height - 150, 
        w: 40, h: 80, baseW: 40, baseH: 80,
        color: "#00f2ff", shield: false, shrinkTimer: 0 
    };
    
    obstacles = [];
    powerups = [];
    score = 0;
    isPlaying = true;
    gameSpeed = 4;
    animate();
}

canvas.addEventListener("mousemove", (e) => {
    if(!isPlaying) return;
    player.x = e.clientX - player.w / 2;
});

function spawnEntity() {
    const chance = Math.random();
    if (chance < 0.08) { 
        let width = Math.random() * 40 + 30;
        let height = Math.random() * 80 + 80; 
        obstacles.push({
            x: Math.random() * (canvas.width - width),
            y: -height, w: width, h: height, speed: Math.random() * 2 + gameSpeed
        });
    } else if (chance < 0.01) { 
        powerups.push({
            x: Math.random() * (canvas.width - 30),
            y: -30, w: 30, h: 30,
            type: Math.random() > 0.5 ? 'shield' : 'shrink',
            speed: gameSpeed
        });
    }
}

function update() {
    if (!isPlaying) return;

    if (player.shrinkTimer > 0) {
        player.shrinkTimer--;
        player.w = player.baseW / 2;
        player.h = player.baseH / 2;
    } else {
        player.w = player.baseW;
        player.h = player.baseH;
    }

    obstacles.forEach((obs, i) => {
        obs.y += obs.speed;
        if (rectIntersect(player, obs)) {
            if (player.shield) {
                player.shield = false;
                obstacles.splice(i, 1);
            } else {
                endGame();
            }
        }
        if (obs.y > canvas.height) {
            obstacles.splice(i, 1);
            score++;
            if (score % 15 === 0) gameSpeed += 0.3;
        }
    });

    powerups.forEach((p, i) => {
        p.y += p.speed;
        if (rectIntersect(player, p)) {
            if (p.type === 'shield') player.shield = true;
            if (p.type === 'shrink') player.shrinkTimer = 300;
            powerups.splice(i, 1);
        }
        if (p.y > canvas.height) powerups.splice(i, 1);
    });

    spawnEntity();
}

function rectIntersect(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}

function endGame() {
    isPlaying = false;
    if (score > highscore) {
        highscore = score;
        localStorage.setItem("neonDodgeHighscore", highscore);
    }
    finalStats.innerHTML = `Score: <span style="color: white; font-weight: bold;">${score}</span><br>Best: <span style="color: #00f2ff; font-weight: bold;">${highscore}</span>`;
    gameOverScreen.style.display = "block";
}

// === NEW DRAW FUNCTION WITH ROCKET SHIP ===
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- DRAW ROCKET ---
    ctx.shadowBlur = 20;

    // 1. Thruster Flame (Animated)
    const flicker = (Math.sin(Date.now() / 50) + 1) / 2; // Rapid fluctuation
    const flameLen = player.h * 0.3 + (player.h * 0.2 * flicker);

    // Alternate flame color between orange and yellow for flickering effect
    ctx.fillStyle = Math.random() > 0.5 ? "#ffcc00" : "#ff5500";
    ctx.shadowColor = "#ff5500";
    ctx.beginPath();
    ctx.moveTo(player.x + player.w * 0.3, player.y + player.h);
    ctx.lineTo(player.x + player.w * 0.7, player.y + player.h);
    ctx.lineTo(player.x + player.w / 2, player.y + player.h + flameLen);
    ctx.fill();

    // 2. Rocket Body & Fins
    ctx.fillStyle = player.color;
    ctx.shadowColor = player.color;
    ctx.beginPath();
    // Nose
    ctx.moveTo(player.x + player.w / 2, player.y);
    // Right Body side
    ctx.lineTo(player.x + player.w * 0.8, player.y + player.h * 0.7);
    // Right Fin tip
    ctx.lineTo(player.x + player.w + 10, player.y + player.h);
    // Bottom right connector
    ctx.lineTo(player.x + player.w * 0.7, player.y + player.h);
    // Bottom left connector
    ctx.lineTo(player.x + player.w * 0.3, player.y + player.h);
    // Left Fin tip
    ctx.lineTo(player.x - 10, player.y + player.h);
    // Left Body side
    ctx.lineTo(player.x + player.w * 0.2, player.y + player.h * 0.7);
    ctx.closePath();
    ctx.fill();
    
    // 3. Shield Overlay
    if (player.shield) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#fff";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        // Draw shield around the bounding box of the ship
        ctx.strokeRect(player.x - 5, player.y - 5, player.w + 10, player.h + 10);
    }
    // --- END ROCKET DRAW ---

    // Obstacles
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#ff0055";
    ctx.shadowColor = "#ff0055";
    obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));

    // Powerups
    powerups.forEach(p => {
        ctx.fillStyle = p.type === 'shield' ? "#00ff88" : "#ffcc00";
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(p.x, p.y, p.w, p.h);
    });

    // Score HUD
    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(`Score: ${score}`, 20, 40);
}

function animate() {
    if (isPlaying) {
        update();
        draw();
        requestAnimationFrame(animate);
    }
}

// === UPDATED SPAWN LOGIC ===
function spawnEntity() {
    // 1. Spawn Obstacles (Red Pillars)
    // Roughly an 8% chance per frame
    if (Math.random() < 0.08) { 
        let width = Math.random() * 40 + 30;
        let height = Math.random() * 80 + 80; 
        obstacles.push({
            x: Math.random() * (canvas.width - width),
            y: -height, w: width, h: height, speed: Math.random() * 2 + gameSpeed
        });
    } 

    // 2. Spawn Powerups (Shield/Shrink)
    // Increased to a 4% chance per frame (Was effectively 0% in previous version due to a logic bug!)
    if (Math.random() < 0.04) { 
        powerups.push({
            x: Math.random() * (canvas.width - 30),
            y: -30, w: 30, h: 30,
            type: Math.random() > 0.5 ? 'shield' : 'shrink',
            speed: gameSpeed
        });
    }
}
</script>
</body>
</html>
