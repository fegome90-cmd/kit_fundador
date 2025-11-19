import request from 'supertest';
import { InMemoryUserAccountRepository } from '../../../src/infrastructure/_stubs/InMemoryUserAccountRepository';
import { HttpServer } from '../../../src/infrastructure/http/server';

describe('User Registration API Contract', () => {
  let repository: InMemoryUserAccountRepository;
  let server: HttpServer;

  beforeEach(async () => {
    repository.clear(); // ← ESTADO LIMPIO ANTES DE CADA TEST
    server = new HttpServer();
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
  });

  const baseURL = 'http://localhost:3000';
