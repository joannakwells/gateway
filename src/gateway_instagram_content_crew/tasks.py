"""Gateway Instagram Crew task definitions."""

from __future__ import annotations

from datetime import date
from textwrap import dedent

from crewai import Agent, Task

from gateway_instagram_content_crew.brand_context import GATEWAY_BRAND_CONTEXT, TRUSTED_VOICE_URLS


class GatewayInstagramTasks:
    """Task factory for a sequential Gateway Instagram content workflow."""

    def campaign_strategy(
        self,
        agent: Agent,
        topic: str,
        goal: str,
        run_date: str,
        audience: str,
        details: str,
        assets: str,
    ) -> Task:
        today = date.today().isoformat()
        return Task(
            description=dedent(
                f"""
                Build a focused Instagram campaign strategy for Gateway Garden Center.

                Today: {today}
                Planned post date / seasonal context: {run_date}

                {GATEWAY_BRAND_CONTEXT}

                Campaign intake:
                - Topic: {topic}
                - Primary goal: {goal}
                - Audience: {audience}
                - Must-include details: {details}
                - Available photos/videos or capture options: {assets}

                If the intake includes one or more URLs, use the Read URL tool to
                extract specific plants, product details, event facts, or source
                context before building the strategy. Do not claim you cannot
                browse links until the Read URL tool has failed.

                Return:
                1. Best audience
                2. Best format: Reel, carousel, static post, story, or mixed
                3. Strategic angle
                4. Customer problem, desire, or seasonal moment addressed
                5. Key plant, product, event, or service facts to include
                6. CTA
                7. Missing information or claims that need verification
                """
            ),
            expected_output="A concise Gateway-specific Instagram strategy with CTA and verification notes.",
            agent=agent,
        )

    def trusted_voice_scan(self, agent: Agent, topic: str) -> Task:
        sources = "\n".join(f"- {url}" for url in TRUSTED_VOICE_URLS)
        return Task(
            description=dedent(
                f"""
                Research trusted horticultural voices only as quality benchmarks.

                Topic: {topic}

                Sources:
                {sources}

                If the topic or prior context includes a URL, use the Read URL tool
                for that URL before using web search. Use page text as context only;
                do not copy source language.

                Return:
                1. Relevant themes
                2. Useful educational angles
                3. Terminology Gateway should consider
                4. Claims that require caution
                5. What Gateway can say in its own voice

                Do not copy language from the sources. Keep the end use in mind: Instagram
                content for local garden center customers.
                """
            ),
            expected_output="A benchmark scan of trusted horticultural themes and accuracy guardrails.",
            agent=agent,
        )

    def horticulture_review(self, agent: Agent, topic: str, details: str) -> Task:
        return Task(
            description=dedent(
                f"""
                Review plant and gardening claims for this Gateway Instagram content.

                Topic: {topic}
                Details: {details}

                If details include a URL, use the Read URL tool to inspect the page
                for plant names, care claims, native status, bloom time, exposure,
                and other facts that need verification.

                Focus on:
                - Mid-Atlantic seasonal relevance
                - Native plant and pollinator claims
                - Plant care claims
                - Deer resistance, sun/shade, soil, bloom time, and ecological claims
                - Claims that should be softened or verified

                Return:
                1. Safe claims
                2. Claims to avoid
                3. Suggested accurate phrasing
                4. Any missing details that staff should confirm
                """
            ),
            expected_output="A practical horticulture accuracy review with safe claims and cautions.",
            agent=agent,
        )

    def instagram_content(self, agent: Agent) -> Task:
        return Task(
            description=dedent(
                f"""
                Create Gateway Garden Center Instagram content using the prior strategy,
                trusted-voice scan, and horticulture review.

                {GATEWAY_BRAND_CONTEXT}

                Return exactly three concepts.

                For each concept include:
                1. Concept name
                2. Format: Reel / Carousel / Static / Story
                3. Strategic angle
                4. Opening hook
                5. Caption
                6. On-image text or reel text
                7. CTA
                8. Hashtags, maximum 8
                9. Why this should work

                Requirements:
                - Make it specific to Gateway
                - Make it useful to gardeners
                - Keep captions polished and concise
                - Do not invent sale details, prices, dates, inventory, or claims
                - Flag missing details instead of guessing
                """
            ),
            expected_output="Three complete Instagram content concepts with captions, hooks, CTAs, and hashtags.",
            agent=agent,
        )

    def visual_direction(self, agent: Agent) -> Task:
        return Task(
            description=dedent(
                f"""
                Create realistic visual direction for each proposed Instagram concept.

                {GATEWAY_BRAND_CONTEXT}

                For each concept return:
                1. Hero image or opening reel shot
                2. Supporting shot list or carousel slide plan
                3. Lighting and composition notes
                4. Staff capture notes
                5. Suggested palette
                6. Suggested type hierarchy
                7. Logo or badge usage notes
                8. What not to include

                Direction must be achievable with real plants, staff, benches, containers,
                signage, garden tools, plant tags, greenhouse areas, or customer gardens.
                """
            ),
            expected_output="Realistic photo, reel, and carousel direction for Gateway staff and designers.",
            agent=agent,
        )

    def final_qa(self, agent: Agent) -> Task:
        return Task(
            description=dedent(
                """
                Review and improve the full Gateway Instagram content package.

                Score each concept from 1-5 on:
                - Brand fit
                - Usefulness
                - Local relevance
                - Seasonal relevance
                - Plant accuracy
                - Visual feasibility
                - CTA strength
                - Caption quality

                Remove or rewrite anything that is generic, inaccurate, too salesy,
                visually unrealistic, or not specific to Gateway.

                Return the final approved content package only, including a recommended winner
                and the reason it should be prioritized.
                """
            ),
            expected_output="A final approved Instagram content package with QA scores and a recommended winner.",
            agent=agent,
        )
