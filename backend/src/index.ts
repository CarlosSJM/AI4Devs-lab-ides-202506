// ============================================================================
// MAIN SERVER - UPDATED BY BACKEND AGENT
// ============================================================================

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Importar rutas y middleware
import candidateRoutes from './routes/candidate.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Configuración
dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = process.env.PORT || 3010;

// ============================================================================
// MIDDLEWARE GLOBAL
// ============================================================================

// CORS - Permitir requests desde frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// RUTAS
// ============================================================================

// Ruta de salud del servidor
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'LTI ATS Server funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rutas de candidatos
app.use('/api/candidates', candidateRoutes);

// ============================================================================
// MIDDLEWARE DE ERRORES (debe ir al final)
// ============================================================================

// Capturar rutas no encontradas
app.use(notFoundHandler);

// Manejo global de errores
app.use(errorHandler);

// ============================================================================
// INICIO DEL SERVIDOR
// ============================================================================

// Función para inicializar conexión a BD
async function initializeDatabase() {
  try {
    await prisma.$connect();
    console.log('📊 Base de datos conectada correctamente');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    process.exit(1);
  }
}

// Función para cerrar conexiones gracefully
async function shutdown() {
  console.log('🔄 Cerrando servidor...');
  await prisma.$disconnect();
  console.log('✅ Conexiones cerradas');
  process.exit(0);
}

// Manejar señales de cierre
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Iniciar servidor
async function startServer() {
  await initializeDatabase();
  
  app.listen(port, () => {
    console.log(`
🚀 Servidor LTI ATS iniciado
📡 URL: http://localhost:${port}
📊 Base de datos: Conectada
🔧 Modo: ${process.env.NODE_ENV || 'development'}

📋 Endpoints disponibles:
   GET    /                           - Health check
   GET    /api/candidates             - Listar candidatos
   POST   /api/candidates             - Crear candidato
   GET    /api/candidates/:id         - Obtener candidato
   PUT    /api/candidates/:id         - Actualizar candidato
   DELETE /api/candidates/:id         - Eliminar candidato
   POST   /api/candidates/:id/documents - Subir documento
   GET    /api/candidates/:id/documents - Listar documentos
   DELETE /api/candidates/:id/documents/:docId - Eliminar documento
`);
  });
}

// Solo iniciar si no estamos en testing
if (process.env.NODE_ENV !== 'test') {
  startServer().catch(console.error);
}