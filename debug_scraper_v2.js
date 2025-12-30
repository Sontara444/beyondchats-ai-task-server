const cheerio = require('cheerio');

async function check() {
    const url = 'https://beyondchats.com/blogs/chatbots-vs-live-chat/';
    console.log(`Fetching ${url}...`);
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const contentEl = $('.post-content');
    if (contentEl.length > 0) {
        console.log("--- Content found via .post-content ---");
        const text = contentEl.text().trim();
        console.log("Tail of content (last 200 chars):");
        console.log(text.substring(text.length - 200));

        // Let's see what children are at the end
        console.log("\n--- Children of .post-content ---");
        contentEl.children().each((i, el) => {
            const t = $(el).text().trim();
            if (t) {
                console.log(`Child ${i}: <${el.tagName}> class="${$(el).attr('class')}" - Text: "${t.substring(0, 30)}..."`);
            }
        });

        // Specifically look for things that contain "0"
        console.log("\n--- Elements containing exactly '0' inside .post-content ---");
        contentEl.find('*').each((i, el) => {
            const t = $(el).text().trim();
            if (t === '0') {
                console.log(`Found '0' in <${el.tagName}> class="${$(el).attr('class')}"`);
                let parent = $(el).parent();
                console.log(`   Parent: <${parent.prop('tagName')}> class="${parent.attr('class')}"`);
            }
        });
    } else {
        console.log(".post-content not found");
    }
}

check();
