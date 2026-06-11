/* global Vue */
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import config from './config';

if (document.querySelector('#app-indicators-text')) {
  window.$vueHomeBanner = new Vue({
    el: '#app-indicators-text',
    data: {
      text: null,
    },
    computed: {
      loading() {
        return !this.text;
      },
    },
    async mounted() {
      await this.getText();
    },
    methods: {
      getText() {
        fetch(`${config.apiCMS.domain}textoindicadors`)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not OK');
            }
            return response.json();
          })
          .then((response) => {
            this.text = response;
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
