"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CSSProperties } from "react";

export type AdminActivityPoint = {
  label: string;
  users: number;
  clubs: number;
  events: number;
};

export type AdminDistributionPoint = {
  label: string;
  value: number;
};

type AdminChartsProps = {
  activity: readonly AdminActivityPoint[];
  distribution: readonly AdminDistributionPoint[];
};

const tooltipStyle: CSSProperties = {
  background: "rgba(14, 15, 16, 0.92)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: 14,
  boxShadow: "0 18px 50px rgba(0, 0, 0, 0.28)",
  color: "#f7f8f3",
  fontSize: 12,
};

const cursorStyle = { stroke: "rgba(200, 255, 77, 0.34)", strokeWidth: 1 };
const barCursorStyle = { fill: "rgba(255, 255, 255, 0.025)" };
const distributionColors = ["#c8ff4d", "#77b8ff", "#b9a7ff", "#ff9e7a"];

export function AdminCharts({ activity, distribution }: AdminChartsProps) {
  const reducedMotion = useReducedMotion();
  const animationDuration = reducedMotion ? 0 : 1050;

  return (
    <section className="admin-charts-grid" aria-label="Platformanın analitik qrafikləri">
      <motion.figure
        className="admin-chart-card admin-chart-card--activity"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.24 }}
        transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="admin-chart-card__header">
          <div>
            <span>Son 6 ay</span>
            <h2>Platforma aktivliyi</h2>
          </div>
          <div className="admin-chart-legend" aria-hidden="true">
            <span className="is-users">İstifadəçilər</span>
            <span className="is-clubs">Klublar</span>
            <span className="is-events">Tədbirlər</span>
          </div>
        </header>

        <div
          className="admin-chart-card__canvas"
          role="img"
          aria-label="Son altı ay üzrə istifadəçi, klub və tədbir aktivliyi"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[...activity]} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="admin-users-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c8ff4d" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#c8ff4d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="4 7" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(245,247,240,0.48)", fontSize: 11 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(245,247,240,0.4)", fontSize: 10 }}
                width={44}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={cursorStyle} />
              <Area
                type="monotone"
                dataKey="users"
                name="İstifadəçilər"
                stroke="#c8ff4d"
                strokeWidth={2.4}
                fill="url(#admin-users-fill)"
                isAnimationActive={!reducedMotion}
                animationDuration={animationDuration}
                animationEasing="ease-out"
              />
              <Area
                type="monotone"
                dataKey="clubs"
                name="Klublar"
                stroke="#77b8ff"
                strokeWidth={1.8}
                fill="transparent"
                isAnimationActive={!reducedMotion}
                animationBegin={reducedMotion ? 0 : 130}
                animationDuration={animationDuration}
                animationEasing="ease-out"
              />
              <Area
                type="monotone"
                dataKey="events"
                name="Tədbirlər"
                stroke="#b9a7ff"
                strokeWidth={1.8}
                fill="transparent"
                isAnimationActive={!reducedMotion}
                animationBegin={reducedMotion ? 0 : 240}
                animationDuration={animationDuration}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <figcaption className="sr-only">
          İstifadəçi, klub və tədbir aktivliyinin aylıq müqayisəsi.
        </figcaption>
      </motion.figure>

      <motion.figure
        className="admin-chart-card admin-chart-card--distribution"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.24 }}
        transition={{
          duration: reducedMotion ? 0 : 0.55,
          delay: reducedMotion ? 0 : 0.08,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <header className="admin-chart-card__header">
          <div>
            <span>Canlı mənzərə</span>
            <h2>Kontent bölgüsü</h2>
          </div>
          <span className="admin-chart-card__status">Yenilənib</span>
        </header>

        <div
          className="admin-chart-card__canvas"
          role="img"
          aria-label="Platformadakı kontentin kateqoriyalar üzrə bölgüsü"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...distribution]} margin={{ top: 14, right: 2, left: -30, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="4 7" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(245,247,240,0.48)", fontSize: 10 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(245,247,240,0.4)", fontSize: 10 }}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={barCursorStyle} />
              <Bar
                dataKey="value"
                name="Say"
                radius={[8, 8, 2, 2]}
                maxBarSize={42}
                isAnimationActive={!reducedMotion}
                animationDuration={animationDuration}
                animationEasing="ease-out"
              >
                {distribution.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={distributionColors[index % distributionColors.length]}
                    fillOpacity={0.88}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <figcaption className="sr-only">
          Aktiv kontent kateqoriyalarının say üzrə müqayisəsi.
        </figcaption>
      </motion.figure>
    </section>
  );
}
