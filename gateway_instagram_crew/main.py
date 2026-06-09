"""Command-line entry point for the Gateway Instagram Content Crew."""

from __future__ import annotations

from dotenv import load_dotenv

from gateway_instagram_crew.crew import GatewayInstagramCrew


def _ask(prompt: str, default: str | None = None) -> str:
    suffix = f" [{default}]" if default else ""
    value = input(f"{prompt}{suffix}\n> ").strip()
    if value:
        return value
    return default or "Not provided"


def run() -> None:
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

    crew = GatewayInstagramCrew(
        topic=topic,
        goal=goal,
        run_date=run_date,
        audience=audience,
        details=details,
        assets=assets,
    )

    result = crew.kickoff()

    print("\n\n############################")
    print("## Final Content Package")
    print("############################\n")
    print(result)


if __name__ == "__main__":
    run()
