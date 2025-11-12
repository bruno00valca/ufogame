(function (global) {
  const Game = {
    // Inicializa el juego. prefs: { numUfos, gameTime, doubleSpeed }
    init(prefs, elements = {}) {
      this.gameZone = elements.gameZone || document.getElementById("gameZone");
      this.remainingTimeEl =
        elements.remainingTimeEl || document.getElementById("remainingTime");
      this.scoreEl = elements.scoreEl || document.getElementById("score");
      this.statusMsgEl =
        elements.statusMsgEl || document.getElementById("statusMsg");
      this.stopBtn = elements.stopBtn || document.getElementById("stopGameBtn");

      this.prefs = Object.assign(
        { numUfos: 5, gameTime: 60, doubleSpeed: false },
        prefs
      );
      this.initialCount = Number(this.prefs.numUfos) || 5;
      this.baseSpeed = 1.6;
      this.doubleFactor = 2;
      this.ufos = [];
      this.score = 0;
      this.timeLeft = Number(this.prefs.gameTime) || 60;
      this.gameActive = false;

      this.missile = {
        el: null,
        x: 0,
        y: 0,
        width: 24,
        height: 48,
        speed: 6,
        launched: false,
      };

      const rect = this.gameZone.getBoundingClientRect();
      this.zoneW = rect.width;
      this.zoneH = rect.height;

      this._onKeyDown = this._onKeyDown.bind(this);
      this._onKeyUp = this._onKeyUp.bind(this);
      this._loop = this._loop.bind(this);
      this._stopClick = this._stopClick.bind(this);

      this._clearZone();
      this._createScoreAndMissile();
      this._spawnUfos(this.initialCount);
      this._updateScoreDisplay();
      this._updateTimeDisplay();
      this.gameActive = true;

      this._lastFrame = performance.now();
      this._accumulator = 0;
      window.addEventListener("keydown", this._onKeyDown);
      window.addEventListener("keyup", this._onKeyUp);
      if (this.stopBtn) this.stopBtn.addEventListener("click", this._stopClick);

      this._rafId = requestAnimationFrame(this._loop);
    },

    _clearZone() {
      while (this.gameZone.firstChild)
        this.gameZone.removeChild(this.gameZone.firstChild);
      this.ufos = [];
    },

    _createScoreAndMissile() {
      const baseY = this.zoneH - this.missile.height;
      const startX = this.zoneW / 2;

      const m = document.createElement("img");
      m.src = "./images/missile.png";
      m.className = "missile";
      Object.assign(m.style, {
        position: "absolute",
        width: this.missile.width + "px",
        height: this.missile.height + "px",
        left: startX + "px",
        top: baseY + "px",
        transform: "translate(-50%, 0)",
        zIndex: 50,
      });
      this.gameZone.appendChild(m);
      this.missile.el = m;

      this.missile.el = m;
      this.missile.x = startX;
      this.missile.y = baseY;
      this.missile.launched = false;

      this._moveLeft = false;
      this._moveRight = false;
    },

    _spawnUfos(count) {
      for (let i = 0; i < count; i++) {
        const u = document.createElement("img");
        u.src = "./images/ufo.png";
        u.className = "ufo-sprite";
        const w = 48;
        const h = 32;
        const x = Math.random() * (this.zoneW - w);
        const y = Math.random() * (this.zoneH - 150);
        u.style.position = "absolute";
        u.style.width = w + "px";
        u.style.height = h + "px";
        u.style.left = x + "px";
        u.style.top = y + "px";
        u.dataset.dir = Math.random() > 0.5 ? "right" : "left";
        u.dataset.speed = this.baseSpeed;
        u.dataset.alive = "true";
        this.gameZone.appendChild(u);
        this.ufos.push({
          el: u,
          x: x,
          y: y,
          w: w,
          h: h,
          dir: u.dataset.dir,
          speed: parseFloat(u.dataset.speed),
        });
      }
    },

    _updateTimeDisplay() {
      if (this.remainingTimeEl)
        this.remainingTimeEl.textContent = Math.ceil(this.timeLeft);
    },

    _updateScoreDisplay() {
      if (this.scoreEl) this.scoreEl.textContent = String(this.score);
    },

    _loop(now) {
      if (!this.gameActive) return;
      const dt = now - this._lastFrame;
      this._lastFrame = now;

      this._updateUfos(dt);
      this._updateMissile(dt);
      if (this.missile.launched) this._checkCollisions();

      this.timeLeft -= dt / 1000;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this._updateTimeDisplay();
        this._endGame();
        return;
      }
      this._updateTimeDisplay();

      this._rafId = requestAnimationFrame(this._loop);
    },

    _updateUfos(dt) {
      this.ufos.forEach((u) => {
        if (!u.el || u.el.dataset.alive !== "true") return;
        if (u.x <= 0) u.dir = "right";
        if (u.x + u.w >= this.zoneW) u.dir = "left";

        const s = u.speed;
        u.x += (u.dir === "right" ? s : -s) * (dt / 16.67);

        u.el.style.left = u.x + "px";
      });
    },

    _updateMissile(dt) {
      if (!this.missile.el) return;

      if (!this.missile.launched) {
        const moveSpeed = 4;
        if (this._moveLeft) this.missile.x -= moveSpeed * (dt / 16.67);
        if (this._moveRight) this.missile.x += moveSpeed * (dt / 16.67);

        this.missile.x = Math.max(
          this.missile.width / 2,
          Math.min(this.zoneW - this.missile.width / 2, this.missile.x)
        );

        this.missile.el.style.left = this.missile.x + "px";
        this.missile.el.style.transform = "translateX(-50%)";
      } else {
        this.missile.y -= this.missile.speed * (dt / 16.67);
        this.missile.el.style.top = this.missile.y + "px";

        this.missile.el.style.left = this.missile.x + "px";
        this.missile.el.style.transform = "translateX(-50%)";
        if (this.missile.y + this.missile.height <= 0) {
          this._onMiss();
        }
      }
    },

    _checkCollisions() {
      const mx = this.missile.x - this.missile.width / 2;
      const my = this.missile.y;
      const mw = this.missile.width;
      const mh = this.missile.height;

      for (let i = 0; i < this.ufos.length; i++) {
        const u = this.ufos[i];
        if (!u || !u.el || u.el.dataset.alive !== "true") continue;

        const ux = u.x;
        const uy = u.y;
        const uw = u.w;
        const uh = u.h;

        if (mx < ux + uw && mx + mw > ux && my < uy + uh && my + mh > uy) {
          this._onHit(i);
          break;
        }
      }
    },

    _onHit(ufoIndex) {
      if (!this.gameActive) return;
      const u = this.ufos[ufoIndex];
      if (!u) return;

      const explosion = document.createElement("img");
      explosion.src = "./images/explosion.gif";
      explosion.style.position = "absolute";
      explosion.style.left = u.x + "px";
      explosion.style.top = u.y + "px";
      explosion.style.width = u.w + "px";
      explosion.style.height = u.h + "px";
      explosion.style.pointerEvents = "none";
      this.gameZone.appendChild(explosion);

      u.el.dataset.alive = "false";
      if (u.el && u.el.parentNode) u.el.parentNode.removeChild(u.el);
      setTimeout(() => {
        explosion.remove();
      }, 500);

      this.ufos.splice(ufoIndex, 1);

      // score
      this.score += 100;
      this._updateScoreDisplay();

      this._resetMissile();

      if (this.prefs.doubleSpeed) {
        const threshold = Math.floor(this.initialCount / 2);
        if (this.ufos.length <= threshold) {
          this.ufos.forEach(
            (uu) => (uu.speed = this.baseSpeed * this.doubleFactor)
          );
        }
      }

      if (this.ufos.length === 0 && this.timeLeft > 0) {
        this._spawnUfos(this.initialCount);

        this.ufos.forEach((uu) => (uu.speed = this.baseSpeed));
      }
    },

    _onMiss() {
      if (!this.gameActive) return;

      this.score -= 25;
      this._updateScoreDisplay();

      this._resetMissile();
    },

    _resetMissile() {
      this.missile.launched = false;

      this.missile.x = this.zoneW / 2;
      this.missile.y = this.zoneH - this.missile.height;

      this.missile.el.style.left = this.missile.x + "px";
      this.missile.el.style.top = this.missile.y + "px";
      this.missile.el.style.transform = "translateX(-50%)";
    },

    launchMissile() {
      if (!this.gameActive) return;
      if (this.missile.launched) return;
      this.missile.launched = true;
    },

    _onKeyDown(e) {
      if (!this.gameActive) return;
      if (e.code === "ArrowLeft") {
        if (!this.missile.launched) this._moveLeft = true;
        e.preventDefault();
      } else if (e.code === "ArrowRight") {
        if (!this.missile.launched) this._moveRight = true;
        e.preventDefault();
      } else if (e.code === "Space") {
        if (!this.missile.launched) this.launchMissile();
        e.preventDefault();
      }
    },

    _onKeyUp(e) {
      if (e.code === "ArrowLeft") this._moveLeft = false;
      if (e.code === "ArrowRight") this._moveRight = false;
    },

    _endGame() {
      if (!this.gameActive) return;
      this.gameActive = false;

      clearInterval(this._gameTimer);
      cancelAnimationFrame(this._rafId);
      window.removeEventListener("keydown", this._onKeyDown);
      window.removeEventListener("keyup", this._onKeyUp);
      if (this.stopBtn)
        this.stopBtn.removeEventListener("click", this._stopClick);

      const minutes = Math.max(1, Math.round(Number(this.prefs.gameTime) / 60));
      let finalScore = Math.floor(this.score / minutes);

      const subtract = 50 * Math.max(0, Number(this.prefs.numUfos) - 1);
      finalScore -= subtract;

      if (this.prefs.doubleSpeed) finalScore += 250;

      this.statusMsgEl.textContent = `Game over — final score: ${finalScore}`;
      this.score = finalScore;
      this._updateScoreDisplay();
    },

    _stopClick() {
      this._endGame();
    },
  };

  global.Game = Game;
})(window);
