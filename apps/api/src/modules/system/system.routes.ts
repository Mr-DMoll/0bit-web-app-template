import { Router } from "express";
import { getHealth } from "./system.controller.js";

const router: Router = Router();


/**
 * @openapi
 * /api/v1/system/health:
 *  get:
 *    tags:
 *      - System
 *    summary: Health Check
 *    responses:
 *      200:
 *        description: Success
 */
router.get("/health", getHealth);
export default router;
