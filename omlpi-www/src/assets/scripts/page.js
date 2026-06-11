/* global Vue */
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import config from './config';

const pageTemplate = document.getElementById('page-template');

if (pageTemplate) {
  const endpointEl = document.getElementsByName('omlpi:page:endpoint')[0];
  let endpoint = !endpointEl ? '' : endpointEl.content || '';

  // let's remove possible leading `/´
  endpoint = endpoint.trim().replace(/^\/+/, '').trim();

  console.debug('endpoint', endpoint);

  if (endpoint) {
    if (pageTemplate.hasAttribute('hidden')) {
      pageTemplate.removeAttribute('hidden');
    }

    window.$vueHomeBanner = new Vue({
      el: pageTemplate,
      data: {
        title: '',
        content: '',
        pending: true,
      },
      mounted() {
        this.getContent();
      },
      methods: {
        getContent() {
          fetch(`${config.apiCMS.domain}${endpoint}`)
            .then((response) => {
              if (!response.ok) {
                const prerenderStatusCodeEl = document.createElement('meta');
                const { Location: locationHeader } = response.headers;
                prerenderStatusCodeEl.name = 'prerender-status-code';

                switch (response.status) {
                  case 404:
                    prerenderStatusCodeEl.content = 404;
                    break;

                  case 301:
                  case 302:
                    prerenderStatusCodeEl.content = response.status;

                    if (locationHeader) {
                      const locationMeta = prerenderStatusCodeEl.cloneNode();
                      locationMeta.name = 'prerender-header';
                      locationMeta.content = `Location: ${locationHeader}`;

                      endpointEl.after(locationMeta);
                    }

                    break;

                  default:
                    break;
                }

                endpointEl.after(prerenderStatusCodeEl);

                throw new Error('Network response was not OK');
              }

              return response.json();
            })
            .then(({ title, content }) => {
              this.title = title;
              this.content = content;
            })
            .catch((err) => {
              this.title = 'There has been a problem with your fetch operation';
              this.content = err;
              console.error('There has been a problem with your fetch operation:', err);
            })
            .finally(() => {
              this.pending = false;
              this.$el.setAttribute('aria-busy', String(false));
              window.prerenderReady = true;
            });
        },

        marked(content) {
          return DOMPurify.sanitize(marked(content));
        },
      },
    });
  }
}
