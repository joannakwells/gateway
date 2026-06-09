"""URL reading tools used by the Gateway Instagram Content Crew."""

from __future__ import annotations

from html.parser import HTMLParser
from urllib.parse import urlparse

import requests
from crewai.tools import tool


class _ReadableHTMLParser(HTMLParser):
    """Extract useful visible page text without bringing in a full browser."""

    _TEXT_TAGS = {"title", "meta", "h1", "h2", "h3", "p", "li", "figcaption"}
    _SKIP_TAGS = {"script", "style", "noscript", "svg"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._skip_depth = 0
        self._active_tag: str | None = None
        self._buffer: list[str] = []
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in self._SKIP_TAGS:
            self._skip_depth += 1
            return

        attrs_dict = {key.lower(): value for key, value in attrs if value}
        if tag == "meta" and attrs_dict.get("name", "").lower() == "description":
            self._add_part(f"Description: {attrs_dict.get('content', '')}")
            return

        if tag == "img" and attrs_dict.get("alt"):
            self._add_part(f"Image alt: {attrs_dict['alt']}")
            return

        if tag in self._TEXT_TAGS:
            self._flush()
            self._active_tag = tag

    def handle_endtag(self, tag: str) -> None:
        if tag in self._SKIP_TAGS and self._skip_depth:
            self._skip_depth -= 1
            return

        if tag == self._active_tag:
            self._flush()
            self._active_tag = None

    def handle_data(self, data: str) -> None:
        if self._skip_depth or not self._active_tag:
            return
        cleaned = " ".join(data.split())
        if cleaned:
            self._buffer.append(cleaned)

    def _flush(self) -> None:
        if not self._buffer:
            return
        text = " ".join(self._buffer)
        label = self._active_tag.upper() if self._active_tag else "TEXT"
        self._add_part(f"{label}: {text}")
        self._buffer = []

    def _add_part(self, text: str) -> None:
        cleaned = " ".join(text.split())
        if cleaned and cleaned not in self.parts:
            self.parts.append(cleaned)


class URLTools:
    """HTTP-backed URL reader with safe error handling."""

    @staticmethod
    @tool("Read URL")
    def read_url(url: str) -> str:
        """Read a URL and return concise page text for content planning."""
        return URLTools.read(url)

    @staticmethod
    def read(url: str, max_chars: int = 6000) -> str:
        parsed = urlparse(url.strip())
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            return f"URL read unavailable: '{url}' is not a valid http(s) URL."

        try:
            response = requests.get(
                url,
                headers={
                    "User-Agent": (
                        "Mozilla/5.0 (compatible; GatewayInstagramCrew/0.1; "
                        "+https://gatewaygardens.com)"
                    )
                },
                timeout=20,
            )
            response.raise_for_status()
        except requests.RequestException as exc:
            return f"URL read failed for '{url}': {exc}"

        content_type = response.headers.get("content-type", "")
        if "text/html" not in content_type.lower():
            text = " ".join(response.text.split())
            return f"URL: {url}\nContent type: {content_type or 'unknown'}\n\n{text[:max_chars]}"

        parser = _ReadableHTMLParser()
        parser.feed(response.text)
        parser.close()

        content = "\n".join(parser.parts)
        if not content:
            return f"URL read found no readable page text for '{url}'."

        return f"URL: {url}\n\n{content[:max_chars]}"
