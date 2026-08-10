---
title: Listify
slug: listify-en
description: A platform to compare supermarket prices in Argentina using the public SEPA price data. It ingests millions of prices every day, finds the cheapest branches near you, and builds the most economical basket split across stores.
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
role: Full Stack Developer (mobile app · API · admin panel)
stats:
  - { value: '3', label: 'repos: mobile · API · admin' }
  - { value: '~40K', label: 'lines of code' }
  - { value: '~50', label: 'API endpoints' }
  - { value: '22', label: 'data models' }
challenges:
  - Ingesting the daily SEPA dump — a ZIP full of ZIPs with hundreds of thousands of prices — quickly and fault-tolerantly
  - Answering "where is it cheapest near me?" in milliseconds over millions of geolocated prices
  - Computing the cheapest basket split across several stores, with payment-method discounts
learnings:
  - Large-scale data ingestion with streaming and `COPY` instead of row-by-row inserts
  - Real geospatial queries with PostGIS (`ST_DWithin`, `ST_Distance`) and GiST indexing
  - 'Designing a complete full-stack product: data pipeline, API, mobile app and back-office'
contributions:
  - Dual-channel SEPA ingestion engine (retail and wholesale) end to end
  - NestJS API with search, nearby prices, collaborative lists, alerts and optimizer
  - React Native mobile app with an interactive map, barcode scanner and real-time search
---

In Argentina the price of the same carton of milk can vary by 40% between two supermarkets three blocks apart. The government publishes **all** of those prices every single day — it's the law — but in a format no human can use: one huge compressed file, full of other compressed files, with raw spreadsheets. Listify takes that data and turns it into something simple: **telling you where to buy your basket for less, near you.**

## The problem

The SEPA program (Argentina's Electronic Price Publication System) requires stores to publish their prices daily. The information is there, public and free, but practically unusable: a daily dump with hundreds of thousands of prices per store, ungeocoded branches, inconsistent columns. Comparing prices by hand is impossible, and the apps that existed didn't cross price with proximity or tell you how to split the shopping.

## Why I built it

I built it first out of **personal need**: with inflation, choosing where to shop stopped being a detail and became real money at the end of the month. I knew the data existed, and it frustrated me that it was so close and so useless at the same time.

I also took it on as **the most ambitious full-stack challenge** I could set for myself: a massive ingestion pipeline, a geospatial database, an optimization algorithm and a polished mobile app. I wanted to build a real product, end to end — not a demo.

## What it does

Listify is a platform in three pieces — mobile app, API and admin panel — that lets you:

- **Search for any product** and see its minimum, average and maximum price on the market.
- **See which nearby stores carry it** and for how much, sorted by real distance on a map.
- **Build collaborative shopping lists** (with reader, editor and owner roles) and see the estimated total live.
- **Optimize the basket**: the algorithm computes the cheapest way to buy your whole list split across the nearby stores, and tells you **how much you save** versus buying everything in one place.
- **Get alerts** when the price of a product you care about drops (push notification).
- **Scan a product's barcode** at the shelf to look it up instantly.

## How it works

The heart of the system is the **SEPA ingestion engine**, which runs automatically every day:

1. **Scrapes** the dataset page to find the day's ZIP.
2. **Downloads and unzips** that ZIP — which contains one ZIP per store inside — tolerating corrupt files without aborting the whole run.
3. **Loads the prices in streaming**: instead of inserting row by row, it streams the CSV straight into PostgreSQL with `COPY`, handling backpressure, to load hundreds of thousands of rows per store efficiently.
4. **Deduplicates and consolidates** with set-based SQL (an `INSERT ... SELECT` with upsert), not thousands of loose queries.
5. **Geolocates every branch** in PostGIS and **stores a historical snapshot** of prices that feeds the charts and triggers the alerts.

Every run is recorded with its metrics, errors and warnings, and the admin panel (React) shows them in a dashboard to monitor the pipeline's health.

## The technical challenges

### The ZIP of ZIPs and the bulk load

The SEPA data is hostile: nested files, malformed CSV rows, unbalanced quotes, inconsistent number formats. The ingestion sanitizes each row on the fly and uses `COPY ... FROM STDIN` into a staging table, then consolidates with a single `INSERT ... SELECT` deduplicating by product. The difference against inserting row by row isn't a percentage: it's orders of magnitude.

### "Where's it cheapest, near me?"

This question sounds simple and is one of the most expensive to answer over millions of geolocated prices. I solved it with **PostGIS**: each branch stores its geographic point (`geom`) with a GiST index, and the queries use `ST_DWithin` to filter by radius and `ST_Distance` to sort by real distance in meters. A Redis cache layer, with keys that round the coordinates, avoids recomputing the same thing on the slightest GPS movement.

### The basket optimizer

The nicest one of all. Given your list and the nearby stores, the problem is: **how do I split the shopping to spend less?** It's a combinatorial minimization (buying everything in one store is almost never optimal). The algorithm pre-filters the best candidate stores by coverage and price, does a bounded subset search, assigns each product to its cheapest branch, applies the payment-method discounts and compares against the best single-store purchase to report your **concrete savings** — and which items it couldn't cover.

## The mobile app

On the client side, the app is built in React Native with Expo Router. It has an interactive map that draws the plan's stores and a radius around you, a barcode scanner that draws the reticle with Skia and corrects the camera mirroring, and a search with infinite scroll and debounce so it doesn't hammer the API on every keystroke. The whole data layer is documented with ADRs: separation between server state (TanStack Query) and session/UI state (Zustand), and an HTTP client that normalizes every error into its own type.

## What I took away

Listify was my accelerated master's in serious full-stack. I learned that moving data at scale is a design problem (streaming and set-based operations, not loops), that "near me" is a geospatial query with its own name, and that a well-thought-out algorithm can translate into real money in someone's pocket. I ended up with a complete platform — data, API, mobile and back-office — and with the certainty that I can take an idea from an unreadable public file all the way to a product that solves an everyday problem.

## Repositories

- **Mobile app** — [github.com/Yeinthony/listify](https://github.com/Yeinthony/listify)
- **Backend / API** — [github.com/Yeinthony/listify-backend](https://github.com/Yeinthony/listify-backend)
- **Admin panel** — [github.com/Yeinthony/listify-admin](https://github.com/Yeinthony/listify-admin)
