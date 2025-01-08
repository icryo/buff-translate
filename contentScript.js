/**
 * Converts all visible CNY prices to USD using the latest exchange rate.
 * @param {number} exchangeRate - The real-time CNY to USD exchange rate.
 */
function convertCnyPrices(exchangeRate) {
  console.log("Starting price conversion with exchange rate:", exchangeRate);

  // Select elements with relevant classes
  const priceElements = document.querySelectorAll(".sell_order_price, .f_Strong");
  console.log(`Found ${priceElements.length} elements to process.`);

  priceElements.forEach((element, index) => {
    console.log(`Processing element ${index + 1}:`, element);

    const mainText = element.childNodes[0]?.nodeValue?.trim(); // Main part (e.g., "¥ 11000")
    const smallElement = element.querySelector("small"); // Decimal part (e.g., ".08")
    const decimalText = smallElement?.textContent?.trim(); // Get <small> content

    console.log("Main text:", mainText);
    console.log("Decimal text:", decimalText);

    if (mainText && mainText.startsWith("¥")) {
      try {
        // Extract numeric values
        const numericMain = parseFloat(mainText.replace(/[¥\s]/g, "").replace(/,/g, ""));
        const numericDecimal = decimalText ? parseFloat(`0${decimalText}`) : 0;
        const cnyAmount = numericMain + numericDecimal;

        console.log(`Parsed CNY amount: ${cnyAmount}`);

        // Convert to USD
        const usdValue = (cnyAmount * exchangeRate).toFixed(2);
        console.log(`Converted to USD: ${usdValue}`);

        // Update the element's text
        element.childNodes[0].nodeValue = `$${usdValue}`;
        if (smallElement) {
          smallElement.textContent = ""; // Clear the decimal part
        }

        // Add tooltip with original price
        element.setAttribute("title", `Original price: ¥ ${cnyAmount.toFixed(2)}`);
        element.classList.add("converted-price"); // Highlight converted elements

        console.log("Successfully updated element:", element);
      } catch (error) {
        console.error("Error processing element:", element, error);
      }
    } else {
      console.log("Element does not contain a valid CNY price:", element);
    }
  });

  console.log("Price conversion completed.");
}

// Run the conversion initially
chrome.storage.local.get("cnyToUsdRate", (result) => {
  const exchangeRate = result.cnyToUsdRate || 0.1364; // Fallback to hardcoded rate
  console.log("Retrieved exchange rate from storage:", exchangeRate);

  // Convert prices
  convertCnyPrices(exchangeRate);
});

// Observe dynamic changes in the DOM and apply conversions
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      chrome.storage.local.get("cnyToUsdRate", (result) => {
        const exchangeRate = result.cnyToUsdRate || 0.1364; // Fallback to hardcoded rate
        console.log("Dynamic content detected. Re-applying price conversion.");
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            convertCnyPrices(exchangeRate);
          }
        });
      });
    }
  });
});

// Start observing the document for dynamic content changes
observer.observe(document.body, { childList: true, subtree: true });
