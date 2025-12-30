const cheerio = require('cheerio');

async function check() {
    console.log("Fetching url...");
    const res = await fetch('https://beyondchats.com/blogs/chatbots-vs-live-chat/');
    const html = await res.text();
    const $ = cheerio.load(html);

    console.log("Checking structure...");

    // Check possible content containers
    const candidates = [
        '.entry-content',
        '.post-content',
        'article',
        '.blog-details-content',
        '#content',
        'main'
    ];

    candidates.forEach(sel => {
        const el = $(sel);
        console.log(`Selector "${sel}": Found ${el.length} elements.`);
        if (el.length > 0) {
            console.log(`   First 100 chars: ${el.first().text().trim().substring(0, 100)}`);
            // Check if it contains the "bad" text
            if (el.text().includes("Choosing the right AI chatbot")) {
                console.log(`   WARNING: Contains suspect text!`);
            }
        }
    });

    // Find where the BAD text is coming from
    const badText = "Choosing the right AI chatbot";
    console.log(`\nSearching for element containing: "${badText}"...`);

    // Simple search for elements containing text
    // Note: cheerio :contains is pseudo
    const badEl = $(`*:contains("${badText}")`).last();
    if (badEl.length) {
        console.log(`   Found in tag: <${badEl.prop('tagName')}> class="${badEl.attr('class')}" id="${badEl.attr('id')}"`);
        console.log(`   Parent: <${badEl.parent().prop('tagName')}> class="${badEl.parent().attr('class')}"`);
    }

}

check();
