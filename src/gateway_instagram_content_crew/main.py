"""Command-line entry point for the Gateway Instagram Content Crew."""

from __future__ import annotations

from typing import Any

from dotenv import load_dotenv

from gateway_instagram_content_crew.crew import GatewayInstagramCrew


DEFAULT_INPUTS = {
    "topic": "Seasonal Gateway Garden Center Instagram content",
    "goal": "Store visit and customer education",
    "run_date": "Not provided",
    "audience": "Gateway's local customers and gardeners",
    "details": "Not provided",
    "assets": "Real plants, benches, tags, containers, greenhouse, staff hands, and store displays",
}


def _ask(prompt: str, default: str | None = None) -> str:
    suffix = f" [{default}]" if default else ""
    value = input(f"{prompt}{suffix}\n> ").strip()
    if value:
        return value
    return default or "Not provided"


def run(inputs: dict[str, Any] | None = None) -> str:
    """Run the crew with API/AMP inputs."""
    load_dotenv()

    crew_inputs = {**DEFAULT_INPUTS, **(inputs or {})}
    normalized_inputs = {
        "topic": str(crew_inputs["topic"]),
        "goal": str(crew_inputs["goal"]),
        "run_date": str(crew_inputs["run_date"]),
        "audience": str(crew_inputs["audience"]),
        "details": str(crew_inputs["details"]),
        "assets": str(crew_inputs["assets"]),
    }

    return GatewayInstagramCrew().kickoff(inputs=normalized_inputs)


def run_interactive() -> None:
    """Run the crew from a local terminal prompt."""
    load_dotenv()

    print("## Gateway Instagram Content Crew")
    print("---------------------------------")
    print("Create brand-aligned Instagram strategy, copy, visual direction, and QA.\n")

    topic = _ask("What is this post about? Plant, event, sale, service, or seasonal topic?")
    goal = _ask(
        "Primary goal? Store visit, event signup, education, online purchase, or awareness?",
        "Store visit and customer education",
    )
    run_date = _ask("When will this post run? Include season, date, or deadline.")
    audience = _ask(
        "Who is this for? New gardeners, native plant shoppers, houseplant buyers, etc.?",
        "Gateway's local customers and gardeners",
    )
    details = _ask(
        "Must-include details: dates, prices, inventory, speaker, location, CTA, link, or plant list."
    )
    assets = _ask(
        "What photos/videos do you have or can staff capture?",
        "Real plants, benches, tags, containers, greenhouse, staff hands, and store displays",
    )

    result = GatewayInstagramCrew().kickoff(
        inputs={
            "topic": topic,
            "goal": goal,
            "run_date": run_date,
            "audience": audience,
            "details": details,
            "assets": assets,
        }
    )

    print("\n\n############################")
    print("## Final Content Package")
    print("############################\n")
    print(result)


if __name__ == "__main__":
    run_interactive()
