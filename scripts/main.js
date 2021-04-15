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

//gets called from the login screen only
//if the login request fails, it returns the login screen to its initial state
//if it succeeds, it fires all setIntervals and all the intial rendering required
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

//enables send message upon pressing Enter
loginInput.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter') login();
});

//function used only inside a setInterval to keep the user from being kicked out
function pokeServer(){
  axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/status', {name:username});
}

//sendMessage() will cause a page reload if the request fails, as required
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

//enables login upon pressing Enter
messageInput.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter') sendMessage();
});

//shows the sidebar with the active users and privacy settings
//fires when the people ionicon is clicked
function showRoom(){
  overlay.classList.remove('d-none');
  roomContainer.classList.remove('room-hidden');
}

//hides the sidebar with the active users and privacy settings
//fires when the dark overlay is clicked
function hideRoom(){
  roomContainer.classList.add('room-hidden');
  setTimeout(()=>{
    overlay.classList.add('d-none')
  }, 300);
}

//renders all active users onto the sidebar 
//if upon rendering, the previously selected recipient is still in the room
//the obj tied to the recipient will get a checkmark
//otherwise no obj gets a checkmark and the target global var remains the same
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

//select a unique option out of the options contained in a .head-node div
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
//setTarget also gets called by setTargetOnClick()
//clicking your own username does nothing
function setTarget(domElem){
  const whoThis = domElem.querySelector('.username').textContent;
  if (whoThis === username) return;
  selectUnique(domElem);
  target = domElem.querySelector('.username').textContent;
  updateSummary();
}

//setTargetOnClick fires when the user clicks a bold username on the messages body
//the room sidebar will get rendered after the API request succeeds
//if the clicked username is no longer in the room, nothing else happens
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

//updateSummary updates the text bellow the messages inputbox
//showing who the message will be sent to and under which privacy policy
function updateSummary(){
  const privacyText = privacy === 'message' ? 'Publico' : 'Reservadamente';
  messageSummary.textContent = `Enviando para ${target} (${privacyText})`;
};

//makes an API request for the active users and renders them on the room sidebar
function updateActiveUsers(){
  axios
  .get('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants')
  .then(({data})=>{
    renderActiveUsers(data);
  });
}

//helper function for the formatMessage() function.
//gets the correct background class for the message to be displayed
function getBackgroundClass(obj){
  if (obj.type === 'private_message') return 'bg-dm';
  if (obj.type === 'status') return 'bg-in-out';
  return 'bg-plain'
}

//helper function for the formatMessage() function.
//gets the correct HTML with the text that must be placed after the senders username
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

//helper function for the updateMessages() function.
//builds the HTML to be added to the chatbody in order to display the message
//but only if the message is meant to be displayed. otherwise returns prematurely.
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

//fetch the messages from the server and then render them on the chatbody
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
