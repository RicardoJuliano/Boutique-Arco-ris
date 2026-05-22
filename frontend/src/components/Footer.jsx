import { Link } from 'react-router-dom';

const WHATSAPP_URL = 'https://wa.me/5538999223190?text=Ol%C3%A1%21+Vim+pelo+site+da+Boutique+Arco-%C3%8Dris+%F0%9F%8C%88';
const INSTAGRAM_URL = 'https://instagram.com/boutiquearcoiris_';

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function IconPix() {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" className="w-5 h-5">
      <path d="M242.4 292.5C247.8 287.1 255.1 284.3 262.5 284.3C269.9 284.3 277.2 287.1 282.6 292.5L365.1 375C369.8 379.7 375.1 383.5 381.1 385.5L268.4 498.2C264.3 502.3 259.3 504.3 254.3 504.3C249.3 504.3 244.3 502.3 240.2 498.2L127.5 385.5C133.5 383.5 138.8 379.7 143.5 375L242.4 292.5zM282.6 219.5C277.2 224.9 269.9 227.7 262.5 227.7C255.1 227.7 247.8 224.9 242.4 219.5L143.5 137C138.8 132.3 133.5 128.5 127.5 126.5L240.2 13.8C244.3 9.7 249.3 7.7 254.3 7.7C259.3 7.7 264.3 9.7 268.4 13.8L381.1 126.5C375.1 128.5 369.8 132.3 365.1 137L282.6 219.5zM420.1 376.1L317.1 273.1C312.5 268.5 312.5 260.9 317.1 256.3L420.1 153.3C425.3 148.1 432.3 145.3 439.5 145.3C446.9 145.3 454.2 148.1 459.6 153.3L498.2 191.9C502.3 196 504.3 201 504.3 206C504.3 211 502.3 216 498.2 220.1L415.1 303.1C410.5 308.5 410.5 316.1 415.1 320.7L498.2 403.7C502.3 407.8 504.3 412.8 504.3 417.8C504.3 422.8 502.3 427.8 498.2 431.9L459.6 470.5C454.2 475.7 446.9 478.5 439.5 478.5C432.3 478.5 425.3 475.7 420.1 470.5L420.1 376.1zM104.7 376.1C99.5 381.3 92.5 384.1 85.1 384.1C77.9 384.1 70.6 381.3 65.2 376.1L26.6 337.5C22.5 333.4 20.5 328.4 20.5 323.4C20.5 318.4 22.5 313.4 26.6 309.3L109.7 226.3C114.3 221.7 114.3 214.1 109.7 209.5L26.6 126.5C22.5 122.4 20.5 117.4 20.5 112.4C20.5 107.4 22.5 102.4 26.6 98.3L65.2 59.7C70.6 54.5 77.9 51.7 85.1 51.7C92.5 51.7 99.5 54.5 104.7 59.7L207.7 162.7C212.3 167.3 212.3 174.9 207.7 179.5L104.7 282.5C99.5 287.7 99.5 370.9 104.7 376.1z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          <div className="flex flex-col items-center gap-3">
            <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-sm">
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(138deg, #EDE3D9 50%, #D4C4B5 50%)'
              }} />
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <span className="font-script text-[1.9rem] leading-[1.1] select-none"
                  style={{ color: '#3D2B1F' }}>
                  Arco-Íris
                </span>
                <span className="font-cormorant text-[0.44rem] font-light tracking-[0.5em] uppercase select-none mt-0.5"
                  style={{ color: '#6B4C38' }}>
                  Boutique
                </span>
              </div>
            </div>
            <p className="font-cormorant text-xs font-light text-muted/70 tracking-[0.2em] uppercase">
              Buenópolis, MG
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="font-body text-[10px] font-light tracking-widest uppercase text-muted">
              Contato
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body text-sm font-light text-muted hover:text-gold transition-colors duration-200"
            >
              <IconWhatsApp />
              <span>Viviane — (38) 99922-3190</span>
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body text-sm font-light text-muted hover:text-gold transition-colors duration-200"
            >
              <IconInstagram />
              <span>@boutiquearcoiris_</span>
            </a>
            <div className="flex items-center gap-2 font-body text-sm font-light text-muted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
              </svg>
              <span>Av. JK, 502 — Buenópolis, MG · CEP 39230-000</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="font-body text-[10px] font-light tracking-widest uppercase text-muted">
              Pagamento
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-muted">
                <IconPix />
                <span className="font-body text-xs font-light">Pix</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
                <span className="font-body text-xs font-light">Cartão</span>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="font-body text-xs font-light text-muted/60 tracking-wide">
            © {new Date().getFullYear()} Boutique Arco-Íris. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
