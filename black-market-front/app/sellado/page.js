'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Package, ShoppingBag, Loader2 } from 'lucide-react';

export default function SealedPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // PETICIÓN REAL A LA DB
    fetch('http://localhost:4000/api/inventory?type=SEALED')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 pb-20">
      <Navbar />
      
      <div className="bg-slate-900 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Package className="text-blue-500" /> Producto Sellado
            </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        {loading ? (
             <div className="flex justify-center"><Loader2 className="animate-spin text-white" /></div>
        ) : products.length === 0 ? (
            <div className="text-center text-slate-400">No hay productos sellados en stock. Ve al Admin para agregar uno.</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((item) => (
                <div key={item.id} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 group hover:border-blue-500 transition-all">
                <div className="h-64 overflow-hidden bg-white relative flex items-center justify-center p-4">
                    <img src={item.image_url} alt={item.card_name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                        {item.category || 'SEALED'}
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="text-white font-bold text-sm h-10 line-clamp-2 mb-2">{item.card_name}</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-400">${item.price.toLocaleString('es-CL')}</span>
                        <button className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 text-white transition-colors border border-slate-700">
                            <ShoppingBag size={18} />
                        </button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </main>
  );
}