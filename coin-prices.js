const axios = require("axios");
const fs = require("fs");

async function fetchCoinPrices() {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin,ethereum",
          vs_currencies: "usd",
        },
      }
    );

    const coinPrices = response.data;
    const bitcoin = coinPrices.bitcoin.usd;
    const ethereum = coinPrices.ethereum.usd;

    const data = {
      btc: bitcoin,
      eth: ethereum,
      lastFetched: Date.now(),
    };

    fs.writeFile("crypto-prices.json", JSON.stringify(data), (err) => {
      if (err) {
        console.error("Error writing to file:", err);
      } else {
        console.log("Data written to crypto-prices.json");
      }
    });
  } catch (error) {
    console.error("Error fetching coin prices:", error.message);
  }
}

fetchCoinPrices();
