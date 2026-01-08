'use client';
import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { Filter, Loader2, Layers } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function SinglesContent() {
  const searchParams = useSearchParams();
  // Aún leemos 'q' por si alguien viene redirigido específicamente, 
  // pero ya no mostramos el input de texto en el sidebar.
  const queryFromUrl = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetchData();
  }, [sortOrder, queryFromUrl]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const params = new URLSearchParams({
            type: 'SINGLE',
            sort: sortOrder,
        });
        
        if (queryFromUrl) params.append('q', queryFromUrl);

        const res = await fetch(`http://localhost:4000/api/inventory?${params}`);
        const data = await res.json();
        setProducts(data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR LIMPIO (Solo Filtros de Atributos) */}
        <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 sticky top-24">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
                <Filter size={20} className="text-amber-500" />
                <h3 className="text-lg font-bold text-white">Filtros</h3>
              </div>
              
              {/* ORDENAR */}
              <div className="mb-6">
                 <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Ordenar Por</label>
                 <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg p-2 text-sm focus:border-amber-500 outline-none cursor-pointer"
                 >
                    <option value="newest">Más Nuevos</option>
                    <option value="price_asc">Precio: Menor a Mayor</option>
                    <option value="price_desc">Precio: Mayor a Menor</option>
                 </select>
              </div>
            </div>
        </aside>

        {/* GRILLA */}
        <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white" size={40} /></div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                    No hay cartas disponibles con estos criterios.
                </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((card) => (
                  <ProductCard 
                    key={card.id} 
                    card={{
                        id: card.id, name: card.card_name, set_name: card.set_code,
                        price: card.price, stock: card.stock, condition: card.condition,
                        language: card.language, is_foil: card.is_foil, image_url: card.image_url
                    }} 
                  />
                ))}
              </div>
            )}
        </div>
    </div>
  );
}

export default function SinglesPage() {
  return (
    <main className="min-h-screen bg-slate-950 pb-20">
      <Navbar />
      <div className="bg-slate-900 border-b border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Layers className="text-amber-500" /> Catálogo de Singles
            </h1>
            <p className="text-slate-400 mt-2">Explora nuestro stock de cartas individuales.</p>
        </div>
      </div>
      <Suspense fallback={<div className="text-white text-center p-10">Cargando...</div>}>
        <SinglesContent />
      </Suspense>
    </main>
  );
}