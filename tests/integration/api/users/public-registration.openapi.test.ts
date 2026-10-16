import { join } from 'node:path';

// The project's existing Swagger Parser dependency can parse the documented
// contract; this catches schema drift without adding production dependencies.
const SwaggerParser = require('swagger-parser');

describe('Public registration OpenAPI contract', () => {
  it('documents a nonprivileged request and accurately scoped password rules', async () => {
    const file = join(process.cwd(), 'src/infrastructure/docs/api/openapi.yaml');
    const api = await SwaggerParser.parse(file);
    const operation = api.paths['/api/users/register'].post;
    const schema = api.components.schemas.RegisterUserRequest;
    const responseRole = api.components.schemas.RegisterUserResponse.properties.data.properties.role;

    expect(operation.security).toEqual([]);
    expect(schema.additionalProperties).toBe(false);
    expect(Object.keys(schema.properties).sort()).toEqual(['email', 'name', 'password']);
    expect(schema.properties.password.minLength).toBe(12);
    expect(schema.properties.password.maxLength).toBe(72);
    expect(responseRole.enum).toEqual(['user']);
  });
});
