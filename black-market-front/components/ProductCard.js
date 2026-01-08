import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({ card }) {
  // Función para determinar el color del borde según rareza (opcional, visual)
  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'mythic': return 'border-orange-500/50';
      case 'rare': return 'border-yellow-500/50';
      case 'uncommon': return 'border-blue-500/50';
      default: return 'border-slate-700';
    }
  };

  return (
    <div className={`group relative bg-slate-900 rounded-xl overflow-hidden border ${getRarityColor(card.rarity)} hover:border-amber-500 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/20 hover:-translate-y-1`}>
      
      {/* Contenedor de Imagen */}
      <div className="relative aspect-[2.5/3.5] w-full overflow-hidden bg-slate-800">
        <Image 
            src={card.image_url || '/placeholder-card.png'} 
            alt={card.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Etiqueta de Stock */}
        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded border border-slate-600">
            Stock: {card.stock}
        </div>
      </div>

      {/* Información de la carta */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="text-white font-bold truncate pr-2" title={card.name}>{card.name}</h3>
                <p className="text-slate-400 text-xs uppercase tracking-wider">{card.set_name}</p>
            </div>
        </div>

        <div className="flex items-center gap-2 mb-4 text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{card.condition}</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{card.language}</span>
            {card.is_foil && <span className="px-2 py-0.5 rounded bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold text-[10px]">FOIL</span>}
        </div>

        <div className="flex items-center justify-between mt-4">
            <span className="text-xl font-bold text-amber-500">
                ${card.price.toLocaleString('es-CL')}
            </span>
            <button className="p-2 rounded-full bg-slate-800 hover:bg-amber-600 text-white transition-colors group-active:scale-95">
                <ShoppingBag size={18} />
            </button>
        </div>
      </div>
    </div>
  );
}