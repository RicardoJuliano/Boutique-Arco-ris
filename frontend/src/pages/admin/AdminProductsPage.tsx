import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminListProducts, adminDeleteProduct } from '../../services/api';
import Navbar from '../../components/Navbar';
import Spinner from '../../components/Spinner';
import { toErrorMessage, formatPrice } from '../../utils/format';
import type { Product } from '../../types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { products } = await adminListProducts();
      setProducts(products);
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Remover "${name}"?`)) return;
    try {
      await adminDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(toErrorMessage(e));
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="page-eyebrow">Painel Admin</p>
              <h1 className="page-title">Produtos</h1>
            </div>
            <Link to="/admin/produtos/novo" className="btn-gold btn-outline">
              + Novo Produto
            </Link>
          </div>

          {error && <p className="error-msg">{error}</p>}

          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : products.length === 0 ? (
            <p className="font-body text-muted text-center py-20">Nenhum produto cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full font-body font-light text-sm">
                <thead>
                  <tr className="border-b border-border text-muted text-xs tracking-widest uppercase">
                    <th className="text-left py-3 pr-4">Foto</th>
                    <th className="text-left py-3 pr-4">Nome</th>
                    <th className="text-left py-3 pr-4">Categoria</th>
                    <th className="text-left py-3 pr-4">Preço</th>
                    <th className="text-left py-3 pr-4">Estoque</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-left py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-surface transition-colors">
                      <td className="py-3 pr-4">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-surface2 flex items-center justify-center text-muted text-xs">
                            sem foto
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-cream">{p.name}</td>
                      <td className="py-3 pr-4 text-muted">{p.category}</td>
                      <td className="py-3 pr-4 text-cream">
                        {formatPrice(p.price)}
                      </td>
                      <td className="py-3 pr-4 text-cream">{p.stock}</td>
                      <td className="py-3 pr-4">
                        <span className={`badge ${p.active ? 'border-green-400/40 text-green-400' : 'text-muted'}`}>
                          {p.active ? 'ativo' : 'inativo'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-3">
                          <Link
                            to={`/admin/produtos/${p.id}`}
                            className="text-gold hover:underline text-xs tracking-widest uppercase"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="text-red-400/70 hover:text-red-400 text-xs tracking-widest uppercase transition-colors"
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
