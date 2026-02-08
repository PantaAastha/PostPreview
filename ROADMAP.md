# PostPreview V2 Task List

## 🎯 High Priority — Core Value Enhancements

### Caption Quality Scoring
- [ ] Define scoring algorithm (length, emoji, hashtags, CTA detection)
- [ ] Add `captionScore` field to structured output
- [ ] Display score badge in Instagram preview widget
- [ ] Return actionable suggestions array for model narration

### Hashtag Suggestions
- [ ] Create `suggest_hashtags` tool or integrate into existing tools
- [ ] Build hashtag relevance logic based on caption keywords
- [ ] Add hashtag suggestions section to widget UI
- [ ] Include reach/popularity indicators (mock data initially)

### Thread Hook Analysis
- [ ] Implement first-tweet analysis for hook quality
- [ ] Add `hookScore` and `predictions` to thread output
- [ ] Display hook strength indicator in X thread preview
- [ ] Return improvement suggestions

### Caption Variants
- [ ] Create `generate_caption_variants` tool
- [ ] Design variant comparison UI (carousel or tabs)
- [ ] Allow copying individual variants
- [ ] Include variation strategy labels (e.g., "Question hook", "Emoji-heavy")

---

## 💡 Medium Priority — Ecosystem & UX

### Export Enhancements
- [ ] Add "Copy as Markdown" option
- [ ] Add "Copy for Notion" formatted export
- [ ] Unified copy button with format dropdown

### Scheduler Deep Links
- [ ] Research Buffer/Later/Hootsuite URL schemes
- [ ] Add "Schedule with..." button with pre-filled links
- [ ] Make this configurable (show/hide based on user preference)

### Best Post Time Suggestions
- [ ] Add `suggestedPostTime` field to outputs
- [ ] Display as subtle hint in preview widget
- [ ] Include timezone-aware recommendations

### In-Widget Tips & Onboarding
- [ ] Add contextual tips in empty/loading states
- [ ] Show "PostPreview" branding subtly on first render
- [ ] Add "Pro tips" based on content analysis

### Ecosystem Readiness & API Documentation
> *As ChatGPT Apps evolve, multi-app orchestration will become common. Clear APIs enable PostPreview to integrate seamlessly into complex conversation flows.*

- [ ] Document structured output schema (JSON spec for other apps)
- [ ] Ensure stable field names and IDs across versions
- [ ] Add `handoff_metadata` field for scheduling apps (platform, content, suggested_time)
- [ ] Create developer docs (input/output examples, integration patterns)
- [ ] Define versioning strategy for breaking changes
- [ ] Add `source: "postpreview"` tag to outputs for traceability

---

## 🔮 Future Exploration

### Additional Platforms
- [ ] LinkedIn post preview
- [ ] TikTok caption preview
- [ ] Threads (Meta) preview
- [ ] YouTube Shorts caption preview

### Image Analysis Integration
- [ ] Accept image uploads for auto-caption suggestions
- [ ] Use vision API to describe photo context
- [ ] Suggest relevant hashtags based on image content

### Content Calendar View
- [ ] Multi-post planning widget
- [ ] Week/month preview layout
- [ ] Batch caption generation

### Save to Collection (OAuth)
- [ ] Design auth flow for persistent storage
- [ ] Implement draft saving to Supabase or similar
- [ ] Cross-session draft access

---

## 🛠️ Technical Debt / Improvements

- [ ] Add unit tests for caption scoring algorithm
- [ ] Add E2E tests for widget interactions
- [ ] Document API for potential third-party integrations
- [ ] Improve error handling with structured error responses
- [ ] Add telemetry for usage patterns (opt-in)
