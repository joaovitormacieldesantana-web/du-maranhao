# Du Maranhão | Landing page

Página estática (HTML, CSS e JavaScript puros) focada em levar o visitante a reservar mesa pelo WhatsApp.

## Estrutura

```
du-maranhao/
├── index.html          conteúdo e seções (inclui o cardápio completo)
├── css/style.css       visual, cores e responsividade
├── js/script.js        WhatsApp, reserva, horário ao vivo, abas do cardápio, menu
└── assets/img/         logo (fundo transparente), favicon e fotos
```

## Como abrir

No VS Code: `Arquivo > Abrir pasta...` → pasta `du-maranhao` (a que contém `index.html`, `css`, `js` e `assets`) → botão direito no `index.html` → **Open with Live Server**.

## Cardápio

Fica na seção `#cardapio` do `index.html`, em quatro abas: Cardápio, Bebidas, Almoço executivo e Happy hour.
Foi transcrito dos PDFs oficiais **sem preços**. Para incluir ou tirar um prato, copie ou apague uma linha assim:

```html
<li class="mi"><span class="mi-name">Nome do prato</span><span class="mi-desc">Acompanhamentos</span></li>
```

## Já preenchido com dados dos cardápios

- WhatsApp (81) 97903-5679, telefone (81) 3469-2559 e Instagram @barerestaurantedumaranhao
- Horários de funcionamento, do happy hour e do almoço executivo

## Ainda falta

| O quê | Onde |
|---|---|
| Endereço | Busque `[Rua e número]` e `[Bairro, Cidade/UF]` no `index.html` |
| Horário de funcionamento | `js/script.js`, `CONFIG.horarios`. Os PDFs trazem dois horários diferentes, confirme qual vale |
| Depoimentos | Os textos são exemplos. Troque por avaliações reais |
| Fotos | Estão em baixa resolução (recortadas de um print). Troque pelas originais em `assets/img/` |
