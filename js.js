import materialComponentsWeb from "https://esm.sh/material-components-web";

let totalMessages = 0,
  messagesLimit = 0,
  nickColor = "messagecolor",
  removeSelector, addition, customNickColor, channelName,
  provider;
let animationIn = 'none';
let animationOut = 'none';
let hideAfter = 44;
let hideCommands = "no";
let displayBadges = "yes";
let showPronouns = "off";
let displayMode = "yes";
let ignoredUsers = [];
window.addEventListener('onEventReceived', function(obj) {
  if (obj.detail.event.listener === 'widget-button') {

    if (obj.detail.event.field === 'testMessage') {
      let emulated = new CustomEvent("onEventReceived", {
        detail: {
          listener: "message",
          event: {
            service: "twitch",
            data: {
              time: Date.now(),
              tags: {
                "badge-info": "",
                badges: "moderator/1,partner/1",
                color: "#5B99FF",
                "display-name": "StreamElements",
                emotes: "25:46-50",
                flags: "",
                id: "43285909-412c-4eee-b80d-89f72ba53142",
                mod: "1",
                "room-id": "85827806",
                subscriber: "0",
                "tmi-sent-ts": "1579444549265",
                turbo: "0",
                "user-id": "100135110",
                "user-type": "mod"
              },
              nick: channelName,
              userId: "100135110",
              displayName: "superfuckinglonguglynameee",
              displayColor: "#5B99FF",
              badges: [{
                type: "moderator",
                version: "1",
                url: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3",
                description: "Moderator"
              }, {
                type: "partner",
                version: "1",
                url: "https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3",
                description: "Verified"
              }],
              channel: channelName,
              text: "Howdy! My name is Bill and I am here to serve Kappa",
              isAction: !1,
              emotes: [{
                type: "twitch",
                name: "Kappa",
                id: "25",
                gif: !1,
                urls: {
                  1: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                  2: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                  4: "https://static-cdn.jtvnw.net/emoticons/v1/25/3.0"
                },
                start: 46,
                end: 50
              }],
              msgId: "43285909-412c-4eee-b80d-89f72ba53142"
            },
            renderedText: 'Howdy! My name is Bill and I am here to serve <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 1x, https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 2x, https://static-cdn.jtvnw.net/emoticons/v1/25/3.0 4x" title="Kappa" class="emote">'
          }
        }
      });
      window.dispatchEvent(emulated);
    }
    return;
  }
  if (obj.detail.listener === "delete-message") {
    const msgId = obj.detail.event.msgId;
    $(`.message-row[data-msgid=${msgId}]`).remove();
    return;
  } else if (obj.detail.listener === "delete-messages") {
    const sender = obj.detail.event.userId;
    $(`.message-row[data-sender=${sender}]`).remove();
    return;
  }

  if (obj.detail.listener !== "message") return;
	
  //if(message)
  let data = obj.detail.event.data; 
  if (data.text.startsWith("!") && hideCommands === "yes") return; //ignore message if hideCommands on
  if (ignoredUsers.indexOf(data.nick) !== -1) return; //ignore message if it's a user in the list of ignoredUsers
  let message = attachEmotes(data);
  let badges = "",
    badge;
  if (provider === 'mixer') {
    data.badges.push({
      url: data.avatar
    });
  }
  for (let i = 0; i < data.badges.length; i++) {
    badge = data.badges[i];
    badges += `<img alt="" src="${badge.url}" class="badge"> `;
  }
  let username = data.displayName;
  const color = customNickColor;
  username = `<span>${username}</span>`;
  let pn = null;

  const printAddress = async () => {
    pn = await x;
    return pn;
  }

  printAddress().then(res => addMessage(username, badges, message, data.isAction, data.userId, data.msgId, res));
});

window.addEventListener('onWidgetLoad', function(obj) {
  const fieldData = obj.detail.fieldData;
  animationIn = fieldData.animationIn;
  animationOut = fieldData.animationOut;
  hideAfter = fieldData.hideAfter;
  messagesLimit = fieldData.messagesLimit;
  customNickColor = fieldData.customNickColor;
  hideCommands = fieldData.hideCommands;
  displayBadges = fieldData.displayBadges;
  displayMoon = fieldData.displayMoon;
  channelName = obj.detail.channel.username;
  showPronouns = fieldData.showPronouns;
  displayMode = fieldData.displayMode;
  fetch('https://api.streamelements.com/kappa/v2/channels/' + obj.detail.channel.id + '/').then(response => response.json()).then((profile) => {
    provider = profile.provider;
  });
  if (fieldData.msgDisplay === "block") {
    addition = "prepend";
    removeSelector = ".message-row:nth-child(n+" + (messagesLimit + 1) + ")"
  } else {
    addition = "append";
    removeSelector = ".message-row:nth-last-child(n+" + (messagesLimit + 1) + ")"
  }

  ignoredUsers = fieldData.ignoredUsers.toLowerCase().replace(" ", "").split(",");
});


function attachEmotes(message) {
  let text = html_encode(message.text);
  let data = message.emotes;
  if (typeof message.attachment !== "undefined") {
    if (typeof message.attachment.media !== "undefined") {
      if (typeof message.attachment.media.image !== "undefined") {
        text = `${message.text}<img src="${message.attachment.media.image.src}">`;
      }
    }
  }
  return text
    .replace(
      /([^\s]*)/gi,
      function(m, key) {
        let result = data.filter(emote => {
          return html_encode(emote.name) === key
        });
        if (typeof result[0] !== "undefined") {
          let url = result[0]['urls'][1];
          if (provider === "twitch") {
            return `<img class="emote" " src="${url}"/>`;
          } else {
            if (typeof result[0].coords === "undefined") {
              result[0].coords = {
                x: 0,
                y: 0
              };
            }
            let x = parseInt(result[0].coords.x);
            let y = parseInt(result[0].coords.y);

            let width = "18px";
            let height = "auto";

            return `<div class="emote" style="width: ${width}; height:${height}; display: inline-block; background-image: url(${url}); background-position: -${x}px -${y}px;"></div>`;
          }
        } else return key;

      }
    );
}

function html_encode(e) {
  return e.replace(/[<>"^]/g, function(e) {
    return "&#" + e.charCodeAt(0) + ";";
  });
}

function addMessage(username, badges, message, isAction, uid, msgId, pn) {
  totalMessages += 1;
  let actionClass = "";
  if (isAction) {
    actionClass = "action";
  }
  let element = $.parseHTML(`
            <div data-sender="${uid}" data-msgid="${msgId}" class="message-row {animationIn} animated ${actionClass}" id="msg-${totalMessages}">
        		<div class="container">
                	<div class="box">
						<span class="user-container">
							<span class="user-box">
								${username}
							</span>
							${badges}
						</span>
					</div>
					<div class="user-message">
						${message}
					</div>
        		</div>
      		</div>`);
  

  
  if (addition === "append") {
    if (hideAfter !== 999) {
      $(element).appendTo('.main-container').delay(hideAfter * 1000).queue(function() {
        $(this).removeClass(animationIn).addClass(animationOut).delay(1000).queue(function() {
          $(this).remove()
        }).dequeue();
      });
    } else {
      $(element).appendTo('.main-container');
    }
  } else {
    if (hideAfter !== 999) {
      $(element).prependTo('.main-container').delay(hideAfter * 1000).queue(function() {
        $(this).removeClass(animationIn).addClass(animationOut).delay(1000).queue(function() {
          $(this).remove()
        }).dequeue();
      });
    } else {
      $(element).prependTo('.main-container');
    }
  }

  if (totalMessages > messagesLimit) {
    removeRow();
  }
}

function removeRow() {
  if (!$(removeSelector).length) {
    return;
  }
  if (animationOut !== "none" || !$(removeSelector).hasClass(animationOut)) {
    if (hideAfter !== 999) {
      $(removeSelector).dequeue();
    } else {
      $(removeSelector).addClass(animationOut).delay(1000).queue(function() {
        $(this).remove().dequeue()
      });

    }
    return;
  }

  $(removeSelector).animate({
    height: 0,
    opacity: 0
  }, 'slow', function() {
    $(removeSelector).remove();
  });
}
