/* global Vue */
/* global Highcharts */

import slugify from 'slugify';
import config from './config';
import { formatterMixing } from './helpers';
import startSearch from './search';

/* eslint-disable */
(function(H) {
  if (!H.Fullscreen) {
    return;
  }

  const { addEvent, wrap } = H;

  H.Fullscreen.prototype.open = function () {
    const fullscreen = this;
    const { chart } = fullscreen;
    const originalWidth = chart.chartWidth;
    const originalHeight = chart.chartHeight;

    // eslint-disable-next-line no-restricted-globals
    chart.setSize(screen.width, screen.height, false);
    // @see https://github.com/highcharts/highcharts/issues/13220
    chart.pointer.chartPosition = null;

    fullscreen.originalWidth = originalWidth;
    fullscreen.originalHeight = originalHeight;

    // Handle exitFullscreen() method when user clicks 'Escape' button.
    if (fullscreen.browserProps) {
      fullscreen.unbindFullscreenEvent = addEvent(chart.container.ownerDocument, // chart's document
        fullscreen.browserProps.fullscreenChange,
        () => {
          // Handle lack of async of browser's fullScreenChange event.
          if (fullscreen.isOpen) {
            fullscreen.isOpen = false;
            fullscreen.close();
            chart.setSize(originalWidth, originalHeight, false);
            chart.pointer.chartPosition = null;
          } else {
            fullscreen.isOpen = true;
            fullscreen.setButtonText();
          }
        });
      const promise = chart.renderTo[fullscreen.browserProps.requestFullscreen]();
      if (promise) {
        // No dot notation because of IE8 compatibility
        promise['catch'](() => {
          // eslint-disable-next-line no-alert
          alert('Full screen is not supported inside a frame.');
        });
      }
      addEvent(chart, 'destroy', fullscreen.unbindFullscreenEvent);
    }
  };

  wrap(H.Fullscreen.prototype, 'close', function (proceed) {
    // eslint-disable-next-line prefer-rest-params
    proceed.apply(this, Array.prototype.slice.call(arguments, 1));
    const fullscreen = this;
    fullscreen.chart.setSize(fullscreen.originalWidth, fullscreen.originalHeight, false);
    fullscreen.chart.pointer.chartPosition = null;
  });
}(Highcharts));
/* eslint-enable */

Highcharts.setOptions({
  drilldown: {
    drillUpButton: {
      // position: {
      //   y: 0,
      //   x: 0
      // },
      relativeTo: 'spacingBox',
      position: 'left',
      theme: {
        fill: 'none',
        'stroke-width': 0,
        stroke: 'silver',
        font: 'bold 1rem Lato',
        style: {
          fontSize: '1rem',
          color: '#693996',
          fontWeight: 'bold',
          fontFamily: 'Lato',
          textTransform: 'uppercase',
        },
        states: {
          hover: {
            fill: 'none',
          },
          select: {
            fill: 'none',
          },
        },
      },
    },
  },
  exporting: {
    filename: 'Observa_Mapa Planos_PI',
    buttons: {
      contextButton: {
        titleKey: 'contextButtonTitle',
      },
    },
  },
  lang: {
    thousandsSep: '.',
    printChart: 'Imprimir Gráfico',
    viewFullscreen: 'Ver em tela cheia',

    downloadPNG: 'Baixar PNG',
    downloadJPEG: 'Baixar JPG',
    downloadPDF: 'Baixar PDF',
    downloadSVG: 'Baixar SVG',

    contextButtonTitle: 'Exibição, download e impressão',
    drillUpText: '< Voltar para {series.name}',
  },
});

if (window.location.href.indexOf('city') > -1) {
  window.$vuePopulateData = new Vue({
    el: '#app',
    mixins: [formatterMixing],
    data: {
      localeId: window.location.search.split('id=')[1].split('&')[0],
      selectedArea: Number(window.location.search.split('area=')[1]) || 1,
      locale: null,
      apiUrl: config.api.domain,
      apiDocsUrl: config.api.docs,
    },
    computed: {
      loading() {
        return !this.locale;
      },
      indicatorsCount() {
        return this.locale.indicators.filter(
          (indicator) => indicator.area.id === this.selectedArea,
        ).length;
      },
      mapZoomLevel() {
        if (this.locale.type === 'country') {
          return 4;
        }
        if (this.locale.type === 'city') {
          return 14;
        }
        return 6;
      },
      barsHorizontalData() {
        const data = [];
        if (!this.loading) {
          this.locale.indicators.forEach((indicator) => {
            indicator.subindicators.filter((subindicator) => {
              if (subindicator.showAs === 'horizontalBarChart') {
                const updatedSubindicator = subindicator;
                updatedSubindicator.indicatorId = indicator.id;
                data.push(updatedSubindicator);
              }
              return true;
            });
          });
        }
        return data;
      },
      barsData() {
        const data = [];

        if (!this.loading) {
          this.locale.indicators.forEach((indicator) => {
            indicator.subindicators.forEach((subindicator) => {
              if (subindicator.showAs === 'barsChart') {
                const updatedSubindicator = subindicator;
                updatedSubindicator.indicatorId = indicator.id;
                data.push(updatedSubindicator);
              }
            });
          });
        }
        return data;
      },
    },
    created() {},
    async mounted() {
      await this.getData();
      await this.generateCharts();
      await this.changeTitle();
      startSearch();
    },
    methods: {
      isAreaPresent(id) {
        return this.locale.indicators.some((x) => x.area.id === id);
      },
      formatIndicatorHeaderValue(values, isPercentage) {
        if (values.value_relative === null && values.value_absolute === null) {
          return 'Não disponível';
        }
        if (values.value_relative) {
          return `${Number(values.value_relative).toLocaleString('pt-br')}${isPercentage ? '%' : ''}`;
        }
        if (values.value_absolute) {
          return Number(values.value_absolute).toLocaleString('pt-br');
        }
        return true;
      },
      showAsBigNumber(items) {
        if (items.every((item) => item.is_big_number) && items.length <= 2) {
          return true;
        }
        // if (items.length <= 2) {
        //   return true;
        // }
        return false;
      },
      showAsHorizontalBarChart(items) {
        if (items.length === 3) {
          return true;
        }
        return false;
      },
      showAsBarChart(items) {
        if (items.some((item) => !item.is_big_number) && items.length > 3) {
          return true;
        }
        // if (items.length > 3) {
        //   return true;
        // }
        return false;
      },
      changeTitle() {
        document.title = `Observa - ${this.locale.name}`;
      },
      slugify(string) {
        return slugify(string, { lower: true });
      },
      async print(divId, indicatorId, subindicatorDescription) {
        const clone = document.querySelector(`#${divId}`).cloneNode(true);
        const elems = document.querySelectorAll('body *');
        const documentTitle = document.title;
        Array.prototype.slice.call(elems).forEach((value) => {
          value.classList.add('hide');
        });
        document.body.appendChild(clone);
        document.title = `Observa_${this.locale.name}_Indicador_${indicatorId}_${subindicatorDescription}`;
        await window.print();
        Array.prototype.slice.call(elems).forEach((value) => {
          value.classList.remove('hide');
        });
        document.title = documentTitle;
        clone.remove();
        document.querySelector(`#${divId}`).scrollIntoView();
      },
      async getData() {
        const response = await fetch(`${config.api.domain}data?locale_id=${this.localeId}`);
        const json = await response.json();
        this.locale = this.formatLocale(json.locale);
        return true;
      },

      formatLocale(data) {
        // JSON.parse and stringify are being used
        // to deep clone a simple object
        const updatedLocale = JSON.parse(JSON.stringify(data));
        updatedLocale.indicators = [];

        data.indicators.forEach((indicator) => {
          const newIndicator = JSON.parse(JSON.stringify(indicator));
          const indicatorDescription = indicator.description;
          const indicatorYear = indicator.values.year;
          newIndicator.subindicators = [];

          indicator.subindicators.forEach((subindicator) => {
            const subindicatorData = subindicator.data
              .filter((item) => item.values.year === indicatorYear);

            const updatedSubindicator = subindicator;
            updatedSubindicator.data = subindicatorData;
            updatedSubindicator.indicatorId = indicator.id;
            updatedSubindicator.indicatorDescription = indicatorDescription;

            if (subindicatorData.length > 0) {
              if (this.showAsBarChart(subindicatorData)) {
                updatedSubindicator.showAs = 'barsChart';
              } else if (this.showAsHorizontalBarChart(subindicatorData)) {
                updatedSubindicator.showAs = 'horizontalBarChart';
              } else {
                updatedSubindicator.showAs = 'bigNumber';
              }
              newIndicator.subindicators.push(updatedSubindicator);
            }
          });
          updatedLocale.indicators.push(newIndicator);
        });
        return updatedLocale;
      },

      formatDataToBarsCharts(items) {
        const data = [];
        items.data.forEach((item) => {
          data.push({
            name: item.description,
            is_null: item.values.value_relative === null && item.values.value_absolute === null,
            isPercentage: item.is_percentage,
            data: [{
              isPercentage: item.is_percentage,
              y: item.values.value_relative !== null
                ? Number(item.values.value_relative)
                : Number(item.values.value_absolute),
            }],
          });
        });
        return data;
      },

      reflowCharts() {
        const details = document.querySelectorAll('.js-details-with-chart');

        details.forEach((detail) => {
          detail.addEventListener('transitionend', () => {
            Highcharts.charts.forEach((chart) => {
              if (chart) {
                chart.reflow();
              }
            });
          });
        });
      },
      generateCharts() {
        this.barsData.forEach((chart) => {
          Highcharts.chart(`bar-chart-${chart.indicatorId}-${chart.id}`, {
            chart: {
              type: 'column',
            },
            title: {
              text: chart.classification,
              style: {
                width: '100%',
                wordWrap: 'break-word',
              },
            },
            subtitle: {
              text: chart.indicatorDescription,
            },
            caption: {
              text: chart.data[0].values.year,
              y: 25,
              style: {
                color: '#a3a3a3',
                fontsize: '.88889rem',
              },
            },
            xAxis: {
              gridLineWidth: 0,
              labels: {
                enabled: false,
              },
            },
            yAxis: {
              min: 0,
              title: {
                text: false,
              },
            },
            tooltip: {
              // eslint-disable-next-line object-shorthand, func-names
              formatter: function () {
                return window.$vuePopulateData
                  .formatSingleIndicatorValue(this.y, this.series.userOptions.isPercentage);
              },
              headerFormat: '',
            },
            plotOptions: {
              column: {
                minPointLength: 3,
              },
              series: {
                borderWidth: 0,
                dataLabels: {
                  // eslint-disable-next-line object-shorthand, func-names
                  formatter: function () {
                    return window.$vuePopulateData
                      .formatSingleIndicatorValue(this.y, this.point.isPercentage);
                  },
                  // useHTML: true,
                  enabled: true,
                },
              },
            },
            exporting: {
              filename: `Observa_${this.locale.name}_Indicador_${chart.indicatorId}_${chart.classification}`,
            },
            series: this.formatDataToBarsCharts(chart),
          });
        });

        this.barsHorizontalData.forEach((chart) => {
          Highcharts.chart(`bar-chart-horizontal-${chart.indicatorId}-${chart.id}`, {
            chart: {
              type: 'bar',
            },
            title: {
              text: chart.classification,
            },
            subtitle: {
              text: chart.indicatorDescription,
            },
            caption: {
              text: chart.data[0].values.year,
              y: 25,
              style: {
                color: '#a3a3a3',
                fontsize: '.88889rem',
              },
            },
            xAxis: {
              title: {
                text: null,
              },
              labels: {
                enabled: '',
              },
            },
            yAxis: {
              tickWidth: 0,
              type: 'logarithmic',
              title: {
                text: false,
              },
            },
            tooltip: {
              // eslint-disable-next-line object-shorthand, func-names
              formatter: function () {
                return window.$vuePopulateData
                  .formatSingleIndicatorValue(this.y, this.series.userOptions.isPercentage);
              },
              style: {
                zIndex: 999,
              },
              headerFormat: '',
            },
            plotOptions: {
              bar: {
                dataLabels: {
                  // eslint-disable-next-line object-shorthand, func-names
                  formatter: function () {
                    return window.$vuePopulateData
                      .formatSingleIndicatorValue(this.y, this.point.isPercentage);
                  },
                  enabled: true,
                },
              },
            },
            exporting: {
              filename: `Observa_${this.locale.name}_Indicador_${chart.indicatorId}_${chart.classification}`,
            },
            series: this.formatDataToBarsCharts(chart),
          });
        });
        return true;
      },
    },
  });
}
