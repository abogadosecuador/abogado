import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <section style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' }}>
    <h2 style={{ margin: 0, marginBottom: 8, fontSize: 22 }}>{title}</h2>
    <div style={{ color: '#4b5563', lineHeight: 1.6 }}>{children}</div>
  </section>
);

export default function ConsultasPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
      <header style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Consultas Legales</h1>
        <p style={{ color: '#6b7280' }}>Resolvemos tus dudas en derecho penal, civil, tránsito, comercial y aduanas.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <Section title="Consulta Express (24h)">
          <p>Recibe una orientación legal clara y puntual en menos de 24 horas. Ideal para dudas concretas.</p>
          <ul>
            <li>Respuesta por correo o WhatsApp</li>
            <li>Análisis legal preliminar de tu caso</li>
            <li>Costo accesible y pago por PayPal</li>
          </ul>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <a href="/pay/test" className="btn" style={btn}>Pagar y solicitar</a>
            <Link to="/checkout" className="btn" style={btnSecondary}>Agregar al carrito</Link>
          </div>
        </Section>

        <Section title="Consulta Integral (Videollamada)">
          <p>Asesoría personalizada por videollamada con revisión de documentos y plan de acción.</p>
          <ul>
            <li>Duración 45-60 minutos</li>
            <li>Revisión previa de documentos</li>
            <li>Recomendaciones y pasos a seguir</li>
          </ul>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <a href="/pay/test" className="btn" style={btn}>Reservar ahora</a>
            <Link to="/tienda" className="btn" style={btnSecondary}>Ver más servicios</Link>
          </div>
        </Section>

        <Section title="Generación Inteligente de Documentos (IA)">
          <p>Redacción asistida por IA con revisión profesional para escritos básicos y cartas formales.</p>
          <ul>
            <li>Borradores iniciales con IA</li>
            <li>Revisión y ajuste humano</li>
            <li>Entrega en formatos editables</li>
          </ul>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <Link to="/checkout" className="btn" style={btn}>Solicitar documento</Link>
            <Link to="/sobre-nosotros" className="btn" style={btnSecondary}>Conoce nuestro enfoque</Link>
          </div>
        </Section>
      </div>

      <aside style={{ marginTop: 24, padding: 16, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <p style={{ margin: 0, color: '#374151' }}>
          ¿Prefieres pago directo? Puedes usar nuestro enlace oficial: {' '}
          <a href="https://paypal.me/asumerced" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>paypal.me/asumerced</a>
        </p>
      </aside>
    </div>
  );
}

const btn = {
  background: '#111827',
  color: '#fff',
  padding: '10px 14px',
  borderRadius: 10,
  textDecoration: 'none'
};

const btnSecondary = {
  background: '#e5e7eb',
  color: '#111827',
  padding: '10px 14px',
  borderRadius: 10,
  textDecoration: 'none'
};
