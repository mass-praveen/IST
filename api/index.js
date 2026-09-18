export default async function handler(req, res) {
  try {
    const module = await import('../server/index.js');
    const app = module.default;
    return app(req, res);
  } catch (error) {
    console.error("Vercel Initialization Error:", error);
    res.status(500).json({
      success: false,
      error: "Crash: " + error.message
    });
  }
}