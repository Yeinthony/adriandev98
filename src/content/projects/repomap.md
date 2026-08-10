---
title: repomap
slug: repomap
description: Herramienta de línea de comandos que documenta plataformas multi-repo con IA. Analiza el código localmente con AST, reconstruye cómo se conectan los servicios entre sí y genera un sitio de documentación navegable —sin enviar tu código al modelo.
tags:
  - { name: 'TypeScript', icon: 'simple-icons:typescript', color: '#3178c6' }
  - { name: 'Node.js', icon: 'simple-icons:nodedotjs', color: '#5FA04E' }
  - { name: 'Claude AI', icon: 'simple-icons:anthropic', color: '#D97757' }
  - { name: 'Ollama', icon: 'simple-icons:ollama', color: '#ffffff' }
  - { name: 'Jest', icon: 'simple-icons:jest', color: '#C21325' }
accent: '#D97757'
liveUrl: https://www.npmjs.com/package/@repomap/cli
repoUrl: https://github.com/Yeinthony/repomap
featured: true
role: Creador y desarrollador principal
stats:
  - { value: '5', label: 'paquetes npm' }
  - { value: '~11.6K', label: 'líneas de código' }
  - { value: '11', label: 'comandos CLI' }
  - { value: '12+', label: 'lenguajes vía AST' }
challenges:
  - Reconstruir cómo se llaman los servicios entre sí solo con análisis estático, sin ejecutar el código
  - Rastrear cadenas dinámicas de Spring (`@Value` → campo → concatenación → llamada HTTP) con un loop de punto fijo
  - Documentar con un LLM sin enviarle el código completo ni disparar el costo por tokens
learnings:
  - Diseño de una arquitectura de adapters que hace que sumar un nuevo LLM sea aditivo, no invasivo
  - Optimización real de costo y latencia con LLMs (cache-warming, generación paralela, presupuesto de tokens)
  - Cómo modelar un pipeline complejo (AST → grafo → IA → render) manteniéndolo observable y extensible
contributions:
  - Diseño e implementación del monorepo completo (core, CLI y 3 adapters) publicado como 5 paquetes en npm
  - Motor de detección estática cross-repo, incluido soporte first-class para Java/Spring Boot
  - Renderizador del sitio de documentación con grafo interactivo y diagramas con pan/zoom
---

Te sumás a un proyecto nuevo. Cinco servicios, tres equipos, cero documentación. Antes de tocar una línea de código, te pasás días —a veces semanas— haciendo ingeniería inversa de cómo se conecta todo: qué servicio le pega a cuál, dónde vive cada endpoint, por qué esa variable de entorno rompe todo en producción. **repomap existe para que eso tarde dos minutos en lugar de dos semanas.**

## El problema

La documentación de arquitectura tiene dos enemigos. El primero es que **nadie la escribe**: cuando el proyecto está distribuido en varios repos, ninguna persona tiene el mapa completo en la cabeza. El segundo es que, cuando existe, **queda vieja al día siguiente**: se escribe una vez, el código sigue cambiando y la doc se convierte en una mentira prolija.

Las herramientas con IA que aparecieron para resolver esto suelen tener dos problemas más: te piden mandar todo tu código a un modelo en la nube —un no rotundo para muchos equipos— y la factura de tokens escala con el tamaño del repo.

## Por qué lo construí

Lo construí porque viví las tres cosas: el dolor de caer en una plataforma sin mapa, la frustración de mantener docs que envejecen solas, y la incomodidad de tener que elegir entre documentar con IA o cuidar la privacidad y el presupuesto.

Quise una herramienta que **entienda la arquitectura leyendo el código, no adivinando**, que se pueda regenerar sola con cada cambio, y que sea honesta con tu código: que el modelo nunca vea el código completo, solo lo justo para escribir buena prosa.

## Qué hace

Apuntás repomap a la carpeta que contiene tus repos, esperás entre dos y cinco minutos, y obtenés un sitio HTML estático de calidad framework:

```bash
npm install -g @repomap/cli
cd ~/workspaces/mi-plataforma
repomap init      # detecta tus repos e interroga la config
repomap generate  # analiza, construye el grafo y genera la doc
repomap serve     # la abre en el navegador
```

El sitio incluye un **overview** general, una **página por servicio**, una página de **integraciones** (quién le habla a quién), un **grafo interactivo** de dependencias y **diagramas Mermaid** con pan y zoom. Y no es de un solo uso: en modo `watch` o vía GitHub Action, la documentación se **regenera sola** cuando el código cambia —y solo la sección afectada, no todo el sitio.

## Cómo funciona

El principio de diseño es una frase: **el análisis lo hace el código, la redacción la hace la IA.**

1. **AST por repo, en paralelo.** Cada repositorio se analiza con [graphify](https://github.com/Yeinthony/graphify-y), un motor de análisis estático en Python que extrae símbolos y relaciones sin ejecutar nada. En paralelo corren los detectores estáticos propios.
2. **Merge global.** Los grafos por repo se fusionan en un grafo cross-repo, y un detector recorre el código buscando las llamadas HTTP entre servicios.
3. **Compactación.** Todo ese conocimiento se destila en un esqueleto estructural de texto: alrededor del **5% del tamaño real del código**.
4. **IA.** Ese esqueleto —y solo ese— se le pasa al LLM (Claude, Claude Code u Ollama) para que escriba la prosa, los ejemplos y las analogías.
5. **Render.** El resultado se convierte en HTML, Markdown o JSON, y se cachea para las regeneraciones incrementales.

## Los retos técnicos

### Reconstruir las conexiones sin ejecutar el código

La parte más difícil —y la que más me enorgullece— es detectar qué servicio le pega a cuál **solo leyendo el código**. El detector busca llamadas salientes (`fetch`, `axios`, `requests`, `httpx`...) y resuelve cada una a un repo destino: por URL literal, por convención de variable de entorno (`${PAYMENTS_SERVICE_URL}/...`) o por nombre de servicio en `docker-compose`. Cada relación queda con su evidencia, para no inventar conexiones.

El caso extremo fue Java/Spring. Ahí la URL casi nunca está escrita al lado de la llamada: vive en una anotación `@Value("${core-catalog.base-url}")`, se guarda en un campo, se concatena con un path en otro método y recién ahí se usa. Lo resolví con un **rastreador de punto fijo**: un loop que hace varias pasadas propagando bindings (`@Value` → campo → concatenación → `restTemplate.exchange(...)`) hasta que no aparecen relaciones nuevas. Incluso hay un fallback para cuando el código elige la URL en tiempo de ejecución: emite una llamada sintética por cada base posible, para que ninguna dependencia se pierda.

### Enviarle al LLM solo el 5% que importa

Mandar todo el código no escala ni en costo ni en privacidad. La compactación arma un digest por capas y con presupuesto de tokens: primero el contexto de más confianza (READMEs y package.json, "la verdad de los autores"), después las señales estáticas (endpoints, deps, docker) y al final los derivados estructurales (relaciones cross-repo, comunidades del grafo). Cuando el presupuesto se agota, un ranking de símbolos garantiza que **la superficie de API que sostiene el sistema sobreviva** al recorte: los archivos que respaldan un endpoint rankean primero.

### Que la IA sea barata y rápida

Documentar una plataforma son muchas llamadas al modelo. Para que no cueste una fortuna ni tarde una eternidad diseñé dos cosas. Un patrón de **adapters** (Claude vía API, Claude Code por suscripción, Ollama local y gratis) que desacopla el motor de cualquier proveedor. Y una orquestación con **cache-warming**: se dispara primero la llamada que escribe el prefijo cacheable, y recién cuando el cache está caliente se abren en paralelo las llamadas por servicio —que reutilizan ese cache con ~90% de descuento. Cada llamada recibe solo su rebanada del grafo.

## Qué me llevé

repomap me obligó a pensar como diseñador de sistemas, no solo como programador: un pipeline con muchas etapas que tiene que ser observable, extensible y honesto con sus límites (el propio repo documenta qué no detecta, en vez de fingir que lo hace todo). Aprendí a integrar LLMs de verdad —midiendo tokens, latencia y costo por proveedor— y a diseñar una arquitectura donde sumar un lenguaje o un modelo nuevo es agregar, no reescribir. Es el proyecto donde más lejos llegué combinando análisis estático serio con IA aplicada con criterio.
