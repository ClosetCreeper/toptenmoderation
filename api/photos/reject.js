// /api/photos/reject.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { photoRecordName, reportRecordName } = req.body;

  const apiToken = "d26980d19c57cf2add6fb54a82da6490feccffeba5852fa80cba456e4dbd229d";
  const containerID = "iCloud.keyninestudios.topten";
  const environment = "development";

  const BASE_URL = `https://api.apple-cloudkit.com/database/1/${containerID}/${environment}/public`;

  try {
    const response = await fetch(`${BASE_URL}/records/modify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        operations: [
          {
            operationType: "delete",
            record: { recordName: photoRecordName },
          },
          {
            operationType: "update",
            record: {
              recordType: "ReportedPosts",
              recordName: reportRecordName,
              fields: { status: { value: "Removed" } },
            },
          },
        ],
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
