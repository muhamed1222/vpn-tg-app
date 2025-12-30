import { render } from '@testing-library/react';
import { Logo } from '../components/Logo';

describe('Logo', () => {
  it('renders svg element', () => {
    const { container } = render(<Logo />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
