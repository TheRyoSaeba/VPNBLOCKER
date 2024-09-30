 // @ts-nocheck

let lastBlocklistFetchTime = 0;
let lastSvgFetchTime = 0;
let blockedAsns = new Set();
let svgData = '';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function updateBlocklistAndSvg() {
  const currentTime = Date.now();

  if (!blockedAsns.size || (currentTime - lastBlocklistFetchTime) > 3600000) {
    const blocklistData = await blocklist.get('blocklist');
    if (blocklistData) {
      blockedAsns = new Set(blocklistData.split('\n').map(asn => asn.trim().replace(/\D/g, '')));
      lastBlocklistFetchTime = currentTime;
    } else {
      console.error('Blocklist not found in KV');
      blockedAsns = new Set();
    }
  }

  if (!svgData || (currentTime - lastSvgFetchTime) > 43200000) {
    const fetchedSvg = await svg_content.get('svg_content');
    if (fetchedSvg) {
      svgData = fetchedSvg;
      lastSvgFetchTime = currentTime;
    } else {
      console.error('SVG content not found in KV');
      svgData = '';
    }
  }
}

async function handleRequest(request) {
  try {
    await updateBlocklistAndSvg();

    const clientIp = request.headers.get('CF-Connecting-IP');
    const rayId = request.headers.get('cf-ray');
    const countryCode = request.headers.get('cf-ipcountry');
    let asn = request.cf.asn ? request.cf.asn.toString().replace(/\D/g, '') : '';

    return evaluateRequest(request, asn, clientIp, rayId, countryCode);
  } catch (error) {
    console.error(error);
    return fetch(request);
  }
}

function evaluateRequest(request, asn, clientIp, rayId, country) {
  if (blockedAsns.has(asn) || country === 'T1') {
    const blockedHtml = `
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="robots" content="noindex, nofollow">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>Blocked - Makimura</title>
        <style>
          body {
            background-color: #fff;
            color: #000;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            margin: 0;
          }
          .container {
            margin: 50px auto;
            max-width: 600px;
            text-align: center;
            padding: 0 24px;
          }
          small {
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Sorry, you have been blocked.</h1>
          ${svgData}
          <p>You are unable to access this website. Please disable your VPN or proxy.</p>
          <div style="transform: translateX(5%);">
            <div>
              <small><strong>IP Address:</strong></small>
              <small style="margin-left: 10px;">${clientIp}</small>
            </div>
            <div>
              <small><strong>Blocked ASN:</strong></small>
              <small style="margin-left: 10px;">${asn}</small>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = new Response(blockedHtml, {
      status: 403,
      headers: { 'Content-Type': 'text/html' },
    });

    if (response.status === 403 && new URL(request.url).pathname !== '/') {
      const rootUrl = new URL(request.url).origin;
      return Response.redirect(rootUrl, 302);
    }

    return response;
  }

  return fetch(request);
}


