import { test, expect } from '@playwright/test'

test.describe('Categorias', () => {
  
  test('navega para Categorias e lista itens do backend', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Categorias/i }).click()
    await expect(page.getByRole('heading', { name: /Categorias/i })).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
    await expect(page.getByRole('button', { name: /Adicionar Categoria/i })).toBeVisible()
  });

  test('cria categoria e aparece na lista', async ({ page }) => {
    await page.goto('/categories')
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click()
    
    // Aguarda o formulário aparecer
    await page.locator('#category-name').waitFor({ state: 'visible', timeout: 10000 })
    
    const uniqueName = `Categoria ${Date.now()}`
    await page.locator('#category-name').fill(uniqueName)
    await page.locator('#category-description').fill('Descrição da categoria E2E')
    await page.getByRole('button', { name: /Criar/i }).click()
    
    await expect(page.getByText(uniqueName)).toBeVisible()
  });

  test('atualiza categoria', async ({ page }) => {
    await page.goto('/categories')
  
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click()
    await expect(page.locator('#category-name')).toBeVisible()
    
    const originalName = `Original ${Date.now()}`
    await page.locator('#category-name').fill(originalName)
    await page.getByRole('button', { name: /Criar/i }).click()
    await expect(page.getByText(originalName)).toBeVisible()
    

    await page.getByRole('button', { name: /Editar/i }).last().click()
    await expect(page.locator('#category-name')).toBeVisible()
    
    const updatedName = `Atualizada ${Date.now()}`
    await page.locator('#category-name').fill(updatedName)
    await page.getByRole('button', { name: /Atualizar/i }).click()
    
    await expect(page.getByText(updatedName)).toBeVisible()
  });

  test('exclui categoria', async ({ page }) => {

    await page.addInitScript(() => {
      window.confirm = () => true
    })
    
    await page.goto('/categories')
    const uniqueName = `Delete ${Date.now()}`
    

    await page.getByRole('button', { name: /Adicionar Categoria/i }).click()
    await expect(page.locator('#category-name')).toBeVisible()
    
    await page.locator('#category-name').fill(uniqueName)
    await page.locator('#category-description').fill('Para excluir')
    await page.getByRole('button', { name: /Criar/i }).click()
    await expect(page.getByText(uniqueName)).toBeVisible()
    

    const row = page.locator('table tbody tr', { hasText: uniqueName })
    await expect(row).toBeVisible()
    await row.getByRole('button', { name: /Excluir/i }).click()

    await page.waitForResponse(response => response.url().includes('/categories/') && response.request().method() === 'DELETE')
    try {
      await page.waitForResponse(response => response.url().includes('/categories') && response.request().method() === 'GET', { timeout: 5000 })
    } catch (e) {
    }
    await expect(row).toHaveCount(0)
  });
});