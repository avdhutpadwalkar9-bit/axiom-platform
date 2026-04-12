from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.middleware.auth import get_current_user
from app.models.user import User
from app.services.ai_service import chat_with_ai

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str  # "user" or "ai"
    text: str


class ChatRequest(BaseModel):
    question: str
    analysis_result: dict  # The full analysis result from TB analysis
    conversation_history: list[ChatMessage] = []
    business_context: dict | None = None
    user_answers: dict | None = None  # Answers to AI questions: {question: answer}


class AnswerQuestionRequest(BaseModel):
    question: str
    answer: str
    analysis_result: dict
    all_answers: dict = {}  # All previous Q&A pairs
    business_context: dict | None = None


@router.post("/ask")
async def ask_ai(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """Chat with AI about the financial analysis."""
    if not data.question.strip():
        raise HTTPException(status_code=400, detail="Question is required")

    history = [{"role": m.role, "text": m.text} for m in data.conversation_history]

    response = await chat_with_ai(
        question=data.question,
        analysis_result=data.analysis_result,
        conversation_history=history,
        business_context=data.business_context,
        user_answers=data.user_answers,
    )

    return {"response": response}


class PublicChatRequest(BaseModel):
    question: str
    conversation_history: list[ChatMessage] = []


@router.post("/public")
async def public_chat(data: PublicChatRequest):
    """Public AI chat for the landing page. No auth required. Limited context."""
    if not data.question.strip():
        raise HTTPException(status_code=400, detail="Question is required")

    history = [{"role": m.role, "text": m.text} for m in data.conversation_history]

    # Provide empty analysis — AI will answer general finance questions
    response = await chat_with_ai(
        question=data.question,
        analysis_result={
            "financial_statements": {},
            "ratios": {},
            "classified_accounts": {"assets": [], "liabilities": [], "equity": [], "revenue": [], "expenses": []},
            "ind_as_observations": [],
            "ai_questions": [],
            "insights": [],
            "warnings": [],
        },
        conversation_history=history,
    )

    return {"response": response}


@router.post("/answer-question")
async def answer_question(
    data: AnswerQuestionRequest,
    current_user: User = Depends(get_current_user),
):
    """
    User answers one of the AI's clarifying questions.
    AI incorporates the answer and provides updated analysis.
    """
    all_answers = data.all_answers or {}
    all_answers[data.question] = data.answer

    prompt = f"""The management has answered the following question about their financials:

Question: {data.question}
Answer: {data.answer}

Based on this answer and the financial data, provide:
1. How this answer impacts the analysis
2. Any adjusted numbers or reclassifications needed
3. Any follow-up concerns or recommendations

Be specific and reference actual numbers from the data."""

    response = await chat_with_ai(
        question=prompt,
        analysis_result=data.analysis_result,
        business_context=data.business_context,
        user_answers=all_answers,
    )

    return {
        "response": response,
        "updated_answers": all_answers,
    }
