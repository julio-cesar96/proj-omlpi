/* global Vue */
import config from './config';
import { formatterMixing } from './helpers';

if (document.querySelector('#app-home-indicators')) {
  window.$vueHomeIndicators = new Vue({
    el: '#app-home-indicators',
    mixins: [formatterMixing],
    data: {
      indicators: null,
      animationCount: 3,
      loadingLocales: false,
      additionalLocaleId: null,
      triggerAnimation: true,
      storageDomain: config.storage.domain,
      interval: null,
      intervalTime: 10000,
    },
    computed: {
      loading() {
        return !this.locale;
      },
    },
    async mounted() {
      await this.getIndicators();
      this.startIndicatorsCounter();
    },
    methods: {
      startIndicatorsCounter(stop) {
        if (stop) {
          clearInterval(this.interval);
        } else {
          this.interval = setInterval(() => {
            this.getIndicators();
          }, this.intervalTime);
        }
      },
      getIndicators() {
        this.loadingLocales = true;
        this.startIndicatorsCounter(true);
        let url = `${config.api.domain}data/random_indicator`;

        if (this.additionalLocaleId) {
          url = `${config.api.domain}data/random_indicator?locale_id_ne=${this.additionalLocaleId}`;
        }

        return new Promise((resolve, reject) => {
          fetch(url)
            .then((response) => {
              if (!response.ok) {
                throw new Error('Network response was not OK');
              }
              return response.json();
            })
            .then((response) => {
              if (response.status !== 500) {
                this.indicators = response;
                this.additionalLocaleId = response.locales[1].id;
              }
              return true;
            })
            .then(() => true)
            .then(() => {
              this.startIndicatorsCounter();

              resolve(true);
            })
            .catch((err) => {
              reject(err);
            })
            .finally(() => {
              this.loadingLocales = false;
            });
        });
      },
      getAxisClass(area) {
        switch (area) {
          case 4:
            return 'violence';

          case 3:
            return 'health';

          case 2:
            return 'education';

          default:
            return 'social-assistance';
        }
      },
    },
  });
}
