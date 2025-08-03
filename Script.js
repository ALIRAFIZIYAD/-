document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const voiceButton = document.getElementById('voiceButton');
    const themeToggle = document.getElementById('themeToggle');
    const newChatBtn = document.getElementById('newChatBtn');
    const navToggle = document.getElementById('navToggle');
    const sideNav = document.querySelector('.side-nav');
    const logoutBtn = document.getElementById('logoutBtn');
    const typingIndicator = document.getElementById('typingIndicator');
    const quickButtons = document.querySelectorAll('.quick-btn');
    
    // App state
    let isDarkMode = false;
    let recognition;
    let currentSeason = getCurrentSeason();
    
    // Initialize the app
    init();
    
    function init() {
        // Set seasonal theme
        document.body.classList.add(`season-${currentSeason}`);
        
        // Load theme preference from localStorage
        const savedTheme = localStorage.getItem('seazonai-theme');
        if (savedTheme === 'dark') {
            toggleTheme();
        }
        
        // Set up event listeners
        sendButton.addEventListener('click', handleSend);
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && userInput.value.trim()) {
                handleSend();
            }
        });
        
        voiceButton.addEventListener('click', toggleVoiceRecognition);
        themeToggle.addEventListener('click', toggleTheme);
        newChatBtn.addEventListener('click', startNewChat);
        navToggle.addEventListener('click', toggleNav);
        logoutBtn.addEventListener('click', handleLogout);
        
        quickButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const prompt = this.getAttribute('data-prompt');
                userInput.value = prompt;
                handleSend();
            });
        });
        
        // Initialize voice recognition if available
        initVoiceRecognition();
        
        // Display seasonal welcome message
        displaySeasonalWelcome();
    }
    
    function getCurrentSeason() {
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
    }
    
    function displaySeasonalWelcome() {
        const seasonMessages = {
            spring: "Spring is here! A perfect time for planting and fresh starts.",
            summer: "Summer has arrived! Great time for outdoor activities and fresh produce.",
            autumn: "Autumn is upon us! Harvest season and cozy recipes await.",
            winter: "Winter is here! Time for hearty meals and indoor gardening tips."
        };
        
        addMessage(seasonMessages[currentSeason], false);
    }
    
    function initVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                handleSend();
            };
            
            recognition.onerror = function(event) {
                console.error('Voice recognition error', event.error);
                addMessage("Sorry, I couldn't understand that. Please try typing instead.", false);
            };
        } else {
            voiceButton.style.display = 'none';
        }
    }
    
    function handleSend() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            userInput.value = '';
            getAIResponse(message);
        }
    }
    
    function addMessage(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        if (!isUser) {
            const avatar = document.createElement('div');
            avatar.className = 'ai-avatar';
            avatar.innerHTML = '<i class="fas fa-leaf"></i>';
            messageDiv.appendChild(avatar);
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Simple markdown parsing
        let formattedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
        
        contentDiv.innerHTML = formattedContent;
        messageDiv.appendChild(contentDiv);
        
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    function getAIResponse(userMessage) {
        // Show typing indicator
        typingIndicator.style.display = 'flex';
        
        // Simulate thinking time based on message length
        const delay = Math.min(Math.max(userMessage.length * 20, 1000), 3000);
        
        setTimeout(() => {
            typingIndicator.style.display = 'none';
            generateAIResponse(userMessage);
        }, delay);
    }
    
    function generateAIResponse(userMessage) {
        let response;
        const lowerMsg = userMessage.toLowerCase();
        
        // Seasonal responses
        if (lowerMsg.includes('season') || lowerMsg.includes(currentSeason)) {
            response = getSeasonalResponse();
        } 
        // Recipe responses
        else if (lowerMsg.includes('recipe') || lowerMsg.includes('cook') || lowerMsg.includes('make')) {
            response = getRecipeResponse();
        }
        // Gardening responses
        else if (lowerMsg.includes('garden') || lowerMsg.includes('plant') || lowerMsg.includes('grow')) {
            response = getGardeningResponse();
        }
        // General responses
        else {
            response = getGeneralResponse(userMessage);
        }
        
        addMessage(response, false);
    }
    
    function getSeasonalResponse() {
        const seasonalResponses = {
            spring: [
                "Spring is perfect for planting lettuce, peas, and radishes. They thrive in cooler temperatures!",
                "Did you know spring is the best time to start a compost pile? The moisture helps with decomposition.",
                "Consider planting native wildflowers this spring to support local pollinators."
            ],
            summer: [
                "Summer is great for tomatoes, peppers, and cucumbers. Make sure to water them regularly in the heat!",
                "Harvest herbs in the morning when their essential oils are most concentrated.",
                "Mulch your garden beds to retain moisture during hot summer months."
            ],
            autumn: [
                "Autumn is ideal for planting garlic and onions for next year's harvest.",
                "Collect fallen leaves to make leaf mold - a fantastic soil conditioner!",
                "Now's the time to preserve your harvest - try canning, freezing, or drying."
            ],
            winter: [
                "Winter is perfect for planning next year's garden. Sketch out your planting layout!",
                "Grow microgreens indoors for fresh greens during winter months.",
                "Protect your soil by planting cover crops like winter rye."
            ]
        };
        
        return seasonalResponses[currentSeason][Math.floor(Math.random() * seasonalResponses[currentSeason].length)];
    }
    
    function getRecipeResponse() {
        const recipeResponses = {
            spring: [
                "Try a fresh spring salad with baby greens, radishes, and a lemon vinaigrette!",
                "How about making asparagus risotto with this season's fresh asparagus?",
                "Spring pea soup is a delicious way to enjoy seasonal produce."
            ],
            summer: [
                "A classic caprese salad with fresh tomatoes, basil, and mozzarella is perfect for summer!",
                "Grilled zucchini and eggplant make a wonderful summer side dish.",
                "Try making homemade strawberry ice cream with fresh summer berries."
            ],
            autumn: [
                "Roasted butternut squash soup is a comforting autumn meal.",
                "Make a hearty apple and pork stew with seasonal apples.",
                "Try baking pumpkin bread with fresh pumpkin puree."
            ],
            winter: [
                "A slow-cooked beef stew is perfect for cold winter nights.",
                "Make roasted root vegetables with seasonal carrots, parsnips, and potatoes.",
                "Hot chocolate with homemade marshmallows is a wonderful winter treat."
            ]
        };
        
        return recipeResponses[currentSeason][Math.floor(Math.random() * recipeResponses[currentSeason].length)];
    }
    
    function getGardeningResponse() {
        const gardeningResponses = {
            spring: [
                "Start your seeds indoors 6-8 weeks before the last frost date.",
                "Prepare your garden beds by removing weeds and adding compost.",
                "Prune fruit trees before buds break for better fruit production."
            ],
            summer: [
                "Water deeply in the morning to prevent evaporation loss.",
                "Watch for pests like aphids and use organic controls when possible.",
                "Harvest vegetables regularly to encourage more production."
            ],
            autumn: [
                "Plant spring-flowering bulbs like tulips and daffodils in fall.",
                "Clean up garden debris to reduce overwintering pests and diseases.",
                "Divide and transplant perennials in early fall."
            ],
            winter: [
                "Protect tender plants with mulch or row covers.",
                "Sharpen and oil your garden tools during the winter downtime.",
                "Start planning next year's garden and order seeds early."
            ]
        };
        
        return gardeningResponses[currentSeason][Math.floor(Math.random() * gardeningResponses[currentSeason].length)];
    }
    
    function getGeneralResponse(userMessage) {
        const generalResponses = [
            `I understand you're asking about "${userMessage}". That's an interesting seasonal topic!`,
            "Let me think about that... Here's what I can tell you based on the current season.",
            "That's a great question! Seasonal changes do affect that in interesting ways.",
            "I'm designed to help with seasonal activities. Based on that, here's my response..."
        ];
        
        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
    
    function toggleVoiceRecognition() {
        if (!recognition) {
            addMessage("Voice recognition is not supported in your browser. Please try typing instead.", false);
            return;
        }
        
        if (voiceButton.classList.contains('recording')) {
            recognition.stop();
            voiceButton.classList.remove('recording');
            voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        } else {
            recognition.start();
            voiceButton.classList.add('recording');
            voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            addMessage("Listening... Speak now.", false);
        }
    }
    
    function toggleTheme() {
        isDarkMode = !isDarkMode;
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('seazonai-theme', isDarkMode ? 'dark' : 'light');
    }
    
    function startNewChat() {
        while (chatBox.firstChild) {
            chatBox.removeChild(chatBox.firstChild);
        }
        
        // Re-add welcome message
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-message';
        welcomeDiv.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-leaf"></i>
            </div>
            <div class="message-content">
                <h3>Welcome to Seazon AI!</h3>
                <p>I'm your seasonal assistant, here to help with recipes, gardening tips, and seasonal activities based on the current ${currentSeason} season.</p>
                <div class="quick-actions">
                    <button class="quick-btn" data-prompt="What's in season this month?">
                        <i class="fas fa-calendar-week"></i> Seasonal Produce
                    </button>
                    <button class="quick-btn" data-prompt="Suggest a ${currentSeason} recipe">
                        <i class="fas fa-utensils"></i> Recipe Ideas
                    </button>
                    <button class="quick-btn" data-prompt="${currentSeason} gardening tips">
                        <i class="fas fa-seedling"></i> Gardening Tips
                    </button>
                </div>
            </div>
        `;
        chatBox.appendChild(welcomeDiv);
        
        // Reattach event listeners to quick buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const prompt = this.getAttribute('data-prompt');
                userInput.value = prompt;
                handleSend();
            });
        });
        
        displaySeasonalWelcome();
    }
    
    function toggleNav() {
        sideNav.classList.toggle('active');
    }
    
    function handleLogout() {
        localStorage.removeItem('seazonai-authenticated');
        window.location.href = 'auth/signin.html';
    }
});
