const loginStatic = document.querySelector('.static');
const loginLoading = document.querySelector('.loading');
const loginScreen = document.querySelector('.login-screen');
const loginInput = loginStatic.querySelector('INPUT');
const overlay = document.querySelector('.overlay');
const roomContainer = document.querySelector('.room-container');
const messageSummary = document.querySelector('.message-summary');
const messageInput = document.querySelector('.new-message-container input');
const chatBody = document.querySelector('.chat-body');
let target = 'Todos';
let privacy = 'message';
let username;

function login(){
  loginStatic.classList.add('d-none');
  loginLoading.classList.remove('d-none');
  username = document.querySelector('.static INPUT').value;
  axios
    .post('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants', {name: username})
    .then(()=>{
      loginScreen.classList.add('d-none');
      updateActiveUsers();
      updateMessages();
      setInterval(updateActiveUsers, 10000); 
      setInterval(updateMessages, 3000);
    })
    .catch();
}

function resetMessageText(){
  messageInput.value = '';
}

function sendMessage(){
  currentMessage = messageInput.value;
  axios
    .post('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages'
      , {from: username, to: target, text: currentMessage, type: privacy})
    .then(()=>{
      resetMessageText();
    })
    .catch(()=>{
      alert('mensagem nao enviada');
    });
}

loginInput.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter') login();
});

messageInput.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter') sendMessage();
});

function showRoom(){
  overlay.classList.remove('d-none');
  roomContainer.classList.remove('room-hidden');
}

function hideRoom(){
  roomContainer.classList.add('room-hidden');
  setTimeout(()=>{
    overlay.classList.add('d-none')
  }, 300);
}

function selectUnique(domElem){
  domElem
    .parentNode
    .querySelector('.selected')
    .classList
    .remove('selected');
  domElem.classList.add('selected');
}

function updateSummary(){
  const privacyText = privacy === 'mensagem' ? 'Publico' : 'Reservadamente';
  messageSummary.textContent = `Enviando para ${target} (${privacyText})`;
};

function setTarget(domElem){
  selectUnique(domElem);
  target = domElem.querySelector('.username').textContent;
  updateSummary();
}

function setPrivacy(domElem){
  selectUnique(domElem);
  if (domElem.querySelector('.privacy-value').textContent === 'Publico'){
    privacy = 'message';
  } else {
    privacy = 'private_message';
  }
  updateSummary();
}

function updateActiveUsers(){
  
}

function formatMessage(obj){
  const formatedMessage = `
    <div class="message bg-dm">
      <span class="timestamp">(09:21:25)</span>&nbsp;
      <span class="sender">Joao</span>&nbsp;
      reservadamente para&nbsp;
      <span class="target">Maria</span>:&nbsp;
      Oi gatinha quer tc?
    </div>`
  return formatedMessage;
}

function updateMessages(){
  axios
    .get('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages')
    .then(({data})=>{
      chatBody.innerHTML = '';
      data.forEach(elem=>{chatBody.innerHTML += formatMessage(elem)});
    })
    .catch();
}
