import { render, screen, waitFor } from '@testing-library/react'
import Categories from '../../src/components/Categories'
import { server, apiGet, json } from '../setup'
import { HttpResponse } from 'msw'

describe('Categories integration', () => {
  it('renderiza categorias retornadas pela API', async () => {
    server.use(
      apiGet('/categories', () =>
        json({
          data: [
            { 
              id: '1', 
              name: 'Trabalho', 
              description: 'Tarefas do trabalho',
              createdAt: new Date().toISOString(),
              tasks: []
            },
            { 
              id: '2', 
              name: 'Pessoal', 
              description: 'Tarefas pessoais',
              createdAt: new Date().toISOString(),
              tasks: []
            }
          ]
        })
      )
    )

    render(<Categories />)

    await waitFor(() => {
      expect(screen.getByText('Trabalho')).toBeInTheDocument()
      expect(screen.getByText('Tarefas do trabalho')).toBeInTheDocument()
      expect(screen.getByText('Pessoal')).toBeInTheDocument()
      expect(screen.getByText('Tarefas pessoais')).toBeInTheDocument()
    })
  })

  it('exibe mensagem de erro quando API falha', async () => {
    server.use(
      apiGet('/categories', () =>
        HttpResponse.json(
          { error: 'Erro interno do servidor' },
          { status: 500 }
        )
      )
    )

    render(<Categories />)

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar categorias')).toBeInTheDocument()
    })
  })

  it('exibe loading durante carregamento', () => {
    server.use(
      apiGet('/categories', () => new Promise(() => {})) // Never resolves
    )

    render(<Categories />)

    expect(screen.getByText('Carregando categorias...')).toBeInTheDocument()
  })
})