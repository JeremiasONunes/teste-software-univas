import { describe, it, afterAll, beforeEach, expect } from 'vitest'
import request from 'supertest'
import app, { prisma as appPrisma } from '../../src/index'
import { prisma, resetDb } from './testDb'

describe('Users API', () => {
  afterAll(async () => {
    await prisma.$disconnect()
    await appPrisma.$disconnect()
  })
  beforeEach(async () => {
    await resetDb()
  })
  it('POST /api/users cria usuário válido', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Ana', email: 'ana1@ex.com' })
    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({ name: 'Ana', email: 'ana1@ex.com' })
  })
  it('GET /api/users lista usuários', async () => {
    await prisma.user.create({ data: { name: 'Ana', email: 'ana2@ex.com' } })
    const res = await request(app).get('/api/users')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.some((u: any) => u.email === 'ana2@ex.com')).toBe(true)
  })
  it('PUT /api/users/:id atualiza usuário', async () => {
    const user = await prisma.user.create({ data: { name: 'Ana', email: 'ana3@ex.com' } })
    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .send({ name: 'Ana Silva', email: 'ana.silvas3@ex.com' })
    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe('Ana Silva')
    expect(res.body.data.email).toBe('ana.silvas3@ex.com')
  })
  it('DELETE /api/users/:id exclui usuário', async () => {
    const user = await prisma.user.create({ data: { name: 'Ana', email: 'ana4@ex.com' } })
    const res = await request(app).delete(`/api/users/${user.id}`)
    expect(res.status).toBe(200)
    
    const deletedUser = await prisma.user.findUnique({ where: { id: user.id } })
    expect(deletedUser).toBeNull()
  })
})