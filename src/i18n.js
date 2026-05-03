export const LOCALES = {
  en: {
    appDesc:          'Smart Background Removal · Runs locally, no upload',
    removalStrength:  'Removal Strength',
    precise:          'Precise',
    loose:            'Loose',
    removeBtn:        'Remove BG',
    downloadBtn:      '↓ Download PNG',
    panelOriginal:    'Original',
    dropHint:         'Drop / Click / Paste',
    dropFormats:      'PNG · JPG · WebP · GIF',
    panelOutput:      'Transparent Output',
    waitingMsg:       'Waiting',
    processingMsg:    'Processing…',
    statusReady:      'Ready · Upload an image to start',
    statusLocal:      'Runs entirely locally · No data uploaded',
    errUnsupported:   'Unsupported file type',
    statusLoaded:     (w, h) => `Loaded ${w}×${h}`,
    statusProcessing: 'Processing…',
    bgSolid:          'Solid bg',
    bgChecker:        'Checker bg',
    bgMixed:          'Mixed bg',
    statusDone:       'Done ✓  Transparent PNG ready to download',
    statusFailed:     'Failed: ',
    tolPrecise:       'Precise',
    tolMedium:        'Medium',
    tolLoose:         'Loose',
    tolMax:           'Max',
  },

  'zh-CN': {
    appDesc:          '智能背景移除 · 本地处理，不上传数据',
    removalStrength:  '去除强度',
    precise:          '精准',
    loose:            '宽松',
    removeBtn:        '去除背景',
    downloadBtn:      '↓ 下载 PNG',
    panelOriginal:    '原图',
    dropHint:         '拖入 / 点击上传 / 粘贴',
    dropFormats:      'PNG · JPG · WebP · GIF',
    panelOutput:      '透明底输出',
    waitingMsg:       '等待处理',
    processingMsg:    '处理中…',
    statusReady:      '就绪 · 请上传图片',
    statusLocal:      '完全本地运行，不上传任何数据',
    errUnsupported:   '不支持的文件类型',
    statusLoaded:     (w, h) => `已加载 ${w}×${h}`,
    statusProcessing: '处理中…',
    bgSolid:          '纯色背景',
    bgChecker:        '棋盘格背景',
    bgMixed:          '混合背景',
    statusDone:       '处理完成 ✓  可下载透明底 PNG',
    statusFailed:     '处理失败：',
    tolPrecise:       '精准',
    tolMedium:        '适中',
    tolLoose:         '宽松',
    tolMax:           '最强',
  },

  ja: {
    appDesc:          'スマート背景除去 · ローカル処理・アップロード不要',
    removalStrength:  '除去強度',
    precise:          '精密',
    loose:            '広め',
    removeBtn:        '背景除去',
    downloadBtn:      '↓ PNG ダウンロード',
    panelOriginal:    '元画像',
    dropHint:         'ドロップ / クリック / 貼り付け',
    dropFormats:      'PNG · JPG · WebP · GIF',
    panelOutput:      '透明背景出力',
    waitingMsg:       '待機中',
    processingMsg:    '処理中…',
    statusReady:      '準備完了 · 画像をアップロード',
    statusLocal:      '完全ローカル処理 · データ送信なし',
    errUnsupported:   '対応していないファイル形式',
    statusLoaded:     (w, h) => `読込完了 ${w}×${h}`,
    statusProcessing: '処理中…',
    bgSolid:          '単色背景',
    bgChecker:        'チェッカー背景',
    bgMixed:          '混合背景',
    statusDone:       '完了 ✓  透明 PNG ダウンロード可能',
    statusFailed:     '処理に失敗: ',
    tolPrecise:       '精密',
    tolMedium:        '標準',
    tolLoose:         '広め',
    tolMax:           '最大',
  },

  ko: {
    appDesc:          '스마트 배경 제거 · 로컬 처리, 업로드 없음',
    removalStrength:  '제거 강도',
    precise:          '정밀',
    loose:            '넓게',
    removeBtn:        '배경 제거',
    downloadBtn:      '↓ PNG 다운로드',
    panelOriginal:    '원본',
    dropHint:         '드롭 / 클릭 / 붙여넣기',
    dropFormats:      'PNG · JPG · WebP · GIF',
    panelOutput:      '투명 배경 출력',
    waitingMsg:       '대기 중',
    processingMsg:    '처리 중…',
    statusReady:      '준비됨 · 이미지를 업로드하세요',
    statusLocal:      '완전 로컬 실행 · 데이터 업로드 없음',
    errUnsupported:   '지원하지 않는 파일 형식',
    statusLoaded:     (w, h) => `로드됨 ${w}×${h}`,
    statusProcessing: '처리 중…',
    bgSolid:          '단색 배경',
    bgChecker:        '체커보드 배경',
    bgMixed:          '혼합 배경',
    statusDone:       '완료 ✓  투명 PNG 다운로드 가능',
    statusFailed:     '처리 실패: ',
    tolPrecise:       '정밀',
    tolMedium:        '보통',
    tolLoose:         '넓게',
    tolMax:           '최대',
  },
};

const SUPPORTED = Object.keys(LOCALES);

export let currentLang = (() => {
  const stored = localStorage.getItem('purepng-lang');
  if (stored && SUPPORTED.includes(stored)) return stored;
  const nav = (navigator.language || 'en').toLowerCase();
  if (nav.startsWith('zh')) return 'zh-CN';
  if (nav.startsWith('ja')) return 'ja';
  if (nav.startsWith('ko')) return 'ko';
  return 'en';
})();

export function t(key, ...args) {
  const dict = LOCALES[currentLang] || LOCALES.en;
  const val  = dict[key] ?? LOCALES.en[key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
}

export function applyLang(code) {
  if (code && SUPPORTED.includes(code)) currentLang = code;
  localStorage.setItem('purepng-lang', currentLang);
  document.documentElement.lang = currentLang;

  const titles = { 'zh-CN': '智能去背景', ja: '背景除去ツール', ko: '배경 제거 도구' };
  document.title = 'PurePNG — ' + (titles[currentLang] || 'Background Remover');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  const sel = document.getElementById('lang-sel');
  if (sel) sel.value = currentLang;
}
