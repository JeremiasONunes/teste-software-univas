import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Create MSW server
export const server = setupServer()

// Helper functions for API mocking
export const apiGet = (path: string, resolver: any) => 
  http.get(`http://localhost:3001/api${path}`, resolver)

export const apiPost = (path: string, resolver: any) => 
  http.post(`http://localhost:3001/api${path}`, resolver)

export const json = (data: any) => HttpResponse.json(data)

// Setup MSW
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())