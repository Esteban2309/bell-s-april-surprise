import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Index from "../pages/Index";
import { BrowserRouter } from "react-router-dom";

// Mock de componentes y módulos
vi.mock("../components/SpinWheel", () => ({
  default: () => <div data-testid="spin-wheel">Mocked SpinWheel</div>,
}));

vi.mock("../assets/pattern-bg.png", () => ({
  default: "pattern-bg-mock",
}));

describe("Componente Index", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock de fetch global
    global.fetch = vi.fn();
    // Mock de localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        clear: () => {
          store = {};
        },
      };
    })();
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
  });

  it("debe mostrar el estado de carga inicialmente", () => {
    (global.fetch as any).mockReturnValue(new Promise(() => {})); // Nunca resuelve para ver el loading
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Index />
      </BrowserRouter>
    );
    expect(screen.getByText(/Cargando magia.../i)).toBeInTheDocument();
  });

  it("debe renderizar el contenido principal después de cargar", async () => {
    const mockGifts = [
      { id: 1, title: "Regalo 1", message: "Mensaje 1", emoji: "🎁" },
      { id: 2, title: "Regalo 2", message: "Mensaje 2", emoji: "✨" },
    ];
    const mockSpins = [{ gift_id: 1, date: "2026-04-01" }];

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("/gifts")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGifts),
        });
      }
      if (url.includes("/spins")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSpins),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Index />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Cargando magia.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/¡Feliz Abril, Bell!/i)).toBeInTheDocument();
    expect(screen.getByTestId("spin-wheel")).toBeInTheDocument();
  });
});
