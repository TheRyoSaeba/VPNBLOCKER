# VPNCloudflareBlock
# VPNCloudflareBlock

VPNCloudflareBlock is a Cloudflare Worker script that helps you block VPNs and proxies from accessing your domain. By utilizing the Makimura.js Cloudflare worker script and configuring the Cloudflare Web Application Firewall (WAF), you can effectively block a vast majority of VPN and proxy traffic from reaching your site.

## Usage

Follow the steps below to set up VPNCloudflareBlock for your domain:

1. Copy the contents of the [Makimura.js](makimura.js) file.

2. Go to your Cloudflare dashboard and navigate to the Workers section.

3. Create a new Cloudflare Worker and paste the copied contents of the Makimura.js file into the editor.

4. Save the Cloudflare Worker and take note of the assigned URL or route.

5. In the Cloudflare dashboard, go to the "Security" section and select "WAF".

6. Create a new rule and set the condition to "country equal to Tor" or "(ip.geoip.country eq 'T1')". This rule will help identify VPN and proxy traffic based on the associated countries.

7. Save the WAF rule and make sure it is enabled.

8. Route the Cloudflare Worker you created in step 4 to your domain.

With these steps completed, the VPNCloudflareBlock setup is in place, and it will work to block the majority of VPN and proxy traffic from accessing your site.

## Disclaimer

It's important to note that while VPNCloudflareBlock can be effective in blocking VPNs and proxies, it may not catch all of them. Some determined users may still find ways to bypass these restrictions. Additionally, legitimate users who utilize VPNs for privacy or security reasons may also be affected. Please use this script responsibly and consider the impact on your users.

## License

This project is licensed under the [MIT License](LICENSE).

Feel free to contribute, open issues, or submit pull requests to enhance the functionality or address any concerns with VPNCloudflareBlock.

## Credits

VPNCloudflareBlock was created by [Your Name] and is based on the Makimura.js script developed by [Makimura](https://github.com/makimurax13).

## Acknowledgments

Special thanks to the Cloudflare team for their excellent services and support in developing this VPN blocking solution.

