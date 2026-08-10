import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import {
  ClassesRepository,
  Class,
} from '../../repositories/classes/classes.repository';
import { EnrollmentsRepository } from '../../repositories/enrollments/enrollments.repository';
import {
  UsersRepository,
  User,
} from '../../repositories/users/users.repository';

describe('ClassesService', () => {
  let classesRepository: jest.Mocked<ClassesRepository>;
  let enrollmentsRepository: jest.Mocked<EnrollmentsRepository>;
  let usersRepository: jest.Mocked<UsersRepository>;
  let service: ClassesService;

  const lecturerId = 'lecturer-1';
  const klass: Class = {
    id: 'class-1',
    name: 'Software Engineering',
    code: 'CSC 422',
    lecturerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    classesRepository = {
      findById: jest.fn(),
      findByLecturer: jest.fn(),
      findByStudent: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ClassesRepository>;
    enrollmentsRepository = {
      findByStudentAndClass: jest.fn(),
      insert: jest.fn(),
      findByClassWithStudents: jest.fn(),
    } as unknown as jest.Mocked<EnrollmentsRepository>;
    usersRepository = {
      findById: jest.fn(),
      findByIdentifier: jest.fn(),
      insert: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;
    service = new ClassesService(
      classesRepository,
      enrollmentsRepository,
      usersRepository,
    );
  });

  describe('create', () => {
    it('inserts the class under the requesting lecturer', async () => {
      classesRepository.insert.mockResolvedValue(klass);

      const result = await service.create(lecturerId, {
        name: 'Software Engineering',
        code: 'CSC 422',
      });

      expect(result).toBe(klass);
      expect(classesRepository.insert).toHaveBeenCalledWith({
        name: 'Software Engineering',
        code: 'CSC 422',
        lecturerId,
      });
    });

    it('translates a unique-code violation into a 409', async () => {
      classesRepository.insert.mockRejectedValue({ code: '23505' });

      await expect(
        service.create(lecturerId, { name: 'Dup', code: 'CSC 422' }),
      ).rejects.toThrow(ConflictException);
    });

    it('rethrows unrelated errors', async () => {
      classesRepository.insert.mockRejectedValue(new Error('connection lost'));

      await expect(
        service.create(lecturerId, { name: 'X', code: 'Y' }),
      ).rejects.toThrow('connection lost');
    });
  });

  describe('listForCurrentUser', () => {
    it('lists taught classes for a lecturer', async () => {
      const lecturer = { role: 'lecturer' } as User;
      usersRepository.findById.mockResolvedValue(lecturer);
      classesRepository.findByLecturer.mockResolvedValue([klass]);

      const result = await service.listForCurrentUser(lecturerId);

      expect(result).toEqual([klass]);
      expect(classesRepository.findByLecturer).toHaveBeenCalledWith(lecturerId);
      expect(classesRepository.findByStudent).not.toHaveBeenCalled();
    });

    it('lists enrolled classes for a student', async () => {
      const student = { role: 'student' } as User;
      usersRepository.findById.mockResolvedValue(student);
      classesRepository.findByStudent.mockResolvedValue([klass]);

      const result = await service.listForCurrentUser('student-1');

      expect(result).toEqual([klass]);
      expect(classesRepository.findByStudent).toHaveBeenCalledWith('student-1');
    });

    it('throws Unauthorized when the session user no longer exists', async () => {
      usersRepository.findById.mockResolvedValue(undefined);

      await expect(service.listForCurrentUser('gone')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('update', () => {
    it('updates a class the lecturer owns', async () => {
      classesRepository.findById.mockResolvedValue(klass);
      const updated = { ...klass, name: 'New Name' };
      classesRepository.update.mockResolvedValue(updated);

      const result = await service.update(lecturerId, klass.id, {
        name: 'New Name',
      });

      expect(result).toBe(updated);
    });

    it('throws NotFound when the class does not exist', async () => {
      classesRepository.findById.mockResolvedValue(undefined);

      await expect(
        service.update(lecturerId, 'missing', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws Forbidden when the lecturer doesn't own the class", async () => {
      classesRepository.findById.mockResolvedValue(klass);

      await expect(
        service.update('someone-else', klass.id, { name: 'X' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('enrollStudent', () => {
    const student: User = {
      id: 'student-1',
      role: 'student',
      name: 'Jane Doe',
      email: null,
      regNumber: '2019/1/12345CS',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('enrolls a student not already enrolled', async () => {
      classesRepository.findById.mockResolvedValue(klass);
      usersRepository.findByIdentifier.mockResolvedValue(student);
      enrollmentsRepository.findByStudentAndClass.mockResolvedValue(undefined);

      await service.enrollStudent(lecturerId, klass.id, student.regNumber!);

      expect(enrollmentsRepository.insert).toHaveBeenCalledWith({
        studentId: student.id,
        classId: klass.id,
      });
    });

    it("throws Forbidden when the lecturer doesn't own the class", async () => {
      classesRepository.findById.mockResolvedValue(klass);

      await expect(
        service.enrollStudent('someone-else', klass.id, '2019/1/12345CS'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFound when the regNumber matches no student', async () => {
      classesRepository.findById.mockResolvedValue(klass);
      usersRepository.findByIdentifier.mockResolvedValue(undefined);

      await expect(
        service.enrollStudent(lecturerId, klass.id, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFound when the identifier resolves to a lecturer, not a student', async () => {
      classesRepository.findById.mockResolvedValue(klass);
      usersRepository.findByIdentifier.mockResolvedValue({
        ...student,
        role: 'lecturer',
      });

      await expect(
        service.enrollStudent(lecturerId, klass.id, 'lecturer@csc422.local'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws Conflict when the student is already enrolled', async () => {
      classesRepository.findById.mockResolvedValue(klass);
      usersRepository.findByIdentifier.mockResolvedValue(student);
      enrollmentsRepository.findByStudentAndClass.mockResolvedValue({
        id: 'enrollment-1',
        studentId: student.id,
        classId: klass.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        service.enrollStudent(lecturerId, klass.id, student.regNumber!),
      ).rejects.toThrow(ConflictException);
    });
  });
});
