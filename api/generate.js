export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, prompt } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'الرجاء رفع صورة أولاً' });
  }

  try {
    // تحويل الصورة من Base64 إلى Blob
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // استدعاء محرك الذكاء الاصطناعي السريع (ModelScope)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/damo-vilab/modelscope-damo-text-to-video-dynamics",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt || "A person smiling and moving naturally",
          image: image
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'فشل المحرك في الاستجابة');
    }

    const result = await response.blob();
    const arrayBuffer = await result.arrayBuffer();
    const outputBuffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'video/mp4');
    res.send(outputBuffer);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'حدث خطأ: المحرك مشغول، جرب مرة أخرى بعد دقيقة' });
  }
}
