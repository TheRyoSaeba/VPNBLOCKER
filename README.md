#VPNCloudflareBlock

should block most vpns / datacenters from accessing your site , you can  just edit out the error image or text if you dont want ot

## Usage

Follow the steps below to set up VPNCloudflareBlock for your domain:

1. Copy the contents of the [Makimura.js](Makimura.js) file.

2. Go to your Cloudflare dashboard and navigate to the Workers section.

3. Create a new Cloudflare Worker and paste the copied contents of the Makimura.js file into the editor.

4. Save the Cloudflare Worker and take note of the assigned URL or route.

5. In the Cloudflare dashboard, go to the "Security" section and select "WAF".

6. Create a new rule and set the condition to "country equal to Tor" or "(ip.geoip.country eq 'T1')". This should block Tor.

7. Save the WAF rule and make sure it is enabled.

8. Route the Cloudflare Worker you created in step 4 to your domain.

With these steps completed, the VPNCloudflareBlock setup is in place, and it will work to block the majority of VPN and proxy traffic from accessing your site.

## Disclaimer
wont block all but should be plenty for most people 

## License

This project is licensed under the [MIT License](LICENSE).

Feel free to contribute, open issues, or submit pull requests to enhance the functionality or address any concerns with VPNCloudflareBlock.

## Credits

I created  the  [Makimura.js Script ](https://github.com/TheRyoSaeba), but the script is only part of it .

## Acknowledgments

The block list is taken from a bunch of repositories : 

- [LorenzoSapora/bad-asn-list](https://github.com/LorenzoSapora/bad-asn-list)
- [tsoxas/BadASNs](https://github.com/tsoxas/BadASNs/blob/main/ASN.txt)
- [enigma550/ASN-List](https://github.com/enigma550/ASN-List)
- [NullifiedCode/ASN-Lists](https://github.com/NullifiedCode/ASN-Lists)

I'm sure there's more, thanks to all of them.
