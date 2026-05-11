/** Swap visible demo pane and collapse the Bootstrap offcanvas. */
export function setupDemoNavigation(): void {
  type BootstrapOffcanvasCtor = {
    getInstance: (el: HTMLElement) => { hide: () => void } | undefined;
  };

  type BootstrapNs = {
    Offcanvas: BootstrapOffcanvasCtor;
  };

  const panes = () => [...document.querySelectorAll<HTMLElement>('.demo-pane')];

  const buttons = () =>
    [...document.querySelectorAll<HTMLElement>('[data-demo-pane]')];

  const showPane = (id: string) => {
    for (const p of panes()) {
      p.classList.toggle('d-none', p.id !== id);
    }
    for (const b of buttons()) {
      const paneId = b.getAttribute('data-demo-pane');
      const active = paneId === id;
      b.classList.toggle('btn-primary', active);
      b.classList.toggle('btn-outline-secondary', !active);
      if (active) {
        b.setAttribute('aria-current', 'true');
      } else {
        b.removeAttribute('aria-current');
      }
    }
  };

  const closeOffcanvas = () => {
    const menu = document.getElementById('demoMenu');
    const bootstrapNs = (
      window as Window & {
        bootstrap?: BootstrapNs;
      }
    ).bootstrap;
    if (!menu || !bootstrapNs) return;
    bootstrapNs.Offcanvas.getInstance(menu)?.hide();
  };

  for (const btn of buttons()) {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-demo-pane');
      if (!id) return;
      showPane(id);
      closeOffcanvas();
    });
  }

  showPane(
    [...buttons()].find((b) => b.classList.contains('btn-primary'))?.getAttribute('data-demo-pane') ??
      'demo-coin',
  );
}
