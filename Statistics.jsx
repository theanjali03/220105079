import React, { useEffect, useState } from 'react';
import { logEvent } from '../logger';
import './Statistics.css';

function Statistics() {
  const [urls, setUrls] = useState([]);
  const [clicks, setClicks] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem('shortenedUrls');
    if (stored) {
      setUrls(JSON.parse(stored));
    }
    const clickData = localStorage.getItem('clickAnalytics');
    if (clickData) {
      setClicks(JSON.parse(clickData));
    }
  }, []);

  return (
    <div className="statistics-page">
      <h2>Shortener Statistics</h2>
      {urls.length === 0 ? (
        <p>No shortened URLs found.</p>
      ) : (
        <div className="stats-list">
          {urls.map((urlObj, idx) => {
            const clickInfo = clicks[urlObj.shortcode] || { count: 0, details: [] };
            return (
              <div key={idx} className="stats-row">
                <div className="short-url">{window.location.origin + '/' + urlObj.shortcode}</div>
                <div>Created: {new Date(urlObj.created).toLocaleString()}</div>
                <div>Expires: {new Date(urlObj.expiry).toLocaleString()}</div>
                <div>Total Clicks: {clickInfo.count}</div>
                <div className="click-details">
                  <strong>Click Details:</strong>
                  {clickInfo.details.length === 0 ? (
                    <span> No clicks yet.</span>
                  ) : (
                    <ul>
                      {clickInfo.details.map((c, i) => (
                        <li key={i}>
                          <span>{new Date(c.timestamp).toLocaleString()}</span> | 
                          <span>Source: {c.source}</span> | 
                          <span>Location: {c.location}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Statistics;
