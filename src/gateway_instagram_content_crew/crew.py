"""Crew assembly for Gateway Instagram content production."""

from __future__ import annotations

from crewai import Crew, Process
from crewai.project import CrewBase, crew

from gateway_instagram_content_crew.agents import GatewayInstagramAgents
from gateway_instagram_content_crew.tasks import GatewayInstagramTasks


@CrewBase
class GatewayInstagramCrew:
    """Builds and runs the Gateway Instagram Content Crew."""

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    def __init__(self) -> None:
        self.agent_factory = GatewayInstagramAgents()
        self.task_factory = GatewayInstagramTasks()

    @crew
    def crew(self) -> Crew:
        brand_strategist = self.agent_factory.brand_strategist()
        trusted_voice_researcher = self.agent_factory.trusted_voice_researcher()
        horticulture_editor = self.agent_factory.horticulture_editor()
        instagram_editor = self.agent_factory.instagram_editor()
        visual_director = self.agent_factory.visual_director()
        final_qa_editor = self.agent_factory.final_qa_editor()

        campaign_strategy = self.task_factory.campaign_strategy(
            brand_strategist,
            "{topic}",
            "{goal}",
            "{run_date}",
            "{audience}",
            "{details}",
            "{assets}",
        )
        trusted_voice_scan = self.task_factory.trusted_voice_scan(
            trusted_voice_researcher,
            "{topic}",
        )
        horticulture_review = self.task_factory.horticulture_review(
            horticulture_editor,
            "{topic}",
            "{details}",
        )
        instagram_content = self.task_factory.instagram_content(instagram_editor)
        visual_direction = self.task_factory.visual_direction(visual_director)
        final_qa = self.task_factory.final_qa(final_qa_editor)

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

    def kickoff(self, inputs: dict[str, str] | None = None) -> str:
        return str(self.crew().kickoff(inputs=inputs or {}))
