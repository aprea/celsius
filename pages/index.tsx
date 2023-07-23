import { useState } from "react";
import type { NextPage } from "next";

const coinPrices: Record<string, number> = {
  "1INCH": 0.581744108,
  AAVE: 78.24291593,
  ADA: 0.427003308,
  AVAX: 18.49035408,
  BADGER: 3.285369715,
  BAT: 0.37621662,
  BCH: 100.546894,
  BNB: 226.92614,
  BNT: 0.450047559,
  BSV: 50.99015321,
  BTC: 19881.00134,
  BTG: 15.14018234,
  BUSD: 1,
  CEL: 0.81565,
  COMP: 47.33041601,
  CRV: 1.032841943,
  CVX: 6.08763006,
  DAI: 1,
  DASH: 41.79955662,
  DOGE: 0.061140905,
  DOT: 6.360775884,
  EOS: 0.929357695,
  ETC: 14.12753443,
  ETH: 1088.170943,
  GUSD: 1,
  KNC: 1.263392739,
  LINK: 6.077201511,
  LPT: 8.033566927,
  LTC: 48.75597218,
  LUNC: 0.00009241,
  MANA: 0.80042259,
  MATIC: 0.609434275,
  MCDAI: 1,
  MKR: 839.8922442,
  OMG: 1.71960007,
  ORBS: 0.040053336,
  PAX: 1,
  PAXG: 1738.836303,
  SGA: 1.214643649,
  SGB: 0.026003699,
  SGR: 1.214643649,
  SNX: 2.465894386,
  SOL: 34.24173443,
  SPARK: 0,
  SUSHI: 1.214062046,
  TAUD: 0.6748,
  TCAD: 0.7701,
  TGBP: 1.1881,
  THKD: 0.1274,
  TUSD: 1,
  UMA: 2.487366187,
  UNI: 6.014518833,
  USDC: 1,
  USDT: 1,
  UST: 0.039474965,
  WBTC: 19852.24182,
  WDGLD: 168,
  XAUT: 1741.393614,
  XLM: 0.104188979,
  XRP: 0.321111953,
  XTZ: 1.483213139,
  YF: 5742.188874,
  ZEC: 53.54163596,
  ZRX: 0.277486691,
  ZUSD: 1,
};

const Home: NextPage = () => {
  const [balances, setBalances] = useState<Record<string, number>>({});

  const handleInputChange = (coin: string, value: number) => {
    setBalances((prevBalances) => ({ ...prevBalances, [coin]: value }));
  };

  const calculateTotalUSD = () => {
    return Object.entries(balances).reduce(
      (total, [coin, balance]) => total + coinPrices[coin] * balance,
      0
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-2xl font-bold mb-6">Celsius Claim Calculator</h1>
          {Object.keys(coinPrices).map((coin) => (
            <div key={coin} className="mb-4">
              <label
                htmlFor={coin}
                className="block text-sm font-medium text-gray-700"
              >
                {coin} balance:
              </label>
              <input
                type="number"
                id={coin}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                onChange={(e) =>
                  handleInputChange(coin, parseFloat(e.target.value))
                }
              />
            </div>
          ))}
          <div className="text-xl font-semibold">
            Total USD Value: ${calculateTotalUSD().toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
