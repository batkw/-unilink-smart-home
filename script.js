const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const menuToggle = $('.menu-toggle');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const nav = $('#nav');
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
}

$$('.main-nav a').forEach(a => {
  a.addEventListener('click', () => {
    $('#nav')?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const scenes = {
  welcome: {
    label: 'SCENE 01',
    title: 'أهلاً بعودتك',
    text: 'مشهد يجمع الإضاءة المريحة وإعدادات التكييف والستائر المتوافقة مع نظامك.',
    state: 'COMFORT MODE',
    className: 'scene-welcome'
  },
  movie: {
    label: 'SCENE 02',
    title: 'وقت الأفلام',
    text: 'إضاءة أهدأ وأجواء مناسبة للمشاهدة، بحسب التجهيزات التي تختارها.',
    state: 'MOVIE MODE',
    className: 'scene-movie'
  },
  night: {
    label: 'SCENE 03',
    title: 'ليلة هادئة',
    text: 'جهّز مشهد النوم الذي يناسبك، مثل إطفاء إنارات محددة وإغلاق الستائر المتوافقة.',
    state: 'NIGHT MODE',
    className: 'scene-night'
  },
  away: {
    label: 'SCENE 04',
    title: 'البيت في وضع المغادرة',
    text: 'إعدادات تساعدك على إطفاء الإنارة المحددة ومراجعة الأنظمة الأمنية المدعومة.',
    state: 'AWAY MODE',
    className: 'scene-away'
  }
};

$$('.scene-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.scene-tab').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const scene = scenes[btn.dataset.scene];
    const preview = $('#scenePreview');

    if (!scene || !preview) return;

    preview.className = `scene-preview ${scene.className}`;
    $('#sceneLabel').textContent = scene.label;
    $('#sceneTitle').textContent = scene.title;
    $('#sceneText').textContent = scene.text;
    $('#sceneState').textContent = scene.state;
  });
});

let quizStep = 0;
const quizAnswers = {};
const steps = $$('.quiz-step');

function renderQuiz() {
  if (!steps.length) return;

  steps.forEach((step, i) => {
    step.classList.toggle('hidden', i !== quizStep);
  });

  const result = $('#quizResult');
  if (result) result.classList.add('hidden');

  const progressText = $('#progressText');
  const progressBar = $('#progressBar');
  const quizBack = $('#quizBack');
  const quizNext = $('#quizNext');

  if (progressText) {
    progressText.textContent = `السؤال ${quizStep + 1} من ${steps.length}`;
  }

  if (progressBar) {
    progressBar.style.width = `${((quizStep + 1) / steps.length) * 100}%`;
  }

  if (quizBack) quizBack.disabled = quizStep === 0;

  if (quizNext) {
    const key = steps[quizStep].querySelector('.option')?.dataset.key;
    quizNext.disabled = !quizAnswers[key];
    quizNext.textContent =
      quizStep === steps.length - 1 ? 'عرض الملخص ↙' : 'التالي ↙';
  }
}

$$('.option').forEach(btn => {
  btn.addEventListener('click', () => {
    const step = btn.closest('.quiz-step');

    $$('.option', step).forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    quizAnswers[btn.dataset.key] = btn.dataset.value;

    const next = $('#quizNext');
    if (next) next.disabled = false;
  });
});

$('#quizNext')?.addEventListener('click', () => {
  if (quizStep < steps.length - 1) {
    quizStep++;
    renderQuiz();
    return;
  }

  const progressText = $('#progressText');
  const progressBar = $('#progressBar');
  const result = $('#quizResult');
  const summary = $('#resultSummary');
  const next = $('#quizNext');
  const back = $('#quizBack');

  if (progressText) progressText.textContent = 'ملخص احتياجاتك';
  if (progressBar) progressBar.style.width = '100%';

  steps.forEach(s => s.classList.add('hidden'));
  result?.classList.remove('hidden');

  if (back) back.disabled = true;
  if (next) next.disabled = true;

  if (summary) {
    summary.textContent =
      `مشروعك: ${quizAnswers.property || 'غير محدد'}؛ ` +
      `أولويتك: ${quizAnswers.priority || 'غير محددة'}؛ ` +
      `توقيتك: ${quizAnswers.timing || 'غير محدد'}. ` +
      'خذ هالملخص معاك لموعد الاستشارة.';
  }
});

$('#quizBack')?.addEventListener('click', () => {
  if (quizStep > 0) {
    quizStep--;
    renderQuiz();
  }
});

$('#resetQuiz')?.addEventListener('click', () => {
  Object.keys(quizAnswers).forEach(key => delete quizAnswers[key]);
  $$('.option').forEach(btn => btn.classList.remove('selected'));

  quizStep = 0;
  renderQuiz();
});

$('#bookFromQuiz')?.addEventListener('click', () => {
  const form = $('#bookingForm');
  if (!form) return;

  const notes = form.querySelector('[name="notes"]');
  const project = form.querySelector('[name="project"]');

  if (notes) {
    notes.value =
      `ملخص الاستبيان — نوع المشروع: ${quizAnswers.property || 'غير محدد'}؛ ` +
      `الأولوية: ${quizAnswers.priority || 'غير محددة'}؛ ` +
      `التوقيت: ${quizAnswers.timing || 'غير محدد'}.`;
  }

  if (project) project.value = quizAnswers.property || '';

  $('#visit')?.scrollIntoView({ behavior: 'smooth' });
});

const dateInput = $('#bookingForm [name="date"]');

if (dateInput) {
  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  ).toISOString().slice(0, 10);

  dateInput.min = localDate;
}

$('#bookingForm')?.addEventListener('submit', event => {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const data = Object.fromEntries(new FormData(form).entries());

  // نموذج تجريبي فقط؛ يلزم ربطه بخدمة خارجية لاستقبال الطلبات فعلياً.
  try {
    const key = 'unilink_demo_booking_requests';
    const requests = JSON.parse(localStorage.getItem(key) || '[]');

    requests.push({
      ...data,
      status: 'بانتظار تأكيد الفريق',
      createdAt: new Date().toISOString()
    });

    localStorage.setItem(key, JSON.stringify(requests));
  } catch (error) {
    console.error('تعذر حفظ طلب الموعد التجريبي:', error);
  }

  $('#formSuccess')?.classList.remove('hidden');
  $('#formSuccess')?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
  });

  const submitButton = form.querySelector('.submit-btn');
  if (submitButton) {
    submitButton.textContent = 'تم تسجيل الطلب التجريبي';
  }
});

renderQuiz();
