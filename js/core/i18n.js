/* Sanctuary — interface language: English and Bahasa Indonesia */
(function () {
  const I = (SAN.i18n = {});

  I.LANGS = [
    { id: 'en', name: 'English' },
    { id: 'id', name: 'Bahasa Indonesia' },
  ];

  // Interface chrome only: story dialogue, quests and item text stay as written.
  const EN = {
    'lang.label': 'Language',
    'lang.note': 'Menus and interface text switch immediately. Story dialogue, quests and item descriptions stay in English for now.',

    'dock.journal': 'Journal',
    'dock.inventory': 'Satchel',
    'dock.map': 'Map',
    'dock.quests': 'Quests',
    'dock.memories': 'Memories',
    'dock.relations': 'People',
    'dock.collection': 'Album',
    'dock.pause': 'Menu',

    'hud.energy': 'Energy',
    'hud.camera': 'Camera',

    'panel.inventory': 'Satchel',
    'panel.journal': 'Journal',
    'panel.memories': 'The Memory Vault',
    'panel.relations': 'People of Sanctuary',
    'panel.map': 'Map of Sanctuary',
    'panel.quests': 'Quests',
    'panel.board': 'Village Bulletin Board',
    'panel.collection': 'Collections',
    'panel.photos': 'Photo Album',
    'panel.photoview': 'Photograph',
    'panel.decorate': 'Decorate your home',
    'panel.settings': 'Settings',
    'panel.saves': 'Save Slots',
    'panel.history': 'Dialogue History',
    'panel.customize': 'Wardrobe',
    'panel.about': 'About Sanctuary',
    'panel.cook': 'Kitchen',
    'panel.craft': 'Crafting Bench',
    'panel.seeds': 'Plant a seed',

    'pause.resume': 'Resume',
    'pause.journal': 'Journal',
    'pause.inventory': 'Satchel',
    'pause.quests': 'Quests',
    'pause.map': 'Map',
    'pause.relations': 'People',
    'pause.memories': 'Memory Vault',
    'pause.collection': 'Collections',
    'pause.photos': 'Photos',
    'pause.decorate': 'Decorate',
    'pause.saves': 'Save / Load',
    'pause.settings': 'Settings',
    'pause.quit': 'Quit to title',
    'pause.footnote': 'Nothing here punishes you for leaving. The village waits kindly.',

    'settings.audio': 'Audio',
    'settings.music': 'Music',
    'settings.effects': 'Effects',
    'settings.ambience': 'Ambience',
    'settings.textDisplay': 'Text & display',
    'settings.textSpeed': 'Text speed',
    'settings.hints': 'Show interaction hints',
    'settings.reduceMotion': 'Reduce motion',
    'settings.touch': 'Always show touch controls',
    'settings.autosave': 'Autosave',
    'settings.privacy': 'Privacy',
    'settings.privacyNote': 'Journal entries and memories are stored on this device only. Sanctuary uses an offline rule-based reflection engine.',
    'settings.ai': 'Allow optional AI reflection (offline-only unless you consent)',
    'settings.aiNote': 'Even when enabled, nothing is uploaded automatically. The game works fully offline either way.',
    'settings.export': 'Export save data',
    'settings.import': 'Import save data',
    'settings.controls': 'Controls',
    'settings.controlMove': 'move',
    'settings.controlRun': 'run',
    'settings.controlInteract': 'interact',
    'settings.controlPause': 'pause menu',
    'settings.controlTouch': 'Touch: joystick + action button',
    'settings.saveSlots': 'Open save slots',
    'settings.returnTitle': 'Return to title',

    'title.newGame': 'New Game',
    'title.continue': 'Continue',
    'title.slots': 'Save Slots',
    'title.settings': 'Settings',
    'title.about': 'About',
    'title.quit': 'Quit',
    'title.kicker': 'a cozy RPG about coming back to yourself',
    'title.foot': 'WASD move · E interact · ESC pause · plays fully offline',

    'dialogue.hint': 'click / E to continue',
    'dialogue.history': 'History',
    'dialogue.auto': 'Auto',
    'dialogue.skip': 'Skip',

    'confirm.yes': 'Yes',
    'confirm.no': 'Not now',

    'day.day': 'Day',
    'day.year': 'Year',

    'weather.sunny': 'sunny',
    'weather.cloudy': 'cloudy',
    'weather.rain': 'rain',
    'weather.storm': 'storm',
    'weather.fog': 'fog',
    'weather.snow': 'snow',

    'phase.morning': 'morning',
    'phase.afternoon': 'afternoon',
    'phase.evening': 'evening',
    'phase.night': 'night',
  };

  const ID = {
    'lang.label': 'Bahasa',
    'lang.note': 'Menu dan teks antarmuka langsung berubah. Dialog cerita, misi, dan deskripsi item masih berbahasa Inggris untuk saat ini.',

    'dock.journal': 'Jurnal',
    'dock.inventory': 'Tas',
    'dock.map': 'Peta',
    'dock.quests': 'Misi',
    'dock.memories': 'Kenangan',
    'dock.relations': 'Warga',
    'dock.collection': 'Album',
    'dock.pause': 'Menu',

    'hud.energy': 'Energi',
    'hud.camera': 'Kamera',

    'panel.inventory': 'Tas',
    'panel.journal': 'Jurnal',
    'panel.memories': 'Gudang Kenangan',
    'panel.relations': 'Warga Sanctuary',
    'panel.map': 'Peta Sanctuary',
    'panel.quests': 'Misi',
    'panel.board': 'Papan Pengumuman Desa',
    'panel.collection': 'Koleksi',
    'panel.photos': 'Album Foto',
    'panel.photoview': 'Foto',
    'panel.decorate': 'Hiasi rumahmu',
    'panel.settings': 'Pengaturan',
    'panel.saves': 'Slot Simpanan',
    'panel.history': 'Riwayat Dialog',
    'panel.customize': 'Lemari Pakaian',
    'panel.about': 'Tentang Sanctuary',
    'panel.cook': 'Dapur',
    'panel.craft': 'Meja Kerajinan',
    'panel.seeds': 'Tanam benih',

    'pause.resume': 'Lanjutkan',
    'pause.journal': 'Jurnal',
    'pause.inventory': 'Tas',
    'pause.quests': 'Misi',
    'pause.map': 'Peta',
    'pause.relations': 'Warga',
    'pause.memories': 'Gudang Kenangan',
    'pause.collection': 'Koleksi',
    'pause.photos': 'Foto',
    'pause.decorate': 'Hiasi',
    'pause.saves': 'Simpan / Muat',
    'pause.settings': 'Pengaturan',
    'pause.quit': 'Keluar ke judul',
    'pause.footnote': 'Tidak ada di sini yang menghukummu karena pergi. Desa ini menunggu dengan sabar.',

    'settings.audio': 'Audio',
    'settings.music': 'Musik',
    'settings.effects': 'Efek',
    'settings.ambience': 'Suara sekitar',
    'settings.textDisplay': 'Teks & tampilan',
    'settings.textSpeed': 'Kecepatan teks',
    'settings.hints': 'Tampilkan petunjuk interaksi',
    'settings.reduceMotion': 'Kurangi animasi',
    'settings.touch': 'Selalu tampilkan kontrol sentuh',
    'settings.autosave': 'Simpan otomatis',
    'settings.privacy': 'Privasi',
    'settings.privacyNote': 'Catatan jurnal dan kenangan hanya tersimpan di perangkat ini. Sanctuary memakai mesin refleksi berbasis aturan yang berjalan offline.',
    'settings.ai': 'Izinkan refleksi AI opsional (hanya offline kecuali kamu setuju)',
    'settings.aiNote': 'Walau diaktifkan, tidak ada yang diunggah otomatis. Game tetap bisa dimainkan sepenuhnya offline.',
    'settings.export': 'Ekspor data simpanan',
    'settings.import': 'Impor data simpanan',
    'settings.controls': 'Kontrol',
    'settings.controlMove': 'bergerak',
    'settings.controlRun': 'berlari',
    'settings.controlInteract': 'berinteraksi',
    'settings.controlPause': 'menu jeda',
    'settings.controlTouch': 'Sentuh: joystick + tombol aksi',
    'settings.saveSlots': 'Buka slot simpanan',
    'settings.returnTitle': 'Kembali ke judul',

    'title.newGame': 'Mulai Baru',
    'title.continue': 'Lanjutkan',
    'title.slots': 'Slot Simpanan',
    'title.settings': 'Pengaturan',
    'title.about': 'Tentang',
    'title.quit': 'Keluar',
    'title.kicker': 'RPG santai tentang kembali pada dirimu sendiri',
    'title.foot': 'WASD bergerak · E berinteraksi · ESC jeda · bisa dimainkan sepenuhnya offline',

    'dialogue.hint': 'klik / E untuk lanjut',
    'dialogue.history': 'Riwayat',
    'dialogue.auto': 'Otomatis',
    'dialogue.skip': 'Lewati',

    'confirm.yes': 'Ya',
    'confirm.no': 'Nanti saja',

    'day.day': 'Hari',
    'day.year': 'Tahun',

    'weather.sunny': 'cerah',
    'weather.cloudy': 'berawan',
    'weather.rain': 'hujan',
    'weather.storm': 'badai',
    'weather.fog': 'berkabut',
    'weather.snow': 'salju',

    'phase.morning': 'pagi',
    'phase.afternoon': 'siang',
    'phase.evening': 'sore',
    'phase.night': 'malam',
  };

  const DICT = { en: EN, id: ID };
  const DOCK_KEYS = {
    journal: 'dock.journal', inventory: 'dock.inventory', map: 'dock.map',
    quests: 'dock.quests', memories: 'dock.memories', relations: 'dock.relations',
    collection: 'dock.collection', pause: 'dock.pause',
  };
  let lang = 'en';

  I.normalize = (v) => (DICT[v] ? v : 'en');
  I.get = () => lang;

  I.t = function (key, fallback) {
    const table = DICT[lang] || EN;
    if (table[key] != null) return table[key];
    if (EN[key] != null) return EN[key];
    return fallback != null ? fallback : key;
  };
  SAN.t = function (key, fallback) { return SAN.i18n.t(key, fallback); };

  // static markup that lives in index.html: dock labels, HUD captions
  I.apply = function () {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('#dock [data-panel]').forEach((btn) => {
      const label = btn.querySelector('.dock-lbl');
      const key = DOCK_KEYS[btn.getAttribute('data-panel')];
      if (label && key) label.textContent = I.t(key);
    });
    const energy = document.querySelector('.energy-label');
    if (energy) energy.textContent = I.t('hud.energy');
    const cam = document.getElementById('hud-camera');
    if (cam) {
      cam.title = I.t('hud.camera') + ' (P)';
      cam.setAttribute('aria-label', I.t('hud.camera'));
    }
  };

  I.set = function (next) {
    lang = I.normalize(next);
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
    I.apply();
    return lang;
  };
})();
