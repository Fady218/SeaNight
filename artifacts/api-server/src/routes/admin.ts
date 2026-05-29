import { Router, type IRouter } from "express";
import { sql, eq } from "drizzle-orm";
import { db, propertiesTable, bookingsTable, usersTable } from "@workspace/db";
import { GetAdminStatsResponse, SeedDataResponse } from "@workspace/api-zod";

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

  const [owner] = await db
    .insert(usersTable)
    .values({ name: "Yalla Masayef", email: "owner@yallamasayef.com", phone: "+20123456789", role: "owner", nationalId: "12345678901234" })
    .returning();

  const [tenant1] = await db
    .insert(usersTable)
    .values({ name: "Ahmed Hassan", email: "ahmed@example.com", phone: "+20101234567", role: "tenant", nationalId: "23456789012345" })
    .returning();

  const [tenant2] = await db
    .insert(usersTable)
    .values({ name: "Sara Mohamed", email: "sara@example.com", phone: "+20109876543", role: "tenant", nationalId: "34567890123456" })
    .returning();

  await db.insert(usersTable).values({ name: "Admin", email: "admin@seanight.com", role: "admin" });

  const propertyData = [
    {
      ownerId: owner.id,
      title: "Luxury Chalet with Sea View",
      description: "Stunning chalet with panoramic sea views in the heart of Ain Sokhna. Fully furnished with private pool and beach access.",
      type: "chalet",
      location: "Ain Sokhna Beach Resort",
      city: "Ain Sokhna",
      pricePerNight: "2500",
      maxGuests: 8,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ["Private Pool", "Beach Access", "WiFi", "Air Conditioning", "BBQ", "Parking", "Sea View"],
      images: [
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      ],
      isVerified: true,
      isActive: true,
    },
    {
      ownerId: owner.id,
      title: "Cozy Beachfront Chalet",
      description: "Perfect family retreat just steps from the beach. Modern amenities with traditional Egyptian charm.",
      type: "chalet",
      location: "Porto Sokhna",
      city: "Ain Sokhna",
      pricePerNight: "1800",
      maxGuests: 6,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ["Beach Access", "WiFi", "Air Conditioning", "Kitchen", "Smart TV"],
      images: [
        "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      ],
      isVerified: true,
      isActive: true,
    },
    {
      ownerId: owner.id,
      title: "Premium Yacht Experience",
      description: "Sail the Red Sea on this luxurious 42-foot yacht. Includes captain, crew, and catering for an unforgettable experience.",
      type: "yacht",
      location: "Hurghada Marina",
      city: "Hurghada",
      pricePerNight: "8500",
      maxGuests: 10,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ["Captain & Crew", "Catering", "Snorkeling Gear", "AC Cabins", "Sundeck", "Sea View"],
      images: [
        "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800",
        "https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?w=800",
      ],
      isVerified: true,
      isActive: true,
    },
    {
      ownerId: owner.id,
      title: "El Gouna Waterfront Villa",
      description: "Spectacular villa in El Gouna's exclusive lagoon district. Private dock, infinity pool, and stunning canal views.",
      type: "chalet",
      location: "El Gouna Lagoons",
      city: "El Gouna",
      pricePerNight: "5500",
      maxGuests: 10,
      bedrooms: 4,
      bathrooms: 3,
      amenities: ["Private Dock", "Infinity Pool", "Canal View", "WiFi", "Air Conditioning", "BBQ", "Chef Service"],
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
        "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800",
      ],
      isVerified: true,
      isActive: true,
    },
    {
      ownerId: owner.id,
      title: "North Coast Summer Escape",
      description: "Beautiful chalet in the famous North Coast strip. Walking distance from the beach with all modern amenities.",
      type: "chalet",
      location: "Marassi North Coast",
      city: "North Coast",
      pricePerNight: "3200",
      maxGuests: 8,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ["Beach Access", "Community Pool", "WiFi", "Air Conditioning", "Gym", "Supermarket Nearby"],
      images: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      ],
      isVerified: false,
      isActive: true,
    },
    {
      ownerId: owner.id,
      title: "Sharm El Sheikh Boutique Hotel Room",
      description: "Luxurious room in a boutique hotel with direct Red Sea access. Ideal for diving and snorkeling enthusiasts.",
      type: "hotel",
      location: "Naama Bay",
      city: "Sharm El Sheikh",
      pricePerNight: "1200",
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ["Direct Sea Access", "Dive Center", "Restaurant", "WiFi", "Room Service", "Sea View"],
      images: [
        "https://images.unsplash.com/photo-1540541338537-1220059af4dc?w=800",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      ],
      isVerified: true,
      isActive: true,
    },
  ];

  const insertedProperties = await db.insert(propertiesTable).values(propertyData).returning();

  const checkInDate = new Date();
  checkInDate.setDate(checkInDate.getDate() + 7);
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + 3);

  const checkInDate2 = new Date();
  checkInDate2.setDate(checkInDate2.getDate() - 5);
  const checkOutDate2 = new Date(checkInDate2);
  checkOutDate2.setDate(checkOutDate2.getDate() + 4);

  await db.insert(bookingsTable).values([
    {
      propertyId: insertedProperties[0].id,
      tenantId: tenant1.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: 4,
      totalAmount: "7500",
      platformFee: "750",
      ownerAmount: "6750",
      status: "confirmed",
      paymentMethod: "fawry",
    },
    {
      propertyId: insertedProperties[2].id,
      tenantId: tenant2.id,
      checkIn: checkInDate2,
      checkOut: checkOutDate2,
      guests: 6,
      totalAmount: "34000",
      platformFee: "3400",
      ownerAmount: "30600",
      status: "completed",
      paymentMethod: "instapay",
    },
    {
      propertyId: insertedProperties[1].id,
      tenantId: tenant1.id,
      checkIn: new Date(),
      checkOut: checkOutDate,
      guests: 2,
      totalAmount: "5400",
      platformFee: "540",
      ownerAmount: "4860",
      status: "pending",
      paymentMethod: "fawry",
    },
  ]);

  res.json(SeedDataResponse.parse({ message: "Demo data seeded successfully" }));
});

export default router;
