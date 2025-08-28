// Minimal, fast chat client powered by Python service
(function() {
  const messagesEl = document.getElementById('messages');
  const inputEl = document.getElementById('input');
  const sendBtn = document.getElementById('send');
  const wsStatusEl = document.getElementById('ws-status');
  const suggEl = document.getElementById('suggestions');

  const HTTP_URL = (window.CHAT_PY_API_URL || 'http://localhost:8000') + '/chat';
  const WS_URL = window.CHAT_PY_WS_URL || 'ws://localhost:8000/ws';

  let ws;
  let isWsOpen = false;

  function setWsStatus(text) {
    if (wsStatusEl) wsStatusEl.textContent = text;
  }

  function connectWS() {
    try {
      ws = new WebSocket(WS_URL);
      setWsStatus('WS: connecting');
      ws.onopen = () => { isWsOpen = true; setWsStatus('WS: open'); };
      ws.onclose = () => { isWsOpen = false; setWsStatus('WS: closed'); retryWS(); };
      ws.onerror = () => { setWsStatus('WS: error'); };
      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.type === 'message' && data.role === 'assistant') {
            addMessage(data.content, 'ai');
          }
        } catch (_) { /* ignore */ }
      };
    } catch (_) {
      setWsStatus('WS: unsupported');
    }
  }

  let retryTimer;
  function retryWS() {
    clearTimeout(retryTimer);
    retryTimer = setTimeout(connectWS, 1500);
  }

  function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  function addMessage(text, who) {
    if (!messagesEl) return;
    const wrap = document.createElement('div');
    wrap.className = 'msg ' + (who === 'user' ? 'user' : 'ai');
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    // Render markdown for AI messages safely
    if (who === 'ai' && window.marked && window.DOMPurify) {
      const html = window.marked.parse(String(text || ''));
      bubble.innerHTML = window.DOMPurify.sanitize(html);
    } else {
      bubble.textContent = text;
    }
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'msg ai';
    div.id = 'typing-row';
    div.innerHTML = '<div class="bubble"><span class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span></div>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('typing-row');
    if (t && t.parentNode) t.parentNode.removeChild(t);
  }

  async function sendCurrentMessage() {
    const text = (inputEl.value || '').trim();
    if (!text) return;
    addMessage(text, 'user');
    inputEl.value = '';
    autoGrow(inputEl);

    if (isWsOpen && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'message', content: text }));
      showTyping();
      return;
    }

    try {
      showTyping();
      const res = await fetch(HTTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      hideTyping();
      addMessage(data.reply || '...', 'ai');
      if (Array.isArray(data.suggestions)) renderSuggestions(data.suggestions);
    } catch (e) {
      hideTyping();
      addMessage('Sorry, something went wrong. Please try again.', 'ai');
    }
  }

  function renderSuggestions(items) {
    if (!suggEl) return;
    suggEl.innerHTML = '';
    items.slice(0, 6).forEach((label) => {
      const b = document.createElement('button');
      b.className = 'sugg';
      b.textContent = label;
      b.addEventListener('click', () => {
        inputEl.value = label;
        autoGrow(inputEl);
        sendCurrentMessage();
      });
      suggEl.appendChild(b);
    });
  }

  // assist panel shortcuts
  document.querySelectorAll('.assist-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const k = chip.getAttribute('data-help');
      const map = {
        crisis: 'I need immediate crisis support',
        anxiety: 'I feel anxious and overwhelmed',
        sleep: 'I have trouble sleeping',
        talk: 'I want to talk to a professional'
      };
      inputEl.value = map[k] || 'Help me please';
      autoGrow(inputEl);
      sendCurrentMessage();
    });
  });

  if (sendBtn) sendBtn.addEventListener('click', sendCurrentMessage);
  if (inputEl) {
    inputEl.addEventListener('input', () => autoGrow(inputEl));
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendCurrentMessage();
      }
    });
    autoGrow(inputEl);
  }

  connectWS();
})();
