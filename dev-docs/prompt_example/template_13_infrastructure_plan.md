# 🏗️ PROMPT DE PLANIFICACIÓN DE INFRAESTRUCTURA - [Nombre del Proyecto/Tarea]

**ID de Plan:** INFRA-[YYYYMMDD]-[PROYECTO]
**Fecha:** [YYYY-MM-DD]
**Scope:** [Descripción del alcance, ej: "Configuración de pipeline de CI/CD para el servicio X", "Creación de entorno de staging en AWS"]
**Responsable(s):** [Nombre/Equipo de DevOps/Infraestructura]
**Duración Estimada:** [X días/horas]

---

## 1. Objetivos y Contexto

### Objetivo Principal
[Describe el objetivo final de esta tarea de infraestructura. ¿Qué se busca lograr? Ej: "Automatizar el despliegue del servicio `api-gateway` al entorno de producción cada vez que se mergea a la rama `main`."]

### Contexto del Negocio/Técnico
[¿Por qué es necesaria esta tarea? ¿Qué problema resuelve? Ej: "Actualmente, los despliegues son manuales, lentos y propensos a errores, retrasando la entrega de valor y causando downtime."]

### Requisitos Clave
- **R1: [Seguridad]** [ej: "El pipeline no debe contener secretos en texto plano."]
- **R2: [Rendimiento]** [ej: "El despliegue completo debe tardar menos de 10 minutos."]
- **R3: [Fiabilidad]** [ej: "El pipeline debe incluir un paso de rollback automático si los tests fallan."]
- **R4: [Costo]** [ej: "La nueva infraestructura no debe superar los $100/mes."]

---

## 2. Arquitectura de la Solución

### Diagrama de Arquitectura (Opcional)
[Incluir un diagrama simple (ASCII o enlace a una imagen) que muestre los componentes y sus interacciones. Ej: GitHub -> AWS CodePipeline -> CodeBuild -> ECS Fargate]

### Componentes y Tecnologías
- **[Componente 1, ej: Proveedor Cloud]:** [AWS/GCP/Azure]
- **[Componente 2, ej: CI/CD]:** [GitHub Actions/Jenkins/GitLab CI]
- **[Componente 3, ej: Infra como Código (IaC)]:** [Terraform/CloudFormation/Pulumi]
- **[Componente 4, ej: Contenedores]:** [Docker, ECS, Kubernetes]
- **[Componente 5, ej: Monitoreo]:** [Datadog/Prometheus/CloudWatch]

### Flujo del Proceso
[Describe el flujo paso a paso. Ej:
1. Un desarrollador hace push a una rama de feature.
2. Se ejecuta un pipeline de CI que corre linters, tests unitarios y construye una imagen de Docker.
3. Al crear un Pull Request, se despliega a un entorno de preview.
4. Al mergear a `main`, se despliega a producción.]

---

## 3. Plan de Implementación Detallado

### Fase 1: [Configuración del Entorno Base (IaC)]
- [ ] Tarea 1.1: [Escribir los scripts de Terraform para crear la VPC, subnets y security groups.]
- [ ] Tarea 1.2: [Crear el clúster de ECS y el repositorio de ECR.]
- [ ] Tarea 1.3: [Validar y aplicar los cambios de Terraform en el entorno de staging.]

### Fase 2: [Creación del Pipeline de CI/CD]
- [ ] Tarea 2.1: [Definir el workflow de GitHub Actions (`deploy.yml`).]
- [ ] Tarea 2.2: [Crear el `Dockerfile` para la aplicación.]
- [ ] Tarea 2.3: [Añadir los pasos de build, test y push de la imagen a ECR.]
- [ ] Tarea 2.4: [Implementar el paso de despliegue a ECS Fargate.]

### Fase 3: [Seguridad y Monitoreo]
- [ ] Tarea 3.1: [Configurar la gestión de secretos usando AWS Secrets Manager.]
- [ ] Tarea 3.2: [Crear un dashboard en Datadog para monitorear el servicio desplegado.]
- [ ] Tarea 3.3: [Implementar alertas en CloudWatch para picos de CPU o errores 5xx.]

---

## 4. Plan de Verificación y Rollback

### Criterios de Aceptación (Definition of Done)
- [ ] El pipeline se ejecuta exitosamente de principio a fin.
- [ ] Un cambio en el código se ve reflejado en el entorno de staging en menos de 15 minutos.
- [ ] Los health checks del servicio en el entorno de producción pasan después del despliegue.
- [ ] Las métricas de la aplicación son visibles en el dashboard de monitoreo.
- [ ] No hay secretos expuestos en el pipeline.

### Estrategia de Rollback
[Describe el plan para revertir los cambios si algo sale mal. Ej:
- **Rollback del Despliegue:** "Se revertirá el servicio de ECS a la `task definition` anterior estable."
- **Rollback de Infraestructura (IaC):** "Se ejecutarán los comandos `terraform plan` y `terraform apply` sobre el commit anterior de la configuración de Terraform."]

---

## 5. Riesgos y Consideraciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Downtime durante el primer despliegue** | Media | Alto | [Implementar una estrategia de despliegue Blue/Green para una transición sin interrupciones.] |
| **Costos inesperados en la nube** | Baja | Medio | [Configurar alertas de presupuesto (Billing Alerts) en AWS para notificar si los costos superan el umbral.] |
| **Pipeline "flaky" o inestable** | Media | Medio | [Realizar múltiples ejecuciones de prueba del pipeline antes de hacerlo mandatorio para los desarrolladores.] |

---
**FIN DEL PLAN DE INFRAESTRUCTURA**
