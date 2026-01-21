import base64
import io
import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from diffusers import AutoPipelineForText2Image

app = FastAPI()

# Global variable to hold the pipeline
pipe = None

def load_model():
    global pipe
    print("Loading SDXL-Turbo model...")
    try:
        # Load SDXL-Turbo
        # Note: 'variant="fp16"' is generally recommended for speed on GPU
        pipe = AutoPipelineForText2Image.from_pretrained(
            "stabilityai/sdxl-turbo",
            torch_dtype=torch.float16,
            variant="fp16"
        )
        pipe.to("cuda")
        print("Model loaded successfully on CUDA.")
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Fallback: Attempting to load on CPU (will be slow and might fail for fp16)...")
        try:
            pipe = AutoPipelineForText2Image.from_pretrained(
                "stabilityai/sdxl-turbo",
                torch_dtype=torch.float32
            )
            pipe.to("cpu")
            print("Model loaded successfully on CPU.")
        except Exception as e2:
            print(f"Critical error loading model: {e2}")
            pipe = None

# Load model on startup
@app.on_event("startup")
async def startup_event():
    load_model()

class GenerateRequest(BaseModel):
    prompt: str
    num_inference_steps: int = 1
    guidance_scale: float = 0.0

@app.post("/generate-image")
async def generate_image(request: GenerateRequest):
    global pipe
    if pipe is None:
        raise HTTPException(status_code=500, detail="Model not initialized")

    try:
        # SDXL Turbo is designed for 1 step, guidance_scale 0.0
        image = pipe(
            prompt=request.prompt,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale
        ).images[0]

        # Convert to base64
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        data_url = f"data:image/jpeg;base64,{img_str}"

        return {"url": data_url}

    except Exception as e:
        print(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
