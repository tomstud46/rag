import { User } from '../types';
import bcrypt from 'bcryptjs';
import { jwtDecode } from 'jwt-decode';


const AUTH_COOKIE_NAME = 'techcorp_session';
const USER_STORE_NAME = 'auth_user_data';
const USERS_DB = 'mock_users_registry';

interface RegisteredUser extends User {
  passwordHash?: string;
}
interface GoogleTokenPayload {
  email: string;
  name: string;
  sub: string;
  picture?: string;
}


class ApiService {
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getStoredUsers(): RegisteredUser[] {
    const users = localStorage.getItem(USERS_DB);
    return users ? JSON.parse(users) : [];
  }

  private saveUserToDB(user: RegisteredUser) {
    const users = this.getStoredUsers();
    users.push(user);
    localStorage.setItem(USERS_DB, JSON.stringify(users));
  }

  private setCookie(name: string, value: string, days: number = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  private deleteCookie(name: string) {
    document.cookie = name + '=; Max-Age=-99999999;path=/;';
  }

  // ------------------------------
  // Email / Password Login
  // ------------------------------
  async login(email: string, password?: string): Promise<User> {
    await this.delay(800);
    if (!password) throw new Error("PASSWORD_REQUIRED");

    const users = this.getStoredUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!existingUser) throw new Error("ACCOUNT_NOT_FOUND");
    if (existingUser.provider !== 'email') throw new Error("INVALID_LOGIN_METHOD");

    const isValid = await bcrypt.compare(password, existingUser.passwordHash || '');
    if (!isValid) throw new Error("INVALID_CREDENTIALS");

    this.saveSession(existingUser);
    return existingUser;
  }

  // ------------------------------
  // Email / Password Registration
  // ------------------------------
  async register(username: string, email: string, password?: string): Promise<User> {
    await this.delay(1000);
    if (!password) throw new Error("PASSWORD_REQUIRED");

    const users = this.getStoredUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("ACCOUNT_ALREADY_EXISTS");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: RegisteredUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      username,
      email: email.toLowerCase(),
      role: 'admin',
      provider: 'email',
      passwordHash
    };

    this.saveUserToDB(newUser);
    this.saveSession(newUser);
    return newUser;
  }

 async googleLogin(credential: string): Promise<User> {
  await this.delay(800);

  if (!credential) throw new Error("INVALID_GOOGLE_TOKEN");

  let payload: GoogleTokenPayload;

  try {
    payload = jwtDecode<GoogleTokenPayload>(credential);
  } catch {
    throw new Error("INVALID_GOOGLE_TOKEN");
  }

  const email = payload.email.toLowerCase();
  const users = this.getStoredUsers();

  let user = users.find(u => u.email.toLowerCase() === email);

  if (!user) {
    user = {
      id: 'goog_' + payload.sub,
      username: payload.name,
      email: email,
      role: 'admin',
      provider: 'google'
    };
    this.saveUserToDB(user);
  }

  this.saveSession(user);
  return user;
}



  // ------------------------------
  // Update Profile
  // ------------------------------
  async updateUserProfile(userId: string, data: { username: string; email: string; avatar?: string }): Promise<User> {
    await this.delay(1000);
    const users = this.getStoredUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error("USER_NOT_FOUND");

    users[index] = { ...users[index], ...data };
    localStorage.setItem(USERS_DB, JSON.stringify(users));

    const updatedUser = users[index];
    localStorage.setItem(USER_STORE_NAME, JSON.stringify(updatedUser));
    return updatedUser;
  }

  // ------------------------------
  // Session Handling
  // ------------------------------
  private saveSession(user: User) {
    const token = `jwt.${btoa(JSON.stringify({ id: user.id, email: user.email }))}.${btoa('signature')}`;
    this.setCookie(AUTH_COOKIE_NAME, token);
    localStorage.setItem(USER_STORE_NAME, JSON.stringify(user));
  }

  async logout() {
    await this.delay(300);
    this.deleteCookie(AUTH_COOKIE_NAME);
    localStorage.removeItem(USER_STORE_NAME);
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getCookie(AUTH_COOKIE_NAME);
    const userJson = localStorage.getItem(USER_STORE_NAME);
    if (!token || !userJson) return null;
    return JSON.parse(userJson);
  }
}

export const apiService = new ApiService();
