# Kit Fundador LEGO

Las dos plantillas Fastify constituyen el **MVP distribuible**. Ninguna necesita autenticación, base de datos, colas ni un generador propio. Instrucciones: [LEGO-MVP.md](LEGO-MVP.md).

El [roadmap LEGO](LEGO-ROADMAP.md) reúne la visión original, las decisiones del MVP y los hitos posteriores a la PR #84. La planificación histórica de `dev-docs/plan.md` y `.context/` no debe interpretarse como el estado actual de LEGO.

## Estructura y límites

- `templates/fastify-core/`: API TypeScript autónoma, health, errores y tests.
- `templates/fastify-openapi/`: mismo core con documentación opt-in.
- `addons/db-postgres/`, `addons/auth-better-auth/` y `addons/jobs-valkey/`: piezas opt-in integradas para laboratorio, fuera de la distribución MVP y sin aprobación de producción.
- `examples/identity-access/`: **demostración independiente** del registro público, con Express, bcrypt y repositorio temporal en memoria.
- `src/`: servidor Express histórico, ahora **solo health**, sin registro ni Swagger montados.
- `dev-docs/`: investigación y prototipos experimentales, no aprobados para producción.

El ejemplo de Identity & Access se instala, compila y prueba fuera del repositorio raíz. Lee [su documentación](examples/identity-access/README.md) antes de probarlo. El registro público nunca puede elegir roles: asigna exclusivamente `user`.

No publiques el ejemplo como servicio real: no implementa login/sesiones, recuperación de cuentas, persistencia duradera, autorización por recursos, rate limiting ni las medidas operativas de un proveedor de identidad.

## Verificación del proyecto raíz

```sh
npm ci
npm run lint
npm run type-check
npm test
npm run build
```

`GET /health` sigue funcionando. `POST /api/users/register` y `GET /api-docs` deben devolver 404 en la aplicación raíz. Las pruebas de regresión de cuentas apuntan al ejemplo separado.

Los prototipos PostgreSQL/Better Auth/BullMQ y el instalador transaccional del laboratorio permanecen fuera del MVP.
