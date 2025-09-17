import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const apiToken = "d26980d19c57cf2add6fb54a82da6490feccffeba5852fa80cba456e4dbd229d"; // your token
const containerID = "iCloud.keyninestudios.topten"; // your container
const environment = "development"; // or "production"

// CloudKit base URL
const BASE_URL = `https://api.apple-cloudkit.com/database/1/${containerID}/${environment}/public`;

// ✅ Fetch all photo entries
app.get("/api/photos", async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/records/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        query: {
          recordType: "PhotoEntry", // your record type
        },
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Approve photo
app.post("/api/photos/approve", async (req, res) => {
  try {
    const { recordName } = req.body;
    const response = await fetch(`${BASE_URL}/records/modify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        operations: [
          {
            operationType: "update",
            record: {
              recordType: "PhotoEntry",
              recordName,
              fields: {
                approved: { value: true },
              },
            },
          },
        ],
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Reject photo
app.post("/api/photos/reject", async (req, res) => {
  try {
    const { recordName } = req.body;
    const response = await fetch(`${BASE_URL}/records/modify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        operations: [
          {
            operationType: "update",
            record: {
              recordType: "PhotoEntry",
              recordName,
              fields: {
                approved: { value: false },
              },
            },
          },
        ],
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
