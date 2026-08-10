import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@attendance/shared'],
  // Next.js 15+ blocks cross-origin requests to dev-only assets (HMR, JS chunks) by default —
  // needed to open the dev server from another device on the LAN (e.g. a phone at
  // http://<this-machine's-LAN-IP>:3000) for real-device testing. Update/add IPs here if yours
  // changes (DHCP) or you test from a different device.
  allowedDevOrigins: ['192.168.1.7'],
};

export default nextConfig;
