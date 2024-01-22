let intervalId;

document.getElementById('startBtn').addEventListener('click', startRefresh);
document.getElementById('stopBtn').addEventListener('click', stopRefresh);
document.getElementById('resetBtn').addEventListener('click', resetInput);

document.getElementById('inputInterval').addEventListener('input', function () {
  document.getElementById('autocomplete-list').style.display = 'block';
  autocomplete(this.value);
});

document.getElementById('inputInterval').addEventListener('click', function () {
  document.getElementById('autocomplete-list').style.display = 'block';
  autocomplete(this.value);
});

function startRefresh() {
  let interval;

  const inputInterval = document.getElementById('inputInterval');
  const selectInterval = document.getElementById('selectInterval');

  if (inputInterval.value.trim() !== '') {
    interval = parseInt(inputInterval.value, 10) * 1000;
    saveValueToStorage(inputInterval.value);
  } else {
    interval = parseInt(selectInterval.value, 10) * 1000;
  }

  intervalId = setInterval(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTabId = tabs[0].id;
      chrome.tabs.reload(activeTabId);
    });
  }, interval);

  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn').disabled = false;
}

function stopRefresh() {
  clearInterval(intervalId);
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
}

function resetInput() {
  clearInterval(intervalId);
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
  document.getElementById('inputInterval').value = '';
}

function saveValueToStorage(value) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTabId = tabs[0].id;
    
    chrome.storage.local.get({ [activeTabId]: [] }, function (result) {
      const previousValues = result[activeTabId];

      const nonEmptyValues = previousValues.filter(item => item.trim() !== '');

      const lastThreeValues = nonEmptyValues.slice(-2);
      lastThreeValues.push(value);

      const storageObject = {};
      storageObject[activeTabId] = lastThreeValues;

      chrome.storage.local.set(storageObject);
    });
  });
}

function autocomplete(value) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTabId = tabs[0].id;

    chrome.storage.local.get({ [activeTabId]: [] }, function (result) {
      const previousValues = result[activeTabId];
      const autocompleteList = document.getElementById('autocomplete-list');

      autocompleteList.innerHTML = '';

      previousValues.forEach(function (item) {
        if (item.startsWith(value)) {
          const suggestion = document.createElement('div');
          suggestion.textContent = item;
          suggestion.addEventListener('click', function () {
            document.getElementById('inputInterval').value = item;
            autocompleteList.innerHTML = '';
          });
          autocompleteList.appendChild(suggestion);
        }
      });
    });
  });
}

document.addEventListener('click', function (e) {
  const autocompleteList = document.getElementById('autocomplete-list');
  if (e.target !== document.getElementById('inputInterval') && e.target !== autocompleteList) {
    autocompleteList.innerHTML = '';
    document.getElementById('autocomplete-list').style.display = 'none';
  }
});
