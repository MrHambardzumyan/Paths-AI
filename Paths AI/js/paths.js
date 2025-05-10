document.addEventListener('DOMContentLoaded', () => {
    const options = ['good', 'neutral', 'bad'];

    options.forEach(option => {
        const container = document.querySelector('.' + option);
    
        const ai_response = document.createElement('div');
        ai_response.innerHTML = marked.marked(localStorage.getItem(option));
    
    
        // Image wrappers
        const images = ai_response.querySelectorAll('img');
        images.forEach(image => {
            const wrapper = document.createElement('div');
            wrapper.classList = 'image_wrapper';
    
            image.classList = 'preloaded';
            image.onload = function() {
                image.classList = 'loaded';
            }
    
            image.parentNode.insertBefore(wrapper, image);
    
            wrapper.appendChild(image);
        })
    
    
        container.appendChild(ai_response);
    })
    
});

function back() {
    window.location.href = '../index.html';
}

function openJournals() {
    const popup = document.querySelector('#journals_popup');
    popup.show();

    let journals = JSON.parse(localStorage.getItem('journals')) || false;

    if(journals) {
        const journal_list = document.getElementById('journal_list');
        journal_list.innerHTML = '';

        journals.forEach(journal => {
            const div = document.createElement('div');
            div.classList = 'journal_holder';

            const entry = document.createElement('div');
            entry.classList = 'journal_entry';
            entry.textContent = journal;

            const X = document.createElement('div');
            X.textContent = "X";
            X.classList = 'X';
            X.onclick = function() {
                localStorage.removeItem(journal);
                localStorage.removeItem(journal + " - AI");
                journals = journals.filter(item => item !== journal);
                localStorage.setItem('journals', JSON.stringify(journals));
                closeJournals();
                openJournals();
            }

            entry.onclick = function() {
                viewOldJournal(journal);
            }

            div.appendChild(entry);
            div.appendChild(X);

            journal_list.appendChild(div);
        });
    }


}

function closeJournals() {
    const popup = document.querySelector('#journals_popup');
    popup.close();
}

function closeNewJournalEntry() {
    const popup = document.querySelector('#journal_entry_popup');
    popup.close();
}

function showNewJournalEntry() {
    const journal_entry_popup = document.querySelector('#journal_entry_popup'); 
    journal_entry_popup.show();
}

function showLoading() {
    const popup = document.getElementById('loading_popup');
    popup.show();

    const dots = document.querySelector('#dots');
    let count = 0;
    setInterval(() => {
      count = (count + 1) % 4; 
      if(count === 0) {
        count = 1;
      }
      dots.textContent = '.'.repeat(count);
    }, 500);
}

function closeLoading() {
    const popup = document.getElementById('loading_popup');
    popup.close();
}

function openPastJournalEntry() {
    const popup = document.querySelector('#past_journal_entry');
    popup.show();
}

function closePastJournalEntry() {
    const popup = document.querySelector('#past_journal_entry');
    popup.close();
}


async function addNewJournal() {    
    const entry = document.querySelector('#entry_input').value;
    closeNewJournalEntry();
    closeJournals();
    showLoading();

    const currentDate = new Date();
    const date = currentDate.toLocaleDateString();

    // Allows multiple entries for a day
    let i = 1;
    while(true) {
        if(!localStorage.getItem(date + " - " + i)) {
            break;
        }
        i++;
    }

    const entry_name = date + " - " + i;


    const ai_response = await textGeneration("User entry: " + entry + "Good path: " + localStorage.getItem('good') + "Neutral Path: " + localStorage.getItem('neutral') + "Bad Path: " + localStorage.getItem('bad'), "User has made an entry. Based on user entry, give small report of what path they are moving towards and why. Strictly write the report about the path the user is on based on events in entry. You are writing this report to user. Be purely logical, don't be optimistic or pessimestic, logic only. Do not write anything else.");

    localStorage.setItem(entry_name, entry);
    localStorage.setItem(entry_name + " - AI", ai_response);

    const ai_notes = await textGeneration("User Entry: " + localStorage.getItem(entry_name) + "Your response: " + ai_response + "Previous Notes: " + localStorage.getItem('notes'), "Based on User Entry and Your Response, add on(or override if needed) to Previous Notes about essential information. Output should be previous notes and an add on of that based on current entry. If no essential information is found, output should be Previous Notes. Make sure to write only essential information in bullet point format. Make sure your notes are very short and only relevant to entries like 'good score on test' or 'proud of eating out'. Do not write anything else except for what I asked.");
    localStorage.setItem('notes', ai_notes);

    // If notes have gotten too large
    if(localStorage.getItem('notes').length > 20000) {
        const summarized_ai_notes = await textGeneration(localStorage.getItem('notes'), "You are an AI summarizer. Summarize notes using same format(bullet points) and keep notes short. Lean towards more recent notes. Do not write anything else.");
        localStorage.setItem('notes', ai_notes);
    }

    viewOldJournal(entry_name);

    let journals = JSON.parse(localStorage.getItem('journals')) || false;

    // If journals don't exist, create journals
    if(!journals) {
        journals = [];
    }

    journals.unshift(entry_name);

    localStorage.setItem('journals', JSON.stringify(journals));

    openJournals();
    closeLoading();
    openPastJournalEntry();
}

function viewOldJournal(journal) {
    const regenerate_entry = document.querySelector('#regenerate_entry');
    regenerate_entry.onclick = function() {
        regenerateEntry(journal);
    }
    
    const container = document.querySelector('#past_entry_inner_container');
    container.innerHTML = '';
    const h1 = document.createElement('h1');
    h1.textContent = journal;
    const p = document.createElement('p');
    const hr = document.createElement('hr');
    p.textContent = localStorage.getItem(journal);

    const div = document.createElement('div');
    
    div.innerHTML = marked.marked(localStorage.getItem(journal + " - AI"));

    container.appendChild(h1);
    container.appendChild(p);
    container.appendChild(hr);
    container.appendChild(div);

    openPastJournalEntry();
}

async function regenerateEntry(journal) {
    closePastJournalEntry();
    showLoading();

    const container = document.querySelector('#past_entry_inner_container');
    container.innerHTML = '';
    const h1 = document.createElement('h1');
    h1.textContent = journal;
    const p = document.createElement('p');
    const hr = document.createElement('hr');
    p.textContent = localStorage.getItem(journal);

    const div = document.createElement('div');
    const ai_response = await textGeneration("User entry: " + localStorage.getItem(journal) + "Good path: " + localStorage.getItem('good') + "Neutral Path: " + localStorage.getItem('neutral') + "Bad Path: " + localStorage.getItem('bad') + "Previous Notes: " + localStorage.getItem('notes'), "User has made an entry. Based on user entry, give small report of what path they are moving towards and why. Strictly write the report about the path the user is on based on events in entry. You are writing this report to user. Be purely logical, don't be optimistic or pessimestic, logic only. Do not write anything else.");
    localStorage.setItem(journal + " - AI", ai_response);

    const ai_notes = await textGeneration("User Entry: " + localStorage.getItem(journal) + "Your response: " + ai_response + "Previous Notes: " + localStorage.getItem('notes'), "Based on User Entry and Your Response, add on(or override if needed) to Previous Notes about essential information. Output should be previous notes and an add on of that based on current entry. If no essential information is found, output should be Previous Notes. Make sure to write only essential information in bullet point format. Make sure your notes are very short and only relevant to entries like 'good score on test' or 'proud of eating out'. Do not write anything else except for what I asked.");
    localStorage.setItem('notes', ai_notes);

    // If notes have gotten too large
    if(localStorage.getItem('notes').length > 20000) {
        const summarized_ai_notes = await textGeneration(localStorage.getItem('notes'), "You are an AI summarizer. Summarize notes using same format(bullet points) and keep notes short. Lean towards more recent notes. Do not write anything else.");
        localStorage.setItem('notes', ai_notes);
    }
    
    div.innerHTML = marked.marked(localStorage.getItem(journal + " - AI"));

    container.appendChild(h1);
    container.appendChild(p);
    container.appendChild(hr);
    container.appendChild(div);

    closeLoading();
    openPastJournalEntry();
}

function checkConditionsForEntrySubmission() {
    const entry = document.querySelector('#entry_input').value;

    const submit = document.querySelector('#submit_entry');
    if(entry === "" || entry === null) {
        submit.disabled = true;
    } else {
        submit.disabled = false;
    }
}

function deleteAllJournals() {
    const journals = JSON.parse(localStorage.getItem('journals'));
    journals.forEach(journal => {
        localStorage.removeItem(journal);
        localStorage.removeItem(journal + " - AI");
    })

    localStorage.removeItem('notes');
    localStorage.setItem('journals', JSON.stringify([]));

    closeJournals();
    openJournals();
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