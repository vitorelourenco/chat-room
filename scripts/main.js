const loginStatic = document.querySelector('.static');
const loginLoading = document.querySelector('.loading');
const loginScreen = document.querySelector('.login-screen');
const loginInput = loginStatic.querySelector('INPUT');
const overlay = document.querySelector('.overlay');
const roomContainer = document.querySelector('.room-container');
const activeUsers = document.querySelector('.active-users');
const messageSummary = document.querySelector('.message-summary');
const messageInput = document.querySelector('.new-message-container input');
const chatBody = document.querySelector('.chat-body');
const dynamicUsers = document.querySelector('.dynamic-users')
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
    setInterval(pokeServer, 5000);
  })
  .catch(()=>{
    loginStatic.classList.remove('d-none');
    loginLoading.classList.add('d-none');
    setTimeout(()=>alert('Esse nome ja esta em uso, tente outro nome'), 200);
  });
}

loginInput.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter') login();
});

function pokeServer(){
  axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/status', {name:username});
}

function sendMessage(){
  currentMessage = messageInput.value;
  if (currentMessage === '') return;
  messageInput.value = '';
  axios
    .post('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages'
      , {from: username, to: target, text: currentMessage, type: privacy})
    .then(()=>{
      updateMessages();
    })
    .catch(()=>{
      window.location.reload();
    });
}

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

function renderActiveUsers(data){
  dynamicUsers.innerHTML = '';
  let placeholder;
  data.forEach((elem)=>{
    if (elem.name === target){
      placeholder = ' selected';
    } else {
      placeholder = '';
    }
    dynamicUsers.innerHTML +=
      `
      <div onclick='setTarget(this)' class="user${placeholder}">
        <ion-icon name="person-circle""></ion-icon>
        <span class="username">${elem.name}</span>
        <ion-icon name="checkmark-sharp"></ion-icon>
      </div>
      `
  });
}

function selectUnique(domElem){
  let head = domElem;
  while (!head.classList.contains('head-node')){
    head = head.parentNode;
  }
  const oldSelected = head.querySelector('.selected');
  if (oldSelected !== null){
    oldSelected.classList.remove('selected');
  }
  domElem.classList.add('selected');
}

//setTarget fires when the user clicks a username in the room sidebar
//setTarget gets called by setTargetOnClick 
function setTarget(domElem){
  const whoThis = domElem.querySelector('.username').textContent;
  if (whoThis === username) return;
  selectUnique(domElem);
  target = domElem.querySelector('.username').textContent;
  updateSummary();
}

//setPrivacy fires when the user clicks Reservadamente or Publico in the room sidebar
//setting the global variable privacy to either 'message' or 'private_message'
function setPrivacy(domElem){
  selectUnique(domElem);
  if (domElem.querySelector('.privacy-value').textContent === 'Publico'){
    privacy = 'message';
  } else {
    privacy = 'private_message';
  }
  updateSummary();
}

//setTargetOnClick fires when the user clicks a bold username on the messages body
//setting the global variable target to the username clicked
function setTargetOnClick(elem){
  const user = elem.textContent;
  if (user === username) return;
  axios
  .get('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants')
  .then(({data})=>{
    renderActiveUsers(data);
    const userList = document.querySelectorAll('.all,.user');
    for(let i=0; i<userList.length; i++){
      if (userList[i].querySelector('.username').textContent === user){
        setTarget(userList[i]);
      }
    }
  });
}

//updateSummary
function updateSummary(){
  const privacyText = privacy === 'message' ? 'Publico' : 'Reservadamente';
  messageSummary.textContent = `Enviando para ${target} (${privacyText})`;
};

function updateActiveUsers(){
  axios
  .get('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants')
  .then(({data})=>{
    renderActiveUsers(data);
  });
}

function getBackgroundClass(obj){
  if (obj.type === 'private_message') return 'bg-dm';
  if (obj.type === 'status') return 'bg-in-out';
  return 'bg-plain'
}

function getMessageComplement(obj){
  if (obj.text === 'entra na sala...') return 'entra na sala...';
  if (obj.text === 'sai da sala...') return 'sai da sala...';
  let placeholder = ' ';
  if (obj.type === 'private_message'){
    placeholder = 'reservadamente ';
  } 
  const complement = 
    `
    ${placeholder}para&nbsp;
    <span onclick='setTargetOnClick(this)' class="target">${obj.to}</span>:&nbsp;
    ${obj.text}
    `
  return complement;
}

function formatMessage(obj){
  if (obj.type === 'private_message' && obj.to !== username && obj.from !== username) return '';

  const formatedMessage = `
    <div class="message ${getBackgroundClass(obj)}">
      <span class="timestamp">(${obj.time})</span>&nbsp;
      <span onclick='setTargetOnClick(this)' class="sender">${obj.from}</span>&nbsp;
      ${getMessageComplement(obj)}
    </div>`

  return formatedMessage;
}

function updateMessages(){
  axios
    .get('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages')
    .then(({data})=>{
      chatBody.innerHTML = '';
      data.forEach(elem=>{chatBody.innerHTML += formatMessage(elem)});
      document.querySelector(".message:last-child").scrollIntoView();
    })
    .catch();
}