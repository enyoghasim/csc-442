import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import {
  UsersRepository,
  User,
} from '../../repositories/users/users.repository';

describe('AuthService', () => {
  let usersRepository: jest.Mocked<UsersRepository>;
  let service: AuthService;

  const user: User = {
    id: 'user-1',
    role: 'student',
    name: 'Jane Doe',
    email: null,
    regNumber: '2019/1/12345CS',
    passwordHash: bcrypt.hashSync('correct-password', 1),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    usersRepository = {
      findByIdentifier: jest.fn(),
      findById: jest.fn(),
      insert: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;
    service = new AuthService(usersRepository);
  });

  describe('login', () => {
    it('returns the user when the identifier and password match', async () => {
      usersRepository.findByIdentifier.mockResolvedValue(user);

      const result = await service.login('2019/1/12345CS', 'correct-password');

      expect(result).toBe(user);
    });

    it('throws Unauthorized for an unknown identifier', async () => {
      usersRepository.findByIdentifier.mockResolvedValue(undefined);

      await expect(service.login('nobody', 'whatever')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws Unauthorized for a wrong password', async () => {
      usersRepository.findByIdentifier.mockResolvedValue(user);

      await expect(
        service.login('2019/1/12345CS', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getById', () => {
    it('returns the user when found', async () => {
      usersRepository.findById.mockResolvedValue(user);

      await expect(service.getById('user-1')).resolves.toBe(user);
    });

    it('throws Unauthorized when the session user no longer exists', async () => {
      usersRepository.findById.mockResolvedValue(undefined);

      await expect(service.getById('gone')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
