import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '../Header'

describe('Header mobile menu', () => {
  test('toggles mobile menu via burger button', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const toggle = screen.getByRole('button', { name: /toggle navigation/i })
    const mobileMenu = document.querySelector('.mobile-menu') as HTMLElement

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(mobileMenu.className).not.toMatch(/mobile-menu-open/)

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(mobileMenu.className).toMatch(/mobile-menu-open/)

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(mobileMenu.className).not.toMatch(/mobile-menu-open/)
  })

  test('clicking a mobile menu link closes the menu', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const toggle = screen.getByRole('button', { name: /toggle navigation/i })
    await user.click(toggle)

    const mobileMenu = document.querySelector('.mobile-menu') as HTMLElement
    const homeLink = mobileMenu.querySelector('a.nav-link.active') as HTMLAnchorElement
    await user.click(homeLink)

    expect(mobileMenu.className).not.toMatch(/mobile-menu-open/)

    // Re-open and click Über link
    await user.click(toggle)
    const aboutLink = mobileMenu.querySelector('a.nav-link.text-light[href="#about"]') as HTMLAnchorElement
    await user.click(aboutLink)
    expect(mobileMenu.className).not.toMatch(/mobile-menu-open/)

    // Re-open and click Kontakt link
    await user.click(toggle)
    const contactLink = mobileMenu.querySelector('a.nav-link.text-light[href^="mailto:"]') as HTMLAnchorElement
    await user.click(contactLink)
    expect(mobileMenu.className).not.toMatch(/mobile-menu-open/)
  })
})
