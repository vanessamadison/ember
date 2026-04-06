# EMBER — GenAI Prompt Provenance Log

Per NLnet policy on the use of Generative Artificial Intelligence (v1.1, January 26, 2026).

## Model Used

Claude Opus 4.6 (Anthropic) via Claude Desktop / Cowork mode

## Application Preparation

**Date**: March 31, 2026
**Purpose**: Assistance with proposal drafting, technical documentation, and PDF creation
**Prompts**: Iterative conversation requesting help with NLnet NGI Zero Commons Fund application, including drafting answers to form fields based on project technical details, creating a PDF technical overview attachment, and formatting submission content.
**Human contribution**: All technical architecture decisions, encryption design, CRDT selection, technology stack choices, project vision, and community resilience strategy were conceived and directed by the project lead (Vanessa Madison). Claude assisted with articulating these decisions in grant-appropriate language and formatting.
**Editing**: All outputs were reviewed, edited, and approved by the project lead before submission.

## Project Development

**Dates**: March 2026 (ongoing)
**Purpose**: Code generation assistance for React Native components, WatermelonDB models, encryption modules, CRDT sync engine, theme system, and Expo Router screens.
**Model**: Claude Opus 4.6 (Anthropic)
**Disclosure method**: All commits containing AI-assisted code include `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` in the commit message, distinguishing human-authored from AI-assisted contributions per NLnet policy Note 2.
**Human contribution**: Architecture design, security model, encryption algorithm selection, data schema design, feature specification, and all review/testing performed by the project lead. Claude assisted with implementation of specified designs, boilerplate generation, and documentation.

## General Stance

EMBER uses GenAI (Claude, Anthropic) as a development assistant for code generation, documentation, and proposal preparation. All architectural decisions, security design, and creative direction are human-led. AI-assisted contributions are marked in git history via Co-Authored-By tags. The project lead understands and can explain all design and code decisions.
