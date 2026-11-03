import { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-basic-dist';

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const plotRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/analytics/summary')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Сервер ответил ${response.status}`);
        }
        return response.json();
      })
      .then((body) => {
        if (!cancelled) setSummary(body);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Не удалось получить данные. Сначала запустите сервер: в каталоге server выполните npm run local.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const node = plotRef.current;
    if (!node || !summary) return undefined;

    const ordered = [...(summary.data || [])].reverse();

    Plotly.newPlot(
      node,
      [
        {
          type: 'bar',
          orientation: 'h',
          x: ordered.map((row) => row.count),
          y: ordered.map((row) => row.speaker),
          marker: { color: '#4f46e5' },
          hovertemplate: '%{y}<br>вопросов: %{x}<extra></extra>',
        },
      ],
      {
        title: summary.title,
        xaxis: { title: 'Число вопросов', rangemode: 'tozero', dtick: 1 },
        yaxis: { title: 'Спикер', automargin: false },
        margin: { l: 260, r: 32, t: 56, b: 56 },
        paper_bgcolor: '#fafaf9',
        plot_bgcolor: '#ffffff',
        font: { family: 'Segoe UI, sans-serif', color: '#1c1917' },
      },
      { responsive: true, displayModeBar: false }
    );

    return () => {
      Plotly.purge(node);
    };
  }, [summary]);

  return (
    <main className="wrap">
      <p className="eyebrow">DEVCONF 2026</p>
      <h1>Аналитика вопросов</h1>
      <p className="lead">
        Число вопросов, которые зрители задали каждому спикеру. Наведите курсор на столбец, чтобы увидеть точное значение.
      </p>
      {error ? <p className="error">{error}</p> : null}
      {!error && !summary ? <p className="lead">Загрузка…</p> : null}
      {summary ? <div ref={plotRef} className="plot" /> : null}
    </main>
  );
}
