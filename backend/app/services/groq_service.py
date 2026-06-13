import base64
import json
import re

from groq import Groq

from app.config import get_settings


class GroqService:
    def __init__(self):
        self.settings = get_settings()

        self.client = Groq(
            api_key=self.settings.groq_api_key
        )

    async def generate_text(
        self,
        prompt: str,
        system_instruction: str = None,
    ) -> str:
        messages = []

        if system_instruction:
            messages.append(
                {
                    "role": "system",
                    "content": system_instruction,
                }
            )

        messages.append(
            {
                "role": "user",
                "content": prompt,
            }
        )

        response = self.client.chat.completions.create(
            model=self.settings.groq_model,
            messages=messages,
            temperature=0.7,
            max_tokens=2048,
        )

        return response.choices[0].message.content

    async def generate_json(
        self,
        prompt: str,
        system_instruction: str = None,
    ) -> dict:
        response = await self.generate_text(
            prompt=prompt,
            system_instruction=system_instruction,
        )

        cleaned = response.strip()
        cleaned = re.sub(r"```json", "", cleaned)
        cleaned = re.sub(r"```", "", cleaned).strip()

        try:
            return json.loads(cleaned)
        except Exception:
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)

            if match:
                try:
                    return json.loads(match.group(0))
                except Exception:
                    return {}

            return {}

    async def generate_vision_text(
        self,
        prompt: str,
        image_bytes: bytes,
        mime_type: str,
        system_instruction: str = None,
    ) -> str:
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        image_data_url = (
            f"data:{mime_type};base64,{image_base64}"
        )

        messages = []

        if system_instruction:
            messages.append(
                {
                    "role": "system",
                    "content": system_instruction,
                }
            )

        messages.append(
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt,
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_data_url,
                        },
                    },
                ],
            }
        )

        response = self.client.chat.completions.create(
            model=self.settings.groq_vision_model,
            messages=messages,
            temperature=0.3,
            max_tokens=2048,
        )

        return response.choices[0].message.content