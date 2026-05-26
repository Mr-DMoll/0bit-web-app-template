import { Request, Response } from "express";
import { prisma } from "@repo/database";

export const getHealth = async (req: Request, res: Response) => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: "UP", 
      database: "CONNECTED", 
      timestamp: new Date().toISOString() 
    });
  } catch (e) {
    res.status(500).json({ status: "DOWN", database: "ERROR" });
  }
};