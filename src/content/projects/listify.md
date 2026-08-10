---
title: Listify
slug: listify
description: Plataforma para comparar precios de supermercado en Argentina usando los datos públicos del SEPA. Ingiere millones de precios cada día, ubica las sucursales más baratas cerca tuyo y arma la canasta más económica repartida entre tiendas.
tags:
  - { name: 'React Native', icon: 'simple-icons:react', color: '#61dafb' }
  - { name: 'Expo', icon: 'simple-icons:expo', color: '#ffffff' }
  - { name: 'Zustand', icon: 'devicon:zustand', color: '#d4e4f4' }
  - { name: 'NestJS', icon: 'simple-icons:nestjs', color: '#E0234E' }
  - { name: 'PostgreSQL', icon: 'simple-icons:postgresql', color: '#4169e1' }
  - { name: 'Prisma', icon: 'simple-icons:prisma', color: '#5a67d8' }
  - { name: 'Redis', icon: 'simple-icons:redis', color: '#FF4438' }
accent: '#61dafb'
liveUrl: ''
repoUrl: https://github.com/Yeinthony/listify
featured: true
role: Desarrollador Full Stack (app móvil · API · panel admin)
stats:
  - { value: '3', label: 'repos: móvil · API · admin' }
  - { value: '~40K', label: 'líneas de código' }
  - { value: '~50', label: 'endpoints API' }
  - { value: '22', label: 'modelos de datos' }
challenges:
  - Ingerir el volcado diario del SEPA —un ZIP lleno de ZIPs con cientos de miles de precios— de forma rápida y tolerante a errores
  - Responder "¿dónde está más barato cerca mío?" en milisegundos sobre millones de precios geolocalizados
  - Calcular la canasta más económica repartida entre varias tiendas, con descuentos por medio de pago
learnings:
  - Ingesta de datos a gran escala con streaming y `COPY` en vez de inserciones fila por fila
  - Consultas geoespaciales reales con PostGIS (`ST_DWithin`, `ST_Distance`) e indexado GiST
  - 'Diseñar un producto full-stack completo: pipeline de datos, API, app móvil y back-office'
contributions:
  - Motor de ingesta SEPA dual-canal (retail y mayorista) de punta a punta
  - API en NestJS con búsqueda, precios cercanos, listas colaborativas, alertas y optimizador
  - App móvil en React Native con mapa interactivo, escáner de códigos y búsqueda en tiempo real
---

En Argentina el precio de la misma leche puede variar un 40% entre dos supermercados a tres cuadras de distancia. El Estado publica **todos** esos precios todos los días —es ley— pero en un formato que ningún humano puede usar: un archivo comprimido enorme, lleno de otros archivos comprimidos, con planillas crudas. Listify toma esos datos y los convierte en algo simple: **decirte dónde comprás tu canasta más barato, cerca tuyo.**

## El problema

El programa SEPA (Sistema Electrónico de Publicidad de Precios Argentinos) obliga a los comercios a publicar sus precios a diario. La información está ahí, pública y gratis, pero es prácticamente inutilizable: un volcado diario con cientos de miles de precios por comercio, sucursales sin geolocalizar, columnas inconsistentes. Comparar precios a mano es imposible, y las apps que existían no cruzaban precio con cercanía ni te decían cómo repartir la compra.

## Por qué lo construí

Lo construí primero por **necesidad propia**: con la inflación, elegir bien dónde comprar dejó de ser un detalle y pasó a ser plata real a fin de mes. Sabía que el dato existía, me frustraba que estuviera tan cerca y tan inservible a la vez.

Y lo tomé también como **el reto full-stack más ambicioso** que me podía poner: un pipeline de ingesta masiva, una base de datos geoespacial, un algoritmo de optimización y una app móvil pulida. Quería construir un producto de verdad, de punta a punta, no una demo.

## Qué hace

Listify es una plataforma en tres piezas —app móvil, API y panel de administración— que te deja:

- **Buscar cualquier producto** y ver su precio mínimo, promedio y máximo en el mercado.
- **Ver qué tiendas cercanas lo tienen** y a cuánto, ordenadas por distancia real en un mapa.
- **Armar listas de compra colaborativas** (con roles de lector, editor y dueño) y ver el total estimado en vivo.
- **Optimizar la canasta**: el algoritmo calcula la forma más barata de comprar toda tu lista repartida entre las tiendas cercanas, y te dice **cuánto ahorrás** frente a comprar todo en un solo lugar.
- **Recibir alertas** cuando baja el precio de un producto que te interesa (notificación push).
- **Escanear el código de barras** de un producto en la góndola para buscarlo al instante.

## Cómo funciona

El corazón del sistema es el **motor de ingesta del SEPA**, que corre todos los días de forma automática:

1. **Scrapea** la página del dataset para encontrar el ZIP del día.
2. **Descarga y descomprime** ese ZIP —que por dentro contiene un ZIP por cada comercio— tolerando archivos corruptos sin abortar toda la corrida.
3. **Carga los precios en streaming**: en vez de insertar fila por fila, transmite el CSV directo a PostgreSQL con `COPY`, manejando contrapresión, para meter cientos de miles de filas por comercio de forma eficiente.
4. **Deduplica y consolida** con SQL basado en conjuntos (un `INSERT ... SELECT` con upsert), no con miles de queries sueltas.
5. **Geolocaliza cada sucursal** en PostGIS y **guarda un snapshot histórico** de precios que alimenta los gráficos y dispara las alertas.

Cada corrida queda registrada con sus métricas, errores y warnings, y el panel de administración (React) las muestra en un dashboard para monitorear la salud del pipeline.

## Los retos técnicos

### El ZIP de ZIPs y la carga masiva

El dato del SEPA es hostil: archivos anidados, CSVs con filas malformadas, comillas sin balancear, números con formato inconsistente. La ingesta sanea cada fila al vuelo y usa `COPY ... FROM STDIN` sobre una tabla de staging, para después consolidar con un solo `INSERT ... SELECT` deduplicando por producto. La diferencia con insertar fila por fila no es de porcentaje: es de órdenes de magnitud.

### "¿Dónde está más barato, cerca mío?"

Esta pregunta parece simple y es de las más caras de responder sobre millones de precios geolocalizados. La resolví con **PostGIS**: cada sucursal guarda su punto geográfico (`geom`) con un índice GiST, y las consultas usan `ST_DWithin` para filtrar por radio y `ST_Distance` para ordenar por distancia real en metros. Una capa de cache en Redis, con claves que redondean las coordenadas, evita recalcular lo mismo ante el mínimo movimiento del GPS.

### El optimizador de canasta

El más lindo de todos. Dada tu lista y las tiendas cercanas, el problema es: **¿cómo reparto la compra para gastar menos?** Es una minimización combinatoria (comprar todo en una tienda casi nunca es lo óptimo). El algoritmo pre-filtra las mejores tiendas candidatas por cobertura y precio, hace una búsqueda acotada de subconjuntos, asigna cada producto a su sucursal más barata, aplica los descuentos por medio de pago y compara contra la mejor compra en una sola tienda para reportarte el **ahorro concreto** —y qué productos no consiguió cubrir.

## La app móvil

Del lado del cliente, la app está hecha en React Native con Expo Router. Tiene un mapa interactivo que dibuja las tiendas del plan y un radio alrededor tuyo, un escáner de códigos de barras que dibuja la mira con Skia y corrige el espejado de la cámara, y una búsqueda con scroll infinito y *debounce* para no castigar a la API en cada tecla. Toda la capa de datos está documentada con ADRs: separación entre estado de servidor (TanStack Query) y estado de sesión/UI (Zustand), y un cliente HTTP que normaliza todos los errores a un tipo propio.

## Qué me llevé

Listify fue mi máster acelerado de full-stack serio. Aprendí que mover datos a gran escala es un problema de diseño (streaming y operaciones en conjunto, no bucles), que "cerca mío" es una consulta geoespacial con nombre propio, y que un algoritmo bien pensado puede traducirse en plata real en el bolsillo de alguien. Terminé con una plataforma completa —datos, API, móvil y back-office— y con la certeza de que puedo llevar una idea desde un archivo público ilegible hasta un producto que resuelve un problema cotidiano.

## Repositorios

- **App móvil** — [github.com/Yeinthony/listify](https://github.com/Yeinthony/listify)
- **Backend / API** — [github.com/Yeinthony/listify-backend](https://github.com/Yeinthony/listify-backend)
- **Panel admin** — [github.com/Yeinthony/listify-admin](https://github.com/Yeinthony/listify-admin)
