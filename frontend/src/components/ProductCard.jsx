import { useState } from 'react';

export default function ProductCard({ product, reason, index }) {
  const [imgError, setImgError]   = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!product) return null;

  return (
    <div className="group border border-border bg-surface flex flex-col hover:border-gold/40 transition-colors duration-300 overflow-hidden">
      {/* Imagem */}
      <div className="relative aspect-[3/4] bg-surface2 overflow-hidden">
        {product.image_url && !imgError ? (
          <>
            {!imgLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 img-reveal ${imgLoaded ? 'loaded' : ''}`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-5xl font-light text-gold/20">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        {product.tag && (
          <span className="absolute top-3 right-3 text-xs font-body font-light tracking-widest uppercase bg-bg border border-gold/40 text-gold px-2 py-0.5">
            {product.tag}
          </span>
        )}
        {/* Overlay deslizante (H&M) — só aparece quando não há reason (resultados do quiz mostram reason no card) */}
        {!reason && (
          <div className="card-overlay absolute inset-x-0 bottom-0 bg-cream/92 backdrop-blur-sm px-4 py-3">
            <p className="font-body text-xs font-light text-surface leading-relaxed line-clamp-2">
              {product.desc}
            </p>
            {product.sizes?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-2">
                {product.sizes.slice(0, 4).map((s) => (
                  <span key={s} className="text-[10px] font-body font-light text-surface/70 border border-surface/30 px-1.5 py-0.5">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-light text-cream tracking-wide leading-snug">{product.name}</h3>
            <p className="font-body text-base font-light text-gold mt-0.5">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <span className="font-display text-3xl font-light text-gold/20 leading-none shrink-0">
            0{index + 1}
          </span>
        </div>

        <p className="font-body text-sm font-light text-muted leading-relaxed">{product.desc}</p>

        {reason && (
          <>
            <div className="border-t border-border" />
            <div>
              <p className="text-xs font-body font-light tracking-widest uppercase text-muted mb-1.5">
                Por que para você
              </p>
              <p className="font-body text-sm font-light text-cream/80 leading-relaxed">{reason}</p>
            </div>
          </>
        )}

        <div className="flex gap-2 flex-wrap mt-auto pt-1">
          {product.sizes?.map((size) => (
            <span key={size} className="badge">{size}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
