# Gateway Instagram Content Crew

A Gateway Garden Center-specific CrewAI project for creating polished, useful, botanically grounded Instagram content.

This replaces the generic Instagram post example with a production workflow built around Gateway's brand standards, horticultural accuracy, seasonal retail context, local authority, and realistic photo/reel direction.

## What this crew produces

Each run generates a complete Instagram content package with:

- Campaign strategy
- Peer/trusted-voice research scan
- Horticulture accuracy review
- Three Instagram concepts
- Captions, hooks, CTAs, hashtags, on-image text, and staff capture notes
- Realistic visual direction for in-store, greenhouse, plant bench, and garden content
- Final QA scoring and recommendation

## Gateway context built in

The project includes Gateway-specific brand context:

- Website: https://gatewaygardens.com
- Address: 7277 Lancaster Pike, Hockessin, Delaware 19707
- Family-owned since 1979
- Native plants, ecological gardening, vibrant annuals, non-invasive plants, pollinator support, and practical garden expertise
- Brand style guidance from the Gateway Brand Style Guide
- Peer/trusted voices:
  - Mt. Cuba Center
  - Longwood Gardens
  - Delaware Center for Horticulture
  - North Creek Nurseries

## Setup

1. Install dependencies:

```bash
uv sync
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Fill in the required keys in `.env`:

```bash
SERPER_API_KEY=your_serper_key
OPENAI_API_KEY=your_openai_key
MODEL=gpt-4o
```

4. Run the crew:

```bash
uv run gateway-instagram
```

or:

```bash
uv run python -m gateway_instagram_content_crew.main
```

## CrewAI AMP deployment

This project is prepared as a CrewAI AMP crew deployment:

- Source package lives in `src/gateway_instagram_content_crew`
- `src/gateway_instagram_content_crew/main.py` exposes `run(inputs=None)` for hosted execution
- `pyproject.toml` includes `[tool.crewai] type = "crew"`
- `GatewayInstagramCrew` uses the required `@CrewBase` decorator

Expected kickoff inputs:

```json
{
  "topic": "Plant, event, sale, service, or seasonal topic",
  "goal": "Store visit, event signup, education, online purchase, or awareness",
  "run_date": "Post date, season, or deadline",
  "audience": "New gardeners, native plant shoppers, houseplant buyers, etc.",
  "details": "Dates, prices, inventory, speaker, location, CTA, link, or plant list",
  "assets": "Photos/videos available or what staff can capture"
}
```

Before deploying to AMP, generate and commit `uv.lock`:

```bash
uv lock
git add uv.lock
git commit -m "Add uv lockfile for CrewAI deployment"
git push
```

Then deploy through CrewAI AMP by connecting this GitHub repository, or use:

```bash
crewai login
crewai deploy create
```

## Recommended intake

The app will ask for:

- Topic
- Goal
- Run date / seasonal context
- Audience
- Must-include details
- Available photos/videos

The better the intake, the better the content. Include real dates, prices, inventory, workshop details, event links, product/stock URLs, or plant lists whenever possible. When you include a URL in the details, the crew can read the page and extract usable context before creating content.

## Output philosophy

This crew is designed to avoid generic garden-influencer copy. It should produce content that feels like Gateway's in-house content team: warm, useful, specific, locally relevant, visually feasible, and grounded in plant knowledge.

## Notes

- Do not store private API keys in the repo.
- The tool uses peer websites as quality benchmarks only. It should not copy their language.
- The horticulture editor is intentionally strict. Unsupported claims should be flagged instead of invented.
