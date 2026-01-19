# PostPreview Test Prompts

Use these prompts in ChatGPT to test all PostPreview use cases after connecting the MCP server.

---

## 1. Instagram Only

### Test 1.1: Basic Instagram Post ✅
```
Create an Instagram caption for a photo of a coffee cup in a cozy café 
```

### Test 1.2: Instagram with Image ✅
```
[Upload an image first]
Create an Instagram post for this image with relevant hashtags
```

### Test 1.3: Long Caption ✅
```
Write a detailed Instagram caption (200+ words) about starting a new fitness journey
```

---

## 2. X Thread Only

### Test 2.1: Basic Thread ✅
```
Turn this into a Twitter thread: "Building in public is the best way to learn. You share your progress, get feedback, and iterate faster than building alone."
```

### Test 2.2: Long Content ✅
```
Create a Twitter thread about the top 5 productivity tips for remote workers. Make it engaging with examples.
```

### Test 2.3: Thread with URL ✅
```
Turn this into a Twitter thread: "Just published my new article on AI agents: https://example.com/article - Here's what I learned building it..."
```

---

## 3. Both Platforms (Combined Widget with Tabs)

### Test 3.1: Basic Multi-platform ✅
```
Create both an Instagram post AND a Twitter thread about starting a morning routine
```

### Test 3.2: Multi-platform with Image ✅
```
[Upload an image first]
Create an Instagram post and Twitter thread for this image
```

### Test 3.3: Same content both platforms ✅
```
Generate an Instagram caption and a Twitter thread for: "Just launched my new app after 6 months of building in public. Here's what I learned."
```

---

## 4. Edge Cases

### Test 4.1: Very Short Content ✅
```
Create an Instagram post for: "Hello world"
```

### Test 4.2: Very Long Thread (10+ tweets)
```
Turn this 1000-word blog post into a Twitter thread: [paste long content]
```

### Test 4.3: Emoji Heavy
```
Create an Instagram post about summer vacation with lots of emojis 🌴☀️🏖️
```

---

## Expected Results

| Test | Expected Widget State |
|------|----------------------|
| 1.x | Instagram only, no tabs, "Want to see this as a thread?" prompt |
| 2.x | X thread only, no tabs, "Want to see this as an Instagram post?" prompt |
| 3.x | **Both tabs visible**, user can switch between Instagram and X |
| 4.x | Content-specific behavior |

67fb493c-fjas9jwo17ap9efa.js:2 Uncaught (in promise) DataCloneError: Failed to execute 'postMessage' on 'MessagePort': l=>{var c,h;return(h=(c=X())==null?void 0:c.updateWidgetState)==null?void 0:h.call(c,t,l)} could not be cloned