from __future__ import annotations


def chunk_transcript(transcript: str, max_chars: int = 900) -> list[str]:
    paragraphs = [p.strip() for p in transcript.split("\n\n") if p.strip()]
    chunks: list[str] = []
    current = ""
    for paragraph in paragraphs:
        if len(current) + len(paragraph) + 2 <= max_chars:
            current = f"{current}\n\n{paragraph}".strip()
        else:
            if current:
                chunks.append(current)
            current = paragraph
    if current:
        chunks.append(current)
    if not chunks:
        chunks = [transcript.strip()]
    return [c for c in chunks if c]

