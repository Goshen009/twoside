import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { APIError, ProblemDetail } from "#/errors/APIError.js";
import { errorCodes } from "fastify";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {    
    const sendProblemDetails = (pd: ProblemDetail) => {
    	return reply.status(pd.status).send(pd.toJSON())
    }
    
    if (error instanceof ProblemDetail) {
   		return sendProblemDetails(error);
    }

    if (error instanceof errorCodes.FST_ERR_CTP_INVALID_JSON_BODY) {
   		return sendProblemDetails(APIError.custom({
   			status: 400,
     		message: 'Request body contains malformed JSON'
     	}));
    }

    if (hasZodFastifySchemaValidationErrors(error)) {
      const fields = error.validation.map(e => ({
        field: e.instancePath.replace('/', ''),
        message: e.message ?? 'Invalid format'
      }));
      return sendProblemDetails(APIError.validationError(fields));
    }

    // Handle unknown errors
    request.log.error(error);
    return sendProblemDetails(APIError.internalServerError());
  })
}, {
  name: 'error-handler',
  dependencies: ['sensible']
});