export enum UserRole {
  Student = 'student',
  Lecturer = 'lecturer',
}

export enum AttendanceStatus {
  Present = 'present',
  Absent = 'absent',
  Late = 'late',
}

export interface AuthResponse {
  // TODO: define fields (will include the session id for mobile)
}

export interface SessionDTO {
  // TODO: define fields (class session, not auth session)
}

export interface AttendanceRecordDTO {
  // TODO: define fields
}

export interface ClassDTO {
  // TODO: define fields
}
