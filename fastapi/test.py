from google import genai
import json
import re

YOUR_API_KEY = "AIzaSyBYkQTlg8E9fytxPsRhejzMnWfXWayzBOg"
client = genai.Client(api_key=YOUR_API_KEY)

def clean_json_output(text):
    # Remove markdown formatting (```json ... ```)
    cleaned = re.sub(r"```(?:json)?\n(.*?)```", r"\1", text.strip(), flags=re.DOTALL)
    return cleaned.strip()

def get_crop_remedy(disease: str):
    prompt = f"""
    Give 2 remedies and advice for the plant disease '{disease}' in the following JSON format:

    {{
      "disease": "<Disease Name and causal organism>",
      "remedies": [
        {{
          "remedy_type": "Chemical Treatment or Organic Treatment",
          "description": "Short description of what to do",
          "dosage": "Exact or recommended dosage if applicable"
        }},
        {{
          "remedy_type": "Another Treatment",
          "description": "Short description of what to do",
          "dosage": "Dosage or write 'Not applicable'"
        }}
      ]
    }}

    Output only the valid JSON, and nothing else.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite", 
            contents=prompt
        )
        print("Raw Gemini Output:\n", response.text)

        cleaned = clean_json_output(response.text)
        parsed = json.loads(cleaned)
        return parsed

    except json.JSONDecodeError:
        return {"error": "Invalid JSON format returned", "raw": response.text}

    except Exception as e:
        return {"error": str(e)}

# 🔍 Test
if __name__ == "__main__":
    result = get_crop_remedy("apple scab")
    print("Parsed Gemini JSON:\n", json.dumps(result, indent=2))
