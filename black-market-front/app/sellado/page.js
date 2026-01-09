'use client';
import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { Filter, Loader2, Package } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function SealedContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de filtros locales
  const [sortOrder, setSortOrder] = useState('newest');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Categorías comunes para el filtro
  const categories = [
      'Booster Box', 
      'Booster Pack', 
      'Commander Deck', 
      'Bundle', 
      'Prerelease Kit', 
      'Collector Booster', 
      'Starter Kit', 
      'Gift Edition', 
      'Accessory'
  ];

  useEffect(() => {
    fetchData();
  }, [sortOrder, categoryFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const params = new URLSearchParams({
            type: 'SEALED', // Forzamos tipo sellado
            sort: sortOrder,
        });
        
        if (categoryFilter) params.append('category', categoryFilter);

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
        
        {/* SIDEBAR FILTROS */}
        <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 sticky top-24">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
                <Filter size={20} className="text-blue-500" />
                <h3 className="text-lg font-bold text-white">Filtros Sellado</h3>
              </div>
              
              {/* FILTRO CATEGORÍA */}
              <div className="mb-6">
                 <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Categoría</label>
                 <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg p-2 text-sm focus:border-blue-500 outline-none cursor-pointer"
                 >
                    <option value="">Todas</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                 </select>
              </div>

              {/* ORDENAR */}
              <div className="mb-6">
                 <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Ordenar Por</label>
                 <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg p-2 text-sm focus:border-blue-500 outline-none cursor-pointer"
                 >
                    <option value="newest">Más Nuevos</option>
                    <option value="price_asc">Precio: Menor a Mayor</option>
                    <option value="price_desc">Precio: Mayor a Menor</option>
                 </select>
              </div>
            </div>
        </aside>

        {/* GRILLA PRODUCTOS */}
        <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                    No hay productos sellados con estos criterios.
                </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((item) => (
                  <ProductCard 
                    key={item.id} 
                    card={{
                        id: item.id, 
                        name: item.card_name, 
                        card_name: item.card_name,
                        set_name: item.set_code, 
                        set_code: item.set_code,
                        price: item.price, 
                        stock: item.stock, 
                        condition: 'NM', // Sellado siempre suele ser NM
                        language: item.language, 
                        is_foil: item.is_foil, 
                        image_url: item.image_url,
                        type: 'SEALED'
                    }} 
                  />
                ))}
              </div>
            )}
        </div>
    </div>
  );
}

export default function SelladoPage() {
  return (
    <main className="min-h-screen bg-slate-950 pb-20">
      <Navbar />
      <div className="bg-slate-900 border-b border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Package className="text-blue-500" /> Catálogo de Sellado
            </h1>
            <p className="text-slate-400 mt-2">Cajas, mazos Commander, Bundles y más.</p>
        </div>
      </div>
      <Suspense fallback={<div className="text-white text-center p-10">Cargando...</div>}>
        <SealedContent />
      </Suspense>
    </main>
  );
}