export default async function handler(req, res) {
  const sources = [
    `https://newsapi.org/v2/everything?q=artificial%20intelligence&apiKey=${process.env.NEWS_API_KEY}`,
    `https://api.currentsapi.services/v1/search?keywords=artificial intelligence&apiKey=${process.env.CURRENTS_API_KEY}`,
    `https://gnews.io/api/v4/search?q=artificial%20intelligence&lang=en&token=${process.env.GNEWS_API_KEY}`
  ];

  let news = [];

  try {
    for (let url of sources) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        const data = await response.json();

        if (data.articles) {
          data.articles.forEach((a) =>
            news.push({
              title: a.title,
              url: a.url,
              publishedAt: a.publishedAt || a.published || new Date(),
            })
          );
        }
        if (data.news) {
          data.news.forEach((a) =>
            news.push({
              title: a.title,
              url: a.url,
              publishedAt: a.published || new Date(),
            })
          );
        }
      } catch (err) {
        console.warn("Skipping API:", url, err.message);
      }
    }

    // Sort by time
    news.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    res.status(200).json({ articles: news });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
