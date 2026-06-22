import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { HttpStatus } from "@repo/types";

/**
 * REQUEST VALIDATOR
 * Aligned with @audiobookmasters/types ZodSchema.
 * Prevents dirty data from hitting the Identity Core controllers.
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // We parse the body specifically as per your existing logic
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Map Zod issues to a clean, flat object for frontend consumption
        return res.status(HttpStatus.UNPROCESSABLE_CONTENT).json({
          status: "fail",
          message: "Validation failed",
          errors: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      // Safety net for unexpected non-Zod errors
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({
          status: "error",
          message: "Internal server error during validation",
        });
    }
  };
};
