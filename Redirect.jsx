import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { logEvent } from '../logger';

function getLocation() {
  // Simulate coarse location (could use IP geolocation API)
  return 'Unknown';
}

function Redirect() {
  const { shortcode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('shortenedUrls');
    if (!stored) {
      logEvent('Redirect Error', { shortcode, error: 'No URLs found' });
      navigate('/');
      return;
    }
    const urls = JSON.parse(stored);
    const urlObj = urls.find(u => u.shortcode === shortcode);
    if (!urlObj) {
      logEvent('Redirect Error', { shortcode, error: 'Shortcode not found' });
      navigate('/');
      return;
    }
    // Check expiry
    if (new Date(urlObj.expiry) < new Date()) {
      logEvent('Redirect Error', { shortcode, error: 'URL expired' });
      navigate('/');
      return;
    }
    // Log click analytics
    const clickData = localStorage.getItem('clickAnalytics');
    const analytics = clickData ? JSON.parse(clickData) : {};
    const details = analytics[shortcode]?.details || [];
    details.push({
      timestamp: Date.now(),
      source: document.referrer || 'Direct',
      location: getLocation(),
    });
    analytics[shortcode] = {
      count: (analytics[shortcode]?.count || 0) + 1,
      details,
    };
    localStorage.setItem('clickAnalytics', JSON.stringify(analytics));
    logEvent('Short URL Clicked', { shortcode, url: urlObj.url });
    // Redirect
    window.location.replace(urlObj.url);
  }, [shortcode, navigate]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Redirecting...</h2>
      <p>If you are not redirected, <a href="#" onClick={() => window.location.reload()}>click here</a>.</p>
    </div>
  );
}

export default Redirect;
