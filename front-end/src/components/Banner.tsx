import { useEffect, useRef } from 'react';

function TradingViewWidget() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      symbols: [
        {
          proName: "FOREXCOM:SPXUSD",
          title: "S&P 500 Index"
        },
        {
          proName: "FOREXCOM:NSXUSD",
          title: "US 100 Cash CFD"
        },
        {
          proName: "FX_IDC:EURUSD",
          title: "EUR to USD"
        },
        {
          proName: "BITSTAMP:BTCUSD",
          title: "Bitcoin"
        },
        {
          proName: "BITSTAMP:ETHUSD",
          title: "Ethereum"
        },
        {
          description: "Gold",
          proName: "OANDA:XAUUSD"
        },
        {
          description: "Tesla",
          proName: "NASDAQ:TSLA"
        },
        {
          description: "Nvidia",
          proName: "NASDAQ:NVDA"
        }
      ],
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: "compact",
      colorTheme: "dark",
      locale: "en"
    });

    const container = containerRef.current;

    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container__widget';
      container.appendChild(widgetContainer);

      container.appendChild(script);
    }

    return () => {
      // Clean up function
      const containerElement = containerRef.current;
      if (containerElement) {
        const scriptElement = containerElement.querySelector('script');
        if (scriptElement) {
          containerElement.removeChild(scriptElement);
        }
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef}></div>
  );
}

export default TradingViewWidget;
