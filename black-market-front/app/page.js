'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { ArrowRight, Star, Package, Loader2 } from 'lucide-react';
import { API_URL } from '@/utils/api';

export default function Home() {
  const [featuredSingles, setFeaturedSingles] = useState([]);
  const [featuredSealed, setFeaturedSealed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Singles
        const singlesRes = await fetch(`${API_URL}/api/inventory?type=SINGLE&sort=newest`);
        const singlesData = await singlesRes.json();
        setFeaturedSingles(singlesData.slice(0, 4));

        // 2. Fetch Sellado
        const sealedRes = await fetch(`${API_URL}/api/inventory?type=SEALED&sort=newest`);
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

  // Helper para mapear datos de la DB a lo que espera ProductCard
  const mapToCardProps = (item) => ({
      id: item.id,
      name: item.card_name, // ProductCard usa 'name' o 'card_name'
      card_name: item.card_name,
      set_name: item.set_code,
      set_code: item.set_code,
      collector_number: item.collector_number,
      rarity: item.rarity,
      price: item.price,
      stock: item.stock,
      condition: item.condition,
      language: item.language,
      is_foil: item.is_foil,
      image_url: item.image_url,
      type: item.type // Pasamos el tipo por si acaso
  });

  return (
    <main className="min-h-screen bg-slate-950 pb-20 font-sans">
      <Navbar />
      <HeroBanner />

      {/* SECCIÓN 1: SINGLES DESTACADOS */}
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
                       <ProductCard key={card.id} card={mapToCardProps(card)} />
                    )) : (
                        <div className="col-span-4 text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-500">
                            Aún no hay singles cargados.
                        </div>
                    )}
                </div>
            )}
        </div>
      </section>

      {/* SECCIÓN 2: NOVEDADES SELLADAS (AHORA ESTANDARIZADO) */}
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
                        // AQUI ESTÁ EL CAMBIO: Usamos ProductCard en lugar del Link custom
                        <ProductCard key={item.id} card={mapToCardProps(item)} />
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