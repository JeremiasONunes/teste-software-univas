import { test, expect } from '@playwright/test'

test.describe('Tarefas', () => {
  // Helpers to select non-default option values and to pick the first valid option
  const selectFirstValidOption = async (page: any, selector: string) => {
    const opts = page.locator(`${selector} option`)
    const count = await opts.count()
    for (let i = 0; i < count; i++) {
      const opt = opts.nth(i)
      const text = (await opt.textContent()) || ''
      const val = await opt.getAttribute('value')
      if (val && !/selecion|selecione/i.test(text) && text.trim() !== '') {
        await page.locator(selector).selectOption(val)
        return
      }
    }
    throw new Error(`No valid option found for selector ${selector}`)
  }
  
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
    // Select the first non-default user and category option to avoid brittle index-based picks
    await selectFirstValidOption(page, '#task-user')
    await selectFirstValidOption(page, '#task-category')

    // Wait for the POST /tasks response when creating the task and surface server errors
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/tasks') && resp.request().method() === 'POST'),
      page.getByRole('button', { name: /Criar/i }).click()
    ])
    const status = response.status()
    const body = await response.json().catch(() => ({}))
    if (status >= 400) {
      throw new Error(`POST /tasks failed with status ${status}: ${JSON.stringify(body)}`)
    }

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
    await selectFirstValidOption(page, '#task-user')
    await selectFirstValidOption(page, '#task-category')
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/tasks') && resp.request().method() === 'POST'),
      page.getByRole('button', { name: /Criar/i }).click()
    ])
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
    await selectFirstValidOption(page, '#task-user')
    await selectFirstValidOption(page, '#task-category')
    const [createResp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/tasks') && resp.request().method() === 'POST'),
      page.getByRole('button', { name: /Criar/i }).click()
    ])
    if (createResp.status() >= 400) {
      const err = await createResp.json().catch(() => ({}))
      throw new Error(`Failed to create task before delete test: ${JSON.stringify(err)}`)
    }
    await expect(page.getByText(uniqueTitle)).toBeVisible()
    
    // Excluir tarefa
    await page.getByRole('button', { name: /Excluir/i }).last().click()
    await page.waitForResponse(response => response.url().includes('/tasks/') && response.request().method() === 'DELETE')
    const titleLocator = page.getByText(uniqueTitle)
    await titleLocator.waitFor({ state: 'detached', timeout: 5000 })
    await expect(titleLocator).toHaveCount(0)
  });


});