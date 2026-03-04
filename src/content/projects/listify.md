---
title: Listify
slug: listify
description: App móvil para comparar precios entre comercios, visualizar sucursales cercanas y gestionar listas de compras. Incluye procesamiento y normalización de datos públicos del SEPA.
tags:
  - { name: 'React Native', icon: 'simple-icons:react', color: '#61dafb' }
  - { name: 'Expo', icon: 'simple-icons:expo', color: '#ffffff' }
  - { name: 'Zustand', icon: 'devicon:zustand', color: '#d4e4f4' }
  - { name: 'NestJS', icon: 'simple-icons:nestjs', color: '#E0234E' }
  - { name: 'PostgreSQL', icon: 'simple-icons:postgresql', color: '#4169e1' }
accent: '#61dafb'
liveUrl: ''
repoUrl: https://github.com/Yeinthony/listify
featured: true
role: Desarrollador Full Stack
challenges:
  - Procesamiento y normalización de datasets masivos del SEPA con datos inconsistentes
  - Implementación de geolocalización para encontrar sucursales cercanas con precisión
  - Optimización de rendimiento en listas con miles de productos
learnings:
  - Manejo de datos públicos a gran escala y estrategias de normalización
  - Arquitectura de APIs REST escalables con NestJS
  - Gestión de estado eficiente en apps móviles con Zustand
contributions:
  - Desarrollo completo del backend con NestJS y PostgreSQL
  - Implementación del sistema de comparación de precios
  - Diseño e implementación de la UI/UX de la aplicación móvil
---

## Descripción detallada

Listify es una aplicación móvil diseñada para ayudar a los usuarios a comparar precios de productos entre diferentes comercios en Argentina. La app consume y procesa datos públicos del sistema SEPA (Sistema Electrónico de Publicidad de Precios Argentinos), normalizándolos para ofrecer una experiencia de búsqueda rápida y precisa.

Los usuarios pueden buscar productos, ver precios en distintos comercios, localizar sucursales cercanas en un mapa interactivo y gestionar listas de compras personalizadas para optimizar su presupuesto.

## Mi rol e impacto

Como desarrollador Full Stack, lideré tanto el desarrollo del backend como la implementación de la app móvil. Diseñé la arquitectura del servidor con NestJS, modelé la base de datos en PostgreSQL y construí la interfaz móvil con React Native y Expo.

## Retos técnicos

El mayor desafío fue procesar los datasets del SEPA, que contienen millones de registros con formatos inconsistentes. Implementé pipelines de normalización que limpian, categorizan y indexan los datos para permitir búsquedas eficientes.

Otro reto importante fue la integración de mapas con geolocalización para mostrar sucursales cercanas, optimizando las consultas geoespaciales en la base de datos.

## Aprendizajes

Este proyecto me enseñó a trabajar con datos públicos a gran escala, diseñar APIs robustas y manejar la complejidad de una app móvil que depende de datos en tiempo real. También mejoré mis habilidades en optimización de rendimiento tanto en el servidor como en el cliente.

## Mejoras y optimizaciones

- Sistema de caché para reducir consultas repetidas a la base de datos
- Paginación y lazy loading en listas de productos
- Compresión de respuestas del API para mejorar tiempos de carga en redes móviles
