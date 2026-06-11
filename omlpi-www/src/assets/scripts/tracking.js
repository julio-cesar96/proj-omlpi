/* eslint-disable */
import CookiesEuBanner from 'cookies-eu-banner';
import config from './config';

function getPrivacyPolicy() {
  return fetch(`${config.apiCMS.domain}privacy-policy`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }

      return true;
    })
    .catch((error) => {
      console.error('There has been a problem with your fetch operation:', error);
      return false;
    });
}

function runTrackers() {
  (function ga(i, s, o, g, r, a, m) {
    i.GoogleAnalyticsObject = r;
    i[r] = i[r] || function () {
      (i[r].q = i[r].q || []).push(arguments);
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
    m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
  }(window, document, 'script', 'https://www.googletagmanager.com/gtag/js?id=UA-180028503-1', 'gtag'));

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'UA-180028503-1');

  // Facebook Pixel Code
  !(function fb(f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  }(window, document, 'script',
    'https://connect.facebook.net/en_US/fbevents.js'));
  fbq('init', '334370571167679');
  fbq('track', 'PageView');
  // End Facebook Pixel Code
}

export default (async () => {
  const hasPrivacyPolicy = await getPrivacyPolicy();
  if (hasPrivacyPolicy) {
    const provacyPolicyMenuItem = document.querySelectorAll('[data-endpoint="privacy-policy"]') || [];

    provacyPolicyMenuItem.forEach((element) => {
      if (element.hasAttribute('hidden')) {
        element.removeAttribute('hidden');
      }
    });

    CookiesEuBanner(runTrackers, true);
  } else {
    runTrackers();
  }
});
