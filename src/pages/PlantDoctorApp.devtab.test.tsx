import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PlantDoctorApp from '@/pages/PlantDoctorApp'

describe('Dev tab', () => {
  it('runs storage tests and shows pass/fail', async () => {
    render(<PlantDoctorApp />)

    const devTab = screen.getByRole('button', { name: /dev/i })
    fireEvent.click(devTab)

    const runBtn = screen.getByRole('button', { name: /run storage tests/i })
    fireEvent.click(runBtn)

    expect(await screen.findByText(/Persist small history/i)).toBeTruthy()
  })
})
