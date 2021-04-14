const loginStatic = document.querySelector('.static');
const loginLoading = document.querySelector('.loading');
const loginScreen = document.querySelector('.login-screen');
const loginInput = loginStatic.querySelector('INPUT');
const overlay = document.querySelector('.overlay');
const roomContainer = document.querySelector('.room-container');
const messageSummary = document.querySelector('.message-summary');
const messageInput = document.querySelector('.new-message-container input');
let target = 'Todos';
let privacy = 'Publico';
let username;

function login(){
  loginStatic.classList.add('d-none');
  loginLoading.classList.remove('d-none');
  // do some request here
  loginScreen.classList.add('d-none');
}

loginInput.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter') login();
});

messageInput.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter'){
    console.log('enter has been pressed');
  }
});

function showRoom(){
  overlay.classList.remove('d-none');
  roomContainer.classList.remove('room-hidden');
}

function hideRoom(){
  overlay.classList.add('d-none');
  roomContainer.classList.add('room-hidden');
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
  messageSummary.textContent = `Enviando para ${target} (${privacy})`;
};

function setTarget(domElem){
  selectUnique(domElem);
  target = domElem.querySelector('.username').textContent;
  updateSummary();
}

function setPrivacy(domElem){
  selectUnique(domElem);
  privacy = domElem.querySelector('.privacy-value').textContent;
  updateSummary();
}

function updateActiveUsers(){
  
}

updateActiveUsers();
setInterval(updateActiveUsers, 10000); 