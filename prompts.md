1.  Análisis Inicial del Proyecto

CONTEXT: Proyecto ATS (Applicant Tracking System) con stack React/TypeScript/Express/PostgreSQL
OBJECTIVE: Realizar análisis exhaustivo del estado actual del proyecto
TASKS:

- Evaluar funcionalidad actual del sistema
- Identificar componentes implementados vs pendientes
- Revisar estructura de código y documentación
- Detectar dependencias y configuraciones faltantes
- Proporcionar diagnóstico ejecutivo con próximos pasos
  FORMAT: Informe estructurado con secciones: Estado Actual | Gaps Identificados | Recomendaciones

2. Diseño de Arquitectura Multi-Agente

CONTEXT: Necesidad de implementar arquitectura multi-agente para desarrollo de producto digital
STACK: React + TypeScript (Frontend) | Express + Prisma (Backend) | PostgreSQL (Database)
REFERENCE: Documentación oficial Anthropic para patrones de agentes
DELIVERABLES:

1. Lista de agentes especializados con responsabilidades definidas
2. Diagrama de interacción entre agentes
3. Especificación técnica por agente (inputs/outputs/tools)
4. Guía de implementación práctica
   CONSTRAINTS: Seguir mejores prácticas de Anthropic y mantener separación de concerns

5. Aplicación de Arquitectura a User Story

USER_STORY: "Como reclutador, quiero añadir candidatos al sistema para gestionar el proceso de selección"
ACCEPTANCE_CRITERIA:

- CRUD completo de candidatos
- Gestión de documentos adjuntos
- Historial de educación y experiencia
- Estados del proceso de selección
  TASK: Descomponer la user story usando arquitectura multi-agente definida
  OUTPUT: Plan de implementación con:
- Asignación de tareas por agente
- Secuencia de ejecución
- Dependencias entre componentes
- Estimación de complejidad

4. Verificación de Prerequisitos

CHECKPOINT: Validación de ambiente de desarrollo
VERIFY:

- [ ] Docker compose configurado y operativo
- [ ] Variables de entorno (.env) correctamente definidas
- [ ] Dependencias npm instaladas (frontend/backend)
- [ ] Base de datos PostgreSQL accesible
- [ ] Migraciones Prisma inicializadas
      REPORT: Estado de cada componente con comandos de verificación ejecutados

5. Orquestación de Servicios

SERVICES: Backend API | Frontend React | PostgreSQL Database
REQUIRED_PORTS:

- Backend: 3010
- Frontend: 3000
- Database: 5433
  ACTIONS:

1. Verificar disponibilidad de puertos
2. Iniciar servicios en orden correcto (DB → Backend → Frontend)
3. Validar conectividad entre servicios
4. Proporcionar URLs de acceso y logs de verificación

5. Control de Servicios

EMERGENCY_STOP: Detener todos los servicios en ejecución
TARGET_SERVICES:

- Frontend development server (port 3000)
- Backend API server (port 3010)
- Docker containers (PostgreSQL)
  CLEANUP:
- Kill procesos Node.js relevantes
- Stop contenedores Docker
- Liberar puertos ocupados
  CONFIRM: Mostrar estado final de servicios y puertos

7. Estrategia de Implementación

ARTIFACT: RESOLUCION_USER_STORY_CANDIDATOS.md
APPROACH: Implementación guiada por agentes especializados
METHODOLOGY:

1. Análisis de requerimientos por PM Agent
2. Diseño de datos por Database Agent
3. Implementación API por Backend Agent
4. Desarrollo UI por Frontend Agent
   GUIDANCE: Proporcionar roadmap detallado con checkpoints de validación

5. Clarificación Metodológica

CLARIFICATION: Modalidad de ejecución de agentes
CONTEXT: Implementación de user stories usando arquitectura multi-agente
OPTIONS:
A) Simulación de agentes dentro de Claude (rol-playing)
B) Herramientas externas de orquestación
C) Scripts automatizados con prompts
RECOMMENDATION: Sugerir approach óptimo con pros/contras y ejemplo de uso

9. Configuración de Ejecución

IMPLEMENTATION_MODE: Definir método de invocación de agentes
CONSIDERATIONS:

- Integración con herramientas Claude
- Persistencia de contexto entre agentes
- Trazabilidad de decisiones
- Handoff entre agentes
  PROVIDE: Sintaxis específica y ejemplos de comandos para cada opción

10. Product Manager Agent - Inicialización

AGENT_ROLE: Product Manager
USER_STORY: "Añadir Candidato al Sistema"
OBJECTIVES:

1. Descomponer en tickets técnicos SMART
2. Definir criterios de aceptación medibles
3. Establecer prioridades y dependencias
4. Asignar tickets a agentes especializados
   OUTPUT_FORMAT:

- TICKET-001: [Database] Descripción | Prioridad | Estimación
- TICKET-002: [Backend] Descripción | Prioridad | Estimación
- TICKET-003: [Frontend] Descripción | Prioridad | Estimación

11. Database Agent - Implementación

AGENT_ROLE: Database Architect
TICKET: TICKET-001 - Modelo de datos para gestión de candidatos
REQUIREMENTS:

- Entidad Candidate con campos requeridos
- Relaciones 1:N con Education y Experience
- Gestión de documentos adjuntos
- Optimización de queries con índices
  DELIVERABLES:

1. Schema Prisma completo
2. Migraciones SQL
3. Seeders de datos de prueba
4. Documentación de modelo E-R

5. Version Control - Checkpoint

GIT_OPERATION: Commit atómico para TICKET-001
SCOPE: Todos los cambios del Database Agent
PRE_COMMIT_CHECKLIST:

- [ ] Revisar archivos modificados
- [ ] Validar schema Prisma
- [ ] Ejecutar migraciones localmente
- [ ] Verificar .gitignore
      COMMIT_TEMPLATE:
      feat(database): [TICKET-001] Implement complete candidate data model

- Add Prisma schema with 4 entities
- Create relationships for education/experience
- Configure indexes for performance
- Add migration files

13. Git Stage Management

GIT_STAGING: Agregar cambios selectivamente
ANALYSIS:

1. Listar todos los archivos modificados/nuevos
2. Filtrar por relevancia al ticket actual
3. Excluir archivos temporales o de build
   COMMAND: git add [archivos específicos]
   VALIDATION: git status para confirmar staging correcto

4. Commit Message Profesional

COMMIT_STANDARDS: Conventional Commits + Context
STRUCTURE:
type(scope): [TICKET-ID] Brief description

Detailed explanation of changes:

- What: Specific modifications made
- Why: Business/Technical justification
- Impact: Systems affected

EXAMPLE:
feat(database): [TICKET-001] Add complete candidate management schema

Implemented comprehensive data model for ATS:

- Created Candidate entity with personal/professional fields
- Added Education and Experience relationships
- Configured document storage structure
- Optimized with proper indexes for search performance

15. Backend Agent - API Development

AGENT_ROLE: Backend Developer
TICKET: TICKET-002 - RESTful API for Candidate Management
SPECIFICATIONS:

- REST endpoints: GET, POST, PUT, DELETE /api/candidates
- Request validation with Zod schemas
- File upload with Multer (max 5MB, PDF/DOCX)
- Error handling middleware
- Pagination and filtering support
  DELIVERABLES:

1. Controllers with business logic
2. Service layer with Prisma integration
3. Validation schemas and DTOs
4. API documentation (endpoints, payloads, responses)
   TEST: Provide curl commands for endpoint verification

5. Frontend Agent - UI Implementation

AGENT_ROLE: Frontend Developer
TICKET: TICKET-003 - Candidate Management Dashboard
REQUIREMENTS:

- Responsive dashboard with statistics widgets
- Dynamic form with education/experience sections
- Advanced filtering and search
- Real-time validation
- Toast notifications for user feedback
  TECHNICAL_SPECS:
- React functional components with TypeScript
- Custom hooks for state management
- Optimistic UI updates
- Accessibility compliance (WCAG 2.1)
  DELIVERABLES:

1. Component library with proper typing
2. API service layer
3. Global styling system
4. Storybook documentation (optional)

5. Dependency Management

ISSUE: Git tracking unwanted files (node_modules, build artifacts)
INVESTIGATION:

1. Analyze current .gitignore configuration
2. Identify tracked files that should be ignored
3. Review git status output
   RESOLUTION:
4. Update .gitignore with proper patterns
5. Remove cached files: git rm -r --cached [directories]
6. Verify clean git status
   PREVENTION: Add pre-commit hooks for file size and pattern validation

7. Git Operations Clarification

CONTEXT: Understanding git command implications
COMMAND_ANALYSIS: [specific git command]
EXPLAIN:

1. What the command does technically
2. Impact on repository state
3. Potential risks or side effects
4. Alternative approaches
   BEST_PRACTICE: Recommend safest approach for current situation

5. TypeScript Error Resolution

ERROR_CONTEXT: TypeScript compilation errors in React components
ERROR_TYPE: Type incompatibility in form field props
DIAGNOSTIC_STEPS:

1. Analyze type definitions in affected components
2. Trace type inference chain
3. Identify root cause of type mismatch
   SOLUTION_APPROACH:
4. Implement type-safe wrapper functions
5. Update generic constraints
6. Add proper type assertions where needed
   VALIDATION: Ensure npm run build succeeds without errors

7. React Router Configuration

ISSUE: Default React template showing instead of application
CURRENT_STATE: App.tsx contains boilerplate code
REQUIRED_STATE: Display CandidatesPage component as main route
IMPLEMENTATION:

1. Remove boilerplate JSX
2. Import necessary components
3. Configure root component structure
4. Verify proper CSS imports
   TEST: Navigate to http://localhost:3000 and confirm dashboard displays

5. API Integration Debugging

ERROR: Frontend-Backend communication failure
SYMPTOMS:

- "Error al crear candidato" in UI
- Network errors in browser console
  DIAGNOSTIC_PROTOCOL:

1. Verify backend service status (process, port)
2. Test API endpoints directly (curl/Postman)
3. Check database connectivity
4. Validate CORS configuration
5. Inspect request/response payloads
   RESOLUTION_STEPS:
6. Fix identified issues in order of dependency
7. Test each fix incrementally
8. Provide working example request

9. Pull Request Documentation

PR_TYPE: Feature Implementation
SCOPE: Complete ATS candidate management system
GENERATE:

1. Title: Conventional format with clear scope
2. Description: Executive summary with business value
3. Technical changes: Categorized by component
4. Testing evidence: Commands and screenshots
5. Breaking changes: None expected
6. Deploy instructions: Step-by-step guide
   FORMAT: GitHub PR template with checkboxes and sections

7. Meta-Analysis Request

OBJECTIVE: Extract and optimize development workflow
ANALYZE:

1. Conversation history and prompt sequence
2. Decision points and corrections made
3. Effective vs ineffective prompts
   OUTPUT:
4. Chronological prompt list
5. Categorization by purpose
6. Success patterns identified
7. Optimization recommendations
   PURPOSE: Create reusable prompt templates for similar projects

---

📋 Plantilla Maestra para Prompts de Desarrollo

[CONTEXT]: Información de ambiente y estado actual
[OBJECTIVE]: Meta específica y medible
[CONSTRAINTS]: Limitaciones técnicas o de negocio
[SPECIFICATIONS]: Requerimientos detallados
[DELIVERABLES]: Entregables concretos esperados
[VALIDATION]: Criterios de éxito y testing
[FORMAT]: Estructura esperada de la respuesta

Beneficios de estos Prompts Optimizados:

✅ Claridad: Objetivos específicos sin ambigüedad
✅ Contexto: Información completa para decisiones informadas
✅ Trazabilidad: Fácil seguimiento del progreso
✅ Reusabilidad: Templates aplicables a otros proyectos
✅ Profesionalismo: Comunicación estructurada y eficiente
