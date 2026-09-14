import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrIcon, UtensilsIcon } from './Icons';

export default function HeroSection({ session }) {
  const navigate = useNavigate();

  return (
    <section className="dv-hero" style={{ padding: '60px 0 40px' }}>
      <div className="container-dv" style={{ maxWidth: '1140px' }}>
        <div
          className="card-dv"
          style={{
            background: 'linear-gradient(145deg, #16141D 0%, #221E2C 100%)',
            color: '#FAF6F0',
            borderRadius: '28px',
            padding: '56px 36px',
            textAlign: 'center',
            boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
            border: '1px solid rgba(255,215,0,0.22)',
            backgroundImage:
              'radial-gradient(circle at 50% 25%, rgba(247,127,0,0.18), transparent 75%), url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Atmospheric Luxury Dark Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(16,14,21,0.86) 0%, rgba(20,17,28,0.94) 100%)',
              backdropFilter: 'blur(4px)',
              zIndex: 1
            }}
          />

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Crown / Eyebrow */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 18px',
                borderRadius: '999px',
                background: 'rgba(255,215,0,0.1)',
                border: '1px solid rgba(255,215,0,0.3)',
                color: 'var(--gold-soft)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: 20
              }}
            >
              ★ Fine Dining & Tableside Gastronomy ★
            </div>

            {/* Brand Title */}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                fontWeight: 800,
                color: '#FAF6F0',
                lineHeight: 1.15,
                maxWidth: '850px',
                margin: '0 auto 16px',
                letterSpacing: '-0.01em'
              }}
            >
              Exquisite Flavors, Handcrafted for Every Moment
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.18rem)',
                color: 'rgba(250,246,240,0.85)',
                maxWidth: '640px',
                margin: '0 auto 32px',
                lineHeight: 1.65,
                fontWeight: 400
              }}
            >
              Explore 100 chef-curated culinary creations, artisanal fire grills, and royal heritage spices. Order directly from your seat with seamless tableside hospitality.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
              <Link
                to="/menu"
                className="btn-dv btn-gold"
                style={{
                  padding: '16px 36px',
                  fontSize: '1.02rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 12px 30px rgba(247,127,0,0.35)'
                }}
              >
                <UtensilsIcon width={18} height={18} />
                Explore Grand Menu
              </Link>

              <Link
                to="/table"
                className="btn-dv btn-outline"
                style={{
                  padding: '16px 32px',
                  fontSize: '1.02rem',
                  fontWeight: 700,
                  color: '#FAF6F0',
                  borderColor: 'rgba(255,255,255,0.35)',
                  background: 'rgba(255,255,255,0.06)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backdropFilter: 'blur(8px)'
                }}
              >
                <QrIcon width={18} height={18} />
                {session ? `Table ${session.tableNumber} Session` : 'Order at Table'}
              </Link>
            </div>

            {/* Hospitality Badges */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 24,
                flexWrap: 'wrap',
                paddingTop: 24,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                fontSize: '0.85rem',
                color: 'rgba(250,246,240,0.85)',
                fontWeight: 600
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--gold)' }}>✦</span> 100 Signature Dishes
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--gold)' }}>✦</span> 12 World Cuisines
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--gold)' }}>✦</span> Contactless Tableside Service
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--gold)' }}>✦</span> Live Kitchen Dispatch
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
