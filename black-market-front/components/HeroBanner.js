export default function HeroBanner() {
    return (
      <div className="relative bg-slate-950 border-b border-slate-800 overflow-hidden min-h-[450px] flex items-center justify-center">
        {/* Fondo Temático de Magic (Arte de carta con filtros oscuros) */}
        <div className="absolute inset-0 bg-[url('https://assets.echomtg.com/magic/cards/cropped/115866.hq.jpg')] bg-cover bg-center opacity-30 blur-sm"></div>
        {/* Gradiente para oscurecer y dar profundidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950"></div>
  
        {/* Contenido Principal Centrado */}
        <div className="relative max-w-4xl mx-auto px-4 w-full text-center z-10">
          {/* Título Principal con efecto de texto */}
          <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tighter mb-6 drop-shadow-2xl">
            BLACK <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300 filter drop-shadow-lg">MARKET</span>
          </h1>
          
          {/* Subtítulo elegante */}
          <p className="text-slate-200 text-xl md:text-3xl font-light leading-relaxed tracking-wide drop-shadow-md">
            El destino definitivo para coleccionistas y jugadores competitivos de <span className="font-semibold text-amber-400">Magic: The Gathering</span>.
          </p>
          
          {/* Decoración sutil opcional debajo del texto */}
          <div className="mt-8 mx-auto w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full opacity-70"></div>
        </div>
      </div>
    );
}