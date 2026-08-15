<?xml version="1.0" encoding="UTF-8"?>
<!--
  Human-readable rendering for every XML sitemap this site serves.

  Referenced from each sitemap through an <?xml-stylesheet?> processing
  instruction (see lib/sitemap.ts). Crawlers ignore it entirely; a browser
  applies it and shows the table instead of raw XML. Browsers only ship
  XSLT 1.0, so: no xsl:function, no format-number on dates, and Persian
  digits come from translate().

  One stylesheet handles both document types — the sitemap index
  (<sitemapindex>) and a section file (<urlset>).
-->
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  exclude-result-prefixes="sm image"
>
  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat" />

  <!-- Brand accent for this site. -->
  <xsl:variable name="accent">#0a8a18</xsl:variable>
  <xsl:variable name="siteName">آژانس پاراگ</xsl:variable>

  <!-- ۰۱۲۳۴۵۶۷۸۹, plus the Persian decimal separator for <priority>. -->
  <xsl:template name="fa">
    <xsl:param name="n" />
    <xsl:value-of select="translate($n, '0123456789.', '۰۱۲۳۴۵۶۷۸۹٫')" />
  </xsl:template>

  <!-- "2026-07-03T23:01:00+00:00" → "۲۰۲۶-۰۷-۰۳ ۲۳:۰۱" -->
  <xsl:template name="stamp">
    <xsl:param name="iso" />
    <xsl:choose>
      <xsl:when test="string-length($iso) &gt;= 16">
        <xsl:call-template name="fa">
          <xsl:with-param name="n" select="substring($iso, 1, 10)" />
        </xsl:call-template>
        <!-- XSLT drops whitespace-only text nodes, so the gap must be explicit. -->
        <xsl:text>&#160;</xsl:text>
        <span class="t">
          <xsl:call-template name="fa">
            <xsl:with-param name="n" select="substring($iso, 12, 5)" />
          </xsl:call-template>
        </span>
      </xsl:when>
      <xsl:when test="string-length($iso) &gt; 0">
        <xsl:call-template name="fa">
          <xsl:with-param name="n" select="substring($iso, 1, 10)" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <span class="muted">—</span>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="head">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, follow" />
    <style>
      :root {
        --accent: <xsl:value-of select="$accent" />;
        --ink: #16181d;
        --muted: #6b7280;
        --line: #e6e8ec;
        --panel: #fff;
        --bg: #f6f7f9;
      }
      * { box-sizing: border-box; }
      html { -webkit-text-size-adjust: 100%; }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--ink);
        font: 15px/1.8 Vazirmatn, "Segoe UI", system-ui, -apple-system, sans-serif;
      }
      a { color: var(--accent); text-decoration: none; overflow-wrap: anywhere; }
      a:hover { text-decoration: underline; }
      .top { background: var(--accent); color: #fff; padding: 28px 0 30px; }
      .top a { color: #fff; text-decoration: underline; text-underline-offset: 3px; }
      .wrap { max-width: 1140px; margin: 0 auto; padding: 0 20px; }
      h1 { margin: 0 0 10px; font-size: 26px; font-weight: 800; letter-spacing: -.01em; }
      .lede { margin: 0; font-size: 14px; line-height: 2; opacity: .92; }
      .meta { margin: 26px 0 14px; display: flex; flex-wrap: wrap; gap: 8px 18px; align-items: baseline; font-size: 14px; }
      .count strong { font-weight: 800; }
      .back { color: var(--accent); }
      .card { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
      .scroll { overflow-x: auto; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 12px 16px; text-align: right; vertical-align: top; }
      thead th { background: var(--accent); color: #fff; font-weight: 700; font-size: 14px; white-space: nowrap; }
      tbody tr { border-top: 1px solid var(--line); }
      tbody tr:nth-child(even) { background: #fafbfc; }
      tbody tr:hover { background: color-mix(in srgb, var(--accent) 6%, #fff); }
      td.num, td.date { white-space: nowrap; font-variant-numeric: tabular-nums; color: var(--muted); }
      .t { margin-inline-start: 8px; opacity: .7; }
      .muted { color: var(--muted); }
      .pill {
        display: inline-block; padding: 1px 9px; border-radius: 999px; font-size: 12px;
        background: color-mix(in srgb, var(--accent) 12%, #fff);
        color: var(--accent); border: 1px solid color-mix(in srgb, var(--accent) 30%, #fff);
      }
      .foot { padding: 22px 0 40px; font-size: 13px; color: var(--muted); }
      @media (max-width: 640px) {
        th, td { padding: 10px 12px; font-size: 13px; }
        h1 { font-size: 21px; }
      }
    </style>
  </xsl:template>

  <!-- ============================ sitemap index ============================ -->
  <xsl:template match="/sm:sitemapindex">
    <html lang="fa" dir="rtl">
      <head>
        <title>نقشه سایت XML — <xsl:value-of select="$siteName" /></title>
        <xsl:call-template name="head" />
      </head>
      <body>
        <div class="top">
          <div class="wrap">
            <h1>نقشه سایت XML</h1>
            <p class="lede">
              این فهرست، نقشه‌های سایت <xsl:value-of select="$siteName" /> را دسته‌بندی می‌کند.
              موتورهای جستجو مثل گوگل از آن برای خزیدن و بازخزیدن صفحه‌ها، نوشته‌ها و دسته‌بندی‌ها استفاده می‌کنند.
              دربارهٔ <a href="https://www.sitemaps.org/protocol.html" rel="noopener noreferrer">پروتکل نقشه سایت</a> بیشتر بخوانید.
            </p>
          </div>
        </div>

        <div class="wrap">
          <p class="meta count">
            <span>
              <xsl:text>این فهرست شامل </xsl:text>
              <strong>
                <xsl:call-template name="fa">
                  <xsl:with-param name="n" select="count(sm:sitemap)" />
                </xsl:call-template>
              </strong>
              <xsl:text> نقشه سایت است.</xsl:text>
            </span>
          </p>

          <div class="card scroll">
            <table>
              <thead>
                <tr>
                  <th>نقشه سایت</th>
                  <th>آخرین تغییر</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sm:sitemap">
                  <tr>
                    <td>
                      <a href="{sm:loc}"><xsl:value-of select="sm:loc" /></a>
                    </td>
                    <td class="date">
                      <xsl:call-template name="stamp">
                        <xsl:with-param name="iso" select="sm:lastmod" />
                      </xsl:call-template>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <p class="foot">هر ردیف را باز کنید تا نشانی‌های همان بخش را ببینید.</p>
        </div>
      </body>
    </html>
  </xsl:template>

  <!-- ============================= section file ============================ -->
  <xsl:template match="/sm:urlset">
    <html lang="fa" dir="rtl">
      <head>
        <title>نقشه سایت XML — <xsl:value-of select="$siteName" /></title>
        <xsl:call-template name="head" />
      </head>
      <body>
        <div class="top">
          <div class="wrap">
            <h1>نقشه سایت XML</h1>
            <p class="lede">
              فهرست نشانی‌های این بخش از <xsl:value-of select="$siteName" />.
              دربارهٔ <a href="https://www.sitemaps.org/protocol.html" rel="noopener noreferrer">پروتکل نقشه سایت</a> بیشتر بخوانید.
            </p>
          </div>
        </div>

        <div class="wrap">
          <p class="meta">
            <span class="count">
              <xsl:text>این نقشه شامل </xsl:text>
              <strong>
                <xsl:call-template name="fa">
                  <xsl:with-param name="n" select="count(sm:url)" />
                </xsl:call-template>
              </strong>
              <xsl:text> نشانی است.</xsl:text>
            </span>
            <a class="back" href="/sitemap.xml">→ بازگشت به فهرست نقشه‌ها</a>
          </p>

          <div class="card scroll">
            <table>
              <thead>
                <tr>
                  <th>نشانی</th>
                  <th>تصاویر</th>
                  <th>اولویت</th>
                  <th>آخرین تغییر</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sm:url">
                  <tr>
                    <td>
                      <a href="{sm:loc}"><xsl:value-of select="sm:loc" /></a>
                    </td>
                    <td class="num">
                      <xsl:call-template name="fa">
                        <xsl:with-param name="n" select="count(image:image)" />
                      </xsl:call-template>
                    </td>
                    <td class="num">
                      <xsl:choose>
                        <xsl:when test="sm:priority">
                          <span class="pill">
                            <xsl:call-template name="fa">
                              <xsl:with-param name="n" select="sm:priority" />
                            </xsl:call-template>
                          </span>
                        </xsl:when>
                        <xsl:otherwise><span class="muted">—</span></xsl:otherwise>
                      </xsl:choose>
                    </td>
                    <td class="date">
                      <xsl:call-template name="stamp">
                        <xsl:with-param name="iso" select="sm:lastmod" />
                      </xsl:call-template>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <p class="foot">
            <a class="back" href="/sitemap.xml">→ بازگشت به فهرست نقشه‌ها</a>
          </p>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
