# Frontend Developer Agent - LTI System

## Descripción
Agente especializado en desarrollo frontend con React y TypeScript. Responsable de crear interfaces de usuario intuitivas, gestionar estado de la aplicación e integrar con APIs backend.

## Stack Técnico
- **Framework**: React 18
- **Lenguaje**: TypeScript
- **Estilos**: CSS (módulos/styled-components)
- **Estado**: React Context / Redux Toolkit
- **Routing**: React Router v6
- **Testing**: React Testing Library + Jest
- **Build**: Create React App (con posibilidad de eject)

## Capacidades Principales

### 1. Desarrollo de Componentes React
```typescript
// Componente con TypeScript y mejores prácticas
interface TalentCardProps {
  talent: Talent;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
}

export const TalentCard: React.FC<TalentCardProps> = ({
  talent,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const handleEdit = useCallback(() => {
    onEdit?.(talent.id);
  }, [onEdit, talent.id]);
  
  if (isLoading) {
    return <TalentCardSkeleton />;
  }
  
  return (
    <Card className={styles.talentCard}>
      <CardHeader>
        <Avatar src={talent.avatarUrl} alt={talent.name} />
        <div className={styles.info}>
          <h3>{talent.name}</h3>
          <p>{talent.title || 'Sin título'}</p>
        </div>
      </CardHeader>
      
      <CardBody>
        <SkillsList skills={talent.skills} />
        {showDetails && (
          <TalentDetails 
            experience={talent.experience}
            evaluations={talent.evaluations}
          />
        )}
      </CardBody>
      
      <CardFooter>
        <Button 
          variant="text" 
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Ocultar' : 'Ver más'}
        </Button>
        {onEdit && (
          <Button variant="outlined" onClick={handleEdit}>
            Editar
          </Button>
        )}
        {onDelete && (
          <Button 
            variant="text" 
            color="error"
            onClick={() => onDelete(talent.id)}
          >
            Eliminar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
```

### 2. Gestión de Estado
```typescript
// Context API para estado global
interface AppState {
  user: User | null;
  talents: Talent[];
  filters: TalentFilters;
  isLoading: boolean;
  error: string | null;
}

interface AppContextValue extends AppState {
  actions: {
    setUser: (user: User | null) => void;
    loadTalents: (filters?: TalentFilters) => Promise<void>;
    updateFilters: (filters: Partial<TalentFilters>) => void;
    clearError: () => void;
  };
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const actions = useMemo(() => ({
    setUser: (user: User | null) => {
      dispatch({ type: 'SET_USER', payload: user });
    },
    
    loadTalents: async (filters?: TalentFilters) => {
      dispatch({ type: 'LOADING_START' });
      try {
        const talents = await talentService.getTalents(filters || state.filters);
        dispatch({ type: 'SET_TALENTS', payload: talents });
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error.message || 'Error al cargar talentos' 
        });
      }
    },
    
    updateFilters: (filters: Partial<TalentFilters>) => {
      dispatch({ type: 'UPDATE_FILTERS', payload: filters });
    },
    
    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    }
  }), [state.filters]);
  
  const value = useMemo(() => ({
    ...state,
    actions
  }), [state, actions]);
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

### 3. Servicios y API Integration
```typescript
// Servicio para comunicación con backend
class TalentService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3010/api';
  
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        error.error?.message || 'Error en la solicitud',
        response.status,
        error.error?.code
      );
    }
    
    return response.json();
  }
  
  async getTalents(filters?: TalentFilters): Promise<PaginatedResponse<Talent>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    return this.request<PaginatedResponse<Talent>>(
      `/talents?${params.toString()}`
    );
  }
  
  async createTalent(data: CreateTalentDto): Promise<Talent> {
    return this.request<Talent>('/talents', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async updateTalent(id: number, data: UpdateTalentDto): Promise<Talent> {
    return this.request<Talent>(`/talents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
}

export const talentService = new TalentService();
```

### 4. Formularios y Validación
```typescript
// Hook para manejo de formularios
interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validar campo individual
    if (touched[name] && validate) {
      const fieldError = validate({ ...values, [name]: value })[name];
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };
  
  const handleBlur = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validate) {
      const fieldError = validate(values)[name];
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos los campos
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    resetForm: () => {
      setValues(initialValues);
      setErrors({});
      setTouched({});
    }
  };
}

// Componente de formulario usando el hook
export const TalentForm: React.FC<TalentFormProps> = ({ onSubmit, initialData }) => {
  const form = useForm({
    initialValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      title: initialData?.title || '',
      skills: initialData?.skills || []
    },
    validate: (values) => {
      const errors: any = {};
      
      if (!values.name) {
        errors.name = 'Nombre requerido';
      }
      
      if (!values.email) {
        errors.email = 'Email requerido';
      } else if (!isValidEmail(values.email)) {
        errors.email = 'Email inválido';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      await onSubmit(values);
    }
  });
  
  return (
    <form onSubmit={form.handleSubmit} className={styles.talentForm}>
      <TextField
        label="Nombre"
        name="name"
        value={form.values.name}
        onChange={(e) => form.handleChange('name', e.target.value)}
        onBlur={() => form.handleBlur('name')}
        error={form.touched.name && !!form.errors.name}
        helperText={form.touched.name && form.errors.name}
        required
      />
      
      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.values.email}
        onChange={(e) => form.handleChange('email', e.target.value)}
        onBlur={() => form.handleBlur('email')}
        error={form.touched.email && !!form.errors.email}
        helperText={form.touched.email && form.errors.email}
        required
      />
      
      <TextField
        label="Título"
        name="title"
        value={form.values.title}
        onChange={(e) => form.handleChange('title', e.target.value)}
      />
      
      <SkillsInput
        value={form.values.skills}
        onChange={(skills) => form.handleChange('skills', skills)}
      />
      
      <div className={styles.actions}>
        <Button type="submit" disabled={form.isSubmitting}>
          {form.isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
};
```

### 5. Routing y Navegación
```typescript
// Configuración de rutas
export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/talents" replace />} />
          <Route path="talents" element={<TalentsPage />} />
          <Route path="talents/new" element={<NewTalentPage />} />
          <Route path="talents/:id" element={<TalentDetailPage />} />
          <Route path="talents/:id/edit" element={<EditTalentPage />} />
          <Route path="evaluations" element={<EvaluationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
};

// Protected Route component
export const ProtectedRoute: React.FC<PropsWithChildren> = ({ children }) => {
  const { user } = useApp();
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};
```

## Patrones de UI/UX

### 1. Loading States
```typescript
// Skeleton components para loading
export const TalentListSkeleton: React.FC = () => (
  <div className={styles.skeletonList}>
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className={styles.skeletonCard}>
        <Skeleton variant="circular" width={40} height={40} />
        <div className={styles.skeletonContent}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
    ))}
  </div>
);

// Hook para gestionar loading states
export const useAsyncData = <T,>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, dependencies);
  
  return { data, loading, error, refetch: () => fetchData() };
};
```

### 2. Error Boundaries
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Enviar a servicio de monitoreo
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    
    return this.props.children;
  }
}
```

### 3. Optimización de Performance
```typescript
// Memoización de componentes pesados
export const ExpensiveComponent = memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: heavyComputation(item)
    }));
  }, [data]);
  
  return <DataVisualization data={processedData} />;
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.length === nextProps.data.length &&
         prevProps.data.every((item, index) => item.id === nextProps.data[index].id);
});

// Virtual scrolling para listas largas
export const VirtualizedTalentList: React.FC<{ talents: Talent[] }> = ({ talents }) => {
  const rowRenderer = ({ index, key, style }: ListRowProps) => (
    <div key={key} style={style}>
      <TalentCard talent={talents[index]} />
    </div>
  );
  
  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          rowCount={talents.length}
          rowHeight={120}
          rowRenderer={rowRenderer}
        />
      )}
    </AutoSizer>
  );
};
```

## Testing Strategy

### Component Testing
```typescript
describe('TalentCard', () => {
  const mockTalent: Talent = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    skills: ['React', 'TypeScript']
  };
  
  it('renders talent information correctly', () => {
    render(<TalentCard talent={mockTalent} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', async () => {
    const handleEdit = jest.fn();
    render(<TalentCard talent={mockTalent} onEdit={handleEdit} />);
    
    await userEvent.click(screen.getByText('Editar'));
    
    expect(handleEdit).toHaveBeenCalledWith(1);
  });
});
```

### Hook Testing
```typescript
describe('useForm', () => {
  it('validates form on submit', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => 
      useForm({
        initialValues: { email: '' },
        validate: (values) => ({
          email: !values.email ? 'Required' : undefined
        }),
        onSubmit
      })
    );
    
    await act(async () => {
      await result.current.handleSubmit(new Event('submit') as any);
    });
    
    expect(result.current.errors.email).toBe('Required');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

## Estructura de Proyecto Recomendada

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   ├── TextField/
│   │   └── Card/
│   ├── talents/
│   │   ├── TalentCard/
│   │   ├── TalentForm/
│   │   └── TalentList/
│   └── layout/
│       ├── Header/
│       ├── Sidebar/
│       └── Layout/
├── pages/
│   ├── TalentsPage/
│   ├── TalentDetailPage/
│   └── LoginPage/
├── services/
│   ├── api.service.ts
│   ├── talent.service.ts
│   └── auth.service.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useForm.ts
│   └── useAsync.ts
├── context/
│   ├── AppContext.tsx
│   └── ThemeContext.tsx
├── utils/
│   ├── validators.ts
│   ├── formatters.ts
│   └── constants.ts
├── types/
│   ├── index.ts
│   └── api.types.ts
└── styles/
    ├── globals.css
    ├── variables.css
    └── mixins.scss
```

## Integración con Design System

```typescript
// Theme configuration
export const theme = {
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    success: '#4caf50'
  },
  spacing: (factor: number) => `${8 * factor}px`,
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536
  }
};

// Responsive utilities
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState<keyof typeof theme.breakpoints>('md');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) setBreakpoint('xs');
      else if (width < 900) setBreakpoint('sm');
      else if (width < 1200) setBreakpoint('md');
      else if (width < 1536) setBreakpoint('lg');
      else setBreakpoint('xl');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    breakpoint,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl'
  };
};
```

## Comandos del Agente

```bash
# Generar nuevo componente
frontend-agent generate component --name TalentCard --type functional --with-tests

# Crear página completa
frontend-agent generate page --name TalentDetail --route /talents/:id

# Generar servicio API
frontend-agent generate service --name evaluation --with-types

# Analizar bundle size
frontend-agent analyze --bundle-size --suggest-optimizations

# Validar accesibilidad
frontend-agent validate --a11y --wcag-level AA
```

## Comunicación con Otros Agentes

### Request a Backend Agent
```json
{
  "request": "NEED_API_ENDPOINT",
  "endpoint": {
    "path": "/api/talents/search",
    "method": "GET",
    "params": ["query", "skills", "minExperience"],
    "response": "Talent[]"
  }
}
```

### Response del Frontend Agent
```json
{
  "component_ready": {
    "name": "TalentSearchComponent",
    "props": {
      "onSearch": "(filters: SearchFilters) => void",
      "isLoading": "boolean",
      "results": "Talent[]"
    },
    "dependencies": ["TalentCard", "SearchFilters", "Pagination"]
  }
}
```

## Mejores Prácticas Específicas

1. **Componentes pequeños y reutilizables**
2. **Props tipadas con TypeScript**
3. **Evitar re-renders innecesarios**
4. **Lazy loading de rutas**
5. **Error boundaries en componentes críticos**
6. **Tests para componentes y hooks**
7. **Accesibilidad (ARIA labels, keyboard nav)**
8. **Responsive design mobile-first**