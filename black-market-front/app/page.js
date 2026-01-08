'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { ArrowRight, Star, Package } from 'lucide-react';

export default function Home() {
  const [featuredSingles, setFeaturedSingles] = useState([]);

  // Solo traemos singles para mostrar "Destacados" (limitado a 4)
  useEffect(() => {
    fetch('http://localhost:4000/api/inventory')
      .then(res => res.json())
      .then(data => {
        // Simulamos "Populares": tomamos los primeros 4 o los más caros
        const topCards = data.slice(0, 4); 
        setFeaturedSingles(topCards);
      })
      .catch(console.error);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 pb-20">
      <Navbar />
      <HeroBanner />

      {/* SECCIÓN 1: VISTA PREVIA SINGLES */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Star className="text-amber-500 fill-amber-500"/> Singles Destacados
                    </h2>
                    <p className="text-slate-400">Las cartas más buscadas de la semana</p>
                </div>
                <Link href="/singles" className="text-amber-500 hover:text-white font-bold flex items-center gap-1 transition-colors">
                    Explorar 60.000+ cartas <ArrowRight size={16}/>
                </Link>
            </div>

            {/* Grid Dinámica desde DB (Limitada) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredSingles.length > 0 ? featuredSingles.map((card) => (
                   <ProductCard 
                     key={card.id} 
                     card={{
                        id: card.id, name: card.card_name, set_name: card.set_code,
                        price: card.price, stock: card.stock, condition: card.condition,
                        language: card.language, is_foil: card.is_foil, image_url: card.image_url
                     }} 
                   />
                )) : (
                    <p className="text-slate-500">Cargando destacados...</p>
                )}
            </div>
        </div>
      </section>

      {/* SECCIÓN 2: VISTA PREVIA SELLADO */}
      <section className="py-16 bg-slate-900/30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Package className="text-blue-500"/> Novedades Selladas
                    </h2>
                </div>
                <Link href="/sellado" className="text-blue-400 hover:text-white font-bold flex items-center gap-1 transition-colors">
                    Ver todo el catálogo <ArrowRight size={16}/>
                </Link>
            </div>
            
            {/* Mini Grid Sellado (Estático para demo) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Solo mostramos 4 items aquí manualmente como ejemplo de vitrina */}
                {[
                    {name: "Play Booster Box: MH3", price: 240000, img: "https://m.media-amazon.com/images/I/81xD62kG+GL._AC_SL1500_.jpg"},
                    {name: "Commander Deck: Eldrazi", price: 85000, img: "https://m.media-amazon.com/images/I/81F-W+g+JGL._AC_SL1500_.jpg"},
                    {name: "Bundle: Duskmourn", price: 45000, img: "https://m.media-amazon.com/images/I/81r1K-b8t5L._AC_SL1500_.jpg"},
                    {name: "Collector Booster: LOTR", price: 45000, img: "https://m.media-amazon.com/images/I/81pC1I2tBcL._AC_SL1500_.jpg"}
                ].map((item, i) => (
                    <div key={i} className="bg-slate-950 rounded-lg p-4 border border-slate-800 hover:border-blue-500 transition-all cursor-pointer">
                        <div className="h-40 bg-white rounded mb-3 flex items-center justify-center overflow-hidden">
                            <img src={item.img} className="h-full object-contain" />
                        </div>
                        <h3 className="text-white font-bold text-sm truncate">{item.name}</h3>
                        <p className="text-blue-400 font-bold">${item.price.toLocaleString('es-CL')}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

    </main>
  );
}