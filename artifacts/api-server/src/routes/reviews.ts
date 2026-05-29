import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, reviewsTable, propertiesTable } from "@workspace/db";
import {
  ListReviewsResponse,
  ListReviewsResponseItem,
  CreateReviewBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reviews", async (req, res): Promise<void> => {
  const { propertyId } = req.query;

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(propertyId ? eq(reviewsTable.propertyId, Number(propertyId)) : undefined)
    .orderBy(reviewsTable.createdAt);

  res.json(ListReviewsResponse.parse(reviews));
});

router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [review] = await db.insert(reviewsTable).values(parsed.data).returning();

  const allReviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.propertyId, parsed.data.propertyId));

  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await db
    .update(propertiesTable)
    .set({ rating: avg.toFixed(2), reviewCount: allReviews.length })
    .where(eq(propertiesTable.id, parsed.data.propertyId));

  res.status(201).json(ListReviewsResponseItem.parse(review));
});

export default router;
