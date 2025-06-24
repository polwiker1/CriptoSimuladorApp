import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const coins = [
  { id: 'bitcoin', symbol: 'BTC' },
  { id: 'ethereum', symbol: 'ETH' },
  { id: 'binancecoin', symbol: 'BNB' },
  { id: 'solana', symbol: 'SOL' },
  { id: 'ripple', symbol: 'XRP' },
  { id: 'cardano', symbol: 'ADA' },
  { id: 'dogecoin', symbol: 'DOGE' },
  { id: 'pepe', symbol: 'PEPE' },
  { id: 'ondo-finance', symbol: 'ONDO' },
  { id: 'aave', symbol: 'AAVE' }
];

const coinLinks = {
  bitcoin: 'https://bitcoin.org',
  ethereum: 'https://ethereum.org',
  binancecoin: 'https://www.binance.com',
  solana: 'https://solana.com',
  ripple: 'https://ripple.com',
  cardano: 'https://cardano.org',
  dogecoin: 'https://dogecoin.com',
  pepe: 'https://www.coingecko.com/en/coins/pepe',
  'ondo-finance': 'https://ondo.finance',
  aave: 'https://aave.com'
};

const App = () => {
  const [prices, setPrices] = useState({});
  const [investments, setInvestments] = useState(() => {
    const saved = localStorage.getItem('investments');
    return saved ? JSON.parse(saved) : {};
  });
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    fetchPrices();
    fetchHistoricalData();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(investments));
  }, [investments]);

  const fetchPrices = async () => {
    try {
      const ids = coins.map(c => c.id).join(',');
      const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
      setPrices(res.data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const res = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7');
      setHistoricalData(res.data.prices);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const handleInvestment = (symbol, amount) => {
    const coinId = coins.find(c => c.symbol === symbol).id;
    setInvestments(prev => ({
      ...prev,
      [symbol]: {
        amount: parseFloat(amount),
        date: new Date(),
        buyPrice: prices[coinId]?.usd || 0
      }
    }));
  };

  const removeInvestment = (symbol) => {
    const updated = { ...investments };
    delete updated[symbol];
    setInvestments(updated);
  };

  const getProfitLoss = (coin) => {
    const investment = investments[coin.symbol];
    if (!investment || !prices[coin.id]) return null;
    const investedUSD = parseFloat(investment.amount);
    const buyPrice = investment.buyPrice;
    const currentPrice = prices[coin.id].usd;

    if (!buyPrice || buyPrice === 0) return 'Datos incompletos';

    const boughtAmount = investedUSD / buyPrice;
    const currentValue = boughtAmount * currentPrice;
    const profitLoss = currentValue - investedUSD;
    return profitLoss.toFixed(2);
  };

  return (
    <div style={{ backgroundColor: '#001f2d', color: '#ffd700', minHeight: '100vh', padding: '20px' }}>
      <img 
        src="/logo-wkr.png" 
        alt="Logo WKR" 
        style={{ 
          width: '100px', 
          height: '100px', 
          animation: 'spin 5s linear infinite', 
          display: 'block', 
          margin: '0 auto' 
        }} 
      />
      <h1>CriptoSimuladorApp</h1>
      {coins.map(coin => (
        <div key={coin.id} style={{ marginBottom: '20px', borderBottom: '1px solid #ffd700', paddingBottom: '10px' }}>
          <h2>{coin.symbol}</h2>
          <p>Precio actual: ${prices[coin.id]?.usd || 'Cargando...'}</p>
          <input
            type="number"
            placeholder="Monto en USD"
            style={{ padding: '5px', width: '150px', marginBottom: '5px' }}
            onBlur={(e) => handleInvestment(coin.symbol, e.target.value)}
          />
          {investments[coin.symbol] && (
            <div>
              <p>
                Invertiste: ${investments[coin.symbol].amount} el {new Date(investments[coin.symbol].date).toLocaleString()}
              </p>
              <p>
                Resultado: {getProfitLoss(coin)} USD
              </p>
              <button
                onClick={() => removeInvestment(coin.symbol)}
                style={{ padding: '5px', backgroundColor: 'lightblue', color: '#001f2d', border: 'none', cursor: 'pointer' }}
              >
                Borrar inversión
              </button>
            </div>
          )}
          <a href={coinLinks[coin.id]} target="_blank" rel="noopener noreferrer">Sitio oficial de {coin.symbol}</a>
        </div>
      ))}

      <h2>Gráfico de Precios (USD)</h2>
      <Line
        data={{
          labels: coins.map(c => c.symbol),
          datasets: [
            {
              label: 'Precio actual USD',
              data: coins.map(c => prices[c.id]?.usd || 0),
              borderColor: '#ffd700',
              backgroundColor: 'rgba(255, 215, 0, 0.3)',
            },
          ],
        }}
        options={{
          scales: {
            x: { type: 'category', ticks: { color: '#fff' } },
            y: { beginAtZero: true, ticks: { color: '#fff' } }
          }
        }}
      />

      <h2>Gráfico de Bitcoin (últimos 7 días)</h2>
      <Line
        data={{
          labels: historicalData.map(item => new Date(item[0]).toLocaleDateString()),
          datasets: [{
            label: 'BTC USD',
            data: historicalData.map(item => item[1]),
            borderColor: '#ffd700',
            backgroundColor: 'rgba(255,215,0,0.3)'
          }]
        }}
        options={{
          scales: {
            x: { type: 'time', time: { unit: 'day' }, ticks: { color: '#fff' } },
            y: { beginAtZero: false, ticks: { color: '#fff' } }
          }
        }}
      />

      <p className="disclaimer">
        Disclaimer: Esta app es solo para simulación educativa. No constituye recomendación financiera real.
      </p>

      <div className="global-links">
        <p>Más información:</p>
        <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer">CoinGecko</a> |
        <a href="https://coinmarketcap.com" target="_blank" rel="noopener noreferrer">CoinMarketCap</a> |
        <a href="https://es.wikipedia.org/wiki/Criptomoneda" target="_blank" rel="noopener noreferrer">¿Qué es una criptomoneda?</a>
      </div>
    </div>
  );
};

export default App;
