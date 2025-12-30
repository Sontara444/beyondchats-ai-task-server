const API_URL = 'http://localhost:5000/api/articles';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, retries = 10, delayMs = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempt ${i + 1}/${retries} to connect to ${url}...`);
            const res = await fetch(url);
            return res;
        } catch (e) {
            console.log(`Failed to connect (${e.message}). Retrying in ${delayMs}ms...`);
            await delay(delayMs);
        }
    }
    throw new Error('Could not connect to server after retries');
}

async function verify() {
    try {
        console.log('Fetching oldest articles...');
        const response = await fetchWithRetry(`${API_URL}?sort=oldest&limit=5`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        console.log(`Fetched ${data.length} articles.`);

        if (data.length > 5) {
            console.error('FAIL: More than 5 articles returned');
            process.exit(1);
        }

        if (data.length === 0) {
            console.log('WARNING: No articles found. Cannot verify sorting. Use /api/articles/scrape to seed DB if needed.');
            process.exit(0);
        }

        // Check sorting
        let isSorted = true;
        for (let i = 0; i < data.length - 1; i++) {
            if (new Date(data[i].publishedDate) > new Date(data[i + 1].publishedDate)) {
                isSorted = false;
                console.error(`FAIL: Article at index ${i} is newer than article at index ${i + 1}`);
                console.log(`${data[i].publishedDate} > ${data[i + 1].publishedDate}`);
            }
        }

        if (isSorted) {
            console.log('PASS: Articles are sorted by date ascending.');
            console.log('Articles:');
            data.forEach(a => console.log(`- ${a.publishedDate}: ${a.title}`));
        } else {
            console.error('FAIL: Articles are NOT sorted correctly.');
            process.exit(1);
        }

    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verify();
