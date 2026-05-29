import { Router, type IRouter } from "express";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db, propertiesTable } from "@workspace/db";
import {
  ListPropertiesResponse,
  GetPropertyResponse,
  CreatePropertyBody,
  UpdatePropertyBody,
  GetPropertyParams,
  UpdatePropertyParams,
  DeletePropertyParams,
} from "@workspace/api-zod";
import { serializeDates } from "../lib/serialize";

const router: IRouter = Router();

router.get("/properties", async (req, res): Promise<void> => {
  const { city, type, minPrice, maxPrice, guests } = req.query;

  const conditions = [];
  if (city && typeof city === "string") {
    conditions.push(eq(propertiesTable.city, city));
  }
  if (type && typeof type === "string") {
    conditions.push(eq(propertiesTable.type, type));
  }
  if (minPrice) {
    conditions.push(gte(propertiesTable.pricePerNight, String(minPrice)));
  }
  if (maxPrice) {
    conditions.push(lte(propertiesTable.pricePerNight, String(maxPrice)));
  }
  if (guests) {
    conditions.push(gte(propertiesTable.maxGuests, Number(guests)));
  }
  conditions.push(eq(propertiesTable.isActive, true));

  const properties = await db
    .select()
    .from(propertiesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${propertiesTable.createdAt} desc`);

  res.json(ListPropertiesResponse.parse(serializeDates(properties)));
});

router.post("/properties", async (req, res): Promise<void> => {
  const parsed = CreatePropertyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [property] = await db.insert(propertiesTable).values(parsed.data).returning();
  res.status(201).json(GetPropertyResponse.parse(serializeDates(property)));
});

router.get("/properties/:id", async (req, res): Promise<void> => {
  const params = GetPropertyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, params.data.id));
  if (!property) {
    res.status(404).json({ error: "Property not found" });
    return;
  }
  res.json(GetPropertyResponse.parse(serializeDates(property)));
});

router.patch("/properties/:id", async (req, res): Promise<void> => {
  const params = UpdatePropertyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePropertyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [property] = await db
    .update(propertiesTable)
    .set(parsed.data)
    .where(eq(propertiesTable.id, params.data.id))
    .returning();
  if (!property) {
    res.status(404).json({ error: "Property not found" });
    return;
  }
  res.json(GetPropertyResponse.parse(serializeDates(property)));
});

router.delete("/properties/:id", async (req, res): Promise<void> => {
  const params = DeletePropertyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [property] = await db
    .delete(propertiesTable)
    .where(eq(propertiesTable.id, params.data.id))
    .returning();
  if (!property) {
    res.status(404).json({ error: "Property not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
