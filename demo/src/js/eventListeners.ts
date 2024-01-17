import { gameGridEventsEnum } from 'gamegrid';

export function attachListeners() {
  Object.keys(gameGridEventsEnum).forEach((key) => {
    const event = gameGridEventsEnum[key];
    window.addEventListener(event, (e) => {
      if (e.detail.gameGridInstance.options.id === 'grid1') {
        const el = document.querySelector('#move-events ul');
        const li = document.createElement('li');

        li.innerText = `${event} : ${new Date(e.timeStamp).toTimeString()}`;
        el!.insertAdjacentElement('afterbegin', li);
      }
    });
  });
}
