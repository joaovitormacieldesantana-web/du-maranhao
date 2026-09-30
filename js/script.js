/* =========================================================
   Du Maranhão | configurações e interações
   Edite o CONFIG para trocar número e horários.
   ========================================================= */

const CONFIG = {
  nome: 'Du Maranhão',
  // Número com DDI + DDD, só dígitos
  whatsapp: '5581979035679',
  fusoHorario: 'America/Recife',
  // 0 = domingo ... 6 = sábado. null = fechado. Fechamento depois da meia-noite funciona (ex.: '01:00')
  // Horário do cardápio executivo. Confira com o restaurante.
  horarios: {
    0: ['11:00', '20:00'],
    1: ['11:00', '00:00'],
    2: ['11:00', '00:00'],
    3: ['11:00', '00:00'],
    4: ['11:00', '00:00'],
    5: ['11:00', '01:00'],
    6: ['11:00', '01:00'],
  },
};

const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const linkWhats = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

/* ---------- Links de WhatsApp ---------- */
document.querySelectorAll('[data-wa]').forEach((el) => {
  const tipo = el.dataset.wa;
  const msg = tipo === 'cardapio'
    ? `Olá! Vim pelo site do ${CONFIG.nome}. Pode me mandar o cardápio com os preços?`
    : `Olá! Vim pelo site do ${CONFIG.nome} e quero reservar uma mesa.`;
  el.href = linkWhats(msg);
  el.target = '_blank';
  el.rel = 'noopener';
});

/* ---------- Cabeçalho, menu e botão fixo ---------- */
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('menu');
const waFloat = document.querySelector('.wa-float');
let ultimoY = window.scrollY;

function aoRolar() {
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 20);
  const descendo = y > ultimoY && y > window.innerHeight * 0.8;
  header.classList.toggle('is-hidden', descendo && !menu.classList.contains('is-open'));
  waFloat.classList.toggle('is-visible', y > window.innerHeight * 0.6);
  ultimoY = y;
}
window.addEventListener('scroll', aoRolar, { passive: true });
aoRolar();

function definirMenu(aberto) {
  toggle.setAttribute('aria-expanded', String(aberto));
  toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  menu.classList.toggle('is-open', aberto);
  header.classList.toggle('menu-open', aberto);
  document.body.style.overflow = aberto ? 'hidden' : '';
  document.body.classList.toggle('menu-aberto', aberto);
}
toggle.addEventListener('click', () => definirMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => definirMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu.classList.contains('is-open')) { definirMenu(false); toggle.focus(); }
});

/* ---------- Horário ao vivo ---------- */
const paraMinutos = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const formatarHora = (hhmm) => {
  const [h, m] = hhmm.split(':');
  if (h === '00' && m === '00') return '0h';
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
};

function agoraNoFuso() {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: CONFIG.fusoHorario, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const pegar = (t) => partes.find((p) => p.type === t).value;
  const mapa = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { dia: mapa[pegar('weekday')], minutos: (Number(pegar('hour')) % 24) * 60 + Number(pegar('minute')) };
}

function renderizarHorarios() {
  const corpo = document.getElementById('hours-body');
  const status = document.getElementById('status');
  const mini = document.querySelector('[data-status-mini]');
  const ordem = [1, 2, 3, 4, 5, 6, 0];
  const texto = (h) => (h ? `${formatarHora(h[0])} às ${formatarHora(h[1])}` : 'Fechado');

  corpo.innerHTML = ordem.map((d) => {
    const nome = DIAS[d].charAt(0).toUpperCase() + DIAS[d].slice(1);
    return `<tr data-dia="${d}"><th scope="row">${nome}</th><td>${texto(CONFIG.horarios[d])}</td></tr>`;
  }).join('');

  // Resumo no rodapé
  const rodape = document.getElementById('footer-hours');
  if (rodape) {
    rodape.innerHTML = ordem.map((d) => `${DIAS[d].slice(0, 3)} ${texto(CONFIG.horarios[d]).toLowerCase()}`).join('<br>');
  }

  const { dia, minutos } = agoraNoFuso();
  corpo.querySelector(`[data-dia="${dia}"]`)?.classList.add('is-today');
  status.classList.remove('is-open', 'is-closed');
  mini?.classList.remove('is-open');

  const abertoAte = (fim) => {
    status.textContent = `Aberto agora, fecha às ${formatarHora(fim)}`;
    status.classList.add('is-open');
    if (mini) { mini.textContent = `Aberto até ${formatarHora(fim)}`; mini.classList.add('is-open'); }
  };
  // Intervalo em minutos; fechamento depois da meia-noite vira > 1440
  const intervalo = (h) => {
    const ini = paraMinutos(h[0]);
    let fim = paraMinutos(h[1]);
    if (fim <= ini) fim += 1440;
    return [ini, fim];
  };

  // Expediente de ontem que atravessou a meia-noite
  const ontem = CONFIG.horarios[(dia + 6) % 7];
  if (ontem) {
    const [, fim] = intervalo(ontem);
    if (fim > 1440 && minutos < fim - 1440) { abertoAte(ontem[1]); return; }
  }

  const hoje = CONFIG.horarios[dia];
  if (hoje) {
    const [ini, fim] = intervalo(hoje);
    if (minutos >= ini && minutos < fim) { abertoAte(hoje[1]); return; }
  }

  status.classList.add('is-closed');
  if (mini) mini.textContent = 'Fechado agora';

  if (hoje && minutos < paraMinutos(hoje[0])) {
    status.textContent = `Fechado agora, abre hoje às ${formatarHora(hoje[0])}`;
    return;
  }
  for (let i = 1; i <= 7; i++) {
    const d = (dia + i) % 7;
    if (CONFIG.horarios[d]) {
      status.textContent = `Fechado agora, abre ${i === 1 ? 'amanhã' : DIAS[d]} às ${formatarHora(CONFIG.horarios[d][0])}`;
      return;
    }
  }
}
renderizarHorarios();
setInterval(renderizarHorarios, 60_000);

/* ---------- Reserva pelo WhatsApp ---------- */
const form = document.getElementById('reserva');
const erro = document.getElementById('form-error');
const campoData = document.getElementById('r-data');

// Data mínima = hoje, e já sugere hoje
const hojeISO = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
campoData.min = hojeISO;
campoData.value = hojeISO;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const dados = new FormData(form);
  const nome = (dados.get('nome') || '').trim();
  const data = dados.get('data');

  form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  if (!nome) {
    erro.textContent = 'Informe seu nome para enviarmos a reserva.';
    erro.hidden = false;
    form.nome.setAttribute('aria-invalid', 'true');
    form.nome.focus();
    return;
  }
  if (!data) {
    erro.textContent = 'Escolha o dia da reserva.';
    erro.hidden = false;
    campoData.setAttribute('aria-invalid', 'true');
    campoData.focus();
    return;
  }
  erro.hidden = true;

  const [a, m, d] = data.split('-').map(Number);
  const diaSemana = DIAS[new Date(a, m - 1, d).getDay()];
  const dataBR = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
  const ocasiao = dados.get('ocasiao');

  let msg = `Olá! Sou ${nome} e quero reservar uma mesa no ${CONFIG.nome}.\n\n`
    + `Pessoas: ${dados.get('pessoas')}\n`
    + `Dia: ${diaSemana}, ${dataBR}\n`
    + `Horário: ${dados.get('hora')}`;
  if (ocasiao) msg += `\nOcasião: ${ocasiao}`;

  window.open(linkWhats(msg), '_blank', 'noopener');
});

/* ---------- Cardápio em abas ---------- */
const abas = [...document.querySelectorAll('.mtab')];

function ativarAba(aba, focar = false) {
  abas.forEach((a) => {
    const ativa = a === aba;
    a.setAttribute('aria-selected', String(ativa));
    a.tabIndex = ativa ? 0 : -1;
    document.getElementById(a.getAttribute('aria-controls')).classList.toggle('is-active', ativa);
  });
  if (focar) aba.focus();
  aba.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}
abas.forEach((aba, i) => {
  aba.addEventListener('click', () => ativarAba(aba));
  // Setas do teclado entre as abas
  aba.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') ativarAba(abas[(i + 1) % abas.length], true);
    if (e.key === 'ArrowLeft') ativarAba(abas[(i - 1 + abas.length) % abas.length], true);
  });
});

// Categorias dentro de cada aba
document.querySelectorAll('.mchips').forEach((grupo) => {
  const chips = [...grupo.querySelectorAll('.mchip')];
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => {
        const ativo = c === chip;
        c.setAttribute('aria-pressed', String(ativo));
        document.getElementById(c.getAttribute('aria-controls')).classList.toggle('is-active', ativo);
      });
      chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });
});

/* ---------- Esconde o botão fixo quando o formulário/CTA está na tela ---------- */
const zonasSemBotao = document.querySelectorAll('#reservar, .cta-final');
if ('IntersectionObserver' in window) {
  const visiveis = new Set();
  const obsZona = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => (e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target)));
    document.body.classList.toggle('no-float', visiveis.size > 0);
  }, { threshold: 0.15 });
  zonasSemBotao.forEach((z) => obsZona.observe(z));
}

/* ---------- Revelação ao rolar ---------- */
const revelar = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revelar.forEach((el) => obs.observe(el));
} else {
  revelar.forEach((el) => el.classList.add('is-in'));
}

document.getElementById('ano').textContent = new Date().getFullYear();
