export interface UserProfile {
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  email?: string;
  isEmailVerified?: boolean;
  className?: string;
  location?: string;
  targetExam?: 'WBJEE' | 'NEET';
  isRegistered: boolean;
}

class AuthService {
  // Store registered phone numbers (normalized 10-digit strings)
  private registeredUsers = new Map<string, UserProfile>();
  private currentUser: UserProfile | null = null;
  private isLoggedIn = false;

  constructor() {
    // Seed with a default registered user for seamless testing
    const demoPhone = '9876543210';
    this.registeredUsers.set(demoPhone, {
      firstName: 'Rahul',
      lastName: 'Sharma',
      phoneNumber: demoPhone,
      email: 'rahul.sharma@example.com',
      className: 'Class 10',
      location: 'Kolkata, WB',
      isRegistered: true,
    });
  }

  isUserRegistered(phoneNumber: string): boolean {
    const clean = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    return this.registeredUsers.has(clean);
  }

  getUser(phoneNumber: string): UserProfile | undefined {
    const clean = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    return this.registeredUsers.get(clean);
  }

  registerUser(profile: Omit<UserProfile, 'isRegistered'>): UserProfile {
    const clean = profile.phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    const fullProfile: UserProfile = {
      ...profile,
      phoneNumber: clean,
      isRegistered: true,
    };
    this.registeredUsers.set(clean, fullProfile);
    this.currentUser = fullProfile;
    this.isLoggedIn = true;
    return fullProfile;
  }

  loginWithPhone(phoneNumber: string): boolean {
    const clean = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    const existing = this.registeredUsers.get(clean);
    if (existing) {
      this.currentUser = existing;
      this.isLoggedIn = true;
      return true;
    }
    const newUser: UserProfile = {
      firstName: 'Student',
      lastName: '',
      phoneNumber: clean,
      isRegistered: true,
    };
    this.registeredUsers.set(clean, newUser);
    this.currentUser = newUser;
    this.isLoggedIn = true;
    return true;
  }

  setTargetExam(exam: 'WBJEE' | 'NEET'): void {
    if (this.currentUser) {
      this.currentUser.targetExam = exam;
    }
  }

  logout(): void {
    this.isLoggedIn = false;
    this.currentUser = null;
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  getIsLoggedIn(): boolean {
    return this.isLoggedIn;
  }
}

export const authService = new AuthService();

