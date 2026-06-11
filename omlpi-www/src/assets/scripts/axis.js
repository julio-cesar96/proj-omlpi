/* global Vue */
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import config from './config';

if (document.querySelector('#app-axis')) {
  window.$vueAxis = new Vue({
    el: '#app-axis',
    data: {
      axis: null,
      storageDomain: config.storage.domain,
    },
    computed: {
      loading() {
        return !this.locale;
      },
    },
    async mounted() {
      await this.getAxis();
    },
    methods: {
      getAxis() {
        fetch(`${config.apiCMS.domain}eixos?_limit=30&_sort=order:ASC`)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not OK');
            }
            return response.json();
          })
          .then((response) => {
            this.axis = response;
          })
          .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
          });
      },
      marked(content) {
        return DOMPurify.sanitize(marked(content));
      },
      getLoopClass(index) {
        if (index === 0) {
          return 'fadeInLeft';
        }
        if (index === 2) {
          return 'fadeInRight';
        }
        return true;
      },
    },
  });
}
