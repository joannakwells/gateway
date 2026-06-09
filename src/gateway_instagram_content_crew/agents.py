"""Gateway-specific CrewAI agents."""

from __future__ import annotations

import os

from crewai import Agent, LLM

from gateway_instagram_content_crew.tools.search_tools import SearchTools
from gateway_instagram_content_crew.tools.url_tools import URLTools


class GatewayInstagramAgents:
    def __init__(self) -> None:
        llm_kwargs = {"model": os.getenv("MODEL", "gpt-4o")}
        if base_url := os.getenv("LLM_BASE_URL"):
            llm_kwargs["base_url"] = base_url
        self.llm = LLM(**llm_kwargs)

    def brand_strategist(self) -> Agent:
        return Agent(
            role="Gateway Garden Center Brand Strategist",
            goal="Develop Gateway-specific Instagram strategy for seasonal garden center content.",
            backstory="You understand independent garden centers, ecological gardening, native plants, and retail content.",
            tools=[SearchTools.search_web, URLTools.read_url],
            allow_delegation=False,
            llm=self.llm,
            verbose=True,
        )

    def trusted_voice_researcher(self) -> Agent:
        return Agent(
            role="Trusted Horticultural Voice Researcher",
            goal="Use respected horticultural sources as benchmarks for terminology and accuracy.",
            backstory="You extract useful themes and accuracy guardrails without copying source language.",
            tools=[SearchTools.search_web, URLTools.read_url],
            allow_delegation=False,
            llm=self.llm,
            verbose=True,
        )

    def horticulture_editor(self) -> Agent:
        return Agent(
            role="Horticulture Accuracy Editor",
            goal="Check plant, gardening, native plant, pollinator, and seasonal claims for accuracy.",
            backstory="You prevent vague or misleading plant claims and keep content useful for Mid-Atlantic gardeners.",
            tools=[SearchTools.search_web, URLTools.read_url],
            allow_delegation=False,
            llm=self.llm,
            verbose=True,
        )

    def instagram_editor(self) -> Agent:
        return Agent(
            role="Gateway Instagram Editor",
            goal="Write polished, useful, brand-aligned Instagram content.",
            backstory="You write concise, warm, specific content for a premium local garden center.",
            tools=[],
            allow_delegation=False,
            llm=self.llm,
            verbose=True,
        )

    def visual_director(self) -> Agent:
        return Agent(
            role="Gateway Visual Director",
            goal="Create realistic photo, carousel, and reel direction Gateway staff can capture.",
            backstory="You understand botanical, spacious, colorful, practical garden-center visuals.",
            tools=[],
            allow_delegation=False,
            llm=self.llm,
            verbose=True,
        )

    def final_qa_editor(self) -> Agent:
        return Agent(
            role="Gateway Final QA Editor",
            goal="Review content for brand fit, plant accuracy, usefulness, local relevance, and feasibility.",
            backstory="You cut generic content and ensure final outputs are ready for production.",
            tools=[],
            allow_delegation=False,
            llm=self.llm,
            verbose=True,
        )
