import { useEffect, useRef } from 'react';

function HotList() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "dark",
      "dateRange": "12M",
      "exchange": "US",
      "showChart": true,
      "locale": "en",
      "width": "100%",
      "height": "100%",
      "largeChartUrl": "",
      "isTransparent": false,
      "showSymbolLogo": true,
      "showFloatingTooltip": false,
      "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
      "plotLineColorFalling": "rgba(41, 98, 255, 1)",
      "gridLineColor": "rgba(42, 46, 57, 0)",
      "scaleFontColor": "rgba(219, 219, 219, 1)",
      "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
      "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
      "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
      "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
      "symbolActiveColor": "rgba(41, 98, 255, 0.12)"
    });

    const container = containerRef.current;
    if (container) {
      // Clear container first
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container__widget';
      container.appendChild(widgetContainer);

      // Add copyright element
      const copyright = document.createElement('div');
      copyright.className = 'tradingview-widget-copyright';
      const link = document.createElement('a');
      link.href = 'https://www.tradingview.com/';
      link.rel = 'noopener nofollow';
      link.target = '_blank';
      const span = document.createElement('span');
      span.className = 'blue-text';
      span.textContent = 'Track all markets on TradingView';
      link.appendChild(span);
      copyright.appendChild(link);
      container.appendChild(copyright);

      // Add script
      container.appendChild(script);
    }

    // Clean up function
    return () => {
      const containerElement = containerRef.current;
      if (containerElement) {
        while (containerElement.firstChild) {
          containerElement.removeChild(containerElement.firstChild);
        }
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef}></div>
  );
}

export default HotList;
