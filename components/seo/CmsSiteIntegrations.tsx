import Script from "next/script";

import type { CmsSiteSettings } from "@/lib/siteSettings";
import { CmsHtmlSlot } from "./CmsHtmlSlot";

type Props = {
  settings: CmsSiteSettings;
};

/** Analytics + CMS script slots from Payload «سئو و تحلیل». */
export function CmsSiteIntegrations({ settings }: Props) {
  const { analytics, scripts } = settings;
  const gtm = analytics.gtmId;
  const ga4 = analytics.ga4Id;
  const clarity = analytics.clarityId;

  return (
    <>
      {gtm ? (
        <>
          <Script id="cms-gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':Date.now(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtm)});`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtm)}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}

      {ga4 ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`}
            strategy="afterInteractive"
          />
          <Script id="cms-ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(ga4)});`}
          </Script>
        </>
      ) : null}

      {clarity ? (
        <Script id="cms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(clarity)});`}
        </Script>
      ) : null}

      <CmsHtmlSlot html={scripts.head} target="head" />
      <CmsHtmlSlot html={scripts.bodyStart} target="body-start" />
      <CmsHtmlSlot html={scripts.footer} target="body-end" />
    </>
  );
}
