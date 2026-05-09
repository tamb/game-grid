import { GameGridDOMEvent, gridEventsEnum } from '@tamb/gamegrid';

export function attachListeners() {
  (Object.keys(gridEventsEnum) as (keyof typeof gridEventsEnum)[]).forEach((key) => {
    const event = gridEventsEnum[key];
    window.addEventListener(event, (ev: Event) => {
      const e = ev as GameGridDOMEvent;
      if (e.detail.gameGridInstance.options.id === 'grid1') {
        const el = document.querySelector('#move-events ul');
        const li = document.createElement('li');

        li.innerText = `${event} : ${new Date(e.timeStamp).toTimeString()}`;
        el!.insertAdjacentElement('afterbegin', li);
      }
    });
  });
}