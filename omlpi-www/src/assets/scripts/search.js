import Awesomplete from 'awesomplete';
import fuzzysort from 'fuzzysort';
import config from './config';

export default function startSearch() {
  const regionInput = document.querySelector('#js-region-input');
  let cityId;

  function removeDiacritics(string) {
    return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  async function getList() {
    const response = await fetch(`${config.api.domain}locales`);
    const json = await response.json();
    return json.locales;
  }

  async function mountList() {
    const list = await getList();

    regionInput.removeAttribute('disabled');
    regionInput.removeAttribute('aria-busy');

    const regionNames = list.map((region) => ({
      label: `${region.name}:${region.type}`,
      value: region.id,
    }));

    const awesomplete = new Awesomplete(regionInput, {
      item: (suggestion) => {
        const html = document.createElement('li');
        const type = suggestion.label.split(':')[1];
        let typeString;
        if (type === 'city') {
          typeString = 'Município';
        }
        if (type === 'state') {
          typeString = 'Estado';
        }
        if (type === 'region') {
          typeString = 'Região';
        }
        if (type === 'country') {
          typeString = 'País';
        }
        html.setAttribute('role', 'option');
        html.setAttribute('class', `awesomplete__${type}`);
        html.insertAdjacentHTML('beforeend',
          `<span>${suggestion.label.split(':')[0]}<small>${typeString}</small></span>`);
        return html;
      },
      nChars: 1,
      maxItems: 5,
      autoFirst: true,
      filter(text, input) {
        return fuzzysort.single(removeDiacritics(input), removeDiacritics(text.label.split(':')[0]));
      },
      replace(suggestion) {
        [this.input.value] = [suggestion.label.split(':')[0]];
      },
    });
    awesomplete.list = regionNames;
  }

  function validateAreas(localeId) {
    document.querySelector('.js-areas-buttons').querySelectorAll('button')
      .forEach((item) => item.classList.remove('button-icon--active'));

    function activeButton(buttonNumber) {
      const button = document.querySelector(`#js-area-${buttonNumber}`);
      button.removeAttribute('disabled');
      button.removeAttribute('hidden');
    }

    fetch(`${config.api.domain}data?locale_id=${localeId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not OK');
        }
        return response.json();
      })
      .then((response) => {
        if (response.locale.indicators.some((item) => item.area.id === 1)) {
          activeButton(1);
        }

        if (response.locale.indicators.some((item) => item.area.id === 2)) {
          activeButton(2);
        }

        if (response.locale.indicators.some((item) => item.area.id === 3)) {
          activeButton(3);
        }

        if (response.locale.indicators.some((item) => item.area.id === 4)) {
          activeButton(4);
        }
      })
      .catch((error) => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  }

  function handleInputClass(type) {
    regionInput.removeAttribute('class');
    if (type) {
      regionInput.classList.add(`search-area__input-${type}`);
    }
  }

  function watchSelection() {
    regionInput.addEventListener('awesomplete-selectcomplete', (event) => {
      if (event.srcElement.dataset.intern) {
        window.location.href = `/city?id=${event.text.value}&area=${window.$vuePopulateData.selectedArea}`;
      } else {
        handleInputClass(event.text.label.split(':')[1]);
        validateAreas(event.text.value);
        cityId = event.text.value;
      }
    }, false);

    regionInput.addEventListener('awesomplete-open', () => {
      handleInputClass();
    });
  }

  function watchForm() {
    let selectedArea;
    const areasButtons = document.querySelector('.js-areas-buttons');

    if (areasButtons) {
      areasButtons.querySelectorAll('button')
        .forEach((item) => item.addEventListener('click', (event) => {
          selectedArea = [event.target.id.split('-')[2]];
        }));

      document.querySelector('#js-submit-region').addEventListener('submit', (event) => {
        event.preventDefault();
        window.location.href = `/city?id=${cityId}&area=${selectedArea}`;
      });
    }
  }

  if (regionInput) {
    mountList();
    watchSelection();
    watchForm();
  }
}
