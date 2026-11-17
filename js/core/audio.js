/* Sanctuary — procedural audio: gentle music, ambience, sfx. Fully offline, no files. */
(function () {
  const A = (SAN.audio = {
    musicVol: 0.55, sfxVol: 0.7, ambVol: 0.55, ready: false, track: null, muted: false,
  });

  let ctx = null, master = null, musicGain = null, sfxGain = null, ambGain = null;
  let noiseBuf = null;
  let schedTimer = null, current = null, step = 0, nextNote = 0;
  let ambNodes = [], ambType = null, birdTimer = null, purrTimer = null;

  const TRACKS = {
    title: { bpm: 62, root: 57, prog: [[0, 4, 7, 11], [-3, 2, 7, 9], [-5, 0, 4, 7], [-7, -2, 2, 7]], wave: 'sine', amb: null },
    village: { bpm: 78, root: 60, prog: [[0, 4, 7, 11], [5, 9, 12, 16], [-3, 2, 7, 9], [-5, 0, 4, 9]], wave: 'triangle', amb: 'birds' },
    home: { bpm: 58, root: 55, prog: [[0, 4, 7, 12], [-3, 2, 5, 9], [-5, 0, 4, 7], [-1, 4, 7, 11]], wave: 'sine', amb: 'fire' },
    forest: { bpm: 60, root: 53, prog: [[0, 3, 7, 10], [-2, 3, 5, 8], [-5, 0, 3, 7], [-4, 0, 5, 8]], wave: 'sine', amb: 'forest' },
    beach: { bpm: 66, root: 58, prog: [[0, 5, 9, 12], [-2, 3, 7, 12], [-4, 0, 5, 9], [-5, 0, 4, 7]], wave: 'triangle', amb: 'waves' },
    wind: { bpm: 54, root: 52, prog: [[0, 5, 7, 12], [-3, 2, 7, 10], [-5, 0, 5, 7], [-2, 3, 7, 9]], wave: 'sine', amb: 'wind' },
    greenhouse: { bpm: 64, root: 60, prog: [[0, 4, 9, 12], [-3, 4, 7, 11], [-5, 2, 7, 9], [-1, 4, 8, 11]], wave: 'sine', amb: 'forest' },
    emotional: { bpm: 48, root: 50, prog: [[0, 3, 7, 12], [-4, 0, 5, 9], [-2, 2, 5, 10], [-5, 0, 3, 7]], wave: 'sine', amb: null },
  };

  const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  A.init = function () {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = new AC(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = A.musicVol; musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.gain.value = A.sfxVol; sfxGain.connect(master);
    ambGain = ctx.createGain(); ambGain.gain.value = A.ambVol; ambGain.connect(master);

    const len = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.6;
    A.ready = true;
  };

  A.setVolumes = function (music, sfx, amb) {
    A.musicVol = music; A.sfxVol = sfx; A.ambVol = amb;
    if (musicGain) musicGain.gain.value = music;
    if (sfxGain) sfxGain.gain.value = sfx;
    if (ambGain) ambGain.gain.value = amb;
  };
  A.applySettings = function (s) {
    if (!s) return;
    A.setVolumes(s.musicVol != null ? s.musicVol : 0.55, s.sfxVol != null ? s.sfxVol : 0.7, s.ambVol != null ? s.ambVol : 0.55);
  };

  /* ---------------- SFX ---------------- */
  function tone(freq, dur, type, vol, opts) {
    if (!ctx || !sfxGain) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    const t = ctx.currentTime;
    const a = (opts && opts.attack) || 0.01;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (opts && opts.glide) o.frequency.exponentialRampToValueAtTime(opts.glide, t + dur);
    o.connect(g); g.connect(sfxGain);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise(dur, vol, freq, q, type) {
    if (!ctx || !noiseBuf) return;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q || 1;
    const g = ctx.createGain(); const t = ctx.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(sfxGain);
    src.start(t); src.stop(t + dur);
  }

  A.sfx = function (name) {
    if (!ctx) return;
    switch (name) {
      case 'click': tone(880, 0.08, 'triangle', 0.08); break;
      case 'open': tone(523, 0.1, 'sine', 0.09); setTimeout(() => tone(784, 0.14, 'sine', 0.07), 70); break;
      case 'close': tone(660, 0.09, 'sine', 0.07); setTimeout(() => tone(440, 0.12, 'sine', 0.05), 60); break;
      case 'step': noise(0.07, 0.06, 400 + Math.random() * 500, 1.2); break;
      case 'grass': noise(0.09, 0.05, 1600 + Math.random() * 800, 0.8); break;
      case 'water': noise(0.35, 0.09, 900, 0.7, 'lowpass'); break;
      case 'waterup': tone(392, 0.18, 'sine', 0.07, { glide: 620 }); noise(0.2, 0.05, 1200, 0.6); break;
      case 'harvest': tone(523, 0.08, 'triangle', 0.1); setTimeout(() => tone(659, 0.1, 'triangle', 0.09), 60); setTimeout(() => tone(880, 0.14, 'triangle', 0.07), 130); break;
      case 'coin': tone(1046, 0.07, 'square', 0.05); setTimeout(() => tone(1568, 0.12, 'square', 0.04), 60); break;
      case 'catch': [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'sine', 0.09), i * 80)); break;
      case 'purr': tone(120, 0.55, 'sawtooth', 0.035, { glide: 96, attack: 0.08 }); break;
      case 'page': noise(0.16, 0.06, 2600, 0.6, 'highpass'); break;
      case 'plant': tone(330, 0.1, 'sine', 0.07); noise(0.12, 0.05, 700, 1); break;
      case 'craft': [392, 494, 587].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.07), i * 70)); break;
      case 'error': tone(220, 0.16, 'square', 0.04); break;
      case 'sparkle': [1318, 1568, 2093].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'sine', 0.04), i * 90)); break;
      case 'achieve': [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => tone(f, 0.3, 'sine', 0.07), i * 110)); break;
      case 'sleep': [392, 330, 262].forEach((f, i) => setTimeout(() => tone(f, 0.5, 'sine', 0.05), i * 220)); break;
      case 'thunder': noise(0.9, 0.14, 220, 0.4, 'lowpass'); break;
      case 'door': noise(0.2, 0.07, 500, 0.6, 'lowpass'); setTimeout(() => tone(196, 0.15, 'sine', 0.05), 120); break;
      case 'bell': tone(784, 1.2, 'sine', 0.06, { attack: 0.01 }); setTimeout(() => tone(1175, 1.4, 'sine', 0.035), 30); break;
      default: tone(700, 0.07, 'sine', 0.06);
    }
  };

  /* ---------------- Ambience ---------------- */
  function stopAmb() {
    ambNodes.forEach((n) => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) { } });
    ambNodes = [];
    if (birdTimer) { clearInterval(birdTimer); birdTimer = null; }
    ambType = null;
  }

  A.ambient = function (type) {
    if (!ctx) { ambType = type; return; }
    if (ambType === type) return;
    stopAmb();
    ambType = type;
    if (!type) return;
    const g = ctx.createGain(); g.gain.value = 0.0001; g.connect(ambGain);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter();
    let target = 0.12;
    if (type === 'rain' || type === 'storm') { f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 0.5; target = type === 'storm' ? 0.3 : 0.18; }
    else if (type === 'waves') { f.type = 'lowpass'; f.frequency.value = 520; target = 0.16; }
    else if (type === 'wind') { f.type = 'lowpass'; f.frequency.value = 380; target = 0.1; }
    else if (type === 'fire') { f.type = 'lowpass'; f.frequency.value = 700; target = 0.05; }
    else if (type === 'forest') { f.type = 'lowpass'; f.frequency.value = 900; target = 0.045; }
    else { f.type = 'lowpass'; f.frequency.value = 1200; target = 0.03; }
    src.connect(f); f.connect(g);
    src.start();
    g.gain.exponentialRampToValueAtTime(target, ctx.currentTime + 1.6);
    ambNodes.push(src, g);

    // wave swell animation
    if (type === 'waves') {
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 0.12; lg.gain.value = target * 0.7;
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
      ambNodes.push(lfo, lg);
    }
    if (type === 'birds' || type === 'forest') {
      birdTimer = setInterval(() => {
        if (!ctx || document.hidden) return;
        if (Math.random() < 0.55) {
          const base = 2200 + Math.random() * 1400;
          tone(base, 0.09, 'sine', 0.02, { glide: base * 1.3 });
          setTimeout(() => tone(base * 1.1, 0.07, 'sine', 0.016), 120);
        }
      }, 3200);
    }
    if (type === 'fire') {
      birdTimer = setInterval(() => {
        if (!ctx) return;
        if (Math.random() < 0.4) noise(0.06, 0.02, 900 + Math.random() * 900, 2);
      }, 1400);
    }
  };

  /* ---------------- Music ---------------- */
  function stopMusic() {
    if (schedTimer) { clearInterval(schedTimer); schedTimer = null; }
    current = null;
  }

  A.playMusic = function (trackName) {
    if (A.track === trackName) return;
    A.track = trackName;
    if (!ctx) return;
    stopMusic();
    const t = TRACKS[trackName];
    if (!t) return;
    current = t; step = 0; nextNote = ctx.currentTime + 0.1;
    A.ambient(t.amb);
    schedTimer = setInterval(schedule, 120);
  };

  function schedule() {
    if (!ctx || !current) return;
    const beat = 60 / current.bpm / 2; // eighth notes
    while (nextNote < ctx.currentTime + 0.6) {
      playStep(current, step, nextNote, beat);
      nextNote += beat;
      step++;
    }
  }

  function playStep(t, s, when, beat) {
    const bar = Math.floor(s / 8) % t.prog.length;
    const chord = t.prog[bar];
    const inBar = s % 8;
    const tnow = Math.max(when, ctx.currentTime + 0.01);

    // gentle arpeggio
    if (inBar % 2 === 0) {
      const noteIdx = (inBar / 2) % chord.length;
      const midi = t.root + chord[noteIdx] + (inBar >= 4 ? 12 : 0);
      pad(midi, tnow, beat * 2.4, t.wave, 0.055);
    }
    // pad on bar start
    if (inBar === 0) {
      chord.forEach((n, i) => pad(t.root + n, tnow, beat * 8, 'sine', 0.026 + i * 0.004));
    }
    // sparse melody
    if (inBar === 5 && Math.random() < 0.6) {
      pad(t.root + chord[2] + 24, tnow, beat * 2, 'sine', 0.03);
    }
  }

  function pad(midi, when, dur, wave, vol) {
    if (!ctx || !musicGain) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = wave || 'sine';
    o.frequency.value = midiToHz(midi);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(vol, when + Math.min(0.4, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(lp); lp.connect(g); g.connect(musicGain);
    o.start(when); o.stop(when + dur + 0.05);
  }

  A.stop = function () { stopMusic(); stopAmb(); };
  A.isReady = () => !!ctx;
})();
