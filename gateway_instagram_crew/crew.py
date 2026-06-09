"""Crew assembly for Gateway Instagram content production."""

from __future__ import annotations

from crewai import Crew, Process

from gateway_instagram_crew.agents import GatewayInstagramAgents
from gateway_instagram_crew.tasks import GatewayInstagramTasks


class GatewayInstagramCrew:
    """Builds and runs the Gateway Instagram Content Crew."""

    def __init__(
        self,
        topic: str,
        goal: str,
        run_date: str,
        audience: str,
        details: str,
        assets: str,
    ) -> None:
        self.topic = topic
        self.goal = goal
        self.run_date = run_date
        self.audience = audience
        self.details = details
        self.assets = assets

        self.agents = GatewayInstagramAgents()
        self.tasks = GatewayInstagramTasks()

    def build(self) -> Crew:
        brand_strategist = self.agents.brand_strategist()
        trusted_voice_researcher = self.agents.trusted_voice_researcher()
        horticulture_editor = self.agents.horticulture_editor()
        instagram_editor = self.agents.instagram_editor()
        visual_director = self.agents.visual_director()
        final_qa_editor = self.agents.final_qa_editor()

        campaign_strategy = self.tasks.campaign_strategy(
            brand_strategist,
            self.topic,
            self.goal,
            self.run_date,
            self.audience,
            self.details,
            self.assets,
        )
        trusted_voice_scan = self.tasks.trusted_voice_scan(trusted_voice_researcher, self.topic)
        horticulture_review = self.tasks.horticulture_review(
            horticulture_editor,
            self.topic,
            self.details,
        )
        instagram_content = self.tasks.instagram_content(instagram_editor)
        visual_direction = self.tasks.visual_direction(visual_director)
        final_qa = self.tasks.final_qa(final_qa_editor)

        return Crew(
            agents=[
                brand_strategist,
                trusted_voice_researcher,
                horticulture_editor,
                instagram_editor,
                visual_director,
                final_qa_editor,
            ],
            tasks=[
                campaign_strategy,
                trusted_voice_scan,
                horticulture_review,
                instagram_content,
                visual_direction,
                final_qa,
            ],
            process=Process.sequential,
            verbose=True,
        )

    def kickoff(self) -> str:
        return str(self.build().kickoff())
