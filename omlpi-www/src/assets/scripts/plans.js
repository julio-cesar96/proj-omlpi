/* global Vue */
/* global $vuePlans */
/* global Highcharts */

import Swal from 'sweetalert2/dist/sweetalert2';
import config from './config';

if (window.location.href.indexOf('planos-pela-primeira-infancia') > -1) {
  window.$vuePlans = new Vue({
    el: '#app',
    data: {
      guides: [],
      locales: null,
      localesWithPlan: null,
      selectedLocale: null,
      selectedLocaleId: null,
      relatedLocales: null,
      capital: null,
      storageDomain: config.storage.domain,
      formLoading: false,
      isDrillDowned: false,
      form: {
        fileName: null,
        file: null,
        name: null,
        message: null,
        email: null,
      },
    },
    watch: {
      locales() {
        this.localesWithPlan = this.locales.filter((locale) => (locale.plan && !locale.hide_plan));
        this.generateChart();
      },
    },
    computed: {
      loading() {
        return !this.locale;
      },
    },
    async mounted() {
      this.getHelperFiles();
    },
    methods: {
      generateChart() {
        // Prepare demo data
        // Data is joined to map using value of 'hc-key' property by default.
        // See API docs for 'joinBy' for more info on linking data and map.
        const data = Highcharts.geojson(Highcharts.maps['countries/br/br-all']);

        data.forEach((item) => {
          const newItem = item;
          newItem.totalPlans = 0;

          const localesPerState = this.locales
            ?.reduce((total, locale) => {
              if (newItem.properties['hc-key'] === `br-${locale.state.toLowerCase()}`) {
                total.push(locale);

                if (locale.plan && !locale.hide_plan) {
                  newItem.totalPlans += 1;
                }

                newItem.isDF = locale.state === 'DF';

                if (locale.type === 'state' && locale.plan) {
                  newItem.planUrl = `${$vuePlans.storageDomain}${locale.plan.url}`;
                }
              }
              return total;
            }, []);

          newItem.drilldown = item.properties['hc-key'];
          // if (filtered.length) {
          // newItem.drilldown = item.properties['hc-key'];
          // }
          const plansAverage = newItem.totalPlans / localesPerState.length;
          newItem.value = plansAverage * 100;
        });
        // Create the chart
        return Highcharts.mapChart('map', {
          chart: {
            backgroundColor: 'rgba(0, 0, 0, 0)',
            events: {
              // eslint-disable-next-line object-shorthand, func-names
              drilldown: function (e) {
                $vuePlans.isDrillDowned = true;
                if (!e.seriesOptions) {
                  // console.log('this?', this)
                  const chart = this;
                  // Handle error, the timeout is cleared on success
                  let fail = setTimeout(() => {
                    if (e.point.drilldown) {
                      chart.showLoading(`<i class="icon-frown"></i> Failed loading  ${e.point.name}`);
                      Swal.fire({
                        title: 'OPS!!',
                        text: 'This state doesn\'t have a valid json yet',
                        icon: 'error',
                        confirmButtonText: 'Fechar',
                      });
                      fail = setTimeout(() => {
                        chart.hideLoading();
                      }, 1000);
                    }
                  }, 5000);

                  // Show the spinner
                  chart.showLoading('carregando...'); // Font Awesome spinner

                  // Load the drilldown map
                  fetch(`/maps/${e.point.drilldown}.json`)
                    .then((response) => {
                      if (!response.ok) {
                        throw new Error('Network response was not OK');
                      }
                      return response.json();
                    })
                    .then((response) => {
                      // console.log(data)

                      // Set a non-random bogus value
                      response.mapData.forEach((item) => {
                        const newItem = item;

                        const locale = $vuePlans.locales
                          .find((loc) => loc.cod_ibge === Number(item.name.replace('mun_', '')));

                        if (locale?.name) {
                          newItem.humanName = locale.name;
                        } else {
                          Swal.fire({
                            title: 'OPS!!',
                            text: `locale ${JSON.stringify(item.id)} has no name, details are on console`,
                            icon: 'error',
                            confirmButtonText: 'Fechar',
                          });
                          // eslint-disable-next-line no-console
                          console.log(`locale ${JSON.stringify(item)} has no name`);
                        }
                        newItem.value = 0;
                        // eslint-disable-next-line camelcase
                        if (locale?.plan && !locale?.hide_plan) {
                          newItem.value = 100;
                          newItem.planUrl = `${$vuePlans.storageDomain}${locale.plan.url}`;
                          newItem.isLaw = locale.is_law;
                        }
                      });

                      chart.hideLoading();

                      // Hide loading and add series
                      clearTimeout(fail);

                      chart.addSeriesAsDrilldown(e.point, {
                        name: e.point.name,
                        data: response.mapData,
                        // dataLabels: {
                        // eslint-disable-next-line object-shorthand, func-names
                        // formatter: function () {
                        // return this.humanName;
                        // },
                        // enabled: false,
                        // format: '{point.name}',
                        // },
                      });
                    }).then(() => {
                      this.setTitle(null, {
                        text: e.point.name,
                        align: 'right',
                        margin: '1.5rem',
                        style: {
                          fontSize: '1.3rem',
                          color: '#693996',
                          fontWeight: 'bold',
                          fontFamily: 'Lato',
                          textTransform: 'uppercase',
                        },
                      });
                    })
                    .catch((error) => {
                      console.error('There has been a problem with your fetch operation:', error);
                    });
                }
              },
              // eslint-disable-next-line object-shorthand, func-names
              drillup: function () {
                $vuePlans.isDrillDowned = false;
                this.setTitle(null, { text: '' });
              },
            },
          },
          title: {
            text: '',
          },

          subtitle: {
            text: '',
            y: 60,
          },

          mapNavigation: {
            enabled: true,
            buttonOptions: {
              verticalAlign: 'bottom',
            },
          },

          legend: {
            enabled: false,
          },

          colorAxis: {
            min: 0,
            max: 100, // max locales for a state
            // type: 'logarithmic',
            minColor: '#ffffff',
            maxColor: '#693996',
            lineColor: '#32215c',
            dataClasses: [{
              to: 0,
              color: '#ffffff',
            }, {
              from: 0.01,
              to: 0.3,
              color: '#e9d8fb',
            }, {
              from: 0.3,
              to: 0.5,
              color: '#e0cbf7',
            }, {
              from: 0.5,
              to: 0.7,
              color: '#d8c0f3',
            }, {
              from: 0.7,
              to: 1,
              color: '#d9bff5',
            }, {
              from: 1,
              to: 5,
              color: '#d1b3f2',
            }, {
              from: 5,
              to: 10,
              color: '#ccadee',
            }, {
              from: 10,
              to: 15,
              color: '#c7a7e9',
            }, {
              from: 15,
              to: 20,
              color: '#c2a2e5',
            }, {
              from: 20,
              to: 25,
              color: '#bd9ce0',
            }, {
              from: 25,
              to: 30,
              color: '#b896dc',
            }, {
              from: 30,
              to: 35,
              color: '#b390d8',
            }, {
              from: 35,
              to: 40,
              color: '#ae8ad3',
            }, {
              from: 40,
              to: 45,
              color: '#9f79c6',
            }, {
              from: 45,
              to: 50,
              color: '#9b73c2',
            }, {
              from: 50,
              to: 55,
              color: '#966dbd',
            }, {
              from: 55,
              to: 60,
              color: '#9167b9',
            }, {
              from: 60,
              to: 65,
              color: '#8c62b5',
            }, {
              from: 65,
              to: 70,
              color: '#875cb0',
            }, {
              from: 70,
              to: 75,
              color: '#8256ac',
            }, {
              from: 75,
              to: 80,
              color: '#7d50a8',
            }, {
              from: 80,
              to: 95,
              color: '#784aa3',
            }, {
              from: 95,
              to: 100,
              color: '#73459f',
            }],
            lineWidth: 10,
          },
          tooltip: {
            useHTML: true,
            followPointer: false,
            // hideDelay: 1500,
            style: {
              pointerEvents: 'auto',
              textAlign: 'center',
            },
            // eslint-disable-next-line object-shorthand, func-names
            formatter: function () {
              if ($vuePlans.isDrillDowned) {
                if (this.point.planUrl) {
                  return `${this.point.humanName}:
                    <a target="_blank" href="${this.point.planUrl}">Baixar ${this.point.isLaw ? 'Lei' : 'Plano'}</a>
                    `;
                }
                return `${this.point.humanName}`;
              }
              if (this.point.planUrl) {
                return `${this.point.name}: ${this.point.totalPlans} Plano${this.point.totalPlans === 1 ? '' : 's'}
                    <br>
                    <a target="_blank" href="${this.point.planUrl}">
                      Baixar Plano ${this.point.isDF ? 'Distrital' : 'Estadual'}
                    </a>
                    `;
              }
              return `${this.point.name}: <br> ${this.point.totalPlans} Plano${this.point.totalPlans === 1 ? '' : 's'}`;
            },
          },
          series: [{
            joinBy: ['hc-key', 'code'],
            data,
            name: 'Brasil',
            states: {
              hover: {
                color: '#32215c',
              },
            },
            dataLabels: {
              enabled: false,
              format: '{point.name}',
            },
          }],
        });
      },
      updateFile(event) {
        this.form.file = [event.target.files[0]];
        this.form.fileName = this.form.file[0].name;
      },
      resetForm() {
        document.querySelector('#plan').value = '';
        this.form = {
          fileName: null,
          file: null,
          name: null,
          message: null,
          email: null,
        };
      },
      sendPlan() {
        const data = new FormData();
        data.append('file', this.form.file[0]);
        data.append('name', this.form.name);
        data.append('message', this.form.message);
        data.append('email', this.form.email);
        this.formLoading = true;

        fetch(`${config.api.domain}upload_plan`, {
          method: 'POST',
          body: data,
        })
          .then((response) => {
            if (response.status === 200) {
              Swal.fire({
                title: 'Tudo Certo!',
                text: 'Seu plano foi enviado para avaliação',
                icon: 'success',
                confirmButtonText: 'Fechar',
              })
                .then(this.formLoading = false)
                .then(this.resetForm());
            } else {
              Swal.fire({
                title: 'Ops! Algo deu errado',
                text: 'Tivemos um problema no envio, por favor, tente novamente',
                icon: 'error',
                confirmButtonText: 'Fechar',
              })
                .then(this.formLoading = false);
            }
          })
          .catch(() => {
            Swal.fire({
              title: 'Ops! Algo deu errado',
              text: 'Tivemos um problema no envio, por favor, tente novamente',
              icon: 'error',
              confirmButtonText: 'Fechar',
            })
              .then(this.formLoading = false);
          });
      },
      setMapDestak(locale) {
        const map = document.querySelector('.js-brazil-map');

        if (map.querySelector('.active')) {
          map.querySelector('.active').classList.remove('active');
        }

        map.querySelector(`.${locale}`).classList.add('active');
      },
      setLocale(localeId) {
        this.resetSelectedLocales();
        this.selectedLocale = this.locales.find((locale) => locale.id === localeId);

        if (this.selectedLocale.type === 'state') {
          const cities = this.locales.filter(
            (locale) => locale.type === 'city' && locale.state === this.selectedLocale.state && locale.plan,
          );
          this.capital = this.locales.find(
            (locale) => locale.type === 'city' && locale.state === this.selectedLocale.state && locale.is_capital,
          );
          this.relatedLocales = this.getSectionedLocales(cities)
            .sort((a, b) => ((a.title > b.title) ? 1 : -1));

          // this.setMapDestak(this.selectedLocale.state);
        }

        if (this.selectedLocale.type === 'region') {
          const states = this.locales.filter(
            (locale) => locale.type === 'state' && locale.region === this.selectedLocale.region,
          );
          this.relatedLocales = this.getSectionedLocales(states)
            .sort((a, b) => ((a.title > b.title) ? 1 : -1));

          // this.setMapDestak(this.selectedLocale.region);
        }

        if (this.selectedLocale.type === 'city') {
          // this.setMapDestak(this.selectedLocale.state);
        }
      },
      getSectionedLocales(locales) {
        return Object.values(
          locales.reduce((acc, locale) => {
            const firstLetter = locale.name[0].toLocaleUpperCase();
            if (!acc[firstLetter]) {
              acc[firstLetter] = { title: firstLetter, data: [locale] };
            } else {
              acc[firstLetter].data.push(locale);
            }
            return acc;
          }, {}),
        );
      },
      resetSelectedLocales() {
        this.selectedLocale = null;
        this.selectedLocaleId = null;
        this.relatedLocales = null;
        this.capital = null;
      },
      getHelperFiles() {
        const url = `${config.apiCMS.domain}guias`;

        return fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not OK');
            }
            return response.json();
          })
          .then((response) => {
            if (Array.isArray(response)) {
              this.guides = response.filter((x) => !!x.file?.url).map((x) => ({ ...x, url: `${config.storage.domain}${x.file.url}` }));
            } else if (response.url && response.title) {
              this.guides = [response];
            } else {
              throw new Error(`Response of \`${url}\` out of expected format.`);
            }
          })
          .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
          });
      },
    },
  });
}
