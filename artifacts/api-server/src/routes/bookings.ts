import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, bookingsTable } from "@workspace/db";
import {
  ListBookingsResponse,
  GetBookingResponse,
  CreateBookingBody,
  UpdateBookingStatusBody,
  GetBookingParams,
  UpdateBookingStatusParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/bookings", async (req, res): Promise<void> => {
  const { tenantId, propertyId, status } = req.query;

  const conditions = [];
  if (tenantId) conditions.push(eq(bookingsTable.tenantId, Number(tenantId)));
  if (propertyId) conditions.push(eq(bookingsTable.propertyId, Number(propertyId)));
  if (status && typeof status === "string") conditions.push(eq(bookingsTable.status, status));

  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(bookingsTable.createdAt);

  res.json(ListBookingsResponse.parse(bookings));
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [booking] = await db.insert(bookingsTable).values({
    ...parsed.data,
    checkIn: new Date(parsed.data.checkIn),
    checkOut: new Date(parsed.data.checkOut),
  }).returning();
  res.status(201).json(GetBookingResponse.parse(booking));
});

router.get("/bookings/:id", async (req, res): Promise<void> => {
  const params = GetBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.data.id));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(GetBookingResponse.parse(booking));
});

router.patch("/bookings/:id/status", async (req, res): Promise<void> => {
  const params = UpdateBookingStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [booking] = await db
    .update(bookingsTable)
    .set({ status: parsed.data.status })
    .where(eq(bookingsTable.id, params.data.id))
    .returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(GetBookingResponse.parse(booking));
});

export default router;
