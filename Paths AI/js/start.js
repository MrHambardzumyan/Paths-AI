function back() {
  window.location.href = "../index.html"
}

async function formSubmit(event) {
    event.preventDefault();

    const submit = document.querySelector('#submit');
    submit.disabled = true;

    const loading = document.querySelector('#loading');
    loading.show();

    const dots = document.querySelector('#dots');
    let count = 0;
    setInterval(() => {
      count = (count + 1) % 4; 
      if(count === 0) {
        count = 1;
      }
      dots.textContent = '.'.repeat(count);
    }, 500);

    const user_input = (document.getElementById('input')).value;
    localStorage.setItem('input', JSON.stringify(user_input));
  
    function system(direction) {
      return `
      You are an AI that predicts the user's future based on the prompt and the set direction. The current direction is "${direction}". You must strictly adhere to this direction in your predictions: Make sure to follow presentage given in analysis.

    - If the direction is "good", describe a positive and uplifting future. Images should be good beautiful scenes.
    - If the direction is "bad", describe a bleak and challenging future. Images should be bleak and sad scenes.
    - If the direction is "neutral", describe a balanced and uneventful future with both ups and downs. Images should be uneventful but not sad nor happy scenes.

    Use the provided user information to craft a prediction that aligns strictly with the given direction. Reflect the emotional tone, events, and outcomes to match the chosen path. Occasionally include square-shaped scenery images (no people), formatted like this:
    ![{description}](https://image.pollinations.ai/prompt/{description}?width=400&height=400&nologo=true&model=${localStorage.getItem('image_model') || 'flux'})

    Use this format:
    "Probability: %

    ---

    Events:
    - Event 1
    - Event 2 
    - Event 3

    ---

    {IMAGE HERE}

    ---

    Mindset:
    {Describe mindset here}

    ---

    Relationship: 
    {Describe mindset here}

    ---
    
    Progress: 
    {Describe progress here}

    ---
    
    {IMAGE HERE}
    
    ---
    
    Final Message: 
    Advice to make future good and prevent the bad future from occuring. However, advice should be different based on current direction. If direction is good, advice should be how to get it. If direction is neutral, advice should be how to improve. If direction is bad, advice should be how to prevent and improve."


    Do not write anything except the future prediction and images, and stay consistent with the direction at all times. Use markdown in a cool way.`
    }

    // Overall Analysis
    const analysis = await textGeneration(user_input, "Analyze user information. Write percentages for good, neutral, and bad paths while making sure they all add up to 100%. Explain why in each.");
    
    const ai_notes = await textGeneration("User Entry: " + localStorage.getItem('input'), "Based on User Entry, write about essential information. Make sure to write only essential information in bullet point format. Make sure your notes are very short and only relevant to entries like 'good score on test' or 'proud of eating out'. Do not write anything else except for what I asked.");
    
    localStorage.setItem('notes', ai_notes);

    // Good path
    const good = await textGeneration(user_input, system('good') + 'Additional Info: ' + analysis);
    localStorage.setItem('good', good);

    // Neutral Path
    const neutral = await textGeneration(user_input, system('neutral')  + 'Additional Info: ' + analysis);
    localStorage.setItem('neutral', neutral);
    
    // Bad Path
    const bad = await textGeneration(user_input, system('bad')  + 'Additional Info: ' + analysis);
    localStorage.setItem('bad', bad);

    // Confirm user has played before
    localStorage.setItem('already_played', true);

    window.location.href = '../html/paths.html';
}

async function textGeneration(prompt, system) {
    const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: prompt },
            { role: 'system', content: system }
          ],
              model: 'openai',
              private: true,
              seed: Math.random() * 1000,
              temperature: localStorage.getItem('temperature') || 0.7,
              max_tokens: localStorage.getItem('max_tokens') || 4092,
          })
      });
  
  const data = await response.text();
  return data;
} 