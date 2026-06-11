from typing import List

from app.config import get_settings
from app.models.quiz import QuizAnswer, QuizAnalysis, WeakTopic
from app.services.groq_service import GroqService



class AnalysisService:
    def __init__(self, groq: GroqService) -> None:
        self.settings = get_settings()
        self.groq = groq

    def _compute_score(self, answers: List[QuizAnswer]) -> tuple[float, int, int]:
        total = len(answers)
        correct = sum(1 for a in answers if a.is_correct)
        score = round((correct / total) * 100, 2) if total else 0.0
        return score, total, correct

    def _mock_analysis(
        self,
        subject: str,
        topic: str,
        answers: List[QuizAnswer],
        overall_score: float,
    ) -> QuizAnalysis:
        total = len(answers)
        correct = sum(1 for a in answers if a.is_correct)
        weak = [
            WeakTopic(
                topic=topic,
                score_percentage=overall_score,
                severity="high" if overall_score < 50 else "medium" if overall_score < 75 else "low",
                recommendation=f"Review {topic} fundamentals and practice 10 targeted questions daily.",
            )
        ]
        if overall_score < 60:
            weak.append(
                WeakTopic(
                    topic=f"{subject} — problem solving",
                    score_percentage=max(overall_score - 15, 20),
                    severity="medium",
                    recommendation="Work through step-by-step solved examples before timed quizzes.",
                )
            )

        strengths: List[str] = []
        if overall_score >= 75:
            strengths.append(f"Strong grasp of {topic}")
        if correct >= total * 0.5:
            strengths.append("Consistent accuracy on core concepts")

        return QuizAnalysis(
            overall_score=overall_score,
            total_questions=total,
            correct_answers=correct,
            weak_topics=weak,
            strengths=strengths or ["Keep practicing to unlock strengths"],
            summary=(
                f"You scored {overall_score}% on {subject} ({topic}). "
                f"Focus on {weak[0].topic} with guided practice and spaced repetition."
            ),
            ai_mode="mock",
        )

    async def analyze_quiz(
        self,
        subject: str,
        topic: str,
        answers: List[QuizAnswer],
    ) -> QuizAnalysis:
        overall_score, total, correct = self._compute_score(answers)

        if not self.settings.groq_enabled:
            return self._mock_analysis(subject, topic, answers, overall_score)

        prompt = (
            f"Analyze quiz results for subject={subject}, topic={topic}. "
            f"Score: {overall_score}%, correct: {correct}/{total}. "
            f"Answers: {[a.model_dump() for a in answers]}. "
            "Return JSON with keys: weak_topics (list of topic, score_percentage, severity, recommendation), "
            "strengths (list of strings), summary (string)."
        )
        data = await self.groq.generate_json(prompt, "You are an education analytics assistant.")
        weak_topics = [WeakTopic(**w) for w in data.get("weak_topics", [])]
        return QuizAnalysis(
            overall_score=overall_score,
            total_questions=total,
            correct_answers=correct,
            weak_topics=weak_topics,
            strengths=data.get("strengths", []),
            summary=data.get("summary", "Analysis complete."),
            ai_mode="groq",
        )
