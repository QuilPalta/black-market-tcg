import { ShoppingBag } from 'lucide-react';

const MOCK_SEALED = [
    { id: 101, name: "Play Booster Box: Modern Horizons 3", price: 240000, image: "https://m.media-amazon.com/images/I/81xD62kG+GL._AC_SL1500_.jpg", type: "Box" },
    { id: 102, name: "Commander Deck: Eldrazi Incursion", price: 85000, image: "https://m.media-amazon.com/images/I/81F-W+g+JGL._AC_SL1500_.jpg", type: "Deck" },
    { id: 103, name: "Bundle: Duskmourn", price: 45000, image: "https://m.media-amazon.com/images/I/81r1K-b8t5L._AC_SL1500_.jpg", type: "Bundle" },
    { id: 104, name: "Collector Booster: LOTR", price: 45000, image: "https://m.media-amazon.com/images/I/81pC1I2tBcL._AC_SL1500_.jpg", type: "Booster" },
];

export default function SealedGrid() {
  return (
    <section className="py-12 bg-slate-900/50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Producto Sellado</h2>
                <p className="text-slate-400 mt-1">Lo último en llegar a la tienda</p>
            </div>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-bold">Ver todo el sellado &rarr;</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_SEALED.map((item) => (
            <div key={item.id} className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 group hover:border-blue-500 transition-all">
              <div className="h-48 overflow-hidden bg-white relative flex items-center justify-center p-4">
                {/* Nota: Usamos img normal aquí porque son URLs externas de amazon/google para el ejemplo */}
                <img src={item.image} alt={item.name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                    {item.type}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-sm h-10 line-clamp-2 mb-2">{item.name}</h3>
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-400">${item.price.toLocaleString('es-CL')}</span>
                    <button className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 text-white transition-colors">
                        <ShoppingBag size={16} />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}