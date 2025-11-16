# LTI - Sistema de Seguimiento de Talento - Especificaciones para Claude

## Descripción del Proyecto
Sistema full-stack para gestión y seguimiento de talento con arquitectura separada frontend/backend.

## Stack Tecnológico

### Backend
- **Node.js** con Express.js
- **TypeScript** (target ES5, strict mode habilitado)
- **Prisma ORM** para gestión de base de datos
- **PostgreSQL** como base de datos
- **Swagger** para documentación API
- **Jest** para testing

### Frontend
- **React 18** con TypeScript
- **Create React App** como base
- **React Testing Library** para tests
- **CSS** estándar (no hay preprocesadores configurados)

### Base de Datos
- **PostgreSQL 13+** en Docker
- **Prisma** como ORM con migraciones

## Estructura del Proyecto

```
/
├── backend/
│   ├── src/
│   │   └── index.ts         # Punto de entrada del servidor
│   ├── prisma/
│   │   └── schema.prisma    # Esquema de base de datos
│   ├── tests/
│   └── dist/               # Código compilado (generado)
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Componente principal
│   │   └── index.tsx       # Punto de entrada
│   ├── public/
│   └── build/             # Build de producción (generado)
└── docker-compose.yml      # Configuración de servicios
```

## Estándares de Código - Backend

### TypeScript
```typescript
// Usar tipos explícitos siempre
const port: number = 3010;

// Interfaces para objetos complejos
interface UserInput {
  email: string;
  name?: string;
}

// Manejo de errores con tipos
interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}
```

### Estructura de API REST
```typescript
// Rutas RESTful estándar
app.get('/api/users', getAllUsers);
app.get('/api/users/:id', getUserById);
app.post('/api/users', createUser);
app.put('/api/users/:id', updateUser);
app.delete('/api/users/:id', deleteUser);

// Respuestas consistentes
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
```

### Manejo de Errores
```typescript
// Middleware de manejo de errores centralizado
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const error: ApiError = {
    code: 'INTERNAL_ERROR',
    message: err.message || 'Error interno del servidor',
    statusCode: 500
  };
  
  res.status(error.statusCode).json({
    success: false,
    error
  });
});
```

### Validación de Datos
```typescript
// Validar entrada antes de procesar
const validateUserInput = (input: any): UserInput => {
  if (!input.email || !isValidEmail(input.email)) {
    throw new ValidationError('Email inválido');
  }
  return {
    email: input.email,
    name: input.name?.trim()
  };
};
```

### Prisma Best Practices
```typescript
// Usar transacciones para operaciones múltiples
const createUserWithProfile = async (userData: UserInput) => {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });
    // Más operaciones...
    return user;
  });
};

// Siempre cerrar conexiones
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

## Estándares de Código - Frontend

### Componentes React
```typescript
// Componentes funcionales con TypeScript
interface UserCardProps {
  user: User;
  onEdit?: (id: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onEdit && (
        <button onClick={() => onEdit(user.id)}>Editar</button>
      )}
    </div>
  );
};
```

### Gestión de Estado
```typescript
// Usar hooks de React
const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Custom hooks para lógica reutilizable
const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);
  
  return users;
};
```

### Servicios API
```typescript
// Centralizar llamadas API
class ApiService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3010/api';
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) throw new Error('Error en la petición');
    return response.json();
  }
  
  // POST, PUT, DELETE...
}

export const api = new ApiService();
```

### Manejo de Errores UI
```typescript
// Boundary de errores
class ErrorBoundary extends Component<{}, { hasError: boolean }> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Base de Datos - PostgreSQL

### Esquema Prisma
```prisma
// Convenciones de nomenclatura
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique @db.VarChar(255)
  name      String?  @db.VarChar(100)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relaciones
  profile   Profile?
  posts     Post[]
}

// Índices para optimización
@@index([email])
@@index([createdAt])
```

### Migraciones
```bash
# Crear migración
npx prisma migrate dev --name add_user_table

# Aplicar migraciones en producción
npx prisma migrate deploy
```

## Docker y Despliegue

### docker-compose.yml
```yaml
version: "3.8"
services:
  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## Testing

### Backend Tests
```typescript
// Jest con supertest
describe('GET /api/users', () => {
  it('debe retornar lista de usuarios', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
      
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### Frontend Tests
```typescript
// React Testing Library
test('renderiza formulario de usuario', () => {
  render(<UserForm onSubmit={jest.fn()} />);
  
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
});
```

## Seguridad

### Variables de Entorno
```bash
# Backend .env
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
JWT_SECRET="cambiar-en-produccion"
NODE_ENV="development"
PORT=3010

# Frontend .env
REACT_APP_API_URL="http://localhost:3010/api"
```

### Mejores Prácticas
1. **Nunca commitear .env** - usar .env.example
2. **Validar toda entrada** de usuario
3. **Usar HTTPS** en producción
4. **Implementar rate limiting** en API
5. **Sanitizar datos** antes de guardar en BD
6. **Usar prepared statements** (Prisma lo hace automáticamente)

## Comandos de Desarrollo

### Backend
```bash
npm run dev        # Desarrollo con hot reload
npm run build      # Compilar TypeScript
npm run start      # Producción
npm test           # Ejecutar tests
npx prisma studio  # UI para ver base de datos
```

### Frontend
```bash
npm start          # Desarrollo
npm run build      # Build producción
npm test           # Tests
npm run lint       # Linter
```

### Docker
```bash
docker-compose up -d    # Iniciar servicios
docker-compose down     # Detener servicios
docker-compose logs -f  # Ver logs
```

## Flujo de Trabajo Git

```bash
# Feature branch
git checkout -b feature/nombre-feature

# Commits semánticos
git commit -m "feat: agregar endpoint de usuarios"
git commit -m "fix: corregir validación de email"
git commit -m "docs: actualizar README"

# Antes de push
npm test
npm run lint
npm run build
```

## Convenciones de Código

### Nomenclatura
- **Variables/funciones**: camelCase
- **Clases/Interfaces**: PascalCase
- **Constantes**: UPPER_SNAKE_CASE
- **Archivos**: camelCase.ts o PascalCase.tsx para componentes

### Prettier Config
```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "printWidth": 100
}
```

## Recursos y Documentación

- [Prisma Docs](https://www.prisma.io/docs/)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Optimization](https://wiki.postgresql.org/wiki/Performance_Optimization)

## Notas Importantes para Claude

1. **Siempre verificar** que Docker esté corriendo antes de iniciar el backend
2. **Ejecutar migraciones** antes de iniciar el servidor por primera vez
3. **No modificar** archivos en `dist/` o `build/` - son generados
4. **Usar transacciones** para operaciones críticas de base de datos
5. **Implementar paginación** para endpoints que retornen listas
6. **Agregar logs** estructurados para debugging en producción
7. **Documentar API** con Swagger/OpenAPI
8. **Validar schemas** con bibliotecas como Joi o Zod
9. **Implementar CORS** correctamente para producción
10. **Usar variables de entorno** para toda configuración sensible