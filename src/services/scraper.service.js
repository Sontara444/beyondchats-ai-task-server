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

        // Collect articles from the last page
        $last(articleElements).each((i, el) => {
            const url = $last(el).attr('href');
            const title = $last(el).text().trim();
            if (url && title) {
                articlePromises.push({ title, url });
            }
        });

        // If we don't have enough articles (5), try the previous page
        if (articlePromises.length < 5 && lastPage > 1) {
            console.log(`Only found ${articlePromises.length} on last page. Fetching page ${lastPage - 1}...`);
            const prevPageUrl = `https://beyondchats.com/blogs/page/${lastPage - 1}/`;
            const prevResponse = await fetch(prevPageUrl);
            const prevHtml = await prevResponse.text();
            const $prev = cheerio.load(prevHtml);

            const prevElements = $prev('h2 > a');
            $prev(prevElements).each((i, el) => {
                const url = $prev(el).attr('href');
                const title = $prev(el).text().trim();
                if (url && title) {
                    // Prepend because these are newer than the last page
                    articlePromises.unshift({ title, url });
                }
            });
        }

        // We want the 5 oldest. 
        // Logic: 
        // Last Page items are definitely the oldest.
        // Second to Last Page items are newer than Last Page.
        // So articlePromises has [SecondLastPageItems... , LastPageItems...]
        // We want the very last 5 items from this combined list.
        const articlesToFetch = articlePromises.slice(-5); // Get last 5

        console.log(`Found total ${articlePromises.length} articles. Processing ${articlesToFetch.length} oldest.`);

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
                // Prioritize .post-content (found in analysis), then .entry-content
                let contentElement = $art('.post-content').first();
                if (contentElement.length === 0) contentElement = $art('.entry-content').first();

                let content = "";
                if (contentElement.length > 0) {
                    const clone = contentElement.clone();
                    // Remove junk/meta elements
                    clone.find('.wp-applause-container, .sharedaddy, .elementor-hidden-desktop, .elementor-hidden-mobile, .elementor-hidden-tablet, .related-posts, .post-navigation, .entry-footer, script, style').remove();
                    content = clone.text().trim();
                }

                // Fallback to a fairly specific container if possible, but avoid 'article' if it includes sidebars
                if (!content) {
                    const articleBody = $art('article');
                    if (articleBody.length > 0) {
                        const clone = articleBody.clone();
                        clone.find('.wp-applause-container, .sharedaddy, .elementor-widget, .related-posts, .sidebar, footer, script, style').remove();
                        content = clone.text().trim();
                    }
                }

                // If still no content, last resort: just body text but it might be very messy
                if (!content) content = $art('body').text().trim().substring(0, 5000);

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
                        source: "BeyondChats",
                        isEnhanced: false,
                        originalContent: null,
                        references: []
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
