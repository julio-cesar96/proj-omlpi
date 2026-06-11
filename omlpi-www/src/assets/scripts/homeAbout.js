/* global Vue */
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import config from './config';

if (document.querySelector('#app-home-about')) {
  window.$vueHomeAbout = new Vue({
    el: '#app-home-about',
    data: {
      about: null,
      storageDomain: config.storage.domain,
    },
    computed: {
      loading() {
        return !this.locale;
      },
      hasNews() {
        return window.$vueNews && window.$vueNews.news && window.$vueNews.news.length > 0;
      },
    },
    async mounted() {
      await this.getAbout();
    },
    methods: {
      getAbout() {
        fetch(`${config.apiCMS.domain}sobres?_limit=1`)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not OK');
            }
            return response.json();
          })
          .then((response) => {
            this.about = { ...response[0] };
          })
          .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
          });
      },
      marked(content) {
        return DOMPurify.sanitize(marked(content));
      },
    },
  });
}
