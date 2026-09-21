import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'MÍGALIA • Boutique Bakery';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8F6F0',
          position: 'relative',
        }}
      >
        {/* Glow de fondo cálido */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            backgroundColor: '#EFE4CF',
            opacity: 0.6,
            filter: 'blur(80px)',
          }}
        />

        {/* Tarjeta del Isotipo M de Migalia */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '160px',
            height: '160px',
            borderRadius: '40px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 25px 50px -12px rgba(140, 98, 57, 0.15)',
            border: '1px solid #E6DFD5',
            marginBottom: '40px',
            position: 'relative',
          }}
        >
          <svg
            width="96"
            height="96"
            viewBox="0 0 100 100"
            fill="none"
          >
            {/* Punto ocre característico */}
            <circle cx="78" cy="25" r="11" fill="#C59B27" />
            {/* Trazos estilizados de la M */}
            <path
              d="M24 82V32"
              stroke="#221F1D"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M24 32L51 76L70 32"
              stroke="#221F1D"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M70 32V74C70 78 73 82 78 82"
              stroke="#221F1D"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Logotipo MÍGALIA Tipográfico */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            letterSpacing: '0.28em',
            color: '#221F1D',
            fontSize: '68px',
            fontWeight: 700,
            marginBottom: '16px',
          }}
        >
          <span>M</span>
          <span style={{ position: 'relative' }}>
            I
            <span
              style={{
                position: 'absolute',
                top: '-8px',
                left: '50%',
                transform: 'translateX(-50%) rotate(12deg)',
                width: '12px',
                height: '8px',
                backgroundColor: '#C59B27',
                borderRadius: '2px',
              }}
            />
          </span>
          <span>GALIA</span>
        </div>

        {/* Descriptor de Marca */}
        <div
          style={{
            display: 'flex',
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#8C6239',
            marginBottom: '8px',
          }}
        >
          Boutique Bakery
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontSize: '18px',
            fontWeight: 400,
            color: '#6E665D',
            letterSpacing: '0.05em',
          }}
        >
          El arte de lo sutil • Alta Repostería & Panadería
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
