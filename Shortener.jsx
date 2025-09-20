import React, { useState } from 'react';
import { logEvent } from '../logger';
import './Shortener.css';

const MAX_URLS = 5;

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidShortcode(code) {
  return /^[a-zA-Z0-9]{4,12}$/.test(code);
}

function Shortener() {
  const [inputs, setInputs] = useState([
    { url: '', validity: '', shortcode: '' },
  ]);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);

  const handleInputChange = (idx, field, value) => {
    const newInputs = [...inputs];
    newInputs[idx][field] = value;
    setInputs(newInputs);
  };

  const addInput = () => {
    if (inputs.length < MAX_URLS) {
      setInputs([...inputs, { url: '', validity: '', shortcode: '' }]);
    }
  };

  const removeInput = (idx) => {
    setInputs(inputs.filter((_, i) => i !== idx));
  };

  const generateShortcode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newResults = [];
    const newErrors = [];
    const usedShortcodes = new Set(results.map(r => r.shortcode));
    inputs.forEach((input, idx) => {
      let error = '';
      if (!isValidUrl(input.url)) {
        error = 'Invalid URL format.';
      } else if (input.validity && (!Number.isInteger(Number(input.validity)) || Number(input.validity) <= 0)) {
        error = 'Validity must be a positive integer.';
      } else if (input.shortcode && !isValidShortcode(input.shortcode)) {
        error = 'Shortcode must be alphanumeric, 4-12 chars.';
      } else if (input.shortcode && usedShortcodes.has(input.shortcode)) {
        error = 'Shortcode already used.';
      }
      if (error) {
        newErrors[idx] = error;
        logEvent('Input Error', { idx, error });
        return;
      }
      let shortcode = input.shortcode || generateShortcode();
      while (usedShortcodes.has(shortcode)) {
        shortcode = generateShortcode();
      }
      usedShortcodes.add(shortcode);
      const now = new Date();
      const validityMins = input.validity ? Number(input.validity) : 30;
      const expiry = new Date(now.getTime() + validityMins * 60000);
      newResults.push({
        url: input.url,
        shortcode,
        created: now,
        expiry,
      });
      logEvent('Short URL Created', { url: input.url, shortcode, expiry });
    });
    setResults([...results, ...newResults]);
    setErrors(newErrors);
    // Persist to localStorage
    if (newResults.length) {
      const allResults = [...results, ...newResults];
      localStorage.setItem('shortenedUrls', JSON.stringify(allResults));
    }
  };

  return (
    <div className="shortener-page">
      <h2>URL Shortener</h2>
      <form onSubmit={handleSubmit}>
        {inputs.map((input, idx) => (
          <div key={idx} className="input-row">
            <input
              type="text"
              placeholder="Long URL"
              value={input.url}
              onChange={e => handleInputChange(idx, 'url', e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Validity (mins)"
              value={input.validity}
              onChange={e => handleInputChange(idx, 'validity', e.target.value)}
              min="1"
            />
            <input
              type="text"
              placeholder="Custom Shortcode (optional)"
              value={input.shortcode}
              onChange={e => handleInputChange(idx, 'shortcode', e.target.value)}
              maxLength={12}
            />
            {inputs.length > 1 && (
              <button type="button" onClick={() => removeInput(idx)} className="remove-btn">Remove</button>
            )}
            {errors[idx] && <span className="error-msg">{errors[idx]}</span>}
          </div>
        ))}
        {inputs.length < MAX_URLS && (
          <button type="button" onClick={addInput} className="add-btn">Add URL</button>
        )}
        <button type="submit" className="submit-btn">Shorten URLs</button>
      </form>
      <div className="results">
        <h3>Shortened URLs</h3>
        {results.map((r, idx) => (
          <div key={idx} className="result-row">
            <span className="short-url">{window.location.origin + '/' + r.shortcode}</span>
            <span className="expiry">Expires: {r.expiry.toLocaleString()}</span>
            <span className="original-url">Original: {r.url}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shortener;
