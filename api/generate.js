export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { image, prompt } = req.body;
    const token = process.env.REPLICATE_API_TOKEN;

    if (!token) {
        return res.status(500).json({ error: 'مفتاح API مفقود في إعدادات Vercel' });
    }

    try {
        const startResponse = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version: "392d692a29a5c02c6f1405e3f44485994f87747716f9f041e17d91986427a1df",
                input: { image, prompt }
            }),
        });

        let prediction = await startResponse.json();

        while (prediction.status !== "succeeded" && prediction.status !== "failed") {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const checkResponse = await fetch(prediction.urls.get, {
                headers: { "Authorization": `Token ${token}` },
            });
            prediction = await checkResponse.json();
        }

        if (prediction.status === "succeeded") {
            res.status(200).json({ videoUrl: prediction.output });
        } else {
            throw new Error("فشل المحرك في معالجة الصورة");
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
