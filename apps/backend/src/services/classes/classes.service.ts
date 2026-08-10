import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ClassesRepository,
  Class,
} from '../../repositories/classes/classes.repository';
import { EnrollmentsRepository } from '../../repositories/enrollments/enrollments.repository';
import { UsersRepository } from '../../repositories/users/users.repository';
import { isUniqueViolation } from '../../database/database.types';

interface ClassInput {
  name: string;
  code: string;
}

@Injectable()
export class ClassesService {
  constructor(
    private readonly classesRepository: ClassesRepository,
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(lecturerId: string, data: ClassInput): Promise<Class> {
    try {
      return await this.classesRepository.insert({ ...data, lecturerId });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('A class with that code already exists');
      }
      throw error;
    }
  }

  // Lecturers see classes they teach; students see classes they're enrolled in.
  async listForCurrentUser(userId: string): Promise<Class[]> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new UnauthorizedException('Session user no longer exists');

    return user.role === 'lecturer'
      ? this.classesRepository.findByLecturer(userId)
      : this.classesRepository.findByStudent(userId);
  }

  async update(
    lecturerId: string,
    classId: string,
    patch: Partial<ClassInput>,
  ): Promise<Class> {
    const existing = await this.getOwnedClass(lecturerId, classId);
    const updated = await this.classesRepository.update(existing.id, patch);
    return updated!;
  }

  async enrollStudent(
    lecturerId: string,
    classId: string,
    studentRegNumber: string,
  ): Promise<void> {
    await this.getOwnedClass(lecturerId, classId);

    const student =
      await this.usersRepository.findByIdentifier(studentRegNumber);
    if (!student || student.role !== 'student') {
      throw new NotFoundException('No student found with that regNumber');
    }

    const existingEnrollment =
      await this.enrollmentsRepository.findByStudentAndClass(
        student.id,
        classId,
      );
    if (existingEnrollment) {
      throw new ConflictException('Student is already enrolled in this class');
    }

    await this.enrollmentsRepository.insert({
      studentId: student.id,
      classId,
    });
  }

  private async getOwnedClass(
    lecturerId: string,
    classId: string,
  ): Promise<Class> {
    const klass = await this.classesRepository.findById(classId);
    if (!klass) throw new NotFoundException('Class not found');
    if (klass.lecturerId !== lecturerId) {
      throw new ForbiddenException("You don't own this class");
    }
    return klass;
  }
}
