import { ApiResponseOptions } from '@nestjs/swagger';

export const SWAGGER_BEARER_AUTH = 'JWT-auth';

export const ApiUnauthorizedResponse: ApiResponseOptions = {
  status: 401,
  description: 'Unauthorized — invalid or missing JWT',
};

export const ApiForbiddenResponse: ApiResponseOptions = {
  status: 403,
  description: 'Forbidden — insufficient role or permissions',
};

export const ApiNotFoundResponse: ApiResponseOptions = {
  status: 404,
  description: 'Resource not found',
};

export const ApiBadRequestResponse: ApiResponseOptions = {
  status: 400,
  description: 'Bad request — validation failed',
};
