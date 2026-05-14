export default function ProductCard({ product, reason, index }) {
  if (!product) return null;

  return (
    <div className="border border-border bg-surface rounded-sm p-6 flex flex-col gap-4 hover:border-gold/40 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <span className="font-display text-4xl font-light text-gold/30 leading-none">
          0{index + 1}
        </span>
        {product.tag && (
          <span className="text-xs font-body font-light tracking-widest uppercase border border-gold/40 text-gold px-2 py-0.5">
            {product.tag}
          </span>
        )}
      </div>

      <div>
        <h3 className="font-display text-xl font-light text-cream tracking-wide">{product.name}</h3>
        <p className="font-body text-lg font-light text-gold mt-1">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </p>
      </div>

      <p className="font-body text-sm font-light text-muted leading-relaxed">{product.desc}</p>

      <div className="border-t border-border" />

      <div>
        <p className="text-xs font-body font-light tracking-widest uppercase text-muted mb-2">
          Por que para você
        </p>
        <p className="font-body text-sm font-light text-cream/80 leading-relaxed">{reason}</p>
      </div>

      <div className="flex gap-2 flex-wrap mt-auto">
        {product.sizes.map((size) => (
          <span key={size} className="badge">{size}</span>
        ))}
      </div>
    </div>
  );
}
