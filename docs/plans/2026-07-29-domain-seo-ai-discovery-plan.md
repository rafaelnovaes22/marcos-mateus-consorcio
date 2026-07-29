# Domínio, SEO e Descoberta por IA Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Comprar/conectar um domínio forte para a landing do Marcos Mateus e preparar a página para descoberta por Google e chats de IA como ChatGPT, Gemini e Claude.

**Architecture:** A landing estática hospedada no Railway passará a responder por domínio próprio `.com.br`, com redirecionamento canônico, metadados, sitemap, robots, JSON-LD, FAQ e conteúdo de entidade/localidade. O domínio escolhido deve equilibrar marca pessoal, busca orgânica e segurança jurídica sem usar marca de terceiro no domínio.

**Tech Stack:** HTML/CSS/JS estático, Nginx via Railway, Registro.br DNS, Google Search Console, schema.org JSON-LD, sitemap XML e robots.txt.

---

## Decisão inicial: domínio recomendado

**Preferência principal:** `marcosmateusconsorcio.com.br`

**Domínio defensivo/alternativo recomendado:** `consorciomarcosmateus.com.br`

**Não recomendado:** domínio com `ademicon` no nome, salvo autorização formal da marca.

---

### Task 1: Confirmar domínio final no Registro.br

**Objective:** Escolher e comprar o domínio que será usado como canônico.

**Files:**
- No code changes.
- External: Registro.br.

**Step 1: Validar disponibilidade**

No Registro.br, validar estes domínios em ordem:

```text
marcosmateusconsorcio.com.br
consorciomarcosmateus.com.br
consultormarcosmateus.com.br
consorciocommarcosmateus.com.br
meuplanoconsorcio.com.br
```

**Step 2: Comprar o domínio principal**

Comprar o domínio escolhido no CPF/CNPJ correto do cliente/projeto.

**Step 3: Comprar domínio defensivo, se aprovado**

Se o orçamento permitir, comprar também:

```text
consorciomarcosmateus.com.br
```

**Verification:**

O Registro.br deve mostrar o domínio como registrado/ativo na conta correta.

---

### Task 2: Adicionar domínio customizado no Railway

**Objective:** Configurar o domínio próprio no serviço Railway da landing.

**Files:**
- External: Railway dashboard.
- Current public Railway URL: `https://marcos-mateus-consorcio-production.up.railway.app/`

**Step 1: Abrir projeto Railway**

Projeto:

```text
https://railway.com/project/ab9612db-0b9d-4aeb-bbb0-7a6ea9d6785b
```

**Step 2: Adicionar custom domain**

Adicionar o domínio escolhido, por exemplo:

```text
marcosmateusconsorcio.com.br
www.marcosmateusconsorcio.com.br
```

**Step 3: Copiar registros DNS indicados pelo Railway**

Railway normalmente pedirá CNAME/ALIAS ou configuração equivalente.

**Verification:**

Railway deve mostrar o domínio como pendente de DNS ou ativo após propagação.

---

### Task 3: Configurar DNS no Registro.br

**Objective:** Fazer o domínio apontar para o Railway.

**Files:**
- External: Registro.br DNS.

**Step 1: Configurar `www`**

Criar registro conforme instrução do Railway, normalmente:

```text
Tipo: CNAME
Nome: www
Destino: valor informado pelo Railway
```

**Step 2: Configurar domínio raiz**

Configurar o apex/root conforme Registro.br/Railway permitirem:

```text
marcosmateusconsorcio.com.br
```

Se o Registro.br não aceitar CNAME no root, usar a alternativa recomendada pelo Railway ou manter `www` como canônico.

**Step 3: Definir canônico**

Escolher um padrão:

```text
https://www.marcosmateusconsorcio.com.br/
```

ou

```text
https://marcosmateusconsorcio.com.br/
```

**Verification:**

Rodar:

```bash
dig marcosmateusconsorcio.com.br
dig www.marcosmateusconsorcio.com.br
curl -I https://www.marcosmateusconsorcio.com.br/
```

Expected: DNS resolvendo e HTTP `200` ou redirecionamento correto.

---

### Task 4: Atualizar metadados canônicos da landing

**Objective:** Trocar URLs Railway por domínio próprio nos metadados públicos.

**Files:**
- Modify: `index.html`

**Step 1: Atualizar Open Graph URL**

Trocar:

```html
<meta property="og:url" content="https://marcos-mateus-consorcio-production.up.railway.app/">
```

por:

```html
<meta property="og:url" content="https://www.marcosmateusconsorcio.com.br/">
```

**Step 2: Atualizar Open Graph Image**

Trocar domínio da imagem para o domínio novo:

```html
<meta property="og:image" content="https://www.marcosmateusconsorcio.com.br/assets/marcos-mateus.jpg">
```

**Step 3: Adicionar canonical**

Inserir no `<head>`:

```html
<link rel="canonical" href="https://www.marcosmateusconsorcio.com.br/">
```

**Verification:**

Rodar:

```bash
python3 tests/audit_landing.py
```

Expected: `AUDITORIA OK`.

---

### Task 5: Criar `robots.txt`

**Objective:** Permitir indexação e indicar o sitemap.

**Files:**
- Create: `robots.txt`

**Step 1: Criar arquivo**

```txt
User-agent: *
Allow: /

Sitemap: https://www.marcosmateusconsorcio.com.br/sitemap.xml
```

**Step 2: Validar via servidor local**

Run:

```bash
python3 -m http.server 8081
curl -fsS http://127.0.0.1:8081/robots.txt
```

Expected: conteúdo do robots.txt retornado.

---

### Task 6: Criar `sitemap.xml`

**Objective:** Facilitar descoberta pelo Google e outros crawlers.

**Files:**
- Create: `sitemap.xml`

**Step 1: Criar sitemap mínimo**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.marcosmateusconsorcio.com.br/</loc>
    <lastmod>2026-07-29</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

**Step 2: Validar XML**

Run:

```bash
python3 - <<'PY'
import xml.etree.ElementTree as ET
ET.parse('sitemap.xml')
print('SITEMAP OK')
PY
```

Expected: `SITEMAP OK`.

---

### Task 7: Adicionar JSON-LD de entidade/local business

**Objective:** Ajudar Google e LLMs a entenderem quem é Marcos Mateus, o que oferece e onde atende.

**Files:**
- Modify: `index.html`

**Step 1: Inserir schema no `<head>`**

Adicionar script JSON-LD com `FinancialService` ou `ProfessionalService`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": "Marcos Mateus Consórcio Ademicon",
  "url": "https://www.marcosmateusconsorcio.com.br/",
  "image": "https://www.marcosmateusconsorcio.com.br/assets/marcos-mateus.jpg",
  "description": "Consultoria em consórcio Ademicon para imóveis, veículos e planejamento patrimonial em São Paulo.",
  "areaServed": {
    "@type": "AdministrativeArea",
    "name": "São Paulo, SP"
  },
  "telephone": "+55 11 92224-7346",
  "founder": {
    "@type": "Person",
    "name": "Marcos Mateus"
  },
  "sameAs": []
}
</script>
```

**Step 2: Não prometer agente/automação**

Garantir que o schema e a página indiquem atendimento humano via WhatsApp.

**Verification:**

Usar Rich Results Test depois do deploy:

```text
https://search.google.com/test/rich-results
```

---

### Task 8: Adicionar JSON-LD de FAQPage

**Objective:** Melhorar interpretação da seção FAQ por buscadores e modelos de IA.

**Files:**
- Modify: `index.html`
- Optional: `script.js` if FAQ content is rendered dynamically.

**Step 1: Extrair perguntas reais da seção FAQ**

Usar apenas perguntas/respostas já presentes no HTML.

**Step 2: Criar schema `FAQPage`**

Adicionar no `<head>` ou final do `<body>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Consórcio tem juros?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Consórcio não tem juros de financiamento, mas possui taxa de administração e demais custos previstos em contrato."
      }
    }
  ]
}
</script>
```

**Verification:**

Validar que o JSON parseia:

```bash
python3 - <<'PY'
from pathlib import Path
import re, json
html = Path('index.html').read_text()
for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
    json.loads(block)
print('JSON-LD OK')
PY
```

---

### Task 9: Ajustar copy para SEO/GEO sem perder sofisticação

**Objective:** Inserir termos que Google e chats de IA esperam sem deixar a página genérica.

**Files:**
- Modify: `index.html`

**Step 1: Garantir termos-chave naturais**

Inserir/validar presença de:

```text
consórcio em São Paulo
consultor autorizado Ademicon
consórcio para imóveis
consórcio para veículos
planejamento patrimonial
simulação de consórcio
WhatsApp do Marcos Mateus
```

**Step 2: Evitar over-optimization**

Não repetir palavras-chave de forma artificial. Manter tom premium e direto.

**Step 3: Confirmar atendimento humano**

Manter claro:

```text
Atendimento realizado pelo Marcos via WhatsApp.
```

**Verification:**

Rodar busca local:

```bash
python3 - <<'PY'
from pathlib import Path
text = Path('index.html').read_text().lower()
terms = ['consórcio em são paulo','consultor autorizado ademicon','consórcio para imóveis','consórcio para veículos','planejamento patrimonial','whatsapp']
for t in terms:
    print(t, text.count(t))
PY
```

Expected: cada termo aparece pelo menos uma vez, sem excesso grosseiro.

---

### Task 10: Atualizar auditoria automatizada

**Objective:** Fazer os testes protegerem domínio, schema e ausência de promessa de agente.

**Files:**
- Modify: `tests/audit_landing.py`

**Step 1: Adicionar checks de domínio**

Garantir presença do domínio canônico:

```python
require('https://www.marcosmateusconsorcio.com.br/' in HTML, 'domínio canônico ausente')
```

**Step 2: Adicionar checks de arquivos SEO**

Validar existência:

```python
require((ROOT / 'robots.txt').exists(), 'robots.txt ausente')
require((ROOT / 'sitemap.xml').exists(), 'sitemap.xml ausente')
```

**Step 3: Proibir termos incorretos**

Adicionar blacklist:

```python
for forbidden in ['assistente virtual', 'agente automatizado', 'atendimento automático']:
    require(forbidden not in plain.lower(), f'termo incorreto presente: {forbidden}')
```

Observação: se mantivermos a frase legal “não há assistente virtual”, o teste deve permitir esse contexto específico ou trocar para:

```text
Atendimento realizado diretamente pelo Marcos via WhatsApp nesta etapa.
```

**Verification:**

Run:

```bash
python3 tests/audit_landing.py
```

Expected: `AUDITORIA OK`.

---

### Task 11: Deploy no Railway

**Objective:** Publicar domínio e ajustes SEO/GEO.

**Files:**
- Commit: `index.html`, `robots.txt`, `sitemap.xml`, `tests/audit_landing.py`.

**Step 1: Rodar testes locais**

```bash
python3 tests/audit_landing.py
NODE_PATH=/opt/data/work/consorcio-sales-agent/node_modules node tests/browser_audit.cjs
git diff --check
```

Expected:

```text
AUDITORIA OK
mobile-360: OK
tablet-768: OK
desktop-1280: OK
```

**Step 2: Commit**

```bash
git add index.html robots.txt sitemap.xml tests/audit_landing.py
git commit -m "feat: add domain and search discovery metadata"
```

**Step 3: Push**

```bash
env -u GH_TOKEN -u GITHUB_TOKEN git push origin main
```

**Step 4: Deploy Railway**

```bash
env -u RAILWAY_API_TOKEN -u RAILWAY_TOKEN /opt/data/.local/node_modules/.bin/railway up --detach --ci --project ab9612db-0b9d-4aeb-bbb0-7a6ea9d6785b --service 503b8691-58d7-4cbb-afc9-149a1b97823f --environment fdb46bee-e84e-458a-8f18-bfca3b366052
```

---

### Task 12: Verificação pública pós-deploy

**Objective:** Provar que o domínio, SEO e CTAs estão públicos.

**Files:**
- No code changes.

**Step 1: Verificar domínio**

```bash
curl -L -I https://www.marcosmateusconsorcio.com.br/
curl -L -fsS https://www.marcosmateusconsorcio.com.br/robots.txt
curl -L -fsS https://www.marcosmateusconsorcio.com.br/sitemap.xml
```

Expected: HTTP `200`.

**Step 2: Verificar HTML público**

```bash
curl -L -fsS https://www.marcosmateusconsorcio.com.br/ -o /tmp/marcos-domain.html
python3 - <<'PY'
from pathlib import Path
html = Path('/tmp/marcos-domain.html').read_text()
required = [
  'application/ld+json',
  'marcosmateusconsorcio.com.br',
  'Atendimento direto com o Marcos',
  'Simular agora no WhatsApp'
]
for item in required:
    assert item in html, item
print('PUBLIC DOMAIN OK')
PY
```

Expected: `PUBLIC DOMAIN OK`.

**Step 3: Capturar QA visual**

Abrir o domínio no browser e validar desktop/mobile.

**Verification:**

Sem quebras visuais, CTAs ativos, foto original preservada.

---

### Task 13: Configurar Google Search Console

**Objective:** Solicitar indexação oficial ao Google.

**Files:**
- External: Google Search Console.

**Step 1: Adicionar propriedade de domínio**

Adicionar:

```text
marcosmateusconsorcio.com.br
```

**Step 2: Validar posse**

Usar o TXT DNS informado pelo Search Console no Registro.br.

**Step 3: Enviar sitemap**

Enviar:

```text
https://www.marcosmateusconsorcio.com.br/sitemap.xml
```

**Step 4: Solicitar indexação da home**

Usar inspeção de URL e solicitar indexação.

**Verification:**

Search Console mostrando propriedade verificada e sitemap lido com sucesso.

---

### Task 14: Preparar descoberta por chats de IA

**Objective:** Aumentar a chance de ChatGPT/Gemini/Claude reconhecerem o site como fonte clara.

**Files:**
- Modify: `index.html`
- Optional future pages: `sobre.html`, `faq.html` if decidirmos expandir.

**Step 1: Entidade clara no topo e rodapé**

Garantir que o HTML diga claramente:

```text
Marcos Mateus é consultor autorizado Ademicon em São Paulo, com atendimento humano via WhatsApp para simulação de consórcio de imóveis, veículos e planejamento patrimonial.
```

**Step 2: Criar blocos de resposta direta**

Adicionar perguntas/respostas curtas que modelos de IA possam extrair:

```text
Quem é Marcos Mateus?
O que Marcos Mateus oferece?
Como falar com Marcos Mateus?
Marcos Mateus atende por agente de IA?
```

Resposta da última:

```text
Não. Nesta etapa, o atendimento pelo WhatsApp é feito diretamente pelo Marcos.
```

**Step 3: Evitar conteúdo falso**

Manter sem depoimentos fictícios, sem promessas de contemplação e sem promessa de rentabilidade.

**Verification:**

Executar leitura textual da página e confirmar que uma pessoa ou modelo entende: quem, o que, onde, como falar e limitações.

---

## Acceptance Criteria

- Domínio próprio comprado e configurado.
- HTTPS ativo no domínio próprio.
- Railway URL continua funcionando ou redireciona corretamente.
- `canonical`, `og:url` e `og:image` usam domínio próprio.
- `robots.txt` e `sitemap.xml` públicos.
- JSON-LD válido para serviço e FAQ.
- Página deixa claro que WhatsApp é atendido pelo Marcos, sem agente por enquanto.
- CTAs continuam apontando para `+55 11 92224-7346`.
- Google Search Console verificado e sitemap enviado.
- Pós-deploy validado com `curl`, navegador e auditorias existentes.

## Suggested Commit Sequence

1. `docs: add domain and search discovery plan`
2. `feat: add canonical domain metadata`
3. `feat: add robots and sitemap`
4. `feat: add structured data for search discovery`
5. `test: cover domain and discovery metadata`
6. `chore: publish custom domain configuration`
