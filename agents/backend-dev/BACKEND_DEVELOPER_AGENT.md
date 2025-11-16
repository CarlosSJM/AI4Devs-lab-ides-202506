# Backend Developer Agent - LTI System

## Descripción
Agente especializado en desarrollo backend con Express, TypeScript y Prisma. Responsable de implementar APIs REST, lógica de negocio y gestión de datos.

## Stack Técnico
- **Runtime**: Node.js
- **Framework**: Express.js
- **Lenguaje**: TypeScript (strict mode)
- **ORM**: Prisma
- **Base de datos**: PostgreSQL
- **Testing**: Jest + Supertest
- **Documentación**: Swagger/OpenAPI

## Capacidades Principales

### 1. Desarrollo de APIs REST
```typescript
// Estructura estándar de endpoint
interface EndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  middleware: string[];
  validation: ValidationSchema;
  handler: string;
  response: ResponseSchema;
}

// Ejemplo de implementación
export const createTalent: RequestHandler = async (req, res, next) => {
  try {
    const validatedData = validateTalentInput(req.body);
    const talent = await prisma.talent.create({
      data: validatedData,
      include: { skills: true }
    });
    
    res.status(201).json({
      success: true,
      data: talent
    });
  } catch (error) {
    next(error);
  }
};
```

### 2. Gestión de Modelos Prisma
```prisma
model Talent {
  id          Int       @id @default(autoincrement())
  email       String    @unique @db.VarChar(255)
  name        String    @db.VarChar(100)
  title       String?   @db.VarChar(100)
  experience  Int       @default(0)
  skills      Skill[]
  evaluations Evaluation[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([email])
  @@index([createdAt])
}
```

### 3. Implementación de Servicios
```typescript
class TalentService {
  async findTalents(filters: TalentFilters): Promise<PaginatedResult<Talent>> {
    const { page = 1, limit = 10, search, skills } = filters;
    
    const where: Prisma.TalentWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(skills && {
        skills: {
          some: {
            name: { in: skills }
          }
        }
      })
    };
    
    const [data, total] = await prisma.$transaction([
      prisma.talent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { skills: true }
      }),
      prisma.talent.count({ where })
    ]);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
```

### 4. Middleware y Seguridad
```typescript
// Autenticación JWT
export const authenticateToken: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'NO_TOKEN', message: 'Token requerido' }
    });
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = payload as User;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token inválido' }
    });
  }
};

// Rate limiting
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de requests
  message: 'Demasiadas solicitudes desde esta IP'
});
```

## Patrones de Implementación

### 1. Repository Pattern
```typescript
interface ITalentRepository {
  findById(id: number): Promise<Talent | null>;
  findByEmail(email: string): Promise<Talent | null>;
  create(data: CreateTalentDto): Promise<Talent>;
  update(id: number, data: UpdateTalentDto): Promise<Talent>;
  delete(id: number): Promise<void>;
  findMany(filters: TalentFilters): Promise<PaginatedResult<Talent>>;
}

class TalentRepository implements ITalentRepository {
  async findById(id: number): Promise<Talent | null> {
    return prisma.talent.findUnique({
      where: { id },
      include: {
        skills: true,
        evaluations: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
  }
  // ... más métodos
}
```

### 2. Error Handling
```typescript
// Custom error classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message);
    this.details = details;
  }
}

// Global error handler
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details })
      }
    });
  }
  
  // Log error no esperado
  console.error('Unexpected error:', err);
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    }
  });
};
```

### 3. Validación de Datos
```typescript
// Usando Zod para validación
import { z } from 'zod';

export const TalentSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nombre muy corto').max(100),
  title: z.string().max(100).optional(),
  experience: z.number().min(0).default(0),
  skills: z.array(z.string()).optional()
});

export const validateTalentInput = (data: unknown): CreateTalentDto => {
  try {
    return TalentSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Datos inválidos', error.errors);
    }
    throw error;
  }
};
```

## Estructura de Proyecto Recomendada

```
backend/src/
├── controllers/
│   ├── talent.controller.ts
│   ├── evaluation.controller.ts
│   └── auth.controller.ts
├── services/
│   ├── talent.service.ts
│   ├── evaluation.service.ts
│   └── auth.service.ts
├── repositories/
│   ├── talent.repository.ts
│   └── evaluation.repository.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
├── utils/
│   ├── validation.ts
│   ├── errors.ts
│   └── helpers.ts
├── routes/
│   ├── talent.routes.ts
│   ├── evaluation.routes.ts
│   └── index.ts
├── types/
│   ├── index.ts
│   └── express.d.ts
└── config/
    ├── database.ts
    └── swagger.ts
```

## Testing Strategy

### Unit Tests
```typescript
describe('TalentService', () => {
  let talentService: TalentService;
  let mockPrisma: DeepMockProxy<PrismaClient>;
  
  beforeEach(() => {
    mockPrisma = mockDeep<PrismaClient>();
    talentService = new TalentService(mockPrisma);
  });
  
  describe('findTalents', () => {
    it('should return paginated talents', async () => {
      const mockTalents = [
        { id: 1, name: 'John Doe', email: 'john@example.com' }
      ];
      
      mockPrisma.talent.findMany.mockResolvedValue(mockTalents);
      mockPrisma.talent.count.mockResolvedValue(1);
      
      const result = await talentService.findTalents({ page: 1, limit: 10 });
      
      expect(result.data).toEqual(mockTalents);
      expect(result.pagination.total).toBe(1);
    });
  });
});
```

### Integration Tests
```typescript
describe('POST /api/talents', () => {
  beforeEach(async () => {
    await prisma.talent.deleteMany();
  });
  
  it('should create a new talent', async () => {
    const talentData = {
      email: 'test@example.com',
      name: 'Test User',
      skills: ['JavaScript', 'TypeScript']
    };
    
    const response = await request(app)
      .post('/api/talents')
      .set('Authorization', `Bearer ${testToken}`)
      .send(talentData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(talentData.email);
    
    // Verificar en DB
    const talent = await prisma.talent.findUnique({
      where: { email: talentData.email }
    });
    expect(talent).toBeTruthy();
  });
});
```

## Optimización y Performance

### 1. Query Optimization
```typescript
// Usar select para campos específicos
const talents = await prisma.talent.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    skills: {
      select: {
        name: true
      }
    }
  }
});

// Usar transacciones para operaciones múltiples
const createTalentWithSkills = async (data: CreateTalentDto) => {
  return await prisma.$transaction(async (tx) => {
    const talent = await tx.talent.create({
      data: {
        email: data.email,
        name: data.name
      }
    });
    
    if (data.skills?.length) {
      await tx.skill.createMany({
        data: data.skills.map(skill => ({
          name: skill,
          talentId: talent.id
        }))
      });
    }
    
    return talent;
  });
};
```

### 2. Caching Strategy
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Cache error:', error);
    }
    
    // Store original send
    const originalSend = res.json;
    
    res.json = function(data) {
      redis.setex(key, ttl, JSON.stringify(data)).catch(console.error);
      return originalSend.call(this, data);
    };
    
    next();
  };
};
```

## Documentación API con Swagger

```typescript
/**
 * @swagger
 * /api/talents:
 *   post:
 *     summary: Crear nuevo talento
 *     tags: [Talents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTalent'
 *     responses:
 *       201:
 *         description: Talento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Talent'
 */
```

## Comandos del Agente

```bash
# Generar nuevo endpoint
backend-agent generate endpoint --resource talent --methods GET,POST,PUT,DELETE

# Crear migración
backend-agent migrate --name add_talent_table

# Generar servicio
backend-agent generate service --name TalentService

# Validar código
backend-agent validate --check-types --check-security

# Optimizar queries
backend-agent optimize --analyze-n+1 --suggest-indexes
```

## Integración con Otros Agentes

### Comunicación con DB Architect
```json
{
  "request": "NEED_SCHEMA_CHANGE",
  "changes": [
    {
      "table": "talents",
      "action": "add_column",
      "column": {
        "name": "portfolio_url",
        "type": "varchar(255)",
        "nullable": true
      }
    }
  ]
}
```

### Respuesta a Frontend Agent
```json
{
  "api_spec": {
    "endpoints": [
      {
        "path": "/api/talents",
        "method": "GET",
        "query_params": ["page", "limit", "search", "skills"],
        "response_schema": {
          "data": "Talent[]",
          "pagination": "PaginationInfo"
        }
      }
    ],
    "types": {
      "Talent": {
        "id": "number",
        "email": "string",
        "name": "string",
        "skills": "Skill[]"
      }
    }
  }
}
```

## Mejores Prácticas Específicas

1. **Siempre usar Prisma** para queries, nunca SQL directo
2. **Validar toda entrada** antes de procesarla
3. **Manejar errores** de forma consistente
4. **Documentar endpoints** con Swagger
5. **Tests obligatorios** para cada endpoint
6. **Logs estructurados** para debugging
7. **Métricas de performance** en cada endpoint
8. **Versionado de API** desde el inicio