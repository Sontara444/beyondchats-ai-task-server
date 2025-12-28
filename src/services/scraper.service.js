const cheerio = require('cheerio');
const Article = require('../models/article.model');

const getOldestArticles = async () => {
    try {
        console.log("Starting scrape for oldest articles...");

        // 1. Fetch the main blog page to determine the last page number
        const mainPageResponse = await fetch('https://beyondchats.com/blogs/');
        const mainPageHtml = await mainPageResponse.text();
        const $ = cheerio.load(mainPageHtml);

        let lastPage = 1;
        // Looking for pagination links like "page/2/", "page/15/"
        // Common pattern in WordPress/blogs: .page-numbers or similar. 
        // Based on previous read_url_content, we saw links like [15](https://beyondchats.com/blogs/page/15/)
        const pageLinks = $('a[href*="/blogs/page/"]');

        pageLinks.each((i, el) => {
            const href = $(el).attr('href');
            const match = href.match(/\/page\/(\d+)\/?/);
            if (match && match[1]) {
                const pageNum = parseInt(match[1]);
                if (pageNum > lastPage) {
                    lastPage = pageNum;
                }
            }
        });

        console.log(`Found last page: ${lastPage}`);

        // 2. Fetch the last page
        const lastPageUrl = `https://beyondchats.com/blogs/page/${lastPage}/`;
        console.log(`Fetching last page: ${lastPageUrl}`);

        const lastPageResponse = await fetch(lastPageUrl);
        const lastPageHtml = await lastPageResponse.text();
        const $last = cheerio.load(lastPageHtml);

        const articles = [];

        // 3. Extract article links from the last page
        // Selectors depend on the actual site structure. 
        // Usually articles are in <article> tags or divs with class 'post'
        // We look for h2 headers with links inside them based on the chunks we saw.
        const articleElements = $last('h2 > a'); // Based on markdown headers we saw earlier: ## [Title](url)

        /* 
           NOTE: The read_url_content output showed headers like:
           headers:{type:MARKDOWN_NODE_TYPE_HEADER_2  text:"[Choosing the right AI chatbot : A Guide](...)"}
           This implies h2 > a structure is likely.
        */

        if (articleElements.length === 0) {
            console.log("No articles found on the last page. Checking alternative selectors...");
            // Fallback strategy if h2 > a doesn't work, might be div.post-title > a, etc.
            // But let's trust the headers we saw.
        }

        // We only want 5 oldest, so maybe take them from the end of the list if they are ordered new->old on the page?
        // Usually blog pages show newest first. So on the LAST page, the items are the oldest articles.
        // Among those on the last page, the ones at the BOTTOM are the very oldest? 
        // Or if the page is new->old, the last item on the last page is the oldest.
        // Let's grab all from last page and sort/filter.

        // Collect promises for fetching individual article details
        const articlePromises = [];

        $last(articleElements).each((i, el) => {
            const url = $last(el).attr('href');
            const title = $last(el).text().trim();
            if (url && title) {
                articlePromises.push({ title, url });
            }
        });

        // If we want the absolutely oldest 5, and the last page has X items (e.g. 10),
        // and they are listed Newest -> Oldest on that page,
        // then the last 5 items on that page are the oldest.
        // Let's reverse the list to have Oldest -> Newest (relative to that page)
        // Actually, usually Page 1: 1-10 (Newest), Page 15: 141-150 (Oldest).
        // On Page 15, item 1 is #141 (newer) and item 10 is #150 (oldest).
        // So the last items in the list are the oldest.

        // Let's take the last 5 items from the list.
        const articlesToFetch = articlePromises.slice(-5); // Get last 5

        console.log(`Found ${articlePromises.length} articles on last page. Processing ${articlesToFetch.length} oldest.`);

        for (const articleMeta of articlesToFetch) {
            try {
                // Fetch individual article content
                console.log(`Scraping article: ${articleMeta.url}`);
                const artResponse = await fetch(articleMeta.url);
                const artHtml = await artResponse.text();
                const $art = cheerio.load(artHtml);

                // Extract content
                // Selectors are guesses, need to be robust.
                // Common content classes: .entry-content, .post-content, article .content
                let content = $art('.entry-content').text().trim();
                if (!content) content = $art('article').text().trim();

                // Description (often in meta tag)
                const description = $art('meta[name="description"]').attr('content') || content.substring(0, 150) + "...";

                // Date
                // Often in .entry-date, .published, or meta[property="article:published_time"]
                const publishedDateStr = $art('meta[property="article:published_time"]').attr('content');
                const publishedDate = publishedDateStr ? new Date(publishedDateStr) : new Date();

                // Author
                const author = $art('.author-name').text().trim() || "BeyondChats Team";

                console.log(`Upserting article: ${articleMeta.title}`);

                await Article.findOneAndUpdate(
                    { url: articleMeta.url },
                    {
                        title: articleMeta.title,
                        url: articleMeta.url,
                        content: content,
                        description: description,
                        publishedDate: publishedDate,
                        author: author,
                        source: "BeyondChats"
                    },
                    { upsert: true, new: true }
                );
            } catch (err) {
                console.error(`Failed to scrape article ${articleMeta.url}:`, err.message);
            }
        }

        console.log("Scraping completed.");
        return { success: true, message: "Scraping completed" };

    } catch (error) {
        console.error("Scraper Error:", error);
        throw error;
    }
};

module.exports = { getOldestArticles };
