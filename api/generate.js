export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { image } = req.body;
    const HF_TOKEN = process.env.HF_TOKEN; 

    if (!image) {
        return res.status(400).json({ error: 'Please upload an image' });
    }

    try {
        const imageData = image.split(',')[1];
        const blob = await fetch(`data:image/png;base64,${imageData}`).then(r => r.blob());

        const response = await fetch(
            "https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid-xt",
            {
                headers: { 
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/octet-stream"
                },
                method: "POST",
                body: blob,
            }
        );

        if (!response.ok) {
            return res.status(500).json({ error: 'المحرك مشغول، جرب مرة أخرى بعد دقيقة' });
        }

        const videoBlob = await response.blob();
        const arrayBuffer = await videoBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Video = buffer.toString('base64');

        res.status(200).json({ 
            videoUrl: `data:video/mp4;base64,${base64Video}` 
        });

    } catch (error) {
        res.status(500).json({ error: 'خطأ في الاتصال بالمحرك' });
    }
}
