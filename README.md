# Marcos Mateus — Diagnóstico de Consórcio

Protótipo aprovado para retomada e futura publicação da página do consultor Marcos Mateus, autorizado Ademicon.

## Versão principal

A página principal (`index.html`) começa pelo objetivo do visitante e conduz à identificação do perfil:

- comprar um imóvel;
- trocar de veículo;
- planejar patrimônio.

Ela comunica como a recomendação funciona e apresenta o consultor sem prometer contemplação.

## Alternativa preservada

A versão `alternativas/consultor/index.html` prioriza a apresentação do consultor e detalha três perfis ilustrativos de planejamento.

## Executar localmente

Não há dependências de frontend nem etapa de build.

```bash
python3 -m http.server 8000
```

Acesse `http://localhost:8000`.

## Publicação no Railway

O projeto inclui `Dockerfile`, `nginx.conf` e `railway.json`. O Railway constrói uma imagem Nginx, injeta a porta pela variável `PORT` e verifica a rota `/health` antes de liberar cada implantação.

Novos commits enviados para a branch conectada ao Railway podem ser publicados automaticamente.

## Estrutura

- `index.html`: versão principal aprovada;
- `assets/`: imagens locais usadas pelas páginas;
- `alternativas/consultor/`: segunda direção visual;
- `previews/`: capturas desktop e mobile para referência.

## Antes da produção

- substituir links e CTAs pelo WhatsApp/formulário real;
- validar textos, perfis e condições comerciais com a Ademicon;
- adicionar políticas de privacidade e tratamento LGPD;
- configurar domínio, métricas e hospedagem;
- otimizar imagens e aplicar SEO técnico.

> Os perfis e características exibidos neste protótipo são ilustrativos. A contemplação ocorre por sorteio ou lance, de acordo com as regras do grupo.
