/* new implementation */
/* first shot */

var running = false;

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
    return false;
  }

  return true;
}

function getToday(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();
  dd < 10 ? dd = '0'+dd : dd;
  mm < 10 ? mm = '0'+mm : mm;
  today = dd + '/' + mm + '/' + yyyy; //Date format
  return today;
}


function sendAlert(){
  //We'll fix this
  var myAudio = new Audio();
  myAudio.src = chrome.extension.getURL("ding.m4a");
  myAudio.play();


}


function sendNotification(maximumValue, maximumType){
  Notification.requestPermission();
  new Notification('Avatar Alarm', {
    icon: chrome.extension.getURL('alert.png'),
    body: 'Your site is having heavy traffic increases the +'maximumType+' record has been broken. Check it now!'
  });
}
var historyData = {startDate: getToday(), content: []}


//https://stackoverflow.com/a/50493861/438110 MutationObserver usage
function createListener(){
  var targetNode = document.getElementById('galaxyIframe').contentWindow.document.getElementById('ID-overviewCounterValue');

  var config = { attributes: true, childList: true };

  var callback = function(mutationsList) {
    for(var mutation of mutationsList) {
      if (mutation.type == 'childList') {
        var currentValue = targetNode.innerText;
        console.log(currentValue);
        chrome.storage.local.get({'date': getToday(), content: []}, function(result) {
          if (!chrome.runtime.error) {
            console.log('Maximums retrieved', result.content);
            var dailyData = {'date': getToday(), 'maxDay': '0', 'maxEver':'0'};
            if (result.content !== null && result.content!== undefined && !isEmpty(result.content)){
              result.content[result.content.length-1].maxDay  < currentValue ? dailyData.maxDay = currentValue : dailyData.maxDay = result.content[result.content.length-1].maxDay;
              result.content[result.content.length-1].maxEver  < currentValue ? dailyData.maxEver = currentValue : dailyData.maxEver = result.content[result.content.length-1].maxEver;
              if (dailyData.date !== result.content[result.content.length -1].date){
                result.content.push(dailyData);
              }else{
                result.content[result.content.length-1] = dailyData;
              }
            }else{
              dailyData = {'date': getToday(), 'maxDay': currentValue, 'maxEver':currentValue};
              result.content.push(dailyData);
            }
            chrome.storage.local.set({date: getToday(), content: result.content}, function() {
              console.log('Settings saved', result.content);
            });
          }
        });
      }
    }
  };

  var observer = new MutationObserver(callback);

  observer.observe(targetNode, config);
  return true;
}


console.log("Google RT Alert UP & RUNNING");
setTimeout(function(){
  //TODO Manage notifications
  console.log(getToday());
  if (!running){
    running = createListener();
    console.log(running);
  }
}, 10000);
