import { Layers, Shield, Sparkles, Crown } from 'lucide-react';

const CATEGORIES = [
  { id: 1, name: "Commander", icon: <Crown size={32} />, color: "from-purple-600 to-indigo-900", desc: "El formato rey" },
  { id: 2, name: "Staples Modern", icon: <Shield size={32} />, color: "from-blue-600 to-slate-900", desc: "Competitivo" },
  { id: 3, name: "Foils & Promos", icon: <Sparkles size={32} />, color: "from-amber-500 to-orange-800", desc: "Brillo exclusivo" },
  { id: 4, name: "Lands / Tierras", icon: <Layers size={32} />, color: "from-emerald-600 to-green-900", desc: "La base de maná" },
];

export default function CategoryGrid() {
  return (
    <section className="py-12 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
          Explorar por Categoría
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <div 
              key={cat.id} 
              className={`relative overflow-hidden rounded-xl p-6 cursor-pointer group hover:-translate-y-1 transition-all duration-300 border border-slate-800 bg-gradient-to-br ${cat.color}`}
            >
              {/* Overlay oscuro para legibilidad */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
              
              <div className="relative z-10 text-white">
                <div className="mb-4 p-3 bg-white/10 rounded-lg w-fit backdrop-blur-sm">
                  {cat.icon}
                </div>
                <h4 className="text-xl font-bold mb-1">{cat.name}</h4>
                <p className="text-sm text-slate-200 opacity-80">{cat.desc}</p>
              </div>

              {/* Decoración de fondo */}
              <div className="absolute -bottom-4 -right-4 text-white/10 transform rotate-12 scale-150 group-hover:scale-125 transition-transform duration-500">
                {cat.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}