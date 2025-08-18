import React, { useEffect, useState } from "react";
import "./App.css";
import { FaSearch, FaMoon, FaSun, FaClock } from "react-icons/fa";

export default function App() {
  const [allNews, setAllNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark");
  const [category, setCategory] = useState("");

  // ✅ API Sources (utamakan NewsAPI yang pasti jalan)
  const sources = [
    `https://newsapi.org/v2/everything?q=artificial%20intelligence&apiKey=beadce4cc4d24849b7c543427dc7c7bd`,
    `https://api.currentsapi.services/v1/search?keywords=artificial intelligence&apiKey=Ok2ImJnEegDTUdozzAqa1W03QDDq4oo9b5GgtErTzmV5iKeN`,
    `https://gnews.io/api/v4/search?q=artificial%20intelligence&lang=en&token=8f4e6904c8c6062c6828aa1d97876c4e`
  ];

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError("");
      let news = [];

      // ✅ Cek cache dulu
      const cache = localStorage.getItem("cachedNews");
      if (cache) {
        const parsed = JSON.parse(cache);
        const age = (Date.now() - parsed.timestamp) / 1000; // detik
        if (age < 300) { // Cache valid 5 menit
          setAllNews(parsed.data);
          setFilteredNews(parsed.data);
          setLoading(false);
          return; // ✅ Skip fetch API
        }
      }

      try {
        for (let url of sources) {
          try {
            const res = await fetch(url);
            if (!res.ok) continue; // skip API yang error
            const data = await res.json();

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

        news.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        if (news.length > 0) {
          setAllNews(news);
          setFilteredNews(news);

          // ✅ Simpan cache
          localStorage.setItem("cachedNews", JSON.stringify({
            data: news,
            timestamp: Date.now()
          }));
        } else {
          setError("⚠️ Failed to fetch news. Please try again later.");
        }
      } catch (err) {
        setError("⚠️ Failed to fetch news. Please try again later.");
      }
      setLoading(false);
    };

    fetchNews();
  }, []);

  useEffect(() => {
    let news = allNews;
    if (search) {
      news = news.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category) {
      news = news.filter((n) =>
        n.title.toLowerCase().includes(category.toLowerCase())
      );
    }
    setFilteredNews(news);
  }, [search, category, allNews]);

  return (
    <div className={`app ${theme}`}>
      <header>
        <h1>📰 AI News Portal</h1>
        <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>
      </header>

      <div className="container">
        {/* Search Box */}
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filters */}
        <div className="categories">
          {["Business", "Healthcare", "Research"].map((cat) => (
            <button
              key={cat}
              className={`cat-btn ${category === cat.toLowerCase() ? "active" : ""}`}
              onClick={() => setCategory(cat.toLowerCase())}
            >
              {cat}
            </button>
          ))}
          <button onClick={() => setCategory("")} className="cat-btn reset">All</button>
        </div>

        {/* Loading State */}
        {loading && <div className="spinner"></div>}

        {/* Error State */}
        {error && <p className="error">{error}</p>}

        {/* Empty State */}
        {!loading && !error && filteredNews.length === 0 && (
          <p className="empty">🔍 No AI news matches your search.</p>
        )}

        {/* News Grid */}
        <div className="news-grid">
          {filteredNews.map((item, index) => (
            <div key={index} className={`news-item ${index === 0 ? "headline" : ""}`}>
              <h3>
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.title}
                </a>
              </h3>
              <p className="timestamp">
                <FaClock /> {new Date(item.publishedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
