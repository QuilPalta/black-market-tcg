'use client';
import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard'; // Usamos el mismo componente de carta
import { Package, Layers, Search as SearchIcon, Loader2, ArrowRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/utils/api';

function GlobalSearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const router = useRouter();

  const [results, setResults] = useState({ singles: [], sealed: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
        setLoading(false);
        return;
    }

    const fetchGlobalSearch = async () => {
        setLoading(true);
        try {
            // Pedimos TODO al backend (sin filtro &type=...)
            const res = await fetch(`${API_URL}/api/inventory?q=${encodeURIComponent(query)}`);
            const data = await res.json();

            // Separamos los resultados en el frontend
            const singles = data.filter(item => item.type === 'SINGLE');
            const sealed = data.filter(item => item.type === 'SEALED');

            setResults({ singles, sealed });
        } catch (error) {
            console.error("Error en búsqueda global:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchGlobalSearch();
  }, [query]);

  if (!query) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
            <SearchIcon size={64} className="mb-4 opacity-20" />
            <p className="text-xl">Escribe algo en la barra superior para comenzar.</p>
        </div>
     );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Resultados para: <span className="text-amber-500">"{query}"</span></h1>
        <p className="text-slate-400 mb-12">Encontramos {results.sealed.length + results.singles.length} coincidencias en el mercado.</p>

        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={48} /></div>
        ) : (
            <>
                {/* 1. SECCIÓN SELLADO (Prioridad Visual) */}
                {results.sealed.length > 0 && (
                    <section className="mb-16">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-2">
                            <Package className="text-blue-500" />
                            <h2 className="text-2xl font-bold text-white">Producto Sellado</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {results.sealed.map((item) => (
                                <div key={item.id} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 group hover:border-blue-500 transition-all">
                                    <div className="h-64 overflow-hidden bg-white relative flex items-center justify-center p-4">
                                        <img src={item.image_url} alt={item.card_name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                                            {item.category || 'SEALED'}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-white font-bold text-sm h-10 line-clamp-2 mb-2">{item.card_name}</h3>
                                        <p className="text-lg font-bold text-blue-400">${item.price.toLocaleString('es-CL')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 2. SECCIÓN SINGLES */}
                {results.singles.length > 0 && (
                    <section>
                         <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                                <Layers className="text-amber-500" />
                                <h2 className="text-2xl font-bold text-white">Singles / Cartas Sueltas</h2>
                            </div>
                            {results.singles.length > 8 && (
                                <Link href={`/singles?q=${query}`} className="text-sm text-amber-500 flex items-center gap-1 hover:underline">
                                    Ver todos en el catálogo <ArrowRight size={14}/>
                                </Link>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {results.singles.map((card) => (
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
                    </section>
                )}

                {/* SIN RESULTADOS */}
                {results.sealed.length === 0 && results.singles.length === 0 && (
                    <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-12 text-center">
                        <p className="text-slate-400 text-lg">No encontramos nada con ese nombre.</p>
                        <button onClick={() => router.push('/singles')} className="mt-4 text-amber-500 font-bold hover:underline">
                            Explorar el catálogo completo
                        </button>
                    </div>
                )}
            </>
        )}
    </div>
  );
}

export default function SearchPage() {
    return (
        <main className="min-h-screen bg-slate-950 pb-20">
            <Navbar />
            <Suspense fallback={<div className="text-white text-center py-20">Cargando buscador...</div>}>
                <GlobalSearchContent />
            </Suspense>
        </main>
    )
}