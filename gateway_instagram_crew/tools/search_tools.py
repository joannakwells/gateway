"""Search tools used by the Gateway Instagram Content Crew."""

from __future__ import annotations

import os
from typing import Any

import requests
from crewai.tools import tool


class SearchTools:
    """Serper-backed web search helpers with safe error handling."""

    @staticmethod
    @tool("Search web")
    def search_web(query: str) -> str:
        """Search the web for a topic and return concise organic results."""
        return SearchTools.search(query)

    @staticmethod
    def search(query: str, n_results: int = 5) -> str:
        api_key = os.getenv("SERPER_API_KEY")
        if not api_key:
            return "Search unavailable: SERPER_API_KEY is missing."

        try:
            response = requests.post(
                "https://google.serper.dev/search",
                headers={"X-API-KEY": api_key, "content-type": "application/json"},
                json={"q": query, "num": n_results},
                timeout=20,
            )
            response.raise_for_status()
            payload: dict[str, Any] = response.json()
        except requests.RequestException as exc:
            return f"Search failed for query '{query}': {exc}"
        except ValueError as exc:
            return f"Search failed for query '{query}': invalid JSON response ({exc})."

        results = payload.get("organic", [])
        if not results:
            return f"No organic search results found for query: {query}"

        formatted_results = []
        for result in results[:n_results]:
            formatted_results.append(
                "\n".join(
                    [
                        f"Title: {result.get('title', 'Untitled')}",
                        f"Link: {result.get('link', 'No link')}",
                        f"Snippet: {result.get('snippet', 'No snippet')}",
                        "-----------------",
                    ]
                )
            )

        return "\nSearch results:\n" + "\n".join(formatted_results)
