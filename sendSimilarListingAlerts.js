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
      console.log("Missing required fields in the request body.");
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Received new post:", { postId, title, category, price, sellerId });

    const postTimestamp = timestamp || admin.firestore.FieldValue.serverTimestamp();

    const newListingTitleLower = title.toLowerCase();
    const newListingCategoryLower = category.toLowerCase();

    // 2. Fetch all saved similar listing alerts.
    const alertsSnapshot = await admin.firestore()
      .collection("ShopNGo")
      .doc("users")
      .collection("SimilarListings")
      .get();

    if (alertsSnapshot.empty) {
      console.log("No similar listing alerts found.");
      return res.status(200).json({ message: "No alerts to process." });
    }

    console.log(`Found ${alertsSnapshot.docs.length} alert documents.`);

    // Store alert documents in an array for iteration.
    const alertDocuments = alertsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let notificationsCreated = 0;

    // Initialize Firestore batch for efficient writing.
    const batch = admin.firestore().batch();

    // 3. Iterate over each saved alert document.
    for (const alertData of alertDocuments) {
      const { id: alertDocId, ...alertInfo } = alertData;

      console.log(`Processing alert document ID: ${alertDocId}`);

      if (!alertInfo.enabled) {
        console.log(`Alert ID ${alertDocId} is disabled. Skipping.`);
        continue;
      }

      const alertUserId = alertInfo.userId;
      const alertCategory = alertInfo.category || "";
      const alertTitle = alertInfo.title || "";
      const alertPrice = alertInfo.price || "";

      // Skip if the sellerId matches the alertUserId
      if (sellerId === alertUserId) {
        console.log(`Seller ID matches Alert User ID (${alertUserId}). Skipping.`);
        continue;
      }

      // 3a. Category check.
      if (alertCategory.toLowerCase() !== newListingCategoryLower) {
        console.log(`Category mismatch for alert ID ${alertDocId}. Skipping.`);
        continue;
      }

      // 3b. Title check.
      let titleMatches = false;
      let matchType = "none";

      if (alertTitle && alertTitle.trim() !== "") {
        const alertWords = alertTitle.toLowerCase().split(/\s+/);
        const matchedWords = alertWords.filter(word => newListingTitleLower.includes(word));

        if (matchedWords.length === alertWords.length) {
          titleMatches = true;
          matchType = "exact match";
          console.log(`Exact match for alert ID ${alertDocId}.`);
        } else if (matchedWords.length > 0) {
          titleMatches = true;
          matchType = "partial match";
          console.log(`Partial match for alert ID ${alertDocId}. Matched words: ${matchedWords.join(", ")}`);
        } else {
          console.log(`No match for alert ID ${alertDocId}.`);
        }
      } else {
        console.log(`No alert title specified for alert ID ${alertDocId}.`);
      }

      // 3c. Price check.
      let priceMatches = false;
      let priceMatchType = "";

      const alertPriceInt = parseInt(alertPrice, 10);
      const priceInt = parseInt(price, 10);

      if (priceInt < alertPriceInt) {
        priceMatches = true;
        priceMatchType = "lower";
      } else if (priceInt > alertPriceInt) {
        priceMatches = true;
        priceMatchType = "higher";
      } else if (priceInt === alertPriceInt) {
        priceMatches = true;
        priceMatchType = "same";
      }

      console.log(`Price match type for alert ID ${alertDocId}: ${priceMatchType}`);

      // 4. Save matching alerts to Firestore.
      if (titleMatches && priceMatches) {
        const notificationId = uuidv4();

        
          const savedSimListings = admin.firestore()
          .collection("ShopNGo")
          .doc("Users")
          .collection("Accounts")
          .doc(alertUserId)
          .collection("Marketplace")
          .doc("userData")
          .collection("MySimilarListings")
          .doc(postId)
          .collection('SimilarListings')
          .doc(notificationId);
          
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
          
const notificationData = {
  documentKey: {
    value: String(postId),  // Converted to string
    type: "string",
    description: "Unique identifier for the document"
  },
  itemName: {
    value: String(title),  // Converted to string
    type: "string",
    description: "Title of the notification"
  },
  category: {
    value: String(category),  // Converted to string
    type: "string",
    description: "Category of the post"
  },
  price: {
    value: String(price),  // Already a string, kept as is
    type: "string",  // Updated type to string
    currency: "USD",
    description: "Price of the item"
  },
  sellerId: {
    value: String(sellerId),  // Converted to string
    type: "string",
    description: "Unique identifier for the seller"
  },
  notificationType: {
    value: String('SimilarListings'),  // Explicitly converted to string
    type: "string",
    description: "Type of the notification"
  },
  timePosted: {
    value: String(postTimestamp),  // Converted to string
    type: "string",  // Updated type to string
    formatted: new Date(postTimestamp).toLocaleString(),
    description: "Time when the post was created"
  },
  createdAt: {
    value: String(admin.firestore.FieldValue.serverTimestamp()),  // Converted to string
    type: "string",  // Updated type to string
    description: "Time when the notification was created"
  }
};

        
        const similarListing = {
  postId: String(postId),  // Converted to string
  title: String(title),  // Converted to string
  category: String(category),  // Converted to string
  price: String(price),  // Converted to string
  sellerId: String(sellerId),  // Converted to string
  postTimestamp: String(postTimestamp),  // Converted to string
  createdAt: String(admin.firestore.FieldValue.serverTimestamp()),  // Converted to string
  matchCriteria: {  // Kept as is
    alertTitle,
    alertCategory,
    alertPrice,
    priceMatchType
  }
};

        console.log(`Saving notification for user ${alertUserId} with ID ${notificationId}`);
        batch.set(notifRef, notificationData, { merge: true });
        batch.set(savedSimListings, similarListing, { merge: true });
        notificationsCreated++;
      }
    }

    // Commit the batch write to Firestore.
    await batch.commit();
    console.log(`Batch write completed with ${notificationsCreated} notifications created.`);

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

