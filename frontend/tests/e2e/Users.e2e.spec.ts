import { test, expect } from '@playwright/test'
test.describe('Usuários', () => {
  
  test('navega para Usuários e lista itens do backend', async ({ page }) => {
    await page.goto('/') // Dashboard
    await page.getByRole('link', { name: 'Usuários' }).click()
    // Título da seção
    await expect(page.getByRole('heading', { name: /Usuários/i })).toBeVisible()
    // Emails semeados (seed do backend)
    await expect(page.getByText(/john.doe@example.com/i)).toBeVisible()
    await expect(page.getByText(/jane.smith@example.com/i)).toBeVisible()
  });

  test('cria usuário e aparece na lista', async ({ page }) => {
    await page.goto('/users')
    await page.getByRole('button', { name: /Adicionar Usuário/i }).click()
    await expect(page.locator('#user-name')).toBeVisible()
    
    const uniqueEmail = `aluno.${Date.now()}@ex.com`
    await page.locator('#user-name').fill('Aluno E2E')
    await page.locator('#user-email').fill(uniqueEmail)
    await page.getByRole('button', { name: /Criar/i }).click()
    
    await expect(page.getByText(uniqueEmail)).toBeVisible()
  });

  test('atualiza usuário', async ({ page }) => {
    await page.goto('/users')
    // Primeiro criar um usuário para editar
    await page.getByRole('button', { name: /Adicionar Usuário/i }).click()
    await expect(page.locator('#user-name')).toBeVisible()
    
    const originalEmail = `original.${Date.now()}@ex.com`
    await page.locator('#user-name').fill('Usuário Original')
    await page.locator('#user-email').fill(originalEmail)
    await page.getByRole('button', { name: /Criar/i }).click()
    await expect(page.getByText(originalEmail)).toBeVisible()
    
    // Agora editar
    await page.getByRole('button', { name: /Editar/i }).last().click()
    await expect(page.locator('#user-name')).toBeVisible()
    
    await page.locator('#user-name').fill('Usuário Atualizado')
    await page.getByRole('button', { name: /Atualizar/i }).click()
    
    await expect(page.getByText('Usuário Atualizado')).toBeVisible()
  });

  test('exclui usuário', async ({ page }) => {
    // Mockar window.confirm para sempre retornar true
    await page.addInitScript(() => {
      window.confirm = () => true
    })
    
    await page.goto('/users')
    const uniqueEmail = `delete.${Date.now()}@ex.com`
    
    // Criar usuário para excluir
    await page.getByRole('button', { name: /Adicionar Usuário/i }).click()
    await expect(page.locator('#user-name')).toBeVisible()
    
    await page.locator('#user-name').fill('Usuário para Excluir')
    await page.locator('#user-email').fill(uniqueEmail)
    await page.getByRole('button', { name: /Criar/i }).click()
    await expect(page.getByText(uniqueEmail)).toBeVisible()
    

    const row = page.locator('table tbody tr', { hasText: uniqueEmail })
    await expect(row).toBeVisible()
    await row.getByRole('button', { name: /Excluir/i }).click()

    await page.waitForResponse(response => response.url().includes('/users/') && response.request().method() === 'DELETE')

    try {
      await page.waitForResponse(response => response.url().includes('/users') && response.request().method() === 'GET', { timeout: 5000 })
    } catch (e) {

    }
    await expect(row).toHaveCount(0)
  });
});