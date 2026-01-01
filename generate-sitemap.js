import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to read .env manually (avoiding dotenv dependency)
const parseEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (!fs.existsSync(envPath)) return {};
        const content = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const [key, val] = line.split('=');
            if (key && val) env[key.trim()] = val.trim();
        });
        return env;
    } catch (e) {
        console.error("Error reading .env", e);
        return {};
    }
};

const run = async () => {
    const env = parseEnv();
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseKey = env.VITE_SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("❌ Missing Supabase credentials in .env");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching products...");
    const { data: products, error } = await supabase
        .from('products')
        .select('id, created_at');

    if (error) {
        console.error("❌ Error fetching products:", error);
        process.exit(1);
    }

    console.log(`Found ${products.length} products.`);

    const baseUrl = 'https://harisdevlab.online';
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- Product Pages -->`;

    products.forEach(prod => {
        xml += `
  <url>
    <loc>${baseUrl}/product/${prod.id}</loc>
    <lastmod>${prod.created_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    const outputPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, xml);
    console.log(`✅ Sitemap generated at ${outputPath}`);
};

run();
