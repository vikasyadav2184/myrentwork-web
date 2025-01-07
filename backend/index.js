const admin = require("firebase-admin");
const express = require("express");
const app = express();

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(require("./serviceAccountKey.json")),
});

// Endpoint to list users
app.get("/list-users", async (req, res) => {
    try {
        let users = [];
        const listUsers = async (nextPageToken) => {
            const result = await admin.auth().listUsers(1000, nextPageToken);
            users = users.concat(result.users.map(user => ({
                uid: user.uid,
                email: user.email,
                metadata: user.metadata,
                displayName: user.displayName || "",
            })));
            if (result.pageToken) {
                await listUsers(result.pageToken);
            }
        };
        await listUsers();
        res.json(users);
    } catch (error) {
        res.status(500).send({ error: "Unable to list users" });
    }
});

app.delete("/delete-users", async (req, res) => {
    try {
        // Get the list of user IDs (uids) from the request body
        const { uids } = req.body;

        if (!uids || !Array.isArray(uids) || uids.length === 0) {
            return res.status(400).send({ error: "A non-empty array of User IDs (uids) is required" });
        }

        // Keep track of successfully deleted users and errors
        const results = {
            success: [],
            errors: []
        };

        // Iterate over the uids and delete each user
        for (const uid of uids) {
            try {
                await admin.auth().deleteUser(uid);
                results.success.push(uid); // Add to success list if deletion is successful
            } catch (error) {
                results.errors.push({ uid, error: error.message }); // Capture error for this uid
            }
        }

        res.status(200).send({
            message: "Delete operation completed.",
            results
        });
    } catch (error) {
        console.error("Error deleting users:", error);
        res.status(500).send({ error: `Unable to delete users: ${error.message}` });
    }
});


app.listen(3000, () => console.log("Server running on http://localhost:3000"));
