// /api/photos.js
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const apiToken = "d26980d19c57cf2add6fb54a82da6490feccffeba5852fa80cba456e4dbd229d";
  const containerID = "iCloud.keyninestudios.topten";
  const environment = "development";

  const BASE_URL = `https://api.apple-cloudkit.com/database/1/${containerID}/${environment}/public`;

  try {
    // 1️⃣ Query ReportedPosts with active reports
    const reportedRes = await fetch(`${BASE_URL}/records/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        query: {
          recordType: "ReportedPosts",
          // optional: filter out closed/removed reports
          filterBy: [
            {
              fieldName: "status",
              comparator: "NOT_EQUAL",
              fieldValue: { value: "Closed - No Action" },
            },
            {
              fieldName: "status",
              comparator: "NOT_EQUAL",
              fieldValue: { value: "Removed" },
            },
          ],
        },
        desiredKeys: ["postRecordName", "status"],
      }),
    });

    const reportedData = await reportedRes.json();
    const reports = reportedData.records || [];

    // 2️⃣ For each reported post, get its photo
    const photoPromises = reports.map(async (report) => {
      const postRecordName = report.fields?.postRecordName?.value;
      if (!postRecordName) return null;

      // Query Top10PhotoEntries for this recordName
      const photoRes = await fetch(`${BASE_URL}/records/lookup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ recordNames: [postRecordName] }),
      });

      const photoData = await photoRes.json();
      const photoRecord = photoData.records?.[0];

      if (!photoRecord) return null;

      const url = photoRecord.fields?.photo?.value?.downloadURL || null;

      return {
        reportRecordName: report.recordName,
        photoRecordName: photoRecord.recordName,
        postRecordName,
        status: report.fields?.status?.value || "Unknown",
        url,
        fields: photoRecord.fields,
      };
    });

    const photos = (await Promise.all(photoPromises)).filter(Boolean);

    res.status(200).json(photos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
