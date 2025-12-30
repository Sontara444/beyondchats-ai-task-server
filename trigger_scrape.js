async function trigger() {
    try {
        console.log("Triggering scrape...");
        const res = await fetch('http://localhost:5000/api/articles/scrape', { method: 'POST' });
        const data = await res.json();
        console.log("Response:", data);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
trigger();
