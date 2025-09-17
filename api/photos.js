// /api/photos.js
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const apiToken = "d26980d19c57cf2add6fb54a82da6490feccffeba5852fa80cba456e4dbd229d";
  const containerID = "iCloud.keyninestudios.topten";
  const environment = "development";

  const BASE_URL = `https://api.apple-cloudkit.com/database/1/${containerID}/${environment}/public`;

  try {
    const response = await fetch(`${BASE_URL}/records/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        query: { recordType: "Top10PhotoEntries" },
        desiredKeys: ["photo", "postRecordName"],
      }),
    });

    const data = await response.json();

    const photos = (data.records || []).map((r) => ({
      recordName: r.recordName,
      postRecordName: r.fields?.postRecordName?.value || null,
      url: r.fields?.photo?.value?.downloadURL || null,
    }));

    res.status(200).json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
