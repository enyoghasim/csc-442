import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { UserRole } from '@attendance/shared';
import { ClassesService } from '../services/classes/classes.service';
import { successResponse } from '../common/utils/response-factory';
import {
  CreateClassRequest,
  EnrollStudentRequest,
  PatchClassRequest,
} from '../dtos/classes.dto';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CreateClassDocs,
  EnrollAllStudentsDocs,
  EnrollStudentDocs,
  ListClassesDocs,
  UpdateClassDocs,
} from '../common/api-docs/classes.docs';

@ApiTags('classes')
@Controller('classes')
@UseGuards(SessionAuthGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @ListClassesDocs()
  async list(@Req() request: Request) {
    const classes = await this.classesService.listForCurrentUser(
      request.currentUserId!,
    );
    return successResponse(classes);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.Lecturer)
  @CreateClassDocs()
  async create(@Req() request: Request, @Body() body: CreateClassRequest) {
    const created = await this.classesService.create(
      request.currentUserId!,
      body,
    );
    return successResponse(created);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Lecturer)
  @UpdateClassDocs()
  async update(
    @Req() request: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: PatchClassRequest,
  ) {
    const updated = await this.classesService.update(
      request.currentUserId!,
      id,
      body,
    );
    return successResponse(updated);
  }

  @Post(':id/enrollments')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.Lecturer)
  @EnrollStudentDocs()
  async enroll(
    @Req() request: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: EnrollStudentRequest,
  ) {
    await this.classesService.enrollStudent(
      request.currentUserId!,
      id,
      body.regNumber,
    );
    return successResponse(null);
  }

  // "Allow everyone" — enrolls every seeded student not already in the class, instead of adding
  // them one regNumber at a time via the route above.
  @Post(':id/enrollments/all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.Lecturer)
  @EnrollAllStudentsDocs()
  async enrollAll(
    @Req() request: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const result = await this.classesService.enrollAllStudents(
      request.currentUserId!,
      id,
    );
    return successResponse(result);
  }
}
