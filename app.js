/**
 * PWA Gov.br - Navegação entre telas: Login → Carregando → Home
 */

document.addEventListener('contextmenu', (e) => e.preventDefault());

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then((reg) => console.log('SW registrado:', reg.scope))
      .catch((err) => console.warn('SW falhou:', err));
  });
}

const VIEWS = ['login', 'loading', 'home', 'carteira', 'document'];
const LOADING_DURATION_MS = 2200;
const DOC_IMAGES = ['images/cpf1.png', 'images/cpf2.png'];
let docStep = 1;

function getViewId(name) {
  return document.getElementById('view-' + name);
}

function setAppState(viewName) {
  const app = document.getElementById('app');
  VIEWS.forEach((name) => app.classList.remove('app--' + name));
  app.classList.add('app--' + viewName);
}

function showView(name) {
  VIEWS.forEach((id) => {
    const el = getViewId(id);
    if (!el) return;
    el.classList.remove('view-active', 'view-leaving');
    if (id === name) el.classList.add('view-active');
  });
  setAppState(name);
}

// Botão "Entrar com gov.br": Login → Carregando → Home
document.getElementById('btn-entrar')?.addEventListener('click', () => {
  showView('loading');
  setTimeout(() => {
    showView('home');
  }, LOADING_DURATION_MS);
});

// Links da tela de login: evitar navegação
document.getElementById('btn-qr')?.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('Ler QR Code');
});
document.getElementById('link-codigo')?.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('Gerar código de acesso');
});

// Bottom nav: troca de item ativo e navega entre home / carteira
document.querySelectorAll('.bottom-nav__item').forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const view = item.getAttribute('data-view');
    document.querySelectorAll('.bottom-nav__item').forEach((i) => i.classList.remove('bottom-nav__item--active'));
    item.classList.add('bottom-nav__item--active');
    if (view === 'home' || view === 'carteira') showView(view);
  });
});

// Clicar em "Carteira de documentos" na lista de serviços → abre a tela carteira
document.querySelectorAll('.service-item[data-open="carteira"]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    showView('carteira');
    document.querySelectorAll('.bottom-nav__item').forEach((i) => {
      i.classList.remove('bottom-nav__item--active');
      if (i.getAttribute('data-view') === 'carteira') i.classList.add('bottom-nav__item--active');
    });
  });
});

// Botão Voltar na tela Carteira → volta para a home
document.getElementById('btn-carteira-back')?.addEventListener('click', () => {
  showView('home');
  document.querySelectorAll('.bottom-nav__item').forEach((i) => {
    i.classList.remove('bottom-nav__item--active');
    if (i.getAttribute('data-view') === 'home') i.classList.add('bottom-nav__item--active');
  });
});

// Card clicável → abre a tela de documento (cpf1)
document.getElementById('btn-doc-card')?.addEventListener('click', () => {
  docStep = 1;
  setDocImage(1);
  setDocDots(1);
  showView('document');
  document.querySelectorAll('.bottom-nav__item').forEach((i) => {
    i.classList.remove('bottom-nav__item--active');
    if (i.getAttribute('data-view') === 'carteira') i.classList.add('bottom-nav__item--active');
  });
});

function setDocImage(step) {
  const img = document.getElementById('doc-viewer-img');
  if (img && DOC_IMAGES[step - 1]) img.src = DOC_IMAGES[step - 1];
}

function setDocDots(step) {
  document.querySelectorAll('.doc-dots__dot').forEach((dot, i) => {
    dot.classList.toggle('doc-dots__dot--active', i + 1 === step);
    dot.setAttribute('aria-current', i + 1 === step ? 'true' : null);
  });
}

// Clique no lado direito da área do documento → próximo (cpf2)
document.getElementById('doc-tap-next')?.addEventListener('click', (e) => {
  e.preventDefault();
  if (docStep < DOC_IMAGES.length) {
    docStep += 1;
    setDocImage(docStep);
    setDocDots(docStep);
  }
});

// Clique no lado esquerdo → anterior (cpf1)
document.getElementById('doc-tap-prev')?.addEventListener('click', (e) => {
  e.preventDefault();
  if (docStep > 1) {
    docStep -= 1;
    setDocImage(docStep);
    setDocDots(docStep);
  }
});

// Voltar da tela de documento → Carteira de documentos
document.getElementById('btn-doc-back')?.addEventListener('click', () => {
  showView('carteira');
  document.querySelectorAll('.bottom-nav__item').forEach((i) => {
    i.classList.remove('bottom-nav__item--active');
    if (i.getAttribute('data-view') === 'carteira') i.classList.add('bottom-nav__item--active');
  });
});

// Dots clicáveis para ir ao passo
document.querySelectorAll('.doc-dots__dot').forEach((dot) => {
  dot.addEventListener('click', () => {
    const step = parseInt(dot.getAttribute('data-step'), 10);
    if (step >= 1 && step <= DOC_IMAGES.length) {
      docStep = step;
      setDocImage(docStep);
      setDocDots(docStep);
    }
  });
});

// Evitar navegação nos outros itens da lista de serviços
document.querySelectorAll('.service-item:not([data-open])').forEach((el) => {
  el.addEventListener('click', (e) => e.preventDefault());
});

showView('login');
