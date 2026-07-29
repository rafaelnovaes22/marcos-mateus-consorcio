#!/usr/bin/env python3
"""Auditoria estática da landing. Executar a partir da raiz do repositório."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, parse_qs, unquote
import json
import re
import xml.etree.ElementTree as ET
import sys

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "styles.css").read_text(encoding="utf-8") if (ROOT / "styles.css").exists() else ""
JS = (ROOT / "script.js").read_text(encoding="utf-8") if (ROOT / "script.js").exists() else ""

class AuditParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.images = []
        self.buttons = []
        self.meta = []
        self.html_attrs = {}
        self._in_title = False
        self.title = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.html_attrs = attrs
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "a":
            self.links.append(attrs)
        if tag == "img":
            self.images.append(attrs)
        if tag == "button":
            self.buttons.append(attrs)
        if tag == "meta":
            self.meta.append(attrs)
        if tag == "title":
            self._in_title = True

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data

parser = AuditParser()
parser.feed(HTML)
plain = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", HTML)).strip()
errors = []

def require(condition, message):
    if not condition:
        errors.append(message)

# Documento e SEO
require(parser.html_attrs.get("lang") == "pt-BR", "html precisa declarar lang=pt-BR")
require("Consórcio Ademicon em São Paulo" in parser.title, "title SEO ausente")
require(any(m.get("name") == "description" and m.get("content") for m in parser.meta), "meta description ausente")
require(any(m.get("property") == "og:title" for m in parser.meta), "Open Graph ausente")
require('rel="canonical"' in HTML, "canonical ausente")
require('https://www.marcosmateusconsorcio.com.br/' in HTML, "domínio canônico ausente")
require((ROOT / "robots.txt").exists(), "robots.txt ausente")
require((ROOT / "sitemap.xml").exists(), "sitemap.xml ausente")
DOCKERFILE = (ROOT / "Dockerfile").read_text(encoding="utf-8") if (ROOT / "Dockerfile").exists() else ""
require("COPY robots.txt" in DOCKERFILE and "COPY sitemap.xml" in DOCKERFILE, "Dockerfile precisa publicar robots.txt e sitemap.xml")
require("Sitemap: https://www.marcosmateusconsorcio.com.br/sitemap.xml" in (ROOT / "robots.txt").read_text(encoding="utf-8"), "robots.txt sem sitemap canônico")
try:
    ET.parse(ROOT / "sitemap.xml")
except ET.ParseError as exc:
    errors.append(f"sitemap.xml inválido: {exc}")

json_ld_blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', HTML, re.S)
require(len(json_ld_blocks) >= 2, "JSON-LD de serviço e FAQ ausentes")
for block in json_ld_blocks:
    try:
        json.loads(block)
    except json.JSONDecodeError as exc:
        errors.append(f"JSON-LD inválido: {exc}")
require('"@type": "FinancialService"' in HTML, "schema FinancialService ausente")
require('"@type": "FAQPage"' in HTML, "schema FAQPage ausente")

# Ordem e estrutura
required_ids = ["inicio", "prova", "cartas", "como-funciona", "investimento", "sobre", "depoimentos", "faq", "contato"]
positions = [HTML.find(f'id="{section}"') for section in required_ids]
require(all(pos >= 0 for pos in positions), "uma ou mais seções obrigatórias estão ausentes")
require(positions == sorted(positions), "ordem das seções está incorreta")
require('class="skip-link"' in HTML, "link de salto ausente")
require('aria-expanded="false"' in HTML, "controles expansíveis precisam de aria-expanded")

# Cartas e valores
cards = [
    ("R$ 40 mil", "R$ 278,88"),
    ("R$ 60 mil", "R$ 418,32"),
    ("R$ 100 mil", "R$ 742,67"),
    ("R$ 150 mil", "R$ 871,50"),
    ("R$ 300 mil", "R$ 1.011,90"),
    ("R$ 500 mil", "R$ 1.800,00"),
    ("R$ 80 mil", "R$ 269,84"),
    ("R$ 100 mil", "R$ 337,30"),
]
require(HTML.count('class="plan-card') == 8, "carrossel precisa ter exatamente 8 cartas")
for credit, installment in cards:
    require(credit in plain and installment in plain, f"carta/valor ausente: {credit} / {installment}")
require("01 / 08" in plain, "contador 01 / 08 ausente")
require("Mais procurado" in plain, "tag Mais procurado ausente")

# Prova e conteúdo factual
proof_plain = plain.replace("+ ", "+")
for fact in ("35 anos", "+675 mil", "R$ 145 bi", "300 lojas"):
    require(fact in proof_plain, f"prova institucional ausente: {fact}")
require("sem juros de financiamento" in plain.lower(), "mensagem sem juros de financiamento ausente")
require("até 30%" in plain, "ágio de até 30% ausente")
require("café" in plain.lower(), "rapport de café ausente na bio")
for term in ("consórcio em são paulo", "consultor autorizado ademicon", "consórcio de imóveis", "veículos", "planejamento patrimonial", "whatsapp"):
    require(term in plain.lower(), f"termo SEO/GEO ausente: {term}")
require("o atendimento pelo whatsapp é feito diretamente pelo marcos" in plain.lower(), "FAQ precisa esclarecer atendimento humano no WhatsApp")

# Bloco legal integral
legal = [
    "Consórcio não é financiamento. A contemplação ocorre por sorteio ou lance, conforme regulamento do grupo, sem garantia de data.",
    "A Ademicon não comercializa cotas com data certa para contemplação ou contempladas.",
    "Valores sujeitos a alteração conforme grupo vigente. Contratação sujeita a análise e assinatura dos documentos oficiais.",
    "Administradora autorizada e regulada pelo Banco Central do Brasil.",
    "Atendimento realizado pelo Marcos via WhatsApp; não há assistente virtual ou agente automatizado nesta etapa.",
]
for sentence in legal:
    require(sentence in plain, f"frase legal ausente: {sentence}")

# Compliance e redação
for forbidden in ("renda garantida", "lucro certo", "contemplação rápida", "melhor investimento do mundo"):
    require(forbidden not in plain.lower(), f"expressão proibida encontrada: {forbidden}")
require("—" not in HTML, "travessão encontrado no HTML")
require("✓" not in HTML, "checklist genérico encontrado")
require("A contemplação ocorre por sorteio ou lance, conforme regulamento. Não há data garantida nem rentabilidade garantida. Recompra conforme condições vigentes da administradora." in plain, "disclaimer de investimento ausente")
require("Parcelas reduzidas até a contemplação ou até 24 meses, conforme o grupo. Valores do grupo vigente, sujeitos a alteração. Consulte condições." in plain, "nota das cartas ausente")

# WhatsApp por origem
wa_links = [a.get("href", "") for a in parser.links if a.get("href", "").startswith("https://wa.me/")]
require(len(wa_links) >= 12, "CTAs de WhatsApp insuficientes")
for href in wa_links:
    parsed = urlparse(href)
    require(parsed.path == "/5511922247346", f"número incorreto em {href}")
    text = unquote(parse_qs(parsed.query).get("text", [""])[0])
    require("Origem:" in text, f"CTA sem identificação de origem: {href}")

# Assets e zero dependências externas de runtime
external_runtime = re.findall(r'(?:src|href)="(https?://[^"]+)"', HTML)
external_runtime = [u for u in external_runtime if not u.startswith("https://wa.me/") and not u.startswith("https://www.marcosmateusconsorcio.com.br") and not u.startswith("https://marcos-mateus-consorcio-production.up.railway.app")]
require(not external_runtime, f"dependências externas encontradas: {external_runtime}")
require((ROOT / "assets" / "marcos-mateus.jpg").exists(), "foto original do Marcos ausente")
require("filter:" not in CSS or "filter:none" in CSS, "foto não deve receber filtro")
for img in parser.images:
    require(img.get("alt") is not None, "imagem sem atributo alt")
    require(img.get("width") and img.get("height"), "imagem sem dimensões declaradas")

# UI e acessibilidade
require("scroll-snap-type" in CSS, "swipe/carrossel nativo ausente")
require("prefers-reduced-motion" in CSS, "preferência de movimento reduzido ausente")
require(":focus-visible" in CSS, "foco visível ausente")
require("min-height:44px" in CSS.replace(" ", ""), "tap targets mínimos de 44px ausentes")
require("IntersectionObserver" in JS, "animação progressiva sem IntersectionObserver")
require("pointerdown" in JS, "arrasto do carrossel ausente")
require("console." not in JS, "console statements encontrados")

if errors:
    print("AUDITORIA FALHOU")
    for item in errors:
        print(f"- {item}")
    sys.exit(1)
print("AUDITORIA OK")
