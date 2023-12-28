import { gameGridEventsEnum } from '../../dist/main';

export function attachListeners() {
  Object.keys(gameGridEventsEnum).forEach((key: string) => {
    const event: string = gameGridEventsEnum[key];
    window.addEventListener(event, (e: Event) => {
      console.log('event', event, e);
      const eventSplit = event.split(':');
      const el =
        eventSplit[1] === 'move'
          ? document.querySelector('#move-events ol')
          : document.querySelector('#state-events ol');
      const li = document.createElement('li');

      li.innerText = `${event} : ${e.timeStamp}`;
      if (el) {
        el.appendChild(li);
        return;
      }
      alert('Cannot find element to append to');
    });
  });
}
