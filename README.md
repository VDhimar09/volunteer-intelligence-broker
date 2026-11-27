# Volunteer Intelligence Broker

A small prototype exploring explainable matching between volunteer preferences and volunteer opportunities.

Built for the **Volunteer Management Data Scientist & Software Engineer KTP Associate** assessment (TeamKinetic × Nottingham Trent University VCSE Observatory).

## What it demonstrates

- Hard feasibility checks are applied before preference ranking.
- Opportunity wording can be matched using a hand-defined semantic vocabulary/tags rather than exact keyword overlap.
- Preference scores are illustrative and explainable; they are not probabilities.
- Opportunities are separated into confirmed, conditional (requires verification), and excluded outcomes.
- Matching results react to changes in the volunteer profile.

## Run locally

Requirements: Node.js and npm.

1. Clone or download this repository.
2. Open a terminal in the project folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed by Vite in your browser.

## Checks

Run the matching-engine tests:

```bash
npm run test:engine
```

Run TypeScript type checking:

```bash
npm run typecheck
```

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## Assessment test cases

The prototype includes two fictional volunteer profiles:

- **Case A:** 1:1 volunteering, preferably digital-support related, weekday evenings, online acceptable, maximum 3 miles; safeguarding validity is unknown.
- **Case B:** Same preferences, but online volunteering is no longer acceptable.

The opportunity dataset is fictional and intentionally small. Results demonstrate the matching logic and are not evidence of real-world matching performance.

## Matching approach

1. **Hard constraints / feasibility:** availability, online or in-person preference, distance limits, and eligibility or verification requirements.
2. **Preference ranking:** feasible opportunities are ranked using an illustrative weighted score for activity/interests, skills, 1:1 versus group preference, schedule preference, and other fit.
3. **Uncertainty:** unknown information is not treated as confirmed. Opportunities that need a coordinator check are shown as conditional.

Hard constraints cannot be overridden by a high preference score.

## Limitations

- Uses a small fictional dataset.
- Semantic matching is based on manually defined tags/vocabulary; no trained model or live AI service is used.
- Scores are illustrative, not calibrated probabilities.
- Distance, eligibility, and other missing facts may require human verification.
- No TeamKinetic integration or live data connection is implemented.

## Tools and development

The prototype was created and iterated in Bolt using React, TypeScript, Vite, and Tailwind CSS. The matching logic is deterministic and can be inspected in the source code.
