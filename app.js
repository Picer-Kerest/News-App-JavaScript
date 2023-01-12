// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

// Init http module
const http = customHttp();

const newsService = (function () {
  const apiKey = 'b089212673954e829192dbe3ab7642eb';
  const apiUrl = 'https://newsapi.org/v2';

  return {
    topHeadlines(country='ru', cb) {
      // Всё
      http.get(`${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`, cb);
    },
    everything(query, cb) {
      // По параметрам
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  }
})();

// Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];

form.addEventListener('submit', e => {
  e.preventDefault();
  loadNews();
});

//  init selects
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
//  Auto Init позволяет вам инициализировать все компоненты Materialize с помощью одного вызова функции.
//  Важно отметить, что вы не можете передавать параметры, используя этот метод.
  loadNews();
});

// Функция для загрузки новостей
function loadNews() {
  showLoader()
  const country = countrySelect.value;
  const searchText = searchInput.value;

  if (!searchText) {
    newsService.topHeadlines(country, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

// Function from get response from server
function onGetResponse(err, res) {
  removePreloader();
  if (err) {
    showAlert(err, 'error-msg');
    return;
  }

  if (!res.articles.length) {
    showAlert('Ничего не найдено по вашему запросу', 'error-msg');
    return;
  }

  renderNews(res.articles);
}

// Render News
function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
//  В div'e .news-container для div'a .row
  let fragment = '';
  news.forEach(newItem => {
    const el = newsTemplate(newItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

function clearContainer(container) {
//  container.innerHTML = '';
//  Можно отчистить контейнер либо innerHTML = '', либо пройтись по каждому элементу и удалить его
//  Здесь способ второй
  let child = container.lastElementChild;
//  lastElementChild - последний дочерний элемент
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

// NewItem Template Function
function newsTemplate({ urlToImage, title, url, description }) {
  //  В этот раз разметка будет формироваться в виде HTML строки, а не в виде DOM элемента
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}

function showAlert(msg, type = 'success') {
  M.toast({html: msg, classes: type});
}

// show loader function
function showLoader() {
  document.body.insertAdjacentHTML(
      'afterbegin', `
      <div class="progress">
        <div class="indeterminate"></div>
      </div>
  `);
}

// Remover Loader
function removePreloader() {
  const loader = document.querySelector('.progress');
  if (loader) {
    loader.remove();
  }
}