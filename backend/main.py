import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class PromptRequest(BaseModel):
    prompt: str

@app.post("/generate")
async def generate_code(req: PromptRequest):
    # ✅ This is your updated system prompt
    system_prompt = {
        "role": "system",
        "content": (
            "You are Rexode, a helpful and expert-level coding assistant. "
            "Always return answers in clean markdown format with full code blocks. "
            "Explain in steps if needed. Use language tags like ```python or ```java."
        )
    }

    payload = {
        "model": "deepseek-coder:6.7b-instruct",
        "messages": [
            system_prompt,
            {"role": "user", "content": req.prompt}
        ],
        "temperature": 0.7
    }

    # Debug (optional)
    print("Prompt:", req.prompt)
    print("Sending to LM Studio with payload:", payload)

    try:
        response = requests.post("http://127.0.0.1:1234/v1/chat/completions", json=payload)
        result = response.json()
        print("Response:", result)
        return {"response": result["choices"][0]["message"]["content"]}
    except Exception as e:
        print("Error calling LM Studio:", e)
        return {"response": f"Error: {e}"}
