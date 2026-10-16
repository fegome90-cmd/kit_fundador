import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// The pinned Swagger Parser 10 only handles OpenAPI 3.0; parse YAML directly
// rather than incorrectly downgrading the published OpenAPI 3.1 contract.
const yaml = require('js-yaml');

describe('Public registration OpenAPI contract', () => {
  it('documents a nonprivileged request and accurately scoped password rules', async () => {
    const file = join(process.cwd(), 'src/infrastructure/docs/api/openapi.yaml');
    const api = yaml.load(readFileSync(file, 'utf8'));
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
