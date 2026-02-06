# DermoCare - Configuración de Producción

## 🔐 Configuración de Supabase Auth

Para que la autenticación funcionen en producción (Vercel), debes configurar las siguientes opciones en el Dashboard de Supabase:

### 1. URLs de Redirección Permitidas

Ve a: **Supabase Dashboard → Authentication → URL Configuration**

Añade las siguientes URLs en **"Redirect URLs"**:

```
https://dermo-care.vercel.app/**
http://localhost:3000/**
```

### 2. Email Templates (Opcional)

Ve a: **Supabase Dashboard → Authentication → Email Templates**

Puedes personalizar los templates de email para:
- **Confirm signup**: Email de confirmación de registro
- **Magic Link**: Email para login sin contraseña
- **Reset Password**: Email para recuperar contraseña

### 3. Variables de Entorno en Vercel

Ve a: **Vercel Dashboard → DermoCare → Settings → Environment Variables**

Añade las siguientes variables:

| Nombre | Valor |
|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zsnvuykprzwzthslxvzp.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_IgepI-F4PgSpsrEcTuD3Cw_3SGaAxRx` |
| `NEXT_PUBLIC_APP_URL` | `https://dermo-care.vercel.app` |

## 📧 Flujo de Autenticación

### Registro de Pacientes
1. Paciente visita `/auth`
2. Selecciona "Paciente" y busca su farmacia
3. Completa el formulario
4. Recibe email de confirmación
5. Click en el link → redirigido a `/auth/callback`
6. Automáticamente logueado y redirigido a `/patient/dashboard`

### Registro de Profesionales
1. Profesional visita `/auth`
2. Selecciona "Profesional"
3. Introduce el nombre de su farmacia/organización
4. Recibe email de confirmación
5. Click en el link → redirigido a `/auth/callback`
6. Automáticamente logueado y redirigido a `/doctor/dashboard`

### Sistema de Invitaciones
Los profesionales pueden invitar pacientes:
1. Profesional genera un link de invitación
2. Paciente recibe el link y se registra
3. El paciente queda automáticamente asociado a la organización

## 🔒 Middleware de Autenticación

El archivo `src/middleware.ts` protege las rutas:

- **Rutas públicas**: `/`, `/auth`, `/auth/callback`, `/auth/pending`
- **Rutas de paciente**: `/patient/*` - Solo accesible por rol `patient`
- **Rutas de doctor**: `/doctor/*` - Solo accesible por rol `pro`

## 💬 Chat en Tiempo Real

El chat usa Supabase Realtime:
- Los mensajes se guardan en la tabla `chat_messages`
- Realtime está habilitado para notificaciones instantáneas
- Los mensajes se sincronizan entre doctor y paciente

## 📱 Storage de Fotos

Las fotos de progreso se guardan en:
- **Bucket**: `progress-photos`
- **Permisos**: Lectura pública, escritura autenticada

## ⚠️ Notas Importantes

1. **RLS Desactivado para Demo**: Algunas tablas tienen Row Level Security desactivado para facilitar el desarrollo. En producción, habilitar RLS con políticas apropiadas.

2. **Email de Supabase**: Por defecto, Supabase usa su propio servidor SMTP. Para producción, configura un servicio como SendGrid, Resend, o Mailgun.

3. **Dominio Personalizado**: Si usas un dominio personalizado, actualiza las variables de entorno y las URLs de redirección.
