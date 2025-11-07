import { describe, it, afterAll, beforeEach, expect } from 'vitest'
import request from 'supertest'
import app, { prisma as appPrisma } from '../../src/index'
import { prisma, resetDb, seedMinimal } from './testDb'

describe('Tasks API', () => {
  afterAll(async () => {
    await prisma.$disconnect()
    await appPrisma.$disconnect()
  })
  
  beforeEach(async () => {
    await resetDb()
  })
  
  it('POST /api/tasks cria tarefa válida', async () => {
    const user = await prisma.user.create({ data: { name: 'User1', email: 'user1@test.com' } })
    const category = await prisma.category.create({ data: { name: 'Cat1' } })
    const res = await request(app)
      .post('/api/tasks')
      .send({ 
        title: 'Nova Tarefa', 
        description: 'Descrição',
        userId: user.id,
        categoryId: category.id
      })
    expect(res.status).toBe(201)
    expect(res.body.data.title).toBe('Nova Tarefa')
  })
  
  it('GET /api/tasks lista tarefas', async () => {
    const res = await request(app).get('/api/tasks')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })
  
  it('GET /api/tasks/:id busca tarefa por ID', async () => {
    const user = await prisma.user.create({ data: { name: 'User3', email: 'user3@test.com' } })
    const category = await prisma.category.create({ data: { name: 'Cat3' } })
    const task = await prisma.task.create({
      data: { 
        title: 'Tarefa Específica', 
        userId: user.id, 
        categoryId: category.id 
      }
    })
    const res = await request(app).get(`/api/tasks/${task.id}`)
    expect(res.status).toBe(200)
    expect(res.body.data.title).toBe('Tarefa Específica')
  })
  
  it('PUT /api/tasks/:id atualiza tarefa', async () => {
    const { user, category } = await seedMinimal()
    const task = await prisma.task.create({
      data: { 
        title: 'Tarefa Original', 
        userId: user.id, 
        categoryId: category.id 
      }
    })
    const res = await request(app)
      .put(`/api/tasks/${task.id}`)
      .send({ 
        title: 'Tarefa Atualizada',
        status: 'COMPLETED'
      })
    expect(res.status).toBe(200)
    expect(res.body.data.title).toBe('Tarefa Atualizada')
    expect(res.body.data.status).toBe('COMPLETED')
  })
  
  it('DELETE /api/tasks/:id exclui tarefa', async () => {
    const { user, category } = await seedMinimal()
    const task = await prisma.task.create({
      data: { 
        title: 'Tarefa Para Excluir', 
        userId: user.id, 
        categoryId: category.id 
      }
    })
    const res = await request(app).delete(`/api/tasks/${task.id}`)
    expect(res.status).toBe(200)
    
    const deletedTask = await prisma.task.findUnique({ where: { id: task.id } })
    expect(deletedTask).toBeNull()
  })
})