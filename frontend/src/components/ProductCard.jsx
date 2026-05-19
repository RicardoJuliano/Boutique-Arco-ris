import { useState } from 'react';

export default function ProductCard({ product, reason, index }) {
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  return (
    <div className="border border-border bg-surface flex flex-col hover:border-gold/40 transition-colors overflow-hidden">
      {/* Imagem */}
      <div className="relative aspect-[3/4] bg-surface2 overflow-hidden">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
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
