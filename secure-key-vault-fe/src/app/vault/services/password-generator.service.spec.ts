import { TestBed } from '@angular/core/testing';
import { PasswordGeneratorService, PasswordOptions } from './password-generator.service';

describe('PasswordGeneratorService', () => {
  let service: PasswordGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordGeneratorService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should generate a password of the requested length', () => {
    const options: PasswordOptions = { length: 24, uppercase: true, lowercase: true, numbers: true, symbols: false };
    const password = service.generate(options);
    expect(password).toHaveLength(24);
  });

  it('should only use uppercase chars when only uppercase is selected', () => {
    const options: PasswordOptions = { length: 50, uppercase: true, lowercase: false, numbers: false, symbols: false };
    const password = service.generate(options);
    expect(password).toMatch(/^[A-Z]+$/);
  });

  it('should only use digits when only numbers is selected', () => {
    const options: PasswordOptions = { length: 30, uppercase: false, lowercase: false, numbers: true, symbols: false };
    const password = service.generate(options);
    expect(password).toMatch(/^[0-9]+$/);
  });

  it('should fall back to lowercase+numbers when no charset is selected', () => {
    const options: PasswordOptions = { length: 20, uppercase: false, lowercase: false, numbers: false, symbols: false };
    const password = service.generate(options);
    expect(password).toMatch(/^[a-z0-9]+$/);
  });

  describe('calculateStrength', () => {
    it('should return 0 for empty password', () => {
      expect(service.calculateStrength('')).toBe(0);
    });

    it('should return low score for short lowercase-only password', () => {
      expect(service.calculateStrength('abc')).toBe(0);
    });

    it('should return max score (5) for long complex password', () => {
      expect(service.calculateStrength('Abcdef123!@#456GHI')).toBe(5);
    });

    it('should cap score at 5', () => {
      const score = service.calculateStrength('Aa1!Aa1!Aa1!Aa1!Aa1!');
      expect(score).toBeLessThanOrEqual(5);
    });

    it('should increase score for mixed case', () => {
      const lower = service.calculateStrength('abcdefghij');
      const mixed = service.calculateStrength('Abcdefghij');
      expect(mixed).toBeGreaterThan(lower);
    });
  });
});
