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


async function handleRequest(request) {
  await fetchBlocklistAndSVG();
  try {
    // Log blocklist to console
    console.log(blocklist);
    const ip = request.headers.get('cf-connecting-ip');
    const cfRay = request.headers.get('cf-ray')
    const country = request.headers.get('cf-ipCountry');
     console.log(country)
    // Fetch ASN for the IP
    const asnResponse = await fetch('https://traceroute-online.com/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        "Referer": "https://traceroute-online.com/ip-asn-lookup/",
      },
      body: `target=${encodeURIComponent(ip)}&query_type=asn`,
    });

    const responseText = await asnResponse.text();

    if (responseText.includes('API count exceeded')) {
      // If API quota exceeded, return the original request
      return fetch(request);
    }
    addEventListener('fetch', event => {
      event.respondWith(handleRequest(event.request));
    });
    // Run Against Block List
    const asnData = responseText.split(',');
    const asn = asnData[1].replace(/\D/g, '');
       console.log(asn)
    if (blocklist.includes(asn) || country == 'T1') {
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

      return response;
    }

    return fetch(request);
  } catch (e) {
    console.error(e);
    // If an exception is thrown, return the original request
    return fetch(request);
  }
}
