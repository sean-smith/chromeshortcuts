/*
 * Sean Smith
 * Alias 2016
*/

let aliases = {};

// Load aliases from storage
async function loadAliases() {
  const result = await chrome.storage.sync.get(null);
  aliases = result || {};
}

// GA4 Measurement Protocol helper
async function sendAnalytics(name, params = {}) {
  // Replace these with your GA4 measurement ID and API secret
  const measurementId = 'G-XXXXXXXXXX';  // Your GA4 measurement ID
  const apiSecret = 'XXXXXXXXXX';        // Your API secret
  
  const clientId = await getClientId();
  
  const payload = {
    client_id: clientId,
    events: [{
      name: name,
      params: params
    }]
  };

  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  } catch (e) {
    console.error('Analytics error:', e);
  }
}

// Get or generate a client ID
async function getClientId() {
  const result = await chrome.storage.local.get(['clientId']);
  if (result.clientId) {
    return result.clientId;
  }
  
  const clientId = crypto.randomUUID();
  await chrome.storage.local.set({ clientId });
  return clientId;
}

// Initial load
loadAliases();

const re = /[\d\s\+\-=\(\)\*]+/g;
const link = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
const search_url = /https:\/\/www\.google\.com\/search\?q=(\w+)&/;

// On input changed, call this
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    const suggestions = [];
    for (const key in aliases) {
      if (key.startsWith(text) || text === "") {
        const desc = `<match>${text}: </match><dim>${key} → </dim><url>${aliases[key]}</url>`;
        suggestions.push({content: aliases[key], description: desc});
      }
    }
    if (text.match(re)) {
      try {
        const result = eval(text).toString();
        chrome.omnibox.setDefaultSuggestion({description: `<match>= </match><url>${result}</url>`});
      } catch (e) {
        chrome.omnibox.setDefaultSuggestion({description: `<match>${text}: </match><dim> - Google Search</dim>`});
      }
    }
    else if (suggestions.length > 0) {
      const first = suggestions.splice(0, 1)[0];
      chrome.omnibox.setDefaultSuggestion({description: first['description']});
    }
    else {
      chrome.omnibox.setDefaultSuggestion({description: `<match>${text}: </match><dim> - Google Search</dim>`});
    }
    suggest(suggestions);
});

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    if (text in aliases) {
      chrome.tabs.update({ url: aliases[text] });
      sendAnalytics('alias_used', { alias: text, url: aliases[text] });
    }
    else if (text.match(link)) {
      chrome.tabs.update({ url: text });
      sendAnalytics('direct_url_used', { url: text });
    }
    else if (text.match(re)) {
      try {
        const result = eval(text).toString();
        chrome.tabs.update({url: `https://google.com/search?q=${result}`});
        sendAnalytics('calculator_used', { expression: text, result: result });
      } catch (e) {
        chrome.tabs.update({url: `https://google.com/search?q=${text}`});
        sendAnalytics('search_used', { query: text });
      }
    }
    else {
      chrome.tabs.update({url: `https://google.com/search?q=${text}`});
      sendAnalytics('search_used', { query: text });
    }
});

// Starting input
chrome.omnibox.onInputStarted.addListener(loadAliases);
