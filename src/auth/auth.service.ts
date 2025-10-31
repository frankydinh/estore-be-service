import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload, TokenResponse } from '../common/interfaces';
import { UserRole } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<TokenResponse> {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: UserRole.USER,
    });

    await this.userRepository.save(user);

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<TokenResponse> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is disabled');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async googleLogin(profile: any): Promise<TokenResponse> {
    let user: User | null = await this.userRepository.findOne({
      where: { googleId: profile.googleId },
    });

    if (!user) {
      const existingUser = await this.userRepository.findOne({
        where: { email: profile.email },
      });

      if (existingUser) {
        existingUser.googleId = profile.googleId;
        existingUser.avatar = profile.avatar;
        const savedUser = await this.userRepository.save(existingUser);
        user = Array.isArray(savedUser) ? savedUser[0] : savedUser;
      } else {
        const newUser = this.userRepository.create({
          ...profile,
          role: UserRole.USER,
        });
        const savedUser = await this.userRepository.save(newUser);
        user = Array.isArray(savedUser) ? savedUser[0] : savedUser;
      }
    }

    if (!user) {
      throw new UnauthorizedException('Failed to authenticate with Google');
    }

    return this.generateTokens(user);
  }

  async facebookLogin(profile: any): Promise<TokenResponse> {
    let user: User | null = await this.userRepository.findOne({
      where: { facebookId: profile.facebookId },
    });

    if (!user) {
      const existingUser = await this.userRepository.findOne({
        where: { email: profile.email },
      });

      if (existingUser) {
        existingUser.facebookId = profile.facebookId;
        existingUser.avatar = profile.avatar;
        const savedUser = await this.userRepository.save(existingUser);
        user = Array.isArray(savedUser) ? savedUser[0] : savedUser;
      } else {
        const newUser = this.userRepository.create({
          ...profile,
          role: UserRole.USER,
        });
        const savedUser = await this.userRepository.save(newUser);
        user = Array.isArray(savedUser) ? savedUser[0] : savedUser;
      }
    }

    if (!user) {
      throw new UnauthorizedException('Failed to authenticate with Facebook');
    }

    return this.generateTokens(user);
  }

  async logout(userId: number): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: undefined });
  }

  private async generateTokens(user: User): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
    });

    await this.userRepository.update(user.id, { refreshToken });

    return { accessToken, refreshToken };
  }
}
