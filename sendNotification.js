const admin = require("firebase-admin");

// Initialize Firebase Admin SDK with your service account credentials
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "givngo-584eb",
            clientEmail: "firebase-adminsdk-4lh4a@givngo-584eb.iam.gserviceaccount.com",
            privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDE9Tn5oocUN7jh\nFzpWq1kuS87SsDtGkNqA6V+5tfB+erYtfTW3/gncJdymI6J4iYD25BEyRzz7l5GF\nMleVPzdAzMKGX3tp+WyJmcX2Ken9uYgKckPKRNRLKg1YM3V49lxW3qYSaj3nq9FZ\nInDDNfVdbWLzG/0Vb9A9WFDx88SszZPF0JRFRl/YWpdm8NcQzQXH6TwwzXdtPZHp\nsbTMWm9IVan2/rQylpSZQhDrK6CV95d9iMgTnPu91Q7VOBKqzNU2Nu3b3tRGbmpr\nlelJcaVDN5QHal62b4VYpaDMZPuuaDZHsDAjTPsIHM2wN7akK1hXisX2q3W/yp0L\nsqC4yzUXAgMBAAECggEASmpjBLxRMCTbkARAMQXdlJ3k33rhcoiBXiqO1fJ1krwX\nf/lqZgGwRQLzKryVAtjlJqNGEgqTcnWycDJ0n/m6DRwwNSf3T7ODPDwi7R6p/4jt\naxEAJvi5g0q4rwYGUPU4L0RBV/zXNeSXnQdjtoX5Flshgzwkc8iC0+K99qTFPwpl\nl1rLbeuaeVytgk2B9i/2spNS2YI4u/gGWhk7WAdQpBMzmsU5zwRyz/gXXimz61kk\nliYzJ4Tv9tNypU5mwh8Xzl9IiSx0VGVnf2Z/hpgj7uwaPhV8Zz4uWwgf3DU2Fxia\n5Qa9jhTihrZysO3UFIBGJcN2rifU+hDCYtXHeKg+LQKBgQDm2EaIw46YvLL/3V2c\n8QHZPD1GkjTEr4E6y0Te+7NzTKV2IhbcI3+jgpiuBVXZKw65tL6vEYy+Nrorql40\n69ZTy9UPLGpBn3iMSbMENY1z/o4UcRV9omdA/ORKRyGnuNBSKx1KpEK78Bfgmugn\nGFvyqJ97057LVDHiKanBavrBGwKBgQDaa6FfAnWXSCkwIXBnX9ZKCpKxTwo8Cpck\nzfwL6MP3h0GaZXZN6A8CNHlex8eqeAtSDK94+rOOAD0OjQK78DpfzMOHjpgYqxFO\nuiykG9m0IPe1W0UPrWEQg14uaI1IQ1+990P1zqniVvyn/HzOwh7XxlxdILPVtuFM\nH80UsCnXtQKBgQDO8Eaax6QHK/HTCSCoVizwDt5nax2+zA4vJJWCx2ShEa6qbfjM\nM05yx9oS9ll1KvIya+MckcD3q5vNFRcKnfguemVvCsPePBUWveKq/U7nEuVPUeiQ\nDYw+Z/ZG1+lFr5mgb2H8za+9RohBItzGX0HeEGeX26dYYwus0OiKqVpMzQKBgQCk\nSTxxiBoGlgJU73Hqb01xF47Kyta53oVc64pfMs7jidqwVQytAJT5ZZq8zavC7tQk\n/OGnL3qKnmdOYIXj8ocVs6CGf5yrQVCdVK9rKH+RWxK2WFYTuqc9knHumjlaV0LW\nUfvOEYn6cs9LU0BVC/HC/rJOYeCiKRJA/dJ1cyOl2QKBgQDBrNYyty1VG3PERhgP\n2FIBuG0nkByfrHOF4NlgDlbhFC2+uGWkXEumrQJeEw/voeYNtaszHgduqUXu1hrR\nZeUU7YyzqdagEFJ73/5h4qQYCWq5jbE1DT+bgkQ9MxCNG2JRMsSwY5bXwzrm8jnC\n1QzdvkfIQ+lM+UwAYtj8kHyXxg==\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
        }),
    });
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { fcmToken, title, body, imgThumbnail } = req.body;

    if (!fcmToken || !title || !body || !imgThumbnail) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const message = {
    notification: {
        title,
        body,
        image: imgThumbnail  // <-- this will display the thumbnail
    },
    token: fcmToken,
    data: {
        imgThumbnail, // optional: still sending it in data for custom handling
    },
};

    try {
    const response = await admin.messaging().send(message);
    res.status(200).json({
        success: true,
        message: "Notification sent",
        response,
        sentToToken: fcmToken,
    });
} catch (error) {
    let specificError = "Unknown error";
    
    //Send Multiple Logs error back to user's device 
    if (error.code) {
        switch (error.code) {
            case "messaging/invalid-recipient":
                specificError = "The provided token is invalid.";
                break;
            case "messaging/invalid-payload":
                specificError = "Invalid payload sent in the message.";
                break;
            case "messaging/auth-error":
                specificError = "Authentication issue. Check your credentials.";
                break;
            default:
                specificError = error.message;
        }
    }

    // Log error details
    console.error("Error sending notification:", {
        specificError,
        originalError: error.message,
        errorCode: error.code || "No error code provided",
        attemptedToken: fcmToken,
    });

    res.status(500).json({
        success: false,
        error: specificError,
        originalError: error.message,
        attemptedToken: fcmToken,
    });
}

}
