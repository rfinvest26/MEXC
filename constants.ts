import { Asset } from './types';

export const MOCK_ASSETS: Asset[] = [
  // ВАЖНО: не держим статические цены в коде — котировки подтягиваются из `market_quotes`.
  // Поэтому price=0 и priceUnavailable=true, пока не загрузим реальную цену.
  { id: '1', ticker: 'BTC', name: 'Bitcoin', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '2', ticker: 'ETH', name: 'Ethereum', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '3', ticker: 'SOL', name: 'Solana', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '4', ticker: 'TON', name: 'Toncoin', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '5', ticker: 'USDT', name: 'Tether', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '6', ticker: 'XRP', name: 'Ripple', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '7', ticker: 'DOGE', name: 'Dogecoin', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '8', ticker: 'ADA', name: 'Cardano', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '9', ticker: 'AVAX', name: 'Avalanche', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '10', ticker: 'DOT', name: 'Polkadot', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '11', ticker: 'LINK', name: 'Chainlink', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '12', ticker: 'MATIC', name: 'Polygon', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
];

export const MARKET_ASSETS: Asset[] = [
  ...MOCK_ASSETS,
  // Криптовалюты
  { id: '13', ticker: 'SHIB', name: 'Shiba Inu', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '14', ticker: 'LTC', name: 'Litecoin', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '15', ticker: 'TRX', name: 'Tron', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '16', ticker: 'BCH', name: 'Bitcoin Cash', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '17', ticker: 'NEAR', name: 'NEAR Protocol', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '18', ticker: 'APT', name: 'Aptos', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '19', ticker: 'ATOM', name: 'Cosmos', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '20', ticker: 'XLM', name: 'Stellar', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '21', ticker: 'ARB', name: 'Arbitrum', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '22', ticker: 'OP', name: 'Optimism', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '23', ticker: 'INJ', name: 'Injective', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '24', ticker: 'RNDR', name: 'Render', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '25', ticker: 'PEPE', name: 'Pepe', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '26', ticker: 'FIL', name: 'Filecoin', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '27', ticker: 'HBAR', name: 'Hedera', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '28', ticker: 'KAS', name: 'Kaspa', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '29', ticker: 'VET', name: 'VeChain', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '30', ticker: 'ICP', name: 'Internet Computer', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '31', ticker: 'SUI', name: 'Sui', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '32', ticker: 'SEI', name: 'Sei', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '33', ticker: 'WIF', name: 'dogwifhat', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '34', ticker: 'BONK', name: 'Bonk', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '35', ticker: 'FLOKI', name: 'Floki', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '36', ticker: 'STX', name: 'Stacks', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '37', ticker: 'TIA', name: 'Celestia', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '38', ticker: 'IMX', name: 'Immutable X', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '39', ticker: 'FET', name: 'Fetch.ai', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '40', ticker: 'RUNE', name: 'THORChain', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '41', ticker: 'AAVE', name: 'Aave', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '42', ticker: 'MKR', name: 'Maker', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '43', ticker: 'CRV', name: 'Curve DAO', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '44', ticker: 'UNI', name: 'Uniswap', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '45', ticker: 'SAND', name: 'The Sandbox', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '46', ticker: 'MANA', name: 'Decentraland', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '47', ticker: 'AXS', name: 'Axie Infinity', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '48', ticker: 'EGLD', name: 'MultiversX', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '49', ticker: 'FTM', name: 'Fantom', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },
  { id: '50', ticker: 'ALGO', name: 'Algorand', price: 0, volume24h: 0, change24h: 0, category: 'crypto', priceUnavailable: true },

];

/** US-акции: котировки Finnhub, график TradingView, логотипы — CDN TradingView / указанные URL. */
export const STOCK_MARKET_ASSETS: Asset[] = [
  { id: 'st1', ticker: 'NVDA', name: 'NVIDIA Corporation', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/nvidia--600.png', tagline: 'Лидер AI и чипов, самая активная акция' },
  { id: 'st2', ticker: 'TSLA', name: 'Tesla, Inc.', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/tesla--600.png', tagline: 'Высокий объём торгов, волатильность' },
  { id: 'st3', ticker: 'AAPL', name: 'Apple Inc.', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/apple--600.png', tagline: 'Классика, огромная капитализация' },
  { id: 'st4', ticker: 'MSFT', name: 'Microsoft Corporation', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/microsoft--600.png', tagline: 'Лидер облаков и AI' },
  { id: 'st5', ticker: 'AMZN', name: 'Amazon.com, Inc.', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/amazon--600.png', tagline: 'E-commerce + облако' },
  { id: 'st6', ticker: 'GOOGL', name: 'Alphabet Inc.', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/alphabet--600.png', tagline: 'Google, YouTube, AI' },
  { id: 'st7', ticker: 'META', name: 'Meta Platforms', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/meta-platforms--600.png', tagline: 'Соцсети + реклама + метавселенная' },
  { id: 'st8', ticker: 'AVGO', name: 'Broadcom Inc.', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/broadcom--600.png', tagline: 'Полупроводники, AI' },
  { id: 'st9', ticker: 'PLTR', name: 'Palantir Technologies', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/palantir--600.png', tagline: 'Очень популярна в 2025–2026 среди розницы' },
  { id: 'st10', ticker: 'AMD', name: 'Advanced Micro Devices', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/advanced-micro-devices--600.png', tagline: 'Конкурент NVIDIA' },
  { id: 'st11', ticker: 'INTC', name: 'Intel Corporation', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/intel--600.png', tagline: 'Высокий объём торгов в 2026' },
  { id: 'st12', ticker: 'SMCI', name: 'Super Micro Computer', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/super-micro-computer--600.png', tagline: 'Серверы для AI' },
  { id: 'st13', ticker: 'ARM', name: 'Arm Holdings', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/arm--600.png', tagline: 'Дизайн чипов' },
  { id: 'st14', ticker: 'COIN', name: 'Coinbase Global', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/coinbase--600.png', tagline: 'Крипто-биржа, коррелирует с биткоином' },
  { id: 'st15', ticker: 'HOOD', name: 'Robinhood Markets', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/robinhood--600.png', tagline: 'Популярна среди розничных трейдеров' },
  { id: 'st16', ticker: 'SOFI', name: 'SoFi Technologies', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/sofi--600.png', tagline: 'Финтех, высокая активность' },
  { id: 'st17', ticker: 'NFLX', name: 'Netflix, Inc.', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/netflix--600.png', tagline: 'Стриминг' },
  { id: 'st18', ticker: 'MU', name: 'Micron Technology', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, logoUrl: 'https://s3-symbol-logo.tradingview.com/micron-technology--600.png', tagline: 'Память для AI' },
  { id: 'st19', ticker: 'ORCL', name: 'Oracle Corporation', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, tradingViewSymbol: 'NYSE:ORCL', logoUrl: 'https://etoro-cdn.etorostatic.com/market-avatars/orcl/150x150.png', tagline: 'Облачные технологии и базы данных' },
  { id: 'st20', ticker: 'BRK.B', name: 'Berkshire Hathaway Inc.', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, tradingViewSymbol: 'NYSE:BRK.B', logoUrl: 'https://porti.ru/resource/img/company/logo/29302.png', tagline: 'Холдинг Уоррена Баффета' },
  { id: 'st21', ticker: 'JPM', name: 'JPMorgan Chase & Co.', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, tradingViewSymbol: 'NYSE:JPM', logoUrl: 'https://s3-symbol-logo.tradingview.com/jpmorgan-chase--600.png', tagline: 'Крупнейший банк США' },
  { id: 'st22', ticker: 'XOM', name: 'Exxon Mobil Corporation', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, tradingViewSymbol: 'NYSE:XOM', logoUrl: 'https://s3-symbol-logo.tradingview.com/exxon--600.png', tagline: 'Нефть и газ' },
  { id: 'st23', ticker: 'TSM', name: 'Taiwan Semiconductor', price: 0, volume24h: 0, change24h: 0, category: 'stock', priceUnavailable: true, tradingViewSymbol: 'NYSE:TSM', logoUrl: 'https://s3-symbol-logo.tradingview.com/taiwan-semiconductor--600.png', tagline: 'Контрактное производство чипов' },
];

/** Локальный логотип из `public/mexc-logo.png` — без внешних CDN */
export const ETORO_LOGO_URL = `${import.meta.env.BASE_URL}mexc-logo.png`;

// CHART_DATA удалён: график рендерится по реальным котировкам провайдера (TradingView).