addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

let blocklist = [];
let svgText = "";

async function fetchBlocklistAndSVG() {
  // Fetch blocklist from GitHub
  const blocklistResponse = await fetch('https://raw.githubusercontent.com/TheRyoSaeba/VPNCloudflareBlock/main/BlockList');
  const blocklistText = await blocklistResponse.text();
  blocklist = blocklistText.split('\n').map(item => item.trim());

  // Fetch SVG from GitHub
  const svgResponse = await fetch('https://raw.githubusercontent.com/TheRyoSaeba/VPNCloudflareBlock/main/ErrorImage');
  svgText = await svgResponse.text();
  
}


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

let blocklist;
let svgText = "";

async function fetchBlocklistAndSVG() {
  const cache = caches.default;

  // Try to find the blocklist in the cache
  let blocklistResponse = await cache.match('https://raw.githubusercontent.com/TheRyoSaeba/VPNCloudflareBlock/main/BlockList');

  // If the blocklist isn't in the cache or it's older than one hour, fetch it from GitHub
  if (!blocklistResponse || (new Date().getTime() - new Date(blocklistResponse.headers.get('date')).getTime()) > 3600000) {
    blocklistResponse = await fetch('https://raw.githubusercontent.com/TheRyoSaeba/VPNCloudflareBlock/main/BlockList');
    // Put the new blocklist in the cache
    await cache.put('https://raw.githubusercontent.com/TheRyoSaeba/VPNCloudflareBlock/main/BlockList', blocklistResponse.clone());
  }

  const blocklistText = await blocklistResponse.text();
  blocklist = new Set(blocklistText.split('\n').map(item => item.trim()));

  // Try to find the SVG in the cache
  let svgResponse = await cache.match('https://raw.githubusercontent.com/TheRyoSaeba/VPNCloudflareBlock/main/ErrorImage');

  // If the SVG isn't in the cache or it's older than 12 hours , fetch it from GitHub
  if (!svgResponse || (new Date().getTime() - new Date(svgResponse.headers.get('date')).getTime()) > 43200000) {
    svgResponse = await fetch('https://raw.githubusercontent.com/TheRyoSaeba/VPNCloudflareBlock/main/ErrorImage');
    // Put the new SVG in the cache
    await cache.put('https://raw.githubusercontent.com/TheRyoSaeba/VPNCloudflareBlock/main/ErrorImage', svgResponse.clone());
  }

  svgText = await svgResponse.text();
}

let lastIP = null;
let lastASN = null;

async function handleRequest(request) {
  await fetchBlocklistAndSVG();
  try {
    const ip = request.headers.get('cf-connecting-ip');
    const cfRay = request.headers.get('cf-ray');
    const country = request.headers.get('cf-ipCountry');

    if (ip === lastIP && lastASN !== null) {
      // IP address hasn't changed, use the previous ASN
      return processRequest(request, lastASN, cfRay);
    }

    // Fetch ASN for the IP
    const asnResponse = await fetch('https://traceroute-online.com/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://traceroute-online.com/ip-asn-lookup/',
      },
      body: `target=${encodeURIComponent(ip)}&query_type=asn`,
    });

    const responseText = await asnResponse.text();

    if (responseText.includes('API count exceeded')) {
      // If API quota exceeded, restart request handling
      return handleRequest(request);
    }

    const asnData = responseText.split(',');
    const asn = asnData[1].replace(/\D/g, '');

    lastIP = ip;
    lastASN = asn;

    return processRequest(request, asn, cfRay, country);
  } catch (e) {
    console.error(e);
    // If an exception is thrown, return the original request
    return handleRequest(request);
  }
}

function processRequest(request, asn, cfRay, country) {
  if (blocklist.has(asn) || country === 'T1') {
    const responseHTML = `<!doctype html>
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
          ${svgText}
      
          <p>
             You are unable to access this website. Please Disable your VPN or Proxy.
          </p>
      
          <p>
          <div style="transform: translateX(5%);">
          <div>
            <small><strong>Ray ID:</strong></small>
            <small style="margin-left: 10px;">${cfRay}</small>
          </div>
          <div>
            <small><strong>Blocked ASN:</strong></small>
            <small style="margin-left: 10px;">${asn}</small>
          </div>
        </div>
      
      </div>
      
        </div>
      
      
        
          </p>
        </div>
      </body>
      
      </html>`;

    const response = new Response(responseHTML, {
      status: 403,
      headers: {
        'Content-Type': 'text/html',
      },
    });

    // Redirect subdirectory requests to the root page
    if (response.status === 403 && new URL(request.url).pathname !== '/') {
      const rootDomain = new URL(request.url).origin;
      return Response.redirect(rootDomain, 302);
    }

    return response;
  }

  return fetch(request);
}

