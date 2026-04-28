/**
 * Unit tests for SpeakerButton / useNarration
 * Validates: Requirements 12.4
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { SpeakerButton } from '../components/SpeakerButton';

describe('SpeakerButton', () => {
  afterEach(() => {
    // Restore any stubs after each test
    vi.unstubAllGlobals();
  });

  it('renders nothing when window.speechSynthesis is undefined', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    const { container } = render(<SpeakerButton text="Hello" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the speaker icon button when window.speechSynthesis is defined', () => {
    const mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn(() => []),
      pending: false,
      speaking: false,
      paused: false,
    };
    vi.stubGlobal('speechSynthesis', mockSpeechSynthesis);

    render(<SpeakerButton text="How is your weather today?" />);

    const button = screen.getByRole('button', { name: 'Read aloud' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('🔊');
  });
});
