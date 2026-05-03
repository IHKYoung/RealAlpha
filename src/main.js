import { t, applyLang, currentLang } from './i18n.js';
import { removeBg } from './bgRemoval.js';
import './style.css';

const $ = id => document.getElementById(id);
const inCv  = $('in-cv'),  inCtx  = inCv.getContext('2d',  { willReadFrequently: true });
const outCv = $('out-cv'), outCtx = outCv.getContext('2d', { willReadFrequently: true });

let originalImg   = null;
let processedBlob = null;
let debounceTimer = null;

// ── Status ────────────────────────────────────────────────────────────────────
function setStatus(msg, type = 'idle') {
  $('st-txt').textContent = msg;
  $('st-dot').className = 'dot' + (type === 'ok' ? ' g' : type === 'err' ? ' r' : '');
}

// ── Image loading ─────────────────────────────────────────────────────────────
function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    setStatus(t('errUnsupported'), 'err');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      originalImg = img;
      const MAX = 2000;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        const s = MAX / Math.max(w, h);
        w = Math.round(w * s);
        h = Math.round(h * s);
      }
      inCv.width = w;
      inCv.height = h;
      inCtx.drawImage(img, 0, 0, w, h);
      $('empty-l').classList.add('hidden');
      inCv.classList.remove('hidden');
      $('proc-btn').disabled = false;
      setStatus(t('statusLoaded', img.width, img.height), 'ok');
      processImage();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ── Processing pipeline ───────────────────────────────────────────────────────
function processImage() {
  if (!originalImg) return;
  const tol = parseInt($('tol').value);
  $('proc-ov').classList.remove('hidden');
  $('empty-r').classList.add('hidden');
  setStatus(t('statusProcessing'), 'idle');

  requestAnimationFrame(() => setTimeout(() => {
    try {
      const W = inCv.width, H = inCv.height;
      outCv.width = W;
      outCv.height = H;
      outCtx.drawImage(inCv, 0, 0);

      const imageData = outCtx.getImageData(0, 0, W, H);
      const bgType = removeBg(imageData, W, H, tol);
      outCtx.putImageData(imageData, 0, 0);
      outCv.classList.remove('hidden');

      const badge = $('bg-badge');
      badge.className = 'badge';
      badge.classList.remove('hidden');
      if (bgType === 'solid')        { badge.textContent = t('bgSolid');   badge.classList.add('solid');   }
      else if (bgType === 'checker') { badge.textContent = t('bgChecker'); badge.classList.add('checker'); }
      else                           { badge.textContent = t('bgMixed');   badge.classList.add('mixed');   }

      $('out-info').textContent = `${W} × ${H}`;
      $('out-info').classList.remove('hidden');

      outCv.toBlob(blob => {
        processedBlob = blob;
        $('dl-btn').classList.remove('hidden');
        setStatus(t('statusDone'), 'ok');
      }, 'image/png');
    } catch (err) {
      setStatus(t('statusFailed') + err.message, 'err');
    } finally {
      $('proc-ov').classList.add('hidden');
    }
  }, 20));
}

// ── Tolerance label ───────────────────────────────────────────────────────────
function tolLabel(v) {
  if (v <= 15) return t('tolPrecise');
  if (v <= 35) return t('tolMedium');
  if (v <= 60) return t('tolLoose');
  return t('tolMax');
}

// ── Events ────────────────────────────────────────────────────────────────────
const dz = $('dz');
dz.addEventListener('click', () => $('fi').click());
$('fi').addEventListener('change', e => { if (e.target.files[0]) loadFile(e.target.files[0]); });
dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
dz.addEventListener('dragleave', () => dz.classList.remove('over'));
dz.addEventListener('drop', e => {
  e.preventDefault();
  dz.classList.remove('over');
  if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
});

window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => {
  e.preventDefault();
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('image/')) loadFile(f);
});

$('proc-btn').addEventListener('click', processImage);
$('mid-btn').addEventListener('click', () => { if (originalImg) processImage(); });

$('tol').addEventListener('input', () => {
  $('tol-val').textContent = tolLabel(parseInt($('tol').value));
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { if (originalImg) processImage(); }, 350);
});

$('dl-btn').addEventListener('click', () => {
  if (!processedBlob) return;
  const url = URL.createObjectURL(processedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'realalpha-' + Date.now() + '.png';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.addEventListener('paste', e => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith('image/')) { loadFile(item.getAsFile()); break; }
  }
});

$('lang-sel').addEventListener('change', e => {
  applyLang(e.target.value);
  $('tol-val').textContent = tolLabel(parseInt($('tol').value));
  if (!originalImg) setStatus(t('statusReady'));
});

// ── Init ──────────────────────────────────────────────────────────────────────
applyLang(currentLang);
setStatus(t('statusReady'));
$('tol-val').textContent = tolLabel(parseInt($('tol').value));
