const cheerio = require('cheerio');

const scrapeExternalArticle = async (url) => {
    try {
        console.log(`Scraping external content from: ${url}`);
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove script, style, and navigation elements to get cleaner text
        $('script, style, nav, footer, header, aside').remove();

        // Try to find the main content
        let content = $('article').text().trim();
        if (!content || content.length < 200) {
            content = $('main').text().trim();
        }
        if (!content || content.length < 200) {
            // Fallback: grab all paragraphs
            content = $('p').map((i, el) => $(el).text()).get().join(' ');
        }

        // Limit content length to avoid token limits (e.g., 5000 chars)
        return content.substring(0, 5000);

    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        return "";
    }
};

module.exports = { scrapeExternalArticle };
