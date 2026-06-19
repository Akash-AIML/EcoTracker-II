import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProvider } from '../hooks/useUser';
import CalculatorPage from '../pages/CalculatorPage';
import { assessmentService } from '../services/assessmentService';
import { userService } from '../services/userService';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/assessmentService', () => ({
  assessmentService: {
    create: vi.fn(),
  },
}));

vi.mock('../services/userService', () => ({
  userService: {
    createOrFind: vi.fn(),
  },
}));

describe('Calculator to Dashboard Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('completes the 4-step carbon footprint calculation and redirects to dashboard', async () => {
    userService.createOrFind.mockResolvedValue({
      id: 'mock-user-id',
      name: 'Anonymous',
      email: 'mock-user-id@ecoguide.ai',
    });

    assessmentService.create.mockResolvedValue({
      id: 'mock-assessment-id',
      userId: 'mock-user-id',
      totalEmission: 4200,
      sustainabilityScore: 78,
    });

    render(
      <UserProvider>
        <CalculatorPage />
      </UserProvider>
    );

    // ── STEP 1: Transport ──
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();

    // Fill in transport inputs
    const fuelSelect = screen.getByLabelText(/vehicle fuel type/i);
    fireEvent.change(fuelSelect, { target: { value: 'petrol' } });

    const carDistance = screen.getByLabelText(/daily car distance/i);
    fireEvent.change(carDistance, { target: { value: '15' } });

    const publicTransport = screen.getByLabelText(/public transport distance/i);
    fireEvent.change(publicTransport, { target: { value: '20' } });

    const shortFlights = screen.getByLabelText(/short-haul flights per year/i);
    fireEvent.change(shortFlights, { target: { value: '2' } });

    const longFlights = screen.getByLabelText(/long-haul flights per year/i);
    fireEvent.change(longFlights, { target: { value: '1' } });

    // Click Next
    const nextBtn = screen.getByRole('button', { name: /go to next step/i });
    fireEvent.click(nextBtn);

    // ── STEP 2: Energy ──
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    });

    const electricityInput = screen.getByLabelText(/monthly electricity usage/i);
    fireEvent.change(electricityInput, { target: { value: '250' } });

    const renewableInput = screen.getByLabelText(/renewable energy/i);
    fireEvent.change(renewableInput, { target: { value: '10' } });

    // Click Next
    fireEvent.click(screen.getByRole('button', { name: /go to next step/i }));

    // ── STEP 3: Food ──
    await waitFor(() => {
      expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
    });

    // DietType selection: click Vegan button
    const veganRadioBtn = screen.getByRole('radio', { name: /vegan/i });
    fireEvent.click(veganRadioBtn);

    // Click Next
    fireEvent.click(screen.getByRole('button', { name: /go to next step/i }));

    // ── STEP 4: Shopping ──
    await waitFor(() => {
      expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
    });

    const clothingInput = screen.getByLabelText(/new clothing items per year/i);
    fireEvent.change(clothingInput, { target: { value: '10' } });

    const electronicsInput = screen.getByLabelText(/new electronic devices per year/i);
    fireEvent.change(electronicsInput, { target: { value: '1' } });

    // Click Calculate
    const calcBtn = screen.getByRole('button', { name: /calculate my carbon footprint/i });
    fireEvent.click(calcBtn);

    // Wait for submission and redirection
    await waitFor(() => {
      expect(userService.createOrFind).toHaveBeenCalled();
      expect(assessmentService.create).toHaveBeenCalledWith({
        userId: 'mock-user-id',
        dailyCarKm: 15,
        carFuelType: 'petrol',
        publicTransportKmPerWeek: 20,
        cyclingKmPerWeek: 0,
        shortFlightsPerYear: 2,
        longFlightsPerYear: 1,
        monthlyElectricityKwh: 250,
        renewablePercentage: 10,
        dietType: 'vegan',
        clothingItemsPerYear: 10,
        electronicsItemsPerYear: 1,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/mock-assessment-id');
    });
  });
});
