## Plan: Hugo/Vue to Next.js Migration

Migrate the frontend from Hugo + global Vue 2 scripts to Next.js App Router while preserving the existing public URLs, Strapi-driven content, and the custom Perl API-backed dashboards. The safest path is to keep the current route surface, move CMS content to server-fetched Next pages, and keep Highcharts/Awesomplete-style interactivity as client components only where required.

**Inventory of the current project**

- The app is not a componentized Vue app. It is a Hugo site with page-scoped global Vue instances and plain JS bootstraps imported from [src/assets/scripts/index.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/index.js).
- Hugo page shells:
  - [src/layouts/index.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/index.html) renders the home page sections: banner, axis, indicators, news, and about.
  - [src/layouts/_default/city.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/_default/city.html) renders the locale dashboard, using a Google Static Maps hero, area filters, indicator panels, chart containers, and open-data links.
  - [src/layouts/_default/comparacao.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/_default/comparacao.html) renders the comparison dashboard with location/area filters and two Highcharts panels.
  - [src/layouts/_default/historico.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/_default/historico.html) renders the historical dashboard with similar filters and charts.
  - [src/layouts/_default/indicadores.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/_default/indicadores.html) renders the search/overview page for indicators plus the explanatory CMS text block.
  - [src/layouts/_default/planos-pela-primeira-infancia.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/_default/planos-pela-primeira-infancia.html) renders the plans map, locale search, guides, and upload form.
  - [src/layouts/_default/biblioteca.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/_default/biblioteca.html) renders the article library/search page and the YouTube modal.
  - [src/layouts/_default/single.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/_default/single.html) is the default markdown content template.
  - [src/layouts/_default/singleForVue.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/_default/singleForVue.html) is a CMS-driven client-fetched page shell used by the privacy page.
  - [src/layouts/_default/sobre-nos.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/_default/sobre-nos.html) is incomplete/legacy: it splits content on `<!-- more -->` but does not render it.
  - [src/layouts/_default/city--mock.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/_default/city--mock.html) is a mock/demo template and should not be treated as production behavior.
- Partials:
  - [src/layouts/partials/head.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/partials/head.html) injects meta tags, canonical URL, OG/Twitter image metadata, fonts, polyfills, preloads, and compiled JS/CSS assets.
  - [src/layouts/partials/scripts.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/partials/scripts.html) loads Highcharts, Vue, and the compiled bootstrap bundle.
  - [src/layouts/partials/header.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/partials/header.html) renders the menu, including a hidden privacy link until tracking consent is validated.
  - [src/layouts/partials/footer.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/partials/footer.html) renders the footer logo, email, partner logos, and developed-by credit.
  - [src/layouts/partials/open-data.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/partials/open-data.html) exposes the open-data download links, methodology PDF, metadata PDF, and API docs link.
  - [src/layouts/partials/consent.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/partials/consent.html) renders the cookie consent banner.
  - [src/layouts/partials/components/listBox.html](../Users/yduqs/proj-omlpi/omlpi-www/src/layouts/partials/components/listBox.html) is the only reusable Vue template component.
- Vue/global JS modules:
  - [src/assets/scripts/homeBanner.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/homeBanner.js), [src/assets/scripts/axis.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/axis.js), [src/assets/scripts/homeIndicators.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/homeIndicators.js), [src/assets/scripts/news.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/news.js), [src/assets/scripts/homeAbout.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/homeAbout.js), and [src/assets/scripts/indicatorsText.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/indicatorsText.js) are the home/overview CMS widgets.
  - [src/assets/scripts/populateData.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/populateData.js) powers the city dashboard and contains the most complex data normalization and chart rendering logic.
  - [src/assets/scripts/compare.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/compare.js) and [src/assets/scripts/history.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/history.js) power the comparison and historical dashboards.
  - [src/assets/scripts/plans.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/plans.js) powers the plans map, drilldown JSON loading, locale search, and upload form.
  - [src/assets/scripts/articles.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/articles.js) powers library search, tag filtering, pagination, and the YouTube modal.
  - [src/assets/scripts/search.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/search.js) and [src/assets/scripts/search-plans.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/search-plans.js) implement Awesomplete + fuzzysort locale lookup and redirects/state updates.
  - [src/assets/scripts/page.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/page.js) fetches CMS page content client-side for `singleForVue` pages and emits prerender metadata for status/redirect handling.
  - [src/assets/scripts/tracking.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/tracking.js) gates Google Analytics UA and Facebook Pixel behind a privacy-policy fetch and cookies banner.
  - [src/assets/scripts/sentry.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/sentry.js) initializes Sentry browser tracing and replay.
  - [src/assets/scripts/helpers.js](../Users/yduqs/proj-omlpi/omlpi-www/src/assets/scripts/helpers.js) contains the shared indicator formatting mixin used by the data dashboards.
- Strapi and custom backend endpoints currently consumed:
  - CMS/Strapi: `banners`, `eixos`, `noticias`, `sobres`, `textoindicadors`, `guias`, `tags`, `artigos`, `locales`, `privacy-policy`.
  - Custom Perl API: `locales`, `data?locale_id=...`, `data/compare`, `data/historical`, `data/random_indicator`, `data/resume/?locale_id=...`, `data/download`, `data/download_indicator`, `upload_plan`.
  - Query patterns already in use: `_limit`, `_sort`, `_q`, `_where`, `_start`, `locale_id`, `locale_id_ne`; no GraphQL usage and no explicit `populate=` strings in the current frontend.
