from typing import AsyncGenerator, List, Optional

from openai import AsyncOpenAI

from ..core.config import get_settings

settings = get_settings()

_client: Optional[AsyncOpenAI] = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.deepseek_api_key, base_url=settings.deepseek_base_url)
    return _client


async def chat_stream(messages: List[dict], temperature: float = 0.7, max_tokens: int = 2048) -> AsyncGenerator[str, None]:
    client = get_client()
    response = await client.chat.completions.create(model=settings.deepseek_model, messages=messages, temperature=temperature, max_tokens=max_tokens, stream=True)
    async for chunk in response:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content


async def chat(messages: List[dict], temperature: float = 0.7, max_tokens: int = 2048) -> str:
    client = get_client()
    response = await client.chat.completions.create(model=settings.deepseek_model, messages=messages, temperature=temperature, max_tokens=max_tokens)
    return response.choices[0].message.content or ""
