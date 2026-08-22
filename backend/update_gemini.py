from pathlib import Path

path = Path("app/services/ai_service.py")
content = path.read_text(encoding="utf-8")

old_deepseek = '''    deepseek_key = os.getenv("DEEPSEEK_API_KEY", "")
    
    if deepseek_key:
        try:
            print(f"[CHAT DEBUG] Calling DeepSeek API for: {query}")'''

new_gemini = '''    gemini_key = os.getenv("GEMINI_API_KEY", "")
    
    if gemini_key:
        try:
            print(f"[CHAT DEBUG] Calling Gemini API for: {query}")'''

if old_deepseek in content:
    content = content.replace(old_deepseek, new_gemini)
    print("OK: Key variable updated to Gemini")
else:
    print("WARNING: DeepSeek key pattern not found")

old_url = '''                    "https://api.deepseek.com/v1/chat/completions",'''

new_url = '''                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={gemini_key}",'''

if old_url in content:
    content = content.replace(old_url, new_url)
    print("OK: URL updated to Gemini")
else:
    print("WARNING: DeepSeek URL not found")

old_headers = '''                    headers={
                        "Authorization": f"Bearer {deepseek_key}",
                        "Content-Type": "application/json"
                    },'''

new_headers = '''                    headers={
                        "Content-Type": "application/json"
                    },'''

if old_headers in content:
    content = content.replace(old_headers, new_headers)
    print("OK: Headers updated for Gemini")
else:
    print("WARNING: Headers pattern not found")

old_body = '''                    json={
                        "model": "deepseek-chat",
                        "messages": [
                            {
                                "role": "system",
                                "content": (
                                    "You are a data analysis assistant. "
                                    "Answer the CURRENT user question based ONLY "
                                    "on the provided dataset context."
                                )
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.3,
                        "max_tokens": 500
                    }'''

new_body = '''                    json={
                        "contents": [
                            {
                                "parts": [
                                    {"text": prompt}
                                ]
                            }
                        ]
                    }'''

if old_body in content:
    content = content.replace(old_body, new_body)
    print("OK: Request body updated for Gemini")
else:
    print("WARNING: Body pattern not found")

old_parse = '''                if ai_response.status_code == 200:
                    ai_data = ai_response.json()
                    ai_answer = ai_data["choices"][0]["message"]["content"]'''

new_parse = '''                if ai_response.status_code == 200:
                    ai_data = ai_response.json()
                    ai_answer = ai_data["candidates"][0]["content"]["parts"][0]["text"]'''

if old_parse in content:
    content = content.replace(old_parse, new_parse)
    print("OK: Response parsing updated for Gemini")
else:
    print("WARNING: Parse pattern not found")

content = content.replace('"source": "deepseek"', '"source": "gemini"')

content = content.replace("DeepSeek API error", "Gemini API error")
content = content.replace("DeepSeek API failed", "Gemini API failed")
content = content.replace("DeepSeek response", "Gemini response")

path.write_text(content, encoding="utf-8")

print("\nFile updated to use Gemini API")
