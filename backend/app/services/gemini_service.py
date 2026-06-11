import json
import logging
from typing import Any, Dict, Optional

from app.config import get_settings
from app.core.exceptions import AIServiceError

logger = logging.getLogger(__name__)


class GroqService:
    """Groq Service"""

    def __init__(self):
        self.settings = get_settings()
        self.model = None

    def _ensure_client(self):
        """Initialize Groq client"""

        if not self.settings.groq_enabled:
            raise AIServiceError(
                "Groq disabled. Set USE_MOCK_AI=false and add GROQ_API_KEY"
            )

        if not self.settings.groq_api_key:
            raise AIServiceError(
                "GROQ_API_KEY is missing in .env file"
            )

        if self.model is None:
            try:
                import google.generativeai as genai

                print("\n========== GROQ DEBUG ==========")
                print("MODEL:", self.settings.groq_model)

                key = self.settings.groq_api_key

                print("API KEY FOUND:", bool(key))
                print("KEY LENGTH:", len(key))

                if len(key) > 10:
                    print(
                        "KEY PREVIEW:",
                        f"{key[:6]}...{key[-4:]}"
                    )

                print("==================================\n")

                # Configure Gemini
                genai.configure(api_key=key)

                self.model = genai.GenerativeModel(
                    model_name=self.settings.groq_model
                )

                logger.info("Groq initialized successfully")

            except Exception as exc:
                logger.exception("Groq initialization failed")

                raise AIServiceError(
                    f"Groq initialization failed: {str(exc)}"
                ) from exc

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
    ) -> str:
        """Generate AI text response"""

        self._ensure_client()

        try:
            full_prompt = (
                f"{system_instruction}\n\n{prompt}"
                if system_instruction
                else prompt
            )

            response = self.model.generate_content(
                full_prompt
            )

            # Normal response
            if hasattr(response, "text") and response.text:
                return response.text.strip()

            # Fallback response parsing
            if (
                hasattr(response, "candidates")
                and response.candidates
            ):
                parts = response.candidates[0].content.parts

                text = "".join(
                    part.text
                    for part in parts
                    if hasattr(part, "text")
                )

                if text:
                    return text.strip()

            return "Sorry, I could not generate a response."

        except Exception as exc:
            import traceback

            print("\n========== GROQ ERROR ==========")
            print("ERROR TYPE:", type(exc).__name__)
            print("ERROR:", str(exc))
            traceback.print_exc()
            print("==================================\n")

            error_text = str(exc)

            if "API key not valid" in error_text:
                raise AIServiceError(
                    "Invalid Groq API key. Check your GROQ_API_KEY in .env"
                )

            if "429" in error_text:
                raise AIServiceError(
                    "Groq quota exceeded. Please try again later."
                )

            if "quota" in error_text.lower():
                raise AIServiceError(
                    "Groq quota exceeded."
                )

            raise AIServiceError(
                f"Gemini request failed: {error_text}"
            ) from exc

    async def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate JSON response"""

        instruction = (
            (system_instruction or "")
            + "\nRespond ONLY with valid JSON."
        )

        text = await self.generate_text(
            prompt,
            instruction
        )

        try:
            return json.loads(text)

        except json.JSONDecodeError as exc:
            logger.exception(
                "Invalid JSON response from Gemini"
            )

            raise AIServiceError(
                "Gemini returned invalid JSON"
            ) from exc


def get_gemini_service() -> GroqService:
    return GroqService()