# Marcos Mateus — Consórcio Ademicon

Landing page comercial do consultor Marcos Mateus, autorizado Ademicon, com cartas de consórcio, conteúdo explicativo e atendimento pelo WhatsApp.

## Página principal

A página principal (`index.html`) apresenta o consultor, explica o funcionamento do consórcio e organiza cartas para três objetivos:

- veículos;
- imóveis;
- investimento.

Ela posiciona Marcos Mateus como consultor autorizado Ademicon, apresenta condições documentadas e deixa explícito que não há promessa de contemplação ou rentabilidade.

Os CTAs abrem o WhatsApp comercial `+55 11 92224-7346` com mensagens pré-preenchidas e identificação da seção de origem.

## Versão de diagnóstico preservada

O histórico do Git mantém a proposta anterior baseada nos objetivos “comprar imóvel”, “trocar de veículo” e “planejar patrimônio”.

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

- `index.html`: estrutura e conteúdo da landing page;
- `styles.css`: direção visual responsiva e componentes;
- `script.js`: menu móvel, filtros, carrossel e animações progressivas;
- `assets/`: imagens e fonte locais; as fotografias do Marcos são os arquivos originais fornecidos, sem filtros ou retoques;
- `assets/SHA256SUMS`: checksums das fotografias originais para impedir substituições ou alterações acidentais;
- `alternativas/consultor/`: segunda direção visual;
- `previews/`: capturas desktop e mobile para referência.

## Operação

- validar periodicamente cartas, parcelas e condições comerciais com a Ademicon;
- adicionar políticas de privacidade e tratamento LGPD;
- configurar domínio próprio e métricas de conversão.

> Os perfis e características exibidos neste protótipo são ilustrativos. A contemplação ocorre por sorteio ou lance, de acordo com as regras do grupo.
