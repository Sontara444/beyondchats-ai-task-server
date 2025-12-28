const cheerio = require('cheerio');

const searchGoogle = async (query) => {
    try {
        console.log(`Searching Google for: ${query}`);

        // Using a public search URL (Note: rigorous scraping requires dedicated tools)
        // Simulating a browser request
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        const results = [];

        // Selector strategy:
        // 1. "div.g" is the standard container for results.
        // 2. "a" tags inside headers (h3) or just first 'a' inside div.g

        $('div.g').each((i, el) => {
            const linkElement = $(el).find('a').first();
            const href = linkElement.attr('href');

            if (href && href.startsWith("http") && !href.includes("google.com")) {
                if (!href.includes("youtube.com") && !href.includes("beyondchats.com")) {
                    results.push(href);
                }
            }
        });

        // Fallback: If blocked or different structure (Google blocks simple fetch often)
        if (results.length === 0) {
            console.log("Standard selectors failed. Dumping first 500 chars of HTML to debug if needed.");
            // console.log(html.substring(0, 500));
            // Google often redirects to consent page or captcha on server IPs.
        }

        const topResults = results.slice(0, 2);
        console.log(`Found top results: ${topResults.join(", ")}`);

        // If still empty, return some dummy URLs to verify the rest of the pipeline works?
        // No, let's return clean empty array.
        return topResults;

    } catch (error) {
        console.error("Google Search Error:", error);
        return [];
    }
};

module.exports = { searchGoogle };
