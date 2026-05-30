import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, bookingsTable, propertiesTable } from "@workspace/db";
import {
  ListBookingsResponse,
  GetBookingResponse,
  CreateBookingBody,
  UpdateBookingStatusBody,
  GetBookingParams,
  UpdateBookingStatusParams,
} from "@workspace/api-zod";
import { serializeDates } from "../lib/serialize";

const SECURITY_DEPOSIT = 2000;
const GUEST_FEE_RATE = 0.03;
const PLATFORM_FEE_RATE = 0.10;
const INSURANCE_RATE = 0.01;

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

  res.json(ListBookingsResponse.parse(serializeDates(bookings)));
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const checkIn = new Date(parsed.data.checkIn);
  const checkOut = new Date(parsed.data.checkOut);

  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

  const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, parsed.data.propertyId));
  if (!property) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  const baseRental = Number(property.pricePerNight) * nights;
  const guestFee = baseRental * GUEST_FEE_RATE;
  const rentalSubtotal = baseRental + guestFee;
  const insurancePremium = baseRental * INSURANCE_RATE;
  const platformFee = rentalSubtotal * PLATFORM_FEE_RATE;
  const ownerAmount = rentalSubtotal - platformFee;
  const totalAmount = rentalSubtotal + SECURITY_DEPOSIT;

  const [booking] = await db.insert(bookingsTable).values({
    propertyId: parsed.data.propertyId,
    tenantId: parsed.data.tenantId,
    brokerId: parsed.data.brokerId ?? null,
    checkIn,
    checkOut,
    guests: parsed.data.guests,
    paymentMethod: parsed.data.paymentMethod ?? "fawry",
    notes: parsed.data.notes ?? null,
    totalAmount: totalAmount.toFixed(2),
    platformFee: platformFee.toFixed(2),
    ownerAmount: ownerAmount.toFixed(2),
    securityDeposit: SECURITY_DEPOSIT.toFixed(2),
    securityDepositStatus: "held",
    insurancePremium: insurancePremium.toFixed(2),
  }).returning();
  res.status(201).json(GetBookingResponse.parse(serializeDates(booking)));
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
  res.json(GetBookingResponse.parse(serializeDates(booking)));
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
  res.json(GetBookingResponse.parse(serializeDates(booking)));
});

router.patch("/bookings/:id/deposit", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    res.status(400).json({ error: "Invalid booking id" });
    return;
  }
  const { securityDepositStatus } = req.body as { securityDepositStatus?: string; reason?: string };
  const validStatuses = ["held", "refunded", "deducted"];
  if (!securityDepositStatus || !validStatuses.includes(securityDepositStatus)) {
    res.status(400).json({ error: `securityDepositStatus must be one of: ${validStatuses.join(", ")}` });
    return;
  }
  const [booking] = await db
    .update(bookingsTable)
    .set({ securityDepositStatus })
    .where(eq(bookingsTable.id, id))
    .returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(GetBookingResponse.parse(serializeDates(booking)));
});

export default router;
