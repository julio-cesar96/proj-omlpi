import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'https://afa524ecfc15511efdd238c7f5fe8492@o75154.ingest.sentry.io/4505987756589056',
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/(?:[\w-]+.)?rnpiobserva.org.br/,
      ],
    }),
    new Sentry.Replay(),
  ],

  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
