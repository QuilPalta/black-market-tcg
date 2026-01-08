'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { ArrowRight, Star, Package, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext'; // Importamos el carrito para usar addToCart en la sección de sellado si quisieras

export default function Home() {
  const [featuredSingles, setFeaturedSingles] = useState([]);
  const [featuredSealed, setFeaturedSealed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Traemos datos reales de la API al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Singles (Últimos agregados)
        const singlesRes = await fetch('http://localhost:4000/api/inventory?type=SINGLE&sort=newest');
        const singlesData = await singlesRes.json();
        // Tomamos los 4 primeros
        setFeaturedSingles(singlesData.slice(0, 4));

        // 2. Fetch Sellado (Últimos agregados)
        const sealedRes = await fetch('http://localhost:4000/api/inventory?type=SEALED&sort=newest');
        const sealedData = await sealedRes.json();
        setFeaturedSealed(sealedData.slice(0, 4));
        
      } catch (error) {
        console.error("Error cargando home:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 pb-20 font-sans">
      <Navbar />
      <HeroBanner />

      {/* SECCIÓN 1: SINGLES DESTACADOS (Dinámico) */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Star className="text-amber-500 fill-amber-500"/> Singles Recientes
                    </h2>
                    <p className="text-slate-400">Lo último que ha llegado a la tienda</p>
                </div>
                <Link href="/singles" className="text-amber-500 hover:text-white font-bold flex items-center gap-1 transition-colors">
                    Ver todo el stock <ArrowRight size={16}/>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredSingles.length > 0 ? featuredSingles.map((card) => (
                       /* Usamos el componente ProductCard que ya tiene la lógica de carrito */
                       <ProductCard 
                         key={card.id} 
                         card={{
                            id: card.id, 
                            name: card.card_name, // Mapeamos card_name a name para el componente
                            card_name: card.card_name, // Enviamos ambos por seguridad
                            set_name: card.set_code,
                            set_code: card.set_code,
                            collector_number: card.collector_number,
                            rarity: card.rarity, // Si la DB lo tuviera
                            price: card.price, 
                            stock: card.stock, 
                            condition: card.condition,
                            language: card.language, 
                            is_foil: card.is_foil, 
                            image_url: card.image_url
                         }} 
                       />
                    )) : (
                        <div className="col-span-4 text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-500">
                            Aún no hay singles cargados en el inventario.
                        </div>
                    )}
                </div>
            )}
        </div>
      </section>

      {/* SECCIÓN 2: NOVEDADES SELLADAS (Dinámico) */}
      <section className="py-16 bg-slate-900/30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Package className="text-blue-500"/> Novedades Selladas
                    </h2>
                    <p className="text-slate-400">Cajas, mazos y accesorios</p>
                </div>
                <Link href="/sellado" className="text-blue-400 hover:text-white font-bold flex items-center gap-1 transition-colors">
                    Ver catálogo completo <ArrowRight size={16}/>
                </Link>
            </div>
            
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredSealed.length > 0 ? featuredSealed.map((item) => (
                        <Link href="/sellado" key={item.id} className="block group">
                            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20 h-full flex flex-col">
                                <div className="h-48 bg-slate-900 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                                    {item.image_url ? (
                                        <img 
                                            src={item.image_url} 
                                            alt={item.card_name} 
                                            className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    ) : (
                                        <Package className="text-slate-700" size={48} />
                                    )}
                                    {/* Badge Categoría */}
                                    {item.category && (
                                        <div className="absolute top-2 right-2 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                                            {item.category}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-auto">
                                    <h3 className="text-white font-bold text-sm line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                                        {item.card_name}
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xl font-bold font-mono text-white">
                                            ${Number(item.price).toLocaleString('es-CL')}
                                        </p>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            {item.set_code}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-4 text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-500">
                            No hay productos sellados destacados.
                        </div>
                    )}
                </div>
            )}
        </div>
      </section>

    </main>
  );
}