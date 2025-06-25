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

const getIAAdvice = (prices, investments) => {
  const advices = [];

  if (prices.bitcoin?.usd < 60000) {
    advices.push("Oportunidad: BTC bajo $60K. ¿Considerás comprar?");
  }

  if (investments.ETH) {
    const ethInvestment = investments.ETH;
    if (prices.ethereum) {
      const currentPrice = prices.ethereum.usd;
      const profit = ((currentPrice - ethInvestment.buyPrice) / ethInvestment.buyPrice) * 100;
      if (profit > 5) {
        advices.push("Ganancia ETH >5%. Podrías pensar en tomar ganancias.");
      } else if (profit < -5) {
        advices.push("ETH bajó más de 5%. ¿Refuerzas o esperás recuperación?");
      }
    }
  }

  const totalCoins = Object.keys(investments).length;
  if (totalCoins === 1) {
    advices.push("Solo invertiste en una cripto. Diversificar reduce riesgos.");
  }

  if (advices.length === 0) {
    advices.push("Todo en orden. Analizá el mercado antes de nuevas decisiones.");
  }

  return advices;
};

const iaTips = [
  "Diversifica tu inversión en al menos 3 criptoactivos.",
  "Nunca inviertas más de lo que estés dispuesto a perder.",
  "Considerá revisar el histórico de precios antes de invertir.",
  "Aprovechá las caídas para comprar (DCA).",
  "No tomes decisiones impulsivas por emociones del mercado.",
  "Chequeá siempre los fundamentos del proyecto antes de invertir.",
  "Invertir en grandes como BTC y ETH reduce riesgos.",
  "Revisá tus inversiones cada semana.",
  "Mantené liquidez en USDT para oportunidades.",
  "Invertí en proyectos con comunidad activa y fuerte desarrollo."
];

const App = () => {
  const [prices, setPrices] = useState({});
  const [investments, setInvestments] = useState(() => {
    const saved = localStorage.getItem('investments');
    return saved ? JSON.parse(saved) : {};
  });
  const [historicalData, setHistoricalData] = useState([]);
  const [adviceIndex, setAdviceIndex] = useState(0);
  const [currentAdvice, setCurrentAdvice] = useState("");
  const [advisorIndex, setAdvisorIndex] = useState(0);

  useEffect(() => {
    fetchPrices();
    fetchHistoricalData();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    const advices = getIAAdvice(prices, investments);
    setCurrentAdvice(advices[0]);

    const interval = setInterval(() => {
      setAdviceIndex(prev => {
        const newIndex = (prev + 1) % advices.length;
        setCurrentAdvice(advices[newIndex]);
        return newIndex;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [prices, investments]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAdvisorIndex(prev => (prev + 1) % iaTips.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
      {/* IA Advisor Inteligente */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#0a192f',
        color: '#ffd700',
        padding: '10px',
        borderRadius: '10px',
        border: '1px solid #ffd700',
        boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
        zIndex: 9999,
        width: '250px',
        fontSize: '0.9em'
      }}>
        <strong>IA Advisor 🧠</strong>
        <p style={{ marginTop: '8px' }}>{iaTips[advisorIndex]}</p>
        <hr style={{ border: '0.5px solid #ffd700', margin: '8px 0' }} />
        <p>{currentAdvice}</p>
      </div>

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

      <p className="disclaimer" style={{ marginTop: '40px' }}>
        Disclaimer: Esta app es solo para simulación educativa. No constituye recomendación financiera real.
      </p>

      <div className="global-links">
        <p>Más información:</p>
        <a href="https://www.coingecko.com" target="_blank">CoinGecko</a> |
        <a href="https://coinmarketcap.com" target="_blank">CoinMarketCap</a> |
        <a href="https://es.wikipedia.org/wiki/Criptomoneda" target="_blank">¿Qué es una criptomoneda?</a>
      </div>
    </div>
  );
};

export default App;
