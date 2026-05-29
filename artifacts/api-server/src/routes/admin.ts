import { Router, type IRouter } from "express";
import { sql, eq } from "drizzle-orm";
import { db, propertiesTable, bookingsTable, usersTable } from "@workspace/db";
import { GetAdminStatsResponse, SeedDataResponse } from "@workspace/api-zod";
import { seedIfEmpty } from "../lib/seed";

const router: IRouter = Router();

router.get("/admin/stats", async (req, res): Promise<void> => {
  const [propCount] = await db.select({ count: sql<number>`count(*)::int` }).from(propertiesTable);
  const [bookingCount] = await db.select({ count: sql<number>`count(*)::int` }).from(bookingsTable);
  const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);

  const [revenueResult] = await db
    .select({ total: sql<string>`coalesce(sum(platform_fee::numeric), 0)::text` })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "completed"));

  const [pendingCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "pending"));

  const [activeCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "confirmed"));

  const [completedCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "completed"));

  res.json(
    GetAdminStatsResponse.parse({
      totalProperties: propCount?.count ?? 0,
      totalBookings: bookingCount?.count ?? 0,
      totalUsers: userCount?.count ?? 0,
      totalRevenue: revenueResult?.total ?? "0",
      pendingBookings: pendingCount?.count ?? 0,
      activeBookings: activeCount?.count ?? 0,
      completedBookings: completedCount?.count ?? 0,
    })
  );
});

router.post("/admin/seed", async (req, res): Promise<void> => {
  const existingUsers = await db.select().from(usersTable).limit(1);
  if (existingUsers.length > 0) {
    res.json(SeedDataResponse.parse({ message: "Data already seeded" }));
    return;
  }

  await seedIfEmpty();
  res.json(SeedDataResponse.parse({ message: "Demo data seeded successfully" }));
});


export default router;
