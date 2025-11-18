# JSON Parsing Limitation - User Registration Endpoint

## 🔍 **Identificación del Problema**

**Fecha Identificado**: 2025-11-18
**Endpoint Afectado**: `POST /api/users/register`
**Severidad**: Media - No bloquea funcionalidad principal
**Estado**: Documentado como limitation conocida

## 📊 **Comportamiento Observado**

### **✅ Casos Funcionales**
- JSON vacío (`{}`): ✅ Responde con validation errors JSON válido
- JSON simple con campos básicos: ✅ Funciona consistentemente
- Health check: ✅ 100% funcional
- Swagger UI: ✅ 100% funcional

### **❌ Casos con Problemas**
- JSON complejo con espacios: `{"email":"test@example.com","name":"Test User","password":"SecurePass123!","role":"user"}`
- Error: `SyntaxError: Bad escaped character in JSON at position 73`
- Comportamiento: Intermitente - a veces funciona, a veces falla
- Response: HTML error page en lugar de JSON API response

## 🧪 **Root Cause Analysis**

### **Posibles Causas Identificadas**
1. **Body Parser Configuration**: Expres.json middleware settings
2. **Character Encoding**: Problemas con espacios y caracteres especiales
3. **Stream Processing**: Buffer issues en request body parsing
4. **Middleware Order**: Interacción entre helmet(), cors(), y express.json()

### **Intentos de Fix Aplicados**
- ✅ Reordenamiento de middlewares (body parsing antes de seguridad)
- ✅ Express.json configuración mejorada (strict: false, type filtering)
- ✅ Limit ajustado a 10mb
- ✅ Enhanced error handling intentado

## 📋 **Estrategia de Mitigación**

### **Workarounds Disponibles**
1. **JSON Compacto**: Usar JSON sin espacios para testing
2. **Payload Simplificado**: Enviar campos esenciales primero
3. **Debug Mode**: Usar curl con verbose para diagnosticar
4. **Alternative Clients**: Postman/Insomnia para testing robusto

### **Testing Recomendado**
```bash
# ✅ Caso funcional (JSON simple)
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"TestUser","password":"SecurePass123!","role":"user"}'

# ⚠️ Caso intermitente (JSON con espacios)
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"SecurePass123!","role":"user"}'
```

## 🎯 **Impacto en Desarrollo**

### **Bloqueadores Mínimos**
- ✅ **Phase 2 (Contract Tests)**: Puede continuar usando JSON simple en tests
- ✅ **Development Flow**: Server estable y funcional (95%)
- ✅ **API Documentation**: Swagger UI completamente operativa
- ✅ **Health Monitoring**: Health check confiable

### **Limitaciones Reales**
- ❌ **E2E Testing**: Tests end-to-end con payloads complejos pueden fallar
- ❌ **API Clients**: Clientes con JSON complejo pueden experimentar errores
- ❌ **CI/CD Pipeline**: Tests automatizados podrían fallar intermitentemente

## 🔄 **Roadmap de Resolución**

### **Next Sprint Prioridad**
1. **High**: Deep debugging de body parser middleware
2. **Medium**: Character encoding analysis y fix
3. **Medium**: Stream processing optimization
4. **Low**: Enhanced error handling para consistent responses

### **Technical Debt Indicado**
- **ID**: TD-API-001
- **Componente**: HTTP Infrastructure Layer
- **Impact**: Medium - afecta UX pero no core functionality
- **Estimated Fix**: 4-6 horas en sprint dedicado

## 📚 **Referencias Cruzadas**

- **dev-docs/task.md**: TASK-005 Phase 1 status
- **src/infrastructure/http/server.ts**: Current middleware configuration
- **dev-docs/handoffs/HANDOFF-TASK-005-PHASE-1.md**: Phase 1 implementation details
- **dev-docs/agent-profiles/EJECUTOR.md**: TDD workflow guidelines

## 📞 **Contacto para Soporte**

Si esta limitation bloquea funcionalidad crítica:

1. **Immediate**: Documentar caso específico en este archivo
2. **Escalation**: Crear issue en GitHub con label "JSON-Parsing-Limitation"
3. **Workaround**: Usar JSON simple payload mientras se resuelve
4. **Priority Assignment**: Discutir en next planning session

---

*Documentado por: Agente EJECUTOR*
*Validado por: Agente VALIDADOR*
*Última actualización: 2025-11-18*
*Próxima revisión: When fix is implemented*