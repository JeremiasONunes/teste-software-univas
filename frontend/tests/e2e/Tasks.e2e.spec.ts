import { test, expect } from '@playwright/test'

test.describe('Tarefas', () => {
  
  test('navega para Tarefas e lista itens do backend', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Tarefas/i }).click()
    await expect(page.getByRole('heading', { name: /Tarefas/i })).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
    await expect(page.getByRole('button', { name: /Adicionar Tarefa/i })).toBeVisible()
  });

  test('cria tarefa e aparece na lista', async ({ page }) => {
    await page.goto('/tasks')
    await page.getByRole('button', { name: /Adicionar Tarefa/i }).click()
    await expect(page.locator('#task-title')).toBeVisible()
    
    const uniqueTitle = `Tarefa ${Date.now()}`
    await page.locator('#task-title').fill(uniqueTitle)
    await page.locator('#task-description').fill('Descrição da tarefa E2E')
    await page.locator('#task-status').selectOption('PENDING')
    await page.locator('#task-priority').selectOption('MEDIUM')
    await page.locator('#task-user').selectOption({ index: 1 })
    await page.locator('#task-category').selectOption({ index: 1 })
    await page.getByRole('button', { name: /Criar/i }).click()
    
    await expect(page.getByText(uniqueTitle)).toBeVisible()
  });

  test('atualiza tarefa', async ({ page }) => {
    await page.goto('/tasks')
    // Primeiro criar uma tarefa para editar
    await page.getByRole('button', { name: /Adicionar Tarefa/i }).click()
    await expect(page.locator('#task-title')).toBeVisible()
    
    const originalTitle = `Original ${Date.now()}`
    await page.locator('#task-title').fill(originalTitle)
    await page.locator('#task-description').fill('Descrição original')
    await page.locator('#task-status').selectOption('PENDING')
    await page.locator('#task-priority').selectOption('LOW')
    await page.locator('#task-user').selectOption({ index: 1 })
    await page.locator('#task-category').selectOption({ index: 1 })
    await page.getByRole('button', { name: /Criar/i }).click()
    await expect(page.getByText(originalTitle)).toBeVisible()
    
    // Agora editar
    await page.getByRole('button', { name: /Editar/i }).last().click()
    await expect(page.locator('#task-title')).toBeVisible()
    
    const updatedTitle = `Atualizada ${Date.now()}`
    await page.locator('#task-title').fill(updatedTitle)
    await page.locator('#task-status').selectOption('IN_PROGRESS')
    await page.getByRole('button', { name: /Atualizar/i }).click()
    
    await expect(page.getByText(updatedTitle)).toBeVisible()
  });

  test('exclui tarefa', async ({ page }) => {
    // Mockar window.confirm para sempre retornar true
    await page.addInitScript(() => {
      window.confirm = () => true
    })
    
    await page.goto('/tasks')
    const uniqueTitle = `Delete ${Date.now()}`
    
    // Criar tarefa para excluir
    await page.getByRole('button', { name: /Adicionar Tarefa/i }).click()
    await expect(page.locator('#task-title')).toBeVisible()
    
    await page.locator('#task-title').fill(uniqueTitle)
    await page.locator('#task-description').fill('Para excluir')
    await page.locator('#task-status').selectOption('PENDING')
    await page.locator('#task-priority').selectOption('LOW')
    await page.locator('#task-user').selectOption({ index: 1 })
    await page.locator('#task-category').selectOption({ index: 1 })
    await page.getByRole('button', { name: /Criar/i }).click()
    await expect(page.getByText(uniqueTitle)).toBeVisible()
    
    // Excluir tarefa
    await page.getByRole('button', { name: /Excluir/i }).last().click()
    await page.waitForResponse(response => response.url().includes('/tasks/') && response.request().method() === 'DELETE')
    const titleLocator = page.getByText(uniqueTitle)
    await titleLocator.waitFor({ state: 'detached', timeout: 5000 })
    await expect(titleLocator).toHaveCount(0)
  });


});