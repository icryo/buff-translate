/**
 * Fetch the real-time exchange rate from the Frankfurter API
 * and store it in Chrome's local storage.
 */
async function fetchExchangeRate() {
  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=CNY&to=USD");
    const data = await response.json();

    if (data && data.rates && data.rates.USD) {
      const exchangeRate = data.rates.USD; // Extract the exchange rate
      console.log("Fetched real-time exchange rate:", exchangeRate);

      // Store the rate in Chrome storage
      chrome.storage.local.set({ cnyToUsdRate: exchangeRate });
    } else {
      throw new Error("Invalid data from Frankfurter API.");
    }
  } catch (error) {
    console.error("Failed to fetch real-time exchange rate:", error);

    // Store a fallback hardcoded exchange rate in case of failure
    chrome.storage.local.set({ cnyToUsdRate: 0.1364 });
  }
}

// Fetch the exchange rate when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed or updated. Fetching exchange rate...");
  fetchExchangeRate();
});

// Set up a listener to update the exchange rate every hour
chrome.alarms.create("updateExchangeRate", { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "updateExchangeRate") {
    console.log("Updating exchange rate...");
    fetchExchangeRate();
  }
});
