from typing import List

from .knowledge_base import get_faq_collection, search
from .deepseek_client import chat


class RAGPipeline:
    """RAG流水線：檢索FAQ知識庫 + DeepSeek生成回答"""

    SYSTEM_PROMPT = """你是小揚同學，澳門直播協會的AI助手。請根據以下知識庫內容回答會員的問題。
如果知識庫中沒有相關信息，請誠實告知並建議轉接人工客服。
請用簡體中文回答，語氣友好專業。"""

    def __init__(self):
        self.collection = get_faq_collection()

    async def answer(self, question: str) -> dict:
        documents = search(self.collection, question, n_results=3)
        if not documents:
            return {"answer": "抱歉，我暫時無法回答這個問題。我可以幫您轉接人工客服。", "source": "fallback", "confidence": 0.0}

        context = "\n\n".join(documents)
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": f"知識庫內容：\n{context}\n\n用戶問題：{question}"}
        ]
        try:
            answer = await chat(messages, temperature=0.3, max_tokens=1024)
            return {"answer": answer, "source": "rag", "confidence": 0.85}
        except Exception:
            # Fallback to simple FAQ match
            return {"answer": documents[0], "source": "faq_match", "confidence": 0.7}
