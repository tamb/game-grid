import { gameGridEventsEnum } from './../../dist/main';

export function attachListeners() {
  Object.keys(gameGridEventsEnum).forEach((key) => {
    const event = gameGridEventsEnum[key];
    window.addEventListener(event, (e) => {
      const el = document.querySelector('#move-events ul');
      const li = document.createElement('li');

      li.innerText = `${event} : ${e.timeStamp}`;
      el.insertAdjacentElement('afterbegin', li);
    });
  });
}
