import { Router } from "express";
import express from "express";
import { Webhook } from "svix";
import User from "../Models/user.model.js"; // Adjust path if necessary

const router = Router();

// Notice we use express.raw() here! This is required for Svix security verification.
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error("You need a CLERK_WEBHOOK_SECRET in your .env");
    }

    // Get the headers and body from the Clerk request
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res
        .status(400)
        .json({ error: "Error occurred -- no svix headers" });
    }

    const payload = req.body;
    const body = payload.toString("utf8");
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    // Verify the payload is actually from Clerk
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Error verifying webhook:", err.message);
      return res.status(400).json({ error: "Error verifying" });
    }

    const eventType = evt.type;

    // Listen for the "user.created" event
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const email = email_addresses[0]?.email_address;
      const name =
        `${first_name || ""} ${last_name || ""}`.trim() || "Developer";

      try {
        // Save the new user into MongoDB!
        await User.create({
          _id: id,
          email: email,
          name: name,
          avatar: image_url,
        });
        console.log(`✅ Successfully synced Clerk User ${id} to MongoDB`);
      } catch (error) {
        console.error("❌ Error saving user to DB:", error);
        return res.status(500).json({ error: "Error saving user to DB" });
      }
    }

    return res.status(200).json({ success: true });
  },
);

export default router;
