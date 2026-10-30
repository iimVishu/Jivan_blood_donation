export class ApiError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const SAFE_USER_FIELDS = '-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpires';

export function objectId(value: unknown) {
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value)) {
    throw new ApiError('Invalid ID');
  }
  return value;
}

export function pickFields(body: Record<string, unknown>, fields: string[]) {
  return Object.fromEntries(fields.filter((field) => Object.hasOwn(body, field)).map((field) => [field, body[field]]));
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) return { message: error.message, status: error.status };
  if (error instanceof SyntaxError) return { message: 'Invalid JSON body', status: 400 };
  if (error && typeof error === 'object' && 'name' in error && ['ValidationError', 'CastError'].includes(String(error.name))) {
    return { message: 'Invalid input', status: 400 };
  }
  return { message: 'Internal Server Error', status: 500 };
}

export function canManageBank(user: { id: string; role: string; hospitalId?: unknown; hospitalIds?: unknown[] }, bankId: unknown, admins: unknown[] = []) {
  return user.role === 'admin' || (user.role === 'hospital' && (
    user.hospitalIds?.some((id) => String(id) === String(bankId)) ||
    (user.hospitalId != null && String(user.hospitalId) === String(bankId)) ||
    admins.some((id) => String(id) === user.id)
  ));
}
