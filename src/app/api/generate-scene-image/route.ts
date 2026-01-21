
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // URL of the local Python service
    // We assume it's running on localhost:8000
    const LOCAL_SERVICE_URL = process.env.LOCAL_PYTHON_BACKEND_URL || "http://127.0.0.1:8000";

    const response = await fetch(`${LOCAL_SERVICE_URL}/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
          prompt,
          num_inference_steps: 1,
          guidance_scale: 0.0
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Local Python Service Error:", errorText);
        throw new Error(`Local Python Service error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify({ url: data.url }), { status: 200 });

  } catch (error) {
    console.error('Error calling local generation service:', error);
    // Suggest the user to check the python server
    return new Response(JSON.stringify({
        error: 'Failed to connect to local generation service. Please ensure the Python backend is running on port 8000.'
    }), {
      status: 500,
    });
  }
}
