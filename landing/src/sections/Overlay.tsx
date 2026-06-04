import type { CSSProperties } from 'react';
import { ArrowUp, Download, Play, Smartphone } from 'lucide-react';
import {
  apkUrl, authors, navItems, heroMetrics, clientFlow, rolePanels,
  archNodes, kpiCards, proofItems,
} from '../data/content';
import { HudPanel } from './HudPanel';
import { MetricCounter } from './MetricCounter';

export function Overlay() {
  return (
    <div className="overlay">
      <nav className="nav-shell" aria-label="Navegacion principal">
        <a className="brand-lockup" href="#hero"><img src="/atelier-icon.png" alt="" />ATELIER</a>
        <div className="nav-links">
          {navItems.map((n) => <a key={n.target} href={`#${n.target}`}>{n.label}</a>)}
        </div>
        <a className="btn btn-primary" href={apkUrl}><Download size={16} />APK</a>
      </nav>

      {/* 01 HERO */}
      <section className="scene-section" id="hero">
        <HudPanel className="hero-panel">
          <p className="eyebrow">OutfitCatalog / entrega final</p>
          <h1 className="hero-title">ATELIER</h1>
          <p className="hero-subtitle">
            App movil funcional para mostrar como un catalogo de moda pasa de
            exploracion visual a solicitudes, stock controlado, roles y metricas.
          </p>
          <div className="actions">
            <a className="btn btn-primary" href={apkUrl}><Smartphone size={18} />Probar APK</a>
            <a className="btn btn-secondary" href="#whatis"><Play size={18} />Ver experiencia</a>
          </div>
          <div className="metric-strip">
            {heroMetrics.map((m) => <MetricCounter key={m.label} value={m.value} label={m.label} />)}
          </div>
        </HudPanel>
      </section>

      {/* 02 WHAT IS */}
      <section className="scene-section align-right" id="whatis">
        <HudPanel>
          <p className="eyebrow">La app en vivo</p>
          <h2>Un catalogo de moda convertido en flujo comercial medible.</h2>
          <p>
            ATELIER resuelve el seguimiento manual de ventas por chat: centraliza
            prendas, clientes, vendedores, looks, solicitudes y estados de inventario.
          </p>
          <ul className="label" style={{ lineHeight: 2, listStyle: 'none', padding: 0, marginTop: 16 }}>
            <li>Problema: catalogos dispersos y seguimiento manual</li>
            <li>Solucion: app movil con roles, looks y solicitudes</li>
            <li>Stack: React Native, Expo, Firebase, SQLite y Cloudinary</li>
            <li>Entrega: APK con EAS Build y landing 3D para exposicion</li>
          </ul>
        </HudPanel>
      </section>

      {/* 03 CLIENT FLOW */}
      <section className="scene-section" id="flow">
        <div style={{ maxWidth: 760 }}>
          <p className="eyebrow">Flujo del cliente</p>
          <h2>De crear cuenta a generar una solicitud comercial.</h2>
          <div className="flow-grid" style={{ marginTop: 20 }}>
            {clientFlow.map((f) => (
              <div className="mini-card" key={f.step}>
                <f.icon className="ico" size={22} />
                <h3>{f.step} / {f.title}</h3>
                <p style={{ fontSize: 13 }}>{f.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 ROLES */}
      <section className="scene-section align-center" id="roles">
        <div style={{ maxWidth: 1000 }}>
          <p className="eyebrow">Tres perfiles, un catalogo</p>
          <h2>Cliente, vendedor y admin usan la misma app con permisos diferentes.</h2>
          <div className="role-grid" style={{ marginTop: 22, textAlign: 'left' }}>
            {rolePanels.map((r) => (
              <HudPanel key={r.role} accent={r.accent}>
                <div className="label" style={{ display: 'flex', alignItems: 'center', gap: 8, color: r.accent } as CSSProperties}>
                  <r.icon size={18} />{r.role}
                </div>
                <h3 style={{ marginTop: 8 }}>{r.title}</h3>
                <p style={{ fontSize: 13 }}>{r.copy}</p>
                <ul>{r.points.map((p) => <li key={p}>{p}</li>)}</ul>
                <div className="mini-stats">
                  {r.stats.map((s) => <span key={s.label}><strong>{s.value}</strong>{s.label}</span>)}
                </div>
              </HudPanel>
            ))}
          </div>
        </div>
      </section>

      {/* 05 ARCHITECTURE */}
      <section className="scene-section" id="arch">
        <div style={{ maxWidth: 820 }}>
          <p className="eyebrow">Arquitectura</p>
          <h2>Arquitectura movil con capas, persistencia local y backend serverless.</h2>
          <div className="flow-grid" style={{ marginTop: 20, gridTemplateColumns: 'repeat(3,1fr)' }}>
            {archNodes.map((n) => (
              <div className="mini-card" key={n.label}>
                <n.icon className="ico" size={20} />
                <h3 style={{ fontSize: 15 }}>{n.label}</h3>
                <p className="label">{n.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 KPIs */}
      <section className="scene-section align-right" id="kpis">
        <div style={{ maxWidth: 760 }}>
          <p className="eyebrow">KPIs integrados</p>
          <h2>La entrega permite explicar adopcion, retencion, conversion e inventario.</h2>
          <div className="kpi-grid" style={{ marginTop: 20 }}>
            {kpiCards.map((k) => (
              <div className="mini-card" key={k.label}>
                <p className="label">{k.label}</p>
                <h3 style={{ color: 'var(--gold)' }}>{k.value}</h3>
                <p style={{ fontSize: 13 }}>{k.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 07 QA */}
      <section className="scene-section" id="qa">
        <div style={{ maxWidth: 820 }}>
          <p className="eyebrow">Evidencia tecnica y QA</p>
          <h2>Evidencias para sustentar calidad, seguridad, rendimiento y despliegue.</h2>
          <div className="proof-grid" style={{ marginTop: 20 }}>
            {proofItems.map((p) => (
              <div className="mini-card" key={p.title}>
                <p.icon className="ico" size={22} />
                <h3>{p.title}</h3>
                <p style={{ fontSize: 13 }}>{p.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 08 DEMO + AUTHORS */}
      <section className="scene-section align-center" id="demo">
        <HudPanel>
          <p className="eyebrow"> </p>
          <h2>ATELIER queda listo para defender problema, desarrollo, datos, QA y APK.</h2>
          <div className="actions" style={{ justifyContent: 'center', marginTop: 18 }}>
            <a className="btn btn-primary" href={apkUrl}><Download size={18} />Descargar APK</a>
            <a className="btn btn-secondary" href="#hero"><ArrowUp size={18} />Volver arriba</a>
          </div>
          <div className="authors" style={{ justifyContent: 'center' }}>
            {authors.map((a) => <span className="author-chip" key={a}>{a}</span>)}
          </div>
          <p className="label" style={{ marginTop: 10 }}> </p>
        </HudPanel>
      </section>
    </div>
  );
}
