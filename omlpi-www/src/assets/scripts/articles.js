/* global Vue */
import listBox from './components/listBox';
import config from './config';

const qs = require('qs');

if (window.location.href.indexOf('biblioteca') > -1) {
  window.$vueArticles = new Vue({
    el: '#app',
    components: {
      'list-box': listBox,
    },
    data: {
      currentVideo: '',
      articles: null,
      searchQuery: null,
      pending: {
        articles: true,
      },
      storageDomain: config.storage.domain,
      has_more: false,
      pagination_offset: 0,
      pagination_limit: 15,
      selectedTags: [],
      tags: [],
    },
    computed: {
      loading() {
        return !this.locale;
      },
      tagAliases({ tags } = this) {
        const mappedTags = tags.reduce((acc, cur) => {
          if (cur.tags_aliases?.length) {
            cur.tags_aliases.forEach((el) => {
              acc[el.Alias] = acc[el.Alias] ? [...acc[el.Alias], cur.id] : [cur.id];
            });
          }
          return acc;
        }, {});

        return Object.keys(mappedTags)
          .sort((a, b) => a.localeCompare(b))
          .reduce((acc, cur) => [...acc, { name: cur, value: mappedTags[cur].sort() }], []);
      },

      tagAliasesNamesByValue({ tagAliases } = this) {
        return tagAliases.reduce((acc, cur) => {
          acc[JSON.stringify(cur.value)] = cur.name;
          return acc;
        }, {});
      },

      selectedTagAlisesNames({ selectedTags, tagAliasesNamesByValue } = this) {
        return selectedTags.map((x) => tagAliasesNamesByValue[x]);
      },
    },
    async mounted() {
      await this.getArticles();
      // await this.putHasMoreButtons();
      this.getTags();
    },
    methods: {
      toggleModal(youtubeUrl = '') {
        let func = '';
        if (youtubeUrl) {
          const re = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/i;
          const videoId = (youtubeUrl.match(re) || [])[5] || '';
          const embedUrl = videoId
            ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&showinfo=0&enablejsapi=1&origin=${window.location.origin}`
            : '';

          func = !videoId ? 'pauseVideo' : 'playVideo';
          if (embedUrl !== this.currentVideo) {
            this.currentVideo = embedUrl;
          } else {
            func = 'pauseVideo';
          }
        } else {
          this.currentVideo = '';
        }

        this.$refs.iframeYoutube.contentWindow.postMessage(`{"event":"command","func":"${func}","args":""}`, '*');
      },
      // putHasMoreButtons() {
      //   Object.keys(this.$refs).forEach((item) => {
      //     const description = this.$refs[item][0].querySelector('.library-item__description');
      //     const button = this.$refs[item][0].querySelector('button');
      //     if (description.scrollHeight
      //       > description.offsetHeight) {
      //       button.removeAttribute('hidden');
      //     }
      //   });
      // },
      // showFullDescription(event) {
      //   event.target.previousElementSibling.classList.add('library-item__description--full');
      //   event.target.setAttribute('hidden', true);
      // },
      getTags() {
        const url = `${config.apiCMS.domain}tags?_limit=-1`;

        return fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not OK');
            }
            return response.json();
          })
          .then((results) => {
            if (Array.isArray(results)) {
              this.tags = results;
            } else {
              throw new Error('Response out of expected format');
            }
          })
          .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
          });
      },
      getArticles(loadMore = false, search = false, scrollToResults = true) {
        this.pending.articles = true;

        if (search) {
          this.pagination_offset = 0;
          this.pagination_limit = 15;
        }

        let url = `${config.apiCMS.domain}artigos?`;

        if (this.searchQuery) {
          url += `_q=${this.searchQuery}&`;
        }

        if (this.selectedTags.length) {
          const tags = this.selectedTags
            .reduce((acc, cur) => [...acc, ...JSON.parse(cur)], []);

          const query = qs.stringify({ _where: { tags } });

          url += `${query}&`;
        }

        url += `_limit=${this.pagination_limit}&_start=${this.pagination_offset}`;

        return fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not OK');
            }
            return response.json();
          })
          .then((response) => {
            const results = Array.isArray(response.results)
              ? response.results
              : response;

            this.has_more = response.hasMore ?? results.length === this.pagination_limit;

            if (loadMore) {
              this.articles = [...this.articles, ...results];
            } else {
              this.articles = results;
            }
          })
          .then(() => {
            if (this.has_more) {
              this.pagination_offset += this.pagination_limit;
            }
            if (search) {
              const results = document.querySelector('#js-search-results');
              if (results && scrollToResults) {
                results.scrollIntoView({ behavior: 'smooth' });
              }
            }
          })
          .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
          })
          .finally(() => {
            this.pending.articles = false;
          });
      },
    },
  });
}
