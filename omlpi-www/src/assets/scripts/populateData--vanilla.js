/* eslint-disable */

import config from './config';

export default function populateData() {
  const localeId = window.location.search.split('id=')[1];

  async function getData() {
    const response = await fetch(`${config.api.domain}data?locale_id=${localeId}`);
    const json = await response.json();
    return json.locale;
  }

  async function populate() {
    const data = await getData()

    document.querySelector('.js-city-name').textContent = data.name;
    const detailsContainer = document.querySelector('.js-details-container');

    data.indicators.forEach((item) => {
      const details = document.createElement('details');
      const innerContainer = document.createElement('div');

      details.classList.add('js-details-with-chart');
      details.innerHTML = `<summary>${item.description}: <strong>${item.values[1].value_absolute}</strong></summary>`;

      item.subindicators.forEach((subindicator) => {
        const subindicatorContainer = document.createElement('div');

        subindicatorContainer.classList.add('big-number');
        subindicatorContainer.innerHTML = `
          <strong class="big-number__title">${item.values[1].value_absolute}</strong>
          <h2 class="title">${subindicator.classification}</h2>
        `;

        innerContainer.appendChild(subindicatorContainer);
      });

      details.appendChild(innerContainer);

      detailsContainer.appendChild(details);
    });

      {/* <div class="big-number">  */}
      {/*   <strong class="big-number__title">7.5 MIL</strong>  */}
      {/*   <h2 class="title">Gênero</h2>  */}
      {/*   <div class="big-number__text">  */}
      {/*     <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas varius tortor nibh, sit amet tempor nibh finibus et. Aenean eu enim justo. Vestibulum aliquam hendrerit molestie. Mauris malesuada nisi sit amet augue accumsan tincidunt. Maecenas tincidunt, velit ac porttitor pulvinar, tortor eros facilisis libero, vitae commodo nunc quam et ligula. Ut nec ipsum sapien.</p>  */}
      {/*   </div>  */}
      {/*   <div class="infobox">  */}
      {/*     <strong class="infobox__title">3000</strong>  */}
      {/*     <h3>Feminino</h3>  */}
      {/*     <div class="infobox__icons" style="clip-path: url(#svgPath)"></div>  */}
      {/*     <progress class="infobox__progress" value="40" max="100"></progress>  */}
      {/*     <strong class="infobox__percentage">40%</strong>  */}
      {/*     <small class="infobox__year">2018</small>  */}
      {/*   </div>  */}
      {/*   <div class="infobox">  */}
      {/*     <strong class="infobox__title">3000</strong>  */}
      {/*     <h3>Feminino</h3>  */}
      {/*     <div class="infobox__icons" style="clip-path: url(#svgPath)"></div>  */}
      {/*     <strong class="infobox__percentage">40%</strong>  */}
      {/*     <small class="infobox__year">2018</small>  */}
      {/*   </div>  */}
      {/* </div>  */}

    console.log(data);
  }

  getData();
  populate();
  // populateData();
}
