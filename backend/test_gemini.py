import os
import re
import asyncio
from pathlib import Path
import httpx
from dotenv import load_dotenv

load_dotenv()

gemini_key = os.getenv("GEMINI_API_KEY", "")

async def test_gemini():
    if not gemini_key:
        print("ERROR: No GEMINI_API_KEY found in .env")
        return None

    model = "gemini-3.6-flash"
    print(f"Testing: {model}")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [
                        {
                            "parts": [
                                {"text": "Say OK"}
                            ]
                        }
                    ]
                }
            )

            print(f"Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]

                print(f"Response: {text[:50]}")
                print(f"WORKS: {model}")

                return model

            print(f"Error: {response.text[:500]}")

    except Exception as e:
        print(f"Exception: {e}")

    return None


result = asyncio.run(test_gemini())

if result:
    print(f"\nUse model: {result}")

    path = Path("app/services/ai_service.py")

    if not path.exists():
        print(f"ERROR: File not found: {path}")
    else:
        content = path.read_text(encoding="utf-8")

        content = re.sub(
            r"gemini-[0-9.]+-[a-z0-9-]+",
            result,
            content,
            flags=re.IGNORECASE
        )

        path.write_text(content, encoding="utf-8")

        print(f"Updated: {path}")
        print(f"Gemini model changed to: {result}")
else:
    print("\nNo working Gemini model found.")
