# PostPreview Test Prompts (Golden Prompt Set)

Use these prompts to test PostPreview's discovery and precision.

---

## Direct Prompts (Explicitly name product/feature)

### Instagram
- "Use PostPreview to create an Instagram caption for my photo"
- "Preview my Instagram post about coffee"
- "Create an Instagram caption with PostPreview"

### X Thread
- "Use PostPreview to turn this into a Twitter thread"
- "Preview my content as a Twitter thread"
- "Create a thread with PostPreview"

### Multi-platform
- "Use PostPreview for both Instagram and Twitter"
- "Preview this for Instagram and X together"

---

## Indirect Prompts (Describe outcome without naming tool)

### Should trigger Instagram tool
- "Help me write a caption for my coffee photo" ✅
- "Create a caption with hashtags for my workout pic" ✅
- "I need to write an Instagram post about my new product launch" ✅

### Should trigger X Thread tool
- "Turn this article into tweets" ✅
- "Split this blog post into a thread" ✅
- "I want to share this long thought on Twitter" ✅

### Should trigger Multiplatform tool
- "Create social media content for Instagram and Twitter" ✅
- "I need posts for both platforms about my launch" ✅

---

## Negative Prompts (Should NOT trigger PostPreview)

### General questions - Do NOT activate
- "Tell me about Instagram marketing strategies" ❌
- "What's the best time to post on Twitter?" ❌
- "How do I grow my Instagram following?" ❌

### Scheduling/Posting - Do NOT activate
- "Schedule this post for 3pm" ❌
- "Post this to my Instagram account" ❌
- "Tweet this for me" ❌

### Other tools should handle
- "What's the weather today?" ❌
- "Summarize this article" ❌
- "Write me an email" ❌

---

## Expected Behavior Summary

| Prompt Type | Expected |
|-------------|----------|
| Direct prompts | Tool activates immediately |
| Indirect prompts | Tool activates based on intent |
| Negative prompts | Tool does NOT activate |

---

## Edge Case Tests

### Very short content
```
Create an Instagram post for: "Hello world"
```

### Very long thread (10+ tweets)
```
Turn this 1000-word blog post into a Twitter thread: [paste long content]
```

### With image upload
```
[Upload image first]
Create an Instagram post for this image
```

---

## Widget State Expectations

| Scenario | Widget State |
|----------|--------------|
| Instagram only | No tabs, shows "Want as thread?" prompt |
| X thread only | No tabs, shows "Want as Instagram?" prompt |
| Both platforms | Tabs visible, can switch between |