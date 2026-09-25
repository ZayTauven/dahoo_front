'use client';
/*
 * Vireo Next.js — effect-guarded ApexCharts component.
 *
 * Lazy-imports apexcharts, renders into a ref'd <div>, and re-themes live on the
 * `ax:change` event (light↔dark, 12 accents, RTL) by re-reading the --ax-* token
 * palette — the same contract as the HTML edition's charts.js wrapper. All DOM
 * mutation is confined to effects; React owns the container only. Portable.
 */
import { useEffect, useRef } from 'react';
import type { ApexOptions } from 'apexcharts';
import { apexBase, deepMerge, readTokens, resolveColor, type BaseOpts } from './apex';

export interface ApexChartProps {
  type: string;
  series: ApexOptions['series'];
  height?: number;
  sparkline?: boolean;
  accent?: boolean;
  legend?: string;
  stacked?: boolean;
  tooltip?: boolean;
  /** Fixed color token/literal — overrides the palette (e.g. KPI sparklines). */
  color?: string | null;
  /** Palette de la série (jetons `--ax-…` ou couleurs), résolue à la création et à chaque changement de thème. */
  colors?: string[];
  /** Extra raw ApexCharts options merged last (labels, plotOptions, etc.). */
  apex?: ApexOptions;
  className?: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
}

export function ApexChart({
  type,
  series,
  height = 320,
  sparkline,
  accent,
  legend = 'bottom',
  stacked,
  tooltip = true,
  color,
  colors,
  apex,
  className,
  ariaLabel,
  style,
}: ApexChartProps) {
  const elRef = useRef<HTMLDivElement>(null);
  // Hold the live instance + the props needed to recompute colors on re-theme.
  const chartRef = useRef<{ destroy: () => void; updateOptions: (o: ApexOptions, r?: boolean, a?: boolean, u?: boolean) => void } | null>(null);
  const accentRef = useRef(accent);
  const colorRef = useRef(color);
  const colorsRef = useRef(colors);
  const sparklineRef = useRef(sparkline);
  useEffect(() => {
    accentRef.current = accent;
    colorRef.current = color;
    colorsRef.current = colors;
    sparklineRef.current = sparkline;
  }, [accent, color, colors, sparkline]);

  // Build/destroy the chart when structural inputs change.
  useEffect(() => {
    let cancelled = false;
    const el = elRef.current;
    if (!el) return;

    const opts: BaseOpts = { type, height, sparkline, accent, legend, stacked, tooltip };
    const fixed = resolveColor(color);
    const palette = colors?.map((c) => resolveColor(c) ?? c);

    import('apexcharts').then(({ default: ApexCharts }) => {
      if (cancelled || !elRef.current) return;
      const t = readTokens();
      const base = apexBase(t, opts);
      const merged = deepMerge<ApexOptions>(
        base as Record<string, unknown>,
        { series } as Record<string, unknown>,
        fixed ? ({ colors: [fixed] } as Record<string, unknown>) : undefined,
        palette ? ({ colors: palette } as Record<string, unknown>) : undefined,
        (apex as Record<string, unknown>) || undefined,
      );
      const instance = new ApexCharts(elRef.current, merged);
      instance.render();
      chartRef.current = instance as unknown as typeof chartRef.current;
    });

    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, height, sparkline, accent, legend, stacked, tooltip, color, JSON.stringify(colors), JSON.stringify(series), JSON.stringify(apex)]);

  // Live re-theme on ax:change (no rebuild).
  useEffect(() => {
    const onChange = () => {
      const inst = chartRef.current;
      if (!inst) return;
      const t = readTokens();
      const colors = colorsRef.current
        ? colorsRef.current.map((c) => resolveColor(c) ?? c)
        : colorRef.current
        ? [resolveColor(colorRef.current) as string]
        : accentRef.current
          ? [t.accent, ...t.series.slice(1)]
          : t.series;
      try {
        inst.updateOptions(
          {
            colors,
            theme: { mode: t.dark ? 'dark' : 'light' },
            chart: { foreColor: t.labelText, animations: { enabled: !t.reduceMotion } },
            grid: { borderColor: t.gridColor },
            tooltip: { theme: t.dark ? 'dark' : 'light' },
            // Dahoo : sur une sparkline, renvoyer les axes réaffichait leurs étiquettes (« 5 », « ) »).
            ...(sparklineRef.current
              ? {}
              : {
                  xaxis: { labels: { style: { colors: t.axisText } } },
                  yaxis: { labels: { style: { colors: t.axisText } } },
                }),
          } as ApexOptions,
          false,
          false,
          false,
        );
      } catch {
        /* chart destroyed */
      }
    };
    // `ax:change` (personnaliseur Vireo) et `dahoo:theme-change` (ThemeProvider de Dahoo, sur window).
    // Le thème est appliqué sur <html> juste avant l'événement : on relit les jetons au rendu suivant.
    const onDahoo = () => requestAnimationFrame(onChange);
    document.addEventListener('ax:change', onChange);
    window.addEventListener('dahoo:theme-change', onDahoo);
    return () => {
      document.removeEventListener('ax:change', onChange);
      window.removeEventListener('dahoo:theme-change', onDahoo);
    };
  }, []);

  return (
    <div
      ref={elRef}
      className={className}
      aria-label={ariaLabel}
      style={{ minHeight: height, ...style }}
    />
  );
}

export default ApexChart;
