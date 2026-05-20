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
    previewEyebrow: "Tu local",
    confirmLink: "Vincular este restaurante →",
    backToList: "Ver otros resultados",
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
    placeholder: "Pregunta sobre tu reputación…",
    limitReached:
      "Has alcanzado el límite diario de consultas. Vuelve mañana o mejora tu plan.",
    serverLimitNotice:
      "Tus conversaciones se procesan con tu restaurante real y un límite diario controlado en servidor.",
    suggestions: [
      "¿Cuál es mi mayor riesgo ahora?",
      "¿Qué producto debería potenciar?",
      "¿Qué me diferencia de la competencia?",
      "¿Qué debería mejorar antes del fin de semana?",
      "¿Qué opinan las familias con niños?",
    ],
  },
  summary: {
    greeting: "Buenos días",
    subtitle: "Aquí tienes el resumen de la reputación de",
    lastUpdate: "Última actualización",
    healthScore: "Salud reputacional",
    weeklyPlan: "Qué hacer esta semana",
    weeklyBriefing: "Briefing semanal IA",
    activeAlerts: "Alertas activas",
    viewPlan: "Ver plan operativo",
    listenBriefing: "Escuchar briefing",
    viewAlerts: "Ver alertas",
    reputationCenter: "Centro de reputación",
    starProducts: "Productos estrella",
    mirrorReport: "Informe espejo",
    evolution: "Evolución reputacional",
    competition: "Comparativa con competencia",
    consultant: "Consultor IA",
    syncReviews: "Sincronizar reseñas",
    noAnalysis: "Genera un análisis para ver tu resumen ejecutivo.",
  },
  weeklyPlan: {
    title: "Qué hacer esta semana",
    subtitle: "Plan operativo priorizado a partir de tus reseñas reales.",
  },
  replies: {
    title: "Respuestas",
    subtitle: "Gestiona borradores y respuestas aprobadas antes de publicar.",
    empty: "No hay borradores pendientes. Responde reseñas desde el centro de reputación.",
  },
  brandVoice: {
    title: "Voz del restaurante",
    subtitle: "Perfil de tono que usa la IA al redactar respuestas.",
    edit: "Editar perfil de voz",
    empty: "Conecta Google Business para detectar tu estilo de respuesta.",
    detected: "Estilo detectado",
  },
  evolution: {
    title: "Evolución reputacional",
    subtitle: "Cómo evolucionan puntuación, volumen y sentimiento.",
    todoNote: "Histórico real pendiente — serie estimada desde el análisis actual.",
  },
  competition: {
    title: "Comparativa con competencia",
    empty: "Aún no hay competidores conectados.",
    analyze: "Analizar competencia",
    service: "Rapidez del servicio",
    food: "Calidad de la comida",
    value: "Relación calidad-precio",
    vsMarket: "vs media competencia",
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
    sectionAnalysis: "Análisis",
    sectionAccount: "Cuenta",
    sectionRestaurant: "Restaurante",
    accountEmail: "Correo",
    subscription: "Suscripción",
    subscriptionSoon: "Próximamente",
    restaurantLocked: "Restaurante bloqueado",
    oneRestaurantPolicy:
      "Cada cuenta queda vinculada a un único restaurante.",
    coverUploadCta: "Elegir foto o logo desde mi dispositivo",
    coverUploading: "Subiendo imagen…",
    coverUploadHint:
      "JPG, PNG o WebP · máximo 4 MB. Se verá en tu resumen y en Ajustes.",
    coverUploadSuccess: "Imagen actualizada correctamente.",
  },
  reputation: {
    title: "Centro de reputación",
    subtitle: "Reseñas oficiales de Google. Tú apruebas cada respuesta.",
    connectHint:
      "Conecta tu perfil de Google Business para importar reseñas y responder con la API oficial.",
    connectBody:
      "Autoriza con tu cuenta de Google. Solo verás los locales donde eres propietario o gestor.",
    pickLocation: "Elige el restaurante que quieres gestionar con ComentarIA.",
    lockWarning:
      "Al vincular un local, quedará asociado a tu cuenta. Para cambiarlo, contacta con soporte.",
    alreadyLinked: "Este restaurante está vinculado a tu cuenta.",
    brandVoiceTitle: "Voz del restaurante",
    brandVoiceBody:
      "ComentarIA adapta el tono de tus respuestas a tu estilo.",
    errors: {
      noLocations:
        "No encontramos locales asociados a esta cuenta de Google.",
      denied: "No se completó la autorización con Google.",
      linkFailed: "No se pudo vincular el restaurante.",
      notConfigured:
        "La conexión con Google Business aún no está activa en este entorno. El equipo debe configurar las variables de servidor.",
    },
  },
  nav: {
    summary: "Resumen",
    reputationCenter: "Centro de reputación",
    resenas: "Reseñas",
    replies: "Respuestas",
    mirror: "Informe espejo",
    weeklyPlan: "Qué hacer esta semana",
    briefing: "Briefing",
    consultant: "Consultor",
    competition: "Competencia",
    evolution: "Evolución",
    brandVoice: "Voz del restaurante",
    settings: "Ajustes",
    more: "Más",
    /** @deprecated usar summary */
    insights: "Resumen",
    espejo: "Informe espejo",
    audio: "Briefing",
    chat: "Consultor",
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
