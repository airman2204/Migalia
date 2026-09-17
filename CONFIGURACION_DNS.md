# Guía de Configuración DNS: migaliabakery.com (Vercel + Zoho Mail)

Esta guía contiene la configuración exacta de DNS que debes agregar en el panel de tu registrador de dominio (GoDaddy, Namecheap, Cloudflare, Hostinger, Squarespace, etc.) para que funcionen simultáneamente:
1. Tu aplicación web en **migaliabakery.com** (y **www.migaliabakery.com**).
2. Tu correo corporativo gratuito en **Zoho Mail** (@migaliabakery.com).

---

## 1. Registros para la Web (Vercel)

En la sección de gestión de **DNS** de tu proveedor de dominio, añade o edita los siguientes dos registros:

| Tipo | Host / Nombre | Valor / Destino | TTL | Función |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (o déjalo en blanco según el proveedor) | `76.76.21.21` | Automático / 3600 | Apunta tu dominio principal a Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com` | Automático / 3600 | Redirige www.migaliabakery.com a la app |

> **En el panel de Vercel:**
> 1. Ve a tu proyecto -> **Settings** -> **Domains**.
> 2. Añade `migaliabakery.com` (Vercel te sugerirá automáticamente redirigir `www` al principal o viceversa; selecciona la opción recomendada).
> 3. En unos minutos aparecerá con el check verde de verificado y certificado SSL (HTTPS) activo.

---

## 2. Registros para el Correo Corporativo (Zoho Mail)

Para que tú y tu socia puedan enviar y recibir correos desde `@migaliabakery.com`, añade estos registros en la misma zona DNS:

### A) Verificación de Dominio (Elige el código que te dio Zoho)
| Tipo | Host / Nombre | Valor / Destino | TTL |
| :--- | :--- | :--- | :--- |
| **TXT** | `@` | `zoho-verification=zbXXXXXXXX.zmverify.zoho.com` *(reemplaza con tu código de Zoho)* | 3600 |

---

### B) Servidores de Correo MX (Recepción de correos)
Añade estos **3 registros MX**:

| Tipo | Host / Nombre | Valor / Servidor de Correo | Prioridad | TTL |
| :--- | :--- | :--- | :--- | :--- |
| **MX** | `@` | `mx.zoho.com` | `10` | 3600 |
| **MX** | `@` | `mx2.zoho.com` | `20` | 3600 |
| **MX** | `@` | `mx3.zoho.com` | `50` | 3600 |

*(Nota: Si ya tenías otros registros MX antiguos de otro servicio, bórralos para que no interfieran).*

---

### C) Autenticación SPF y DKIM (Para que tus correos no caigan en SPAM)

**Registro SPF (TXT):**
| Tipo | Host / Nombre | Valor / Texto | TTL |
| :--- | :--- | :--- | :--- |
| **TXT** | `@` | `v=spf1 include:zoho.com ~all` | 3600 |

**Registro DKIM (TXT):**
*En el panel de control de Zoho Mail (Mail Settings -> Domain -> DKIM), Zoho te generará una clave de firma única (ej. selector `zoho`).*
| Tipo | Host / Nombre | Valor / Texto | TTL |
| :--- | :--- | :--- | :--- |
| **TXT** | `zoho._domainkey` | *El valor largo que te entrega Zoho en su panel* | 3600 |

---

## Resumen de la Zona DNS Completa

Cuando termines, tu tabla de DNS en tu proveedor se verá así de ordenada:

- `A` -> `@` -> `76.76.21.21` (Web Vercel)
- `CNAME` -> `www` -> `cname.vercel-dns.com` (Web Vercel)
- `MX` -> `@` -> `mx.zoho.com` (Prioridad 10)
- `MX` -> `@` -> `mx2.zoho.com` (Prioridad 20)
- `MX` -> `@` -> `mx3.zoho.com` (Prioridad 50)
- `TXT` -> `@` -> `v=spf1 include:zoho.com ~all` (Seguridad Zoho SPF)
- `TXT` -> `zoho._domainkey` -> `k=rsa; p=...` (Seguridad Zoho DKIM)
