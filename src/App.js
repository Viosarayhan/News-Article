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

useEffect(() => {
  const fetchNews = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/news"); // 🔥 backend kita sendiri
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();

      if (data.articles) {
        setAllNews(data.articles);
        setFilteredNews(data.articles);

        localStorage.setItem("cachedNews", JSON.stringify({
          data: data.articles,
          timestamp: Date.now()
        }));
      } else {
        setError("⚠️ No news found.");
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
