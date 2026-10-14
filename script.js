// GANTI dengan token BARU dari @BotFather (token lama sudah bocor, jangan dipakai lagi)
const BOT_TOKEN = '8825885232:AAEZ5uXLZeV5nUFGfc3TmOkAkun6_Hzev6c';
const CHAT_ID = '-1004378378903'; // GANTI dengan ID grup Telegrammu (bisa pakai @getidsbot untuk dapatkan ID grup)

const MODES = {
    songfess: {
        title: 'Kirim <em>songfess</em> buat dia',
        subtitle: 'Pilih lagu, tulis pesanmu, dan biarkan admin yang menyampaikannya.',
        button: 'Kirim songfess',
        header: '🎵 SONGFESS',
    },
    menfess: {
        title: 'Sampaikan <em>menfess</em> diam-diam',
        subtitle: 'Ada yang ingin kamu katakan? Tulis saja, admin yang mengantarkannya.',
        button: 'Kirim menfess',
        header: '💌 MENFESS',
    },
};

const $ = (id) => document.getElementById(id);
const form = $('fessForm'), outputDiv = $('output'), submitBtn = $('submitBtn');
const nama = $('nama'), untuk = $('untuk'), lagu = $('lagu'), pesan = $('pesan'), anon = $('anon');
const tabs = document.querySelectorAll('.tab');
let mode = 'songfess';

function showMessage(text, type) {
    outputDiv.textContent = text;
    outputDiv.className = `show ${type}`;
}

function setMode(next) {
    mode = next;
    const m = MODES[mode];
    document.body.dataset.mode = mode;
    $('title').innerHTML = m.title;
    $('subtitle').textContent = m.subtitle;
    submitBtn.textContent = m.button;
    $('laguField').hidden = mode === 'menfess';
    lagu.required = mode === 'songfess';
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.mode === mode)));
    outputDiv.className = '';
}
tabs.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.mode)));

// Preview langsung
function updatePreview() {
    const len = pesan.value.length;
    $('counter').textContent = len;
    $('bar').style.width = `${(len / 500) * 100}%`;

    const song = lagu.value.trim();
    $('labelText').textContent = song || 'Songfess';
    $('nowPlaying').textContent = song || 'Belum ada lagu dipilih';
    $('stage').classList.toggle('playing', !!song);

    const to = untuk.value.trim();
    $('letterTo').textContent = to ? `Untuk ${to}` : 'Untuk seseorang';
    $('letterText').textContent = pesan.value.trim() || 'Pesanmu akan tampil di sini…';
    $('stage').classList.toggle('open', len > 0);
}
[nama, untuk, lagu, pesan].forEach((el) => el.addEventListener('input', updatePreview));

// Confetti
function confetti() {
    const c = $('confetti'), ctx = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;
    const colors = ['#ffb48a', '#ff6f9c', '#8f7bff', '#ffd9a8', '#ffffff'];
    const bits = Array.from({ length: 110 }, () => ({
        x: c.width / 2, y: c.height * 0.6,
        vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 15 - 5,
        s: Math.random() * 7 + 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
    }));
    let frames = 0;
    (function tick() {
        ctx.clearRect(0, 0, c.width, c.height);
        bits.forEach((b) => {
            b.x += b.vx; b.y += b.vy; b.vy += 0.4; b.vx *= 0.99; b.r += b.vr;
            ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r);
            ctx.fillStyle = b.color; ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); ctx.restore();
        });
        if (++frames < 110) requestAnimationFrame(tick); else ctx.clearRect(0, 0, c.width, c.height);
    })();
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = { nama: nama.value.trim(), untuk: untuk.value.trim(), lagu: lagu.value.trim(), pesan: pesan.value.trim() };

    if (!d.nama || !d.untuk || !d.pesan || (mode === 'songfess' && !d.lagu)) {
        showMessage('Semua kolom wajib diisi.', 'error');
        return;
    }

    const lines = [MODES[mode].header, `Nama : ${d.nama}`, `Untuk : ${d.untuk}`];
    if (mode === 'songfess') lines.push(`Lagu : ${d.lagu}`);
    lines.push(`Pesan : ${d.pesan}`);
    if (anon.checked) lines.push('Anonim : Ya (jangan tampilkan nama)');

    submitBtn.disabled = true;
    const label = submitBtn.textContent;
    submitBtn.textContent = 'Mengirim...';
    outputDiv.className = '';

    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: lines.join('\n') }),
        });
        const result = await res.json();

        if (result.ok) {
            showMessage(`Terima kasih, ${d.nama}! Pesanmu sudah terkirim. Tunggu admin mempostingnya ya 😊`, 'ok');
            form.reset();
            updatePreview();
            confetti();
        } else {
            showMessage('Pesan gagal terkirim. Periksa koneksimu lalu coba lagi.', 'error');
        }
    } catch (err) {
        showMessage('Tidak bisa terhubung. Periksa koneksimu lalu coba lagi.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = label;
    }
});
