export const copy = {
  brand: {
    name: "ComentarIA",
    tagline: "Tu consultor de reseñas inteligente",
    mirror: "Informe Espejo",
    emoji: "🪞",
    footer: "ComentarIA · hecho con cuidado en España",
  },
  landing: {
    heroTitle: "Lo que tus clientes dicen, traducido a decisiones",
    heroSubtitle:
      "Analiza reseñas, detecta fortalezas y puntos ciegos, y alinea tu percepción con la realidad de tus comensales.",
    ctaPrimary: "Empezar análisis",
    ctaSecondary: "Iniciar sesión",
    features: [
      {
        title: "Resumen semanal",
        body: "Temas positivos y negativos con acciones concretas para esta semana.",
      },
      {
        title: "Informe Espejo",
        body: "Compara lo que crees con lo que dicen tus clientes en las reseñas.",
      },
      {
        title: "Consultor IA",
        body: "Pregunta sobre tu restaurante con contexto real de tus reseñas.",
      },
    ],
  },
  auth: {
    login: "Iniciar sesión",
    register: "Crear cuenta",
    email: "Correo electrónico",
    password: "Contraseña",
    submitLogin: "Entrar →",
    submitRegister: "Crear cuenta →",
    loading: "Un momento...",
    protected: "Tus datos están protegidos con Supabase",
    errors: {
      invalidCredentials: "Correo o contraseña incorrectos.",
      weakPassword: "La contraseña debe tener al menos 6 caracteres.",
      invalidEmail: "Introduce un correo válido.",
      userExists: "Ya hay una cuenta con este correo. Prueba a iniciar sesión.",
      rateLimit:
        "Demasiados intentos de registro. Espera unos minutos o desactiva la confirmación por email en Supabase (modo desarrollo).",
      signupDisabled: "El registro está desactivado en este proyecto de Supabase.",
      connection:
        "No se pudo conectar con Supabase. En local: revisa .env.local. En Vercel: Settings → Environment Variables (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY) y vuelve a desplegar.",
      missingEnv:
        "Supabase no está configurado. Añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel (o en .env.local en local) y redeploy.",
      generic: "No se pudo completar la operación. Inténtalo de nuevo.",
    },
    confirmEmail:
      "Cuenta creada. Revisa tu correo y confirma el enlace antes de entrar (o desactiva “Confirm email” en Supabase → Authentication → Providers → Email).",
  },
  onboarding: {
    title: "Analiza tus reseñas con IA en 60 segundos",
    steps: [
      "Escribe el nombre de tu restaurante",
      "Analizamos tus reseñas públicas",
      "Tu diagnóstico listo en un minuto",
    ],
    searchName: "Nombre del restaurante",
    searchCity: "Ciudad (opcional)",
    selectTitle: "¿Cuál es el tuyo?",
    cta: "Analiza mi restaurante →",
    loadingDiagnosis: "Preparando tu diagnóstico…",
    savingCloud: "Guardando en la nube…",
    lockWarning:
      "Al seleccionar un restaurante, quedará vinculado a tu cuenta. Para cambiarlo más adelante, deberás contactar con soporte.",
  },
  insights: {
    title: "Resumen semanal",
    health: "Salud reputacional",
    healthy: "Reputación saludable",
    improve: "Margen de mejora",
    urgent: "Atención urgente",
    strengths: "Lo que enamora a tus clientes",
    weaknesses: "Lo que hay que mejorar",
    emptyReview: "Sin comentario escrito.",
    analyzing: "Analizando tus reseñas…",
  },
  espejo: {
    title: "Informe Espejo",
    owner: "Usted cree",
    clients: "Sus clientes dicen",
    aligned: "Alineados",
    gapLight: "Brecha leve",
    blindSpot: "Punto ciego",
    weekly: "Tu espejo esta semana",
    positive: "El dato positivo de esta semana",
  },
  audio: {
    title: "Briefing ejecutivo",
    subtitle: "Tu briefing semanal en 3 minutos",
    play: "Escuchar briefing",
    pause: "Pausar",
    noBriefing: "Genera primero un análisis para escuchar el resumen.",
  },
  chat: {
    title: "Consultor IA",
    placeholder: "Pregunta sobre tus reseñas…",
    limitReached:
      "Has alcanzado el límite diario de consultas. Vuelve mañana o mejora tu plan.",
    serverLimitNotice:
      "Tus conversaciones se procesan con tu restaurante real y un límite diario controlado en servidor.",
    suggestions: [
      "¿Cuál es mi mayor punto débil esta semana?",
      "¿Qué dicen sobre mi carta?",
      "¿Cómo puedo mejorar el servicio?",
      "¿Qué me diferencia de la competencia?",
    ],
  },
  settings: {
    title: "Ajustes",
    regenerate: "Regenerar análisis",
    pdf: "Descargar informe PDF",
    refreshReviews: "Actualizar reseñas",
    logout: "Cerrar sesión",
    lockedLine:
      "Este restaurante está vinculado a tu cuenta. Para cambiarlo, contacta con soporte.",
    analysisUpToDate:
      "El análisis ya está actualizado con las reseñas actuales.",
    limitReached:
      "Has alcanzado el límite diario. Vuelve mañana o mejora tu plan.",
  },
  nav: {
    insights: "Resumen",
    espejo: "Espejo",
    audio: "Briefing",
    chat: "Consultor",
    settings: "Ajustes",
  },
  errors: {
    generic: "Algo ha fallado. Inténtalo de nuevo.",
    noReviews: "No hay reseñas para analizar.",
    aiUnavailable: "El servicio de IA no está configurado.",
    outscraperUnavailable: "El servicio de reseñas no está configurado.",
    alreadyLocked:
      "Tu cuenta ya está vinculada a un restaurante. Para cambiarlo, contacta con soporte.",
    limit:
      "Has alcanzado el límite diario de consultas. Vuelve mañana o mejora tu plan.",
  },
} as const;
