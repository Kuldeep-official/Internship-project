document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackContainer = document.getElementById('feedbackContainer');
    const successPopup = document.getElementById('successPopup');
    const eventsModal = document.getElementById('eventsModal');
    const openEventsBtn = document.getElementById('openEventsBtn');
    
    const API_URL = 'https://sysslan-feedbacks.onrender.com/api/feedback';

    function renderFeedbackCards(logs) {
        if (!feedbackContainer) return;
        
        feedbackContainer.innerHTML = '';
        logs.forEach(item => {
            const card = document.createElement('div');
            card.className = 'glass-card p-6 rounded-2xl shadow-xl border border-white/20 mb-4';
            card.innerHTML = `
                <h4 class="font-bold text-gray-900">${item.name}</h4>
                <p class="text-xs text-orange-600 font-black uppercase mb-2">${item.event}</p>
                <p class="text-gray-700 italic">"${item.message}"</p>
                <p class="text-[10px] text-gray-400 mt-2">${item.date}</p>
            `;
            feedbackContainer.appendChild(card);
        });
    }

    async function fetchFeedback() {
        try {
            const response = await fetch(API_URL);
            const result = await response.json();
            const logs = result.data || result;
            renderFeedbackCards(logs);
        } catch (err) { 
            console.error('Fetch Error:', err); 
        }
    }

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const feedbackData = {
                name: document.getElementById('userName').value.trim(),
                event: document.getElementById('eventName').value,
                message: document.getElementById('userMessage').value.trim(),
                date: new Date().toLocaleDateString()
            };

            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(feedbackData)
                });

                if (res.ok) {
                    successPopup.classList.remove('hidden');
                    setTimeout(() => {
                        successPopup.querySelector('div').classList.add('scale-100');
                    }, 10);
                    
                    feedbackForm.reset();
                    fetchFeedback();
                }
            } catch (err) { 
                alert("Server connection failed!"); 
            }
        });
    }

    // Modal Control Logic Hooks
    if (openEventsBtn && eventsModal) {
        openEventsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            eventsModal.classList.remove('hidden');
        });
    }

    window.closePopup = function() {
        if (successPopup) successPopup.classList.add('hidden');
    };

    window.closeEventsModal = function() {
        if (eventsModal) eventsModal.classList.add('hidden');
    };

    fetchFeedback();
});