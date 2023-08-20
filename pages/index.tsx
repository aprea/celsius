import { useState, useEffect, useRef, useCallback } from "react";
import type { NextPage } from "next";
import Select from "react-select";

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

const coinOptions = Object.keys(coinPrices).map((coin) => ({
  value: coin,
  label: coin,
}));

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function (...args: any) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

const Home: NextPage = () => {
  const [selectedCoins, setSelectedCoins] = useState<
    Record<string, number | "">
  >({});
  const [totalUSD, setTotalUSD] = useState<number>(0);
  const [addingCoin, setAddingCoin] = useState<boolean>(false);
  const selectRef = useRef(null);
  const totalUSDWithIncrease = totalUSD * 1.05;

  // Calculate total USD with debounce
  const delayedCalculation = useCallback(
    debounce(() => {
      const total = Object.entries(selectedCoins).reduce(
        (total, [coin, balance]) => total + coinPrices[coin] * (balance || 0),
        0
      );
      setTotalUSD(total);
    }, 500),
    [selectedCoins]
  );

  useEffect(() => {
    delayedCalculation();
  }, [selectedCoins, delayedCalculation]);

  const handleClear = () => {
    setSelectedCoins({});
  };

  const handleAddCoin = () => {
    setAddingCoin(true);
    setTimeout(() => selectRef.current.focus(), 10); // focus the select input
  };

  const handleRemoveCoin = (coin: string) => {
    const { [coin]: removedCoin, ...remainingCoins } = selectedCoins;
    setSelectedCoins(remainingCoins);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="w-full max-w-xl mx-auto p-4 rounded-lg shadow-md bg-white">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Celsius Claim Calculator
        </h1>
        {addingCoin ? (
          <Select
            ref={selectRef}
            options={coinOptions}
            className="mb-4"
            placeholder="Select a coin..."
            isClearable
            onBlur={() => setAddingCoin(false)}
            onChange={({ value }) => {
              setSelectedCoins({
                ...selectedCoins,
                [value]: selectedCoins[value] || "",
              });
              setAddingCoin(false);
            }}
          />
        ) : (
          <button
            onClick={handleAddCoin}
            className="mb-4 bg-blue-600 text-white px-3 py-1 rounded-md"
          >
            Add Coin
          </button>
        )}
        {Object.keys(selectedCoins).map((coin) => (
          <div key={coin} className="mb-4">
            <label
              htmlFor={coin}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {coin} balance:
            </label>
            <div className="flex justify-between gap-2">
              <input
                type="number"
                id={coin}
                value={selectedCoins[coin]}
                className="p-2 block w-full border border-gray-300 rounded-md flex-1"
                onChange={(e) =>
                  setSelectedCoins({
                    ...selectedCoins,
                    [coin]:
                      e.target.value === "" ? "" : parseFloat(e.target.value),
                  })
                }
              />
              <button
                className="bg-red-600 text-white px-3 py-1 rounded-md"
                onClick={() => handleRemoveCoin(coin)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <button
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md"
            onClick={handleClear}
          >
            Clear
          </button>
          <div className="text-xl font-semibold">
            Total USD Value:{" "}
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalUSD)}
          </div>
        </div>
      </div>
      <div className="w-full max-w-xl mx-auto mt-8 p-4 rounded-lg shadow-md bg-white">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Estimated Recovery
        </h2>
        <p className="mb-1">
          105% claim:{" "}
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(totalUSDWithIncrease)}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Disclaimer: must vote for plan & not opt-out of class-claim.
        </p>
        <div className="min-w-full divide-y divide-gray-200">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                  37% liquid crypto
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500 text-right">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalUSDWithIncrease * 0.37)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                  30% NewCo equity
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500 text-right">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalUSDWithIncrease * 0.3)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500 font-bold">
                  Total estimated recovery
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500 text-right font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalUSDWithIncrease * 0.67)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-full max-w-xl mx-auto mt-8 px-4 text-center text-sm text-gray-700">
        <p>
          Disclaimer: This calculator is provided for informational purposes
          only and should not be considered legal, tax, or financial advice.
          Please consult with a professional advisor before making any financial
          decisions. We are not responsible for any errors or omissions, or for
          the results obtained from the use of this information.
        </p>
      </div>
    </div>
  );
};

export default Home;
