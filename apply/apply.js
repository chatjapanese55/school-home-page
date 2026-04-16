/* ============================================================
   Chat Japanese Tokyo — Registration Form Script
   apply.js
   ============================================================ */

// ── 要素取得 ──
const form        = document.getElementById('apply-form');
const container   = document.getElementById('form-container');
const successCard = document.getElementById('success-card');
const errorCard   = document.getElementById('error-card');
const submitBtn   = document.getElementById('submit-btn');

// ── Google Apps Script Web App URL ──
// ⚠️ 以下のURLを実際のGoogle Apps Script デプロイURLに差し替えてください
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzj1a-Rxn1ONV_eHqfd6KJLMGQkKuSoqYTUrxM4Helzdh_3PVyQo3ZqPwpd6G62TvLvlw/exec';

/* ============================================================
   フォーム送信
   ============================================================ */
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  if (!validateForm()) return;

  submitBtn.disabled    = true;
  submitBtn.textContent = 'Submitting…';

  const data    = new FormData(form);
  const payload = Object.fromEntries(data.entries());

  try {
    await fetch(GAS_URL, {
      method:  'POST',
      body:    JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      mode:    'no-cors', // Google Apps Script は no-cors で受け取る
    });

    // ── GTM dataLayer push（フォーム送信成功イベント）──
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event:           'form_submission',
      form_name:       'chat_japanese_application',
      course_selected: payload.course      || '',
      duration:        payload.duration    || '',
      persons:         payload.persons     || '',
      nationality:     payload.nationality || '',
    });

    showSuccess();

  } catch (err) {
    console.error('Submission error:', err);

    // ── GTM dataLayer push（エラー記録）──
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event:         'form_submission_error',
      form_name:     'chat_japanese_application',
      error_message: err.message,
    });

    showError();
  }
});

/* ============================================================
   バリデーション
   ============================================================ */
function validateForm() {
  let valid = true;

  // テキスト・メール・電話・日付・チェックボックス
  const requiredInputs = form.querySelectorAll('input[required], textarea[required]');

  requiredInputs.forEach(input => {
    clearError(input);

    if (input.type === 'checkbox') {
      if (!input.checked) {
        input.closest('.checkbox-row').querySelector('label').style.color = '#e05252';
        valid = false;
      }
    } else if (!input.value.trim()) {
      setError(input);
      valid = false;
    }
  });

  // ラジオボタングループ（course / duration / persons）
  ['course', 'duration', 'persons'].forEach(name => {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    if (!checked) {
      form.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
        const lbl = radio.nextElementSibling;
        if (lbl) lbl.style.borderColor = '#e05252';
      });
      valid = false;
    }
  });

  // 最初のエラー要素までスクロール
  if (!valid) {
    const firstError = form.querySelector(
      'input[style*="e05252"], label[style*="e05252"]'
    );
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return valid;
}

function setError(input) {
  input.style.borderColor = '#e05252';
  input.style.boxShadow   = '0 0 0 3px rgba(224, 82, 82, 0.12)';
}

function clearError(input) {
  input.style.borderColor = '';
  input.style.boxShadow   = '';
}

/* ============================================================
   画面切り替え
   ============================================================ */
function showSuccess() {
  container.style.display = 'none';
  successCard.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showError() {
  container.style.display = 'none';
  errorCard.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function retryForm() {
  errorCard.classList.remove('active');
  container.style.display  = 'block';
  submitBtn.disabled        = false;
  submitBtn.textContent     = 'Submit Application →';
}

/* ============================================================
   入力時にバリデーションエラーをリセット
   ============================================================ */
form.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('input', () => clearError(el));
});
