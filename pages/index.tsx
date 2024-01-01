import { useState, useRef, useEffect } from "react";
import type { NextPage } from "next";
import Select from "react-select";
import useLocalStorage from "../controllers/local-storage";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BTC_HOLDINGS = 38_000;
const ETH_HOLDINGS = 888_000;

const ILLIQUID_HOLDINGS_USD = 305_000_000;
const MININGCO_NET_ASSET_VALUE_USD = 740_000_000;
const TOTAL_DEDUCTIONS_USD = 788_000_000;
const TOTAL_REMAINING_CLAIMS_USD = 4_225_000_000;

const ILLIQUID_RECOVERY_PCT =
  ILLIQUID_HOLDINGS_USD / TOTAL_REMAINING_CLAIMS_USD;

const MININGCO_RECOVERY_PCT =
  MININGCO_NET_ASSET_VALUE_USD / TOTAL_REMAINING_CLAIMS_USD;

const PETITION_DATE_COIN_PRICES: Record<string, number> = {
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
  CEL: 0.25,
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

const coinOptions = Object.keys(PETITION_DATE_COIN_PRICES).map((coin) => ({
  value: coin,
  label: coin,
}));

const Home: NextPage = () => {
  const [selectedCoins, setSelectedCoins] = useLocalStorage<
    Record<string, number | "">
  >("selectedCoins", {});
  const [addingCoin, setAddingCoin] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>(
    () => ({
      btc: 0,
      eth: 0,
    })
  );
  const selectRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd"
    )
      .then((res) => res.json())
      .then((res) => {
        setCryptoPrices({
          btc: res.bitcoin.usd,
          eth: res.ethereum.usd,
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setHasError(true);
        setIsLoading(false);
      });
  }, []);

  const totalUSD = Object.entries(selectedCoins).reduce(
    (total, [coin, balance]) =>
      total + PETITION_DATE_COIN_PRICES[coin] * (balance || 0),
    0
  );

  const totalUSDWithIncrease = totalUSD * 1.05;

  const btcHoldingsUsd = BTC_HOLDINGS * cryptoPrices.btc;
  const ethHoldingsUsd = ETH_HOLDINGS * cryptoPrices.eth;

  const availableLiquidCryptoUsd =
    btcHoldingsUsd + ethHoldingsUsd - TOTAL_DEDUCTIONS_USD;

  const totalDistributableValueUsd =
    availableLiquidCryptoUsd +
    ILLIQUID_HOLDINGS_USD +
    MININGCO_NET_ASSET_VALUE_USD;

  const liquidCryptoRecoveryPct =
    availableLiquidCryptoUsd / TOTAL_REMAINING_CLAIMS_USD;

  const totalRecoveryPct =
    totalDistributableValueUsd / TOTAL_REMAINING_CLAIMS_USD;

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

  if (isLoading) {
    return (
      <div className="min-h-screen py-6 flex flex-col justify-center sm:py-12">
        <Card className="w-full max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Celsius claim calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">Fetching crypto prices...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen py-6 flex flex-col justify-center sm:py-12">
        <Card className="w-full max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Celsius claim calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              Error fetching crypto prices. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen py-6 flex flex-col justify-center sm:py-12">
        <Card className="w-full max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Celsius claim calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside mb-6 space-y-2">
              <li>Open the Celsius app.</li>
              <li>
                Add the balance of each coin you have in your Celsius wallet
                using the "Add coin" button below.
              </li>
            </ol>
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
              <Button onClick={handleAddCoin} className="mb-4">
                Add coin
              </Button>
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
                  <Input
                    type="number"
                    id={coin}
                    value={selectedCoins[coin]}
                    className="p-2 block w-full border border-gray-300 rounded-md flex-1 text-base"
                    onChange={(e) =>
                      setSelectedCoins({
                        ...selectedCoins,
                        [coin]:
                          e.target.value === ""
                            ? ""
                            : parseFloat(e.target.value),
                      })
                    }
                  />
                  <Button
                    variant="destructive"
                    onClick={() => handleRemoveCoin(coin)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={handleClear}>
                Clear
              </Button>
              <div className="text-right text-xl font-semibold">
                <p className="text-lg text-gray-700">
                  Claim value:{" "}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalUSD)}
                </p>
                <p>
                  Claim value + 5%:{" "}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalUSDWithIncrease)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full max-w-xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Estimated recovery</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Recovery %</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Liquid crypto</TableCell>
                  <TableCell className="text-right">
                    {(liquidCryptoRecoveryPct * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(totalUSDWithIncrease * liquidCryptoRecoveryPct)}
                    <div className="text-gray-700 text-xs">
                      <div>
                        ~
                        {(
                          (totalUSDWithIncrease * liquidCryptoRecoveryPct) /
                          2 /
                          cryptoPrices.btc
                        ).toFixed(4)}{" "}
                        BTC
                      </div>
                      <div>
                        ~
                        {(
                          (totalUSDWithIncrease * liquidCryptoRecoveryPct) /
                          2 /
                          cryptoPrices.eth
                        ).toFixed(4)}{" "}
                        ETH
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Illiquid asset recovery</TableCell>
                  <TableCell className="text-right">
                    {(ILLIQUID_RECOVERY_PCT * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(totalUSDWithIncrease * ILLIQUID_RECOVERY_PCT)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>MiningCo common stock</TableCell>
                  <TableCell className="text-right">
                    {(MININGCO_RECOVERY_PCT * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(totalUSDWithIncrease * MININGCO_RECOVERY_PCT)}
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total estimated recovery</TableCell>
                  <TableCell className="text-right">
                    {(totalRecoveryPct * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(
                      totalUSDWithIncrease *
                        (liquidCryptoRecoveryPct +
                          ILLIQUID_RECOVERY_PCT +
                          MININGCO_RECOVERY_PCT)
                    )}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <div className="mt-4 text-gray-700 text-sm">
              <p>This calculator does not take into account:</p>
              <ul className="list-disc list-inside">
                <li>Clawbacks</li>
                <li>
                  Undistributed Claims (available at least one year after
                  effective date)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
        <div className="w-full max-w-xl mx-auto mt-8 px-4 text-center text-sm text-gray-700 space-y-2">
          <p>
            Based on the Celsius Recovery Sheet created by{" "}
            <a
              href="https://twitter.com/bayanimills"
              className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
            >
              @bayanimills
            </a>
            .
          </p>
          <p>
            Disclaimer: This calculator is provided for informational purposes
            only and should not be considered legal, tax, or financial advice.
            Please consult with a professional advisor before making any
            financial decisions. We are not responsible for any errors or
            omissions, or for the results obtained from the use of this
            information.
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
