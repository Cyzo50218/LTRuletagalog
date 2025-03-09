// api/notifySimilarListing.js
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");

// Initialize Firebase Admin if not already initialized.
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "givngo-584eb",
            clientEmail: "firebase-adminsdk-4lh4a@givngo-584eb.iam.gserviceaccount.com",
            privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDE9Tn5oocUN7jh\nFzpWq1kuS87SsDtGkNqA6V+5tfB+erYtfTW3/gncJdymI6J4iYD25BEyRzz7l5GF\nMleVPzdAzMKGX3tp+WyJmcX2Ken9uYgKckPKRNRLKg1YM3V49lxW3qYSaj3nq9FZ\nInDDNfVdbWLzG/0Vb9A9WFDx88SszZPF0JRFRl/YWpdm8NcQzQXH6TwwzXdtPZHp\nsbTMWm9IVan2/rQylpSZQhDrK6CV95d9iMgTnPu91Q7VOBKqzNU2Nu3b3tRGbmpr\nlelJcaVDN5QHal62b4VYpaDMZPuuaDZHsDAjTPsIHM2wN7akK1hXisX2q3W/yp0L\nsqC4yzUXAgMBAAECggEASmpjBLxRMCTbkARAMQXdlJ3k33rhcoiBXiqO1fJ1krwX\nf/lqZgGwRQLzKryVAtjlJqNGEgqTcnWycDJ0n/m6DRwwNSf3T7ODPDwi7R6p/4jt\naxEAJvi5g0q4rwYGUPU4L0RBV/zXNeSXnQdjtoX5Flshgzwkc8iC0+K99qTFPwpl\nl1rLbeuaeVytgk2B9i/2spNS2YI4u/gGWhk7WAdQpBMzmsU5zwRyz/gXXimz61kk\nliYzJ4Tv9tNypU5mwh8Xzl9IiSx0VGVnf2Z/hpgj7uwaPhV8Zz4uWwgf3DU2Fxia\n5Qa9jhTihrZysO3UFIBGJcN2rifU+hDCYtXHeKg+LQKBgQDm2EaIw46YvLL/3V2c\n8QHZPD1GkjTEr4E6y0Te+7NzTKV2IhbcI3+jgpiuBVXZKw65tL6vEYy+Nrorql40\n69ZTy9UPLGpBn3iMSbMENY1z/o4UcRV9omdA/ORKRyGnuNBSKx1KpEK78Bfgmugn\nGFvyqJ97057LVDHiKanBavrBGwKBgQDaa6FfAnWXSCkwIXBnX9ZKCpKxTwo8Cpck\nzfwL6MP3h0GaZXZN6A8CNHlex8eqeAtSDK94+rOOAD0OjQK78DpfzMOHjpgYqxFO\nuiykG9m0IPe1W0UPrWEQg14uaI1IQ1+990P1zqniVvyn/HzOwh7XxlxdILPVtuFM\nH80UsCnXtQKBgQDO8Eaax6QHK/HTCSCoVizwDt5nax2+zA4vJJWCx2ShEa6qbfjM\nM05yx9oS9ll1KvIya+MckcD3q5vNFRcKnfguemVvCsPePBUWveKq/U7nEuVPUeiQ\nDYw+Z/ZG1+lFr5mgb2H8za+9RohBItzGX0HeEGeX26dYYwus0OiKqVpMzQKBgQCk\nSTxxiBoGlgJU73Hqb01xF47Kyta53oVc64pfMs7jidqwVQytAJT5ZZq8zavC7tQk\n/OGnL3qKnmdOYIXj8ocVs6CGf5yrQVCdVK9rKH+RWxK2WFYTuqc9knHumjlaV0LW\nUfvOEYn6cs9LU0BVC/HC/rJOYeCiKRJA/dJ1cyOl2QKBgQDBrNYyty1VG3PERhgP\n2FIBuG0nkByfrHOF4NlgDlbhFC2+uGWkXEumrQJeEw/voeYNtaszHgduqUXu1hrR\nZeUU7YyzqdagEFJ73/5h4qQYCWq5jbE1DT+bgkQ9MxCNG2JRMsSwY5bXwzrm8jnC\n1QzdvkfIQ+lM+UwAYtj8kHyXxg==\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
        }),
    });
}


/**
 * This function is triggered via an HTTP POST request with details of a new post.
 * The new post is assumed to be coming from the Firestore path:
 *   ShopNGo/Type/shop/public/users/all/post
 *
 * Expected request body:
 *   - postId: string        // Unique ID of the new post
 *   - title: string         // Title of the new post
 *   - category: string      // Category of the new post
 *   - price: number         // Price of the new post
 *   - sellerId: string      // Seller’s user ID for the new post
 *   - timestamp: (optional) timestamp or numeric value
 *
 * Saved similar listing alerts are stored under:
 *   ShopNGo → document("users") → collection("SimilarListings")
 * Each alert document is expected to include at least:
 *   - userId (the alert owner)
 *   - enabled (boolean)
 *   - category (desired category)
 *   - title (a keyword or fragment to match the post title)
 *   - price (target price to compare)
 *
 * For each matching alert, a notification document is created under:
 *   ShopNGo/Users/Accounts/{alertUserId}/Marketplace/userData/Notifications/AllContents/Alerts/{notificationId}
 * After writing the notification, the function fetches the alert user’s FCM token from
 *   ShopNGo/Users/Accounts/{alertUserId}
 * If a token exists, it sends a push notification via FCM.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Extract new post details from the request body.
    const { postId, title, category, price, sellerId, timestamp } = req.body;
    if (!postId || !title || !category || price === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Use the provided timestamp or default to a server-generated timestamp.
    const postTimestamp = timestamp || admin.firestore.FieldValue.serverTimestamp();

    // Prepare lowercase values for case-insensitive matching.
    const newListingTitleLower = title.toLowerCase();
    const newListingCategoryLower = category.toLowerCase();

    // 3. Query all saved similar listing alerts.
    const alertsSnapshot = await admin.firestore()
      .collection("ShopNGo")
      .doc("users")
      .collection("SimilarListings")
      .get();

    let notificationsCreated = 0;

    // 4. Iterate over each saved alert document.
    for (const doc of alertsSnapshot.docs) {
      const alertData = doc.data();

      // Only process if this alert is enabled.
      if (!alertData.enabled) continue;

      const alertUserId = alertData.userId;
      const alertCategory = alertData.category || "";
      const alertTitle = alertData.title || "";
      const alertPrice = alertData.price;

      // 4a. Category check (exact match, case-insensitive).
      if (alertCategory.toLowerCase() !== newListingCategoryLower) {
        continue;
      }

      // 4b. Title check: if a keyword is specified, it must appear in the new post title.
      let titleMatches = true;
      if (alertTitle && alertTitle.trim() !== "") {
        titleMatches = newListingTitleLower.includes(alertTitle.toLowerCase());
      }

      // 4c. Updated Price check: handle lower, higher, or same price cases.
      let priceMatches = false;
      let priceMatchType = "";  // To store the type of price match.

      if (typeof alertPrice === "number") {
        if (price < alertPrice) {
          priceMatches = true;
          priceMatchType = "lower";
        } else if (price > alertPrice) {
          priceMatches = true;
          priceMatchType = "higher";
        } else if (price === alertPrice) {
          priceMatches = true;
          priceMatchType = "same";
        }
      }

      // Log price match type for debugging in Vercel logs.
      console.log(`Price match type: ${priceMatchType}, New listing price: ${price}, Alert price: ${alertPrice}`);

      // 5. If both title and price checks pass, consider this a matching alert.
      if (titleMatches && priceMatches) {
        const notificationId = uuidv4();

        // Build the document reference for the user's notifications.
        const notifRef = admin.firestore()
          .collection("ShopNGo")
          .doc("Users")
          .collection("Accounts")
          .doc(alertUserId)
          .collection("Marketplace")
          .doc("userData")
          .collection("Notifications")
          .doc("AllContents")
          .collection("Alerts")
          .doc(notificationId);

        // Write a notification document containing details of the new post.
        await notifRef.set({
          postId,
          title,
          category,
          price,
          sellerId,
          postTimestamp,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          matchCriteria: { alertTitle, alertCategory, alertPrice, priceMatchType }  // Include price match type.
        });
        notificationsCreated++;

        // 6. Retrieve the account document for this alertUserId to get the FCM token.
        const accountDoc = await admin.firestore()
          .collection("ShopNGo")
          .doc("Users")
          .collection("Accounts")
          .doc(alertUserId)
          .get();

        if (accountDoc.exists) {
          const accountData = accountDoc.data();
          const fcmToken = accountData.fcmToken;

          if (fcmToken) {
            // Prepare a payload for FCM with a toast for debugging.
            const payload = {
              notification: {
                title: "New Similar Listing Alert",
                body: `${title} in ${category} at ₱${price} was just posted (${priceMatchType} than your target).`,
              },
              data: {
                postId,
                sellerId,
                category,
                price: price.toString(),
                notificationId,
                toast: `New similar listing found with a ${priceMatchType} price!`  // Debugging toast message.
              },
            };

            // Send the push notification to the FCM token.
            admin.messaging().sendToDevice(fcmToken, payload)
              .then(response => {
                console.log(`Push notification sent to user ${alertUserId} (token: ${fcmToken})`, response);
              })
              .catch(error => {
                console.error(`Error sending push notification to user ${alertUserId}:`, error);
              });
          } else {
            console.warn(`No FCM token found for user ${alertUserId}.`);
          }
        } else {
          console.warn(`Account document for user ${alertUserId} does not exist.`);
        }
      }
    }

    // 7. Respond with the number of notifications created.
    res.status(200).json({
      message: "Processed similar listing alerts",
      notificationsCreated,
    });
  } catch (error) {
    console.error("Error processing similar listing alerts:", error);
    res.status(500).json({ error: error.toString() });
  }
}
