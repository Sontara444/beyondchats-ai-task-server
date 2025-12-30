const OpenAI = require("openai");

// Initialize OpenAI only if key is present
let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
    console.warn("OPENAI_API_KEY not found in environment variables. Using MOCK LLM.");
}

const rewriteArticle = async (originalArticle, sourceContents, references) => {
    try {
        if (!openai) {
            return mockRewrite(originalArticle, sourceContents, references);
        }

        const referencesInfo = references && references.length > 0
            ? references.map((ref, i) => `Reference ${i + 1}: Title: "${ref.title}", URL: "${ref.url}"`).join("\n        ")
            : "No external references available.";

        const prompt = `
        You are an expert content writer/editor.
        
        Original Article Title: "${originalArticle.title}"
        Original Content: "${originalArticle.content.substring(0, 1000)}..."
        
        I have found related articles from Google Search:
        
        ${referencesInfo}
        
        Source 1 Content:
        "${sourceContents[0] ? sourceContents[0].substring(0, 1000) : "N/A"}..."
        
        Source 2 Content:
        "${sourceContents[1] ? sourceContents[1].substring(0, 1000) : "N/A"}..."
        
        Task:
        Rewrite the original article to make it more comprehensive, using insights from the source articles.
        The new article must be similar in formatting to the top ranking articles (the sources).
        
        IMPORTANT:
        - Maintain the original core message but enhance it.
        - At the very bottom of the article, add a section called "References" and list the provided references.
        - Format the references section strictly as follows:
        ### References
        1. [Title](URL)
        2. [Title](URL)
        - If no references are provided or valid, OMIT the References section entirely.
        - Return ONLY the new article content (Markdown format is preferred).
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        return completion.choices[0].message.content;

    } catch (error) {
        console.error("LLM Error:", error);
        return originalArticle.content + "\n\n(LLM Enhancement Failed: " + error.message + ")";
    }
};

const mockRewrite = (originalArticle, sourceContents, references) => {
    console.log("Mock LLM: Rewriting article...");
    // Return content that includes the original title/content prominently so it looks unique
    // and append the mock "analysis" at the end.

    let referencesSection = "";
    if (references && references.length > 0) {
        referencesSection = "\n### References\n";
        references.forEach((ref, index) => {
            if (ref.title && ref.url) {
                referencesSection += `${index + 1}. [${ref.title}](${ref.url})\n`;
            }
        });
    }

    let newContent = `
# ${originalArticle.title} (Enhanced)

${originalArticle.content}

### AI Analysis & Insights
The following insights were synthesized from external sources related to "${originalArticle.title}":

*   **Market Trends**: Recent data suggests this topic is trending in the industry.
*   **Expert Opinion**: Experts from the sourced articles agree that this is a pivotal development.
*   **Key Takeaway**: Understanding this concept is crucial for future growth.

${referencesSection}
    `;
    return newContent.trim();
};

module.exports = { rewriteArticle };
