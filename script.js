document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackContainer = document.getElementById('feedbackContainer');
    const API_URL = 'http://127.0.0.1:5000/api/feedback';

    // 1. Fetch and Display Cards
    async function fetchFeedback() {
        try {
            const response = await fetch(API_URL);
            const result = await response.json();
            const logs = result.data || result;

            if (feedbackContainer) {
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
        } catch (err) { console.error('Fetch Error:', err); }
    }

    // 2. Submit Feedback
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const feedbackData = {
            name: document.getElementById('userName').value,
            event: document.getElementById('eventName').value,
            message: document.getElementById('userMessage').value,
            date: new Date().toLocaleDateString()
        };

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData)
            });

            if (res.ok) {
                const popup = document.getElementById('successPopup');
                popup.classList.remove('hidden');
                setTimeout(() => popup.querySelector('div').classList.add('scale-100'), 10);
                feedbackForm.reset();
                fetchFeedback();
            }
        } catch (err) { alert("Server connection failed!"); }
    });

    window.closePopup = () => {
        document.getElementById('successPopup').classList.add('hidden');
    };

    fetchFeedback();
});