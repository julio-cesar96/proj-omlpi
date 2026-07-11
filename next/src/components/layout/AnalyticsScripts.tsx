"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export function AnalyticsScripts() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const handleConsent = () => {
      setConsented(true);
    };

    // Check if consent has already been accepted (e.g. dispatched by CookieBanner in its useEffect)
    window.addEventListener("omlpi:analytics-consent", handleConsent);
    
    // Safety check: dispatching could have happened before mounting of this component,
    // so let's check localStorage as well.
    const consent = localStorage.getItem("omlpi:cookies-consent");
    if (consent === "accepted") {
      queueMicrotask(() => {
        setConsented(true);
      });
    }

    return () => {
      window.removeEventListener("omlpi:analytics-consent", handleConsent);
    };
  }, []);

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  if (!consented) return null;

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}

      {fbPixelId && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
