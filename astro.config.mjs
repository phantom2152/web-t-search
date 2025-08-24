// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: cloudflare(),
    integrations: [react()],
    vite: {
    plugins: [tailwind()],
  },
    server:{
        allowedHosts: ['grande-alex-cookies-flash.trycloudflare.com']
    }
});
