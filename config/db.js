const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión.
// Supabase requiere SSL habilitado para conexiones externas.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        // 'rejectUnauthorized: false' permite la conexión sin verificar manualmente 
        // el certificado CA localmente, lo cual es estándar para desarrollos rápidos con Supabase.
        rejectUnauthorized: false 
    }
});

// Evento para monitorear conexión exitosa
pool.on('connect', () => {
    console.log('✅ Base de datos conectada correctamente a Supabase');
});

// Manejo de errores en el pool
pool.on('error', (err) => {
    console.error('❌ Error inesperado en el cliente de base de datos', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};