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
import {
  JwtPayload,
  TokenResponse,
  GoogleProfile,
  FacebookProfile,
} from '../common/interfaces';
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
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async googleLogin(profile: GoogleProfile | User): Promise<TokenResponse> {
    // If already a User entity, just generate tokens
    if ('id' in profile && profile.id) {
      return this.generateTokens(profile);
    }

    const googleProfile = profile as GoogleProfile;
    let user: User | null = await this.userRepository.findOne({
      where: { googleId: googleProfile.googleId },
    });

    if (!user) {
      const existingUser = await this.userRepository.findOne({
        where: { email: googleProfile.email },
      });

      if (existingUser) {
        existingUser.googleId = googleProfile.googleId;
        existingUser.avatar = googleProfile.avatar;
        user = await this.userRepository.save(existingUser);
      } else {
        const newUser = this.userRepository.create({
          email: googleProfile.email,
          firstName: googleProfile.firstName,
          lastName: googleProfile.lastName,
          googleId: googleProfile.googleId,
          avatar: googleProfile.avatar,
          role: UserRole.USER,
        });
        user = await this.userRepository.save(newUser);
      }
    }

    if (!user) {
      throw new UnauthorizedException('Failed to authenticate with Google');
    }

    return this.generateTokens(user);
  }

  async facebookLogin(profile: FacebookProfile | User): Promise<TokenResponse> {
    // If already a User entity, just generate tokens
    if ('id' in profile && profile.id) {
      return this.generateTokens(profile);
    }

    const facebookProfile = profile as FacebookProfile;
    let user: User | null = await this.userRepository.findOne({
      where: { facebookId: facebookProfile.facebookId },
    });

    if (!user) {
      const existingUser = facebookProfile.email
        ? await this.userRepository.findOne({
            where: { email: facebookProfile.email },
          })
        : null;

      if (existingUser) {
        existingUser.facebookId = facebookProfile.facebookId;
        if (facebookProfile.avatar) {
          existingUser.avatar = facebookProfile.avatar;
        }
        user = await this.userRepository.save(existingUser);
      } else {
        const newUser = this.userRepository.create({
          email:
            facebookProfile.email ||
            `facebook_${facebookProfile.facebookId}@temp.com`,
          firstName: facebookProfile.firstName,
          lastName: facebookProfile.lastName,
          facebookId: facebookProfile.facebookId,
          avatar: facebookProfile.avatar,
          role: UserRole.USER,
        });
        user = await this.userRepository.save(newUser);
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
