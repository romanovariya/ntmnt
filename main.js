'use strict';
document.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector('.form'),
    list = document.querySelector('.list'),
    search = document.querySelector('.search__input');

  let registeredData = new Map(JSON.parse(localStorage.getItem('registeredData')));

  const checkEmpty = form => {
    const inputs = form.querySelectorAll('input'),
          formBtn = form.querySelector('button'),
          warn = document.querySelector('.form__warn');

    let phone = false,
      name = false,
      surname = false;

    formBtn.disabled = false;    
          
    inputs.forEach(elem => {
      if (elem.value.trim() === '') {
        formBtn.disabled = true;
        elem.classList.add('_error');
      } else if (elem.classList.contains('_phone')) {
        if (elem.value.length < 12) {
          elem.classList.add('_error');

          if (!warn) {
            const wrapper = document.querySelector('.form__wrapper');
            wrapper.insertAdjacentHTML('beforeend', '<span class="form__warn">неверный формат</span>');
          }
          phone = false;
        } else {
          elem.classList.remove('_error');
          if(warn) {
            warn.remove();
          }
          phone = true;
        }
      } else if (elem.classList.contains('_name') || elem.classList.contains('_surname')) {
        if (elem.value.length < 2) {
          elem.classList.add('_error');
          name = surname = false;
        } else {
          elem.classList.remove('_error');
          name = surname = true;
        }
      }
    });

    if (name === true && surname === true && phone === true) {
      formBtn.disabled = false;
    } else {
      formBtn.disabled = true;
    }


  };

  const validateInput = target => {
    if (target.classList.contains('_phone')) {
			target.value = target.value.replace(/[^0-9+]/ig, '');
		}
  }

  const generateKey = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  const render = () => {
    list.textContent = '';
    const workersList = document.querySelector('.list');

    registeredData.forEach(elem => {
      const li = document.createElement('li');
      li.classList.add('list__item', 'employee');
      li.key = elem.key;

      li.innerHTML = `<div class="employee__wrapper">
          <div class="employee__name">
            <svg class="employee__icon worker">
              <use xlink:href="sprite.svg#worker"></use>
            </svg>
            <span class="employee__text employee__text--name">${elem.name} ${elem.surname}</span>
          </div>

          <div class="employee__hidden">
            <span class="employee__company">White Rabbit Смоленская</span>
            <span class="employee__code">423-000</span>
          </div>

          <div class="employee__contact">
            <span class="employee__text employee__text--phone">${elem.phone}</span>
            <svg class="employee__icon edit">
              <use xlink:href="sprite.svg#edit"></use>
            </svg>
          </div>
        </div>

        <div class="employee__wrapper">
          <div class="employee__notification">
            <svg class="employee__icon sms">
              <use xlink:href="sprite.svg#sms"></use>
            </svg>
            <div class="employee__paragraph">
              <span class="employee__text">Необходимо завершить регистрацию по SMS</span>
              <span class="employee__text employee__text--link">Повторить SMS с приглашением</span>
            </div>
          </div>

          <div class="delete">
            <svg class="employee__icon employee__trash trash">
              <use xlink:href="sprite.svg#trash"></use>
            </svg>
          </div>
        </div>`;
      workersList.append(li);

    });

    localStorage.setItem('registeredData', JSON.stringify([...registeredData]));

  };

  list.addEventListener('click', event => {
    const target = event.target;

    if (target.closest('.delete')) {

      const item = target.closest('.list__item'),
        itemList = document.querySelectorAll('.list__item');

      itemList.forEach(elem => {
        if (elem.key === item.key) {
          elem.classList.add('list__item--deleted');
          setTimeout(() => {
              elem.remove();
          }, 800);

          for(let key of registeredData.keys()){
            if(key === item.key) {
                registeredData.delete(key);
            }
          }
          localStorage.setItem('registeredData', JSON.stringify([...registeredData]));
        }
      });
    }

    if (target.closest('.employee__text--link')) {
      const item = target.closest('.list__item'),
        icon = item.querySelector('.sms'),
        paragraph = item.querySelector('.employee__paragraph'),
        text = paragraph.querySelector('.employee__text'),
        link = paragraph.querySelector('.employee__text--link');

      icon.classList.add('done');
      icon.innerHTML = `<use xlink:href="sprite.svg#done"></use>`;
      text.textContent = 'Номер изменен';
      link.textContent = 'Мы отправили SMS на новый номер телефона';
      link.classList.remove('employee__text--link');
      setTimeout(() => {
        icon.classList.remove('done');
        icon.innerHTML = `<use xlink:href="sprite.svg#sms"></use>`;
        text.textContent = 'Необходимо завершить регистрацию по SMS';
        link.textContent = 'Повторить SMS с приглашением';
        link.classList.add('employee__text--link')
      }, 5000);
    }
  });

  form.addEventListener('input', event => {
    const target = event.target;

    validateInput(target);
    checkEmpty(form);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    const name = form.querySelector('._name').value,
        surname = form.querySelector('._surname').value,
        phone = form.querySelector('._phone').value;

    const newWorker = {
        name: name,
        surname: surname,
        phone: phone,
        key: generateKey()
    };

    registeredData.set(newWorker.key, newWorker);
    render();
    form.reset();
  });


  render();

  

  search.addEventListener('keyup', (event) => {
    const target = event.target,
       value = target.value.toLowerCase(),
       listItems = document.querySelectorAll('.list__item');

    for (let item of listItems) {
      let itemValue = item.querySelector('.employee__text--name').innerHTML.toLowerCase() + item.querySelector('.employee__text--phone').innerHTML.toLowerCase();
      if (itemValue.indexOf(value) == -1) {
        item.classList.add('list__item--hidden');
      } else {
        item.classList.remove('list__item--hidden');
      }
    }
  });


function maskPhone(selector) {
    const elem = document.querySelector(selector);

    function mask(event) {
      const keyCode = event.keyCode;
      const template = '+7 (___) ___-__-__',
        def = '+7', //код страны
        val = this.value.replace(/\D/g, ""); //значение инпута, введенные цифры
      
      let i = 0,
      newValue = template.replace(/[_\d]/g, function (a) {
        return i < val.length ? val.charAt(i++) || def.charAt(i) : a;
      }); //в строке шаблона заменяет цифры и подчеркивания на возвращаемое значение функции (либо 7 цифра  кода, либо введенная цифры)
      i = newValue.indexOf("_"); //итератор переходит на следующий _
      if (i !== -1) {
        newValue = newValue.slice(0, i);
      } //если дальше уже нет _, то в переменной максимум возможных символов, получится строка с номером 7 (999)-444-44-44
      const reg = /^\+7 \(\d{1,3}\) \d{1,3}$/;
      if (!reg.test(this.value) || keyCode > 47 && keyCode < 58) { // с 47 по 58 это цифры
        this.value = newValue;
      }

    }

      elem.addEventListener("input", mask);
      elem.addEventListener("focus", mask);
      elem.addEventListener("blur", mask);
    
  }

  maskPhone('._phone');
});