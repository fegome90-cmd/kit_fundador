# Identity & Access — ejemplo autónomo

**Demostración educativa opt-in; NO es un servicio de autenticación listo para producción.** Preserva el registro público, el dominio `User/Email/Password` y el repositorio en memoria. No requiere PostgreSQL, Valkey, Docker ni Better Auth.

## Instalación y prueba desde cualquier directorio

Copia **solo esta carpeta** a una ubicación independiente y ejecuta:

```sh
npm ci
npm run typecheck
npm test
PORT=3001 npm start
```

Requisitos: Node.js 24 o posterior y acceso a npm en la instalación. El ejecutable compilado enlaza únicamente a `127.0.0.1` y gestiona `SIGTERM`/`SIGINT`.

```sh
curl -X POST http://127.0.0.1:3001/api/users/register \
  -H 'content-type: application/json' \
  -d '{"email":"example@example.com","name":"Example User","password":"A-Passphrase12345"}'
```

El registro permite exclusivamente `email`, `name` y `password`: ignora intentos internos de cambiar rol y **rechaza** cualquier campo HTTP como `role` o `isAdmin`. Toda cuenta registrada adquiere rol `user`. La documentación OpenAPI es **offline**: `src/infrastructure/docs/api/openapi.yaml` y no se publica Swagger UI.

## Limitaciones

- La persistencia es solo memoria, desaparece al reiniciar y no garantiza unicidad transaccional entre instancias.
- No hay inicio de sesión, sesiones, verificación de correo, control de recursos, multitenancy, bloqueo de ataques ni rate limiting.
- La política de contraseña de 12 caracteres es histórica y **no demuestra cumplimiento de NIST** para aplicaciones de un solo factor.
- Bcrypt aplica un máximo de 72 bytes UTF-8. No emplear este ejemplo con datos reales ni exponerlo a Internet.
- Kit Fundador Fastify Core no importa ni inicia este ejemplo. Las pruebas desde el repositorio raíz siguen verificando sus invariantes usando los archivos trasladados.
